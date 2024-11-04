import { D4hPoint, DateString, ResourceId } from './common'

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