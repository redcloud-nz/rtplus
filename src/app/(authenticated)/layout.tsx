/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppFrontendProvider } from '@/components/app-frontend-provider'


export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: "%s | RT+",
        default: "App",
    },
    description: "RT+ Web Application.",
}

export default function Authenticated_Layout({ children }: { children: ReactNode }) {

    return <AppFrontendProvider>
        {children}
    </AppFrontendProvider>
}
