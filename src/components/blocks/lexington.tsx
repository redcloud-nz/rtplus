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
    base: 'flex flex-row justify-center items-stretch px-4 gap-4 overflow-auto h-[calc(100vh-var(--header-height))] [scrollbar-color:var(--scrollbar-thumb)_var(--scrollbar-track)] [scrollbar-gutter:stable_both-edges]',
    variants: {
        // variant: {
        //     container: "[&>*]:w-full [&>*]:max-w-full xl:[&>*]:max-w-4xl [&>*]:mx-auto",
        //     'container-lg': "[&>*]:w-full [&>*]:max-w-full lg:[&>*]:max-w-2xl [&>*]:mx-auto",
        //     'container-md': "[&>*]:w-full [&>*]:max-w-full md:[&>*]:max-w-xl [&>*]:mx-auto",
        //     'container-sm': "[&>*]:w-full [&>*]:max-w-full sm:[&>*]:max-w-lg [&>*]:mx-auto",
        //     dual: "grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl",
        // },
        scrollable: {
            true: "overflow-y-auto",
        }
    }
})

function LexingtonPage({ asChild = false, children, className, scrollable = true, ...props }: ComponentProps<'div'> & VariantProps<typeof lexingtonPageVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'div'

    return <Comp
        className={lexingtonPageVariants({ className, scrollable })}
        data-component="LexingtonPage"
        data-slot="page"
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

const lexingtonColumnVariants = tv({
    base: "flex flex-col items-stretch py-4 gap-2",
    variants: {
        width: {
            sm: "w-full max-w-full sm:max-w-lg",
            md: "w-full max-w-full md:max-w-xl",
            lg: "w-full max-w-full lg:max-w-2xl",
            xl: "w-full max-w-full xl:max-w-4xl",
            full: "w-full",
        }
    },
    defaultVariants: {
        width: "full",
    }
})

function LexingtonColumn({ asChild = false, className, width = "full", ...props }: ComponentProps<'div'> & VariantProps<typeof lexingtonColumnVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'div'

    return <Comp
        className={lexingtonColumnVariants({ className, width })}
        data-component="LexingtonColumn"
        data-slot="column"
        {...props}
    />
}

function LexingtonColumnControls({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn(" w-full flex gap-2 justify-between", className)}
        data-component="LexingtonColumnControls"
        {...props}
    />
}

export const Lexington = {
    Root: LexingtonRoot,
    Header: S2_AppPageHeader,
    Page: LexingtonPage,
    Empty: LexingtonEmpty,
    Column: LexingtonColumn,
    ColumnControls: LexingtonColumnControls,
}