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

import { SkillPicker } from '@/components/controls/skill-picker'
import { Button, DeleteConfirmButton, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useToast } from '@/hooks/use-toast'
import { EditableFeature } from '@/lib/editable-feature'
import { SkillData } from '@/lib/schemas/skill'
import { useTRPC } from '@/trpc/client'



type RowData = { skillId: string, skill: SkillData }

/**
 * Card component to display and manage skills in a skill check session.
 * Allows adding and removing skills.
 */
export function SkillCheckSession_SkillsList_Card({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const availablePackagesQuery = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())
    const { data: assignedSkills, refetch: refetchAssignedSkills } = useSuspenseQuery(trpc.skillCheckSessions.getAssignedSkillIds.queryOptions({ sessionId }))

    async function handleRefresh() {
        refetchAssignedSkills()
    }

    const availableSkills = useMemo(() => availablePackagesQuery.data.flatMap(pkg => pkg.skills), [availablePackagesQuery.data])

    const rowData = useMemo(() => assignedSkills.map(skillId => ({
        skillId,
        skill: availableSkills.find(s => s.skillId === skillId)!
    })), [assignedSkills])

    const addSkillMutation = useMutation(trpc.skillCheckSessions.addSkill.mutationOptions({
        async onMutate({ skillId: skillIdToAdd }) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getAssignedSkillIds.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }))
            queryClient.setQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }), (prev = []) => [...prev, skillIdToAdd])

            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error adding skill to session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Skill added to session",
                description: `Skill '${result.skill.name}' has been successfully added to the session.`,
            })
            queryClient.invalidateQueries(trpc.skillCheckSessions.getSession.queryFilter({ sessionId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.getAssignedSkillIds.queryFilter({ sessionId }))
        }
    }))

    const removeSkillMutation = useMutation(trpc.skillCheckSessions.removeSkill.mutationOptions({
        async onMutate({ skillId: skillIdToRemove }) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getAssignedSkillIds.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }))

            queryClient.setQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }), (prev = []) => prev.filter(skillId => skillId != skillIdToRemove))

            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.getAssignedSkillIds.queryKey({ sessionId }), context?.previousData)

            toast({
                title: "Error removing skill from session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: "Skill removed from session",
                description: `Skill '${result.skill.name}' has been successfully removed from the session.`,
            })
            queryClient.invalidateQueries(trpc.skillCheckSessions.getSession.queryFilter({ sessionId }))
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.getAssignedSkillIds.queryFilter({ sessionId }))
        }
    }))

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('skillId', {
            id: 'skillId',
            header: 'Skill ID',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('skill.name', {
            id: 'name',
            header: 'Skill',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Create', () => {
                    return <SkillPicker
                        size='sm'
                        className="-m-2"
                        value={ctx.row.getModifiedRowData().skill.skillId}
                        onValueChange={skill => ctx.row.setModifiedRowData({ skill })}
                        placeholder='Select skill'
                        exclude={assignedSkills}
                    />
                })
                .otherwise(() => ctx.getValue())
            ),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('skill.description', {
            id: 'description',
            header: 'Description',
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

    ]), [assignedSkills])

    const table = useReactTable<RowData>({
        _features: [EditableFeature()],
        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => row.skillId,
        createEmptyRow: () => ({
            skillId: '',
            skill: {
                skillId: '',
                name: '',
                description: '',
                skillGroupId: '',
                skillPackageId: '',
            } as SkillData
        }),
        onUpdate() {
            // Not supported
        },
        onCreate({ skill }) {
            addSkillMutation.mutate({ sessionId, skillId: skill.skillId })
        },
        onDelete({ skillId }) {
            removeSkillMutation.mutate({ sessionId, skillId })
        },
        initialState: {
            columnVisibility: {
                skillId: false, name: true, description: true, actions: true
            },
            columnFilters: [],
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => table.startCreating()}>
                                <PlusIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add skill
                        </TooltipContent>
                    </Tooltip>

                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical" />

                    <CardExplanation>
                        This card displays the skills assigned to this session. You can add or remove skills as needed.
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