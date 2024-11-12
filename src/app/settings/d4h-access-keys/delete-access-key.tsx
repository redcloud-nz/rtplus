'use client'

import React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SubmitButton, SubmitButtonLabel } from '@/components/ui/submit-button'

import { deleteAccessKey } from './actions'


interface DeleteAccessKeyDialogProps {
    accessKey: { id: string, label: string}
}
export function DeleteAccessKeyButton({ accessKey }: DeleteAccessKeyDialogProps) {
    const [open, setOpen] = React.useState(false)

    function handleClose() {
        setOpen(false)
    }

    async function handleDelete() {
        await deleteAccessKey({ id: accessKey.id })
        setOpen(false)
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost">Delete</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete D4H Access Key</DialogTitle>
                <DialogDescription>
                    {`Confirm deletion of access key '${accessKey.label}'`}
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