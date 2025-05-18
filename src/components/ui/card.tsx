/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { LoaderCircleIcon } from 'lucide-react'
import { type ComponentProps, type MouseEventHandler, type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { cn } from '@/lib/utils'
import { Alert } from './alert'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { Link } from './link'


type CardProps = ComponentProps<'div'> & {
    boundary?: boolean
    loading?: boolean
    fallbackHeader?: ReactNode
}

export function Card({ boundary, className, children, fallbackHeader, loading = false, ...props }: CardProps) {
    return <div
        className={cn(
            "rounded-sm border bg-card text-card-foreground shadow-sm",
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

}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn("flex border-b bg-zinc-50", className)}
        {...props}
    />
}

export function CardTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div
        className={cn(
            "text-2xl font-semibold leading-10 flex-grow px-4",
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

type CardContentProps = ComponentProps<'div'> & { boundary?: boolean }

export function CardBody({ boundary, children, className, ...props }: CardContentProps) {
    return <div className={cn("p-4 min-h-18", className)} {...props}>
        { boundary
            ? <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
                <Suspense 
                    fallback={<div className="h-full w-full flex items-center justify-center">
                        <LoaderCircleIcon className="w-10 h-10 animate-spin"/>
                    </div>}
                >
                    {children}
                </Suspense>
            </ErrorBoundary>
            : children
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