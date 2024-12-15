
import { OrganizationList } from '@clerk/nextjs'

import { AppPage } from '@/components/app-page'


export default function OrganizationListPage() {
    return <AppPage variant="centered" label="Organization List">
        <OrganizationList/>
    </AppPage>
}