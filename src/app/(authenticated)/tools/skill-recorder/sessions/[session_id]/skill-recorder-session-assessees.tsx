/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { PersonId, PersonRef } from '@/lib/schemas/person'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { TeamData } from '@/lib/schemas/team'
import { trpc } from '@/trpc/client'



export function SkillRecorder_Session_Assessees({ session }: { session: SkillCheckSessionData & { team: TeamData } }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const queryKey = trpc.skillChecks.getSessionAssignedAssessees.queryKey({ sessionId: session.sessionId })
    const queryFilter = trpc.skillChecks.getSessionAssignedAssessees.queryFilter({ sessionId: session.sessionId })

    const { data: assignedAssessees } = useSuspenseQuery(trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ sessionId: session.sessionId }))

    const [selectedAssessees, setSelectedAssessees] = useState<PersonId[]>(assignedAssessees.map(a => a.personId))
    const [changes, setChanges] = useState<{ added: PersonId[], removed: PersonId[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedAssessees(assignedAssessees.map(a => a.personId))
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillChecks.updateSessionAssessees.mutationOptions({
        async onMutate({ additions, removals }) {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries(queryFilter)

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(queryKey)

            // Optimistically update to the new value
            queryClient.setQueryData(queryKey, (old = []) => 
                [...old.filter(a => !removals.includes(a.personId)), ...additions.map(personId => ({ personId, name: 'Loading...', email: "" } as PersonRef)) ]
            )
            return { previousData }
        },
        onError(error, _data, context) {
            // Revert to the previous value
            queryClient.setQueryData(queryKey, context?.previousData)
            toast({
                title: "Error updating assessees",
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(queryFilter)
        }
    }))

    function handleCheckedChange(assesseeId: PersonId): (checked: boolean) => void {
        return (checked) => {
            if (checked) {
                // Add the assessee to the selected list
                setSelectedAssessees(prev => [...prev, assesseeId])
                setChanges(prev => {
                    if(prev.removed.includes(assesseeId)) {
                        // If the skill was previously removed, clear the removal
                        return { added: prev.added, removed: prev.removed.filter(id => id !== assesseeId) }
                    } else {
                        return { added: [...prev.added, assesseeId], removed: prev.removed }
                    }
                })
            } else {
                // Remove the assessee from the selected list
                setSelectedAssessees(prev => prev.filter(id => id !== assesseeId))
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

    return  <ScrollArea style={{ height: `calc(100vh - var(--header-height) - 56px)` }} className="[&>[data-slot=scroll-area-viewport]]:pb-8">
        <div className="flex flex-col divide-y divide-border">
            <TeamSection
                team={session.team}
                assignedAssessees={assignedAssessees.map(a => a.personId)}
                selectedAssessees={selectedAssessees}
                onSelectedChange={handleCheckedChange}
            />
                {/* We could support multiple teams here in future. */}
        </div>
        
        <FloatingFooter open={isDirty || mutation.isPending}>
            {mutation.isPending ?
                <div className="animate-pulse text-sm text-muted-foreground p-2">Saving changes...</div>
                : <>
                    <Button 
                        size="sm"
                        color="blue"
                        onClick={() => mutation.mutate({ sessionId: session.sessionId, additions: changes.added, removals: changes.removed })}
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


interface TeamSectionProps {
    team: TeamData
    assignedAssessees: string[]
    selectedAssessees: string[]
    onSelectedChange: (assesseeId: PersonId) => (checked: boolean) => void
}

function TeamSection({ team, assignedAssessees, selectedAssessees, onSelectedChange }: TeamSectionProps) {

    const { data: members } = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId: team.teamId }))

    const teamAssessees = members.filter(m => selectedAssessees.includes(m.personId))

    return <div className="py-4">
        <div className="flex items-center justify-between">
            <div className="font-semibold text-xl">{team.name}</div>
            <div className="text-sm text-muted-foreground">{teamAssessees.length} selected</div>
        </div>
        <ul className="pl-4">
            {members
                .map(member => <PersonRow
                    key={member.personId}
                    person={member.person}
                    assigned={assignedAssessees.includes(member.personId)}
                    selected={selectedAssessees.includes(member.personId)}
                    onSelectedChange={onSelectedChange(member.personId)}
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