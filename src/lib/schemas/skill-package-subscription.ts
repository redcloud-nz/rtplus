/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
import { z } from 'zod'

import { SkillPackageSubscription as SkillPackageSubscriptionRecord, SkillPackageSubscriptionGroup as SkillPackageSubscriptionGroupRecord } from '@prisma/client'

import { nanoId16 } from '@/lib/id'
import { recordStatusSchema } from '@/lib/validation'

import { SkillGroupId } from './skill-group'
import { SkillPackageId } from './skill-package'


export type SkillPackageSubscriptionId = string & z.BRAND<'SkillPackageSubscriptionId'>

export const SkillPackageSubscriptionId = {
    schema: z.string().length(16).regex(/^[a-zA-Z0-9]+$/, "16 character Skill Package Subscription ID expected.").brand<'SkillPackageSubscriptionId'>(),

    create: () => SkillPackageSubscriptionId.schema.parse(nanoId16()),

    parse: (value: string) => SkillPackageSubscriptionId.schema.parse(value),
} as const

export const skillPackageSubscriptionSchema = z.object({
    subscriptionId: SkillPackageSubscriptionId.schema,
    skillPackageId: SkillPackageId.schema,
    status: recordStatusSchema,
})

export type SkillPackageSubscriptionData = z.infer<typeof skillPackageSubscriptionSchema>

export function toSkillPackageSubscriptionData(data: SkillPackageSubscriptionRecord): SkillPackageSubscriptionData {
    return skillPackageSubscriptionSchema.parse(data)
}


export const skillPackageSubscriptionGroupSchema = z.object({
    skillGroupId: SkillGroupId.schema,
    include: z.boolean(),
})

export type SkillPackageSubscriptionGroupData = z.infer<typeof skillPackageSubscriptionGroupSchema>

export function toSkillPackageSubscriptionGroupData(data: SkillPackageSubscriptionGroupRecord): SkillPackageSubscriptionGroupData {
    return skillPackageSubscriptionGroupSchema.parse(data)
}