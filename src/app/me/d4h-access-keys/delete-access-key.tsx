/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AsyncButton, Button } from '@/components/ui/button'

import { deleteAccessKey } from './actions'


interface DeleteAccessKeyDialogProps {
    accessKeyId: string
    teamName: string
    children: React.ReactNode
}
export function DeleteAccessKeyDialog({ accessKeyId, teamName, children }: DeleteAccessKeyDialogProps) {
    const [open, setOpen] = React.useState(false)

    function handleClose() {
        setOpen(false)
    }

    async function handleDelete() {
        await deleteAccessKey({ accessKeyId })
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
                    {`Confirm deletion of your access key for '${teamName}'.`}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <AsyncButton 
                    variant="destructive" 
                    onClick={handleDelete}
                    label="Delete"
                    pending="Deleting"
                />
            </DialogFooter>
        </DialogContent>
    </Dialog>
}