/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { NoteData } from '@/lib/schemas/note'
import { OrganizationData } from '@/lib/schemas/organization'
import { UpdateMeta } from '@/lib/schemas/update-meta'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


type RowData = Pick<NoteData, 'noteId' | 'title' | 'status'> & UpdateMeta

export function NotesModule_NotesList({ organization }: { organization: OrganizationData }) {

    const { data: notes } = useSuspenseQuery(trpc.notes.getNotes.queryOptions({ orgId: organization.orgId }))

    const columns = useMemo(() => Akagi.defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('noteId', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Note ID</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('title', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-1/2">Title</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="truncate">
                <TextLink to={Paths.org(organization.slug).notes.note(ctx.row.original.noteId)}>{ctx.getValue()}</TextLink>
            </Akagi.TableCell>,
        }),
        columnHelper.accessor('createdAt', {
            header: ctx => <Akagi.TableHeader header={ctx.header} align="center" showAbove="md">Created</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="md">
                {ctx.getValue() 
                    ? format(ctx.getValue()!, 'yyyy-MM-dd')
                    : <span className="text-muted-foreground">Unknown</span>
                }
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('updatedAt', {
            header: ctx => <Akagi.TableHeader header={ctx.header} align="center" showAbove="sm">Updated</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center" showAbove="sm">
                {ctx.getValue() 
                    ? format(ctx.getValue()!, 'yyyy-MM-dd')
                    : <span className="text-muted-foreground">Unknown</span>
                }
            </Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
    ]), [organization.slug])

    const table = useReactTable({
        columns,
        data: notes,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            globalFilter: "",
            sorting: [
                { id: 'updatedAt', desc: true }
            ]
        }
    })

    return <Show 
        when={notes.length > 0}
        fallback={<Lexington.Empty title="No Notes Yet" description="There are no notes here yet. Get started by creating one.">
            <S2_Button asChild>
                <Link to={Paths.org(organization.slug).notes.create}>
                    <PlusIcon/> Create Note
                </Link>
            </S2_Button>
        </Lexington.Empty>}
    >
        <Lexington.TableControls>
            <Akagi.TableSearch table={table}/>
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button asChild>
                        <Link to={Paths.org(organization.slug).notes.create}>
                            <PlusIcon /> Create
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    Create a new note
                </TooltipContent>
            </Tooltip>
        </Lexington.TableControls>
        <Akagi.Table table={table}/>
    </Show>
}