/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { TeamMemberPicker } from '@/components/controls/team-member-picker'
import { Button, DeleteConfirmButton, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { EditableFeature } from '@/lib/editable-feature'
import { PersonData, PersonRef } from '@/lib/schemas/person'
import { useTRPC } from '@/trpc/client'



type RowData = { assesseeId: string, assessee: PersonRef }

/**
 * Card component to display and manage assessees in a skill check session.
 * Allows adding and removing assessees.
 */
export function SkillCheckSession_AssesseesList_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillChecks.getSession.queryOptions({ sessionId }))
    const teamMembersQuery = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId: session.teamId }))
    const assignedAssesseesQuery = useSuspenseQuery(trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId }))

    async function handleRefresh() {
        assignedAssesseesQuery.refetch()
    }

    const availablePersonnel = useMemo(() => teamMembersQuery.data.filter(person => person.status === 'Active').map(membership => membership.person), [teamMembersQuery.data])

    const rowData = useMemo(() => assignedAssesseesQuery.data.map(assessee => ({
        assesseeId: assessee.personId,
        assessee
    })), [assignedAssesseesQuery.data])


    const addAssesseeMutation = useMutation(trpc.skillChecks.addSessionAssessee.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))

            const assessee = availablePersonnel.find(p => p.personId === data.assesseeId)
            if (!assessee) throw new Error(`Assessee with ID ${data.assesseeId} not found in available personnel`)

            const previousData = queryClient.getQueryData<PersonData[]>(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }))
            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), (prev = []) => [...prev, assessee])

            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error adding assessee to session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Assessee added to session",
                description: <><ObjectName>{result.assessee.name}</ObjectName> has been successfully added to the session as an assessee.</>,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))
        }
    }))

    const removeAssesseeMutation = useMutation(trpc.skillChecks.removeSessionAssessee.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData<PersonData[]>(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }))

            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), (prev = []) => prev.filter(a => a.personId !== data.assesseeId))

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillChecks.getSessionAssessees.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error removing assessee from session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Assessee removed from session",
                description: <><ObjectName>{result.assessee.name}</ObjectName> has been successfully removed (as an assessee) from the session.</>,
            })
            queryClient.invalidateQueries(trpc.skillChecks.getSession.queryFilter({ sessionId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessionAssessees.queryFilter({ sessionId }))
        }
    }))

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('assesseeId', {
            id: 'assesseeId',
            header: 'Assessee ID',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('assessee.name', {
            id: 'name',
            header: 'Assessee',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', () => {
                    const existingAssesseeIds = assignedAssesseesQuery.data.map(a => a.personId)
                    return <TeamMemberPicker
                        teamId={session.teamId}
                        size='sm'
                        className="-m-2"
                        value={ctx.row.getModifiedRowData().assessee.personId}
                        onValueChange={member => ctx.row.setModifiedRowData({ assessee: member.person })}
                        placeholder='Select assessee'
                        exclude={existingAssesseeIds}
                    />
                })
                .otherwise(() => ctx.getValue())
            ),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        // columnHelper.accessor('assessee.email', {
        //     id: 'email',
        //     header: 'Email',
        //     cell: ctx => ctx.getValue(),
        //     enableGrouping: false,
        //     enableHiding: true,
        //     enableSorting: false,
        // }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ctx => <div className="-m-2 flex items-center justify-end">
                {match(ctx.row.getEditMode())
                    .with('Create', () => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.saveEdit()}>
                            <SaveIcon/>
                            <span className="sr-only">Save</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {ctx.row.cancelEdit()}}>
                            <XIcon/>
                            <span className="sr-only">Cancel</span>
                        </Button>
                    </>)
                    .with('Update', () => <>{/* Not Supported */}</>)
                    .with('View', () => <>
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
                        className: 'w-20',
                    }
                },
            }
              
        })

    ]), [assignedAssesseesQuery.data, session])

    const table = useReactTable<RowData>({
        _features: [EditableFeature()],
        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => row.assesseeId,
        createEmptyRow: () => ({
            assesseeId: '',
            assessee: {
                personId: '',
                name: '',
            } satisfies PersonRef
        }),
        onUpdate() {
            // Not supported
        },
        onCreate({ assessee }) {
            addAssesseeMutation.mutate({ sessionId, assesseeId: assessee.personId })
        },
        onDelete({ assesseeId }) {
            removeAssesseeMutation.mutate({ sessionId, assesseeId })
        },
        initialState: {
            columnVisibility: {
                assesseeId: false, name: true, email: true, actions: true
            },
            columnFilters: [],
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Assessees</CardTitle>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => table.startCreating()}>
                                <PlusIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add assessee
                        </TooltipContent>
                    </Tooltip>

                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical" />

                    <CardExplanation>
                        This card displays the assessees assigned to this session. You can add or remove assessees as needed.
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