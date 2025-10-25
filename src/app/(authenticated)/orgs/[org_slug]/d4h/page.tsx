/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { CardLink, CardLinkList, ExternalLink } from '@/components/ui/link'
import { Heading, Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'

import { D4HAccessTokenCheck_Card } from './d4h-access-token-check'

export const metadata: Metadata = { title: "D4H Integration" }

export default async function D4HModule_Index_Page(props: PageProps<'/orgs/[org_slug]/d4h'>) {
    const { org_slug: orgSlug } = await props.params

    const { userId } = await auth.protect()

    const prefix = Paths.org(orgSlug).d4h

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[prefix]}/>
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>D4H Integration</PageTitle>
            </PageHeader>

            <Paragraph>
                Welcome to the RT+ D4H integration feature. This page provides access to various D4H-related functionalities, including activities, calendar, equipment, and personnel management.
            </Paragraph>

             <Boundary>
                <D4HAccessTokenCheck_Card userId={userId} />
            </Boundary>

            <CardLinkList>
                <CardLink to={prefix.activities}/>
                <CardLink to={prefix.calendar}/>
                <CardLink to={prefix.equipment}/>
                <CardLink to={prefix.personnel}/>
            </CardLinkList>
                

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