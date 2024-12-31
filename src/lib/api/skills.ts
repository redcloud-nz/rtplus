
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { SkillPackage, SkillGroup, Skill } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { ListResponse } from './common'


const skillPackagesQueryOptions = {
    queryKey: ['skill-packages'],
    queryFn: async () => {
        const response = await fetch('/api/skill-packages')
        const json = await response.json() as ListResponse<SkillPackageWithGroupsAndSkills>
        return json.data
    }
}

const skillGroupsQueryOptions = {
    queryKey: ['skill-groups'],
    queryFn: async () => {
        const response = await fetch('/api/skill-groups')
        const json = await response.json() as ListResponse<SkillGroup>
        return json.data
    }
}

const skillsQueryOptions = {
    queryKey: ['skills'],
    queryFn: async () => {
        const response = await fetch('/api/skills')
        const json = await response.json() as ListResponse<Skill>
        return json.data
    }
}

export function useSkillPackagesQuery(): UseQueryResult<SkillPackageWithGroupsAndSkills[]> {
    return useQuery(skillPackagesQueryOptions)
}

export function useSkillGroupsQuery(): UseQueryResult<SkillGroup[]> {
    return useQuery(skillGroupsQueryOptions)
}

export function useSkillsQuery(): UseQueryResult<Skill[]> {
    return useQuery(skillsQueryOptions)
}

export type SkillPackageWithGroupsAndSkills = SkillPackage & { 
    skillGroups: SkillGroup[]
    skills: Skill[]
}
