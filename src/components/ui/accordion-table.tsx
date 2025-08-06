/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


import { ChevronDownIcon } from 'lucide-react'
import { ComponentProps } from 'react'

import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { cn } from '@/lib/utils'
import { Button } from './button'



export function ATable({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("grid text-sm p-1 divide-y divide-gray-300", className)}
        role="treegrid"
        data-component="ATable"
        {...props}
    />
}

export function ATableHead({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("grid col-span-full grid-cols-subgrid border-b", className)}
        data-component="ATableHead"
        {...props}    
    />
}


export function ATableBody({ children, className }: Pick<ComponentProps<typeof AccordionPrimitive.Root>, 'className' | 'children'>) {
    return <AccordionPrimitive.Root 
        className={cn("grid col-span-full grid-cols-subgrid divide-y divide-gray-200", className)}
        data-component="ATableBody"
        type="single"
        collapsible
    >{children}</AccordionPrimitive.Root>
}

export function ATableHeadRow({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("grid col-span-full grid-cols-subgrid items-center pl-1 last:border-0 transition-colors hover:bg-muted/50", className)}
        data-component="ATableRow"
        {...props}
    />
}

export function ATableHeadCell({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("h-10 px-2 pt-3 pb-1 align-middle font-medium", className)}
        role="columnheader"
        data-component="ATableHeadCell"
        {...props}
    />
}

export function ATableItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
    return <AccordionPrimitive.Item
        className={cn("grid col-span-full grid-cols-subgrid", className)}
        data-component="ATableItem"
        {...props}
    />
}

export function ATableRow({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Header>) {
    return <AccordionPrimitive.Header
        className={cn("grid col-span-full grid-cols-subgrid items-center pl-1 last:border-0 transition-colors hover:bg-muted/50", className)}
        data-component="ATableRow"
        {...props}
    />
}

export function ATableTrigger({ className }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return <AccordionPrimitive.Trigger asChild>
        <Button
            variant="ghost"
            size="icon"
            className={cn("transition-all [&[data-state=open]>svg]:rotate-180", className)}
            data-component="ATableTrigger"
           
        >
            <ChevronDownIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", className)} />
        </Button>
    </AccordionPrimitive.Trigger>
}

export function ATableContent({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
    return <AccordionPrimitive.Content
        className={cn("grid col-span-full grid-cols-subgrid", className)}
        data-component="ATableRowContent"
        {...props}
    />
}

export function ATableCell({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("h-9 p-2 align-middle", className)}
        role="gridcell"
        data-component="ATableCell"
        {...props}
    />
}

