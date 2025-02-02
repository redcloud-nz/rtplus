/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { TrashIcon } from 'lucide-react'

import { Protect } from '@/components/protect'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import type { PersonPermissions } from '@/server/data/personnel'
import type { SystemPermissionKey, TeamPermissionKey } from '@/server/permissions'

import {  DeletePermissionButton } from './delete-permission'





interface PermissionListProps {
    personId: string
    personPermissions: PersonPermissions
}

export function PermissionList({ personId, personPermissions }: PermissionListProps) {

    const systemPermissions = (personPermissions.systemPermissions?.permissions ?? []) as SystemPermissionKey[]

    const isEmpty = systemPermissions.length === 0 && personPermissions.teamPermissions.length === 0

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
                {personPermissions.teamPermissions.map(({ team, permissions }) =>
                    (permissions as TeamPermissionKey[]).map(permissionKey =>
                        <TableRow key={`${team.id}:${permissionKey}`}>
                            <TableCell>{permissionKey}</TableCell>
                            <TableCell>{team.name}</TableCell>
                            <TableCell className="text-right pr-0">
                                <Protect permission="team:write" teamId={team.id}>
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