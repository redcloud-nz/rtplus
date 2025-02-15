/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'


import { Protect } from '@/components/protect'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { trpc } from '@/trpc/client'

import {  DeletePermissionButton } from './delete-permission'


interface PermissionListProps {
    personId: string
}

export function PermissionList({ personId }: PermissionListProps) {
    const [{ systemPermissions, teamPermissions }] = trpc.permissions.person.useSuspenseQuery({ personId })

    const isEmpty = systemPermissions.length === 0 && teamPermissions.length === 0

    return <Show
        when={!isEmpty}
        fallback={<Alert severity="info" title="No permissions assigned."/>}
    >
         <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Permission</TableHeadCell>
                    <TableHeadCell>Target</TableHeadCell>
                    <TableHeadCell></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {systemPermissions.map(permissionKey =>
                    <TableRow key={permissionKey}>
                        <TableCell>{permissionKey}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right pr-0">
                            <Protect permission="system:write">
                                <DeletePermissionButton
                                    personId={personId}
                                    permissionKey="system:write"
                                />
                            </Protect>
                        </TableCell>
                    </TableRow>
                )}
                {teamPermissions.map(({ team, permissions }) =>
                    permissions.map(permissionKey =>
                        <TableRow key={`${team.id}:${permissionKey}`}>
                            <TableCell>{permissionKey}</TableCell>
                            <TableCell>{team.name}</TableCell>
                            <TableCell className="text-right pr-0">
                                <Protect permission="team:write" teamId={team.id} allowSystem>
                                    <DeletePermissionButton
                                        personId={personId}
                                        permissionKey={permissionKey}
                                        objectId={team.id}
                                    />
                                </Protect>
                            </TableCell>
                        </TableRow>
                    )
                )}
            </TableBody>
        </Table>
    </Show>
       
}