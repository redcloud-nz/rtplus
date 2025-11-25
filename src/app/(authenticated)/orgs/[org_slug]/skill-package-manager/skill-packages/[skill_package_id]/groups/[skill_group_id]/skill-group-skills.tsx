/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'


import { Protect } from '@clerk/nextjs'

import { Hermes } from '@/components/blocks/hermes'
import { CreateNewIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'




export function SkillPackageManagerModule_Group_Skills_Section({ organization, skillPackage, skillGroup, skills }: { organization: OrganizationData, skillPackage: SkillPackageData, skillGroup: SkillGroupData, skills: SkillData[] }) {


    return <Hermes.Section>
        <Hermes.SectionHeader>
            <Hermes.SectionTitle>Skills</Hermes.SectionTitle>
            <Protect role="org:admin">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skills.create}>
                        <CreateNewIcon/> <span className="hidden md:inline">New Skill</span>
                    </Link>
                </S2_Button>
            </Protect>
        </Hermes.SectionHeader>
        
        { skills.length > 0
            ? <S2_Table>
                <S2_TableHead>
                    <S2_TableRow>
                        <S2_TableHeader>Skill</S2_TableHeader>
                        <S2_TableHeader>Description</S2_TableHeader>
                    </S2_TableRow>
                </S2_TableHead>
                <S2_TableBody>
                    {skills.map(skill => 
                        <S2_TableRow key={skill.skillId}>
                            <S2_TableCell>
                                <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skill(skill.skillId)}>
                                    {skill.name}
                                </TextLink>
                            </S2_TableCell>
                            <S2_TableCell className="max-w-80 truncate">
                                {skill.description || <span className="text-muted-foreground">No description</span>}
                            </S2_TableCell>
                        </S2_TableRow>
                    )}
                </S2_TableBody>
            </S2_Table>
            : <Hermes.Empty
                title="No Skills"
                description="There are no skills in this skill group yet."
            />
        }
    </Hermes.Section>
}