/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

export const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
    size: "default",
    variant: "default",
})

export function ToggleGroup({ className, variant, size, children, ...props }: React.ComponentPropsWithRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
    return <ToggleGroupPrimitive.Root
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
    >
        <ToggleGroupContext.Provider value={{ variant, size }}>
            {children}
        </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
}


export function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
    const context = React.useContext(ToggleGroupContext)

    return <ToggleGroupPrimitive.Item
        className={cn(
            toggleVariants({
                variant: context.variant || variant,
                size: context.size || size,
            }),
            className
        )}
        {...props}
        >
        {children}
    </ToggleGroupPrimitive.Item>
}

