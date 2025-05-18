/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { InfoIcon, Loader2Icon } from 'lucide-react'
import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

import { Link } from './link'


export const buttonVariants = tv({
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

export type ButtonProps = React.ComponentPropsWithRef<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}

/**
 * A button component that can be used to trigger actions or navigate to other pages.
 * @param className Additional class names to apply to the button.
 * @param variant The variant of the button. Can be one of 'default', 'destructive', 'outline', 'secondary', 'ghost', or 'link'.
 * @param size The size of the button. Can be one of 'default', 'sm', 'lg', or 'icon'.
 * @param asChild If true, the button will be rendered using the Slot component. 
 * 
 * @see https://ui.shadcn.com/docs/components/button
 */
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
    const Comp = asChild ? Slot : 'button'
    return <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
    />
}


export interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>
    label?: React.ReactNode
    pending?: React.ReactNode
    done?: React.ReactNode
    reset?: boolean
}

export function AsyncButton({ children, className, disabled, variant, size, onClick, label, pending, done, reset, ...props}: AsyncButtonProps) {

    const [state, setState] = React.useState<'ready' | 'pending' | 'done'>('ready')

    async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        if(onClick) {
            setState('pending')
            await onClick(event)
            setState(reset ? 'ready' : 'done')
        }
    }

    return <button
        className={cn('group', buttonVariants({ variant, size, className }))}
        disabled={state != 'ready' || disabled}
        onClick={handleClick}
        data-state={state}
        {...props}
    >
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin hidden group-data-[state=pending]:inline" />
        {label ? <SubmitButtonLabel activeState="ready">{label}</SubmitButtonLabel> : null}
        {pending ? <SubmitButtonLabel activeState="pending">{pending}</SubmitButtonLabel> : null}
        {done ? <SubmitButtonLabel activeState="done">{done}</SubmitButtonLabel> : null}
        {children}
    </button>

}

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    state: 'ready' | 'pending' | 'done'
    label?: React.ReactNode
    pending?: React.ReactNode
    done?: React.ReactNode
}

export function SubmitButton({ children, className, disabled, variant, size, state, label, pending, done, ...props}: SubmitButtonProps) {
    return <button
        className={cn('group', buttonVariants({ variant, size, className }))}
        disabled={state != 'ready' || disabled}
        data-state={state}
        {...props}
    >
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin hidden group-data-[state=pending]:inline" />
        {label ? <SubmitButtonLabel activeState="ready">{label}</SubmitButtonLabel> : null}
        {pending ? <SubmitButtonLabel activeState="pending">{pending}</SubmitButtonLabel> : null}
        {done ? <SubmitButtonLabel activeState="done">{done}</SubmitButtonLabel> : null}
        {children}
    </button>
}


export type SubmitButtonLabelProps = React.ComponentPropsWithRef<'span'> & {
    activeState: 'ready' | 'pending' | 'done'
}

export function SubmitButtonLabel({ children, className, activeState, ...props }: SubmitButtonLabelProps) {
    return <span className={cn(
        'hidden', 
        activeState == 'ready' && 'group-data-[state=ready]:inline', 
        activeState == 'pending' && 'group-data-[state=pending]:inline', 
        activeState == 'done' && 'group-data-[state=done]:inline', 
        className
    )} {...props}>{children}</span>
}

export function DocumentationButton({ topic }: { topic: string }) {
    return <Button variant="ghost" asChild>
        <Link href={`/documentation/${topic}`}><InfoIcon/></Link>
    </Button>
}


