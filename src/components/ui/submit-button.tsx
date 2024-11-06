'use client'

import { type VariantProps } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'
import React from 'react'

import { cn, resolveAfter } from '@/lib/utils'

import { buttonVariants } from './button'


export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>
}

export function SubmitButton({ children, className, disabled, variant, size, onClick, ...props}: SubmitButtonProps) {
    const [state, setState] = React.useState<'ready' | 'pending' | 'done'>('ready')

    async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        if(onClick) {
            setState('pending')
            await resolveAfter(null, 2000)
            await onClick(event)
            setState('done')
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
        {children}
    </button>

}

export type SubmitButtonLabelProps = React.ComponentPropsWithoutRef<'span'> & {
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