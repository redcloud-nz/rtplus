/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'


import { Protect } from '@clerk/nextjs'

import { Hermes } from '@/components/blocks/hermes'
import { CreateNewIcon, DropdownMenuTriggerIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { ArrowUpDownIcon } from 'lucide-react'




export function SkillPackageManagerModule_Package_Skills_Section({ organization, skillPackage, groups, skills }: { organization: OrganizationData, skillPackage: SkillPackageData, groups: SkillGroupData[], skills: SkillData[] }) {

    return <Hermes.Section>
        <Hermes.SectionHeader>
            <Hermes.SectionTitle>Skills</Hermes.SectionTitle>

            <Protect role="org:admin">
                <ButtonGroup>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant="outline">
                                <CreateNewIcon/> <span className="hidden md:inline">New </span>
                                </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).groups.create}>
                                        <CreateNewIcon/> New Group
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skills.create}>
                                        <CreateNewIcon/> New Skill
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                                    
                    </DropdownMenu>
                   
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant="outline">
                                <DropdownMenuTriggerIcon /> <span className="sr-only">Open menu</span>
                            </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem disabled>
                                    <ArrowUpDownIcon/> Reorder
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
                
            </Protect>
        </Hermes.SectionHeader>
        
        { skills.length > 0
            ? <S2_Table>
                <S2_TableHead>
                    <S2_TableRow>
                        <S2_TableHeader>Group</S2_TableHeader>
                        <S2_TableHeader>Skill</S2_TableHeader>
                        <S2_TableHeader>Description</S2_TableHeader>
                    </S2_TableRow>
                </S2_TableHead>
                <S2_TableBody>
                    {groups.map(group => {
                        const groupSkills = skills.filter(skill => skill.skillGroupId === group.skillGroupId)
                        
                        return groupSkills
                            .map((skill, skillIndex) => 
                                <S2_TableRow key={skill.skillId}>
                                    {skillIndex === 0 && 
                                        <S2_TableCell rowSpan={groupSkills.length} className="max-w-32 truncate align-top">
                                            <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).group(group.skillGroupId)}>
                                                {group.name}
                                            </TextLink>
                                        </S2_TableCell>
                                    }
                                    <S2_TableCell className="max-w-32 truncate align-top">
                                        <TextLink to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId).skill(skill.skillId)}>
                                            {skill.name}
                                        </TextLink>
                                    </S2_TableCell>
                                    <S2_TableCell className="max-w-80 truncate">
                                        {skill.description || <span className="text-muted-foreground">No description</span>}
                                    </S2_TableCell>
                                </S2_TableRow>
                            )
                    })}
                </S2_TableBody>
            </S2_Table>
            : <Hermes.Empty
                title="No Skills"
                description="There are no skills in this skill package yet."
            />
        }
    </Hermes.Section>
}