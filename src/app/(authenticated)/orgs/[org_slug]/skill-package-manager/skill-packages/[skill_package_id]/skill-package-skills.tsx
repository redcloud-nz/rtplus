/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Hermes } from '@/components/blocks/hermes'
import { CreateNewIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData } from '@/lib/schemas/skill'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'


export function AdminModule_SkillPackage_Skills_Section({ organization, skillPackage, skills }: { organization: OrganizationData, skillPackage: SkillPackageData, skills: SkillData[] }) {

    const columns = useMemo(() => Akagi.defineColumns<SkillData>(columnHelper => [
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Skill</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="max-w-80 truncate">
                <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skill(ctx.row.original.skillId)}>
                    {ctx.getValue()}
                </TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('description', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Description</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="max-w-80 truncate">{ctx.getValue()}</Akagi.TableCell>,
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
        data: skills,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active']}
            ],
            pagination: { pageSize: 50, pageIndex: 0 }
        }
    })

    return <Hermes.Section>
        <Hermes.SectionHeader>
            <Hermes.SectionTitle>Skills</Hermes.SectionTitle>
            <Protect role="org:admin">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skills.create}>
                        <CreateNewIcon/> <span className="hidden md:inline">New Skill</span>
                    </Link>
                </S2_Button>
            </Protect>
        </Hermes.SectionHeader>
        
        { skills.length > 0
            ? <Akagi.Table table={table} pagination={false}/>
            : <Hermes.Empty
                title="No Skills"
                description="There are no skills in this skill package yet."
            />
        }
    </Hermes.Section>
}