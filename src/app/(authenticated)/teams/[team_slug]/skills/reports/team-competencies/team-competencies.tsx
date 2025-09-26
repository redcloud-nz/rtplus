/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
/* eslint-disable */
'use client'

import { addYears, formatDate, isBefore, subMonths, subYears } from 'date-fns'
import { CheckIcon, ChevronDownIcon, ClockAlertIcon, XIcon } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { randomInteger, sumBy } from 'remeda'
import { match } from 'ts-pattern'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { useSuspenseQuery } from '@tanstack/react-query'

import { SkillCheckGeneratorConfigData } from '@/components/cards/skill-check-generator-config'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { createRandomDateGenerator, createRandomValueGenerator } from '@/lib/generate-values'
import { CompetenceLevel } from '@/lib/competencies'
import { trpc } from '@/trpc/client'



export function Team_Competencies_Card({ teamId }: { teamId: string }) {

    const skillPackagesQuery = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())
    const teamMembersQuery = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId }))

    async function handleRefresh() {
        await skillPackagesQuery.refetch()
        await teamMembersQuery.refetch()
    }

    const [generatorConfigOpen, setGeneratorConfigOpen] = useState(false)
    const [generatorConfig, setGeneratorConfig] = useState<SkillCheckGeneratorConfigData>({
        statusWeights: {
            'NotAssessed': 10,
            'NotTaught': 10,
            'NotCompetent': 20,
            'Competent': 50,
            'HighlyConfident': 10
        },
        dateWeights: {
            'Expired': 20,
            'RecentlyExpired': 10,
            'NearlyExpired': 10,
            'OK': 60
        }
    })

    const skillChecks = useMemo(() => {
        const now = new Date()

        const statusGenerator = createRandomValueGenerator<CompetenceLevel>(generatorConfig.statusWeights)
        const dateGenerator = createRandomDateGenerator([
            { start: subMonths(now, 24), end: subMonths(now, 15), weight: generatorConfig.dateWeights.Expired },
            { start: subMonths(now, 15), end: subMonths(now, 12), weight: generatorConfig.dateWeights.RecentlyExpired },
            { start: subMonths(now, 12), end: subMonths(now, 9), weight: generatorConfig.dateWeights.NearlyExpired },
            { start: subMonths(now, 9), end: now, weight: generatorConfig.dateWeights.OK }
        ])

        return teamMembersQuery.data.flatMap(teamMember =>
            skillPackagesQuery.data.flatMap(skillPackage =>
                skillPackage.skills.map(skill => {
                    const result = statusGenerator()
                    const date = dateGenerator()

                    const competent = result === 'Competent' || result === 'HighlyConfident'
                    const expired = isBefore(date, subYears(now, 1))

                    if(result == 'NotAssessed') return undefined

                    return {
                        skillId: skill.skillId,
                        assesseeId: teamMember.personId,
                        assessorId: teamMembersQuery.data[randomInteger(0, teamMembersQuery.data.length - 1)].personId,
                        result,
                        date,
                        ok: competent && !expired,
                        competent,
                        expired
                    }
                })
            )
        ).filter((check): check is NonNullable<typeof check> => check !== undefined)
    }, [skillPackagesQuery.data, teamMembersQuery.data, generatorConfig])

    const skillPackages = useMemo(() => {
        return skillPackagesQuery.data.flatMap(({ skills, skillGroups, ...skillPackage }) => {
            const processedSkillGroups = skillGroups.map(skillGroup => {
                const processedSkills = skills
                    .filter(skill => skill.skillGroupId === skillGroup.skillGroupId)
                    .map(skill => {
                        const processedChecks = teamMembersQuery.data.map(teamMember =>
                            skillChecks.find(check => check.skillId == skill.skillId && check.assesseeId == teamMember.personId)
                        )
                        return {
                            ...skill,
                            checks: processedChecks,
                            aggregates: {
                                okCount: processedChecks.filter(check => check?.ok).length,
                                cellCount: processedChecks.length
                            }
                        }
                    })

                return {
                    ...skillGroup,
                    skills: processedSkills,
                    aggregates: {
                        okCount: sumBy(processedSkills, skill => skill.aggregates.okCount),
                        cellCount: sumBy(processedSkills, skill => skill.aggregates.cellCount),
                        okCountByTeamMember: teamMembersQuery.data.map((_, index) => processedSkills.filter(skill => skill.checks[index]?.ok).length),
                        skillsCount: processedSkills.length
                    }
                }
            })

            return {
                ...skillPackage,
                skillGroups: processedSkillGroups,
                aggregates: {
                    okCount: sumBy(processedSkillGroups, group => group.aggregates.okCount),
                    cellCount: sumBy(processedSkillGroups, group => group.aggregates.cellCount),
                    okCountByTeamMember: teamMembersQuery.data.map((_, index) => sumBy(processedSkillGroups, group => group.aggregates.okCountByTeamMember[index])),
                    skillsCount: sumBy(processedSkillGroups, group => group.aggregates.skillsCount)
                }
            }
        })


    }, [skillPackagesQuery.data, teamMembersQuery.data, skillChecks])

    const teamMembersMap = useMemo(() => {
        return new Map(teamMembersQuery.data.map(member => [member.personId, member]))
    }, [teamMembersQuery.data])

    const aggregates = {
        okCount: sumBy(skillPackages, group => group.aggregates.okCount),
        cellCount: sumBy(skillPackages, group => group.aggregates.cellCount),
        okCountByTeamMember: teamMembersQuery.data.map((_, index) => sumBy(skillPackages, group => group.aggregates.okCountByTeamMember[index])),
        skillsCount: sumBy(skillPackages, group => group.aggregates.skillsCount)
    }

    const membersCount = teamMembersQuery.data.length
    const skillPackagesCount = skillPackages.length

    return <div className="relative width-full h=[calc(100vh-49px)] overflow-auto text-sm">
        <div className="grid" style={{ gridTemplateColumns: `[left] minmax(240px, 20%) [body] repeat(${membersCount}, minmax(60px, 20%)) [total] 75px [control] 40px [right]`, gridTemplateRows: `[top] 120px [body] repeat(${skillPackagesCount}, auto) [total] 40px [bottom]` }}>
            <div className="grid row-[top] col-span-full grid-cols-subgrid sticky top-0 z-2 bg-white border-b-2 border-table-frame">
                <div className="col-[left] sticky left-0 top-0 z-3 bg-white"></div>
                {teamMembersQuery.data.map((member, colIndex) => <div key={colIndex} className="align-middle self-center">
                    <div className="w-[120px] overflow-hidden overflow-ellipsis whitespace-nowrap rotate-[-60deg] -translate-2 p-1 font-semibold">{member.person.name}</div>
                </div>)}
                <div className="grid col-start-[total] col-end-[right] grid-cols-subgrid sticky right-0 top-0 z-3 bg-white">
                    <div className="col-[total] text-center self-end font-bold p-1">Overall</div>
                    <div className="col-[control]"></div>
                </div>
                
            </div>
            <AccordionPrimitive.Root type="multiple" className="grid row-start-[body] row-end-[total] grid-cols-subgrid col-span-full">
                {skillPackages.map(skillPackage => <Fragment key={skillPackage.skillPackageId}>
                    <div className="grid grid-cols-subgrid col-span-full items-center h-10 group">
                        <div className="h-10 col-[left] sticky left-0 z-1 flex items-center not-group-hover:bg-white group-hover:bg-muted border-r border-table-frame">
                            <div className="w-full overflow-hidden overflow-ellipsis text-nowrap font-bold p-1 pl-2">{skillPackage.name}</div>
                        </div>
                        {teamMembersQuery.data.map((teamMember, index) => <div key={teamMember.personId} className="h-10 flex items-center justify-center group-hover:bg-muted">
                            <div className="p-1">{toPercentage(skillPackage.aggregates.okCountByTeamMember[index], skillPackage.aggregates.skillsCount)}%</div>
                        </div>)}
                        <div className="h-10 grid col-start-[total] col-end-[right] grid-cols-subgrid items-center sticky right-0 z-1 not-group-hover:bg-white group-hover:bg-muted border-l border-table-frame">
                            <div className="col-[total] text-center p-1 not-group-hover:bg-white">
                                {toPercentage(skillPackage.aggregates.okCount, skillPackage.aggregates.cellCount)}%
                            </div>
                            <div className="col-[control] group-hover:bg-muted"></div>
                        </div>
                    </div>
                    {skillPackage.skillGroups.map(skillGroup => <AccordionPrimitive.Item key={skillGroup.skillGroupId} value={skillGroup.skillGroupId} className="grid grid-cols-subgrid col-span-full">
                       <AccordionPrimitive.Header className="grid col-span-full grid-cols-subgrid items-center last:border-0 transition-colors group">
                            <div className="h-10 col-[left] sticky left-0 z-1 p-1 flex items-center not-group-hover:bg-white group-hover:bg-muted border-r border-table-frame">
                                <div className="w-full overflow-hidden overflow-ellipsis text-nowrap font-semibold p-1 pl-4">{skillGroup.name}</div>
                            </div>
                            {teamMembersQuery.data.map((teamMember, index) => <div key={teamMember.personId} className="h-10 flex items-center justify-center group-hover:bg-muted">
                                <div className="p-1">{toPercentage(skillGroup.aggregates.okCountByTeamMember[index], skillGroup.aggregates.skillsCount)}%</div>
                            </div>)}
                            <div className="h-10 grid col-start-[total] col-end-[right] grid-cols-subgrid items-center sticky right-0 z-1 not-group-hover:bg-white group-hover:bg-muted border-l border-table-frame">
                                <div className="col-[total] text-center p-1">{toPercentage(skillGroup.aggregates.okCount, skillGroup.aggregates.cellCount)}%</div>
                                <div className="col-[control]">
                                    <AccordionPrimitive.Trigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="transition-all [&[data-state=open]>svg]:rotate-180"
                                        >
                                            <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                        </Button>
                                    </AccordionPrimitive.Trigger>
                                </div>
                            </div>
                       </AccordionPrimitive.Header>
                       <AccordionPrimitive.Content className="grid col-span-full grid-cols-subgrid">
                            {skillGroup.skills.map(skill => <div key={skill.skillId} className="grid col-span-full grid-cols-subgrid group">
                                <div className="h-10 col-[left] sticky left-0 z-1 p-1 flex items-center not-group-hover:bg-white group-hover:bg-muted border-r border-table-frame">
                                    <div className="w-full overflow-hidden overflow-ellipsis text-nowrap p-1 pl-8">{skill.name}</div>
                                </div>
                                    {teamMembersQuery.data.map((teamMember, index) => 
                                        <div key={teamMember.personId} className="flex justify-center items-center group-hover:bg-muted">
                                            {match(skill.checks[index])
                                                .with({ competent: true, expired: false }, (check) => <Popover>
                                                    <PopoverTrigger className="p-1 data-[state=open]:border rounded-full">
                                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                                    </PopoverTrigger>
                                                    <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                        <div className="col-span-2 text-center font-semibold">Competent</div>
                                                        <div className="text-right text-gray-500">Assessor:</div>
                                                        <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                        <div className="text-right text-gray-500">Expires:</div>
                                                        <div>{formatDate(addYears(check.date, 1), 'd MMM yyyy')} </div>
                                                    </PopoverContent>
                                                </Popover>)
                                                .with({ competent: true, expired: true }, (check) => <Popover>
                                                    <PopoverTrigger className="p-1 data-[state=open]:border rounded-full">
                                                        <ClockAlertIcon className="h-4 w-4 text-orange-300" />
                                                    </PopoverTrigger>
                                                    <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                        <div className="col-span-2 text-center font-semibold">Expired</div>
                                                        <div className="text-right text-gray-500">Assessor:</div>
                                                        <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                        <div className="text-right text-gray-500">Expired:</div>
                                                        <div>{formatDate(addYears(check.date, 1), 'd MMM yyyy')} </div>
                                                    </PopoverContent>
                                                </Popover>)
                                                .with({ result: 'NotCompetent' }, (check) => <Popover>
                                                    <PopoverTrigger className="p-1 data-[state=open]:border rounded-full">
                                                        <XIcon className="h-4 w-4 text-red-500" />
                                                    </PopoverTrigger>
                                                    <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                        <div className="col-span-2 text-center font-semibold">Not Competent</div>
                                                        <div className="text-right text-gray-500">Assessor:</div>
                                                        <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                        <div className="text-right text-gray-500">Date:</div>
                                                        <div>{formatDate(check.date, 'd MMM yyyy')} </div>
                                                    </PopoverContent>
                                                </Popover>)
                                                .otherwise(() => null)
                                            }
                                        </div>
                                    )}

                                    {/* Row Total */}
                                    <div className="h-10 grid col-start-[total] col-end-[right] grid-cols-subgrid items-center sticky right-0 z-1 not-group-hover:bg-white group-hover:bg-muted border-l border-table-frame">
                                        <div className="col-[total] text-center p-1">{toPercentage(skill.aggregates.okCount, skill.aggregates.cellCount)}%</div>
                                        <div className="col-[control]"></div>
                                    </div>
                                    
                                    
                                </div>)}
                       </AccordionPrimitive.Content>
                    </AccordionPrimitive.Item>)}
                </Fragment>)}
            </AccordionPrimitive.Root>
            <div className="grid row-[total] col-span-full grid-cols-subgrid sticky bottom-0 z-2 bg-white border-t-2 border-table-frame">
                <div className="h-9.5 col-[left] sticky left-0 bottom-0 z-1 flex items-center not-group-hover:bg-white group-hover:bg-muted border-r border-table-frame ">
                    <div className="w-full text-right font-bold p-1">Total</div>
                </div>
                {teamMembersQuery.data.map((_, index) => 
                    <div key={index} className="text-center self-center">{toPercentage(aggregates.okCountByTeamMember[index], aggregates.skillsCount)}%</div>
                )}
                <div className="h-9.5 grid col-start-[total] col-end-[right] grid-cols-subgrid items-center sticky right-0 z-1 not-group-hover:bg-white group-hover:bg-muted border-l border-table-frame">
                    <div className="col-[total] text-center p-1">{toPercentage(aggregates.okCount, aggregates.cellCount)}%</div>
                    <div className="col-[control]"></div>
                </div>
            </div>
        </div>

        
    </div>
}


function toPercentage(value: number, total: number) {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}