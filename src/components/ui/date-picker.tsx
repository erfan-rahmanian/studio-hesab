
"use client"

import * as React from "react"
// import { format as formatDateFn } from "date-fns" // No longer using formatDateFn directly for button display
import { faIR } from 'date-fns/locale'; 
import { Calendar as CalendarIcon } from "lucide-react"

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

export function DatePicker({ value, onChange, className, buttonClassName, placeholder = "یک تاریخ انتخاب کنید" }: DatePickerProps) {
  const displayPersianDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'persian',
      numberingSystem: 'latn' // Use Latin numbers for digits to ensure slashes are rendered correctly by fa-IR formatting
    }).format(date).replace(/\//g, '/'); // Ensure slashes are standard slashes
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
          dir="rtl" // Ensure button text direction is also RTL
        >
          <CalendarIcon className="ml-2 h-4 w-4" /> {/* Changed mr-2 to ml-2 for RTL */}
          {value ? displayPersianDate(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" dir="rtl">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          dir="rtl"
          locale={faIR} // Use Persian locale for the calendar
        />
      </PopoverContent>
    </Popover>
  )
}

