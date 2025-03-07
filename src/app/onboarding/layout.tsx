/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { redirect } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'

export default async function OnboardingLayout({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) {
    const { sessionClaims } = await auth()

    if( sessionClaims?.rt_onboarding_status == 'Complete') {
        redirect('/')
    }

    return <>
        {children}
        {modal}
    </>
}