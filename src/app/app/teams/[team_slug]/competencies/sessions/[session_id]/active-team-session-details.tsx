/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatISO } from 'date-fns'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import { Protect } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'


import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/controls/date-picker'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function ActiveTeam_SessionDetails_Card({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.activeTeam.skillCheckSessions.getSession.queryOptions({ sessionId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')
    
    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Protect role="org:admin">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setMode('Update')} disabled={mode == 'Update'}>
                                <PencilIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit session details</TooltipContent>
                    </Tooltip>
                    <DeleteSessionDialog session={session} />
                    <Separator orientation="vertical" />
                    <CardExplanation>
                        This card displays the details of the skill check session. You can edit the session details or delete the session entirely.
                    </CardExplanation>
                </Protect>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow 
                            label="Session ID" 
                            control={<DisplayValue>{session.sessionId}</DisplayValue>}
                        />
                        <ToruGridRow 
                            label="Name" 
                            control={<DisplayValue>{session.name}</DisplayValue>}
                        />
                        <ToruGridRow 
                            label="Date" 
                            control={<DisplayValue>{formatISO(new Date(session.date), { representation: 'date' })}</DisplayValue>}
                        />
                        <ToruGridRow 
                            label="Status" 
                            control={<DisplayValue>{session.sessionStatus}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                )
                .with('Update', () => 
                    <UpdateSession_Form onClose={() => setMode('View')} session={session} />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
    
}

const formSchema = skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true })
type FormData = z.infer<typeof formSchema>

function UpdateSession_Form({ onClose, session }: { onClose: () => void, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const queryKey = trpc.activeTeam.skillCheckSessions.getSession.queryKey({ sessionId: session.sessionId })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionId: session.sessionId,
            name: session.name,
            date: session.date,
        }
    })

    const mutation = useMutation(trpc.activeTeam.skillCheckSessions.updateSession.mutationOptions({
        async onMutate({ sessionId, ...formData }) {

            await queryClient.cancelQueries(trpc.activeTeam.skillCheckSessions.getSession.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData(queryKey)

            if(previousData) {
                queryClient.setQueryData(queryKey, { ...previousData, ...formData })
            }

            onClose()
            return { previousData }
        },
        onError: (error, data, context) => {
            queryClient.setQueryData(queryKey, context?.previousData)

            toast({
                title: "Error updating session",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                title: "Session updated",
                description: `The session ${session.name} has been updated successfully.`,
            })

            queryClient.invalidateQueries(trpc.activeTeam.skillCheckSessions.getTeamSessions.queryFilter())
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.activeTeam.skillCheckSessions.getSession.queryFilter({ sessionId: session.sessionId }))
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <ToruGrid mode="form">
                <FormField
                    control={form.control}
                    name="sessionId"
                    render={() => <ToruGridRow
                        label="Session ID"
                        control={<DisplayValue>{session.sessionId}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => <ToruGridRow
                        label="Name"
                        control={<Input maxLength={100} {...field} />}
                        description="The name of the skill check session."
                    />}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => <ToruGridRow
                        label="Date"
                        control={<DatePicker {...field} onValueChange={field.onChange}/>}
                        description="The date when the session takes place."
                    />}
                />
                <ToruGridRow
                    label="Status"
                    control={<DisplayValue>{session.sessionStatus}</DisplayValue>}
                />
                <ToruGridFooter>
                    <FormSubmitButton labels={SubmitVerbs.update} size="sm" requireDirty/>
                    <FormCancelButton onClick={onClose} size="sm"/>
                </ToruGridFooter>
            </ToruGrid>
        </Form>
    </FormProvider>
}

function DeleteSessionDialog({ session }: { session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [open, setOpen] = useState(false)
    
    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())

    const form = useForm({
        resolver: zodResolver(z.object({
            sessionId: zodNanoId8,
            sessionName: z.literal(session.name)
        })),
        mode: 'onSubmit',
        defaultValues: { sessionId: session.sessionId, sessionName: "" }
    })

    const mutation = useMutation(trpc.activeTeam.skillCheckSessions.deleteSession.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting session',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        onSuccess(result) {
            toast({
                title: 'Session deleted',
                description: <>The session <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            setOpen(false)
            router.push(Paths.team(team).competencies.sessions.index)

            queryClient.invalidateQueries(trpc.activeTeam.skillCheckSessions.getTeamSessions.queryFilter())
            queryClient.setQueryData(trpc.activeTeam.skillCheckSessions.getSession.queryKey({ sessionId: session.sessionId }), undefined)
        },
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete session">
            <TrashIcon/>    
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Session</DialogTitle>
                <DialogDescription>This will remove the skill check session from the team forever (which is a really long time).</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                        <FormItem>
                            <FormLabel>Session</FormLabel>
                            <FormControl>
                                <DisplayValue>{session.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="sessionName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Enter name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="Type the session name to confirm" 
                                        maxLength={100} 
                                        autoComplete="off" 
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormActions>
                            <FormSubmitButton 
                                labels={SubmitVerbs.delete} 
                                color="destructive"
                            />
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>
}