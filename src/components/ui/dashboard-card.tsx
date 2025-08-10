/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { LucideProps } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Link } from './link'


export function DashboardCardList({ className, ...props }: React.ComponentPropsWithRef<'ul'>) {
    return <ul className={cn("container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)} {...props}/>
}

type DashboardCardProps = React.ComponentPropsWithRef<'li'> & {
    title: string
    href: string
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>
    iconForeground: string
    iconBackground: string
    description: string
}

export function DashboardCard({ className, title, href, icon: Icon, iconForeground, iconBackground, description, ...props}: DashboardCardProps) {

    return <li className={cn("col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm", className)} {...props}>
        <div className="group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50 space-y-2">
            <div>
                <span
                    className={cn(
                        iconBackground,
                        iconForeground,
                        'inline-flex rounded-lg p-3 ring-4 ring-white',
                    )}
                    >
                    <Icon aria-hidden="true" className="size-6" />
                </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">
                <Link href={href} className="focus:outline-hidden">
                    {/* Extend touch target to entire panel */}
                    <span aria-hidden="true" className="absolute inset-0" />
                    {title}
                </Link>
            </h3>
            <p className="text-sm text-gray-500">
                {description}
            </p>
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
            >
                <svg fill="currentColor" viewBox="0 0 24 24" className="size-6">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
            </span>
        </div>
    </li>
}