/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatISO } from 'date-fns'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { useTRPC } from '@/trpc/client'
import { DL } from '@/components/ui/description-list'



export function InfoTabContent({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: session } = useSuspenseQuery(trpc.skillCheckSessions.mySessions.byId.queryOptions({ sessionId }))
    
    const form = useForm({
        resolver: zodResolver(skillCheckSessionSchema),
        defaultValues: {
            sessionId: session.id,
            name: session.name,
            date: session.date,
            sessionStatus: session.sessionStatus,
        },
    })

    return <Card>
        <CardHeader>
            <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form>
                    <DL>
                        
                    </DL>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <DatePicker 
                                    value={formatISO(field.value, { representation: 'date' })} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>}
                    />
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
    
}