/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'


export function LoadingSpinner({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-gray-900", className)} {...props}/>
}


export function LoadingOverlay({ className, ...props }: Omit<ComponentProps<'div'>, 'children'>) {
    return <div className={cn(
        'fixed inset-0 z-50 bg-black/80',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className
    )} {...props}>
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner className="h-32 w-32 border-gray-200" />
        </div>
    </div>
}