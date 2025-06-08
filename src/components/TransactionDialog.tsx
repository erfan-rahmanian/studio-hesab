
"use client";

import type * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionForm, type TransactionFormData } from './TransactionForm';
import type { Transaction } from '@/types';

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<Transaction>;
  mode: 'add' | 'edit';
}

export function TransactionDialog({ isOpen, onOpenChange, onSubmit, initialData, mode }: TransactionDialogProps) {
  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    onOpenChange(false); // Close dialog on submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif font-bold">
            {mode === 'add' ? 'افزودن یادداشت جدید' : 'ویرایش یادداشت'}
          </DialogTitle>
          <DialogDescription className="font-sans">
            {mode === 'add' ? 'اطلاعات تراکنش جدید را وارد کنید.' : 'اطلاعات تراکنش را ویرایش کنید.'}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleFormSubmit} 
          initialData={initialData}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
