/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'
import { tv, VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

const skeletonStyles = tv({
    base: 'rounded-md bg-muted animate-pulse',
    variants: {
        variant: {
            default: '',
            text: 'text-sm flex justify-center items-center color-muted-foreground',
            spinner: 'flex justify-center items-center',
        }
    },
})

export type SkeletonProps = React.ComponentPropsWithRef<'div'> & VariantProps<typeof skeletonStyles>

export function Skeleton({ className, children, variant = 'default', ...props }: SkeletonProps) {

    return <div
        className={cn(skeletonStyles({ variant }), className)}
        {...props}
    >
        {variant == 'text' && children}
        {variant == 'spinner' && <LoaderCircle className="animate-spin h-5 w-5"/>}
    </div>
}
