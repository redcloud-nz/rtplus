/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { TeamMembership } from '@prisma/client'

import type { CustomField, DateString,  ResourceId } from './common'



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
    retiredReason: ResourceId<'RetiredReason', number | null>
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

export type BasicD4hMember = Pick<D4hMember, 'id' | 'email' | 'name' | 'owner' | 'position' | 'ref' | 'status' >

export function toTeamMembershipStatus(d4hMemberStatus: D4hMember['status']): TeamMembership['d4hStatus'] {
    const mapping = {
        OPERATIONAL: 'Operational',
        NON_OPERATIONAL: 'NonOperational',
        OBSERVER: 'Observer',
        RETIRED: 'Retired'
    } satisfies Record<MemberStatusType, TeamMembership['d4hStatus']>

    return mapping[d4hMemberStatus]
}