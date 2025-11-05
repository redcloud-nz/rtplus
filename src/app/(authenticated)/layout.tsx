/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Metadata } from 'next'

import { AppFrontendProvider } from '@/components/app-frontend-provider'
import { ControlBar } from '@/components/nav/control-bar'
import { TITLE_SEPARATOR } from '@/lib/utils'

export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: `%s ${TITLE_SEPARATOR} RT+`,
        default: "App",
    },
    description: "RT+ Web Application.",
}

export default function Authenticated_Layout({ children }: LayoutProps<'/'>) {

    return <AppFrontendProvider>
         <ControlBar />
        {children}
    </AppFrontendProvider>
}
