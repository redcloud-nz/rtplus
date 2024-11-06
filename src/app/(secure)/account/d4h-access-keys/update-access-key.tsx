'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton, SubmitButtonLabel } from '@/components/ui/submit-button'

import { updateAccessKey } from './actions'


interface UpdateAccessKeyDialogProps {
    accessKey: { id: string, label: string, primary: boolean, enabled: boolean }
}

export function UpdateAccessKeyDialog({ accessKey }: UpdateAccessKeyDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [formState, setFormState] = React.useState(accessKey)

    function handleClose() {
        setOpen(false)
    }

    async function handleUpdate() {
        await updateAccessKey({ ...formState })
        setOpen(false)
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost">Update</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update D4H Access Key</DialogTitle>
                <DialogDescription>
                    Update the label or primary flag of your access key.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" value={formState.label} onChange={ev => setFormState({...formState, label: ev.target.value})}/>
                </div>
                <div className="items-top flex space-x-2">
                    <Checkbox id="primary" checked={formState.primary} onCheckedChange={(newValue) => setFormState({...formState, primary: newValue === true})}/>
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="primary">Primary</Label>
                        <p className="text-sm text-muted-foreground">
                            Mark this key as your primary access key.
                        </p>
                    </div>
                </div>
                <div className="items-top flex space-x-2">
                    <Checkbox id="primary" checked={formState.enabled} onCheckedChange={(newValue) => setFormState({...formState, enabled: newValue === true})}/>
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="primary">Enabled</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable/Disable Access Key
                        </p>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <SubmitButton 
                    variant="destructive" 
                    onClick={handleUpdate}
                >
                    <SubmitButtonLabel activeState="ready">Update</SubmitButtonLabel>
                    <SubmitButtonLabel activeState="pending">Updating</SubmitButtonLabel>
                </SubmitButton>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}