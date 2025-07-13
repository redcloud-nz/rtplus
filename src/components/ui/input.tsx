/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ComponentProps, useState } from 'react'
import { unique } from 'remeda'
import { tv, VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'


const inputVariants = tv({
    base: cn(
        "flex w-full min-w-0 border bg-background text-sm align-middle shadow-xs border-input transition-[color,box-shadow] outline-none",
        "dark:bg-input/30",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-background file:text-sm file:font-medium",
        "selection:bg-primary selection:text-primary-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    ),
    variants: {
        size: {
            default: "h-10 px-4 py-2.5 rounded-md",
            sm: "h-8 px-3 py-1.5 rounded-sm"
        }
    },
})

export function Input({ className, size = "default", type, ...props }: Omit<ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
    return <input
        type={type}
        className={inputVariants({ className, size })}
        data-component="Input"
        {...props}
    />
}


export function HiddenInput({ name, value }: Omit<ComponentProps<'input'>, 'type'>) {
    return <input type="hidden" name={name} value={value}/>
}

type ConstrainedInputProps<TValue> = Omit<ComponentProps<'input'>, 'defaultValue' | 'onChange' | 'size' | 'type' | 'value'> & VariantProps<typeof inputVariants> & { defaultValue?: TValue, onValueChange?: (value: TValue) => void, value?: TValue }

export function TextInput({ className, defaultValue = "", size = "default", value, ...props }: ConstrainedInputProps<string>) {
    const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue)

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const newValue = ev.target.value
        setInternalValue(newValue)
        if (props.onValueChange) {
            props.onValueChange(newValue)
        }
    }

    const effectiveValue = value ?? internalValue

    return <input
        type="text"
        className={cn(inputVariants({ className, size }))} 
        data-component="TextInput"
        {...props}
        value={effectiveValue}
        onChange={handleChange}
    />
}

export function SlugInput({ className, defaultValue = "", maxLength = 20, onValueChange, size = "default", value, ...props }: ConstrainedInputProps<string>) {
    const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue)

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const newValue = ev.target.value.replace(/[^a-zA-Z0-9-]/g, '')
        setInternalValue(newValue)
        onValueChange?.(newValue)
    }

    const effectiveValue = value ?? internalValue

    return <input
        type="text"
        className={cn(inputVariants({ className, size }))} 
        maxLength={maxLength}
        data-component="SlugInput"
        value={effectiveValue}
        onChange={handleChange}
        {...props}
    />

}

export function TagsInput({ className,  defaultValue = [], onValueChange,  size = "default", value, ...props }: ConstrainedInputProps<string[]>) {
    const [internalValue, setInternalValue] = useState<string[]>(value ?? defaultValue)

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        const newValue = unique(ev.target.value.split(' ').map(tag => tag.toLowerCase()))
        setInternalValue(newValue)
        onValueChange?.(newValue)
    }

    const effectiveValue = value ?? internalValue

    return <input
        type="text"
        className={cn(inputVariants({ className, size }))} 
        data-component="TagsInput"
        value={effectiveValue.join(' ')}
        onChange={handleChange}
        {...props}
    />
}