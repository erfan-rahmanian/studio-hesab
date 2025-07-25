
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { TransactionDialog } from '@/components/TransactionDialog';
import type { TransactionFormData } from '@/components/TransactionForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types';
import { Logo } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { DatePicker } from '@/components/ui/date-picker'; // Import DatePicker

const LOCAL_STORAGE_KEY = 'hesabdari_transactions';

export default function HesabdariPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // State for search and filter
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // Change initial state to 'all'
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
        category: data.category, // Added category
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

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const matchesTitle = transaction.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category.toLowerCase().includes(filterCategory.toLowerCase());
      const matchesStartDate = !startDate || transactionDate >= startDate;
      const matchesEndDate = !endDate || transactionDate <= endDate;

      return matchesTitle && matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [transactions, searchTitle, filterCategory]);


  const totalAmount = useMemo(() => {
    // Use filteredTransactions for total amount calculation if filtering is active
    const relevantTransactions = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filteredTransactions]);

  const percentageAmount = useMemo(() => {
    return totalAmount * 0.08;
  }, [totalAmount]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center shadow-lg" dir="rtl">
      <div className="w-full max-w-5xl bg-card rounded-lg p-6 shadow-md">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-border pb-6">
          <div className="flex flex-col items-center sm:flex-row space-x-0 sm:space-x-3 sm:space-x-reverse mb-4 sm:mb-0">
            <Logo className="h-10 w-10 text-primary mb-2 sm:mb-0" />
            <h1 className="text-3xl font-sans font-semibold text-primary text-center">یادداشت مالی</h1>
          </div>
          <Button onClick={handleAddTransaction} className="custom-add-button">
            <PlusCircle className="ml-2 h-5 w-5" />
            <span className="btn-txt">افزودن یادداشت جدید</span>
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-center">جمع کل مبالغ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center font-sans">{formatCurrency(totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-center">۸٪ از جمع کل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center font-sans">{formatCurrency(percentageAmount)}</p>
            </CardContent>
          </Card>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-center">جستجو و فیلتر</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search by Title */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="search-title">جستجو بر اساس عنوان</Label>
                <div className="relative">
                  <Input
                    id="search-title"
                    placeholder="عنوان تراکنش"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="pr-10" // Add padding to the right for the icon
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {/* Filter by Category */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="filter-category">فیلتر بر اساس دسته بندی</Label>
                <Select onValueChange={setFilterCategory} value={filterCategory}>
                  <SelectTrigger id="filter-category" className="w-full">
                    <SelectValue placeholder="همه دسته بندی ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه دسته بندی ها</SelectItem>
                    {Array.from(new Set(transactions.map(t => t.category))).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date Range Filter */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="start-date">از تاریخ</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="تاریخ شروع"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="end-date">تا تاریخ</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="تاریخ پایان"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTitle('');
                    setFilterCategory('all'); // Reset to 'all'
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  variant="outline"
                  className="w-full font-sans"
                >
                  پاک کردن فیلترها
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-center">لیست تراکنش‌ها</CardTitle>
              <CardDescription className="text-center font-sans">تراکنش‌های مالی خود را مدیریت کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center text-lg font-sans">هیچ یادداشتی با معیارهای جستجوی شما یافت نشد.</p>
                  <p className="text-center text-sm font-sans mt-2">لطفاً فیلترها را تغییر دهید یا پاک کنید.</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center font-sans font-medium">عنوان</TableHead>
                      <TableHead className="text-center font-sans font-medium">مبلغ</TableHead>
                      <TableHead className="text-center font-sans font-medium">تاریخ</TableHead>
                      <TableHead className="text-center font-sans font-medium">دسته بندی</TableHead> {/* Added Category Header */}
                      <TableHead className="text-center font-sans font-medium">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map(transaction => ( // Use filteredTransactions here
                      <TableRow key={transaction.id}>
                        <TableCell className="font-sans text-center font-medium">{transaction.title}</TableCell>
                        <TableCell className="font-sans text-center">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="font-sans text-center">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-sans text-center">{transaction.category}</TableCell> {/* Added Category Cell */}
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
                                <AlertDialogTitle className="font-sans font-semibold">آیا مطمئن هستید؟</AlertDialogTitle>
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
