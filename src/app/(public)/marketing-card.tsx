/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function MarketingCard({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}/>
}

export function MarketingCardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}/>
}

export function MarketingCardBody({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("p-6 pt-0 space-y-4", className)} {...props}/>
}

export function MarketingCardTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}/>
}

export function MarketingCardDescription({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("text-muted-foreground text-sm", className)} {...props}/>
}

export function MarketingCardFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props}/>
}