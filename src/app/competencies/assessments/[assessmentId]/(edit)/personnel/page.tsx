'use client'

import React from 'react'

import { Description } from '@/components/ui/typography'


export default function AssessmentPersonnel({ params }: { params: { assessmentId: string }}) {

    // const [selectedPersonnel, setSelectedPersonnel] = React.useState<Record<string, boolean>>({})

    // function handleSelectPerson(personId: string, checked: boolean) {
    //     setSelectedPersonnel(prev => ({ ...prev, [personId]: checked }))
    // }

    return <>
        <Description>Select the personnel to be assessed:</Description>
        <div>{JSON.stringify(params)}</div>
    </>
}