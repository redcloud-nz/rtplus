/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps } from 'react'
import { useQuery } from '@tanstack/react-query'

import { DisplayValue } from '@/components/ui/display-value'
import { useTRPC } from '@/trpc/client'



export function PersonValue({ personId, ...props }: Omit<ComponentProps<typeof DisplayValue>, 'children' |'loading'> &  { personId: string }) {
    const trpc = useTRPC()

    const query = useQuery(trpc.personnel.byId.queryOptions({ personId }))

    return <DisplayValue 
        loading={query.isLoading}
        {...props}
    >{query.data?.name ?? ""}</DisplayValue>
}