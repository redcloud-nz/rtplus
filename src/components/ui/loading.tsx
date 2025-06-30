/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'


export function LoadingSpinner({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-gray-900", className)} {...props}/>
}