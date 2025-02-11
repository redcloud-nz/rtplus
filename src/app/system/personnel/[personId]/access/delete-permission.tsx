/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { TrashIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'
import type { PermissionKey } from '@/server/permissions'
import { trpc } from '@/trpc/client'




interface DeletePermissionButonProps {
    personId: string
    permissionKey: PermissionKey
    objectId?: string

}

export function DeletePermissionButton({ personId, permissionKey, objectId }: DeletePermissionButonProps) {
    const utils = trpc.useUtils()
    const mutation = trpc.permissions.removePermission.useMutation({
        onSuccess() {
            utils.permissions.person.invalidate({ personId })
        }
    })

    function handleDeletePermission() {
        mutation.mutate({
            personId,
            permissionKey,
            objectId
        })
    }

    return <>
        
        <Tooltip>
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
    </>
}