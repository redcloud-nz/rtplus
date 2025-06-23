/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Metadata } from 'next'

import { AppFrontendProvider } from '@/components/app-frontend-provider'
import { AppSidebar } from '@/components/app-sidebar'

export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: "%s | RT+",
        default: "Application",
    },
    description: "RT+ App",
}

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {

    return <AppFrontendProvider>
        <AppSidebar/>
        {children}
    </AppFrontendProvider>
}