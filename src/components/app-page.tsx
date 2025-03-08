/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { tv, type VariantProps } from 'tailwind-variants'
import Link from 'next/link'
import React, { ComponentProps } from 'react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Heading } from '@/components/ui/typography'

import { cn } from '@/lib/utils'

import { HeaderControls } from './header-controls'
import { LoaderIcon } from 'lucide-react'

export { PageBoundary } from './app-page-boundary'

export type AppPageContainerProps = {
    children: React.ReactNode
    hasSidebar?: boolean
    slotProps?: {
        headerControls?: ComponentProps<typeof HeaderControls>
    }
}

export function AppPageContainer({ children, hasSidebar, slotProps = {} }: AppPageContainerProps) {
    slotProps = {headerControls: {}, ...slotProps }

    return <div className="h-screen flex-1 grid grid-rows-[48px_1px_1fr_1px_48px] grid-cols-[48px_1fr_auto]">
        <div className="row-start-1 col-start-1 flex justify-center items-center pl-1">
            { hasSidebar ? <SidebarTrigger/> : "RT+" }
        </div>
        <HeaderControls 
            className={cn("row-start-1 col-start-3", slotProps.headerControls?.className)}
            {...slotProps.headerControls}
        />
        <Separator className="row-start-2 col-span-full" orientation="horizontal"/>
        {children}
    </div>
}

const appPageVariants = tv({
    base: 'col-span-full overflow-y-auto',
    variants: {
        variant: {
            default: 'flex flex-1 flex-col gap-4 p-4',
            full: 'w-full flex items-stretch *:flex-1',
            centered: 'flex flex-col items-center justify-center'
        },
        hasFooter: {
            true: 'row-start-3',
            false: 'row-start-3 row-span-3'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
})

export type PageBreadcrumbs = { label: string, href: string }[]

export type AppPageProps = React.ComponentProps<"main"> & VariantProps<typeof appPageVariants> & {
    breadcrumbs?: PageBreadcrumbs
    label: string
    footer?: React.ReactNode
}

export function AppPage({ breadcrumbs = [], children, className, label, footer, variant = 'default', ...props }: AppPageProps) {
    return <>
        <div className="row-start-1 col-start-2 flex items-center h-12 gap-2 pr-2">
            <Separator orientation="vertical" className="h-4"/>
            <Breadcrumb className="px-2">
                <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => 
                        <React.Fragment key={index}>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                        </React.Fragment>
                    )}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>    
            </Breadcrumb>
        </div>
        <React.Suspense
            fallback={<main className={appPageVariants({ variant: 'centered' })}>
                <LoaderIcon className="animate-spin size-12"/>
            </main>}
        >
            <main className={cn(appPageVariants({ variant, hasFooter: !!footer, className }))} {...props}>
                {children}
            </main>
            {footer && <>
                <Separator className="row-start-4 col-span-full" orientation="horizontal"/>
                <footer className="flex items-center p-1 row-start-5 col-span-full bg-background">{footer}</footer>
            </>}
        </React.Suspense>
        
    </>
}

export function PageHeader({ className, ...props }: React.ComponentPropsWithoutRef<'header'>) {
    return <header 
        className={cn(
            'grid', 
            'md:grid-cols-2 md:grid-rows-[auto_auto] ',
            className
        )}
        {...props}
    />
}

export type PageTitleProps = React.ComponentPropsWithoutRef<'h1'> & {
    objectType?: string
}

export function PageTitle({ children, className, objectType, ...props }: PageTitleProps) {
    return <Heading 
        level={1} 
        className={cn(
            'row-start-1', 
            className
        )}
        data-slot="title" 
        {...props}
    >
        {objectType ? <div className="text-sm font-normal tracking-normal text-muted-foreground">{objectType}</div> : null}
        {children}
    </Heading>
}

export function PageDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p 
        className={cn(
            'mt-2 text-sm text-gray-700 hidden md:block', 
            'row-start-2',
            className
        )} 
        data-slot="description" 
        {...props}
    />
}

export function PageControls({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <div
        className={cn(
            'row-start-1 row-span-2 col-start-2 justify-self-end self-end',
            'flex gap-2',
            className
        )}
        {...props}
    />
}