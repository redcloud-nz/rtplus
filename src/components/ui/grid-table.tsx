/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


import { TrashIcon } from 'lucide-react'
import { ComponentProps } from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

import { Button } from './button'
import { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverTrigger } from './popover'
import { tv, VariantProps } from 'tailwind-variants'
import { DisplayValue } from './display-value'




export function GridTable({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("grid text-sm p-1 divide-y divide-gray-300", className)}
        role="treegrid"
        data-component="ATable"
        {...props}
    />
}

export function GridTableHead({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("grid col-span-full grid-cols-subgrid border-b", className)}
        data-component="GridTableHead"
        {...props}    
    />
}


export function GridTableBody({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("grid col-span-full grid-cols-subgrid divide-y divide-gray-200", className)}
        data-component="GridTableBody"
        {...props}
    />
}

export function GridTableHeadRow({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("grid col-span-full grid-cols-subgrid items-center gap-2 pl-1 transition-colors", className)}
        data-component="GridTableRow"
        {...props}
    />
}

export function GridTableHeadCell({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("h-10 px-3 pt-3 pb-1 align-middle font-medium", className)}
        role="columnheader"
        data-component="GridTableHeadCell"
        {...props}
    />
}

export function GridTableRow({ asChild = false, className, ...props }: ComponentProps<'div'> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'div'
    return <Comp
        className={cn("grid col-span-full grid-cols-subgrid items-center gap-2 transition-colors hover:bg-muted/50", className)}
        data-component="GridTableRow"
        {...props}
    />
}


export function GridTableCell({ asChild = false, ...props }: ComponentProps<'div'> & { asChild?: boolean}) {
    return asChild
        ? <Slot 
             role="gridcell"
            {...props}
        />
        : <DisplayValue 
            size="sm"
             role="gridcell" 
            {...props}
        />
}

export function GridTableRowActions({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("flex items-center justify-end", className)}
        data-component="GridTableRowActions"
        {...props}
    />
}


export function GridTableDeleteRowButton({ onDelete, ...props }: Omit<ComponentProps<typeof Button>, 'onClick'> & { onDelete: () => void }) {

    return <Popover>
        <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" {...props}>
                <TrashIcon />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 flex justify-between items-center gap-2" side="left">
            <div className="font-semibold">Confirm?</div>
            <div className="flex gap-2">
                <PopoverClose asChild>
                    <Button color="destructive" size="sm" onClick={onDelete}>Delete</Button>
                </PopoverClose>
                 <PopoverClose asChild>
                    <Button variant="ghost" size="sm" autoFocus>Cancel</Button>
                 </PopoverClose>
            </div>
            <PopoverArrow className="fill-destructive border-border" />
        </PopoverContent>
    </Popover>
}