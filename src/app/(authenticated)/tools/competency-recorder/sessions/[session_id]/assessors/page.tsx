/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/assessors
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageFooter } from '@/components/app-page'

import { AsyncButton, Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { TeamData } from '@/lib/schemas/team'
import { useTRPC } from '@/trpc/client'

import { useSession } from '../use-session'


export default function CompetencyRecorder_Session_Assessors_Page() {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()
    const session = useSession()

    const queryKey = trpc.skillCheckSessions.getAssignedAssessors.queryKey({ sessionId: session.sessionId })

    const { data: assignedAssessors } = useSuspenseQuery(trpc.skillCheckSessions.getAssignedAssessors.queryOptions({ sessionId: session.sessionId }))

    const [selectedAssessors, setSelectedAssessors] = useState<string[]>(assignedAssessors.map(a => a.personId))
    const [changes, setChanges] = useState<{ added: string[], removed: string[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedAssessors(assignedAssessors.map(a => a.personId))
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillCheckSessions.updateAssessors.mutationOptions({
        async onMutate({ additions, removals }) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getAssignedAssessors.queryFilter({ sessionId: session.sessionId }))

            const previousData = queryClient.getQueryData(queryKey)
            queryClient.setQueryData(queryKey, (old = []) => 
                [...old.filter(a => !removals.includes(a.personId)), ...additions.map(personId => ({ personId, name: 'Loading...' } as { personId: string, name: string })) ]
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
        onSuccess(result) {
            toast({
                title: "Assessees updated",
                description: `The assessees for this session have been updated: ${result.addCount} added, ${result.removeCount} removed.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillCheckSessions.getAssignedAssessors.queryFilter({ sessionId: session.sessionId }))
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

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).assessors
            ]}
        />
        <AppPageContent variant="full" hasFooter>
            <ScrollArea style={{ height: `calc(100vh - 98px)` }} className="flex flex-col gap-4 pl-4 pr-3">
                <div className="text-sm text-muted-foreground py-4 space-y-2">
                    <p>
                        Select the users that should be included as assessors in this competency recorder session.
                    </p>
                    <ul className="text-sm text-muted-foreground">
                        <li><span className="text-green-600 font-mono text-md pr-1">+</span> indicates an unsaved addition</li>
                        <li><span className="text-red-600 font-mono text-md pr-1">-</span> indicates an unsaved removal</li>
                    </ul>
                </div>
                
                <TeamSection
                    team={session.team}
                    assignedAssessors={assignedAssessors.map(a => a.personId)}
                    selectedAssessors={selectedAssessors}
                    onSelectedChange={handleCheckedChange}
                />
                {/* We could support multiple teams here in future. */}
            </ScrollArea>
        </AppPageContent>
        <AppPageFooter className="justify-between">
            <div className="flex gap-2">
                <AsyncButton 
                    onClick={() => mutation.mutateAsync({ sessionId: session.sessionId, additions: changes.added, removals: changes.removed })}
                    disabled={!isDirty}
                    reset
                    label="Save"
                    pending="Saving..."
                />
                <Button 
                    variant="ghost" 
                    disabled={!isDirty}
                    onClick={handleReset}
                >Reset</Button>
            </div>
            <div className="w-16 flex items-center justify-center gap-2">
                {changes.added.length > 0 && <div className="text-green-600">+{changes.added.length}</div>}
                {changes.removed.length > 0 && <div className="text-red-600">-{changes.removed.length}</div>}
            </div>
        </AppPageFooter>
    </AppPage>
}

interface TeamSectionProps {
    team: TeamData
    assignedAssessors: string[]
    selectedAssessors: string[]
    onSelectedChange: (assesseeId: string) => (checked: boolean) => void
}

function TeamSection({ team, assignedAssessors, selectedAssessors, onSelectedChange }: TeamSectionProps) {
    const trpc = useTRPC()

    const { data: users } = useSuspenseQuery(trpc.users.getUsers.queryOptions({ teamId: team.teamId }))

    return <div className="border-t py-4">
        <div className="font-semibold text-xl">{team.name}</div>
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
    return <li className="flex items-center py-1">
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