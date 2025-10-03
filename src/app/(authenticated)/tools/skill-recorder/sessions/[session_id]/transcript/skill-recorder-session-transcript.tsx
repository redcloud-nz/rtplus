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
import { Alert } from '@/components/ui/alert'

import { trpc } from '@/trpc/client'



export function SkillRecorder_Session_Transcript_Content({ sessionId }: { sessionId: string }) {

    const [
        { data: availablePackages }, 
        { data: assignedAssessees }, 
        { data: checks },
    ] = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions(),
            trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ sessionId, assessorId: 'me' }),
        ],
    })

    const skills = useMemo(() => availablePackages.flatMap(pkg => pkg.skills), [availablePackages])

    const recentChecks = checks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return <div>
        <Show 
            when={checks.length > 0}
            fallback={<Alert severity="info" title="No Checks recorded.">You have not recorded any checks in this session.</Alert>}
        >
            <div className="font-semibold p-2">You recorded:</div>
            <ul className="pl-4 text-sm">{recentChecks.map(check => {
                const assessee = assignedAssessees.find(a => a.personId === check.assesseeId)
                const skill = skills.find(s => s.skillId === check.skillId)

                return <li key={check.skillCheckId} className="flex items-center gap-2">
                    <span>{assessee?.name}</span> - <span>{skill?.name}</span> <span>{check.passed ? <CheckIcon className="size-5 text-green-500"/> : <XIcon className="size-5 text-red-500"/>}</span>
                    <span className="text-muted-foreground pl-2">{formatDistanceToNow(check.timestamp, { addSuffix: true })}</span>
                </li>
            })}</ul>
        </Show>
    </div>
}