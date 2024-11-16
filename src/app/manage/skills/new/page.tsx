import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function NewSkillPage() {
    return <NotImplemented 
        label="New Skill" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Skills", href: Paths.skills }]}
    />
}