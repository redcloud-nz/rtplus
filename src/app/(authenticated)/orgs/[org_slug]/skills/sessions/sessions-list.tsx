/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon} from 'lucide-react'
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
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export function SkillModule_SkillCheckSessionsList({ organization }: { organization: OrganizationData }) {

    const { data: sessions } = useSuspenseQuery(trpc.skillChecks.getSessions.queryOptions({ orgId: organization.orgId }))

    const columns = useMemo(() => Akagi.defineColumns<SkillCheckSessionData>(columnHelper => [
        columnHelper.accessor('sessionId', {
            id: 'sessionId',
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-20">ID</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="w-20">
                <TextLink to={Paths.org(organization.slug).skills.session(ctx.row.original.sessionId)}>{ctx.getValue()}</TextLink>
                </Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Name</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">{ctx.getValue()}</Akagi.TableCell>,
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
        columnHelper.accessor('sessionStatus', {
            id: 'status',
            header: ctx => <Akagi.TableHeader 
                header={ctx.header} 
                showAbove="md"
                filterOptions={["Draft", 'Include', 'Exclude']}
                className="w-[100px]"
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} showAbove="md">{ctx.getValue()}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            filterFn: 'arrIncludesSome',
        }),
        // columnHelper.display({
        //     id: 'actions',
        //     header: ctx => <Akagi.TableHeader header={ctx.header} showAbove="md">Actions</Akagi.TableHeader>,
        //     cell: ctx => <Akagi.TableCell cell={ctx.cell} showAbove="md" className="p-0 [&>[data-slot=button]]:ml-2 w-30">
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                  <S2_Button variant="ghost" size="icon-sm" asChild>
        //                     <Link to={Paths.org(organization.slug).skills.session(ctx.row.original.sessionId).update}>
        //                         <EditIcon/>
        //                     </Link>
        //                 </S2_Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 Edit session details
        //             </TooltipContent>
        //         </Tooltip>
               
        //        <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <S2_Button variant="ghost" size="icon-sm" asChild>
        //                     <Link to={Paths.org(organization.slug).skills.session(ctx.row.original.sessionId)}>
        //                         <PencilRulerIcon/>
        //                     </Link>
        //                 </S2_Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 Configure and record skill checks
        //             </TooltipContent>
        //        </Tooltip>
        //        <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <S2_Button variant="ghost" size="icon-sm" asChild>
        //                     <Link to={Paths.org(organization.slug).skills.session(ctx.row.original.sessionId).review}>
        //                         <ScanEyeIcon/>
        //                     </Link>
        //                 </S2_Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 Review session results
        //             </TooltipContent>
        //        </Tooltip>
                
        //     </Akagi.TableCell>,
        // })
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
            pagination: { pageIndex: 0, pageSize: Akagi.DEFAULT_PAGE_SIZE },
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
                    <S2_Button variant="outline" asChild>
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