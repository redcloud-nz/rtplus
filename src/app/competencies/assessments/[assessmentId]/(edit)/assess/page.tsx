'use client'

import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Description } from '@/components/ui/typography'

import * as Paths from '@/paths'


export default function AssessmentAssessPage({ params }: { params: { assessmentId: string }}) {
    return <>
        <Description>Conduct the assessment:</Description>
    </>
}
