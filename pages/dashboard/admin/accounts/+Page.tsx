import { useEffect, useState } from "react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#root/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Badge } from "#root/components/ui/badge";

type StaffRole = "admin" | "accountant" | "sales";

interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string | Date;
}

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "accountant", label: "Accountant" },
  { value: "sales", label: "Sales" },
];

const roleLabel = (role: string) =>
  ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "sales" as StaffRole,
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await trpc.accounts.list.query();
      if (res.success) {
        setAccounts(res.result as Account[]);
      } else {
        toast.error(res.error || "Failed to load accounts");
      }
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const resetForm = () =>
    setForm({ name: "", email: "", phone: "", password: "", role: "sales" });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSaving(true);
    try {
      const res = await trpc.accounts.create.mutate(form);
      if (res.success) {
        toast.success("Account created");
        setIsCreateOpen(false);
        resetForm();
        await fetchAccounts();
      } else {
        toast.error(res.error || "Failed to create account");
      }
    } catch {
      toast.error("Failed to create account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (account: Account, role: StaffRole) => {
    if (role === account.role) return;
    try {
      const res = await trpc.accounts.update.mutate({
        userId: account.id,
        role,
      });
      if (res.success) {
        toast.success("Role updated");
        await fetchAccounts();
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleToggleActive = async (account: Account) => {
    try {
      const res = await trpc.accounts.update.mutate({
        userId: account.id,
        isActive: !account.isActive,
      });
      if (res.success) {
        toast.success(
          account.isActive ? "Account deactivated" : "Account activated",
        );
        await fetchAccounts();
      } else {
        toast.error(res.error || "Failed to update account");
      }
    } catch {
      toast.error("Failed to update account");
    }
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Delete account "${account.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await trpc.accounts.delete.mutate({ userId: account.id });
      if (res.success) {
        toast.success("Account deleted");
        await fetchAccounts();
      } else {
        toast.error(res.error || "Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className='p-4 md:p-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Manage staff accounts and their roles. Admins and accountants have
              full dashboard access; sales staff can only create wholesale
              orders.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}>
            Add Account
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              Loading accounts…
            </p>
          ) : accounts.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No staff accounts yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className='font-medium'>
                      {account.name}
                    </TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.phone}</TableCell>
                    <TableCell>
                      <Select
                        value={account.role}
                        onValueChange={(value) =>
                          handleRoleChange(account, value as StaffRole)
                        }>
                        <SelectTrigger className='w-35'>
                          <SelectValue>{roleLabel(account.role)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleToggleActive(account)}>
                          {account.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDelete(account)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
            <DialogDescription>
              Create a new staff account. The account is ready to use
              immediately.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='account-name'>Name</Label>
              <Input
                id='account-name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='account-email'>Email</Label>
              <Input
                id='account-email'
                type='email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='account-phone'>Phone</Label>
              <Input
                id='account-phone'
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='account-password'>Password</Label>
              <Input
                id='account-password'
                type='password'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value as StaffRole })
                }>
                <SelectTrigger>
                  <SelectValue>{roleLabel(form.role)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateOpen(false)}
              disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
