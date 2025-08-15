/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { PersonData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'


type RowData = SkillCheckData & { assessee: PersonData, assessor: PersonData, skill: SkillData }

export function CompetencyRecorder_Session_Transcript_Card({ sessionId}: { sessionId: string }) {
    const trpc = useTRPC()

    const assesseesQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    const assessorsQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssessors.queryOptions({ sessionId }))
    const checksQuery = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId }))
    const skillsQuery = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))

    async function handleRefresh() {
        await Promise.all([
            assesseesQuery.refetch(),
            assessorsQuery.refetch(),
            checksQuery.refetch(),
            skillsQuery.refetch()
        ])
    }

    const rows = useMemo(() => {
        return checksQuery.data.map(check => {
            const assessee = assesseesQuery.data.find(a => a.personId === check.assesseeId)!
            const assessor = assessorsQuery.data.find(a => a.personId === check.assessorId)!
            const skill = skillsQuery.data.find(s => s.skillId === check.skillId)!

            return {
                ...check,
                assessee,
                assessor,
                skill
            }
        })
    }, [assesseesQuery.data, assessorsQuery.data, checksQuery.data, skillsQuery.data])

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor("assessee.name", {
            header: "Assessee",
            cell: info => info.getValue(),
        }),
        columnHelper.accessor("skill.name", {
            header: "Skill",
            cell: info => info.getValue(),
        }),
        columnHelper.accessor("result", {
            header: "Result",
            cell: info => info.getValue(),
        }),
        columnHelper.accessor("notes", {
            header: "Notes",
            cell: info => info.getValue(),
        }),
    ]), [])

    const table = useReactTable<RowData>({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            sorting: [],
            columnFilters: [],
            columnVisibility: {
                skillId: true,
                assesseeId: true,
                result: true,
                notes: true,
            }
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Transcript</CardTitle>
                <CardActions>
                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>

                    <Separator orientation='vertical'/>

                    <CardExplanation>
                        This table shows the transcript of the skill check session.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter />
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}