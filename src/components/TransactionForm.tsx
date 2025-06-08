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
import { toWesternNumerals } from '@/lib/utils';

const transactionFormSchema = z.object({
  title: z.string().min(1, { message: 'عنوان نمی‌تواند خالی باشد.' }),
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        // This string should already be cleaned by onChange to be parsable by parseFloat
        // e.g., "1234.56" or "1234"
        const cleanedVal = val.replace(/,/g, ''); // Remove any remaining standard commas if any (should be none from our onChange)
        return parseFloat(cleanedVal);
      }
      return val;
    },
    z.number({ invalid_type_error: 'مبلغ باید عدد باشد.', required_error: 'مبلغ نمی‌تواند خالی باشد.' })
     .positive({ message: 'مبلغ باید مثبت باشد.' })
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

  // Sync initialData to form when it changes (e.g., when opening dialog for editing)
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        amount: initialData.amount || undefined,
      });
    } else {
      form.reset({
        title: '',
        amount: undefined,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    form.reset({ title: '', amount: undefined }); // Reset form after submission
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
                    inputValue = toWesternNumerals(inputValue);

                    const cleanedValueForParsing = inputValue
                      .replace(/[٬,]/g, '')    // Remove Farsi and English thousand separators
                      .replace(/[٫\/]/g, '.'); // Convert Farsi decimal separators (٫ or /) to standard period .
                    
                    // Allow only digits and a single decimal point for the cleaned value
                    if (/^\d*\.?\d*$/.test(cleanedValueForParsing) || cleanedValueForParsing === '') {
                         field.onChange(cleanedValueForParsing === '' ? '' : cleanedValueForParsing);
                    } else {
                        // If input is invalid after cleaning (e.g. "1.2.3"), revert to previous valid field value
                        // to prevent invalid characters from being set in the form state directly.
                        // This still allows Zod to catch it if somehow an invalid value is submitted.
                        // Or, simply don't call field.onChange if the cleanedValue is not numeric-like.
                        // For simplicity, we'll let field.onChange pass the current `cleanedValueForParsing`
                        // and Zod will handle more complex validation.
                        // This current implementation will pass potentially invalid strings to Zod,
                        // for example "1.2.3" or "abc". Zod will then mark it as an error.
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
                        // Display the string value directly as it's being typed or if it's an unparsed value
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
        <div className="flex justify-end space-x-3 space-x-reverse">
          {onClose && (
            <Button type="button" variant="outline" onClick={() => {
              onClose();
              form.reset({ title: '', amount: undefined }); // Also reset form on explicit cancel
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
