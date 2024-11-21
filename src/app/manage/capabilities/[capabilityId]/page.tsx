import { NotImplemented } from '@/components/errors'
import * as Paths from '@/paths'

export default async function CapabilityPage({ params }: { params: { capabilityId: string }}) {
    return <NotImplemented 
        label={`Capability (${params.capabilityId})`} 
        breadcrumbs={[{ label: "Manage", href: Paths.manage }, { label: "Capabilities", href: Paths.capabilities }]}
    />
}