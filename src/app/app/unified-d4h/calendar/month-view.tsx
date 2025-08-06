/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as DF from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'

import { D4hAccessTokens } from '@/lib/d4h-access-tokens'
import { D4hClient } from '@/lib/d4h-api/client'
import { D4hEvent } from '@/lib/d4h-api/event'
import { cn } from '@/lib/utils'




export function MonthView() {
    const { data: accessTokens } = useSuspenseQuery(D4hAccessTokens.queryOptions())

    //const d4hTeams = useMemo(() => extractUniqueTeams(accessTokens), [accessTokens])
    //const teamNameMap = useMemo(() => mapToObj(d4hTeams, ({ team }) => [team.id, team.name]), [d4hTeams])

    const [month, setMonth] = useState<Date>(DF.startOfMonth(new Date()))

    const eventsQuery = useSuspenseQueries({
        queries: accessTokens.flatMap(accessKey => 
            accessKey.teams.flatMap(team => [
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'events', scope: 'month', refDate: month }),
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'exercises', scope: 'month', refDate: month }),
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'incidents', scope: 'month', refDate: month })
            ])
        ),
        combine: (queryResults) => ({
            refetch: () => Promise.all(queryResults.map(qr => qr.refetch())),
            data: queryResults.flatMap(qr => qr.data.results),
        })
    })

    // The number of days displayed is normally 35 (5 rows of 7) except Feburary of a non-leap year that starts on a Monday
    const visibleDays = (DF.getDaysInMonth(month) == 28 && DF.getDay(month) == 1) ? 28 : 35
    const offset = (DF.getDay(month) + 6) % 7

    const days: Date[] = new Array(visibleDays)
    for(let i=0; i<visibleDays; i++) {
        days[i] = DF.addDays(month, i-offset)
    }

    return <div className="grid grid-cols-7 grid-rows-[auto_1fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-full flex items-center gap-4 border-b p-2">
            <Button variant="outline" onClick={() => setMonth(DF.startOfMonth(new Date()))}>Today</Button>
            <div className='flex items-center'>
                <Button 
                    variant="ghost"
                    onClick={() => setMonth(DF.subMonths(month, 1))}
                >
                    <ChevronLeftIcon/>
                </Button>
                <div className="text-lg">{DF.format(month, 'MMMM yyyy')}</div>
                <Button 
                    variant="ghost" 
                    onClick={() => setMonth(DF.addMonths(month, 1))}
                >
                    <ChevronRightIcon/>
                </Button>
            </div>
        </div>
        {days.map((day, index) => {
            const dayEvents = eventsQuery.data.filter(event => DF.isSameDay(new Date(event.startsAt), day))

            return <MonthDayCell 
                key={index} 
                day={day} 
                showDayName={index < 7}
                refDate={month}
                >
                    {dayEvents.map(dayEvent => 
                        <MonthViewEvent key={dayEvent.id} event={dayEvent}/>
                    )}
                </MonthDayCell>
        })}
    </div>
}

interface MonthDayCellProps {
    day: Date
    refDate: Date
    showDayName?: boolean
    children?: React.ReactNode
   
}

function MonthDayCell({ day, refDate, showDayName, children }: MonthDayCellProps) {

    return <div className="border-r border-b p-1">
        {showDayName && <div className="text-xs/4 text-center font-semibold text-zinc-600 pt-1">{DF.format(day, 'EEE')}</div>}
        {<div className={cn(
            'text-xs/4 flex justify-center font-semibold p-1',
            DF.isSameMonth(day, refDate) ? 'text-zinc-600' : 'text-zinc-400',
            
        )}>
            <div className={cn('w-5 h-5 rounded-full text-center py-0.5', DF.isToday(day) && 'bg-blue-500 text-white')}>
                {DF.getDate(day)}
            </div>
            {DF.isFirstDayOfMonth(day) && <div className="py-0.5">{DF.format(day, 'MMM')}</div>}
        </div>}
        <div className="flex flex-col gap-0.5">{children}</div>
    </div>
}



interface MonthViewEventProps {
    event: D4hEvent
}

function MonthViewEvent({ event }: MonthViewEventProps) {
    const startsAt = new Date(event.startsAt)

    return <div className={cn(
        'text-xs/4 text-nowrap truncate p-1 rounded-sm',
        event.owner.id == 5 && 'bg-blue-400',
        event.owner.id == 6 && 'bg-red-400',
        event.owner.id == 7 && 'bg-green-400',
    )}>
        <span className="mr-1.5 hidden md:inline-block">{DF.format(startsAt, 'HH:mm')}</span>
        <span className="font-semibold">{event.referenceDescription}</span>
    </div>
}