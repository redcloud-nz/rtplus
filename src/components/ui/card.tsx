/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ChevronDownIcon, EllipsisVerticalIcon, InfoIcon } from 'lucide-react'
import { type ComponentProps, Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { cn } from '@/lib/utils'

import { Alert } from './alert'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { Popover, PopoverContent, PopoverTriggerButton } from './popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'


export function Card({ className, ...props }: ComponentProps<'div'>) {

    return <div
            className={cn("rounded-sm border bg-card text-card-foreground shadow-xs mb-2", className )}
            {...props}
        />
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("h-10 flex items-center border-b", className)}
        {...props}
    />
}

export function CardTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn(
            "text-2xl font-semibold leading-10 grow px-4",
            className
        )}
        data-slot="title"
        {...props}
    />
}

export function CardActions({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("h-10 flex items-center lg:gap-1 lg:px-1", className)}
        {...props}
    />
}

export function CardDescription({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
}

type CardContentProps = ComponentProps<'div'> & { boundary?: boolean, collapsible?: boolean }

export function CardBody({ boundary, children, className, collapsible, ...props }: CardContentProps) {
    const [open, setOpen] = useState(true)

    return <div className="relative">
        { collapsible ? 
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className="absolute -top-[1px] left-[50%] right-[50%] h-4 w-12 p-0 rounded-0"
                        variant="hanger" 
                        size="icon"
                        onClick={() => setOpen(prev => !prev)}
                    >
                        <ChevronDownIcon className={cn("transition-transform", open && "rotate-180")}/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {open ? 'Collapse card' : 'Expand card'}
                </TooltipContent>
            </Tooltip>
            : null
        }
        <div className={cn("p-2 min-h-24", className, !open && "hidden", collapsible ? "pt-4" : "pt-2")} {...props}>
            { boundary
                ? <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
                    <Suspense 
                        fallback={<div className="w-full flex items-center justify-center p-4">
                            <div className="animate-spin size-10 rounded-full border-t-1 border-b-1 border-gray-900"/>
                        </div>}
                    >
                        {children}
                    </Suspense>
                </ErrorBoundary>
                : children
            }
        </div>
    </div>
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("h-10 flex items-center border-t", className)}
        {...props}
    />
}

export function CardGrid({ className, ...props}: ComponentProps<'div'>) {
    return <div
        className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}
        {...props}
    />
}


export function CardExplanation({ className, ...props }: ComponentProps<'div'>) {
    return <Popover>
        <PopoverTriggerButton variant="ghost" size="icon" tooltip="Card Description">
            <InfoIcon/>
        </PopoverTriggerButton>
        <PopoverContent align="end" className="w-96">
            <div className={cn("text-sm text-muted-foreground space-y-2", className)} {...props}/>
        </PopoverContent>
    </Popover>
}

export function CardMenu({ children, title, ...props }: ComponentProps<typeof DropdownMenu> & { title: string }) {
    return <DropdownMenu {...props}>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon/>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-center">{title}</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            {children}
        </DropdownMenuContent>
    </DropdownMenu>
}