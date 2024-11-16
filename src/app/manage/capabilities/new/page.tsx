import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function NewCapabilityPage() {
    return <NotImplemented 
        label="New Capability" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Capabilities", href: Paths.capabilities }]}
    />
}