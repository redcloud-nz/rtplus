/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { Team as TeamRecord } from '@prisma/client'

type SampleTeam = Omit<TeamRecord, 'orgId'>

const TeamAlpha: SampleTeam = {
    teamId: 'TEAM00A1',
    name: 'Alpha Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamBravo: SampleTeam = {
    teamId: 'TEAM00B1',
    name: 'Bravo Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamCharlie: SampleTeam = {
    teamId: 'TEAM00C1',
    name: 'Charlie Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamDelta: SampleTeam = {
    teamId: 'TEAM00D1',
    name: 'Delta Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamEcho: SampleTeam = {
    teamId: 'TEAM00E1',
    name: 'Echo Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamFoxtrot: SampleTeam = {
    teamId: 'TEAM00F1',
    name: 'Foxtrot Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamGolf: SampleTeam = {
    teamId: 'TEAM00G1',
    name: 'Golf Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamHotel: SampleTeam = {
    teamId: 'TEAM00H1',
    name: 'Hotel Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamIndia: SampleTeam = {
    teamId: 'TEAM00I1',
    name: 'India Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamJuliet: SampleTeam = {
    teamId: 'TEAM00J1',
    name: 'Juliet Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamKilo: SampleTeam = {
    teamId: 'TEAM00K1',
    name: 'Kilo Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamLima: SampleTeam = {
    teamId: 'TEAM00L1',
    name: 'Lima Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamMike: SampleTeam = {
    teamId: 'TEAM00M1',
    name: 'Mike Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamNovember: SampleTeam = {
    teamId: 'TEAM00N1',
    name: 'November Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamOscar: SampleTeam = {
    teamId: 'TEAM00O1',
    name: 'Oscar Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamPapa: SampleTeam = {
    teamId: 'TEAM00P1',
    name: 'Papa Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamQuebec: SampleTeam = {
    teamId: 'TEAM00Q1',
    name: 'Quebec Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamRomeo: SampleTeam = {
    teamId: 'TEAM00R1',
    name: 'Romeo Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}

const TeamSierra: SampleTeam = {
    teamId: 'TEAM00S1',
    name: 'Sierra Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}
const TeamTango: SampleTeam = {
    teamId: 'TEAM00T1',
    name: 'Tango Team',
    color: '#FF0000',
    tags: [],
    properties: {},
    status: 'Active'
}


export const SampleTeams = {
    All: [
        TeamAlpha,
        TeamBravo,
        TeamCharlie,
        TeamDelta,
        TeamEcho,
        TeamFoxtrot,
        TeamGolf,
        TeamHotel,
        TeamIndia,
        TeamJuliet,
        TeamKilo,
        TeamLima,
        TeamMike,
        TeamNovember,
        TeamOscar,
        TeamPapa,
        TeamQuebec,
        TeamRomeo,
        TeamSierra,
        TeamTango,
    ],
    TeamAlpha,
    TeamBravo,
    TeamCharlie,
    TeamDelta,
    TeamEcho,
    TeamFoxtrot,
    TeamGolf,
    TeamHotel,
    TeamIndia,
    TeamJuliet,
    TeamKilo,
    TeamLima,
    TeamMike,
    TeamNovember,
    TeamOscar,
    TeamPapa,
    TeamQuebec,
    TeamRomeo,
    TeamSierra,
    TeamTango,
} as const
