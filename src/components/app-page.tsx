/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import React, { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { match, P } from 'ts-pattern'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Heading } from '@/components/ui/typography'
import { cn } from '@/lib/utils'



export { PageBoundary } from './app-page-boundary'


export function AppPage({ children }: { children?: React.ReactNode}) {
    return <div className="h-screen flex-1 grid grid-rows-[48px_1px_1fr_1px_48px] grid-cols-[auto_1fr_auto]">
        <div className="row-start-1 col-start-1 flex justify-center items-center pl-1">
            <SidebarTrigger/>
        </div>
        <Separator className="row-start-2 col-span-full" orientation="horizontal"/>
        {children}
    </div>
}


const appPageContentVariants = tv({
    base: 'col-span-full overflow-y-auto',
    variants: {
        variant: {
            default: 'flex flex-1 flex-col gap-4 p-4',
            full: 'w-full flex items-stretch *:flex-1',
            centered: 'w-full flex flex-col items-center justify-center',
            container: 'flex flex-col items-center gap-4 p-4 *:w-full xl:*:w-4xl',
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

export type AppPageContentProps = ComponentProps<"main"> & VariantProps<typeof appPageContentVariants>

export function AppPageContent({ children, className, variant = 'default', ...props }: AppPageContentProps) {
    return <React.Suspense
        fallback={<main className={appPageContentVariants({ variant: 'centered' })}>
            <LoaderIcon className="animate-spin size-12"/>
        </main>}
    >
        <main className={cn(appPageContentVariants({ variant, className }))} {...props}>
            {children}
        </main>
    </React.Suspense>
}

type PathBreadcrumb = { index?: string, _label: string }
export type PageBreadcrumb = { index?: never, label: string, href?: string } | PathBreadcrumb | string

export type AppPageBreadcrumbsProps = { breadcrumbs?: PageBreadcrumb[], label: string } | { breadcrumbs: [...PageBreadcrumb[], PathBreadcrumb | string], label?: never }

export function AppPageBreadcrumbs({ breadcrumbs = [], label }: AppPageBreadcrumbsProps) {
    let pageLabel = label
    if(label == undefined) {
        const last = breadcrumbs[breadcrumbs.length - 1] as PathBreadcrumb | string
        pageLabel = match(last)
            .with({ _label: P.string }, (breadcrumb) => breadcrumb._label)
            .with(P.string, (breadcrumb) => breadcrumb)
            .exhaustive()
        breadcrumbs = breadcrumbs.slice(0, -1)
    }

    return <div className="row-start-1 col-start-2 flex items-center h-12 gap-2 pr-2">
        <Separator orientation="vertical" className="h-4"/>
        <Breadcrumb className="px-2">
            <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, idx) => 
                    <React.Fragment key={idx}>
                        <BreadcrumbItem className="hidden md:block">
                            {match(breadcrumb)
                                .with({ _label: P.string, index: P.string }, (breadcrumb) => 
                                    <BreadcrumbLink asChild>
                                        <Link href={breadcrumb.index}>{breadcrumb._label}</Link>
                                    </BreadcrumbLink>
                                )
                                .with({ _label: P.string }, (breadcrumb) =>
                                    <span className="text-muted-foreground">{breadcrumb._label}</span>
                                )
                                .with({ href: P.string }, (breadcrumb) => 
                                    <BreadcrumbLink asChild>
                                        <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                    </BreadcrumbLink>
                                )
                                .with(P.string, (breadcrumb) => 
                                    <span className="text-muted-foreground">{breadcrumb}</span>
                                )
                                .otherwise((breadcrumb) => 
                                    <span className="text-muted-foreground">{breadcrumb.label}</span>
                            )
                            }
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block"/>
                    </React.Fragment>
                )}
                <BreadcrumbItem>
                    <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>    
        </Breadcrumb>
    </div>
}

export function AppPageControls({ children, className }: ComponentProps<'div'>) {
    return <div className={cn("row-start-1 col-start-3 flex items-center pr-1", className)}>{children}</div>
}


export function PageHeader({ className, ...props }: ComponentProps<'header'>) {
    return <header 
        className={cn(
            'grid', 
            'md:grid-cols-2 md:grid-rows-[auto_auto] ',
            className
        )}
        {...props}
    />
}

export type PageTitleProps = ComponentProps<'h1'> & {
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

export function PageDescription({ className, ...props }: ComponentProps<'p'>) {
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

export function PageControls({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn(
            'row-start-1 row-span-2 col-start-2 justify-self-end self-end',
            'flex gap-2',
            className
        )}
        {...props}
    />
}