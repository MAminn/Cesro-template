"use client";

import { useEffect, useState } from "react";
import { trpc } from "#root/shared/trpc/client";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { Link } from "#root/components/utils/Link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Badge } from "#root/components/ui/badge";
import { Button } from "#root/components/ui/button";

interface SalesOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  total: string;
  status: string;
  createdAt: string | Date;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Approval",
  processing: "Accepted",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await trpc.order.view.query({ limit: 100, offset: 0 });
        if (res.success) {
          setOrders(res.result as unknown as SalesOrder[]);
        } else {
          setError(res.error || "Failed to load orders");
        }
      } catch {
        setError("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className='mx-auto w-full max-w-5xl p-4 md:p-6'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>My Orders</h1>
          <p className='text-muted-foreground text-sm'>
            Wholesale orders you have submitted.
          </p>
        </div>
        <Link href='/sales/orders/new'>
          <Button>New Order</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Orders</CardTitle>
          <CardDescription>
            Orders are read-only after submission and reviewed by the team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              Loading orders…
            </p>
          ) : error ? (
            <p className='text-destructive py-8 text-center text-sm'>{error}</p>
          ) : orders.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              You have not submitted any orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className='font-medium'>
                      {order.customerName}
                    </TableCell>
                    <TableCell>{order.customerPhone}</TableCell>
                    <TableCell>
                      {STORE_CURRENCY} {Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "cancelled"
                            ? "destructive"
                            : order.status === "pending"
                              ? "secondary"
                              : "default"
                        }>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
