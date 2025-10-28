/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { S2_Button } from '@/components/ui/s2-button'

import { useToast } from '@/hooks/use-toast'
import { NoteId } from '@/lib/schemas/note'
import { OrganizationId } from '@/lib/schemas/organization'
import { trpc } from '@/trpc/client'


interface DeleteNoteProps {
    noteId: NoteId
    orgId: OrganizationId
    onDeletePath: { href: string }
}

export function NotesModule_DeleteNote({ noteId, orgId, onDeletePath }: DeleteNoteProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const mutation = useMutation(trpc.notes.deleteNote.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.notes.getNotes.queryFilter({ orgId }))
            await queryClient.cancelQueries(trpc.notes.getNote.queryFilter({ orgId, noteId }))

            const previousList = queryClient.getQueryData(trpc.notes.getNotes.queryKey({ orgId }))
            const previousNote = queryClient.getQueryData(trpc.notes.getNote.queryKey({ orgId, noteId }))

            queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId }), (oldNotes = []) =>
                oldNotes.filter(n => n.noteId !== noteId)
            )
            queryClient.removeQueries(trpc.notes.getNote.queryFilter({ orgId, noteId }))

            router.push(onDeletePath.href)

            return { previousList, previousNote }
        },
        onError(error, data, context) {
            if (context) {
                queryClient.setQueryData(trpc.notes.getNotes.queryKey({ orgId: data.orgId }), context.previousList)
                queryClient.setQueryData(trpc.notes.getNote.queryKey({ orgId: data.orgId, noteId: data.noteId }), context.previousNote)
            }

            toast({
                title: 'Error deleting note',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(data) {
            toast({
                title: 'Note deleted',
                description: `The note "${data.title}" has been successfully deleted.`,
            })
        },
        async onSettled() {
            queryClient.invalidateQueries(trpc.notes.getNotes.queryFilter({ orgId }))
        }

    }))

    return <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <DialogClose asChild>
                <S2_Button variant="outline">
                    Cancel
                </S2_Button>
            </DialogClose>
            
            <DialogClose asChild>
                <S2_Button variant="destructive" onClick={() => mutation.mutate({ orgId, noteId })}>
                    Delete
                </S2_Button>
            </DialogClose>
        </DialogFooter>
    </DialogContent>
}