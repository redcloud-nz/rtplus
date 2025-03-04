/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { Protect } from '@/components/protect'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { PermissionKey, TeamPermissionKey } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'


/**
 * Card that displays the permissions of an individual user.
 */
export function UserPermissionsCard({ userId }: { userId: string }) {
    const [{ systemPermissions, teamPermissions }] = trpc.permissions.user.useSuspenseQuery({ userId })

    const [addPermissionDialogOpen, setAddPermissionDialogOpen] = React.useState(false)

    const isEmpty = systemPermissions.length === 0 && teamPermissions.length === 0

    return <Card>
        <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <Tooltip>
                <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <PlusIcon/>
                        </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Add permission</TooltipContent>
            </Tooltip>
            <AddPermissionDialog 
                userId={userId}
                open={addPermissionDialogOpen} 
                onOpenChange={setAddPermissionDialogOpen}
            />
        </CardHeader>
        <CardContent>
            <Show 
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
                                            userId={userId}
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
                                        <Protect permission="team:write" teamId={team.id} system="system:manage-teams">
                                            <DeletePermissionButton
                                                userId={userId}
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
        </CardContent>
    </Card>
}


interface DeletePermissionButtonProps {
    userId: string
    permissionKey: string
    objectId?: string
}

function DeletePermissionButton({ userId, permissionKey, objectId }: DeletePermissionButtonProps) {
    const utils = trpc.useUtils()
    const mutation = trpc.permissions.removePermission.useMutation({
        onSuccess() {
            utils.permissions.user.invalidate({ userId })
        }
    })

    function handleDeletePermission() {
        mutation.mutate({
            userId,
            permissionKey,
            teamId: objectId
        })
    }

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button 
                variant="ghost" 
                onClick={handleDeletePermission}
                disabled={mutation.isPending}
            >
                <TrashIcon className={cn(mutation.isPending && 'animate-spin')}/>
            </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Remove permission</TooltipContent>
    </Tooltip>
}



interface AddPermissionDialogProps extends Omit<React.ComponentProps<typeof Dialog>, 'children'> {
    userId: string
}

export function AddPermissionDialog({ onOpenChange, open, userId, ...props }: AddPermissionDialogProps) {
    const utils = trpc.useUtils()

    // Existing permissions of the target user
    const [permissions] = trpc.permissions.user.useSuspenseQuery({ userId })

    // Current user's permissions
    const [currentUserPermissions] = trpc.currentUser.permissions.useSuspenseQuery()

    const [allTeams] = trpc.teams.all.useSuspenseQuery({})

    const hasSystemWritePermission = currentUserPermissions.systemPermissions.includes('system:write')

    // The set of teams that the current user has write access to
    const availableTeams = hasSystemWritePermission ? allTeams : permissions.teamPermissions.filter(perm => perm.permissions.includes('team:write')).map(({ team }) => team)

    const availablePermissions = []
    if(hasSystemWritePermission && !permissions.systemPermissions.includes('system:write')) availablePermissions.push("system:write")
    if(hasSystemWritePermission || availableTeams.length > 0) availablePermissions.push("team:assess", "team:read", "team:write")

    const [selectedPermission, setSelectedPermission] = React.useState<PermissionKey | "">("")
    const [selectedTeamId, setSelectedTeamId] = React.useState("")

    const valid = selectedPermission == 'system:write' || (selectedPermission.startsWith('team:') && selectedTeamId)

    const mutation = trpc.permissions.addPermission.useMutation({
        onSuccess() {
            utils.permissions.user.invalidate({ userId })
            handleOpenChange(false)
        }
    })

    function handleSave() {
        const teamId = selectedPermission.startsWith('team') ? selectedTeamId : undefined
        return mutation.mutateAsync({ userId, permissionKey: selectedPermission, teamId })
    }

    function handleOpenChange(open: boolean) {
        if(onOpenChange) onOpenChange(open)
        if(!open) {
            setSelectedPermission("")
            setSelectedTeamId("")
        }
    }

    return <Dialog open={open} onOpenChange={handleOpenChange}>
            
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Permission</DialogTitle>
            </DialogHeader>
            <Show 
                when={availablePermissions.length > 0}
                fallback={<p>You do not have permission to add any permissions.</p>}
            >
                <div className="flex flex-col gap-4">
                    <Select value={selectedPermission} onValueChange={(newValue) => setSelectedPermission(newValue as PermissionKey)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select permission..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {availablePermissions.map((permission) => 
                                <SelectItem key={permission} value={permission}>{permission}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {selectedPermission.startsWith('team') ? <Select 
                        value={selectedTeamId} 
                        onValueChange={(newValue) => setSelectedTeamId(newValue)}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Select team..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {availableTeams.map((team) => {
                                const teamPermissions = permissions.teamPermissions.find(({ team: { id }}) => id == team.id)
                                const hasPermission = teamPermissions && teamPermissions.permissions.includes(selectedPermission as TeamPermissionKey)
                                return <SelectItem 
                                    key={team.id} 
                                    value={team.id}
                                    disabled={hasPermission}
                                >{team.name}</SelectItem>
                            })}
                        </SelectContent>
                    </Select> : null}
                    <AsyncButton
                        onClick={handleSave} 
                        disabled={!valid}
                        label="Save"
                        pending="Saving..."
                    />
                </div>
            </Show>
            
        </DialogContent>
        
</Dialog>
}