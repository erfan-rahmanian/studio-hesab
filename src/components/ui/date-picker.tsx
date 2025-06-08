
"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { faIR } from 'date-fns/locale';
import type { Locale } from 'date-fns';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange: (date?: Date) => void
  className?: string
  buttonClassName?: string
  placeholder?: string
}

const formatPersianCaption = (date: Date, options?: { locale?: Locale }) => {
  return new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    year: 'numeric',
    calendar: 'persian',
  }).format(date);
};

export function DatePicker({ value, onChange, className, buttonClassName, placeholder = "یک تاریخ انتخاب کنید" }: DatePickerProps) {
  const displayPersianDateOnButton = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'persian',
      numberingSystem: 'latn' 
    }).format(date).replace(/\//g, '/'); 
  };

  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            buttonClassName
          )}
          dir="rtl" 
        >
          <CalendarIcon className="ml-2 h-4 w-4" /> 
          {value ? displayPersianDateOnButton(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" dir="rtl">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          dir="rtl"
          locale={faIR} 
          formatters={{
            formatCaption: formatPersianCaption,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
