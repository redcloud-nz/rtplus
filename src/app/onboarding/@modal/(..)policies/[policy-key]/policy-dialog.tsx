/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Policy } from '@/lib/policy'


export function PolicyDialog({ policy }: { policy: Policy }) {
    const router = useRouter()

    return <Dialog open onOpenChange={() => router.back()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{policy.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 max-w-xl">
                {policy.content}
            </div>
        </DialogContent>
    </Dialog>
}