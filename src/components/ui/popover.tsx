/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ComponentProps, ReactNode} from 'react'

import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib/utils'

import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export const Popover = PopoverPrimitive.Root

export const PopoverTrigger = PopoverPrimitive.Trigger


export function PopoverContent({ children, className, align = "center", portal = true, sideOffset = 4, ...props }: ComponentProps<typeof PopoverPrimitive.Content> & { portal?: boolean }) {


    const content = <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
            "z-50 w-72 rounded-sm border bg-popover p-2 text-popover-foreground shadow-md outline-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    >
        {children}
    </PopoverPrimitive.Content>
    
    return portal
        ? <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>
        : content
}


interface PopoverTriggerButtonProps extends ComponentProps<typeof Button> {
    children: ReactNode
    tooltip?: ReactNode
}

/**
 * A {@link Button} that triggers a popover when clicked. It also displays a tooltip with the provided text.
 * @param tooltip The text to display in the tooltip.
 */
export function PopoverTriggerButton({ tooltip, ...props}: PopoverTriggerButtonProps) {
    return <Tooltip>
        <TooltipTrigger asChild>
            <PopoverTrigger asChild>
                <Button {...props} />
            </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
}