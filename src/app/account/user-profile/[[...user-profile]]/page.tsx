/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account/user-profile
 */

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