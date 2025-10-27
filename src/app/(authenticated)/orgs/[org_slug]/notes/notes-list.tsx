/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHeadCell, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'

import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'
import { Link, TextLink } from '@/components/ui/link'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import Artie from '@/components/art/artie'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'


export function NotesModule_NotesList({ organization }: { organization: OrganizationData }) {

    const { data: notes } = useSuspenseQuery(trpc.notes.getNotes.queryOptions({ orgId: organization.orgId }))

    return notes.length == 0
    ? <Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <Artie pose="Empty"/>
                </EmptyMedia>
                <EmptyTitle>No Notes Yet</EmptyTitle>
                <EmptyDescription>
                    There are no notes here yet. Get started by creating one.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <S2_Button asChild>
                    <Link to={Paths.org(organization.slug).notes.create}>
                        <PlusIcon/> Create Note
                    </Link>
                </S2_Button>
            </EmptyContent>
        </Empty>
    : <div className="flex w-full flex-col gap-2">
        <div className="flex w-full justify-end">
            <S2_Button size="sm" asChild>
                <Link to={Paths.org(organization.slug).notes.create}>
                    <PlusIcon /> Add Note
                </Link>
            </S2_Button>
        </div>
        <S2_Table border>
            <S2_TableHeader>
                <S2_TableRow>
                    <S2_TableHeadCell>
                        Note ID
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="w-1/2">
                        Title
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="text-center">
                        Created
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="text-center">
                        Last Update
                    </S2_TableHeadCell>
                </S2_TableRow>
            </S2_TableHeader>
            <S2_TableBody>
                {notes.map(note => <S2_TableRow key={note.noteId}>
                    <S2_TableCell>
                        {note.noteId}
                    </S2_TableCell>
                    <S2_TableCell>
                       <TextLink to={Paths.org(organization.slug).notes.note(note.noteId)}>{note.title}</TextLink>
                    </S2_TableCell>
                    <S2_TableCell className="text-center">
                        {note.createdAt 
                            ? <Tooltip>
                                <TooltipTrigger>
                                    {format(note.createdAt, 'dd/MMM/yyyy')}
                                </TooltipTrigger>
                                <TooltipContent>
                                    Created at {format(note.createdAt, 'HH:mm dd MMM yyyy ')} by {note.createdBy?.name || 'Unknown User'}
                                </TooltipContent>
                            </Tooltip>
                            : <span className="text-muted-foreground">Unknown</span>
                        }
                    </S2_TableCell>
                    <S2_TableCell className="text-center">
                        {note.updatedAt 
                            ? <Tooltip>
                                <TooltipTrigger>
                                    {format(note.updatedAt, 'dd/MMM/yyyy')}
                                </TooltipTrigger>
                                <TooltipContent>
                                    Created at {format(note.updatedAt, 'HH:mm dd MMM yyyy ')} by {note.updatedBy?.name || 'Unknown User'}
                                </TooltipContent>
                            </Tooltip>
                            : <span className="text-muted-foreground">N/A</span>
                        }
                    </S2_TableCell>
                </S2_TableRow>)}
            </S2_TableBody>
        </S2_Table>
        <div className="self-center mt-2 text-sm text-muted-foreground">{notes.length == 1 ? `${notes.length} note found` : `${notes.length} notes found`}</div>
    </div>
}