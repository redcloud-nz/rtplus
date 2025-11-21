/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon } from '@/components/icons'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'

import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function SkillsModule_SkillChecks_List({ organization }: { organization: OrganizationData }) {

    const { data: checks } = useSuspenseQuery(trpc.skillChecks.getSkillChecks.queryOptions({ orgId: organization.orgId }))
    const { data: groupedChecks } = useSuspenseQuery(trpc.skillChecks.getRecentSkillChecksGrouped.queryOptions({ orgId: organization.orgId }))

    return <Show 
        when={checks.length > 0} 
        fallback={<Lexington.Empty title="No Checks Recorded" description="Your organisation has not recorded any skill checks yet.">
            <S2_Button asChild>
                <Link to={Paths.org(organization.slug).skills.checks.create}>
                    <PlusIcon/>
                    New Check
                </Link>
            </S2_Button>
        </Lexington.Empty>}
    >
        <Lexington.ColumnControls>
            <div></div>
            <div className="flex items-center gap-2">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skills.checks.create}>
                        <CreateNewIcon /> <span className="hidden md:inline">New Check</span>
                    </Link>
                </S2_Button>
            </div>
        </Lexington.ColumnControls>

        <div className="flex flex-col gap-2">
            {groupedChecks.map(group => 
                <div key={`${group.date}-${group.assessor.personId}`} className="border border-border text-sm rounded-md p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{group.date}</span>
                        <TextLink to={Paths.org(organization.slug).admin.person(group.assessor.personId)}>
                            {group.assessor.name}
                        </TextLink>
                        <span> recorded</span>
                    </div>
                    {group.checks.map(check => (
                        <div className="flex items-center gap-2 text-muted-foreground flex-wrap pl-2">
                            
                            <TextLink to={Paths.org(organization.slug).admin.person(check.assesseeId)}>
                                {check.assessee.name}
                            </TextLink>
                            <span>as</span>
                            <span>{CompetenceLevelTerms[check.result as CompetenceLevel] || check.result}</span>
                            <span>for skill</span>
                            <span className="italic"> {check.skill.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </Show>
    
    
}

