/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

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

    const [internalValue, setInternalValue] = React.useState<string>(value ?? defaultValue)

    function handleSelect(selected: Date | undefined) {
        const str = selected ? formatISO(selected) : ""
        
        if(str != internalValue) {
            setInternalValue(str)
            onChange(str)
        }
    }

    const effectiveValue = value ?? internalValue

    const date = effectiveValue ? parseISO(effectiveValue) : undefined

    return <>
        <Input type="hidden" value={effectiveValue} {...props}/>
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
            <PopoverContent className="w-auto overflow-hidden p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={handleSelect}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    </>
}
