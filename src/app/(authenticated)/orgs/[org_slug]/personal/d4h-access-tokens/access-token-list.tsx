/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon } from '@/components/icons'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'

import { D4hAccessTokenData, D4hAccessTokens } from '@/lib/d4h-access-tokens'
import { getD4hServer } from '@/lib/d4h-api/servers'
import { OrganizationData } from '@/lib/schemas/organization'
import { UserId } from '@/lib/schemas/user'
import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'




export function Personal_D4hAccessTokens_List({ organization, userId }: { organization: OrganizationData, userId: UserId }) {

    const { data: accessTokens = [] } = useQuery(D4hAccessTokens.queryOptions({ userId, orgId: organization.orgId }))

    const columns = useMemo(() => Akagi.defineColumns<D4hAccessTokenData>(columnHelper => [
        columnHelper.accessor('label', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Label</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                <TextLink to={Paths.org(organization.slug).personal.d4hAccessToken(ctx.row.original.tokenId)}>{ctx.getValue() ?? ctx.row.original.orgId}</TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('serverCode', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>D4H Server</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{getD4hServer(ctx.getValue())?.name ?? ctx.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('createdAt', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Created At</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{formatDateTime(ctx.getValue())}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('teams', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Teams</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                {ctx.row.original.teams.map(team => <div key={team.id}>{team.name}</div>)}
            </Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
    ]), [])

    const table = useReactTable<D4hAccessTokenData>({
        data: accessTokens,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            sorting: [{ id: 'createdAt', desc: true }],
        },
    })

    return <Show
        when={accessTokens.length > 0}
        fallback={<Lexington.Empty
            title="No D4H Access Tokens"
            description="You have not added any D4H access tokens yet. Add one to get started."
        >
            <S2_Button asChild>
                <Link to={Paths.org(organization.slug).personal.d4hAccessTokens.create}>
                    <CreateNewIcon/> Add Access Token
                </Link>
            </S2_Button>
        </Lexington.Empty>}
    >
        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table}/>

            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).personal.d4hAccessTokens.create}>
                    <CreateNewIcon/> Add Access Token
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>
        <Akagi.Table table={table} />
    </Show>
}