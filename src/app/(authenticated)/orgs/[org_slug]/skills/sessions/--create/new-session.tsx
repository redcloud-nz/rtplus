/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DatePicker } from '@/components/controls/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionId, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



const formSchema = skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true, notes: true })
type FormData = z.infer<typeof formSchema>

export function SkillsModule_NewSession_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const sessionId = SkillCheckSessionId.create()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionId,
            name: '',
            date: formatISO(new Date(), { representation: 'date' }),
            notes: ""
        }
    })

    const mutation = useMutation(trpc.skillChecks.createSession.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name === 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof FormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating session",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter())
            
            toast({
                title: "Session created",
                description: `The session ${result.name} has been created successfully.`,
            })
            router.push(Paths.org(organization.slug).skills.session(sessionId).href)
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Create New Session</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
                    <ToruGrid mode="form">
                        <FormField
                            control={form.control}
                            name="sessionId"
                            render={({ field }) => <ToruGridRow
                                label="Session ID"
                                control={<DisplayValue>{field.value}</DisplayValue>}
                                description="The unique identifier for this session. It is generated automatically."
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
                                control={<DatePicker {...field} />}
                                description="The date when the session takes place."
                            />}
                        />

                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.create} size="sm"/>
                            <FormCancelButton onClick={() => router.back()} size="sm"/>
                        </ToruGridFooter>
                    </ToruGrid>
                </form>
            </FormProvider>
        </CardContent>
    </Card>
}