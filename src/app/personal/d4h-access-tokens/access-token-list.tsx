/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { TrashIcon } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { getAccessTokens } from '@/lib/d4h-access-tokens'
import { formatDateTime } from '@/lib/utils'

import { DeleteAccessTokenDialog } from './delete-access-token'
import { getD4hServer } from '@/lib/d4h-api/servers'


export function AccessTokenList() {

    const accessTokenQuery = useQuery({ 
        queryKey: ['d4h-access-tokens'], 
        queryFn: getAccessTokens
    })

    return <>
        {accessTokenQuery.isLoading && <p>Loading...</p>}
        {accessTokenQuery.isError && <Alert severity="error" title="Error loading access tokens."/>}
        {accessTokenQuery.isSuccess && <Show
            when={accessTokenQuery.data.length > 0}
            fallback={<Alert severity="info" title="No personal access tokens defined."/>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Label</TableHeadCell>
                        <TableHeadCell>D4H Server</TableHeadCell>
                        <TableHeadCell>Created At</TableHeadCell>
                        <TableHeadCell>D4H Teams</TableHeadCell>
                        <TableHeadCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {accessTokenQuery.data
                        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                        .map(accessToken =>
                        <TableRow key={accessToken.id}>
                            <TableCell>{accessToken.label}</TableCell>
                            <TableCell>{getD4hServer(accessToken.serverCode).name}</TableCell>
                            <TableCell>{formatDateTime(accessToken.createdAt)}</TableCell>
                            <TableCell>
                                {accessToken.teams.map(team => <div key={team.id}>{team.name}</div>)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DeleteAccessTokenDialog accessKeyId={accessToken.id}>
                                    <Button variant="ghost">
                                        <TrashIcon/>
                                    </Button>
                                </DeleteAccessTokenDialog>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show>}
    </>
    
    
}