/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { MoreHorizontalIcon, SendIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useOrganization} from '@clerk/nextjs'
import { OrganizationInvitationResource } from '@clerk/types'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Hermes } from '@/components/blocks/hermes'
import { DeleteObjectIcon} from '@/components/icons'

import { S2_Button } from '@/components/ui/s2-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { formatDate } from '@/lib/utils'
import * as Paths from '@/paths'


export default function AdminModule_InvitationsList({ organization }: { organization:  OrganizationData }) {

    const { toast } = useToast()

    const { invitations } = useOrganization({ invitations: { pageSize: 1000, }})
    if(!invitations) return null

    function handleRevokeInvitation(invitation: OrganizationInvitationResource) {
        try {
            invitation.revoke()
            invitations?.revalidate?.()
        } catch(error) {
            console.error("Error revoking invitation:", error)
            toast({
                title: 'Error revoking invitation',
                description: (error as Error).message,
                variant: 'destructive'
            })
        }
    }

    const columns = useMemo(() => Akagi.defineColumns<OrganizationInvitationResource>(columnHelper => [
        columnHelper.accessor('emailAddress', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Email Address</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('role', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Role</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue() === 'org:admin' ? 'Admin' : 'Member'}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('createdAt', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Sent</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{formatDate(ctx.getValue())}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('status', {
            header: ctx => <Akagi.TableHeader
                header={ctx.header}
                filterOptions={['pending', 'accepted', 'revoked', 'expired']}
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.row.original.status}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',

        }),
        columnHelper.display({
            id: 'actions',
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-10">Actions</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon"><MoreHorizontalIcon /></S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onSelect={() => handleRevokeInvitation(ctx.row.original)}
                                className="text-destructive"
                            >
                                <DeleteObjectIcon/>
                                Revoke
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Akagi.TableCell>,
        }),
    ]), [organization.slug])

    const table = useReactTable({
        columns,
        data: invitations?.data ?? [],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {

            columnFilters: [
                { id: 'status', value: ['pending'] }
            ],
            pagination: { pageIndex: 0, pageSize: Akagi.DEFAULT_PAGE_SIZE },
            sorting: [
                { id: 'createdAt', desc: true }
            ]
        },
    })

    return <Hermes.Section>
        <Hermes.SectionHeader>
            <Akagi.TableSearch table={table}/>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.invitations.create}>
                    <SendIcon/> Invite
                </Link>
            </S2_Button>
        </Hermes.SectionHeader>
        <Akagi.Table table={table} />
    </Hermes.Section>
}