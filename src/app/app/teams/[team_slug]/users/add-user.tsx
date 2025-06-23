/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'



export function AddUserToTeamDialog({ trigger }: { trigger: React.ReactNode }) {

    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Person</DialogTitle>
                <DialogDescription>
                    Create a new person in the system.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open ? <AddUserToTeamForm onClose={() => setOpen(false)}/> : null }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


export function AddUserToTeamForm({ onClose }: { onClose: () => void }) {

    return (
        <div>
            <p>This is where the form to add a user to a team would go.</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
}