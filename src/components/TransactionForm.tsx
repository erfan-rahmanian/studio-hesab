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
        
        // Allow only digits and a single decimal point for the cleaned value
        if (/^\d*\.?\d*$/.test(cleanedVal) || cleanedVal === '') {
            return cleanedVal === '' ? undefined : parseFloat(cleanedVal);
        }
        return val; // Return original string if not parsable to let Zod handle it
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
                  type="text" // Keep as text to allow custom formatting and parsing
                  placeholder="مثال: ۵۰۰۰۰۰"
                  {...field}
                  onChange={(e) => {
                    let inputValue = e.target.value;
                    // Convert Persian/Arabic numerals to Western numerals for processing
                    let westernNumeralsValue = toWesternNumerals(inputValue);
                    
                    // Clean the value for parsing: remove thousand separators, convert Persian decimal to period
                    const cleanedValueForParsing = westernNumeralsValue
                      .replace(/[٬,]/g, '')    // Remove Farsi and English thousand separators
                      .replace(/[٫\/]/g, '.'); // Convert Farsi decimal separators (٫ or /) to standard period .
                    
                    // Allow only digits and a single decimal point for the cleaned value, or empty string
                    if (/^\d*\.?\d*$/.test(cleanedValueForParsing) || cleanedValueForParsing === '') {
                         field.onChange(cleanedValueForParsing); // Pass the cleaned string to react-hook-form
                    } else {
                        // If input is invalid after cleaning (e.g. "1.2.3" or "abc"), 
                        // pass it as is, Zod will catch it.
                        // This prevents the input field from becoming uncontrollable for the user
                        // if they momentarily type an invalid character.
                         field.onChange(cleanedValueForParsing);
                    }
                  }}
                  value={
                    (() => {
                      const formValue = field.value; // This value comes from react-hook-form state
                      if (typeof formValue === 'number') {
                        // If it's a number (e.g. after successful submission or from initialData), format it to Persian
                        return formValue.toLocaleString('fa-IR', { maximumFractionDigits: 10, useGrouping: true });
                      }
                      if (typeof formValue === 'string') {
                        // If it's a string (e.g. user is typing or Zod hasn't parsed it to number yet)
                        // try to format it if it's a valid number string, otherwise display as is
                        const westernNumeralsValue = toWesternNumerals(formValue);
                        const num = parseFloat(westernNumeralsValue.replace(/[٬,]/g, '').replace(/[٫\/]/g, '.'));
                        if (!isNaN(num) && /^\d*\.?\d*$/.test(westernNumeralsValue.replace(/[٬,]/g, '').replace(/[٫\/]/g, '.'))) {
                            // If it's a parsable number string, display it with Persian thousand separators
                            // This helps when user types e.g. "1000000" it gets displayed as "۱٬۰۰۰٬۰۰۰"
                            // We need to be careful not to re-format if it's something like "1.2.3" or "abc"
                             const parts = westernNumeralsValue.split('.');
                             const integerPart = parseFloat(parts[0].replace(/[٬,]/g, ''));
                             if (!isNaN(integerPart)) {
                                 let formatted = integerPart.toLocaleString('fa-IR', {useGrouping: true});
                                 if (parts.length > 1) {
                                     formatted += '٫' + parts[1].replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)); // ensure decimal part is also Persian if typed
                                 }
                                 return formatted;
                             }
                        }
                        // Otherwise, display the string value directly as it's being typed (or if it's an unparsed/invalid value)
                        return formValue; 
                      }
                      return ''; // Default to empty string if undefined or null
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
