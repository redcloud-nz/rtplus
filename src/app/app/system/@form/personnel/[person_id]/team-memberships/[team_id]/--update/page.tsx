/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/personnel/[person_id]/team-memberships/[team_id]--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { UpdateTeamMembershipForm } from '@/components/forms/update-team-membership'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'


export default function UpdateTeamMembershipSheet(props: { params: Promise<{ person_id: string, team_id: string }> }) {
    const { person_id: personId, team_id: teamId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Team Membership</SheetTitle>
                <SheetDescription>Update a team membership.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdateTeamMembershipForm
                    personId={personId}
                    teamId={teamId}
                    onClose={() => router.back()}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}