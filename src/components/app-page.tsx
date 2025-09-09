/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Link from 'next/link'
import { ComponentProps, Fragment, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Heading } from '@/components/ui/typography'
import { cn } from '@/lib/utils'


interface AppPageProps {
    children?: ReactNode
    showLeftSidebarTrigger?: boolean
    showRightSidebarTrigger?: boolean
    rightControls?: ReactNode
}

export function AppPage({ children, rightControls, showLeftSidebarTrigger = true, showRightSidebarTrigger = false }: AppPageProps) {
    return <div className="h-screen flex-1 grid grid-rows-[48px_1px_1fr_1px_48px] grid-cols-[auto_1fr_auto]">
        { showLeftSidebarTrigger && <div className="row-1 col-1 flex justify-center items-center pl-1 gap-1">
            <SidebarTrigger side="left"/>
             <Separator orientation="vertical"/>
        </div>}
        
         <div className="row-1 col-3 flex justify-center items-center pr-1 gap-1">
            {rightControls ? <div>{rightControls}</div> : null}
            { showRightSidebarTrigger ? <>
                <Separator orientation="vertical"/>
                <SidebarTrigger side="right"/>
            </> : null }
            
       </div>
        <Separator className="row-start-2 col-span-full" orientation="horizontal"/>
        {children}
    </div>
}

const appPageContentVariants = tv({
    base: 'col-span-full',
    variants: {
        variant: {
            default: 'flex flex-1 flex-col gap-4 p-4 ',
            full: 'w-full flex flex-col items-stretch',
            centered: 'w-full flex flex-col items-center justify-center',
            container: 'flex flex-col items-center gap-4 p-4 *:w-full xl:*:w-4xl overflow-y-auto',
        },
        hasFooter: {
            true: 'row-3',
            false: 'row-start-3 row-span-3'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
})

export type AppPageContentProps = ComponentProps<typeof ScrollAreaPrimitive.Root> & VariantProps<typeof appPageContentVariants>

export function AppPageContent({ children, className, hasFooter = false, variant = 'default', ...props }: AppPageContentProps) {
    return <main className={cn(appPageContentVariants({ variant, className, hasFooter }))} {...props}>
        {children}
    </main>
}

export function AppPageFooter({ className, id = "app-page-footer", ...props }: ComponentProps<'footer'>) {
    return <>
        <Separator orientation="horizontal" className="row-start-4 col-span-full"/>
        <footer
            className={cn("row-start-5 col-span-full flex items-center justify-between gap-2 px-2", className)}
            id={id}
            {...props}
        />
    </>
}

export type PageBreadcrumb = { label: string, href?: string }

function normalizeBreadcrumbs(breadcrumbs: (PageBreadcrumb | string)[]): PageBreadcrumb[] {
    return breadcrumbs.map(breadcrumb => 
        typeof breadcrumb === "string" ? { label: breadcrumb } : breadcrumb
    )
}

export interface AppPageBreadcrumbsProps { 
    breadcrumbs?: (PageBreadcrumb | string)[] 
}

export function AppPageBreadcrumbs({ breadcrumbs = [] }: AppPageBreadcrumbsProps) {
    if(breadcrumbs.length === 0) return null
    
    const normalizedBreadcrumbs = normalizeBreadcrumbs(breadcrumbs)

    return <div className="row-1 col-2 flex items-center h-12 gap-2 pr-2">
        <Breadcrumb className="px-2">
            <BreadcrumbList>
                {normalizedBreadcrumbs.slice(0, -1).map((breadcrumb, idx) => 
                    <Fragment key={idx}>
                        <BreadcrumbItem className="hidden md:block">
                            {breadcrumb.href
                                ? <BreadcrumbLink asChild>
                                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                  </BreadcrumbLink>
                                : <span className="text-muted-foreground">{breadcrumb.label}</span>
                            }
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block"/>
                    </Fragment>
                )}
                <BreadcrumbItem>
                    <BreadcrumbPage>{normalizedBreadcrumbs[normalizedBreadcrumbs.length - 1].label}</BreadcrumbPage>
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