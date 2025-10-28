/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { NoteId, noteSchema } from '@/lib/schemas/note'
import { OrganizationData } from '@/lib/schemas/organization'
import { updateMetaSchema } from '@/lib/schemas/update-meta'
import { toUserRef } from '@/lib/schemas/user'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { NotesModule_NoteForm } from '../note-form'




export function NotesModule_NewNote_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const { data: user } = useSuspenseQuery(trpc.users.getCurrentUser.queryOptions())

    const noteId = useMemo(() => NoteId.create(), [])

    

    const mutation = useMutation(trpc.notes.createNote.mutationOptions({
        async onMutate(data) {

            const now = new Date().toISOString()
            const userRef = toUserRef(user)

            const newNote = noteSchema.parse(data)
            const listEntry = noteSchema.pick({ noteId: true, title: true, status: true}).merge(updateMetaSchema).parse({
                ...data,
                createdAt: now, createdBy: userRef,
                updatedAt: now, updatedBy: userRef,
            })

            const previousList = queryClient.getQueryData(trpc.notes.getNotes.queryKey({ orgId: data.orgId }))

            queryClient.setQueryData(trpc.notes.getNote.queryKey({ orgId: data.orgId, noteId: newNote.noteId }), newNote)
            queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId: data.orgId }), (oldNotes = []) => 
                [listEntry, ...oldNotes]
            )

            router.push(Paths.org(organization.slug).notes.note(newNote.noteId).href)

            return { previousList }
        },
        async onError(error, data, context) {
            if (context?.previousList) {
                queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId: organization.orgId }), context.previousList)
            }
            queryClient.resetQueries(trpc.notes.getNote.queryFilter({ orgId: organization.orgId, noteId: data.noteId }))

            toast({
                title: 'Error creating note',
                description: error.message,
                variant: 'destructive',
            })
        },
        async onSuccess(data) {
            toast({
                title: `Note created`,
            })

            queryClient.invalidateQueries(trpc.notes.getNotes.queryFilter({ orgId: organization.orgId }))

           
        }
    }))

    return <NotesModule_NoteForm
        cancelPath={Paths.org(organization.slug).notes}
        listPath={Paths.org(organization.slug).notes}
        note={{ noteId, title: '', content: '', tags: [], properties: {}, status: 'Published' }}
        onSubmit={async (data) => {
            await mutation.mutateAsync({ ...data, orgId: organization.orgId })
        }}
    />
}
                    