/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { MoveLeftIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { omit } from 'remeda'
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
import { Link } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData, SkillCheckSessionId, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { formatDate } from '@/lib/utils'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Value } from '@/components/ui/s2-value'
import { Lexington } from '@/components/blocks/lexington'
import { S2_Button } from '@/components/ui/s2-button'



export function SkillsModule_SessionDetails({ organization, sessionId }: { organization: OrganizationData, sessionId: SkillCheckSessionId }) {

    const { data: session } = useSuspenseQuery(trpc.skillChecks.getSession.queryOptions({ orgId: organization.orgId, sessionId }))

    return <div className="flex flex-col gap-2">
        
    </div>
}

const formSchema = skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true, notes: true })
type FormData = z.infer<typeof formSchema>

function UpdateSession_Form({ onClose, organization, session }: { onClose: () => void, organization: OrganizationData, session: SkillCheckSessionData}) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const queryKey = trpc.skillChecks.getSession.queryKey({ sessionId: session.sessionId })
    const queryFilter = trpc.skillChecks.getSession.queryFilter({ sessionId: session.sessionId })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionId: session.sessionId,
            name: session.name,
            date: session.date,
            notes: session.notes
        }
    })

    const mutation = useMutation(trpc.skillChecks.updateSession.mutationOptions({
        async onMutate(formData) {

            await queryClient.cancelQueries(queryFilter)

            const previousData = queryClient.getQueryData(queryKey)

            if(previousData) {
                queryClient.setQueryData(queryKey, { ...previousData, ...omit(formData, ['sessionId']) })
            }

            onClose()
            return { previousData }
        },
        onError: (error, _data, context) => {
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

            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter({  }))
        },
        onSettled() {
            queryClient.invalidateQueries(queryFilter)
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync({ ...formData, orgId: organization.orgId }))}>
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
        </form>
    </FormProvider>
}

function DeleteSessionDialog({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            sessionId: SkillCheckSessionId.schema,
            sessionName: z.literal(session.name)
        })),
        mode: 'onSubmit',
        defaultValues: { sessionId: session.sessionId, sessionName: "" }
    })

    const mutation = useMutation(trpc.skillChecks.deleteSession.mutationOptions({
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
            router.push(Paths.org(organization.slug).skills.sessions.href)

            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter({ }))
            queryClient.setQueryData(trpc.skillChecks.getSession.queryKey({ sessionId: session.sessionId }), undefined)
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
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
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