
'use client'

import { Capability, SkillGroup, Skill } from '@prisma/client'
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query'
import { ListResponse } from './common'

const capabilitiesQueryOptions = {
    queryKey: ['capabilities'],
    queryFn: async () => {
        const response = await fetch('/api/capabilities')
        const json = await response.json() as ListResponse<Capability>
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

export function useCapabilitiesQuery(): UseQueryResult<Capability[]> {
    return useQuery(capabilitiesQueryOptions)
}

export function useSkillGroupsQuery(): UseQueryResult<SkillGroup[]> {
    return useQuery(skillGroupsQueryOptions)
}

export function useSkillsQuery(): UseQueryResult<Skill[]> {
    return useQuery(skillsQueryOptions)
}

export type CapabilityWithSkillGroups = Capability & { skillGroups: SkillGroupWithSkills[] }

export type SkillGroupWithSkills = SkillGroup & { skills: Skill[] }

export function useSkillsTreeQuery(): { data: CapabilityWithSkillGroups[], isError: boolean, isPending: boolean, isSuccess: boolean } {
    return useQueries({
        queries: [
            capabilitiesQueryOptions, skillGroupsQueryOptions, skillsQueryOptions
        ],
        combine: ([capabilitiesQuery, skillGroupsQuery, skillsQuery]) => {

            const isError = capabilitiesQuery.isError || skillGroupsQuery.isError || skillsQuery.isError
            const isPending = capabilitiesQuery.isPending || skillGroupsQuery.isPending || skillsQuery.isPending
            const isSuccess = capabilitiesQuery.isSuccess && skillGroupsQuery.isSuccess && skillsQuery.isSuccess

            if(isSuccess) {
                
                const capabilities = capabilitiesQuery.data.map(capability => {

                    const skillGroups = skillGroupsQuery.data
                        .filter(skillGroup => skillGroup.capabilityId == capability.id)
                        .map(skillGroup => {

                            const skills = skillsQuery.data.filter(skill => skill.skillGroupId == skillGroup.id)

                            return { ...skillGroup, skills } as SkillGroupWithSkills
                        })

                    return { ...capability, skillGroups } satisfies CapabilityWithSkillGroups
                })


                return { data: capabilities, isError, isPending, isSuccess }
            } else {
                return { data: [], isError, isPending, isSuccess }
            }
        }
    })
}