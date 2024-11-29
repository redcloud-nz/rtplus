'use client'

import { Description } from '@/components/ui/typography'
import React from 'react'

export default function AssessmentPersonnel({ params }: { params: { assessmentId: string }}) {

    const [selectedPersonnel, setSelectedPersonnel] = React.useState<Record<string, boolean>>({})

    function handleSelectPerson(personId: string, checked: boolean) {
        setSelectedPersonnel(prev => ({ ...prev, [personId]: checked }))
    }

    return <>
        <Description>Select the personnel to be assessed:</Description>
    </>
}