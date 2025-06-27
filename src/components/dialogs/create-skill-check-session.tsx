/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { format, parseISO } from 'date-fns'
import { ComponentProps, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { SkillCheckSessionFormData, skillCheckSessionFormSchema } from '@/lib/forms/skill-check-session'
import { nanoId8 } from '@/lib/id'
import { SkillCheckSessionWithCounts, useTRPC } from '@/trpc/client'

type CreateSkillCheckSessionProps = {
    onCreate?: (session: SkillCheckSessionWithCounts) => void
}

export function CreateSkillCheckSessionDialog({ onCreate, ...props }: ComponentProps<typeof Dialog> & CreateSkillCheckSessionProps) {

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Skill Check Session</DialogTitle>
                <DialogDescription>
                    Create a new skill check session to input skill checks for a specific set of members and skills.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <CreateSkillCheckSessionForm
                    onClose={() => props.onOpenChange?.(false)}
                    onCreate={onCreate}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

function CreateSkillCheckSessionForm({ onClose, onCreate }: CreateSkillCheckSessionProps & { onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const sessionId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillCheckSessionFormData>({
        resolver: zodResolver(skillCheckSessionFormSchema),
        defaultValues: {
            sessionId,
            name: format(new Date(), 'yyyy-MM-dd'),
            date: format(new Date(), 'yyyy-MM-dd'),
            sessionStatus: 'Draft'
        }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillCheckSessions.mySessions.create.mutationOptions({
        async onMutate({ sessionId, date: dateString, ...data }) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.mySessions.all.queryFilter())

            const previousSessions = queryClient.getQueryData(trpc.skillCheckSessions.mySessions.all.queryKey())
    
            const now = new Date()
            queryClient.setQueryData(trpc.skillCheckSessions.mySessions.all.queryKey(), (old: SkillCheckSessionWithCounts[] = []) => {
                return [...old, {id: sessionId, ...data, assessorId: "", date: parseISO(dateString), createdAt: now, updatedAt: now, _count: { skills: 0, assessees: 0, checks: 0 } }]
            })

            return { previousSessions }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.mySessions.all.queryKey(), context?.previousSessions)
            toast({
                title: 'Error Creating Session',
                description: error.message,
                variant: 'destructive'
            })
            handleClose()
        },
        onSuccess(result) {
            toast({
                title: 'Session Created',
                description: `The skill check session "${result.name}" has been created.`,
            })
            handleClose()
            onCreate?.(result)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.mySessions.all.queryFilter())
        },
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) =>
                    <FormItem>
                        <FormLabel>Session Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter session name" />
                        </FormControl>
                        <FormDescription>A name for the session.</FormDescription>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Session Date</FormLabel>
                        <FormControl>
                            <DatePicker {...field}/>
                        </FormControl>
                        <FormDescription>The date of the session.</FormDescription>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}