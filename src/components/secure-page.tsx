
import Link from 'next/link'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'


export type SecurePageProps = {
    children: React.ReactNode
    breadcrumbs?: { label: string, href: string }[]
    label: string
}

export function SecurePage({ breadcrumbs = [], children, label }: SecurePageProps) {

    return <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
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
        </header>
        {children}
    </SidebarInset>
}