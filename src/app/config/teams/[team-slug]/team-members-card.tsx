/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



interface TeamMembersCardProps {
    teamSlug: string
}


export function TeamMembersCard({ teamSlug }: TeamMembersCardProps) {
    const teamMembershipsQuery = trpc.teams.membersBySlug.useQuery({slug: teamSlug })

    return <Card loading={teamMembershipsQuery.isLoading}>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <Button variant="ghost"><PlusIcon/></Button>
        </CardHeader>
        <CardContent>
            { teamMembershipsQuery.isSuccess ? <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Position</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teamMembershipsQuery.data.map(membership =>
                         <TableRow key={membership.id}>
                            <TableCell>
                                <Link href={Paths.config.personnel.person(membership.person.id).index}>{membership.person.name}</Link>
                            </TableCell>
                            <TableCell>{membership.d4hInfo?.position}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table> : null}
        </CardContent>
    </Card>
}