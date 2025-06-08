
"use client"

import * as React from "react"
import { format as formatDateFn } from "date-fns"
// To use fa-IR locale for date-fns, it would need to be installed and imported:
// import { faIR } from 'date-fns/locale'; 
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
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDateFn(value, "yyyy/MM/dd") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" dir="rtl">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          dir="rtl"
        />
      </PopoverContent>
    </Popover>
  )
}
