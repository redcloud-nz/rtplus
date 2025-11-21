/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { MoreHorizontalIcon, SendIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useOrganization} from '@clerk/nextjs'
import { type OrganizationMembershipResource } from '@clerk/types'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Hermes } from '@/components/blocks/hermes'
import { DeleteObjectIcon} from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { S2_Button } from '@/components/ui/s2-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { formatDate } from '@/lib/utils'
import * as Paths from '@/paths'


export default function AdminModule_UsersList({ organization, currentUserId }: { organization:  OrganizationData, currentUserId?: string }) {

    const { toast } = useToast()

    const { memberships } = useOrganization({ memberships: { pageSize: 1000, }})
    if(!memberships) return null

    async function handleChangeRole(membership: OrganizationMembershipResource, newRole: 'org:admin' | 'org:member') {
        try {
            await membership.update({ role: newRole })
            await memberships!.revalidate?.()
        } catch (error) {
            console.error("Error updating user role:", error)
            toast({
                title: 'Error updating user role',
                description: (error as Error).message,
                variant: 'destructive'
            })
        }
    }
    async function handleRemoveUser(membership: OrganizationMembershipResource) {
        try {
            await membership.destroy()
            await memberships!.revalidate?.()
        } catch (error) {
            console.error("Error removing user from organization:", error)
            toast({
                title: 'Error removing user',
                description: (error as Error).message,
                variant: 'destructive'
            })
        }
    }

    const columns = useMemo(() => Akagi.defineColumns<OrganizationMembershipResource>(columnHelper => [
        columnHelper.accessor(row => `${row.publicUserData?.firstName} ${row.publicUserData?.lastName}`, {
            id: 'fullName',
            header: ctx => <Akagi.TableHeader header={ctx.header}>User</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                <Item className="p-0" asChild>
                    <Link to={Paths.org(organization.slug).admin.user(ctx.row.original.publicUserData?.userId || '')}>
                        <ItemMedia>
                            <Avatar>
                                <AvatarImage src={ctx.row.original.publicUserData?.imageUrl} alt="User Avatar" />
                                <AvatarFallback>{ctx.row.original.publicUserData?.firstName?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                {ctx.getValue()}
                                {ctx.row.original.publicUserData?.userId === currentUserId ? <span className="bg-neutral-200 border-1 border-neutral-300 text-xs px-1.5 rounded-sm">You</span> : null}
                            </ItemTitle>
                            <ItemDescription>{ctx.row.original.publicUserData?.identifier}</ItemDescription>
                        </ItemContent>
                    </Link>
                    
                </Item>
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('createdAt', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Joined</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                {formatDate(ctx.getValue() as string)}
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('role', {
            header: ctx => <Akagi.TableHeader 
                header={ctx.header}
            >Role</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>
                <S2_Select 
                value={ctx.cell.getValue()}
                onValueChange={(newValue) => handleChangeRole(ctx.row.original, newValue as 'org:admin' | 'org:member')}
                disabled={ctx.table.getRowCount() <= 1 || ctx.row.original.publicUserData?.userId === currentUserId}
            >
                    <S2_SelectTrigger>
                        <S2_SelectValue />
                    </S2_SelectTrigger>
                    <S2_SelectContent>
                        <S2_SelectItem value="org:admin">Admin</S2_SelectItem>
                        <S2_SelectItem value="org:member">Member</S2_SelectItem>
                    </S2_SelectContent>
                </S2_Select>
            </Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.display({
            id: 'actions',
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-10">Actions</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon"><MoreHorizontalIcon /></S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleRemoveUser(ctx.row.original)}
                                disabled={ctx.row.original.publicUserData?.userId === currentUserId}
                            >
                                 <DeleteObjectIcon /> Remove User
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        })
    ]), [organization.slug, currentUserId])

    const table = useReactTable<OrganizationMembershipResource>({
        columns,
        data: memberships?.data ?? [],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {

            pagination: { pageIndex: 0, pageSize: Akagi.DEFAULT_PAGE_SIZE },
            sorting: [
                { id: 'fullName', desc: false }
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