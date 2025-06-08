
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
import { Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'hesabdari_transactions';

export default function HesabdariPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error("Failed to parse transactions from local storage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); 
      }
    }
  }, []);

  useEffect(() => {
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
    const transactionDateISO = data.date.toISOString();

    if (dialogMode === 'add') {
      const newTransaction: Transaction = {
        id: Date.now().toString(), 
        title: data.title,
        amount: data.amount,
        date: transactionDateISO,
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
          t.id === editingTransaction.id ? { ...editingTransaction, ...data, date: transactionDateISO } : t
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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center" dir="rtl">
      <div className="w-full max-w-5xl">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex flex-col items-center sm:flex-row space-x-0 sm:space-x-3 sm:space-x-reverse mb-4 sm:mb-0">
            <Logo className="h-10 w-10 text-primary mb-2 sm:mb-0" />
            <h1 className="text-3xl font-serif font-bold text-primary text-center">یادداشت مالی</h1>
          </div>
          <Button onClick={handleAddTransaction} variant="default" className="font-sans">
            <PlusCircle className="ml-2 h-5 w-5" />
            افزودن یادداشت جدید
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-bold text-center">جمع کل مبالغ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-center font-sans">{formatCurrency(totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-bold text-center">۸٪ از جمع کل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-center font-sans">{formatCurrency(percentageAmount)}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-bold text-center">لیست تراکنش‌ها</CardTitle>
              <CardDescription className="text-center font-sans">تراکنش‌های مالی خود را مدیریت کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-sans">هیچ یادداشتی ثبت نشده است.</p>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center font-sans font-medium">عنوان</TableHead>
                      <TableHead className="text-center font-sans font-medium">مبلغ</TableHead>
                      <TableHead className="text-center font-sans font-medium">تاریخ</TableHead>
                      <TableHead className="text-center font-sans font-medium">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-sans font-medium text-center">{transaction.title}</TableCell>
                        <TableCell className="font-sans text-center">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="font-sans text-center">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="space-x-2 space-x-reverse text-center">
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
                                <AlertDialogTitle className="font-serif font-bold">آیا مطمئن هستید؟</AlertDialogTitle>
                                <AlertDialogDescription className="font-sans">
                                  این عمل قابل بازگشت نیست. این یادداشت برای همیشه حذف خواهد شد.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-sans">لغو</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90 font-sans">
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
      </div>

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
