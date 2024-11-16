import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function SkillGroupsPage() {
    return <NotImplemented 
        label="Skill Groups"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    />
}