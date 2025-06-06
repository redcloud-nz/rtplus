/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorValue } from '@/components/ui/color'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Link } from '@/components/ui/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamBasic, useTRPC } from '@/trpc/client'

import { CreateTeamDialog } from './create-team'
import { Separator } from '@/components/ui/separator'




const STATUS_VALUES = ['Active', 'Inactive']


export function TeamsListCard() {
    const [selectedStatuses, setSelectedStatuses] = useState([...STATUS_VALUES])
    
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <CreateTeamDialog
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add team">
                    <PlusIcon />
                </DialogTriggerButton>}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <FunnelIcon/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                    <div className="font-bold text-center">Filters</div>
                    <Separator className="my-2"/>
                    <StatusFilter selected={selectedStatuses} setSelected={setSelectedStatuses} />
                </PopoverContent>
            </Popover>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamsListTable selectedStatuses={selectedStatuses}/>
        </CardBody>
    </Card>
}

function StatusFilter({ selected, setSelected }: { selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>> }) {
    return (
        <div className="flex flex-col gap-2 p-2">
            <Label className="font-semibold">Status</Label>
            {STATUS_VALUES.map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer pl-2">
                    <Checkbox checked={selected.includes(status)} onCheckedChange={() => setSelected(s => s.includes(status) ? s.filter(x => x !== status) : [...s, status])} />
                    <span>{status}</span>
                </label>
            ))}
        </div>
    )
}

export function TeamsListTable({ selectedStatuses }: { selectedStatuses: string[] }) {
    const trpc = useTRPC()

    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())
    const filteredTeams = teams.filter((team: TeamBasic) => selectedStatuses.includes(team.status))

    return <Show
        when={filteredTeams.length > 0}
        fallback={teams.length === 0 
            ? <Alert severity="info" title="No teams defined.">Add a team to get started.</Alert>
            : <Alert severity="info" title="No teams match the selected filters.">Adjust your filters to see more teams.</Alert>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Short Name</TableHeadCell>
                    {/* <TableHeadCell className="text-center">Colour</TableHeadCell> */}
                    <TableHeadCell className='text-center'>Members</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredTeams.map((team) => 
                    <TableRow key={team.id}>
                        <TableCell>
                            <Link href={Paths.system.teams.team(team.id).index} className="hover:underline">{team.name}</Link>
                        </TableCell>
                        <TableCell>{team.shortName}</TableCell>
                        {/* <TableCell className='text-center'>{ team.color ? <ColorValue value={team.color}/> : null }</TableCell> */}
                        <TableCell className='text-center'>{team.memberCount}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}