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

import { TeamPicker } from '@/components/controls/team-picker'
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
import { PersonData } from '@/lib/schemas/person'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



/**
 * Card that displays the team memberships for a specific person.
 * It allows adding, editing, and deleting team memberships.
 * @param personId The ID of the person for whom to display team memberships.
 */
export function System_Person_TeamMemberships_Card({ person }: { person: PersonData }) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const teamMembershipsQuery = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ personId: person.personId }))

    async function handleRefresh() {
        await teamMembershipsQuery.refetch()
    }

    // Mutations for CRUD operations
    const createMutation = useMutation(trpc.teamMemberships.createTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ personId: person.personId }))
            toast({
                title: 'Team membership added successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error adding team membership',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const updateMutation = useMutation(trpc.teamMemberships.updateTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ personId: person.personId }))
            toast({
                title: 'Team membership updated successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const deleteMutation = useMutation(trpc.teamMemberships.deleteTeamMembership.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ personId: person.personId }))
            toast({
                title: 'Team membership removed successfully',
                variant: 'default'
            })
        },
        onError: (error) => {
            toast({
                title: 'Error removing team membership',
                description: error.message,
                variant: 'destructive'
            })
        }
    }))

    const columns = useMemo(() => defineColumns<TeamMembershipData & { team: TeamData }>(columnHelper => [
        columnHelper.accessor('teamId', {
            header: 'Team ID',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('team.name', {
            id: 'teamName',
            header: 'Team',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', () => {
                    const existingTeamIds = teamMembershipsQuery.data.map(m => m.teamId)
                    return (
                        <TeamPicker
                            size="sm"
                            className="-m-2"
                            value={ctx.row.getModifiedRowData().team.teamId}
                            onValueChange={(team) => ctx.row.setModifiedRowData({ team })}
                            placeholder="Select a team"
                            exclude={existingTeamIds}
                        />
                    )
                })
                .otherwise(() => 
                    <TextLink to={Paths.system.person(person.personId).teamMembership(ctx.row.original.teamId)}>{ctx.getValue()}</TextLink>
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
            enableGrouping: false,
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
                        <DeleteConfirmButton onDelete={() => ctx.row.delete()}/>
                       
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
    ]), [teamMembershipsQuery.data, person.personId])

    const table = useReactTable<TeamMembershipData & { team: TeamData }>({
        _features: [EditableFeature()],
        columns: columns,
        data: teamMembershipsQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.teamId,
        createEmptyRow: () => ({
            teamId: '',
            personId: person.personId,
            status: 'Active' as const,
            tags: [],
            team: {
                teamId: '',
                name: '',
                shortName: '',
                slug: '',
                color: '',
                status: 'Active' as const,
                type: person.type
            }
        }),
        onUpdate: (rowData) => {
            updateMutation.mutate(rowData)
        },
        onCreate: (rowData) => {
            createMutation.mutate(rowData)
        },
        onDelete: (rowData) => {
            deleteMutation.mutate({ teamId: rowData.teamId, personId: person.personId })
        },
        initialState: {
            columnVisibility: {
                teamId: false, teamName: true, tags: true, status: true, actions: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'teamName', desc: false }
            ],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Team Memberships</CardTitle>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => table.startCreating()}>
                                <PlusIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add a new team membership</TooltipContent>
                    </Tooltip>

                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>

                    <CardExplanation>
                        This card displays all team memberships for the person. You can add, edit, or delete team memberships.
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