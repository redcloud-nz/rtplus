/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useQuery } from '@tanstack/react-query'

import { DisplayValue } from '@/components/ui/form'
import { useTRPC } from '@/trpc/client'


export function PersonValue({ personId }: { personId: string }) {
    const trpc = useTRPC()

    const query = useQuery(trpc.personnel.byId.queryOptions({ personId }))

    return <DisplayValue value={query.data?.name ?? ""} loading={query.isLoading}/>
}