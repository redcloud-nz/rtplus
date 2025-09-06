/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { ArrowRightIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function GoToRecorder({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: currentPerson } = useSuspenseQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: assessors } = useSuspenseQuery(trpc.skillChecks.getSessionAssessors.queryOptions({ sessionId }))

    const isAssessor = assessors.some(a => a.personId === currentPerson.personId)

    return <Tooltip>
        <TooltipTrigger asChild>
            {isAssessor
                ? <Button asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId)}>
                        Recorder <ArrowRightIcon/>
                    </Link>
                </Button>
                : <Button disabled>Recorder <ArrowRightIcon/></Button>
            }
        </TooltipTrigger>
        <TooltipContent>
            {isAssessor ? 'Go to the competency recorder for this session.' : 'You are not an assessor for this session'}
        </TooltipContent>
    </Tooltip>
}