import { NotImplemented } from '@/components/errors'
import { Paths } from '@/paths'

export default async function CapabilityPage({ params }: { params: { capabilityId: string }}) {
    return <NotImplemented 
        label="Capability" 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Capabilities", href: Paths.capabilities }]}
    />
}