/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /checklists
 */

import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'



export const metadata: Metadata = {
    title: {
        template: "% | Checklists | RT+",
        default: "Checklists | RT+",
    },
    description: "RT+ Checklists",
};

export default async function ChecklistsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppPageContainer>
            {children}
        </AppPageContainer>
    </>
}
