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

import { useAssignedSkills } from '@/hooks/use-assigned-skills'
import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/competencies'
import { PersonRefData } from '@/lib/schemas/person'
import { SkillData } from '@/lib/schemas/skill'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { formatDateTime } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'


type RowData = SkillCheckData & { assessee: PersonRefData, assessor: PersonRefData, skill: SkillData }

export function SkillCheckSession_Transcript_Card({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const assesseesQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssignedAssessees.queryOptions({ sessionId }))
    const assessorsQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssignedAssessors.queryOptions({ sessionId }))
    const checksQuery = useSuspenseQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId, assessorId: 'me'  }))
    const assignedSkillsQuery = useAssignedSkills({ sessionId })

    async function handleRefresh() {
        await Promise.all([
            assesseesQuery.refetch(),
            assessorsQuery.refetch(),
            checksQuery.refetch(),
            assignedSkillsQuery.refetch(),
        ])
    }

    const rows = useMemo(() => {
        return checksQuery.data.map(check => {
            const assessee = assesseesQuery.data.find(a => a.personId === check.assesseeId)!
            const assessor = assessorsQuery.data.find(a => a.personId === check.assessorId)!
            const skill = assignedSkillsQuery.data.find(s => s.skillId === check.skillId)!

            return {
                ...check,
                assessee,
                assessor,
                skill
            }
        })
    }, [assesseesQuery.data, assessorsQuery.data, checksQuery.data, assignedSkillsQuery.data])

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor("assessee.name", {
            header: "Assessee",
            cell: info => info.getValue(),
            enableGrouping: true,
            enableSorting: true,
        }),
        columnHelper.accessor("skill.name", {
            header: "Skill",
            cell: info => info.getValue(),
            enableGrouping: true,
            enableSorting: true,
        }),
        columnHelper.accessor("result", {
            header: "Result",
            cell: info => CompetenceLevelTerms[info.getValue() as CompetenceLevel],
            enableGrouping: true,
            enableSorting: true,
        }),
        columnHelper.accessor("notes", {
            header: "Notes",
            cell: info => info.getValue(),
            enableSorting: false,
            enableGrouping: false
        }),
        columnHelper.accessor("timestamp", {
            header: "Timestamp",
            cell: info => formatDateTime(info.getValue()),
            enableGrouping: false,
            enableSorting: true,
            
        }),
    ]), [])

    const table = useReactTable<RowData>({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnFilters: [],
            columnVisibility: {
                skillId: true,
                assesseeId: true,
                result: true,
                notes: true,
                timestamp: true,
            },
            sorting: [
                { id: 'timestamp', desc: true }
            ],
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