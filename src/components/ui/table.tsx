/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'

const tableVariants = tv({
    base: 'relative w-full overflow-auto',
    variants: {
        border: {
            true: 'rounded-sm border'
        },
        width: {
            full: 'w-full',
            auto: 'container mx-auto'
        }
    }
})

export type TableProps =  Omit<React.ComponentPropsWithRef<'table'>, 'border'> & VariantProps<typeof tableVariants> & {
    controls?: React.ReactNode
}


export function Table({ className, controls, border = false, width = 'full', ...props }: TableProps) {
    return <div 
        className={cn(
            tableVariants({ border }),
            className
        )}
    >
        <table
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
}

export function TableHead({ className, ...props }: React.ComponentPropsWithRef<'thead'>) {
    return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}



export function TableBody({ className, ...props }: React.ComponentPropsWithRef<'tbody'>) {
    return <tbody
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
}


export function TableFooter({ className, ...props }: React.ComponentPropsWithRef<'tfoot'>) {
    return <tfoot
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
}


export function TableRow({ className, ...props }: React.ComponentPropsWithRef<'tr'>) {
    return <tr
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
}


export function TableHeadCell({ className, ...props }: React.ComponentPropsWithRef<'th'>) {
    return <th
        className={cn(
            "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
}


export function TableCell({ className, ...props }: React.ComponentPropsWithRef<'td'>) {
    return <td
        className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
}


export function TableCaption({ className, ...props }: React.ComponentPropsWithRef<'caption'>) {
    return <caption
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
}
