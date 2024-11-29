'use client'

import { format, formatISO, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import React from 'react'

import { Button } from './button'
import { Calendar } from './calendar'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

import { cn } from '@/lib/utils'


export interface DatePickerProps {
    defaultValue?: string
    name?: string
    onChange?: (newValue: string) => void
    placeholder?: string
    value?: string
}

export function DatePicker({ defaultValue = "", onChange = () => {}, placeholder = "Pick a date", value, ...props }: DatePickerProps) {

    const [internalValue, setInternalValue] = React.useState<string>(defaultValue)

    React.useEffect(() => {
        if(value != internalValue && value != undefined) setInternalValue(value)
    }, [value])

    function handleSelect(selected: Date | undefined) {
        const str = selected ? formatISO(selected) : ""
        
        if(str != internalValue) {
            setInternalValue(str)
            onChange(str)
        }
    }

    const date = internalValue ? parseISO(internalValue) : undefined

    return <>
        <Input type="hidden" value={internalValue} {...props}/>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-[280px] justify-start text-left font-normal',
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {date ? format(date, 'PP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    </>
}
