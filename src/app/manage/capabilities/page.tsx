import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function CapabilitiesListPage() {
    return <NotImplemented 
        label="Capabilities" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    />
}