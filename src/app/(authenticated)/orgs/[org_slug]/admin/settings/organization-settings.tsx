/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useForm } from 'react-hook-form'


import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { FloatingFooter } from '@/components/footer'
import { Heading} from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { organizationSettingsSchema } from '@/lib/schemas/settings'
import { trpc } from '@/trpc/client'

import { Settings_D4hIntegration_Card } from './d4h-integration'
import { Settings_DefaultValues_Card } from './default-values'
import { Settings_EnabledModules_Card } from './enabled-modules'
import { Settings_NotesModule_Card } from './notes-module'
import { Settings_SkillsModule_Card } from './skills-module'
import { Settings_SkillPackageManagerModule_Card } from './skill-package-manager-module'




export function AdminModule_OrganizationSettings_Form({ organization }: {organization: OrganizationData  }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: orgSettings } = useSuspenseQuery(trpc.settings.getOrganizationSettings.queryOptions({ orgId: organization.orgId }))

    const form = useForm({
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
            <Heading level={2}>General Settings</Heading>

            <Settings_DefaultValues_Card form={form} />
        </section>
        

        <section className="space-y-4">
            <Heading level={2}>Modules</Heading>

            <Settings_EnabledModules_Card form={form} />

             <Settings_NotesModule_Card form={form} />
            <Settings_SkillPackageManagerModule_Card form={form} />
            <Settings_SkillsModule_Card form={form} />
        </section>

        <section className="space-y-4">
            <Heading level={2}>Integrations</Heading>
            <Settings_D4hIntegration_Card form={form} />
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
