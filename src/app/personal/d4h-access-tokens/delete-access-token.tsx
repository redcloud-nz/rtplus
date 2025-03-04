/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AsyncButton, Button } from '@/components/ui/button'
import { removeAccessToken } from '@/lib/d4h-access-tokens'




interface DeleteAccessKeyDialogProps {
    accessKeyId: string
    children: React.ReactNode
}
export function DeleteAccessTokenDialog({ accessKeyId, children }: DeleteAccessKeyDialogProps) {
    const queryClient = useQueryClient()

    const [open, setOpen] = React.useState(false)

    function handleClose() {
        setOpen(false)
    }

    async function handleDelete() {
        removeAccessToken(accessKeyId)
        queryClient.invalidateQueries({ queryKey: ['d4h-access-tokens'] })
        handleClose()
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete D4H Access Key</DialogTitle>
                <DialogDescription>
                    {`Confirm deletion of your access token.`}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <AsyncButton 
                    variant="destructive" 
                    onClick={handleDelete}
                    label="Delete"
                    pending="Deleting"
                    done="Deleted"
                />
            </DialogFooter>
        </DialogContent>
    </Dialog>
}