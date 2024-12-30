

import React from 'react'

import { cn } from '@/lib/utils'

export function DL({ className, ...props }: React.ComponentPropsWithRef<'dl'>) {
    return <dl 
        className={cn(
            'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6', 
            className
        )} 
        {...props}
    />
}

export function DLTerm({ className, ...props }: React.ComponentPropsWithRef<'dt'>) {
    return <dt 
        className={cn(
            'col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3 dark:border-white/5 dark:text-zinc-400 sm:dark:border-white/5', 
            className
        )} 
        {...props}
    />
}

export function DLDetails({ className, ...props}: React.ComponentPropsWithRef<'dd'>) {
    return <dd 
        className={cn(
            'pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3 dark:text-white dark:sm:border-white/5 sm:[&:nth-child(2)]:border-none', 
            className
        )} 
        {...props}
    />
}