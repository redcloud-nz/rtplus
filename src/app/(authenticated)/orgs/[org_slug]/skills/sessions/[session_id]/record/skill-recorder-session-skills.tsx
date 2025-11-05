/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useState } from 'react'
import { z } from 'zod'

import { useMutation, useQueryClient, useSuspenseQueries} from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData, SkillId } from '@/lib/schemas/skill'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { trpc } from '@/trpc/client'





export function SkillRecorder_Session_Skills({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const queryKey = trpc.skillChecks.getSessionAssignedSkillIds.queryKey({ sessionId: session.sessionId })
    const queryFilter = trpc.skillChecks.getSessionAssignedSkillIds.queryFilter({ sessionId: session.sessionId })

    const [{ data: availablePackages }, { data: assignedSkillIds }] = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
            trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId: organization.orgId, sessionId: session.sessionId })
        ]
    })

    const [selectedSkills, setSelectedSkills] = useState<SkillId[]>(assignedSkillIds)
    const [changes, setChanges] = useState<{ added: SkillId[], removed: SkillId[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedSkills(assignedSkillIds)
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillChecks.updateSessionSkills.mutationOptions({
        async onMutate(data) {
            const { additions, removals } = z.object({
                additions: z.array(SkillId.schema),
                removals: z.array(SkillId.schema)
            }).parse(data)
            await queryClient.cancelQueries(queryFilter)

            const previousData = queryClient.getQueryData(queryKey)
            queryClient.setQueryData(queryKey, (old = []) => 
                [...old.filter(skillId => !removals.includes(skillId)), ...additions ]
            )
            setChanges({ added: [], removed: [] })
            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(queryKey, context?.previousData)
            toast({
                title: 'Error updating skills',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(queryFilter)
        }
    }))

    function handleCheckedChange(skillId: SkillId): (checked: boolean) => void {
        return (checked) => {
            if (checked) {
                setSelectedSkills(prev => [...prev, skillId])
                setChanges(prev => {
                    if(prev.removed.includes(skillId)) {
                        // If the skill was previously removed, clear the removal
                        return { added: prev.added, removed: prev.removed.filter(id => id !== skillId) }
                    } else {
                        return { added: [...prev.added, skillId], removed: prev.removed }
                    }
                })
            } else {
                setSelectedSkills(prev => prev.filter(id => id !== skillId))
                setChanges(prev => {
                    if(prev.added.includes(skillId)) {
                        // If the skill was previously added, clear the addition
                        return { added: prev.added.filter(id => id !== skillId), removed: prev.removed }
                    } else {
                        return { added: prev.added, removed: [...prev.removed, skillId] }
                    }
                })
            }
        }
    }

    const isDirty = changes.added.length > 0 || changes.removed.length > 0

    return <> {/*<ScrollArea style={{ height: `calc(100vh - var(--header-height) - 56px)` }} className="[&>[data-slot=scroll-area-viewport]]:pb-8">*/}
        <div className="flex flex-col divide-y divide-border pb-8">
            {availablePackages
                .filter(pkg => pkg.skills.length > 0)
                .map(pkg => <SkillPackageSection
                    key={pkg.skillPackageId}
                    pkg={pkg}
                    assignedSkills={assignedSkillIds}
                    selectedSkills={selectedSkills}
                    onSelectedChange={handleCheckedChange}
                />
                )
            }
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
    </>
}

interface SkillPackageSectionProps {
    pkg: SkillPackageData & { skills: SkillData[], skillGroups: SkillGroupData[] }
    assignedSkills: SkillId[]
    selectedSkills: SkillId[]
    onSelectedChange: (skillId: SkillId) => (checked: boolean) => void
}

function SkillPackageSection({ pkg, assignedSkills, selectedSkills, onSelectedChange }: SkillPackageSectionProps) {

    return <div className="py-4">
        <div className="font-semibold text-xl">{pkg.name}</div>
        <ul className="pl-2">
            {pkg.skillGroups.map(group => <li key={group.skillGroupId} className="py-1">
                <div className="font-semibold">{group.name}</div>
                <ul className="pl-4">
                    {pkg.skills
                        .filter(skill => skill.skillGroupId === group.skillGroupId)
                        .map(skill => <SkillRow
                            key={skill.skillId}
                            skill={skill}
                            assigned={assignedSkills.includes(skill.skillId)}
                            selected={ selectedSkills.includes(skill.skillId)}
                            onSelectedChange={onSelectedChange(skill.skillId)}
                        />)
                    }
                </ul>
            </li>)}
        </ul>
    </div>
}

interface SkillRowProps {
    skill: SkillData
    assigned: boolean
    selected: boolean
    onSelectedChange: (checked: boolean) => void
}

function SkillRow({ skill, assigned, selected, onSelectedChange }: SkillRowProps) {
    return <li className="flex items-center gap-2">
        <Label htmlFor={`skill-${skill.skillId}`} className="py-2 truncate grow">{skill.name}</Label>
        <Checkbox
            id={`skill-${skill.skillId}`}
            checked={selected}
            onCheckedChange={onSelectedChange}
        />
        <div className="w-4">
            {selected && !assigned && <span className="text-green-600 font-mono text-md">+</span>}
            {!selected && assigned && <span className="text-red-600 font-mono text-md">-</span>}
        </div>
    </li>
}