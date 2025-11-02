/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps } from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'


export function StatItem({ asChild = false, className, ...props }: ComponentProps<'div'> &{ asChild?: boolean }) {

    const Comp = asChild ? Slot : 'div'

    return <Comp 
        data-slot="stat-item"
        className={cn(
            "group/item flex flex-col items-center flex-wrap gap-2 p-4",
            "border border-border rounded-md outline-none", 
            "text-sm transition-colors",
            "[a]:hover:bg-accent/50 [a]:transition-colors duration-100",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            className
        )}
        {...props}
    />
}


export function StatItemValue({ className, ...props }: ComponentProps<'div'>) {
    return <div
        data-slot="stat-item-value"
        className={cn('text-4xl font-bold leading-none', className)}
        {...props}
    />
}


export function StatItemTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div
        data-slot="stat-item-title"
        className={cn('text-md font-semibold', className)}
        {...props}
    />
}

export function StatItemDescription({ className, ...props }: ComponentProps<'div'>) {
    return <div
        data-slot="stat-item-description"
        className={cn('text-sm text-center text-muted-foreground', className)}
        {...props}
    />
}
