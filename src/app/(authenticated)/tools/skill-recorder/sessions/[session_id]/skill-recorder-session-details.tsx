/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatISO } from 'date-fns'

import { DisplayValue } from '@/components/ui/display-value'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToruGrid, ToruGridRow } from '@/components/ui/toru-grid'

import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { TeamRef } from '@/lib/schemas/team'



export function SkillRecorder_Session_Details_Content({ scrollable = false, session }: { scrollable?: boolean, session: SkillCheckSessionData & { team: TeamRef } }) {
    
    const content = <ToruGrid>
            <ToruGridRow
                label="Session ID"
                control={<DisplayValue>{session.sessionId}</DisplayValue>}
            />
            <ToruGridRow
                label="Name"
                control={<DisplayValue>{session.name}</DisplayValue>}
            />
            <ToruGridRow
                label="Team"
                control={<DisplayValue>{session.team.name}</DisplayValue>}
            />
            <ToruGridRow
                label="Date"
                control={<DisplayValue>{formatISO(new Date(session.date), { representation: 'date' })}</DisplayValue>}
            />
            <ToruGridRow
                label="Status"
                control={<DisplayValue>{session.sessionStatus}</DisplayValue>}
            />
        </ToruGrid>

    return scrollable ? <ScrollArea style={{ height: `calc(100vh - var(--header-height))` }} className="flex flex-col gap-4 px-2">
            {content}
        </ScrollArea> : content
}
