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
import { Card2, Card2Content, Card2Description, Card2Header, Card2Title } from '@/components/ui/card2'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { FloatingFooter } from '@/components/footer'
import { Switch } from '@/components/ui/switch'
import { Heading, Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { OrganizationSettingsData, organizationSettingsSchema } from '@/lib/schemas/settings'
import { trpc } from '@/trpc/client'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/items'



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

        <Card2>
            <Card2Header>
                <Card2Title>Modules</Card2Title>
                <Card2Description>
                    Manage the modules enabled for your organization.
                </Card2Description>
            </Card2Header>
            <Card2Content>
                <FieldGroup>
                    <Controller
                        name="modules.d4h.enabled"
                        control={form.control}
                        render={({ field, fieldState }) => <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor="d4h-module-enabled">D4H Integration</FieldLabel>
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
                    <Controller
                        name="modules.notes.enabled"
                        control={form.control}
                        render={({ field, fieldState }) => <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor="notes-module-enabled">Notes</FieldLabel>
                            </FieldContent>
                            <Switch
                                id="notes-module-enabled"
                                name={field.name}
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </Field>
                    }/>
                    <Controller
                        name="modules.skills.enabled"
                        control={form.control}
                        render={({ field, fieldState }) => <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor="skills-module-enabled">Skills</FieldLabel>
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
                    <Controller
                        name="modules.spm.enabled"
                        control={form.control}
                        render={({ field, fieldState }) => <Field orientation="horizontal">
                            <FieldContent>
                                <FieldLabel htmlFor="spm-module-enabled">Skill Package Manager</FieldLabel>
                            </FieldContent>
                            <Switch
                                id="spm-module-enabled"
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
