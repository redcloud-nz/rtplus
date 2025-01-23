/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import * as React from 'react'
import * as R from 'remeda'

import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { cn } from '@/lib/utils'


export interface GlossaryTerm {
    term: keyof typeof rawGlossary
    definition: string
}

const rawGlossary = {
    'API': {
        definition: "An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate with each other."
    },
    'Assessee': {
        definition: "An assessee is a person who is being evaluated for their competence in a particular skill."
    },
    'Assessor': {
        definition: "An assessor is a person who evaluates the competence of another person in a particular skill."
    },
    'Competency Level': {
        definition: "Competency level is a measure of a person's competence in a particular skill. We use a 4 step scale: 'Not Taught', 'Not Competent', 'Competent', and 'Highly Confident'.",
    },
    'D4H': {
        definition: "D4H is a software platform that provides emergency response teams with tools for managing incidents, training, and equipment."
    },
    'D4H API Key': {
        definition: "A D4H API key is a unique identifier that allows the RT+ system to access the D4H API."
    },
    'ISO 8601 Date': {
        definition: "An ISO 8601 date is a unambiguous date and time format that is internationally recognized. It is in the format 'YYYY-MM-DDTHH:MM:SSZ'."
    },
    'ISO 8601 Duration': {
        definition: "An ISO 8601 duration is a time interval format that is internationally recognized. It is in the format 'PnYnMnDTnHnMnS'."
    },
    'Person': {
        definition: 'A person is an individual unique human being.'
    },
    'Skill':{ 
        definition: 'A skill is the ability to perform a task with a certain level of proficiency. Skills can be learned and improved over time.'
    },
    'Skill Check': {
        definition: "A skill check is a test that evaluates a person\'s proficiency in a particular skill."
    },
    'Skill Check Session': {
        definition: "A skill check session is a construct to stream line the recording of multiple skill checks. It is a collection of skill checks for a group of assessee's on a particular date."
    },
    'Skill Group': {
        definition: `A skill group is a collection of related skills. For example, the skill group "Knots and Lines" contains the skills "Single Figure 8", "Alpine Butterfly", and "Munter Hitch".`
    },
    'Skill Package': {
        definition: "A skill package is a collection of skill groups. For example, the skill package 'Basic Climbing' contains the skill groups 'Knots and Lines', 'Belaying', and 'Climbing Technique'."
    },
    'Slug': {
        definition: "A slug is a URL-friendly version of a string. It is typically used in URLs to identify a resource."
    },
    'Team': {
        definition: "A team is a group of people who work together to achieve a common goal."
    },
    'Timestamp': {
        definition: 'A timestamp is a record of the date and time when an event occurred. Stored in UTC.'
    },
    'Transcript': {
        definition: "A transcript is a record of a person's competency assessments over time."
    },
    'UTC': { 
        definition: "Coordinated Universal Time (UTC) is the primary time standard by which the world regulates clocks and time. It is within about 1 second of mean solar time at 0° longitude."
    },
    'UUID': {
        definition: "A universally unique identifier (UUID) is a 128-bit number used by RT+ to uniquely identify records."
    }
} as const


export const glossary = R.entries(rawGlossary).map(([term, details]) => ({ term, ...details })) as GlossaryTerm[]

type TermsProps = React.ComponentPropsWithRef<'dl'> & {
    terms?: (keyof typeof rawGlossary)[]
    query?: string
}

export function Terms({ className, terms, query, ...props }: TermsProps) {

    const includedTerms = terms ? glossary.filter(({ term }) => terms.includes(term)) : glossary
    const filteredTerms = includedTerms.filter(({ term }) => !query || term.toLowerCase().includes(query.toLowerCase()))

    return <DL className={cn("mx-4", className)} {...props}>
        {filteredTerms.map(({ term, definition }) => (
            <React.Fragment key={term}>
                <DLTerm>{term}</DLTerm>
                <DLDetails>{definition}</DLDetails>
            </React.Fragment>
        ))}
    </DL>
}