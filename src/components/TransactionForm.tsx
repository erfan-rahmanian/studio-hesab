
"use client";

import * as React from 'react';
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
import { DatePicker } from '@/components/ui/date-picker';
import type { Transaction } from '@/types';
import { toWesternNumerals } from '@/lib/utils';

const transactionFormSchema = z.object({
  title: z.string().min(1, { message: 'عنوان نمی‌تواند خالی باشد.' }),
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const cleanedVal = toWesternNumerals(val)
          .replace(/[٬,]/g, '')    // Remove Farsi and English thousand separators
          .replace(/[٫\/]/g, '.'); // Convert Farsi decimal separators (٫ or /) to standard period .
        
        if (/^\d*\.?\d*$/.test(cleanedVal) || cleanedVal === '') {
            return cleanedVal === '' ? undefined : parseFloat(cleanedVal);
        }
        return val; 
      }
      return val;
    },
    z.number({ invalid_type_error: 'مبلغ باید عدد باشد.', required_error: 'مبلغ نمی‌تواند خالی باشد.' })
     .positive({ message: 'مبلغ باید مثبت باشد.' })
  ),
  date: z.date({ required_error: 'تاریخ نمی‌تواند خالی باشد.' }),
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
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        amount: initialData.amount || undefined,
        date: initialData.date ? new Date(initialData.date) : new Date(),
      });
    } else {
      form.reset({
        title: '',
        amount: undefined,
        date: new Date(),
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset({ title: '', amount: undefined, date: new Date() }); 
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
                <Input
                  type="text" 
                  placeholder="مثال: ۵۰۰۰۰۰"
                  {...field}
                  onChange={(e) => {
                    let inputValue = e.target.value;
                    let westernNumeralsValue = toWesternNumerals(inputValue);
                    const cleanedValueForParsing = westernNumeralsValue
                      .replace(/[٬,]/g, '')
                      .replace(/[٫\/]/g, '.'); 
                    
                    if (/^\d*\.?\d*$/.test(cleanedValueForParsing) || cleanedValueForParsing === '') {
                         field.onChange(cleanedValueForParsing);
                    } else {
                         field.onChange(cleanedValueForParsing);
                    }
                  }}
                  value={
                    (() => {
                      const formValue = field.value; 
                      if (typeof formValue === 'number') {
                        return formValue.toLocaleString('fa-IR', { maximumFractionDigits: 10, useGrouping: true });
                      }
                      if (typeof formValue === 'string') {
                        const westernNumeralsValue = toWesternNumerals(formValue);
                        const num = parseFloat(westernNumeralsValue.replace(/[٬,]/g, '').replace(/[٫\/]/g, '.'));
                        if (!isNaN(num) && /^\d*\.?\d*$/.test(westernNumeralsValue.replace(/[٬,]/g, '').replace(/[٫\/]/g, '.'))) {
                             const parts = westernNumeralsValue.split('.');
                             const integerPart = parseFloat(parts[0].replace(/[٬,]/g, ''));
                             if (!isNaN(integerPart)) {
                                 let formatted = integerPart.toLocaleString('fa-IR', {useGrouping: true});
                                 if (parts.length > 1) {
                                     formatted += '٫' + parts[1].replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)); 
                                 }
                                 return formatted;
                             }
                        }
                        return formValue; 
                      }
                      return ''; 
                    })()
                  }
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاریخ</FormLabel>
              <DatePicker 
                value={field.value}
                onChange={field.onChange}
                placeholder="تاریخ تراکنش را انتخاب کنید"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 space-x-reverse">
          {onClose && (
            <Button type="button" variant="outline" onClick={() => {
              onClose();
              form.reset({ title: '', amount: undefined, date: new Date() }); 
            }}>
              لغو
            </Button>
          )}
          <Button type="submit" variant="default">ذخیره</Button>
        </div>
      </form>
    </Form>
  );
}
