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
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
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