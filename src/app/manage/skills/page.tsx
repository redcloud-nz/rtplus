import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function SkillsPage() {
    return <NotImplemented 
        label="Skills"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    />
}