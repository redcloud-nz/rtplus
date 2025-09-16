/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQueries} from '@tanstack/react-query'

import { FloatingFooter } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { useTRPC } from '@/trpc/client'



export default function CompetencyRecorder_Session_Skills_PageContent({ sessionId }: { sessionId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [{ data: availablePackages }, { data: assignedSkills }] = useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions(),
            trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId })
        ]
    })

    const [selectedSkills, setSelectedSkills] = useState<string[]>(assignedSkills)
    const [changes, setChanges] = useState<{ added: string[], removed: string[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedSkills(assignedSkills)
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillChecks.updateSessionSkills.mutationOptions({
        async onMutate({ additions, removals }) {
            await queryClient.cancelQueries(trpc.skillChecks.getSessionSkillIds.queryFilter({ sessionId }))

            const previousData = queryClient.getQueryData(trpc.skillChecks.getSessionSkillIds.queryKey({ sessionId }))
            queryClient.setQueryData(trpc.skillChecks.getSessionSkillIds.queryKey({ sessionId }), (old = []) => 
                [...old.filter(skillId => !removals.includes(skillId)), ...additions ]
            )
            setChanges({ added: [], removed: [] })
            return { previousData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillChecks.getSessionSkillIds.queryKey({ sessionId }), context?.previousData)
            toast({
                title: 'Error updating skills',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillChecks.getSessionSkillIds.queryFilter({ sessionId }))
        }
    }))

    function handleCheckedChange(skillId: string): (checked: boolean) => void {
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

    return <ScrollArea style={{ height: `calc(100vh - var(--header-height))` }} className="pl-4 pr-3 [&>[data-slot=scroll-area-viewport]]:pb-8">
        <div className="flex flex-col divide-y divide-border ">
            {availablePackages
                .filter(pkg => pkg.skills.length > 0)
                .map(pkg => <SkillPackageSection
                    key={pkg.skillPackageId}
                    pkg={pkg}
                    assignedSkills={assignedSkills}
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
                        onClick={() => mutation.mutate({ sessionId, additions: changes.added, removals: changes.removed })}
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

interface SkillPackageSectionProps {
    pkg: SkillPackageData & { skills: SkillData[], skillGroups: SkillGroupData[] }
    assignedSkills: string[]
    selectedSkills: string[]
    onSelectedChange: (skillId: string) => (checked: boolean) => void
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