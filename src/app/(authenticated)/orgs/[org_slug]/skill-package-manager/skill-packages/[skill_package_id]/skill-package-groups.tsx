/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Hermes } from '@/components/blocks/hermes'
import { CreateNewIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'


export function AdminModule_SkillPackage_Groups_Section({ organization, skillPackage, groups }: { organization: OrganizationData, skillPackage: SkillPackageData, groups: SkillGroupData[] }) {

    const columns = useMemo(() => Akagi.defineColumns<SkillGroupData>(columnHelper => [
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Group</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).group(ctx.row.original.skillGroupId)}>
                    {ctx.getValue()}
                </TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('description', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Description</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('status', {
            header: ctx => <Akagi.TableHeader 
                header={ctx.header}
                filterOptions={['Active', 'Inactive']}
                className="w-[100px]"
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        })
    ]), [organization.slug, skillPackage.skillPackageId])      

    const table = useReactTable({
        data: groups,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active']}
            ]
        }
    })

    return <Hermes.Section>
        <Hermes.SectionHeader>
            <Hermes.SectionTitle>Skill Groups</Hermes.SectionTitle>
            <Protect role="org:admin">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).groups.create}>
                        <CreateNewIcon/> <span className="hidden md:inline">New Skill Group</span>
                    </Link>
                </S2_Button>
            </Protect>
        </Hermes.SectionHeader>

        { groups.length > 0
            ? <Akagi.Table table={table} pagination={false}/>
            : <Hermes.Empty
                title="No Skill Groups"
                description="There are no skill groups in this skill package yet."
            />
        }
    </Hermes.Section>
}