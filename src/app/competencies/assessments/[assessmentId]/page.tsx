import { NotImplemented } from '@/components/errors'

import * as Paths from '@/paths'

export default function AssessmentInfoPage({ params}: { params: { assessmentId: string }}) {

    return <NotImplemented
        label={params.assessmentId}
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies }, 
            { label: "Assessments", href: Paths.competencyAssessments },
        ]}
    />
}