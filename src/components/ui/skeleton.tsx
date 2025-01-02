/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
    />
}
