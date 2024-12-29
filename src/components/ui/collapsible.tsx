'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

export type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
