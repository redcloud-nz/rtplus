/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppFrontendProvider } from '@/components/app-frontend-provider'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavTeamSection } from '@/components/nav/nav-team-section'


export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: "%s | RT+",
        default: "App",
    },
    description: "RT+ Web Application.",
}

export default async function SignedIn_Layout({ children }: Readonly<{ children: ReactNode }>) {

    return <AppFrontendProvider>
        <AppSidebar>
            <NavTeamSection/>
        </AppSidebar>
        {children}
    </AppFrontendProvider>
}