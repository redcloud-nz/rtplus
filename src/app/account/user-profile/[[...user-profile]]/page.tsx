
import { UserProfile } from '@clerk/nextjs'

import { AppPage } from '@/components/app-page'

import * as Paths from '@/paths'

export default function UserProfilePage() {

    return <AppPage variant="centered" label="User Profile">
        <UserProfile
            path={Paths.account.profile}
        />
    </AppPage>
}