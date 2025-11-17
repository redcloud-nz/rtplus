/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Link, TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import { PersonData } from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'
import { S2_Button } from '@/components/ui/s2-button'



export function AdminModule_PersonnelList({ organization }: { organization: OrganizationData }) {
    
    const { data: personnel, refetch } = useSuspenseQuery(trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }))

    async function handleRefresh() {
        await refetch()
    }

    const columns = useMemo(() => Akagi.defineColumns<PersonData>(columnHelper => [
        columnHelper.accessor('personId', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-20">ID</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="w-20">
                <TextLink to={Paths.org(organization.slug).admin.person(ctx.row.original.personId)}>{ctx.getValue()}</TextLink>
            </Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Name</Akagi.TableHeader>,
            cell : ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('email', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Email</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('status', {
            header: ctx => <Akagi.TableHeader 
                header={ctx.header}
                filterOptions={['Active', 'Inactive']}
                className="w-[100px]"
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',
        }),
    ]), [])

    const table = useReactTable({
        columns,
        data: personnel,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active']}
            ],
            globalFilter: "",
            sorting: [
                { id: 'name', desc: false }
            ],
            pagination: { pageIndex: 0, pageSize: Akagi.DEFAULT_PAGE_SIZE },
        }
    })

    return <Show 
        when={personnel.length > 0}
        fallback={<Lexington.Empty title="No Personnel Yet" description="You haven't added any personnel to your organisation. Get started by adding some.">
            <Protect role="org:admin">
                <S2_Button asChild>
                    <Link to={Paths.org(organization.slug).admin.personnel.create}>
                        <PlusIcon className="mr-2 h-4 w-4"/>
                        Add Person
                    </Link>
                </S2_Button>
            </Protect>
        </Lexington.Empty>}
    >
        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table} />
            <Protect role="org:admin">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(organization.slug).admin.personnel.create}>
                                <PlusIcon/> <span className="hidden md:inline">New Person</span>
                            </Link>
                        </S2_Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Create a new person
                    </TooltipContent>
                </Tooltip>
            </Protect>
        </Lexington.ColumnControls>

        <Akagi.Table table={table}/>
    </Show>
}