import { CustomField, DateString, ResourceId } from "./common"

export interface D4hMember {
    id: number
    resourceType: 'Member'
    
    alertActivityApproval: boolean
    alertAllQualifications: boolean
    alertGear: boolean
    alertQualifications: boolean
    chatAutosubscribe: boolean
    chatDailyDigest: boolean
    contactUpdateMail: boolean
    costPerHour: number
    costPerUse: number
    countReportingEvent: number
    countReportingExercise: number
    countReportingHours: number
    countReportingIncident: number
    countRollingHours: number
    countRollingHoursEvent: number
    countRollingHoursExercise: number
    countRollingHoursIncident: number
    createdAt: DateString
    credits: number
    customFields: Record<string, CustomField>
    customStatus: ResourceId<'CustomMemberStatus'>
    defaultDuty: 'ON' | 'OFF'
    defaultEquipmentLocation: ResourceId<'MemberLocation'>
    email: {
        value: string
        verified: boolean
    }
    endsAt: DateString
    home: {
        phone: string
        verified: boolean
    }
    idTag: string,
    startsAt: DateString
    lastLogin: DateString
    location: {
        type: 'Point',
        coordinates: [number, number]
    },
    locationBookmark: ResourceId<'LocationBookmark'>
    mobile: {
        phone: string
        verified: boolean
    }
    name: string
    notes: string
    pager: {
        phone: string
        email: string
    }
    percReportingEvent: number
    percReportingExercise: number
    percReportingIncident: number
    percRollingEvent: number
    percRollingExercise: number
    percRollingIncident: number
    permission: number
    position: string
    primaryEmergencyContact: EmergencyContact
    ref: string
    retiredReason: ResourceId<'RetiredReason'>
    role: ResourceId<'Role'>
    secondaryEmergencyContact: EmergencyContact
    signedTandC: DateString | null
    status: MemberStatusType
    teamAgreementSigned: string | null
    owner: ResourceId<'Team'>
    updatedAt: string
    weeklyDayOfWeek: number
    weeklyDayOfWeekUtc: number
    weeklyHourOfDay: number
    weeklyHourOfDayUtc: number
    weeklyMail: true
    work: {
        phone: string
    }
}

export interface EmergencyContact {
    name: string
    primaryPhone: string
    secondaryPhone: string
    relation: string
}

export type MemberStatusType = 'OPERATIONAL' | 'NON_OPERATIONAL' | 'OBSERVER' | 'RETIRED'