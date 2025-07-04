/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ArrowUpDownIcon, EllipsisVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Fragment, useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { CreateSkillDialog } from '@/components/dialogs/create-skill'
import { CreateSkillGroupDialog } from '@/components/dialogs/create-skill-group'
import { DeleteSkillDialog } from '@/components/dialogs/delete-skill'
import { DeleteSkillGroupDialog } from '@/components/dialogs/delete-skill-group'
import { EditSkillDialog } from '@/components/dialogs/edit-skill'
import { EditSkillGroupDialog } from '@/components/dialogs/edit-skill-group'
import { Show } from '@/components/show'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuTriggerButton } from '@/components/ui/dropdown-menu'
import { TextLink } from '@/components/ui/link'

import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { SkillGroup, useTRPC } from '@/trpc/client'



type ActionState = { action: 'CreateGroup' | 'CreateSkill' } | { action: 'EditGroup' | 'DeleteGroup', skillGroupId: string } | { action: 'EditSkill' | 'DeleteSkill', skillId: string } | null
type HandleAction = (args: ActionState) => void

type OptionsState = { showDescription: boolean, showFrequency: boolean, showActive: boolean, showInactive: boolean }

export function SkillPackageGroupsAndSkill_sys({ skillPackageId }: { skillPackageId: string }) {

    const [actionTarget, setActionTarget] = useState<ActionState>(null)
    function handleOpenChange(open: boolean) { if (!open) setActionTarget(null) }

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
                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'CreateGroup' })}><PlusIcon/> New Group</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'CreateSkill' })}><PlusIcon/> New Skill</DropdownMenuItem>
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
            <CardBody boundary collapsible>
                <GroupsAndSkillsTable onAction={setActionTarget} options={options} skillPackageId={skillPackageId}/>
            </CardBody>
            
        </Card>
        {match(actionTarget)
            .with({ action: 'CreateGroup' }, () => 
                <CreateSkillGroupDialog open onOpenChange={handleOpenChange} skillPackageId={skillPackageId}/>
            )
            .with({ action: 'CreateSkill' }, () =>
                <CreateSkillDialog open onOpenChange={handleOpenChange} skillPackageId={skillPackageId}/>
            )
            .with({ action: 'EditGroup' }, ({ skillGroupId }) => 
                <EditSkillGroupDialog open onOpenChange={handleOpenChange} skillGroupId={skillGroupId}/>
            )
            .with({ action: 'DeleteGroup' }, ({ skillGroupId }) => 
                <DeleteSkillGroupDialog open onOpenChange={handleOpenChange} skillGroupId={skillGroupId}/>
            )
            .with({ action: 'EditSkill' }, ({ skillId }) => 
                <EditSkillDialog open onOpenChange={handleOpenChange} skillId={skillId}/>
            )
            .with({ action: 'DeleteSkill' }, ({ skillId }) => 
                <DeleteSkillDialog open onOpenChange={handleOpenChange} skillId={skillId}/>
            )
            .otherwise(() => null)
        }
    </>
}

function GroupsAndSkillsTable({ onAction, options, skillPackageId }: { onAction: HandleAction, options: OptionsState, skillPackageId: string }) {
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
                    <TableHeadCell className='w-10 p-0'></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredGroups.map(group => <Fragment key={group.id}>
                    <GroupRow onAction={onAction} options={options} group={group}/>
                    <SkillRows onAction={onAction} options={options} skillGroupId={group.id}/>
                </Fragment>)}
            </TableBody>
        </Table>
    </Show>
}

function GroupRow({ onAction, options, group }: { onAction: HandleAction, options: OptionsState, group: SkillGroup }) {
    const trpc = useTRPC()

    return <TableRow key={`group-${group.id}`}>
        <TableCell colSpan={2}>
            <TextLink href={Paths.system.skillPackages(group.skillPackageId).groups(group.id).index}>{group.name}</TextLink>
        </TableCell>
        {options.showDescription ? <TableCell className="hidden lg:table-cell">{group.description}</TableCell> : null}
        {options.showFrequency ? <TableCell/> : null}
        {options.showInactive ? <TableCell className="text-center font-semibold">{group.status == 'Active' ? 'Y': 'N'}</TableCell> : null}
        <TableCell className="w-10 p-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><EllipsisVerticalIcon/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-center">Skill Group</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onAction({ action: 'EditGroup', skillGroupId: group.id })}><PencilIcon/> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction({ action: 'DeleteGroup', skillGroupId: group.id })}><TrashIcon/> Delete</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
}

function SkillRows({ onAction, options, skillGroupId }: { onAction: HandleAction, options: OptionsState, skillGroupId: string }) {
    const trpc = useTRPC()
    const { data: skills } = useSuspenseQuery(trpc.skills.bySkillGroupId.queryOptions({ skillGroupId }))

    return skills.map(skill =>
        <TableRow key={skill.id}>
            <TableCell/>
            <TableCell>
                <TextLink href={Paths.system.skillPackages(skill.skillPackageId).skills(skill.id).index}>
                    {skill.name}
                </TextLink>
            </TableCell>
            {options.showDescription ? <TableCell className="hidden lg:table-cell">{skill.description}</TableCell> : null}
            {options.showFrequency ? <TableCell className="max-w-20 text-center">{skill.frequency}</TableCell> : null}
            {options.showInactive ? <TableCell className="text-center font-semibold">{skill.status == 'Active' ? 'Y': 'N'}</TableCell> : null}
            <TableCell className="w-10 p-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><EllipsisVerticalIcon/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-center">Skill</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onAction({ action: 'EditSkill', skillId: skill.id })}><PencilIcon/> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction({ action: 'DeleteSkill', skillId: skill.id })}><TrashIcon/> Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )    
}