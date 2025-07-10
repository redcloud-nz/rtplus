/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { cn } from '@/lib/utils'


export function Input({ className, type, ...props }: React.ComponentPropsWithRef<'input'>) {
    return <input
        type={type}
        className={cn(
            "flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base md:text-sm shadow-xs border-input transition-[color,box-shadow] outline-none",
            "dark:bg-input/30",
            "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "selection:bg-primary selection:text-primary-foreground",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
        )}
        data-component="Input"
        {...props}
    />
}


export function HiddenInput({ name, value }: Omit<React.ComponentPropsWithRef<'input'>, 'type'>) {
    return <input type="hidden" name={name} value={value}/>
}


type SlugInputProps = Omit<React.ComponentPropsWithRef<'input'>, 'onChange' | 'type'> & { onChange?: (ev: React.ChangeEvent<HTMLInputElement>, newValue: string) => void }

export function SlugInput(props: SlugInputProps) {
    return <Input 
        type="text" 
        maxLength={100}
        data-component="SlugInput"
        {...props}
        onChange={ev => {
            if(props.onChange) {
                props.onChange(ev, ev.target.value.replace(/[^a-zA-Z0-9-]/g, ''))
            }
        }}
    />

}