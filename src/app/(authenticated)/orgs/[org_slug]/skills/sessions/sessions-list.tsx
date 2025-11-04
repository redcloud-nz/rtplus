/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData, SkillCheckSessionId } from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { trpc, WithCounts } from '@/trpc/client'


type RowData = WithCounts<SkillCheckSessionData, 'assessees' | 'assessors' | 'skills' | 'checks'>

export function SkillModule_SkillCheckSessionsList({ organization }: { organization: OrganizationData }) {

    const { data: sessions } = useSuspenseQuery(trpc.skillChecks.getSessions.queryOptions({ orgId: organization.orgId }))

    const columns = useMemo(() => Akagi.defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Name</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">
                <TextLink to={Paths.org(organization.slug).skills.session(ctx.row.original.sessionId)}>{ctx.getValue()}</TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('date', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Date</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                {formatISO(new Date(ctx.getValue()), { representation: 'date' })}
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('_count.assessees', {
            id: 'assessees',
            header: ctx => <Akagi.TableHeader header={ctx.header} align="center" showAbove="md">Assessees</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="md">{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.skills', {
            id: 'skills',
            header: ctx => <Akagi.TableHeader header={ctx.header} align="center" showAbove="md">Skills</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="md">{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.checks', {
            id: 'checks',
            header: ctx => <Akagi.TableHeader header={ctx.header} align="center" showAbove="md">Checks</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="md">{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
        }),
        columnHelper.accessor('sessionStatus', {
            id: 'status',
            header: ctx => <Akagi.TableHeader 
                header={ctx.header} 
                align="center" 
                showAbove="md"
                filterOptions={["Draft", 'Include', 'Exclude']}
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="md">{ctx.getValue()}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            filterFn: 'arrIncludesSome',
        }),
    ]), [])

    const table = useReactTable({
        data: sessions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId: (row) => row.sessionId,
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Draft', 'Include', 'Exclude'] }
            ],
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: 'date', desc: true }],
        },
    })

    return <Show
        when={sessions.length > 0}
        fallback={<Lexington.Empty title="No sessions." description="There are no skill check sessions yet. Get started by creating one.">
            <S2_Button asChild>
                <Link to={Paths.org(organization.slug).skills.sessions.create}>
                    <PlusIcon/> Create Session
                </Link>
            </S2_Button>
        </Lexington.Empty>}
    >

        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table} />
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button asChild>
                        <Link to={Paths.org(organization.slug).skills.sessions.create}>
                            <PlusIcon/> <span className="hidden md:inline">New Session</span>
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    Create a new skill check session for the team.
                </TooltipContent>
            </Tooltip>
        </Lexington.ColumnControls>

        <Akagi.Table table={table} />
    </Show>
}