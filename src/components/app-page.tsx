
import { LogInIcon } from 'lucide-react'
import Link from 'next/link'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'




export type SecurePageProps = {
    children: React.ReactNode
    breadcrumbs?: { label: string, href: string }[]
    label: string
}

export function AppPage({ breadcrumbs = [], children, label }: SecurePageProps) {
    return <div className="grid grid-rows-[48px_1fr] justify-items-stretch h-screen">
        <header className="row-start-1 flex justify-between items-center h-12 gap-2 pl-4 pr-2 transition-[width,height] ease-linear border-b">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    {breadcrumbs.length > 0
                        ? <BreadcrumbList>
                            {breadcrumbs.map((breadcrumb, index) => 
                                <BreadcrumbItem key={index} className="hidden md:block">
                                    <BreadcrumbLink asChild>
                                        <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            )}
                            <BreadcrumbSeparator className="hidden md:block"/>
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
            <SignedIn>
                <UserButton/>
            </SignedIn>
            <SignedOut>
                <SignInButton>
                    <Button variant="ghost"><LogInIcon/> Sign In</Button>
                </SignInButton>
            </SignedOut>
        </header>
        <main className="row-start-2 flex justify-center">
            {children}
        </main>
    </div>
}