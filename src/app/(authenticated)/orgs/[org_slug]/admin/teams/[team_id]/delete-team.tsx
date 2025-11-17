/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/s2-dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ObjectName } from '@/components/ui/typography'
import { S2_Value } from '@/components/ui/s2-value'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData, OrganizationId } from '@/lib/schemas/organization'
import { TeamData } from '@/lib/schemas/team'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function AdminModule_DeleteTeam_Dialog({ organization, team, ...props }: Omit<ComponentProps<typeof Dialog>, 'children'> & { organization: OrganizationData, team: TeamData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(z.object({
            orgId: OrganizationId.schema,
            teamId: zodNanoId8,
            teamName: z.literal(team.name)
        })),
        defaultValues: { orgId: organization.orgId, teamId: team.teamId, teamName: "" }
    })

    const mutation = useMutation(trpc.teams.deleteTeam.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting team',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Team deleted',
                description: <>The team <ObjectName>{team.name}</ObjectName> has been deleted.</>,
            })
            props.onOpenChange?.(false)
            router.push(Paths.org(organization.slug).admin.teams.href)

            queryClient.invalidateQueries(trpc.teams.getTeams.queryFilter({ orgId: organization.orgId }))
            queryClient.setQueryData(trpc.teams.getTeam.queryKey({ orgId: organization.orgId, teamId: team.teamId }), undefined)
        }
    }))

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
                <DialogDescription>
                    Please confirm that you want to delete the team <ObjectName>{team.name}</ObjectName>. This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                <FieldGroup>
                    <Field orientation="responsive">
                        <FieldLabel>Team</FieldLabel>
                        <S2_Value value={team.name} className="min-w-1/2"/>
                    </Field>
                    <Controller
                        name="teamName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field orientation="responsive">
                                <FieldContent>
                                    <FieldLabel htmlFor='delete-team-confirm-name'>Confirm Team Name</FieldLabel>
                                    <FieldDescription>
                                        Type the team name <ObjectName>{team.name}</ObjectName> to confirm.
                                    </FieldDescription>
                                    { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <Input 
                                    {...field} 
                                    id="delete-team-confirm-name"
                                    aria-invalid={fieldState.invalid}
                                    className="min-w-1/2"
                                />
                            </Field>
                        )}
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit" 
                            variant="destructive"
                            disabled={mutation.isPending}
                        >
                            { mutation.isPending ? <><Spinner /> Deleting...</> : 'Delete' }
                            
                        </S2_Button>
                        <DialogClose asChild>
                            <S2_Button variant="outline">Cancel</S2_Button>
                        </DialogClose>
                    </Field>
                </FieldGroup>
            </form>
        </DialogContent>
    </Dialog>
}