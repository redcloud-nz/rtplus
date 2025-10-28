/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { ClipboardClockIcon, MoreVerticalIcon, MoveLeftIcon, PencilIcon, TrashIcon } from 'lucide-react'

import { RenderMarkdown } from '@/components/markdown/render'
import { Field } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { S2_Value } from '@/components/ui/s2-value'

import { NoteData } from '@/lib/schemas/note'
import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { NotesModule_DeleteNote } from './delete-note'


export function NotesModule_ViewNote({ note, organization }: { note: NoteData, organization: OrganizationData }) {

    return <div className="flex flex-col gap-2">
        <div className="flex w-full justify-between">
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button variant="outline" size="icon" asChild>
                        <Link to={Paths.org(organization.slug).notes}>
                            <MoveLeftIcon/>
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    Back to list
                </TooltipContent>
            </Tooltip>
            
            <ButtonGroup>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).notes.note(note.noteId).update}>
                        <PencilIcon/> Edit
                    </Link>
                </S2_Button>
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant="outline" size="icon">
                                <MoreVerticalIcon/>
                            </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to={Paths.org(organization.slug).notes.note(note.noteId).history}>
                                        <ClipboardClockIcon/>
                                        View History
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                <DialogTrigger>
                                    <DropdownMenuItem className="text-destructive">
                                        <TrashIcon/>
                                        Delete Note
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <NotesModule_DeleteNote 
                        noteId={note.noteId} 
                        orgId={organization.orgId} 
                        onDeletePath={Paths.org(organization.slug).notes}
                    />
                </Dialog>
                
            </ButtonGroup>
            
        </div>
        <S2_Card className="gap-0 max-h-[calc(100vh-var(--header-height)-var(--spacing))]">
            <S2_CardHeader>
                <S2_CardTitle className="self-stretch">
                    <Field>
                        <S2_Value value={note.title} className="px-2"/>
                    </Field>
                </S2_CardTitle>
            </S2_CardHeader>
            <S2_CardContent>
                <RenderMarkdown markdown={note.content} />
            </S2_CardContent>
        </S2_Card>
    </div>
}