/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ChevronDownIcon, InfoIcon, LoaderCircleIcon } from 'lucide-react'
import { type ComponentProps, createContext, type MouseEventHandler, type ReactNode, Suspense, useContext, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { cn } from '@/lib/utils'

import { Alert } from './alert'
import { Button } from './button'
import { Link } from './link'
import { Popover, PopoverContent, PopoverTriggerButton } from './popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'


type CardContextType = { isOpen: boolean, setOpen: (open: boolean) => void }
const CardContext = createContext<CardContextType | null>(null)

export function useCardContext() {
    const context = useContext(CardContext)
    if (!context) {
        throw new Error("Card components must be used within a Card component")
    }
    return context
}


type CardProps = ComponentProps<'div'> & {
    boundary?: boolean
    loading?: boolean
    fallbackHeader?: ReactNode
}

export function Card({ boundary, className, children, fallbackHeader, loading = false, ...props }: CardProps) {
    const [open, setOpen] = useState(true)

    const contextValue = useMemo(() => ({ isOpen: open, setOpen }), [open])

    return <CardContext.Provider value={contextValue}>
        <div
            className={cn(
                "rounded-sm border bg-card text-card-foreground shadow-xs mb-2",
                className
            )}
            {...props}
        >
            { boundary 
                ? <ErrorBoundary fallbackRender={({ error }) => <>
                    {fallbackHeader}
                    <CardBody>
                        <Alert severity="error" title="An error occurred">
                            {error.message}
                        </Alert>
                    </CardBody>
                </>}>
                    <Suspense fallback={<>
                        {fallbackHeader}
                        <CardBody>
                            <div className="h-full w-full flex items-center justify-center">
                                <LoaderCircleIcon className="w-10 h-10 animate-spin"/>
                            </div>
                        </CardBody>
                        </>}
                    >
                        {children}
                    </Suspense>
                </ErrorBoundary>
                : loading ? <div className="h-full w-full flex items-center justify-center p-10">
                    <LoaderCircleIcon className=" w-10 h-10 animate-spin"/>
                </div>
                : children
            }
        </div>
    </CardContext.Provider>
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("relative flex border-b bg-zinc-50", className)}
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

export function CardDescription({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
}

type CardContentProps = ComponentProps<'div'> & { boundary?: boolean, collapsible?: boolean }

export function CardBody({ boundary, children, className, collapsible, ...props }: CardContentProps) {
    const { isOpen, setOpen } = useCardContext()

    return <div className="relative">
        <div className={cn("p-2 min-h-24", className, !isOpen && "hidden")} {...props}>
            { boundary
                ? <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
                    <Suspense 
                        fallback={<div className="w-full flex items-center justify-center p-4">
                            <LoaderCircleIcon className="w-10 h-10 animate-spin"/>
                        </div>}
                    >
                        {children}
                    </Suspense>
                </ErrorBoundary>
                : children
            }
        </div>
        { collapsible ? 
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className="absolute -top-[1px] -right-[1px] h-5 w-10 p-0 rounded-0"
                        variant="hanger" 
                        size="icon"
                        onClick={() => setOpen(!isOpen)}
                    >
                        <ChevronDownIcon className={cn("transition-transform", isOpen && "rotate-180")}/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {isOpen ? 'Collapse card' : 'Expand card'}
                </TooltipContent>
            </Tooltip>
            : null
        }
    </div>
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("flex items-center p-2 pt-0", className)}
        {...props}
    />
}

export function CardGrid({ className, ...props}: ComponentProps<'div'>) {
    return <div
        className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}
        {...props}
    />
}

export function CardBoundary({ children}: { children: ReactNode }) {

    return <ErrorBoundary 
        fallback={<Card>
            <Alert severity="error" title="An error occurred"/>
        </Card>}
    >
        <Suspense 
            fallback={<Card>
                <div className="h-full w-full flex items-center justify-center">
                    <LoaderCircleIcon className="animate-spin"/>
                </div>
            </Card>}
        >
            {children}
        </Suspense>
    </ErrorBoundary>
}

type CardActionButtonProps = Omit<ComponentProps<typeof Button>, 'asChild' | 'children' | 'onClick'> & {
    icon: React.ReactNode
    label: React.ReactNode
} & (
    { href?: never, onClick: MouseEventHandler<HTMLButtonElement> } | 
    { href: string, onClick?: never }
)

export function CardActionButton({ icon, label, href, onClick, ...props }: CardActionButtonProps) {
    return <Tooltip>
        <TooltipTrigger asChild>
            {href
                ? <Button
                    variant="ghost" 
                    size="icon"
                    {...props}
                    asChild
                >
                    <Link href={href}>{icon}</Link>
                </Button>
                :  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onClick}
                    {...props}
                >
                    {icon}
                </Button>
            }
           
        </TooltipTrigger>
        <TooltipContent>
            {label}
        </TooltipContent>
    </Tooltip>
}

export function CardCollapseToggleButton() {
    const { isOpen, setOpen } = useCardContext()
    return <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost" 
                size="icon"
                onClick={() => setOpen(!isOpen)}
            >
                <ChevronDownIcon className={cn("transition-transform", isOpen && "rotate-180")}/>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            {isOpen ? 'Collapse card' : 'Expand card'}
        </TooltipContent>
    </Tooltip>
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