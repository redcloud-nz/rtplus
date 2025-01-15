/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies
 */

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { EmailLink, Link } from '@/components/ui/link'
import { Heading, Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'

export default async function CompetenciesDashboard() {
    return <AppPage
        label="Competencies"
    >
        <PageHeader>
            <PageTitle>Competencies Dashboard</PageTitle>
        </PageHeader>

        <div className="flex gap-2">
            <Link 
                className="w-40 border rounded-md p-2 text-center font-semibold hover:bg-slate-100"
                href={Paths.competencies.sessionList}
            >Assessments</Link>
            <Link 
                className="w-40 border rounded-md p-2 text-center font-semibold hover:bg-slate-100"
                href={Paths.competencies.reportsList}
            >Reports</Link>
        </div>

        <section className="mb-4">
            <Heading level={2}>Description</Heading>
            <Paragraph>This is a proof of concept app to record and track competencies. All aspects are subject to change without notice.</Paragraph>
        </section>
        <section className="mb-4">
            <Heading level={2}>Conceptual Mode</Heading>
            <Paragraph>This app uses a series of models (persisted as database tables):</Paragraph>
            <ul className="list-disc ml-4 mt-2">
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
        <section className="mb-4">
            <Heading level={2}>Real/Mock Data</Heading>
            <Paragraph>What you see here is a mixture of real and mock data. Note that the connection to D4H is currently read-only.</Paragraph>
            <ul className="list-disc ml-4 mt-2">
                <li>Teams - <span className="text-muted-foreground">Created through the RT+ configuration module.</span></li>
                <li>Personnel - <span className="text-muted-foreground">Imported from D4H through a manually trigged synchronisation process.</span></li>
                <li>Capabilites / Skill Groups / Skills - <span className="text-muted-foreground">Defined in the source code but inserted into the database through a manually trigged synchronisation process.</span></li>
                <li>Competency Assessments / Skill Checks - <span className="text-muted-foreground">Persisted (currently) in your browsers local storage not the database.</span></li>
                <li>Reporting Data - <span className="text-muted-foreground">Completely fake. Consists of random data created at render time so the math isnt even consistent.</span></li>
            </ul>
        </section>
        <section className="mb-4">
            <Heading level={2}>Assessment Interface</Heading>
            <Paragraph>The assessment interface is designed for use on a phone, tablet, or computer. It uses a multi-step process with a navigation interface mostly copied from D4H.</Paragraph>

            <ol className="list-decimal ml-4 mt-2">
                <li>Define the basic parameters (Date, location, etc)</li>
                <li>Select the skills to assess - <span className="text-muted-foreground">The concept being that a given session will only involve a small number of skills and thus pre-selecting them will simplify the interface later.</span></li>
                <li>Select the personnel to assess - <span className="text-muted-foreground">The concept being that a particular assessor will only be assessing a small group of people and therefore pre-selecting them will simplify the interface later.</span></li>
                <li>Assess skills - <span className="text-muted-foreground">Select from the predefined skills and personnel. Record a status and optionally notes for each.</span>
                    <ul className="list-disc ml-4">
                        <li>{`Selecting a person and "All Skills" shows a table of the preselected skills and your assessment (for that person) against each.`}</li>
                        <li>{`Selecting a skill and "All Personnel" shows a table of the preselected personnel and your assessment (for each person) against that skill`}</li>
                    </ul>
                </li>
            </ol>
        </section>
        <section>
            <Heading level={2}>Authentication and Persistence</Heading>
            <Paragraph>
                Currently any data you enter is only persisted in your browser localStorage. This allows us to provide this demonstration without requiring authentication.
                Eventually it will be moved within the RT+ auth system and assessors will need to log in to conduct assessments.
            </Paragraph>
        </section>
        <section>
            <Heading level={2}>Feedback / Suggestions</Heading>
            <Paragraph>Please provide feedback to: <EmailLink email="alexwestphal.nz@gmail.com"/></Paragraph>
        </section>
    </AppPage>
}