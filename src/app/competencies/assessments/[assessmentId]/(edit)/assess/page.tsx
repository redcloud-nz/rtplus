'use client'

import React from 'react'


import { Description } from '@/components/ui/typography'


export default function AssessmentAssessPage({ params }: { params: { assessmentId: string }}) {
    return <>
        <Description>Conduct the assessment:</Description>
        <div>{JSON.stringify(params)}</div>
    </>
}
