/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { CheckCheckIcon, CheckIcon, SlashIcon, XIcon } from 'lucide-react'
import { ComponentProps } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '@/lib/utils'
import { CompetenceLevel, CompetenceLevels, CompetenceLevelTerms } from '@/lib/competencies'

export function CompetenceLevelRadioGroup({ className, prevValue, value, ...props }: Omit<ComponentProps<typeof RadioGroupPrimitive.Root>, 'children' | 'value'> & { value: CompetenceLevel, prevValue: CompetenceLevel | null }) {
    return <RadioGroupPrimitive.Root
        data-component="CompetenceLevelRadioGroup"
        data-slot="radio-group"
        className={cn(
            "flex items-center gap-2 sm:gap-3",

            className
        )}
        value={value}
        {...props}
    >
        {CompetenceLevels.map(lvl => <CompetenceLevelRadioGroupItem 
            key={lvl} 
            value={lvl}
            diff={value == lvl ? (prevValue == lvl ? 'none' : 'add') : (prevValue == lvl ? 'remove' : 'none')}
        />)}
        <div className="hidden sm:block w-28 text-muted-foreground text-sm">{CompetenceLevelTerms[value]}</div>
    </RadioGroupPrimitive.Root>
}

export function CompetenceLevelRadioGroupItem({ className, diff, value, ...props }: Omit<ComponentProps<typeof RadioGroupPrimitive.Item>, 'children' | 'value'> & { value: CompetenceLevel, diff: 'add' | 'remove' | 'none' }) {
    return <RadioGroupPrimitive.Item 
        data-component="CompetenceLevelRadioGroupItem"
        data-slot="radio-group-item"
        data-value={value}
        value={value}
        className={cn(
            "border-input text-primary aspect-square size-6 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "not-focus-visible:hover:ring-ring/20 hover:ring-[3px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=unchecked]:text-zinc-100",
            "data-[state=checked]:border-zinc-500/50",
            value == 'NotTaught' && "data-[state=checked]:text-gray-600/50",
            value == 'NotCompetent' && "data-[state=checked]:text-red-600/50",
            value == 'Competent' && "data-[state=checked]:text-green-600/50",
            value == 'HighlyConfident' && "data-[state=checked]:text-blue-600/50",
            diff == 'add' && "ring-2 ring-offset-1 ring-green-500/25",
            diff == 'remove' && "ring-2 ring-offset-1 ring-red-500/25",
            className
        )}
        {...props}
>
        {value == 'NotTaught' && <SlashIcon className="size-5"/>}
        {value == 'NotCompetent' && <XIcon className="size-5"/>}
        {value == 'Competent' && <CheckIcon className="size-5"/>}
        {value == 'HighlyConfident' && <CheckCheckIcon className="size-5"/>}
    </RadioGroupPrimitive.Item>
}
