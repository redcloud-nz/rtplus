/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'

import { useSkillPackagesQuery } from '@/lib/api/skills'
import { useTeamsWithMembersQuery } from '@/lib/api/teams'

import { Alert } from '@/components/ui/alert'

import { Show } from '@/components/show'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useSkillCheckStore } from './skill-check-store'


export function TranscriptTabContent() {

    const checks = useSkillCheckStore(state => state.checks)

    const skillPackagesQuery = useSkillPackagesQuery()
    const teamsQuery = useTeamsWithMembersQuery()

    const getAssesseeName = React.useMemo(() => {
        const teamMembers = (teamsQuery.data ?? [])?.flatMap(team => team.teamMemberships)
        return (assesseeId: string) => {
            const member = teamMembers.find(member => member.person.id === assesseeId)
            return member ? member.person.name: assesseeId
        }
    }, [teamsQuery.data])

    const getSkillName = React.useMemo(() => {
        const skills = (skillPackagesQuery.data ?? []).flatMap(pkg => pkg.skills)
        return (skillId: string) => {
            const skill = skills.find(skill => skill.id === skillId)
            return skill ? skill.name : skillId
        }
    }, [skillPackagesQuery.data])

    const filteredChecks = R.pipe(
        checks, 
        R.values(), 
        R.filter(check => check.competenceLevel != 'NotAssessed' || check.notes.length > 0),
        R.sortBy(check => check.timestamp)
    )

    return <>
        { (skillPackagesQuery.isPending || teamsQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { (skillPackagesQuery.isSuccess && teamsQuery.isSuccess) ? <Show 
            when={R.keys(checks).length > 0}
            fallback={<Alert severity="info" title="No checks have been recorded yet."/>}
        >
            <Table border>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Assessee</TableHeadCell>
                        <TableHeadCell>Skill</TableHeadCell>
                        <TableHeadCell>Result</TableHeadCell>
                        <TableHeadCell>Notes</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredChecks.map(check => 
                        <TableRow key={check.id}>
                            <TableCell>{getAssesseeName(check.assesseeId)}</TableCell>
                            <TableCell>{getSkillName(check.skillId)}</TableCell>
                            <TableCell>{check.competenceLevel}</TableCell>
                            <TableCell>{check.notes}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Show> : null }
    </>
}
