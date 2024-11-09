
import { LogInIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Heading } from '@/components/ui/typography'

import { cn } from '@/lib/utils'


export type AppPageContainerProps = {
    children: React.ReactNode
}

export function AppPageContainer({ children }: AppPageContainerProps) {
    return <div className="h-screen flex-1 grid grid-rows-[48px_1px_1fr] grid-cols-[48px_1fr_auto]">
        <div className="row-start-1 col-start-1 p-2.5">
            <SidebarTrigger/>
        </div>
        <SignedIn>
            <div className="row-start-1 col-start-3 p-2.5">
                <UserButton/>
                </div>
            </SignedIn>
            
            <SignedOut>
                <div className="row-start-1 col-start-3 py-1">
                    <SignInButton>
                        <Button variant="ghost"><LogInIcon/> Sign In</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        <Separator className="row-start-2 col-span-full" orientation="horizontal"/>
        {children}
    </div>
}

export type PageBreadcrumbs = { label: string, href: string }[]

export type AppPageProps = React.ComponentProps<"main"> & {
    breadcrumbs?: PageBreadcrumbs
    label: string
    variant?: 'default' | 'list'
}

export function AppPage({ breadcrumbs = [], children, className, label, variant = 'default', ...props }: AppPageProps) {
    return <>
        <div className="row-start-1 flex items-center h-12 gap-2 pr-2">
            <Separator orientation="vertical" className="h-4"/>
            <Breadcrumb className="px-2">
                {breadcrumbs.length > 0
                    ? <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => <React.Fragment key={index}>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                        </React.Fragment>)}
                        <BreadcrumbItem>
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                    : <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                }
            </Breadcrumb>
        </div>
        <main className={cn(
            'row-start-3 col-span-full p-4 overflow-y-auto',
            variant == 'list' && 'flex flex-1 flex-col gap-4',
            className
        )} {...props}>
            {children}
        </main>
    </>
}

export function PageTitle({ ...props }: React.ComponentPropsWithoutRef<'h2'>) {
    return <Heading level={1} {...props}/>
}

export function PageDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p className={cn('mb-2 text-sm text-gray-700', className)} {...props}/>
} 