import * as React from 'react'

import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            className
        )}
        {...props}
    />
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
