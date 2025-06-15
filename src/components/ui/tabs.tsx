/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root


export function TabsList({ className, ...props }: React.ComponentPropsWithRef<typeof TabsPrimitive.List>) {
    return <TabsPrimitive.List
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>) {
    return <TabsPrimitive.Trigger
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
            className
        )}
        {...props}
    />
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithRef<typeof TabsPrimitive.Content>) {
    return <TabsPrimitive.Content
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
}

