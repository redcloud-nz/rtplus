/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { DeleteObjectIcon, DropdownMenuTriggerIcon, DuplicateObjectIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/s2-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { RainbowSpinner } from '@/components/ui/loading'
import { Spinner } from '@/components/ui/spinner'
import { S2_Value } from '@/components/ui/s2-value'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function SkillModule_SessionDropdownMenu({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <S2_Button variant="outline" size="icon">
                    <DropdownMenuTriggerIcon/>
                </S2_Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Session</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem disabled>
                        <DuplicateObjectIcon/> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                        <DeleteObjectIcon/> Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <DeleteSessionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            organization={organization}
            session={session} 
        />
    </>
}

function DeleteSessionDialog({ session, organization, ...props }: Omit<ComponentProps<typeof Dialog>, 'children'> & { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const router = useRouter()

    const [deleteChecks, setDeleteChecks] = useState(false)

    const { data: checks = [], isLoading } = useQuery(trpc.skillChecks.getSessionChecks.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }))

    const canDeleteSession = !isLoading && (checks.length === 0 || deleteChecks)

    const mutation = useMutation(trpc.skillChecks.deleteSession.mutationOptions({
        async onMutate() {
            props.onOpenChange?.(false)

            await queryClient.cancelQueries(trpc.skillChecks.getSessions.queryFilter({ orgId: organization.orgId }))
            await queryClient.cancelQueries(trpc.skillChecks.getSession.queryFilter({ orgId: organization.orgId, sessionId: session.sessionId }))

            const prevSessions = queryClient.getQueryData(trpc.skillChecks.getSessions.queryKey({ orgId: organization.orgId }))
            const prevSession = queryClient.getQueryData(trpc.skillChecks.getSession.queryKey({ orgId: organization.orgId, sessionId: session.sessionId }))
            
            // Remove the session optimistically
            queryClient.setQueryData(trpc.skillChecks.getSessions.queryKey({ orgId: organization.orgId }), (oldSessions: SkillCheckSessionData[] = []) => 
                oldSessions.filter(s => s.sessionId != session.sessionId)
            )
            queryClient.removeQueries(trpc.skillChecks.getSession.queryFilter({ orgId: organization.orgId, sessionId: session.sessionId }))

            
            router.push(Paths.org(organization.slug).skills.sessions.href)
            return { prevSessions, prevSession }
        },

        onError(error, _variables, context) {
            if(context?.prevSessions) {
                queryClient.setQueryData(trpc.skillChecks.getSessions.queryKey({ orgId: organization.orgId }), context.prevSessions)
            }
            if(context?.prevSession) {
                queryClient.setQueryData(trpc.skillChecks.getSession.queryKey({ orgId: organization.orgId, sessionId: session.sessionId }), context.prevSession)
            }

            toast({
                title: 'Error deleting skill check session',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            toast({
                title: 'Skill Check Session Deleted',
                description: `The skill check session "${session.name}" has been deleted.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessions.queryFilter({ orgId: organization.orgId }))
        }
    }))

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Check Session</DialogTitle>
                <DialogDescription>Are you sure you want to delete this skill check session? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            

            { isLoading
                ? <div className="flex items-center py-4">
                    <RainbowSpinner/>
                </div>
                : <>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldLabel>Session ID</FieldLabel>
                            <S2_Value value={session.sessionId}/>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Session Name</FieldLabel>
                            <S2_Value value={session.name}/>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Date</FieldLabel>
                            <S2_Value value={session.date}/>
                        </Field>
                        <Field orientation="responsive">
                            <FieldLabel>Status</FieldLabel>
                            <S2_Value value={session.sessionStatus}/>
                        </Field>

                        {checks.length > 0 && <>
                            <FieldSeparator/>

                            <Field orientation="horizontal">
                                <Checkbox id="delete-session-recorded-checks" checked={deleteChecks} onCheckedChange={newValue => setDeleteChecks(newValue === true)}/>
                                <FieldContent>
                                    <FieldLabel htmlFor="delete-session-recorded-checks">Delete Recorded Checks</FieldLabel>
                                    <FieldDescription>Are you sure you want to delete all <span className="font-bold">{checks.length}</span> skill-checks recorded in this session?</FieldDescription>
                                </FieldContent>
                            </Field>
                        </>}

                    </FieldGroup>
                    <DialogFooter>
                        <S2_Button 
                            variant="destructive"
                            disabled={!canDeleteSession || mutation.isPending}
                            onClick={() => mutation.mutate({ orgId: organization.orgId, sessionId: session.sessionId })}
                        >
                            {mutation.isPending && <Spinner/>}
                            Delete
                        </S2_Button>
                        <DialogClose asChild>
                            <S2_Button variant="outline">Cancel</S2_Button>
                        </DialogClose>
                    </DialogFooter>
                </>
            }
            
        </DialogContent>
    </Dialog>
}