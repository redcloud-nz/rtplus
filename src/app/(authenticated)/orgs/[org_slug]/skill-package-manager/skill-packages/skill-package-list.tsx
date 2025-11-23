/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'


import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon } from '@/components/icons'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc, WithCounts } from '@/trpc/client'





export function SkillPackageManagerModule_SkillPackagesList({ organization }: { organization: OrganizationData }) {
    
    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getPackages.queryOptions({ orgId: organization.orgId, owner: 'org' }))

    const columns = useMemo(() => Akagi.defineColumns<WithCounts<SkillPackageData, 'skills' | 'skillGroups'>>(columnHelper => [
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Name</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">
                <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(ctx.row.original.skillPackageId)}>{ctx.getValue()}</TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('_count.skillGroups', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-[100px]">Groups</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('_count.skills', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-[100px]">Skills</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
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
        data: skillPackages,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            sorting: [
                { id: 'name', desc: false }
            ],
            pagination: { pageIndex: 0, pageSize: Akagi.DEFAULT_PAGE_SIZE },
        }
    })

    return <Show 
        when={skillPackages.length > 0} 
        fallback={<Lexington.Empty title="No Skill Packages Yet" description="There are no skill packages here yet. Get started by creating one.">
            <Protect role="org:admin">
                <S2_Button asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackages.create}>
                        <CreateNewIcon/> New Skill Package
                    </Link>
                </S2_Button>
            </Protect>
        </Lexington.Empty>}
    >
        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table} />
            <Protect role="org:admin">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackages.create}>
                        <CreateNewIcon/> <span className="hidden md:inline">New Skill Package</span>
                    </Link>
                </S2_Button>
            </Protect>
        </Lexington.ColumnControls>

        <Akagi.Table table={table}/>
    </Show>
}