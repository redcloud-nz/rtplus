import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function SkillGroupPage({ params }: { params: { skillGroupId: string }}) {
    return <NotImplemented 
        label="Skill Group" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skill Groups", href: Paths.skillGroups }]}
    />
}