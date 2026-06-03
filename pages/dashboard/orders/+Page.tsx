import {
  ChevronDown,
  Eye,
  Filter,
  Loader2,
  Package,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#root/components/ui/alert-dialog";
import { Badge } from "#root/components/ui/badge";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#root/components/ui/dialog";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Textarea } from "#root/components/ui/textarea";
import { useToast } from "#root/components/ui/use-toast";
import { trpc } from "#root/shared/trpc/client";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  name: string;
  discountPrice?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: string;
  shipping: string;
  discount: string | null;
  promoCodeId: string | null;
  total: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  daftraSyncStatus?: string | null;
  daftraInvoiceId?: string | null;
  daftraOrderId?: string | null;
  daftraCustomerId?: string | null;
  daftraLastSyncError?: string | null;
  daftraSyncedAt?: Date | null;
  items: OrderItem[];
}

interface EditItemDraft {
  productId: string;
  name: string;
  quantity: number;
  price: string;
  discountPrice: string | null;
}

interface EditFormState {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  notes: string;
  shipping: string;
  discount: string;
  items: EditItemDraft[];
}

export default function Orders() {
  const { clientSession } = usePageContext();
  const isAdmin = clientSession?.role === "admin";
  const isStaff =
    clientSession?.role === "admin" || clientSession?.role === "accountant";
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Tracks the order id currently being synced to Daftra (null = none).
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  // ─── Edit order (admin) ──────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: {
        status?:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
      } = {};

      if (statusFilter !== "all") {
        params.status = statusFilter as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
      }

      const result = await trpc.order.view.query(params);

      if (result.success) {
        setOrders(
          result.result
            ? Array.isArray(result.result)
              ? result.result.map((order) => {
                  // Cast the API response to a partial Order type and add missing fields
                  const partialOrder = order as Partial<Order>;
                  return {
                    ...order,
                    discount: partialOrder.discount || null,
                    promoCodeId: partialOrder.promoCodeId || null,
                  } as Order;
                })
              : []
            : [],
        );
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);
    try {
      const result = await trpc.order.updateStatus.mutate({
        orderId,
        status: status as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled",
      });

      if (result.success) {
        toast({ title: "Order Status Updated" });
        fetchOrders();

        if (isDetailsOpen) {
          setIsDetailsOpen(false);
        }
      } else {
        setError(result.error || "Failed to update order status");
        toast({
          title: "Update Failed",
          description: result.error || "Could not update order status.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred while updating order status");
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manually sync a single accepted (processing) order to Daftra. The backend
  // enforces all safety guards (accepted-only, no-duplicate, non-empty); this
  // handler only gates the UI and surfaces the result.
  const handleSyncToDaftra = async (orderId: string, isRetry: boolean) => {
    const confirmed = window.confirm(
      isRetry
        ? "Retry syncing this order to Daftra?"
        : "Sync this order to Daftra? This will create a customer and a sales invoice in Daftra.",
    );
    if (!confirmed) return;

    setSyncingOrderId(orderId);
    try {
      const result = await trpc.daftra.syncOrder.mutate({ orderId });

      if (result.status === "synced") {
        toast({
          title: "Synced to Daftra",
          description: result.daftraInvoiceId
            ? `Daftra invoice ${result.daftraInvoiceId} created.`
            : "Order synced successfully.",
        });
      } else {
        toast({
          title: "Daftra Sync Failed",
          description: result.error || "Could not sync order to Daftra.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during Daftra sync.",
        variant: "destructive",
      });
      console.error("Daftra sync error:", err);
    } finally {
      setSyncingOrderId(null);
      // Refresh so the latest sync status / Daftra IDs are reflected.
      fetchOrders();
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDeleteId) return;

    setIsUpdating(true);
    try {
      const result = await trpc.order.delete.mutate({
        orderId: orderToDeleteId,
      });
      if (result.success) {
        toast({
          title: "Order Deleted",
          description: `Order ${orderToDeleteId.substring(0, 8)}... was deleted.`,
        });
        fetchOrders();
        setOrderToDeleteId(null);
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Could not delete order.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
      console.error("Delete order error:", err);
    } finally {
      setIsUpdating(false);
      setOrderToDeleteId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query) ||
        order.items?.some((item) => item.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Wholesale-friendly status labels.
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Approval";
      case "processing":
        return "Accepted";
      case "cancelled":
        return "Cancelled";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Daftra ERP sync status badge styling.
  const getDaftraSyncColor = (status?: string | null) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getDaftraSyncLabel = (status?: string | null) => {
    switch (status) {
      case "synced":
        return "Synced";
      case "failed":
        return "Failed";
      default:
        return "Not synced";
    }
  };

  const openEditOrder = (order: Order) => {
    setEditForm({
      orderId: order.id,
      customerName: order.customerName ?? "",
      customerPhone: order.customerPhone ?? "",
      customerEmail: order.customerEmail ?? "",
      shippingAddress: order.shippingAddress ?? "",
      shippingCity: order.shippingCity ?? "",
      shippingState: order.shippingState ?? "",
      notes: order.notes ?? "",
      shipping: order.shipping ?? "0",
      discount: order.discount ?? "",
      items: (order.items ?? []).map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice ?? null,
      })),
    });
    setIsEditOpen(true);
  };

  const updateEditItem = (
    index: number,
    field: keyof EditItemDraft,
    value: string,
  ) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      const target = items[index];
      if (!target) return prev;
      if (field === "quantity") {
        items[index] = { ...target, quantity: Math.max(1, Number(value) || 1) };
      } else if (field === "price") {
        items[index] = { ...target, price: value };
      } else if (field === "discountPrice") {
        items[index] = {
          ...target,
          discountPrice: value === "" ? null : value,
        };
      }
      return { ...prev, items };
    });
  };

  const removeEditItem = (index: number) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  // Live total preview for the edit dialog (server still recalculates).
  const editSubtotal = editForm
    ? editForm.items.reduce((acc, item) => {
        const unit =
          item.discountPrice != null && item.discountPrice !== ""
            ? Number.parseFloat(item.discountPrice)
            : Number.parseFloat(item.price);
        return acc + (Number.isFinite(unit) ? unit : 0) * item.quantity;
      }, 0)
    : 0;
  const editDiscountNum = editForm?.discount
    ? Number.parseFloat(editForm.discount) || 0
    : 0;
  const editShippingNum = editForm?.shipping
    ? Number.parseFloat(editForm.shipping) || 0
    : 0;
  const editTotal =
    Math.max(0, editSubtotal - editDiscountNum) + editShippingNum;

  const handleSaveEdit = async () => {
    if (!editForm) return;
    if (editForm.items.length === 0) {
      toast({
        title: "Cannot save",
        description: "An order must have at least one item.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const result = await trpc.order.updateOrder.mutate({
        orderId: editForm.orderId,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        customerEmail: editForm.customerEmail || "",
        shippingAddress: editForm.shippingAddress,
        shippingCity: editForm.shippingCity,
        shippingState: editForm.shippingState,
        notes: editForm.notes,
        shipping: Number.parseFloat(editForm.shipping) || 0,
        discount: editForm.discount
          ? Number.parseFloat(editForm.discount) || 0
          : 0,
        items: editForm.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number.parseFloat(item.price) || 0,
          discountPrice:
            item.discountPrice != null && item.discountPrice !== ""
              ? Number.parseFloat(item.discountPrice)
              : null,
          name: item.name,
        })),
      });

      if (result.success) {
        toast({ title: "Order Updated" });
        setIsEditOpen(false);
        setIsDetailsOpen(false);
        fetchOrders();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update the order.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
      console.error("Edit order error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <AlertDialog>
      <div className='p-6 space-y-6 w-full h-full'>
        <div className='flex justify-center lg:justify-between items-center flex-wrap gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-center lg:text-left'>
              Wholesale Sales Orders
            </h1>
            <p className='text-muted-foreground text-center lg:text-left'>
              Review and approve sales orders created for shops / clients
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex flex-col gap-4 md:flex-row justify-between'>
              <div className='flex items-center gap-2 w-full md:w-1/3'>
                <Search className='h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by shop, client, phone, order...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-9'
                />
              </div>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4 text-muted-foreground' />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='h-9 w-[180px]'>
                      <SelectValue placeholder='Filter by status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value='pending'>Pending Approval</SelectItem>
                      <SelectItem value='processing'>Accepted</SelectItem>
                      <SelectItem value='shipped'>Shipped</SelectItem>
                      <SelectItem value='delivered'>Delivered</SelectItem>
                      <SelectItem value='cancelled'>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='text-center py-10'>
                <Loader2 className='mx-auto h-12 w-12 text-muted-foreground animate-spin' />
                <h3 className='mt-4 text-lg font-semibold'>
                  Loading orders...
                </h3>
              </div>
            ) : error ? (
              <div className='text-center py-10 text-red-500'>
                <p>{error}</p>
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={fetchOrders}>
                  Try Again
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className='text-center py-10'>
                <Package className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-semibold'>No orders found</h3>
                <p className='mt-2 text-muted-foreground'>
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "When you receive orders, they'll appear here"}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Shop / Client</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Daftra</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className='font-medium'>
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell>
                          {Number.parseFloat(order.total).toFixed(2)} EGP
                          {order.discount &&
                            Number.parseFloat(order.discount) > 0 && (
                              <div className='text-xs text-green-600'>
                                <span>
                                  -
                                  {Number.parseFloat(order.discount).toFixed(2)}{" "}
                                  EGP discount
                                </span>
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col items-start gap-1'>
                            <Badge
                              variant='outline'
                              className={getDaftraSyncColor(
                                order.daftraSyncStatus,
                              )}>
                              {getDaftraSyncLabel(order.daftraSyncStatus)}
                            </Badge>
                            {order.daftraInvoiceId && (
                              <span className='text-xs text-muted-foreground'>
                                Invoice #{order.daftraInvoiceId}
                              </span>
                            )}
                            {order.daftraSyncStatus === "failed" &&
                              order.daftraLastSyncError && (
                                <details className='group max-w-60'>
                                  <summary className='cursor-pointer list-none text-xs text-red-600'>
                                    <span className='underline decoration-dotted underline-offset-2'>
                                      Daftra error (click to expand)
                                    </span>
                                  </summary>
                                  <pre className='mt-1 max-h-60 max-w-60 overflow-auto whitespace-pre-wrap wrap-break-word rounded border border-red-200 bg-red-50 p-2 text-[11px] leading-snug text-red-700'>
                                    {order.daftraLastSyncError}
                                  </pre>
                                </details>
                              )}
                            {isStaff &&
                              order.status === "processing" &&
                              (() => {
                                const alreadySynced =
                                  order.daftraSyncStatus === "synced" ||
                                  Boolean(order.daftraInvoiceId);
                                const isFailed =
                                  order.daftraSyncStatus === "failed";
                                const isSyncing = syncingOrderId === order.id;

                                if (alreadySynced) {
                                  return (
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      disabled
                                      className='h-7 text-xs'>
                                      Already Synced
                                    </Button>
                                  );
                                }

                                return (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-7 text-xs'
                                    disabled={isSyncing}
                                    onClick={() =>
                                      handleSyncToDaftra(order.id, isFailed)
                                    }>
                                    {isSyncing && (
                                      <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                    )}
                                    {isFailed ? "Retry Sync" : "Sync to Daftra"}
                                  </Button>
                                );
                              })()}
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center gap-2 justify-end'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewDetails(order)}>
                              <Eye className='h-4 w-4' />
                              <span className='sr-only'>View Details</span>
                            </Button>
                            {isAdmin && (
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() => setOrderToDeleteId(order.id)}
                                  disabled={isUpdating}>
                                  <Trash2 className='h-4 w-4' />
                                  <span className='sr-only'>Delete Order</span>
                                </Button>
                              </AlertDialogTrigger>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className='border-t px-6 py-4'>
            <div className='flex items-center justify-between w-full text-xs text-muted-foreground'>
              <div>
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </CardFooter>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>
                    Order ID: {selectedOrder.id}
                  </DialogDescription>
                </DialogHeader>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'>
                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Shop / Client Information
                    </h3>
                    <div className='space-y-1 text-sm'>
                      <p>
                        <span className='font-medium'>Shop / Client:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className='font-medium'>Email:</span>{" "}
                        {selectedOrder.customerEmail || "N/A"}
                      </p>
                      <p>
                        <span className='font-medium'>Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Shipping Address
                    </h3>
                    <div className='space-y-1 text-sm'>
                      <p>{selectedOrder.shippingAddress}</p>
                      <p>
                        {selectedOrder.shippingCity}
                        {selectedOrder.shippingState
                          ? `, ${selectedOrder.shippingState}`
                          : ""}
                        {selectedOrder.shippingPostalCode
                          ? ` ${selectedOrder.shippingPostalCode}`
                          : ""}
                      </p>
                      <p>{selectedOrder.shippingCountry || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className='my-4'>
                  <h3 className='font-medium text-sm mb-2'>Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.discountPrice ? (
                              <>
                                <span className='line-through text-gray-500'>
                                  {Number.parseFloat(item.price).toFixed(2)} EGP
                                </span>
                                <span className='text-red-600 block'>
                                  {Number.parseFloat(
                                    item.discountPrice,
                                  ).toFixed(2)}{" "}
                                  EGP
                                </span>
                              </>
                            ) : (
                              <>
                                {Number.parseFloat(item.price).toFixed(2)} EGP
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {(
                              Number.parseFloat(
                                item.discountPrice || item.price,
                              ) * item.quantity
                            ).toFixed(2)}{" "}
                            EGP
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell
                            colSpan={isAdmin ? 5 : 4}
                            className='text-center text-muted-foreground'>
                            No items found for this order.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className='flex justify-between items-start my-4'>
                  <div>
                    <h3 className='font-medium text-sm mb-2'>Order Status</h3>
                    <div className='flex flex-col gap-3'>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusLabel(selectedOrder.status)}
                      </Badge>

                      {isAdmin && (
                        <div className='flex flex-wrap items-center gap-2'>
                          <Button
                            size='sm'
                            className='bg-green-600 hover:bg-green-700 text-white'
                            disabled={
                              isUpdating ||
                              selectedOrder.status === "processing"
                            }
                            onClick={() =>
                              updateOrderStatus(selectedOrder.id, "processing")
                            }>
                            Accept Order
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={
                              isUpdating || selectedOrder.status === "pending"
                            }
                            onClick={() =>
                              updateOrderStatus(selectedOrder.id, "pending")
                            }>
                            Keep Pending
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            disabled={
                              isUpdating || selectedOrder.status === "cancelled"
                            }
                            onClick={() =>
                              updateOrderStatus(selectedOrder.id, "cancelled")
                            }>
                            Cancel Order
                          </Button>
                        </div>
                      )}

                      {isAdmin && (
                        <Select
                          disabled={isUpdating}
                          onValueChange={(value) =>
                            updateOrderStatus(selectedOrder.id, value)
                          }>
                          <SelectTrigger className='h-8 w-[200px]'>
                            <SelectValue placeholder='More status options' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>
                              Pending Approval
                            </SelectItem>
                            <SelectItem value='processing'>Accepted</SelectItem>
                            <SelectItem value='shipped'>Shipped</SelectItem>
                            <SelectItem value='delivered'>Delivered</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className='text-right'>
                    <h3 className='font-medium text-sm mb-2'>Order Summary</h3>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='font-medium'>Subtotal:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.subtotal).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      {selectedOrder.discount &&
                        Number.parseFloat(selectedOrder.discount) > 0 && (
                          <div className='flex justify-between'>
                            <span className='font-medium text-green-600'>
                              Discount:
                            </span>
                            <span className='text-green-600'>
                              -
                              {Number.parseFloat(
                                selectedOrder.discount,
                              ).toFixed(2)}{" "}
                              EGP
                            </span>
                          </div>
                        )}

                      <div className='flex justify-between'>
                        <span className='font-medium'>Shipping:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.shipping).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      <div className='flex justify-between font-bold'>
                        <span>Total:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.total).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className='my-4 border-t pt-4'>
                    <h3 className='font-medium text-sm mb-2'>Order Notes</h3>
                    <p className='text-sm text-muted-foreground'>
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <DialogFooter>
                  {isAdmin && (
                    <Button
                      variant='secondary'
                      onClick={() => openEditOrder(selectedOrder)}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Edit Order
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            {editForm && (
              <>
                <DialogHeader>
                  <DialogTitle>Edit Wholesale Order</DialogTitle>
                  <DialogDescription>
                    Order ID: {editForm.orderId}
                  </DialogDescription>
                </DialogHeader>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'>
                  <div className='space-y-1'>
                    <Label>Shop / Client Name</Label>
                    <Input
                      value={editForm.customerName}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, customerName: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>Shop Phone</Label>
                    <Input
                      value={editForm.customerPhone}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, customerPhone: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>Email (optional)</Label>
                    <Input
                      value={editForm.customerEmail}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, customerEmail: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>City</Label>
                    <Input
                      value={editForm.shippingCity}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, shippingCity: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1 md:col-span-2'>
                    <Label>Shop Address</Label>
                    <Input
                      value={editForm.shippingAddress}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, shippingAddress: e.target.value }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1 md:col-span-2'>
                    <Label>Sales Notes</Label>
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, notes: e.target.value } : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className='my-4'>
                  <h3 className='font-medium text-sm mb-2'>Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className='w-[110px]'>Quantity</TableHead>
                        <TableHead className='w-[120px]'>Price</TableHead>
                        <TableHead className='w-[130px]'>
                          Discount Price
                        </TableHead>
                        <TableHead className='w-[60px]' />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editForm.items.map((item, index) => (
                        <TableRow key={`${item.productId}-${index}`}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateEditItem(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              step='0.01'
                              value={item.price}
                              onChange={(e) =>
                                updateEditItem(index, "price", e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              step='0.01'
                              placeholder='—'
                              value={item.discountPrice ?? ""}
                              onChange={(e) =>
                                updateEditItem(
                                  index,
                                  "discountPrice",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => removeEditItem(index)}
                              disabled={editForm.items.length <= 1}>
                              <X className='h-4 w-4' />
                              <span className='sr-only'>Remove item</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'>
                  <div className='space-y-1'>
                    <Label>Shipping</Label>
                    <Input
                      type='number'
                      min={0}
                      step='0.01'
                      value={editForm.shipping}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, shipping: e.target.value } : prev,
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>Discount</Label>
                    <Input
                      type='number'
                      min={0}
                      step='0.01'
                      value={editForm.discount}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, discount: e.target.value } : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className='text-right space-y-1 text-sm border-t pt-4'>
                  <div className='flex justify-between'>
                    <span className='font-medium'>Subtotal:</span>
                    <span>{editSubtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-medium'>Discount:</span>
                    <span>-{editDiscountNum.toFixed(2)} EGP</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='font-medium'>Shipping:</span>
                    <span>{editShippingNum.toFixed(2)} EGP</span>
                  </div>
                  <div className='flex justify-between font-bold'>
                    <span>Total:</span>
                    <span>{editTotal.toFixed(2)} EGP</span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Totals are recalculated and verified on the server when
                    saved.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsEditOpen(false)}
                    disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order
              <span className='font-mono font-semibold'>
                {" "}
                {orderToDeleteId?.substring(0, 8)}...
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
