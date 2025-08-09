/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatISO } from 'date-fns'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Separator } from '@/components/ui/separator'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useTRPC } from '@/trpc/client'



export function Session_Details_Card({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    
    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Separator orientation="vertical" />
                <CardExplanation>
                    This card displays the details of the skill check session.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <ToruGrid>
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
        </CardContent>
    </Card>    
}
