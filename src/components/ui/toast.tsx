/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { X } from 'lucide-react'
import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import * as ToastPrimitives from '@radix-ui/react-toast'

import { cn } from '@/lib/utils'

export const ToastProvider = ToastPrimitives.Provider

export function ToastViewport({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Viewport>) {
  return <ToastPrimitives.Viewport
        className={cn(
            "fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
            className
        )}
        {...props}
  />
}

const toastVariants = tv({
    base: [
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"],
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})


export function Toast({ className, variant, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>) {
    return <ToastPrimitives.Root
        className={cn(toastVariants({ variant }), className)}
        {...props}
    />
}

export function ToastAction({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Action>) {
    return <ToastPrimitives.Action
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive hover:group-[.destructive]:text-destructive-foreground focus:group-[.destructive]:ring-destructive",
            className
        )}
        {...props}
    />
}


export function ToastClose({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Close>) {
    return <ToastPrimitives.Close
        className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-2 group-hover:opacity-100",
            "group-[.destructive]:text-red-300 hover:group-[.destructive]:text-red-50 focus:group-[.destructive]:ring-red-400 focus:group-[.destructive]:ring-offset-red-600",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
}


export function ToastTitle({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Title>) {
    return <ToastPrimitives.Title
        className={cn("text-sm font-semibold", className)}
        {...props}
    />
}

export function ToastDescription({ className, ...props }: React.ComponentPropsWithRef<typeof ToastPrimitives.Description>) {
    return <ToastPrimitives.Description
        className={cn("text-sm opacity-90", className)}
        {...props}
    />
}

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export type ToastActionElement = React.ReactElement<typeof ToastAction>

