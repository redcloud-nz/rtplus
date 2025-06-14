/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon } from 'lucide-react'
import { ComponentProps, useState } from 'react'

import { cn } from '@/lib/utils'

import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTriggerButton } from './ui/popover'
import { Separator } from './ui/separator'






type FiltersState = { [key: string]: any }

export interface FilterControl<T> {
    value: T
    setValue: (value: T) => void
}

export interface FilterDescriptor<T> {}

interface UserFiltersParams<S extends FiltersState = {}> {
    defaultValues: S
}

interface UseFiltersReturn<S extends FiltersState = {}> {
    readonly control: { [K in keyof S]: FilterControl<S[K]> }
    readonly state: S
}

export function useFilters<S extends FiltersState = {}>({ defaultValues }: UserFiltersParams<S>): UseFiltersReturn<S> {
    const [state, setState] = useState<S>(defaultValues)
    
    return {
        state,
        control: Object.keys(defaultValues).reduce((acc, key) => {
            (acc as any)[key] = {
                value: state[key],
                setValue: (value: any) => setState((prev) => ({ ...prev, [key]: value }))
            }
            return acc
        }, {} as { [K in keyof S]: FilterControl<S[K]> })
    } satisfies UseFiltersReturn<S>

}



export function FiltersPopover({ className, children, trigger, ...props}: ComponentProps<typeof PopoverContent> & { trigger?: React.ReactNode }) {
    return <Popover>
        {trigger ?? <PopoverTriggerButton variant="ghost" size="icon" tooltip="Filters">
            <FunnelIcon/>
        </PopoverTriggerButton>}
        <PopoverContent align="end" className={cn("w-56", className)} {...props}>
            <div className="font-bold text-center">Filters</div>
            <Separator className="my-2"/>
            {children}
        </PopoverContent>
    </Popover>
}

export function StatusFilter({ control }: { control: FilterControl<('Active' | 'Inactive')[]> }) {
    const { value: selected, setValue: setSelected } = control
    
    return (
        <div className="flex flex-col gap-2 p-2">
            <Label className="font-semibold">Status</Label>
            {(['Active', 'Inactive'] as const).map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer pl-2">
                    <Checkbox checked={selected.includes(status)} onCheckedChange={() => setSelected(selected.includes(status) ? selected.filter(x => x !== status) : [...selected, status])} />
                    <span>{status}</span>
                </label>
            ))}
        </div>
    )
}