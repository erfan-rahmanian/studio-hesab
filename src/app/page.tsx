"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { TransactionDialog } from '@/components/TransactionDialog';
import type { TransactionFormData } from '@/components/TransactionForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types';
import { Logo } from '@/components/icons'; // Assuming you've created this
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'hesabdari_transactions';

export default function HesabdariPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // Load transactions from local storage on initial render
  useEffect(() => {
    const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error("Failed to parse transactions from local storage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []);

  // Save transactions to local storage whenever they change
  useEffect(() => {
    // Check if transactions state is initialized to prevent overwriting on first load with empty array
    // if transactions is not empty, or if it is empty but local storage already has the key (meaning user deleted all items)
    if (transactions.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  const handleAddTransaction = () => {
    setDialogMode('add');
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setDialogMode('edit');
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "یادداشت حذف شد",
      description: "یادداشت با موفقیت حذف گردید.",
      variant: "default",
    });
  };

  const handleFormSubmit = (data: TransactionFormData) => {
    if (dialogMode === 'add') {
      const newTransaction: Transaction = {
        id: Date.now().toString(), // Simple unique ID
        ...data,
        date: new Date().toISOString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: "یادداشت اضافه شد",
        description: "یادداشت جدید با موفقیت اضافه گردید.",
        variant: "default",
      });
    } else if (editingTransaction) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === editingTransaction.id ? { ...t, ...data, date: t.date } : t
        )
      );
      toast({
        title: "یادداشت ویرایش شد",
        description: "یادداشت با موفقیت ویرایش گردید.",
        variant: "default",
      });
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const totalAmount = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const percentageAmount = useMemo(() => {
    return totalAmount * 0.08;
  }, [totalAmount]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-4 sm:mb-0">
          <Logo className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-primary">یادداشت مالی</h1>
        </div>
        <Button onClick={handleAddTransaction} variant="default">
          <PlusCircle className="ml-2 h-5 w-5" />
          افزودن یادداشت جدید
        </Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">جمع کل مبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">۸٪ از جمع کل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(percentageAmount)}</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">لیست تراکنش‌ها</CardTitle>
            <CardDescription>تراکنش‌های مالی خود را مدیریت کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">هیچ یادداشتی ثبت نشده است.</p>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">عنوان</TableHead>
                    <TableHead className="text-right">مبلغ</TableHead>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.title}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="space-x-2 space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(transaction)} aria-label="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="حذف">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-headline">آیا مطمئن هستید؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                این عمل قابل بازگشت نیست. این یادداشت برای همیشه حذف خواهد شد.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>لغو</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                                بله، حذف کن
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </section>

      <TransactionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction || undefined}
        mode={dialogMode}
      />
    </div>
  );
}
