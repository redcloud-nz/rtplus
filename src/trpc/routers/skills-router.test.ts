/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { beforeEach, describe, expect, test } from 'vitest'

import { OrganizationId } from '@/lib/schemas/organization'
import { SkillPackageData, SkillPackageId } from '@/lib/schemas/skill-package'
import { UserId } from '@/lib/schemas/user'
import prisma from '@/server/prisma'

import { SkillGroupData, SkillGroupId } from '@/lib/schemas/skill-group'
import { SampleSkillPackages } from '@/test/sample-skill-packages'
import { createAuthenticatedMockContext } from '@/test/trpc-helpers'

import { appRouter } from './_app'
import { SkillData, SkillId } from '@/lib/schemas/skill'



describe('Skills Router (org:admin)', () => {
    let mockContext: ReturnType<typeof createAuthenticatedMockContext>
    
    const orgId = OrganizationId.schema.parse("org_TEST01")
    const userId = UserId.schema.parse("user_TEST01")

    beforeEach(async () => {
        // Create a custom auth context that matches the user
        mockContext = createAuthenticatedMockContext({
            activeOrg: { orgId: orgId, orgSlug: 'test-org', role: 'org:admin' },
            userId
        })
    })


    /* ---------- Skill Package Tests ---------- */

    test('create skill package', async () => {

        const caller = appRouter.createCaller(mockContext)

        const input = SampleSkillPackages.SkillPackageBlue

        await caller.skills.createPackage({ orgId: orgId, ...input })

        const output = await caller.skills.getPackage({ orgId, skillPackageId: input.skillPackageId })

        expect(output.skillPackageId).toBe(input.skillPackageId)
        expect(output.name).toBe(input.name)
        expect(output.description).toBe(input.description)
        expect(output.status).toBe(input.status)
        expect(output.tags).toEqual(input.tags)
        expect(output.properties).toEqual(input.properties)
        expect(output.published).toBe(false)

        const changes = await prisma.skillPackageChangeLog.findMany({
            where: {
                skillPackageId: input.skillPackageId,
            }
        })
        expect(changes.length).toBe(1)
        expect(changes[0].userId).toBe(userId)
        expect(changes[0].event).toBe('Create')
    })

    test("update skil package", async () => {
        const caller = appRouter.createCaller(mockContext)

        const input = SampleSkillPackages.SkillPackageRed

        await caller.skills.createPackage({ orgId: orgId, ...input })

        const updatedInput: Omit<SkillPackageData, 'ownerOrgId' | 'published'> = {
            ...input,
            name: "Updated Skill Package",
            description: "Updated description",
            tags: ['updated', 'skill'],
            properties: {
                level: '2',
                updated: true
            },
            status: 'Inactive',
        }

        await caller.skills.updatePackage({ orgId, ...updatedInput })

        const output = await caller.skills.getPackage({ orgId, skillPackageId: input.skillPackageId })

        expect(output.skillPackageId).toBe(updatedInput.skillPackageId)
        expect(output.name).toBe(updatedInput.name)
        expect(output.description).toBe(updatedInput.description)
        expect(output.status).toBe(updatedInput.status)
        expect(output.tags).toEqual(updatedInput.tags)
        expect(output.properties).toEqual(updatedInput.properties)
    })

    test('delete skill package', async () => {
        
        const caller = appRouter.createCaller(mockContext)

        const input = SampleSkillPackages.SkillPackageGreen

        await caller.skills.createPackage({ orgId: orgId, ...input })

        // Verify it exists
        const created = await caller.skills.getPackage({ orgId, skillPackageId: input.skillPackageId })
        expect(created).toBeDefined()

        // Delete it
        await caller.skills.deletePackage({ orgId, skillPackageId: input.skillPackageId })

        // Verify it's gone
        await expect(
            caller.skills.getPackage({ orgId, skillPackageId: input.skillPackageId })
        ).rejects.toThrow(expect.objectContaining({ code: 'NOT_FOUND' }))
    })

    test('list skill packages', async () => {

        const caller = appRouter.createCaller(mockContext)

        // Create multiple skill packages
        const packages = [
            SampleSkillPackages.SkillPackageYellow,
            SampleSkillPackages.SkillPackagePurple,
            SampleSkillPackages.SkillPackageOrange,
        ]

        for(const pkg of packages) {
            await caller.skills.createPackage({ orgId: orgId, ...pkg })
        }

        const list = await caller.skills.listPackages({ orgId })
        expect(list.length).toBeGreaterThanOrEqual(packages.length)

        for(const pkg of packages) {
            const found = list.find(p => p.skillPackageId === pkg.skillPackageId)
            expect(found).toBeDefined()
            expect(found?.name).toBe(pkg.name)
        }
    })


    /* ---------- Skill Group Tests ---------- */

    test('create skill group', async () => {
        
        const caller = appRouter.createCaller(mockContext)
        const skillPackageInput = SampleSkillPackages.SkillPackageBlue

        await caller.skills.createPackage({ orgId: orgId, ...skillPackageInput })

        const skillGroupInput: Omit<SkillGroupData, 'sequence'> = {
            skillGroupId: SkillGroupId.create(),
            skillPackageId: skillPackageInput.skillPackageId,
            parentId: null,
            name: 'Test Skill Group',
            description: 'A skill group for testing',
            tags: ['abc', 'test'],
            properties: { 'level': '1' },
            status: 'Active'
        }

        await caller.skills.createGroup({ orgId, ...skillGroupInput })

        const output = await caller.skills.getGroup({ orgId, skillPackageId: skillPackageInput.skillPackageId, skillGroupId: skillGroupInput.skillGroupId })

        expect(output.skillGroupId).toBe(skillGroupInput.skillGroupId)
        expect(output.name).toBe(skillGroupInput.name)
        expect(output.description).toBe(skillGroupInput.description)
        expect(output.status).toBe(skillGroupInput.status)
        expect(output.tags).toEqual(skillGroupInput.tags)
        expect(output.properties).toEqual(skillGroupInput.properties)
    })

    /* ---------- Skill Tests ---------- */

    test('create skill', async () => {
        
        const caller = appRouter.createCaller(mockContext)
        const skillPackageInput = SampleSkillPackages.SkillPackageBlue

        await caller.skills.createPackage({ orgId: orgId, ...skillPackageInput })

        const skillGroupInput: Omit<SkillGroupData, 'sequence'> = {
            skillGroupId: SkillGroupId.create(),
            skillPackageId: skillPackageInput.skillPackageId,
            parentId: null,
            name: 'Test Skill Group',
            description: 'A skill group for testing',
            tags: ['abc', 'test'],
            properties: { 'level': '1' },
            status: 'Active'
        }

        await caller.skills.createGroup({ orgId, ...skillGroupInput })

        const skillInput: Omit<SkillData, 'sequence'> = {
            skillId: SkillId.create(),
            skillPackageId: skillPackageInput.skillPackageId,
            skillGroupId: skillGroupInput.skillGroupId,
            name: 'Test Skill',
            description: 'A skill for testing',
            tags: ['skill', 'test'],
            properties: { difficulty: 'easy' },
            status: 'Active'
        }

        await caller.skills.createSkill({ orgId, ...skillInput })

        const output = await caller.skills.getSkill({ orgId, skillPackageId: skillPackageInput.skillPackageId, skillId: skillInput.skillId })

        expect(output.skillId).toBe(skillInput.skillId)
        expect(output.name).toBe(skillInput.name)
        expect(output.description).toBe(skillInput.description)
        expect(output.status).toBe(skillInput.status)
        expect(output.tags).toEqual(skillInput.tags)
        expect(output.properties).toEqual(skillInput.properties)
    })
})

describe('Skills Router (org:member)', () =>  {
    let mockContext: ReturnType<typeof createAuthenticatedMockContext>
    
    const orgId = OrganizationId.schema.parse("org_TEST01")
    const userId = UserId.schema.parse("user_TEST01")

    beforeEach(async () => {
        // Create a custom auth context that matches the user
        mockContext = createAuthenticatedMockContext({
            activeOrg: { orgId: orgId, orgSlug: 'test-org', role: 'org:member' },
            userId
        })
    })

    test('member cannot create skill package', async () => {

        const caller = appRouter.createCaller(mockContext)

        const input: Omit<SkillPackageData, 'ownerOrgId' | 'published'> = {
            skillPackageId: SkillPackageId.create(),
            name: "Test Skill Package",
            description: "A skill package for testing",
            tags: [],
            properties: {},
            status: 'Active',
        }

        await expect(
            caller.skills.createPackage({ orgId: orgId, ...input })
        ).rejects.toThrow(expect.objectContaining({ code: 'FORBIDDEN' }))
        
    })

    test('member cannot update skill package', async () => {

        const caller = appRouter.createCaller(mockContext)

        const input: Omit<SkillPackageData, 'ownerOrgId' | 'published'> = {
            skillPackageId: SkillPackageId.create(),
            name: "Test Skill Package",
            description: "A skill package for testing",
            tags: [],
            properties: {},
            status: 'Active',
        }

        await expect(
            caller.skills.updatePackage({ orgId, ...input })
        ).rejects.toThrow(expect.objectContaining({ code: 'FORBIDDEN' }))
        
    })
})