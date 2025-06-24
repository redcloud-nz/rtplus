/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function MarketingSection({ children, className, ...props }: ComponentProps<'section'>) {
    return <section className={cn("w-full py-12 md:py-24 lg:py-32", className)} {...props}>
        <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
}