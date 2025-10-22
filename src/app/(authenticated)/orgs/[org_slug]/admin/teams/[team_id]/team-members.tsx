/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { Protect } from '@clerk/nextjs'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { PersonPicker } from '@/components/controls/person-picker'
import { Button, DeleteConfirmButton, RefreshButton } from '@/components/ui/button'
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
import { PersonId, PersonRef } from '@/lib/schemas/person'
import { TeamId } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


/**
 * Card that display the list of team members for a specific team.
 * It allows adding, editing, and deleting team members.
 * @param teamId The ID of the team for which to display members.
 */
export function AdminModule_Team_Members({ orgSlug, teamId }: { orgSlug: string, teamId: TeamId }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const teamMembersQuery = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId }))

    async function handleRefresh() {
        await teamMembersQuery.refetch()
    }

    // Mutations for CRUD operations
    const createMutation = useMutation(trpc.teamMemberships.createTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId }))
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

    const updateMutation = useMutation(trpc.teamMemberships.updateTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId }))
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

    const deleteMutation = useMutation(trpc.teamMemberships.deleteTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId }))
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

    const columns = useMemo(() => defineColumns<TeamMembershipData & { person: PersonRef }>(columnHelper => [
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
                    const existingMemberIds = teamMembersQuery.data.map(m => m.person.personId)
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
                    <TextLink to={Paths.adminModule(orgSlug).team(teamId).member(ctx.row.original.person.personId)}>{ctx.getValue()}</TextLink>
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
                <Protect role="org:admin">
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
                            <DeleteConfirmButton onDelete={() => ctx.row.delete()}/>
                        
                        </>)
                        .exhaustive()
                    }
                </Protect>
                
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
    ]), [teamMembersQuery.data, teamId])


    const table = useReactTable<TeamMembershipData & { person: PersonRef }>({
        _features: [EditableFeature()],
        columns,
        data: teamMembersQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.personId,
        createEmptyRow: () => ({
            personId: '' as PersonId,
            teamId,
            properties: {},
            status: 'Active',
            tags: [],
            person: {
                personId: '' as PersonId,
                name: '',
                email: '',
                status: 'Active',
            }
        }),
        onUpdate: (rowData) => {
            updateMutation.mutate(rowData)
        },
        onCreate: (rowData) => {
            createMutation.mutate({ ...rowData, personId: rowData.person.personId }) // Ensure personId is set correctly
        },
        onDelete: (rowData) => {
            deleteMutation.mutate({ teamId: teamId, personId: rowData.personId })
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
                    <Protect role="org:admin">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => table.startCreating()}>
                                    <PlusIcon/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add a new team member</TooltipContent>
                        </Tooltip>
                    </Protect>
                    <RefreshButton onClick={handleRefresh}/>
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