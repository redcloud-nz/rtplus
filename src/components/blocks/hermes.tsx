/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Hermes page design components.
 * 
 * A section that contains a header and main content area, designed to be used within a Lexington column.
 */

import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'


function HermesSection({ className, ...props}: ComponentProps<'section'>) {
    return <section
        className={cn("relative flex flex-col items-stretch gap-2 [&+section]:mt-6", className)}
        data-component="HermesSection"
        
        {...props}
   />
}

function HermesSectionHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn(" w-full flex gap-2 justify-between", className)}
        data-component="HermesSectionHeader"
        data-slot="section-header"
        {...props}
    />
}
    

function HermesSectionTitle({ className, ...props }: ComponentProps<'h3'>) {
    return <h3 
        className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} 
        data-component="HermesSectionTitle"
        data-slot="section-title"
        {...props}
    />
}

export const Hermes = {
    Section: HermesSection,
    SectionHeader: HermesSectionHeader,
    SectionTitle: HermesSectionTitle,
}