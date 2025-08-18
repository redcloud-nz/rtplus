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

import { PersonPicker } from '@/components/controls/person-picker'
import { Button, DeleteConfirmButton, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { EditableFeature } from '@/lib/editable-feature'
import { PersonData } from '@/lib/schemas/person'
import { useTRPC } from '@/trpc/client'






type RowData = { assessorId: string, assessor: PersonData }

/**
 * Card component to display and manage assessors in a skill check session.
 * Allows adding and removing assessors.
 */
export function SkillCheckSession_AssessorsList_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const personnelQuery = useSuspenseQuery(trpc.personnel.getPersonnel.queryOptions({}))
    const assignedAssessorsQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssessors.queryOptions({ sessionId }))

    async function handleRefresh() {
        assignedAssessorsQuery.refetch()
    }

    const availablePersonnel = useMemo(() => personnelQuery.data.filter(person => person.status === 'Active'), [personnelQuery.data])

    const rowData = useMemo(() => assignedAssessorsQuery.data.map(assessor => ({
        assessorId: assessor.personId,
        assessor
    })), [assignedAssessorsQuery.data])

    const addAssessorMutation = useMutation(trpc.skillCheckSessions.addAssessor.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getAssessors.queryFilter({ sessionId }))

            const assessor = availablePersonnel.find(p => p.personId === data.assessorId)
            if (!assessor) throw new Error(`Assessor with ID ${data.assessorId} not found in available personnel`)

            const previousData = queryClient.getQueryData<PersonData[]>(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }))
            queryClient.setQueryData(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }), (prev = []) => [...prev, assessor])

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error adding assessor to session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Assessor added to session",
                description: <><ObjectName>{result.assessor.name}</ObjectName> has been successfully added to the session as an assessor.</>,
            })
            queryClient.invalidateQueries(trpc.skillCheckSessions.getSession.queryFilter({ sessionId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.getAssessors.queryFilter({ sessionId }))
        }
    }))

    const removeAssessorMutation = useMutation(trpc.skillCheckSessions.removeAssessor.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getAssessors.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData<PersonData[]>(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }))

            queryClient.setQueryData(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }), (prev = []) => prev.filter(a => a.personId !== data.assessorId))

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.getAssessors.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error removing assessor from session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Assessor removed from session",
                description: <><ObjectName>{result.assessor.name}</ObjectName> has been successfully removed (as an assessor) from the session.</>,
            })
            queryClient.invalidateQueries(trpc.skillCheckSessions.getSession.queryFilter({ sessionId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.getAssessors.queryFilter({ sessionId }))
        }
    }))

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('assessorId', {
            id: 'assessorId',
            header: 'Assessor ID',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('assessor.name', {
            id: 'name',
            header: 'Assessor',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', () => {
                    const existingAssessorIds = assignedAssessorsQuery.data.map(a => a.personId)
                    return <PersonPicker
                        size='sm'
                        className="-m-2"
                        value={ctx.row.getModifiedRowData().assessor.personId}
                        onValueChange={person => ctx.row.setModifiedRowData({ assessor: person })}
                        placeholder='Select assessor'
                        exclude={existingAssessorIds}
                        filter={{ isUser: true }}
                    />
                })
                .otherwise(() => ctx.getValue())
            ),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('assessor.email', {
            id: 'email',
            header: 'Email',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
        }),
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

    ]), [assignedAssessorsQuery.data])

    const table = useReactTable<RowData>({
        _features: [EditableFeature()],
        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => row.assessorId,
        createEmptyRow: () => ({
            assessorId: '',
            assessor: {
                personId: '',
                name: '',
                email: '',
                status: 'Active',
            } as PersonData
        }),
        onUpdate() {
            // Not supported
        },
        onCreate({ assessor }) {
            addAssessorMutation.mutate({ sessionId, assessorId: assessor.personId })
        },
        onDelete({ assessorId }) {
            removeAssessorMutation.mutate({ sessionId, assessorId })
        },
        initialState: {
            columnVisibility: {
                assessorId: false, name: true, email: true, actions: true
            },
            columnFilters: [],
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Assessors</CardTitle>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => table.startCreating()}>
                                <PlusIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add assessor
                        </TooltipContent>
                    </Tooltip>

                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical" />

                    <CardExplanation>
                        This card displays the assessors assigned to this session. You can add or remove assessors as needed.
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