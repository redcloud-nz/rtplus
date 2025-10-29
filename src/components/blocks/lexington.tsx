/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Lexington page design components.
 * 
 * A page that contains a header and main content area, designed to be used within a sidebar layout.
 */

import { ComponentProps, ReactNode } from 'react'

import { S2_AppPageHeader } from '@/components/app-page'
import Artie from '@/components/art/artie'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { SidebarInset } from '@/components/ui/sidebar'

import { cn } from '@/lib/utils'


function LexingtonRoot({ children }: { children: ReactNode }) {
    return <SidebarInset
        data-component="LexingtonPage"
    >{children}</SidebarInset>
}

interface LexingtonPageMainProps extends ComponentProps<'main'> {}

const LexingtonMain = function LexingtonPageMain({ children, ...props }: LexingtonPageMainProps) {
    return <main 
        className="h-[calc(100vh-var(--header-height))] p-4" {...props}
        data-component="LexingtonPageMain"
    >
        {children}
    </main>
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

function LexingtonContainer({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn("w-full h-full max-w-4xl mx-auto flex flex-col gap-2", className)}
        data-component="LexingtonContainer"
        {...props}
    />
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
    Main: LexingtonMain,
    Empty: LexingtonEmpty,
    Container: LexingtonContainer,
    TableControls: LexingtonTableControls,
}