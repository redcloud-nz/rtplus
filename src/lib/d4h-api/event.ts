
import * as DF from 'date-fns'

import { D4hAccessKey } from '@prisma/client'

import { D4hFetchClient, D4hListResponse } from './client'
import { D4hPoint, DateString, ResourceId } from './common'
import { QueryKey } from '@tanstack/react-query'


export interface D4hEvent {
    id: number
    resourceType: 'Event'

    approved: boolean
    bearing: unknown
    coordinator: unknown
    countAttendance: number
    countGuests: number
    createdAt: DateString
    createdOrPublishedAt: DateString
    deletedAt: DateString | null
    desription: string
    distance: number
    endsAt: number
    fullTeam: boolean
    location: D4hPoint
    locationBookmark: ResourceId<'LocationBookmark'>
    night: boolean
    owner: ResourceId<'Team'>
    percAttendance: number
    plan: string
    published: boolean
    reference: string
    referenceDescription: string
    selfCoordinator: boolean
    shared: boolean
    startsAt: DateString
    tags: ResourceId<'Tag'>[]
    trackingNumber: string
    updatedAt: DateString
    weather: D4hEventWeather
}


export interface D4hAddress {
    postCode: string
    region: string
    street: string
    town: string
    country: string
}


export interface D4hEventWeather {
    symbol: string
    symbolDate: DateString
    temperature: number
}

export interface FetchEventsQueryOptions {
    queryFn: () => Promise<D4hListResponse<D4hEvent>>
    queryKey: QueryKey
}

type ParamOptions = { refDate: Date, scope: 'future' | 'year' | 'month' }

export function getFetchEventsQueryOptions(accessKey: D4hAccessKey, eventType: 'event' | 'exercise' | 'incident', options: ParamOptions): FetchEventsQueryOptions {

    let queryParams: { after?: string, before?: string } = {}
    if(options.scope == 'future') {
        queryParams = { after: DF.startOfDay(options.refDate).toISOString() }
    } else if(options.scope == 'year') {
        queryParams = {
            after: DF.subDays(DF.startOfYear(options.refDate), 7).toISOString(),
            before: DF.addDays(DF.endOfYear(options.refDate), 7).toISOString()
        }
    } else if(options.scope == 'month') {
        queryParams = {
            after: DF.subDays(DF.startOfMonth(options.refDate), 7).toISOString(),
            before: DF.addDays(DF.endOfMonth(options.refDate), 7).toISOString()
        }
    }

    const params = {
        path: { context: 'team', contextId: accessKey.teamId },
        query: queryParams
    } as const

    const headers = { Authorization: `Bearer ${accessKey.key}` } as const

    if(eventType == 'event') {
        return {
            queryFn: async () => {
                const { data, error } = await D4hFetchClient.GET('/v3/{context}/{contextId}/events', { params, headers })
                if(error) throw error
                return data as D4hListResponse<D4hEvent>
            },
            queryKey: ['teams', accessKey.teamId, 'events', queryParams]
        }
    } else if(eventType == 'exercise') {
        return {
            queryFn: async () => {
                const { data, error } = await D4hFetchClient.GET('/v3/{context}/{contextId}/exercises', { params, headers })
                if(error) throw error
                return data as D4hListResponse<D4hEvent>
            },
            queryKey: ['teams', accessKey.teamId, 'exercises', queryParams]
        }
    } else {
        return {
            queryFn: async () => {
                const { data, error } = await D4hFetchClient.GET('/v3/{context}/{contextId}/incidents', { params, headers })
                if(error) throw error
                return data as D4hListResponse<D4hEvent>
            },
            queryKey: ['teams', accessKey.teamId, 'incidents', queryParams]
        }
    }

    
}