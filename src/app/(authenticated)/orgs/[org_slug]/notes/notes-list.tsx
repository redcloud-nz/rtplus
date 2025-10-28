/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import Artie from '@/components/art/artie'
import { S2_Button } from '@/components/ui/s2-button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHeadCell, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


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
    : <div className="h-full flex flex-col gap-2 max-w-4xl mx-auto">
        <div className="flex w-full gap-2 justify-between">
            {/* <InputGroup className="max-w-sm">
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup> */}
            <div></div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button asChild>
                        <Link to={Paths.org(organization.slug).notes.create}>
                            <PlusIcon /> New
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    Create a new note
                </TooltipContent>
            </Tooltip>
            
        </div>
        <S2_Table border className="table-fixed" containerProps={{ className: "overflow-y-auto [scrollbar-gutter:stable] [scrollbar-color:var(--scrollbar-thumb)_transparent]" }}>
            <S2_TableHeader>
                <S2_TableRow className="sticky top-0 bg-background/95 backdrop-blur-md z-10 border-b-2 border-border">
                    <S2_TableHeadCell>
                        Note ID
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="w-2/3 sm:w-1/2">
                        Title
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="text-center hidden md:table-cell">
                        Created
                    </S2_TableHeadCell>
                    <S2_TableHeadCell className="text-center hidden sm:table-cell">
                        Updated
                    </S2_TableHeadCell>
                </S2_TableRow>
            </S2_TableHeader>
            <S2_TableBody>
                {notes.map(note => <S2_TableRow key={note.noteId}>
                    <S2_TableCell>
                        {note.noteId}
                    </S2_TableCell>
                    <S2_TableCell className="truncate">
                       <TextLink to={Paths.org(organization.slug).notes.note(note.noteId)}>{note.title}</TextLink>
                    </S2_TableCell>
                    <S2_TableCell className="text-center hidden md:table-cell">
                        {note.createdAt 
                            ? <Tooltip>
                                <TooltipTrigger>
                                    {format(note.createdAt, 'yyyy-MM-dd')}
                                </TooltipTrigger>
                                <TooltipContent>
                                    Created {format(note.createdAt, 'dd MMM yyyy')} at {format(note.createdAt, 'HH:mm')} by {note.createdBy?.name || 'Unknown User'}
                                </TooltipContent>
                            </Tooltip>
                            : <span className="text-muted-foreground">Unknown</span>
                        }
                    </S2_TableCell>
                    <S2_TableCell className="text-center hidden sm:table-cell">
                        {note.updatedAt 
                            ? <Tooltip>
                                <TooltipTrigger>
                                    {format(note.updatedAt, 'yyyy-MM-dd')}
                                </TooltipTrigger>
                                <TooltipContent>
                                    Updated at {format(note.updatedAt, 'dd MMM yyyy')} at {format(note.updatedAt, 'HH:mm')} by {note.updatedBy?.name || 'Unknown User'}
                                </TooltipContent>
                            </Tooltip>
                            : <span className="text-muted-foreground">N/A</span>
                        }
                    </S2_TableCell>
                </S2_TableRow>)}
                {Array.from({ length: 30}).map((_, i) => (
                    <S2_TableRow key={i}>
                        <S2_TableCell>
                            SAMPLE
                        </S2_TableCell>
                        <S2_TableCell className="truncate">
                            Sample Note Title
                        </S2_TableCell>
                        <S2_TableCell className="text-center hidden md:table-cell">
                            
                        </S2_TableCell>
                        <S2_TableCell className="text-center hidden sm:table-cell">
                            
                        </S2_TableCell>
                    </S2_TableRow>
                ))}
            </S2_TableBody>
        </S2_Table>
        <div className="self-center mt-2 text-sm text-muted-foreground">{notes.length == 1 ? `${notes.length} note found` : `${notes.length} notes found`}</div>
    </div>
}