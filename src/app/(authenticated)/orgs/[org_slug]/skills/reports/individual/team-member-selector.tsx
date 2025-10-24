/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'

import { PersonPicker } from '@/components/controls/person-picker'


export function IndividualReport_TeamMemberSelector({ personId }: { personId?: string }) {
    const router = useRouter()


    function handleChange(newPersonId: string) {
        console.log('Selected person ID:', newPersonId)
        router.replace(`?pid=${newPersonId}`)

    }

    return <>
        <PersonPicker
            value={personId ?? ''}
            onValueChange={(newMember) => handleChange(newMember.personId)}
            placeholder="Select a person..."
        />
    </>
}