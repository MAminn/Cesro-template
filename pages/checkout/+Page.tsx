"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  useCart,
  type CartItem as ContextCartItem,
  type PromoCodeInfo,
} from "#root/lib/context/CartContext";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import { trpc } from "#root/shared/trpc/client";
import type {
  CheckoutPageModernTemplateProps,
  CheckoutCustomerInfo,
  CheckoutAddress,
  CheckoutOrderSummaryItem,
  CheckoutTotals,
} from "#root/components/template-system";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { navigate } from "vike/client/router";
import { useTracking } from "#root/frontend/contexts/TrackingContext";
import { TrackingEventName } from "#root/shared/types/pixel-tracking";

/** Parse a Zod validation error (JSON array) into a friendly message */
function parseOrderError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Try to parse Zod-style array of issues
    try {
      const issues = JSON.parse(msg);
      if (Array.isArray(issues)) {
        const fieldLabels: Record<string, string> = {
          customerName: "Full Name",
          customerEmail: "Email",
          customerPhone: "Phone Number",
          shippingAddress: "Shipping Address",
          shippingCity: "City",
          shippingState: "State",
          shippingPostalCode: "Postal Code",
          shippingCountry: "Country",
        };
        return issues
          .map((issue: { path?: string[]; message?: string }) => {
            const field = issue.path?.[0];
            const label = field
              ? (fieldLabels[field] ?? field)
              : "Unknown field";
            return `${label}: ${issue.message ?? "Invalid value"}`;
          })
          .join("\n");
      }
    } catch {
      // Not JSON — use raw message
    }
    return msg;
  }
  return "Failed to submit order. Please try again.";
}

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    total,
    promoCode,
    clearCart,
  } = useCart();
  const { getTemplateId } = useTemplate();
  const { trackEvent } = useTracking();
  const hasTrackedCheckoutStart = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  // ─── Payment methods ──────────────────────────────────────────────────────
  // Wholesale flow: online payment is disabled. Orders are COD / manual only.
  const [paymentMethods] = useState<
    Array<{ id: string; label: string; description: string }>
  >([
    {
      id: "cod",
      label: "Cash on Delivery / Manual",
      description: "Wholesale order — settled manually after admin approval",
    },
  ]);
  const [paymentMethodsLoading] = useState(false);

  // ─── Fire checkout_started once per cart state per session ────────────────
  // Uses sessionStorage with a cart fingerprint to avoid re-firing on refresh
  // while still firing if the user returns with a meaningfully different cart.
  useEffect(() => {
    if (hasTrackedCheckoutStart.current || items.length === 0) return;

    // Build a simple fingerprint: sorted item IDs + quantities
    const fingerprint = items
      .map((item) => `${item.id}:${item.quantity}`)
      .sort()
      .join(",");
    const storageKey = "tracked_checkout_started";

    try {
      if (sessionStorage.getItem(storageKey) === fingerprint) return;
    } catch {
      /* SSR or private browsing — fall through to ref guard */
    }

    hasTrackedCheckoutStart.current = true;

    try {
      sessionStorage.setItem(storageKey, fingerprint);
    } catch {
      /* best-effort */
    }

    trackEvent(TrackingEventName.CHECKOUT_STARTED, {
      ecommerce: {
        currency: STORE_CURRENCY,
        value: total,
        items: items.map((item) => ({
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.categoryName ?? undefined,
        })),
        coupon: promoCode?.code ?? undefined,
      },
    });
  }, [items, total, promoCode, trackEvent]);

  // Convert cart items to checkout order summary items
  const orderItems: CheckoutOrderSummaryItem[] = useMemo(() => {
    return items.map((item: ContextCartItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      variant: item.selectedOptions
        ? Object.entries(item.selectedOptions)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ") || undefined
        : undefined,
    }));
  }, [items]);

  // Build totals object
  const totals: CheckoutTotals = useMemo(() => {
    return {
      subtotal,
      discount: discount > 0 ? discount : undefined,
      shipping: shipping > 0 ? shipping : undefined,
      grandTotal: total,
    };
  }, [subtotal, discount, shipping, total]);

  // Handle form submit
  const handleSubmit = async (
    formValues: Record<string, string>,
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    // Wholesale flow: orders are always created as COD / manual payment.
    // Online payment gateways are intentionally disabled here.
    const selectedPaymentMethod = "cod";

    try {
      // Validate cart has items
      if (items.length === 0) {
        throw new Error(
          "Your cart is empty. Please add items before placing an order.",
        );
      }

      // Prepare order items
      const orderItemsPayload = items.map((item) => {
        const variantStr = item.selectedOptions
          ? Object.entries(item.selectedOptions)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
          : "";
        return {
          productId: item.id,
          quantity: item.quantity,
          selectedOptions: variantStr || undefined,
        };
      });

      // Submit order via tRPC (always COD for wholesale intake)
      const result = await trpc.order.create.mutate({
        customerName: formValues.fullName || "",
        customerEmail: formValues.email || "",
        customerPhone: formValues.phoneNumber || "",
        shippingAddress: formValues.address || "",
        shippingCity: formValues.city || "",
        shippingState: formValues.state || null,
        shippingPostalCode: formValues.postalCode || null,
        shippingCountry: formValues.country || "Egypt",
        items: orderItemsPayload,
        notes: formValues.notes || undefined,
        promoCodeId: promoCode?.id,
        paymentMethod: selectedPaymentMethod,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const orderId = result.result?.id ?? "";
      const orderTotal = result.result?.total ?? "";
      const email = encodeURIComponent(formValues.email || "");

      // Persist cart items for the Purchase tracking event on confirmation page
      try {
        sessionStorage.setItem(
          `checkout_items:${orderId}`,
          JSON.stringify(
            items.map((item) => ({
              itemId: item.id,
              itemName: item.name,
              price: item.price,
              quantity: item.quantity,
              category: item.categoryName ?? undefined,
            })),
          ),
        );
      } catch {
        /* best-effort — tracking still works with value/transactionId */
      }

      // ─── Wholesale flow: order created as "Pending Approval" ──────────
      // No payment gateway redirect — go straight to confirmation.
      clearCart();
      navigate(
        `/order-confirmation?id=${orderId}&total=${orderTotal}&email=${email}&wholesale=1`,
      );
    } catch (error) {
      console.error("[Checkout] Order submission failed:", error);
      setErrorMessage(parseOrderError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit cart
  const handleEditCart = (): void => {
    navigate("/cart");
  };

  // Get template component
  const templateId = getTemplateId("checkoutPage");
  const Template = getTemplateComponent(
    "checkoutPage",
    templateId || "checkout-modern",
  );

  if (!Template) {
    return <div>Template not found: {templateId}</div>;
  }

  const templateProps: CheckoutPageModernTemplateProps = {
    items: orderItems,
    totals,
    isSubmitting,
    errorMessage,
    onSubmit: handleSubmit,
    onEditCart: handleEditCart,
    currency: STORE_CURRENCY,
    paymentMethods,
    paymentMethodsLoading,
  };

  return <Template.component {...templateProps} />;
}
