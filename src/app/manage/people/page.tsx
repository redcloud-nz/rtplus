import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function PeopleListPage() {
    return <NotImplemented 
        label="People" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    />
}