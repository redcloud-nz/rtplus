/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'


export type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>

export const Collapsible = CollapsiblePrimitive.Root

export const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

export const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

