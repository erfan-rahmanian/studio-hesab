"use client";

import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Transaction } from '@/types';

const transactionFormSchema = z.object({
  title: z.string().min(1, { message: 'عنوان نمی‌تواند خالی باشد.' }),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val),
    z.number({ invalid_type_error: 'مبلغ باید عدد باشد.' }).positive({ message: 'مبلغ باید مثبت باشد.' })
  ),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<Transaction>;
  onClose?: () => void;
}

export function TransactionForm({ onSubmit, initialData, onClose }: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      amount: initialData?.amount || undefined,
    },
  });

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان تراکنش</FormLabel>
              <FormControl>
                <Input placeholder="مثال: خرید میوه" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مبلغ</FormLabel>
              <FormControl>
                <Input type="text" placeholder="مثال: ۵۰۰۰۰۰" {...field} onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (!isNaN(Number(value)) || value === '') {
                     // Format with commas for display, but field.onChange expects the raw value or string that can be parsed
                    field.onChange(value === '' ? '' : Number(value).toLocaleString('fa-IR').replace(/\./g, ','));
                  }
                }}
                onBlur={(e) => {
                  // On blur, ensure the underlying value is a number if valid
                  const rawValue = e.target.value.replace(/,/g, '');
                  if (!isNaN(Number(rawValue))) {
                    field.onChange(Number(rawValue));
                  } else {
                     field.onChange(rawValue); // Keep invalid string for Zod to catch
                  }
                }}
                // Value needs to be formatted for display, but react-hook-form needs a number or parsable string
                value={typeof field.value === 'number' ? field.value.toLocaleString('fa-IR').replace(/\./g, ',') : field.value || ''}
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 space-x-reverse">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              لغو
            </Button>
          )}
          <Button type="submit" variant="default">ذخیره</Button>
        </div>
      </form>
    </Form>
  );
}
