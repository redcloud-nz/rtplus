
import { AppPage } from '@/components/app-page'
import { OrganizationList } from '@clerk/nextjs'

export default function OrganizationListPage() {
    return <AppPage variant="centered" label="Organization List">
        <OrganizationList/>
    </AppPage>
}