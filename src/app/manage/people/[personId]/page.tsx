import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function PersonPage({ params }: { params: { personId: string }}) {
    return <NotImplemented 
        label="Person" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "People", href: Paths.people }]}
    />
}