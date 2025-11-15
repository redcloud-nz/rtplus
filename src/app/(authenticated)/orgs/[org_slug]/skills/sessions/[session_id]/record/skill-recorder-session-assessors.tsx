/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Boundary } from '@/components/boundary'
import { FloatingFooter } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonRef } from '@/lib/schemas/person'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'



/**
 * Skill Recorder Tab that allows managing the assessors assigned to a skill check session.
 */
export default function SkillRecorder_Session_Assessors({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const queryKey = trpc.skillChecks.getSessionAssignedAssessors.queryKey({ sessionId: session.sessionId })

    const { data: assignedAssessors } = useSuspenseQuery(trpc.skillChecks.getSessionAssignedAssessors.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId }))

    const [selectedAssessors, setSelectedAssessors] = useState<string[]>(assignedAssessors.map(a => a.personId))
    const [changes, setChanges] = useState<{ added: string[], removed: string[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedAssessors(assignedAssessors.map(a => a.personId))
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillChecks.updateSessionAssessors.mutationOptions({
        async onMutate({ additions, removals }) {
            await queryClient.cancelQueries(trpc.skillChecks.getSessionAssignedAssessors.queryFilter({ sessionId: session.sessionId }))

            const previousData = queryClient.getQueryData(queryKey)
            queryClient.setQueryData(queryKey, (old = []) => 
                [...old.filter(a => !removals.includes(a.personId)), ...additions.map(personId => ({ personId, name: 'Loading...' } as { personId: string, name: string, email: string } as PersonRef)) ]
            )
            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(queryKey, context?.previousData)
            toast({
                title: "Error updating assessees",
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessionAssignedAssessors.queryFilter({ orgId: organization.orgId, sessionId: session.sessionId }))
        }
    }))

    function handleCheckedChange(assesseeId: string): (checked: boolean) => void {
        return (checked) => {
            if (checked) {
                setSelectedAssessors(prev => [...prev, assesseeId])
                setChanges(prev => {
                    if(prev.removed.includes(assesseeId)) {
                        // If the skill was previously removed, clear the removal
                        return { added: prev.added, removed: prev.removed.filter(id => id !== assesseeId) }
                    } else {
                        return { added: [...prev.added, assesseeId], removed: prev.removed }
                    }
                })
            } else {
                setSelectedAssessors(prev => prev.filter(id => id !== assesseeId))
                setChanges(prev => {
                    if(prev.added.includes(assesseeId)) {
                        // If the skill was previously added, clear the addition
                        return { added: prev.added.filter(id => id !== assesseeId), removed: prev.removed }
                    } else {
                        return { added: prev.added, removed: [...prev.removed, assesseeId] }
                    }
                })
            }
        }
    }

    const isDirty = changes.added.length > 0 || changes.removed.length > 0

    return <ScrollArea style={{ height: `calc(100vh - var(--header-height))` }} className="pl-4 pr-3 [&>[data-slot=scroll-area-viewport]]:pb-8">
        <div className="flex flex-col divide-y divide-border">
            <Boundary>
                <AvailablePersonnel
                    organization={organization}
                    sessionId={session.sessionId}
                    assignedAssessors={assignedAssessors.map(a => a.personId)}
                    selectedAssessors={selectedAssessors}
                    onSelectedChange={handleCheckedChange}
                />
            </Boundary>
            {/* We could support multiple teams here in future. */}
        </div>

        <FloatingFooter open={isDirty || mutation.isPending}>
            {mutation.isPending ?
                <div className="animate-pulse text-sm text-muted-foreground p-2">Saving changes...</div>
                : <>
                    <Button 
                        size="sm"
                        color="blue"
                        onClick={() => mutation.mutate({ orgId: organization.orgId, sessionId: session.sessionId, additions: changes.added, removals: changes.removed })}
                        disabled={!isDirty}
                    >Save</Button>
                        
                    <Button
                        size="sm"
                        color="red"
                        disabled={!isDirty}
                        onClick={handleReset}
                    >Reset</Button>
                    <div className="w-16 flex items-center justify-center gap-2">
                        {changes.added.length > 0 && <div className="text-green-600">+{changes.added.length}</div>}
                        {changes.removed.length > 0 && <div className="text-red-600">-{changes.removed.length}</div>}
                    </div>
                </>
            }
        </FloatingFooter>
    </ScrollArea>
}

interface AvailablePersonnelProps {
    organization: OrganizationData
    sessionId: string
    assignedAssessors: string[]
    selectedAssessors: string[]
    onSelectedChange: (assesseeId: string) => (checked: boolean) => void
}

function AvailablePersonnel({ organization, assignedAssessors, selectedAssessors, onSelectedChange }: AvailablePersonnelProps) {

    const { data: personnel } = useSuspenseQuery(trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }))

    const users = personnel.filter(p => p.userId !== null)

    const selected = users.filter(m => selectedAssessors.includes(m.personId))

    return <div className="py-4">
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{selected.length} selected</div>
        </div>
        <ul className="pl-4">
            {users
                .map(user => <PersonRow
                    key={user.personId}
                    person={user}
                    assigned={assignedAssessors.includes(user.personId)}
                    selected={selectedAssessors.includes(user.personId)}
                    onSelectedChange={onSelectedChange(user.personId)}
                />)
            }
        </ul>
    </div>
}

interface PersonRowProps {
    person: { personId: string, name: string }
    assigned: boolean
    selected: boolean
    onSelectedChange: (checked: boolean) => void
}

function PersonRow({ person, assigned, selected, onSelectedChange }: PersonRowProps) {
    return <li className="flex items-center gap-2">
        <Label htmlFor={`person-${person.personId}`} className="py-2 truncate grow">{person.name}</Label>
        <Checkbox
            id={`person-${person.personId}`}
            checked={selected}
            onCheckedChange={onSelectedChange}
        />
        <div className="w-4">
            {selected && !assigned && <span className="text-green-600 font-mono text-md">+</span>}
            {!selected && assigned && <span className="text-red-600 font-mono text-md">-</span>}
        </div>
    </li>
}