/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { DisplayValue } from '@/components/ui/display-value'
import { TextLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { Heading } from '@/components/ui/typography'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { formatDate } from '@/lib/utils'
import * as Paths from '@/paths'

export function SkillRecorder_Session_Details({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    
    return <>
        <Heading level={4}>Session Details</Heading>
        <ToruGrid>
            <ToruGridRow 
                label="Session ID" 
                control={<DisplayValue>
                    <TextLink to={Paths.org(organization.slug).skills.session(session.sessionId)}>{session.sessionId}</TextLink>
                </DisplayValue>
                }
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
    </>
}