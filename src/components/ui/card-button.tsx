
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { LucideProps } from 'lucide-react'
import { ComponentProps, ForwardRefExoticComponent, RefAttributes } from 'react'

import { cn } from '@/lib/utils'

import { Link } from './link'


export function CardButtonList({ className, ...props }: ComponentProps<'ul'>) {
    return <ul role="list" className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4", className)} {...props} />;
}

type CardButtonProps = {
    className?: string
    label: string
    href: string
    bgColor: string
    icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}


export function CardButton({ className, label, href, bgColor, icon: Icon }: CardButtonProps) {
    return <li className={cn("col-span-1 flex rounded-md shadow-sm", className)}>
        <Link 
            className={cn(
                "group w-full flex justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                "hover:bg-accent hover:text-accent-foreground",
            )}
            href={href}
        >
             <div
                className={cn(
                    bgColor,
                    'flex w-12 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white',
                )}
            >
                {Icon ? <Icon className="h-4 w-4 pointer-events-none" /> : label.charAt(0).toUpperCase()}
            </div>
            <div className={cn(
                "flex-1 px-2 py-2 truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800/50",
                "group-hover:bg-accent group-hover:text-accent-foreground"
            )}>
               {label}
            </div>
        </Link>
       
            
    </li>
}