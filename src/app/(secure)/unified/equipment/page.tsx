
import { SecurePage } from '@/components/secure-page'


export default async function EquipmentPage() {
    return <SecurePage label="Equipment" breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
    </SecurePage>
}