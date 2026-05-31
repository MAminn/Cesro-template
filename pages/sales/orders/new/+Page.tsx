"use client";

import { useState } from "react";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { navigate } from "vike/client/router";
import { Link } from "#root/components/utils/Link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Textarea } from "#root/components/ui/textarea";

function parseOrderError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    try {
      const issues = JSON.parse(msg);
      if (Array.isArray(issues)) {
        return issues
          .map(
            (issue: { path?: string[]; message?: string }) =>
              `${issue.path?.[0] ?? "Field"}: ${issue.message ?? "Invalid"}`,
          )
          .join("\n");
      }
    } catch {
      /* not JSON */
    }
    return msg;
  }
  return "Failed to submit order. Please try again.";
}

export default function NewWholesaleOrderPage() {
  const { items, subtotal, total, updateQuantity, removeItem, clearCart } =
    useCart();

  const [form, setForm] = useState({
    shopName: "",
    shopPhone: "",
    shopAddress: "",
    shopCity: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Add products to the cart before creating an order.");
      return;
    }
    if (
      !form.shopName ||
      !form.shopPhone ||
      !form.shopAddress ||
      !form.shopCity
    ) {
      setErrorMessage("Please fill in the shop name, phone, address and city.");
      return;
    }

    setIsSubmitting(true);
    try {
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

      const result = await trpc.order.create.mutate({
        customerName: form.shopName,
        customerEmail: "",
        customerPhone: form.shopPhone,
        shippingAddress: form.shopAddress,
        shippingCity: form.shopCity,
        shippingState: null,
        shippingPostalCode: null,
        shippingCountry: "Egypt",
        items: orderItemsPayload,
        notes: form.notes || undefined,
        // Wholesale intake is always COD / manual.
        paymentMethod: "cod",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const orderId = result.result?.id ?? "";
      const orderTotal = result.result?.total ?? "";
      clearCart();
      navigate(
        `/order-confirmation?id=${orderId}&total=${orderTotal}&wholesale=1`,
      );
    } catch (error) {
      setErrorMessage(parseOrderError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-5xl p-4 md:p-6'>
      <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Create Wholesale Order</h1>
          <p className='text-muted-foreground text-sm'>
            Add products to the cart, then enter the client&apos;s details to
            submit the order for approval.
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/shop'>
            <Button variant='outline'>Browse Products</Button>
          </Link>
          <Link href='/sales/orders'>
            <Button variant='outline'>My Orders</Button>
          </Link>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1.4fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {items.length === 0
                ? "No items yet — add products from the shop."
                : `${items.length} product${items.length === 1 ? "" : "s"} in this order.`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {items.length === 0 ? (
              <Link href='/shop'>
                <Button>Go to Shop</Button>
              </Link>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                  className='flex items-center justify-between gap-4 border-b pb-3 last:border-b-0'>
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>{item.name}</p>
                    <p className='text-muted-foreground text-sm'>
                      {STORE_CURRENCY} {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='number'
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.id,
                          Math.max(1, Number(e.target.value) || 1),
                          item.selectedOptions,
                        )
                      }
                      className='w-20'
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeItem(item.id, item.selectedOptions)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
            <CardDescription>
              Payment is Cash on Delivery / manual.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='shopName'>Shop / Client Name</Label>
              <Input
                id='shopName'
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='shopPhone'>Shop Phone</Label>
              <Input
                id='shopPhone'
                value={form.shopPhone}
                onChange={(e) =>
                  setForm({ ...form, shopPhone: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='shopAddress'>Shop Address</Label>
              <Input
                id='shopAddress'
                value={form.shopAddress}
                onChange={(e) =>
                  setForm({ ...form, shopAddress: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='shopCity'>City</Label>
              <Input
                id='shopCity'
                value={form.shopCity}
                onChange={(e) => setForm({ ...form, shopCity: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Sales Notes</Label>
              <Textarea
                id='notes'
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className='space-y-1 border-t pt-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>
                  {STORE_CURRENCY} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between font-semibold'>
                <span>Total</span>
                <span>
                  {STORE_CURRENCY} {total.toFixed(2)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className='text-destructive whitespace-pre-line text-sm'>
                {errorMessage}
              </p>
            )}

            <Button
              className='w-full'
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? "Submitting…" : "Submit Order for Approval"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
