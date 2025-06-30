/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useQuery } from '@tanstack/react-query'

import { FixedFormValue } from '@/components/ui/form'
import { useTRPC } from '@/trpc/client'


export function TeamValue({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const query = useQuery(trpc.teams.byId.queryOptions({ teamId }))

    return <FixedFormValue value={query.data?.name ?? ""} loading={query.isLoading}/>
}