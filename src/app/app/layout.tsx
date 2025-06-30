/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Metadata } from 'next'
import { ReactNode } from 'react'

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

export default function AppLayout({ children, dialog }: Readonly<{ children: ReactNode, dialog: ReactNode }>) {

    return <AppFrontendProvider>
        <AppSidebar/>
        {children}
        {dialog}
    </AppFrontendProvider>
}