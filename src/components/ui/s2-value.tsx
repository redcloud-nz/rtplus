/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function S2_Value({ children, className, value, ...props }: Omit<ComponentProps<'div'>, 'children'> & ({ children?: never, value: string | number} | { children: ReactNode, value?: never })) {
    return <div
        data-slot="value"
        className={cn(
            "w-fit min-w-0 h-9 px-3 py-1", // Sizing and padding
            "flex items-center",
            "border border-transparent rounded-md outline-none", // Border
            "text-base md:text-sm align-baseline overflow-clip", // Text size
            className
        )}
        {...props}
    >
        <span>
             {value !== undefined ? value : children}
        </span>
    </div>
}