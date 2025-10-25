/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { Controller, useForm } from 'react-hook-form'


import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card2, Card2Content } from '@/components/ui/card2'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { FloatingFooter } from '@/components/footer'
import { Switch } from '@/components/ui/switch'
import { Heading, Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { OrganizationSettingsData, organizationSettingsSchema } from '@/lib/schemas/settings'
import { trpc } from '@/trpc/client'



export function OrganizationSettings({ organization }: {organization: OrganizationData  }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: orgSettings } = useSuspenseQuery(trpc.settings.getOrganizationSettings.queryOptions({ orgId: organization.orgId }))

    const form = useForm<OrganizationSettingsData>({
        resolver: zodResolver(organizationSettingsSchema),
        defaultValues: { ...orgSettings },
    })

    const mutation = useMutation(trpc.settings.updateOrganizationSettings.mutationOptions({
        onSuccess(update) {
            toast({ title: 'Success', description: 'Organization settings updated successfully.' })

            form.reset({ ...update })
        },
        onError(error) {
            toast({
                title: 'Error updating organization settings',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.settings.getOrganizationSettings.queryFilter())
        }
    }))

    return <form id="organization-settings-form" className="space-y-8" onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
        <section className="space-y-4">
            <Heading level={2} id="modules">General Settings</Heading>
            <Paragraph>TODO</Paragraph>
        </section>

        <section className="space-y-4">
            <Heading level={2} id="d4h-module">D4H Integration Module</Heading>

            <Card2>
                <Card2Content>
                    <FieldGroup>
                        <Controller
                            name="modules.d4h.enabled"
                            control={form.control}
                            render={({ field, fieldState }) => <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldLabel htmlFor="d4h-module-enabled">Enable Module</FieldLabel>
                                    <FieldDescription>Toggle the D4H module for your organization.</FieldDescription>
                                </FieldContent>
                                <Switch
                                    id="d4h-module-enabled"
                                    name={field.name}
                                    aria-invalid={fieldState.invalid}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </Field>
                        }/>
                    </FieldGroup>
                </Card2Content>
            </Card2>
            <Show when={form.getValues("modules.d4h.enabled")}>
                <Alert severity="info" title="No settings available" className="mt-4">
                    No configurable settings are available for this module at this time.
                </Alert>
            </Show>                    
            
        </section>

        <section className="space-y-4">
            <Heading level={2} id="notes-module">Notes Module</Heading>

            <Alert severity="info" title="Module not yet available" className="mt-4">
                This module is not yet available. Please check back later.
            </Alert>

                                
        </section>

        <section className="space-y-4">
            <Heading level={2} id="skills-module">
                Skills Module
            </Heading>
            
            <Card2>
                <Card2Content>
                    <FieldGroup>
                        <Controller
                            name="modules.skills.enabled"
                            control={form.control}
                            render={({ field, fieldState }) => <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldLabel htmlFor="skills-module-enabled">Enable Module</FieldLabel>
                                    <FieldDescription>Toggle the skills module for your organization.</FieldDescription>
                                </FieldContent>
                                <Switch
                                    id="skills-module-enabled"
                                    name={field.name}
                                    aria-invalid={fieldState.invalid}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </Field>
                        }/>
                    </FieldGroup>
                </Card2Content>
            </Card2>

            <Show when={form.getValues("modules.skills.enabled")}>
                <Alert severity="info" title="No settings available" className="mt-4">
                    No configurable settings are available for this module at this time.
                </Alert>
            </Show>

            
        </section>

        <FloatingFooter open={form.formState.isDirty || mutation.isPending}>
            {mutation.isPending ?
                <div className="animate-pulse text-sm text-muted-foreground p-2">Saving changes...</div>
                : <>
                    <div className="text-sm text-white p-2">Save changes?</div>
                    <Button 
                        type="submit"
                        size="sm"
                        color="blue"
                        form="organization-settings-form"
                        
                    >Save</Button>
                        
                    <Button
                        type="button"
                        size="sm"
                        color="red"
                        onClick={() => form.reset()}
                    >Reset</Button>
                </>
            }
        </FloatingFooter>
    </form>
}
