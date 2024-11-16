import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function NewPersonPage() {
    return <NotImplemented 
        label="New Person" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "People", href: Paths.people }]}
    />
}