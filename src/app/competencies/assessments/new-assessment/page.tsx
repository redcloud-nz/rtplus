'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { createId } from '@paralleldrive/cuid2'


import { AppPage } from '@/components/app-page'

import * as Paths from '@/paths'



export default function NewAssessmentPage() {

    const router = useRouter()
    
    React.useEffect(() => {

        const assessmentId = createId()

        setTimeout(() => {
            router.push(Paths.competencies.assessment(assessmentId).edit)
        }, 1000)
    }, [router])

    return <AppPage
        variant="centered"
        label="New Assessment"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Assessments", href: Paths.competencies.assessmentList },
        ]}
    >
        <div>
            <div>Creating New Assessment</div>
        </div>

    </AppPage>
}