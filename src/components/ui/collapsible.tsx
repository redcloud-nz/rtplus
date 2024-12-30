'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'


export type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>

export const Collapsible = CollapsiblePrimitive.Root

export const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

export const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

