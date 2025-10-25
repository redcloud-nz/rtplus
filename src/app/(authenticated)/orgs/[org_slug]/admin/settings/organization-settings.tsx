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
import { Heading, Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { OrganizationSettingsData, organizationSettingsSchema } from '@/lib/schemas/settings'
import { trpc } from '@/trpc/client'

import { Settings_D4hIntegration_Card } from './d4h-integration'
import { Settings_EnabledModules_Card } from './enabled-modules'
import { Settings_NotesModule_Card } from './notes-module'
import { Settings_SkillsModule_Card } from './skills-module'
import { Settings_SkillPackageManagerModule_Card } from './skill-package-manager-module'



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

    return <form id="organization-settings-form" className="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
        
        <Heading level={2} className="col-span-full mt-4">General Settings</Heading>

        <div>
            <Heading level={3}>D4H Integration</Heading>
            <Paragraph>Configure the D4H integration settings for your organization.</Paragraph>
        </div>
        <Settings_D4hIntegration_Card form={form} />

        <Heading level={2} className="col-span-full mt-4">Modules</Heading>

         <div>
            <Heading level={3}>Enabled Modules</Heading>
            <Paragraph>Manage the modules enabled for your organization.</Paragraph>
        </div>
        <Settings_EnabledModules_Card form={form} />

        <div>
            <Heading level={3}>Notes Module</Heading>
            <Paragraph></Paragraph>
        </div>
        <Settings_NotesModule_Card form={form} />

        <div>
            <Heading level={3}>Skill Package Manager Module</Heading>
            <Paragraph></Paragraph>
        </div>
        <Settings_SkillPackageManagerModule_Card form={form} />

        <div>
            <Heading level={3}>Skills Module</Heading>
            <Paragraph></Paragraph>
        </div>
        <Settings_SkillsModule_Card form={form} />

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
