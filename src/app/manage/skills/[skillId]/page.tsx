import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'

export default async function SkillPage({ params }: { params: { skillId: string }}) {
    return <NotImplemented 
        label={`Skill (${params.skillId})`}
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skills", href: Paths.skills }]}
    />
}