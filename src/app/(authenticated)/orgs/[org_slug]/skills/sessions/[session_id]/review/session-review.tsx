/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQueries } from '@tanstack/react-query'

import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'


export function SkillsModule_SessionReview_Card({ organization,session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const [
        { data: assignedAssessees },
        { data: distinctAssessees },
        { data: distinctAssessors },
        { data: distinctSkills },
        { data: checks },
    ] = useSuspenseQueries({
        queries: [
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionDistinctAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionDistinctAssessors.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionDistinctSkills.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
        ]
    })

    // Find any assessees that were assigned to the session but have no recorded checks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unusedAssessees = assignedAssessees.filter(a => !distinctAssessees.some(d => d.personId === a.personId))



    return <Card>
        <CardHeader>
            <CardTitle>Review recorded checks...</CardTitle>
            <CardActions>
                <Separator orientation="vertical"/>
                <CardExplanation>
                    After recording a skill check session, you can review the recorded checks here before committing them to the team&apos;s skill check history.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <ul>
                {distinctAssessees.map(assessee => {
                    const assesseeChecks = checks.filter(c => c.assesseeId === assessee.personId)
                    return <li key={assessee.personId}>
                        <div className="font-semibold py-2">{assessee.name}</div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell>Skill</TableHeadCell>
                                    <TableHeadCell>Assessor</TableHeadCell>
                                    <TableHeadCell>Result</TableHeadCell>
                                    <TableHeadCell>Accept</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assesseeChecks.map(check => {
                                    const assessor = distinctAssessors.find(a => a.personId === check.assessorId)
                                    const skill = distinctSkills.find(s => s.skillId === check.skillId)

                                    return <TableRow key={check.skillCheckId}>
                                        <TableCell>{skill?.name}</TableCell>
                                        <TableCell>{assessor?.name}</TableCell>
                                        <TableCell>{CompetenceLevelTerms[check.result as CompetenceLevel]}</TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </li>
                })}
            </ul>
        </CardContent>
    </Card>
}