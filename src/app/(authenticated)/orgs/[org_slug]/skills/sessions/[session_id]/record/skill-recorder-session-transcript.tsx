/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Heading } from '@/components/ui/typography'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'


export function SkillRecorder_Session_Transcript({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const [
        { data: availablePackages }, 
        { data: assignedAssessees }, 
        { data: checks },
    ] = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId, assessorId: 'me' }),
        ],
    })

    const skills = useMemo(() => availablePackages.flatMap(pkg => pkg.skills), [availablePackages])

    return <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 56px)` }}>
        <Heading level={4}>You have recorded:</Heading>
        <ul>
            {assignedAssessees.map(assessee => {
                const assesseeChecks = checks
                    .filter(c => c.assesseeId === assessee.personId)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                return <li key={assessee.personId}>
                    <div className="font-semibold py-2">{assessee.name}</div>

                    <Show 
                        when={assesseeChecks.length > 0}
                        fallback={<div className="text-muted-foreground">You have not recorded any checks for {assessee.name} in this session.</div>}
                    >
                        <ul className="pl-4 list-disc space-y-1">
                            {assesseeChecks.map(check => {
                                const skill = skills.find(s => s.skillId === check.skillId)

                                return <li key={check.skillCheckId} className="flex items-center gap-2">
                                    <span>{skill?.name}</span> <span>{check.passed ? <CheckIcon className="size-5 text-green-500"/> : <XIcon className="size-5 text-red-500"/>}</span>
                                    <span className="text-muted-foreground pl-2">{formatDistanceToNow(check.timestamp, { addSuffix: true })}</span>
                                </li>
                            })}
                        </ul>
                    </Show>
                </li>
            })}
        </ul>
    </ScrollArea>
}