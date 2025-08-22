/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'




export function CompetencyRecorder_Session_Recent({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: assessees } = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const { data: skills } = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))
    const { data: checks } = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId, assessorId: 'me' }))

    if (checks.length === 0) return null

    const recentChecks = checks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return <div>
        <div className="font-semibold mb-2">You recorded:</div>
        <ul className="pl-4 text-sm">{recentChecks.map(check => {
            const assessee = assessees.find(a => a.personId === check.assesseeId)
            const skill = skills.find(s => s.skillId === check.skillId)

            return <li key={check.skillCheckId} className="flex items-center gap-2">
                <span>{assessee?.name}</span> - <span>{skill?.name}</span> <span>{check.passed ? <CheckIcon className="size-5 text-green-500"/> : <XIcon className="size-5 text-red-500"/>}</span>
                <span className="text-muted-foreground pl-2">{formatDistanceToNow(check.timestamp, { addSuffix: true })}</span>
            </li>
        })}</ul>

    </div>
}