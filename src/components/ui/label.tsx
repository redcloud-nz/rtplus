/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import * as LabelPrimitive from '@radix-ui/react-label'


import { cn } from '@/lib/utils'

const labelVariants = tv({
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
})

export type LabelProps = React.ComponentPropsWithRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>

export function Label({ className, ...props }: LabelProps) {
    return <LabelPrimitive.Root
        className={cn(labelVariants(), className)}
        data-component="Label"
        {...props}
    />
}
