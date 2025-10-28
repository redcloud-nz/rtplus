/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import  { NoteData, noteSchema } from '@/lib/schemas/note'
import { OrganizationData } from '@/lib/schemas/organization'
import { updateMetaSchema } from '@/lib/schemas/update-meta'
import { toUserRef } from '@/lib/schemas/user'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { NotesModule_NoteForm } from '../../note-form'



export function NotesModule_UpdateNote({ note, organization }: { note: NoteData, organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: user } = useSuspenseQuery(trpc.users.getCurrentUser.queryOptions())

    const mutation = useMutation(trpc.notes.updateNote.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.notes.getNotes.queryFilter({ orgId: data.orgId }))

            const previousNote = queryClient.getQueryData(trpc.notes.getNote.queryKey({ orgId: data.orgId, noteId: data.noteId }))
            
            const previousList = queryClient.getQueryData(trpc.notes.getNotes.queryKey({ orgId: data.orgId }))
            const previousListEntry = previousList?.find(n => n.noteId === data.noteId)

            const updatedNote = noteSchema.parse(data)
            const updatedListEntry = noteSchema.pick({ noteId: true, title: true, status: true}).merge(updateMetaSchema).parse({
                ...data,
                // Preserve original creation meta
                createdAt: previousListEntry?.createdAt ?? null,
                createdBy: previousListEntry?.createdBy ?? null,
                // Set update meta
                updatedAt: (new Date()).toISOString(),
                updatedBy: toUserRef(user),
            })

            // Update the individual note cache
            queryClient.setQueryData(trpc.notes.getNote.queryKey({ orgId: data.orgId, noteId: data.noteId }), updatedNote)

            // Update the notes list cache
            queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId: data.orgId }), (oldNotes = []) => 
                [updatedListEntry, ...oldNotes.filter(n => n.noteId !== data.noteId)]
            )

            router.push(Paths.org(organization.slug).notes.note(data.noteId).href)

            return { previousNote, previousList }
        },
        async onError(error, data, context) {
            if (context?.previousList) {
                queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId: organization.orgId }), context.previousList)
            }
            if(context?.previousNote) {
                queryClient.setQueryData(trpc.notes.getNote.queryKey({ orgId: organization.orgId, noteId: data.noteId }), context.previousNote)
            }
            
            toast({
                title: 'Error creating note',
                description: error.message,
                variant: 'destructive',
            })
        },
        async onSuccess(data) {
            toast({
                title: `Note(${data.noteId}) updated`,
            })

            queryClient.invalidateQueries(trpc.notes.getNotes.queryFilter({ orgId: organization.orgId }))
        }
    }))

    return <NotesModule_NoteForm
        cancelPath={Paths.org(organization.slug).notes.note(note.noteId)}
        listPath={Paths.org(organization.slug).notes}
        note={note}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}
                    