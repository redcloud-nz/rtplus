/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import * as React from 'react'
import * as R from 'remeda'

import { SkillPackage, Team } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import type { PersonPermissions } from '@/server/data/personnel'


interface AddPermissionDialogProps {
    
    availableSkillPackages: SkillPackage[]
    availableTeams: Team[]
    hasSystemWritePermission: boolean
    personPermissions: PersonPermissions
}

export function AddPermissionDialog({ availableSkillPackages, availableTeams, hasSystemWritePermission, personPermissions }: AddPermissionDialogProps) {
    
    return <Dialog>
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
            <div className="grid gap-4 py-4">
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select permission..."/>
                    </SelectTrigger>
                    <SelectContent>
                        { availableSkillPackages.length > 0 && <SelectItem value="skill-package:write">skill-package:write</SelectItem>}
                        { hasSystemWritePermission && <SelectItem value="system:write">system:write</SelectItem>}
                        { availableTeams.length> 0 && <>
                            <SelectItem value="team:assess">team:assess</SelectItem>
                            <SelectItem value="team:read">team:read</SelectItem>
                            <SelectItem value="team:write">team:write</SelectItem>
                        </>}
                    </SelectContent>
                </Select>
            </div>
        </DialogContent>
        
</Dialog>
}