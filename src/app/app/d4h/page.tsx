/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/d4h
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { BasicDashboardCard, BasicDashboardCardList } from '@/components/ui/dashboard-card'
import { ExternalLink } from '@/components/ui/link'
import { Heading, Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'

import { D4HAccessTokenCheck_Card } from './d4h-access-token-check'




const pages: { _label: string, index: string, bgColor: string }[] = [
    { ...Paths.d4h.activities, bgColor: 'bg-teal-400' },
    { ...Paths.d4h.calendar, bgColor: 'bg-yellow-400' },
    { ...Paths.d4h.equipment, bgColor: 'bg-red-400' },
    { ...Paths.d4h.personnel, bgColor: 'bg-blue-400' },
]

export const metadata: Metadata = { title: "D4H Integration" }

export default async function D4HIndex_Page() {

    const { sessionClaims: { rt_person_id: personId } } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.d4h,
        ]}/>
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>D4H Integration</PageTitle>
            </PageHeader>

            <Paragraph>
                Welcome to the RT+ D4H integration feature. This page provides access to various D4H-related functionalities, including activities, calendar, equipment, and personnel management.
            </Paragraph>

             <Boundary>
                <D4HAccessTokenCheck_Card personId={personId} />
            </Boundary>

            <BasicDashboardCardList>
                {pages.map((page) => (
                    <BasicDashboardCard
                        key={page.index}
                        label={page._label}
                        href={page.index}
                        bgColor={page.bgColor}
                    />
                ))}
            </BasicDashboardCardList>
                

            <Heading level={2} className="mt-4">Security</Heading>
            <Paragraph>
                RT+ currently uses Personal Access Tokens to access the D4H API. We store the access token on your device and it all communication is done through the browser. This means that your access token is never sent to our servers.
            </Paragraph>

            <Heading level={2} className="mt-4">Ideas</Heading>
            <Paragraph>
                If you have ideas for how we can improve the D4H integration, please let us know by emailing <ExternalLink href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</ExternalLink> or submitting a feature request on our <ExternalLink href="https://github.com/redcloud-nz/rtplus/issues">GitHub</ExternalLink> page.
            </Paragraph>
        </AppPageContent>
        
    </AppPage>
}