/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { LoaderCircleIcon } from 'lucide-react'
import * as React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { cn } from '@/lib/utils'


type CardProps = React.ComponentPropsWithRef<'div'> & {
    boundary?: boolean
}

export function Card({ boundary, className, children, ...props }: CardProps) {
    return <div
        className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            className
        )}
        {...props}
    >
        { boundary 
            ? <ErrorBoundary fallback={<div>Something went wrong.</div>}>
                <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center">
                        <LoaderCircleIcon className="animate-spin"/>
                    </div>}>
                  {children}
                </React.Suspense>
            </ErrorBoundary>
            : children
        }
    </div>

}

export function CardHeader({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn("grid grid-cols-[48px_1fr_48px] p-2", className)}
        {...props}
    />
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn(
            "text-2xl font-semibold text-center leading-10 col-start-2",
            className
        )}
        data-slot="title"
        {...props}
    />
}

export function CardDescription({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
}

export function CardContent({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div className={cn("p-4 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn("flex items-center p-4 pt-0", className)}
        {...props}
    />
}

export function CardGrid({ className, ...props}: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}
        {...props}
    />
}
