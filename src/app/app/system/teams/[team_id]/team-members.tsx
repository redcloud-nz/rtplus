/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { PersonPicker } from '@/components/controls/person-picker'
import { Button, DeleteConfimButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useToast } from '@/hooks/use-toast'
import { EditableFeature } from '@/lib/editable-feature'
import { PersonData } from '@/lib/schemas/person'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


/**
 * Card that display the list of team members for a specific team.
 * It allows adding, editing, and deleting team members.
 * @param teamId The ID of the team for which to display members.
 */
export function TeamMembersCard({ teamId }: { teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: teamMembers } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    // Mutations for CRUD operations
    const createMutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
            toast({
                title: 'Team member added successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error adding team member',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const updateMutation = useMutation(trpc.teamMemberships.update.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
            toast({
                title: 'Team member updated successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error updating team member',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const deleteMutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
            toast({
                title: 'Team member removed successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error removing team member',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const columns = useMemo(() => defineColumns<TeamMembershipData & { person: PersonData }>(columnHelper => [
        columnHelper.accessor('personId', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('person.name', {
            id: 'name',
            header: 'Name',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', () => {
                    const existingMemberIds = teamMembers.map(m => m.person.personId)
                    return (
                        <PersonPicker
                            size="sm"
                            className="-m-2"
                            value={ctx.row.getModifiedRowData().person.personId}
                            onValueChange={(person) => ctx.row.setModifiedRowData({ person })}
                            placeholder="Select a person"
                            exclude={existingMemberIds}
                        />
                    )
                })
                .otherwise(() => 
                    <TextLink href={Paths.system.team(teamId).member(ctx.row.original.person.personId).index}>{ctx.getValue()}</TextLink>
                )
            ),
            enableGrouping: false,
            enableHiding: false
        }),
        columnHelper.accessor('tags', {
            header: 'Tags',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', 'Update', () => 
                    <TagsInput
                        size="sm"
                        className="-m-2"
                        value={ctx.row.getModifiedRowData().tags}
                        onValueChange={(value) => ctx.row.setModifiedRowData({ tags: value })}
                        placeholder="Add tags"
                    />    
                )
                .otherwise(() => ctx.getValue().join(' '))
                
            ),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: false,
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Status',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', 'Update', () => 
                    <Select
                        value={ctx.row.getModifiedRowData().status}
                        onValueChange={(value) => ctx.row.setModifiedRowData({ status: value as 'Active' | 'Inactive' })}
                    >
                        <SelectTrigger size="sm" className="-m-2">
                            <SelectValue placeholder="Select status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                )
                .otherwise(() => ctx.getValue())
            ),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',
            meta: {
                enumOptions: { Active: 'Active', Inactive: 'Inactive' },
                slotProps: {
                    th: {
                        className: 'w-32'
                    }
                }
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ctx => <div className="-m-2 flex items-center justify-end">
                {match(ctx.row.getEditMode())
                    .with('Create', 'Update', () => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.saveEdit()}>
                            <SaveIcon/>
                            <span className="sr-only">Save</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                            ctx.row.cancelEdit()
                        }}>
                            <XIcon/>
                            <span className="sr-only">Cancel</span>
                        </Button>
                    </>)
                    .with('View', () => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.startEdit()}>
                            <PencilIcon/>
                            <span className="sr-only">Edit</span>
                        </Button>
                        <DeleteConfimButton onDelete={() => ctx.row.delete()}/>
                       
                    </>)
                    .exhaustive()
                }
            </div>,
            enableHiding: false,
            enableSorting: false,
            meta: {
                slotProps: {
                    th: {
                        className: 'w-20'
                    }
                }
            }
        })
    ]), [teamMembers, teamId])


    const table = useReactTable<TeamMembershipData & { person: PersonData }>({
        _features: [EditableFeature()],
        columns,
        data: teamMembers,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.personId,
        createEmptyRow: () => ({
            personId: '',
            teamId,
            status: 'Active' as const,
            tags: [],
            person: {
                personId: '',
                name: '',
                email: '',
                status: 'Active' as const,
                owningTeamId: null
            }
        }),
        onUpdate: (rowData) => {
            updateMutation.mutate(rowData)
        },
        onCreate: (rowData) => {
            createMutation.mutate({ ...rowData, personId: rowData.person.personId }) // Ensure personId is set correctly
        },
        onDelete: (rowData) => {
            deleteMutation.mutate({ teamId, personId: rowData.personId })
        },
        initialState: {
            columnVisibility: {
                personId: false, name: true, tags: true, status: true, actions: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => table.startCreating()}>
                                <PlusIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add a new team member</TooltipContent>
                    </Tooltip>

                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>

                    <CardExplanation>
                        This card displays the members of the team. You can add new members, edit existing ones, or delete them. 
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}