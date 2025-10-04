/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { DisplayValue } from '@/components/ui/display-value'
import { TextLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { Heading } from '@/components/ui/typography'

import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { TeamData } from '@/lib/schemas/team'
import { formatDate } from '@/lib/utils'
import * as Paths from '@/paths'

export function SkillRecorder_Session_Details({ session, belongsToOwnTeam }: { session: SkillCheckSessionData & { team: TeamData }, belongsToOwnTeam: boolean }) {
    
    return <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 56px)` }}>
        <Heading level={4}>Session Details</Heading>
        <ToruGrid>
            <ToruGridRow 
                label="Session ID" 
                control={<DisplayValue>
                    {belongsToOwnTeam ? <TextLink to={Paths.team(session.team).skills.session(session.sessionId)}>{session.sessionId}</TextLink> : session.sessionId}
                </DisplayValue>
                }
            />
            <ToruGridRow
                label="Team"
                control={<DisplayValue>{session.team.name}</DisplayValue>}
                description="The team to which this session belongs."
            />
            <ToruGridRow 
                label="Name" 
                control={<DisplayValue>{session.name}</DisplayValue>}
            />
            <ToruGridRow 
                label="Date" 
                control={<DisplayValue>{formatDate(session.date)}</DisplayValue>}
            />
            <ToruGridRow 
                label="Status" 
                control={<DisplayValue>{session.sessionStatus}</DisplayValue>}
            />
            <ToruGridFooter/>
        </ToruGrid>
    </ScrollArea>
    
}