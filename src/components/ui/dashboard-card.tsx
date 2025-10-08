/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink, Link } from './link'


export function DashboardCardList({ className, ...props }: ComponentProps<'ul'>) {
    return <ul className={cn("container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)} {...props}/>
}

type DashboardCardProps = {
    className?: string
    external?: boolean
    linksTo: {
        label: string
        href: string
    }
    description: string
    icon: ReactNode
}

export function DashboardCard({ className, description, external = false, icon, linksTo }: DashboardCardProps) {

    return <li className={cn("col-span-1 divide-y divide-gray-200 rounded-sm bg-white shadow-sm border", className)}>
        <div className="h-full group relative p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-50 space-y-2">
            <div className="[&>*]:inline-flex [&>*]:rounded-lg [&>*]:p-3 [&>*]:ring-4 [&>*]:ring-white">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900">
                {external ? (
                    <ExternalLink href={linksTo.href} className="focus:outline-hidden">
                        {/* Extend touch target to entire panel */}
                        <span aria-hidden="true" className="absolute inset-0" />
                        {linksTo.label}
                    </ExternalLink>
                ) : (
                    <Link to={linksTo} className="focus:outline-hidden">
                        {/* Extend touch target to entire panel */}
                        <span aria-hidden="true" className="absolute inset-0" />
                        {linksTo.label}
                    </Link>
                )}
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