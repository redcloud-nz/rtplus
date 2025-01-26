/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /documentation/competencies
 */
'use client'

import * as React from 'react'

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { EmailLink } from '@/components/ui/link'
import { Heading, Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { Terms } from '../glossary/terms'


export default function CompetenciesDocumentation() {

    const containerRef = React.useRef<HTMLDivElement>(null)

    return <AppPage
        label="Competencies"
        breadcrumbs={[{ label: "Documentation", href: Paths.documentation.index }]}
>
        <PageHeader>
            <PageTitle objectType="Module">Competencies</PageTitle>
        </PageHeader>

        <div className="container max-w-4xl mx-2" ref={containerRef}>
            <section className='mb-8'>
                <Heading level={2}>Introduction</Heading>
                <Paragraph>Competency tracking is an important part of building and maintaining the capabilities of your response team.</Paragraph>

                <Paragraph>This module is designed to help you track the competencies of your team members and report on their progress.</Paragraph>
            </section>

            <section className="mb-8">
                <Heading level={2}>Key Terms</Heading>
                <Terms terms={['Assessee', 'Assessor', 'Competency Level', 'Skill', 'Skill Check', 'Skill Check Session', 'Skill Group', 'Skill Package']}/>
            </section>

            <section className="mb-8">
                <Heading level={2}>Conceptual Mode</Heading>
                <Paragraph>This app uses a series of models (persisted as database tables):</Paragraph>
                <ul className="list-disc ml-8 mt-2">
                    <li>Person - <span className="text-muted-foreground">An individual person.</span></li>
                    <li>Team</li>
                    <li>Team Membership - <span className="text-muted-foreground">A person can belong to multiple teams.</span></li>
                    <li>Capability - <span className="text-muted-foreground">Generally equivalent to an NZ-RT strand.</span></li>
                    <li>Skill Group - <span className="text-muted-foreground">A grouping of skills within a capability.</span></li>
                    <li>Skill - <span className="text-muted-foreground">An individual skill for which a persons competency can be assesed.</span></li>
                    <li>Competency Assessment - <span className="text-muted-foreground">An assessment (by 1 assessor) of 1 or more personnel for 1 or more skills on a specific date. Holds a collection of skill checks.</span></li>
                    <li>Skill Check - <span className="text-muted-foreground">A check (by an assessor) of 1 persons competency at 1 skill.</span></li>
                </ul>
            </section>
            
            <section className="mb-8">
                <Heading level={2}>Recording</Heading>
                <Paragraph>Skill Checks are recorded using &lsquo;Skill Check Sessions&rsquo;.</Paragraph>

               
            </section>
            <section className="mb-8">
                <Heading level={2}>Authentication and Persistence</Heading>
                <Paragraph>
                    Currently any data you enter is only persisted in your browser localStorage. This allows us to provide this demonstration without requiring authentication.
                    Eventually it will be moved within the RT+ auth system and assessors will need to log in to conduct assessments.
                </Paragraph>
            </section>
            <section className="mb-8">
                <Heading level={2}>Feedback / Suggestions</Heading>
                <Paragraph>Please provide feedback to: <EmailLink email="alexwestphal.nz@gmail.com"/></Paragraph>
            </section>
        </div>

        
    </AppPage>
}