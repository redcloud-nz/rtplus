/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button2 } from '@/components/ui/button2'
import { Card2, Card2Content, Card2Description, Card2Footer, Card2Header, Card2Title, } from '@/components/ui/card2'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

import { useToast } from '@/hooks/use-toast'
import { Modules } from '@/lib/schemas/modules'
import { organizationSettingsSchema } from '@/lib/schemas/settings'
import { trpc } from '@/trpc/client'



const schema = organizationSettingsSchema.pick({ enabledModules: true })


export function EnabledModulesForm() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: orgSettings } = useSuspenseQuery(trpc.settings.getOrganizationSettings.queryOptions())

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { enabledModules: orgSettings.enabledModules },
    })

    const mutation = useMutation(trpc.settings.updateEnabledModules.mutationOptions({
        onSuccess(update) {
            toast({ title: 'Success', description: 'Enabled modules updated successfully.' })

            form.reset({ ...update })
        },
        onError(error) {
            toast({
                title: 'Error updating enabled modules',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.settings.getOrganizationSettings.queryFilter())
        }
    }))

    return <Card2 id="enabled-modules">
        <Card2Header>
            <Card2Title>Modules</Card2Title>
            <Card2Description>Enable or disable optional modules for your organisation.</Card2Description>
        </Card2Header>
        <Card2Content>
            <form id="enabled-modules-form" onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
                <FieldGroup>
                    <Controller
                        name="enabledModules"
                        control={form.control}
                        render={({ field, fieldState }) => <FieldSet>
                            <FieldLegend variant="label">Avavilable Modules</FieldLegend>
                            <FieldGroup data-slot="checkbox-group">
                                {Modules.map(module => <Field 
                                    key={module.moduleId} 
                                    data-invalid={fieldState.invalid}
                                    orientation='horizontal'
                                >
                                    <Checkbox 
                                        id={`enable-${module.moduleId}-module`}
                                        name={field.name}
                                        aria-invalid={fieldState.invalid}
                                        checked={field.value.includes(module.moduleId)}
                                        onCheckedChange={checked => {
                                            field.onChange(checked
                                                ? [...field.value, module.moduleId]
                                                : field.value.filter(v => v !== module.moduleId)
                                            )
                                        }}
                                    />
                                    <FieldLabel htmlFor={`enable-${module.moduleId}-module`} className="font-normal">{module.label}</FieldLabel>
                                    
                                </Field>)}
                            </FieldGroup>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                        </FieldSet>}
                    />
                </FieldGroup>
            </form>
        </Card2Content>
        <Card2Footer>
            <Field orientation="horizontal">
                <Button2 
                    type="submit" 
                    form="enabled-modules-form"
                    disabled={!form.formState.isDirty || mutation.isPending}
                >{mutation.isPending ? <><Spinner/> Saving...</> : 'Save'}</Button2>
                <Button2 type="button" variant="outline" onClick={() => form.reset()} disabled={!form.formState.isDirty}>Reset</Button2>
            </Field>
        </Card2Footer>
    </Card2>
}