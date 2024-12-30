import { NotImplemented } from '@/components/errors'

import * as Paths from '@/paths'

export default async function AssessmentInfoPage(props: { params: Promise<{ assessmentId: string }>}) {
    const params = await props.params;

    return <NotImplemented
        label={params.assessmentId}
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Assessments", href: Paths.competencies.assessmentList },
        ]}
    />
}