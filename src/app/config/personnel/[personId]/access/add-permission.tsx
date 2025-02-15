/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import * as React from 'react'

import { AsyncButton, Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { PermissionKey, TeamPermissionKey } from '@/lib/permissions'
import { trpc } from '@/trpc/client'
import { Show } from '@/components/show'



interface AddPermissionDialogProps {
    personId: string
}

export function AddPermissionDialog({ personId }: AddPermissionDialogProps) {
    const utils = trpc.useUtils()

    const [permissions] = trpc.permissions.person.useSuspenseQuery({ personId })
    const [currentUserPermissions] = trpc.currentUser.permissions.useSuspenseQuery()

    const [allTeams] = trpc.teams.all.useSuspenseQuery({})

    const hasSystemWritePermission = currentUserPermissions.systemPermissions.includes('system:write')
    const availableTeams = hasSystemWritePermission ? allTeams : permissions.teamPermissions.filter(perm => perm.permissions.includes('team:write')).map(({ team }) => team)

    const availablePermissions = []
    if(hasSystemWritePermission && !permissions.systemPermissions.includes('system:write')) availablePermissions.push("system:write")
    if(hasSystemWritePermission || availableTeams.length > 0) availablePermissions.push("team:assess", "team:read", "team:write")

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedPermission, setSelectedPermission] = React.useState<PermissionKey | "">("")
    const [selectedTeamId, setSelectedTeamId] = React.useState("")

    const valid = selectedPermission == 'system:write' || (selectedPermission.startsWith('team:') && selectedTeamId)

    const mutation = trpc.permissions.addPermission.useMutation({
        onSuccess() {
            utils.permissions.person.invalidate({ personId })
            handleOpenChange(false)
        }
    })

    function handleSave() {
        const objectId = selectedPermission.startsWith('team') ? selectedTeamId : undefined
        return mutation.mutateAsync({ personId, permissionKey: selectedPermission, objectId })
    }

    function handleOpenChange(open: boolean) {
        setDialogOpen(open)
        if(!open) {
            setSelectedPermission("")
            setSelectedTeamId("")
        }
    }

    return <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
            <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <PlusIcon/>
                    </Button>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Add permission</TooltipContent>
        </Tooltip>
            
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