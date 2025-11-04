/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Lexington page design components.
 * 
 * A page that contains a header and main content area, designed to be used within a sidebar layout.
 */

import { ComponentProps, ReactNode } from 'react'

import { Slot } from '@radix-ui/react-slot'

import { S2_AppPageHeader } from '@/components/app-page'
import Artie from '@/components/art/artie'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

import { cn } from '@/lib/utils'
import { tv, VariantProps } from 'tailwind-variants'


function LexingtonRoot({ children }: { children: ReactNode }) {
    return <main
        data-component="LexingtonRoot"
        className="relative flex min-h-svh flex-1 flex-col bg-background"
    >{children}</main>
}

const lexingtonPageVariants = tv({
    base: 'p-4 flex flex-col gap-2',
    variants: {
        variant: {
            container: "[&>*]:w-full [&>*]:max-w-full xl:[&>*]:max-w-4xl [&>*]:mx-auto",
            'container-md': "[&>*]:w-full [&>*]:max-w-full md:[&>*]:max-w-xl [&>*]:mx-auto",
            'container-sm': "[&>*]:w-full [&>*]:max-w-full sm:[&>*]:max-w-lg [&>*]:mx-auto",
            dual: "grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl",
        }
    }
})

function LexingtonPage({ asChild = false, children, className, variant, ...props }: ComponentProps<'div'> & VariantProps<typeof lexingtonPageVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'div'

    return <Comp
        className={lexingtonPageVariants({ variant, className})}
        data-component="LexingtonPage"
         {...props}
    >
        {children}
    </Comp>
}

interface LexingtonPageEmptyProps {
    title: ReactNode
    description?: ReactNode
    children?: ReactNode
}

function LexingtonEmpty({ title, description, children }: LexingtonPageEmptyProps) {
    return <Empty data-component="LexingtonPageEmpty">
        <EmptyHeader>
            <EmptyMedia>
                <Artie pose="Empty"/>
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>
                {description}
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            {children}
        </EmptyContent>
    </Empty>
}

function LexingtonTableControls(props: ComponentProps<'div'>) {
    return <div 
        className={cn(" w-full flex gap-2 justify-between")}
        data-component="LexingtonTableControls"
        {...props}
    />
}

export const Lexington = {
    Root: LexingtonRoot,
    Header: S2_AppPageHeader,
    Page: LexingtonPage,
    Empty: LexingtonEmpty,
    //Container: LexingtonContainer,
    ColumnControls: LexingtonTableControls,
}