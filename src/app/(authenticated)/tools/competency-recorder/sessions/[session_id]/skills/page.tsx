/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/skills
 */
'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageFooter } from '@/components/app-page'

import { AsyncButton, Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { useSession } from '../use-session'



export default function CompetencyRecorder_Session_Skills_Page() {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()
    const session = useSession()

    const packagesQuery = useSuspenseQuery(trpc.skills.getTree.queryOptions())
    const assignedSkillsQuery = useSuspenseQuery(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId: session.sessionId }))
    const assignedSkills = assignedSkillsQuery.data.map(s => s.skillId)

    const [selectedSkills, setSelectedSkills] = useState<string[]>(assignedSkills)
    const [changes, setChanges] = useState<{ added: string[], removed: string[] }>({ added: [], removed: [] })

    function handleReset() {
        setSelectedSkills(assignedSkills)
        setChanges({ added: [], removed: [] })
    }

    const mutation = useMutation(trpc.skillCheckSessions.updateSkills.mutationOptions({
        
        onError(error) {
            toast({
                title: 'Error updating skills',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            toast({
                title: 'Skills updated',
                description: `The session skills were updated: ${result.addCount} skills added, ${result.removeCount} skills removed.`,
            })
        }
    }))

    function handleCheckedChange(skillId: string): (checked: boolean) => void {
        return (checked) => {
            if (checked) {
                setSelectedSkills([...selectedSkills, skillId])
                setChanges(prev => {
                    if(prev.removed.includes(skillId)) {
                        // If the skill was previously removed, clear the removal
                        return { added: prev.added, removed: prev.removed.filter(id => id !== skillId) }
                    } else {
                        return { added: [...prev.added, skillId], removed: prev.removed }
                    }
                })
            } else {
                setSelectedSkills(selectedSkills.filter(id => id !== skillId))
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

    const dirty = changes.added.length > 0 || changes.removed.length > 0

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).skills
            ]}
        />
        <AppPageContent variant="full" hasFooter>
            <ScrollArea style={{ height: `calc(100vh - 98px)` }} className="flex flex-col gap-4 pl-4 pr-3">
                <div className="text-sm text-muted-foreground py-4">
                    <Paragraph >
                        Select the skills that should be included in this assessment session.
                    </Paragraph>
                    <ul className="text-sm text-muted-foreground">
                        <li><span className="text-green-600 font-mono text-md pr-1">+</span> indicates an unsaved addition</li>
                        <li><span className="text-red-600 font-mono text-md pr-1">-</span> indicates an unsaved removal</li>
                    </ul>
                </div>
                
                {packagesQuery.data
                    .filter(pkg => pkg.skills.length > 0)
                    .map(pkg => <SkillPackageSection
                        key={pkg.skillPackageId}
                        pkg={pkg}
                        assignedSkills={assignedSkills}
                        selectedSkills={selectedSkills}
                        handleSelectedChange={handleCheckedChange}
                    />
                    )
                }

            </ScrollArea>
        </AppPageContent>
        <AppPageFooter className="justify-between">
            <div className="flex gap-2">
                <AsyncButton 
                    onClick={() => mutation.mutateAsync({ sessionId: session.sessionId, additions: changes.added, removals: changes.removed })}
                    disabled={!dirty}
                    reset
                    label="Save"
                    pending="Saving..."
                />
                <Button 
                    variant="ghost" 
                    disabled={!dirty}
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

interface SkillPackageSectionProps {
    pkg: SkillPackageData & { skills: SkillData[], skillGroups: SkillGroupData[] }
    assignedSkills: string[]
    selectedSkills: string[]
    handleSelectedChange: (skillId: string) => (checked: boolean) => void
}

function SkillPackageSection({ pkg, assignedSkills, selectedSkills, handleSelectedChange }: SkillPackageSectionProps) {

    return <div className="border-t py-4">
        <div className="font-semibold text-xl">{pkg.name}</div>
        <ul className="pl-2">
            {pkg.skillGroups.map(group => <li key={group.skillGroupId} className="py-1">
                <div className="font-semibold">{group.name}</div>
                <ul className="pl-4">
                    {pkg.skills
                        .filter(skill => skill.skillGroupId === group.skillGroupId)
                        .map(skill => {
                            const assigned = assignedSkills.includes(skill.skillId)
                            const selected = selectedSkills.includes(skill.skillId)
                            return <li key={skill.skillId} className="flex items-center gap-2">
                                <Label htmlFor={`skill-${skill.skillId}`} className="py-2 truncate grow">{skill.name}</Label>
                                <Checkbox 
                                    id={`skill-${skill.skillId}`}
                                    checked={selected}
                                    onCheckedChange={handleSelectedChange(skill.skillId)}
                                />
                                <div className="w-4">
                                    {selected && !assigned && <span className="text-green-600 font-mono text-md">+</span>}
                                    {!selected && assigned && <span className="text-red-600 font-mono text-md">-</span>}
                                </div>
                            </li>
                        })
                    }
                </ul>
            </li>)}
        </ul>
    </div>
}