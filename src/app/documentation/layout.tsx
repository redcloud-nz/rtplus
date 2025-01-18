/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /documentation
 */

import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'


export const metadata: Metadata = {
    title: "RT+ Competencies",
    description: "RT+ Competency management and tracking",
};

export default async function DocuemntationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppPageContainer>
            {children}
        </AppPageContainer>
    </>
}
