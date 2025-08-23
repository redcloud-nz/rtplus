/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { MarkdownEditor } from '@/components/markdown/editor'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormCancelButton, FormControl, FormField, FormItem, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'

import { useToast } from '@/hooks/use-toast'
import { nanoId8 } from '@/lib/id'
import { NoteData, noteSchema } from '@/lib/schemas/note'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function Personal_NewNote_Card() {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [content, setContent] = useState('')

    const noteId = useMemo(() => nanoId8(), [])

    const form = useForm<NoteData>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            noteId,
            personId: null,
            teamId: null,
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
        }
    })

    const createNoteMutation = useMutation(trpc.notes.createNote.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.notes.getPersonalNotes.queryFilter())

            const previousNotes = queryClient.getQueryData(trpc.notes.getPersonalNotes.queryKey())

            queryClient.setQueryData(trpc.notes.getPersonalNotes.queryKey(), (old: NoteData[] = []) => {
                return [
                    ...old,
                    data
                ]
            })

            return { previousNotes }
        },
        async onError(error, _data, context) {
            queryClient.setQueryData(trpc.notes.getPersonalNotes.queryKey(), context?.previousNotes)

            toast({
                title: 'Error creating note',
                description: error.message,
                variant: 'destructive',
            })
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => createNoteMutation.mutate(formData))}>
            <Card>
                <CardHeader>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    size="sm"
                                    variant="ghost"
                                    placeholder="Note title..."
                                    className="focus-visible:ring-0"
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => <FormItem>
                            <FormControl>
                                <MarkdownEditor
                                    {...field}
                                    markdown={content}
                                    onChange={setContent}
                                    placeholder="Note content..."
                                    contentEditableClassName='min-h-[100px]'
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                </CardContent>
                <CardFooter>
                    <FormSubmitButton size="sm" labels={SubmitVerbs.save}/>
                    <FormCancelButton size="sm" redirectTo={Paths.personal.notes}/>
                </CardFooter>
            </Card>
        </form>
    </FormProvider>
}
                    