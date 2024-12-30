
import * as React from 'react'

import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'


export function Avatar({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>) {
    return <AvatarPrimitive.Root
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
}

export function AvatarImage({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>) {
    return <AvatarPrimitive.Image
        className={cn("aspect-square h-full w-full", className)}
        {...props}
    />
}

export function AvatarFallback({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.AvatarFallback>) {
    return <AvatarPrimitive.Fallback
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted",
            className
        )}
        {...props}
    />
}
