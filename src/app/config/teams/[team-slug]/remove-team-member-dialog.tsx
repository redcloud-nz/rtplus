/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormButtons, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/trpc/client'

interface RemoveTeamMemberDialogProps {
    teamId: string
    memberId: string
    open: boolean
    onOpenChange: (newValue: boolean) => void
}

export function RemoveTeamMemberDialog({ teamId, memberId, open, onOpenChange }: RemoveTeamMemberDialogProps) {

    function handleOpenChange(newValue: boolean) {
        onOpenChange(newValue)
    }

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
            </DialogHeader>
            
        </DialogContent>
    </Dialog>

}