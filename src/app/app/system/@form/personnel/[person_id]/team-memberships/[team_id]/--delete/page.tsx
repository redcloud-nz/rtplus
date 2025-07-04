/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/teams/[team_id]/members/[person_id]--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { DeleteTeamMembershipForm } from '@/components/forms/delete-team-membership'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'


export default function DeleteTeamMembershipSheet(props: { params: Promise<{ person_id: string, team_id: string }> }) {
    const { person_id: personId, team_id: teamId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Remove a Team Membership.</SheetTitle>
                <SheetDescription>Remove this person from a team.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <DeleteTeamMembershipForm
                    personId={personId}
                    teamId={teamId}
                    onClose={() => router.back()}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}