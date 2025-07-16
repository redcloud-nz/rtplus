/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ArrowUpDownIcon, EllipsisVerticalIcon, PlusIcon } from 'lucide-react'
import { Fragment, useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'

import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { SkillGroup, useTRPC } from '@/trpc/client'



type ActionState = { action: 'CreateGroup' | 'CreateSkill' } | { action: 'EditGroup' | 'DeleteGroup', skillGroupId: string } | { action: 'EditSkill' | 'DeleteSkill', skillId: string } | null
type HandleAction = (args: ActionState) => void

type OptionsState = { showDescription: boolean, showFrequency: boolean, showActive: boolean, showInactive: boolean }

export function SkillPackageGroupsAndSkillCard({ skillPackageId }: { skillPackageId: string }) {

    const [options, setOptions] = useState<OptionsState>({ 
        showDescription: true,
        showFrequency: false,
        showActive: true,
        showInactive: false
    })
    function handleOptionChange<K extends keyof OptionsState>(key: K): (value: OptionsState[K]) => void {
        return value => setOptions(prev => ({ ...prev, [key]: value }))
    }

    return <>
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTriggerButton variant="ghost" size="icon" tooltip="New">
                        <PlusIcon/>
                    </DropdownMenuTriggerButton>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.system.skillPackage(skillPackageId).createGroup}>
                                    <PlusIcon className='mr-1'/> New Group
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.system.skillPackage(skillPackageId).createSkill}>
                                    <PlusIcon className='mr-1'/> New Skill
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><EllipsisVerticalIcon/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-center">Skills</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Show</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem 
                                checked={options.showDescription} 
                                onCheckedChange={handleOptionChange('showDescription')}
                            >Description</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                                checked={options.showFrequency} 
                                onCheckedChange={handleOptionChange('showFrequency')}
                            >Frequency</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={options.showActive} 
                                onCheckedChange={handleOptionChange('showActive')}
                            >Active</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                                checked={options.showInactive} 
                                onCheckedChange={handleOptionChange('showInactive')}
                            >Inactive</DropdownMenuCheckboxItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => {}} disabled><ArrowUpDownIcon/> Reorder</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <GroupsAndSkillsTable options={options} skillPackageId={skillPackageId}/>
            </CardContent>
            
        </Card>
    </>
}

function GroupsAndSkillsTable({ options, skillPackageId }: { options: OptionsState, skillPackageId: string }) {
    const trpc = useTRPC()
    const { data: groups } = useSuspenseQuery(trpc.skillGroups.bySkillPackageId.queryOptions({ skillPackageId }))
    
    const filteredGroups = groups.filter(group => 
        group.status == 'Active' ? options.showActive = true : options.showInactive = true
    )

    return <Show
        when={filteredGroups.length > 0}
        fallback={groups.length === 0 
            ? <Alert severity="info" title="No skill groups in package"/>
            : <Alert severity="info" title={`No active ${options.showActive ? 'active' : 'inactive'} groups in package`}/>
        }
    >
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeadCell className="w-15 lg:w-30">Group</TableHeadCell>
                    <TableHeadCell className="">Skill</TableHeadCell>
                    {options.showDescription ? <TableHeadCell className="hidden lg:table-cell">Description</TableHeadCell> : null}
                    {options.showFrequency ? <TableHeadCell className="max-w-20 text-center">Frequency</TableHeadCell> : null}
                    {options.showInactive ? <TableHeadCell className='w-15 text-center'>Active</TableHeadCell> : null}
                    {/* <TableHeadCell className='w-10 p-0'></TableHeadCell> */}
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredGroups.map(group => <Fragment key={group.id}>
                    <GroupRow options={options} group={group}/>
                    <SkillRows options={options} skillGroupId={group.id}/>
                </Fragment>)}
            </TableBody>
        </Table>
    </Show>
}

function GroupRow({ options, group }: { options: OptionsState, group: SkillGroup }) {
    const trpc = useTRPC()

    return <TableRow key={`group-${group.id}`}>
        <TableCell colSpan={2}>
            <TextLink href={Paths.system.skillPackage(group.skillPackageId).group(group.id).index}>{group.name}</TextLink>
        </TableCell>
        {options.showDescription ? <TableCell className="hidden lg:table-cell">{group.description}</TableCell> : null}
        {options.showFrequency ? <TableCell/> : null}
        {options.showInactive ? <TableCell className="text-center font-semibold">{group.status == 'Active' ? 'Y': 'N'}</TableCell> : null}
        {/* <TableCell className="w-10 p-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><EllipsisVerticalIcon/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-center">Skill Group</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    
                    <DropdownMenuGroup>
                        <DropdownMenuItem><PencilIcon/> Edit</DropdownMenuItem>
                        <DropdownMenuItem><TrashIcon/> Delete</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell> */}
    </TableRow>
}

function SkillRows({ options, skillGroupId }: { options: OptionsState, skillGroupId: string }) {
    const trpc = useTRPC()
    const { data: skills } = useSuspenseQuery(trpc.skills.bySkillGroupId.queryOptions({ skillGroupId }))

    return skills.map(skill =>
        <TableRow key={skill.id}>
            <TableCell/>
            <TableCell>
                <TextLink href={Paths.system.skillPackage(skill.skillPackageId).skill(skill.id).index}>
                    {skill.name}
                </TextLink>
            </TableCell>
            {options.showDescription ? <TableCell className="hidden lg:table-cell">{skill.description}</TableCell> : null}
            {options.showFrequency ? <TableCell className="max-w-20 text-center">{skill.frequency}</TableCell> : null}
            {options.showInactive ? <TableCell className="text-center font-semibold">{skill.status == 'Active' ? 'Y': 'N'}</TableCell> : null}
            {/* <TableCell className="w-10 p-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><EllipsisVerticalIcon/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-center">Skill</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem><PencilIcon/> Edit</DropdownMenuItem>
                            <DropdownMenuItem><TrashIcon/> Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell> */}
        </TableRow>
    )    
}