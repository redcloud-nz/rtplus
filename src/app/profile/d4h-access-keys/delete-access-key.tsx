'use client'

import React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SubmitButton, SubmitButtonLabel } from '@/components/ui/submit-button'

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
                <SubmitButton 
                    variant="destructive" 
                    onClick={handleDelete}
                >
                    <SubmitButtonLabel activeState="ready">Delete</SubmitButtonLabel>
                    <SubmitButtonLabel activeState="pending">Deleting</SubmitButtonLabel>
                </SubmitButton>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}