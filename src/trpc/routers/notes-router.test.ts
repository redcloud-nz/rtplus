/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { beforeEach, describe, expect, test } from 'vitest'

import { OrganizationId } from '@/lib/schemas/organization'
import { UserId } from '@/lib/schemas/user'
import prisma from '@/server/prisma'
import { SamplePersonnel } from '@/test/sample-personnel'
import { createAuthenticatedMockContext } from '@/test/trpc-helpers'

import { appRouter } from './_app'




describe('Notes Router', () => {
    let mockContext: ReturnType<typeof createAuthenticatedMockContext>

    const actor = SamplePersonnel.AyazIovita // The person who is interacting with the system
    const orgId = OrganizationId.schema.parse("org_TEST01")
    const userId = UserId.schema.parse("user_TEST01")

    beforeEach(async () => {
        

        // Create a custom auth context that matches the person we want to create a note for
        mockContext = createAuthenticatedMockContext({
            activeOrg: { orgId: orgId, orgSlug: 'test-org', role: 'org:member' },
        })
    })

    test('create note', async () => {

        const caller = appRouter.createCaller(mockContext)

        const result = await caller.notes.createNote({ 
            noteId: 'NID00001',
            orgId,
            title: "Title", 
            content: "Test note",
            tags: [],
            properties: {},
            status: 'Draft' 
        })

        expect(result).toBeDefined()
        expect(result.noteId).toBe('NID00001')
        expect(result.title).toBe('Title')
        expect(result.content).toBe('Test note')
        
        // Verify the note was actually created in the database
        const createdNote = await prisma.note.findUnique({
            where: { noteId: 'NID00001', orgId }
        })
        expect(createdNote).toBeDefined()
        expect(createdNote?.title).toBe('Title')

    })

    // test('cant specify both personId and teamId', async () => {
    //     const ctx = createInnerTRPCContext(mockContext)
    //     const caller = appRouter.createCaller(ctx)

    //     await expect(
    //         caller.notes.createNote({ 
    //             personId: actor.id, 
    //             teamId: 'TID00001',  
    //             noteId: 'NID00002', 
    //             date: '2025-10-10', 
    //             title: "Title", 
    //             content: "Test note" 
    //         })
    //     ).rejects.toThrow(expect.objectContaining({ code: 'BAD_REQUEST' }))
    // })

    // test('personal notes are limited to the calling user', async () => {
    //     const ctx = createInnerTRPCContext(mockContext)
    //     const caller = appRouter.createCaller(ctx)

    //     // This should fail because the person doesn't exist
    //     await expect(
    //         caller.notes.createNote({ 
    //             personId: "PID99999", 
    //             teamId: null,  
    //             noteId: 'NID00002', 
    //             date: '2025-10-10', 
    //             title: "Title", 
    //             content: "Test note" 
    //         })
    //     ).rejects.toThrow(expect.objectContaining({ code: 'FORBIDDEN' }))

    //     // This should also fail because the person is different from the authenticated user
    //     await expect(
    //         caller.notes.createNote({ 
    //             personId: SamplePersonnel.BeatrixLavinia.id, 
    //             teamId: null,  
    //             noteId: 'NID00003', 
    //             date: '2025-10-10', 
    //             title: "Title", 
    //             content: "Test note"
    //         })
    //     ).rejects.toThrow(expect.objectContaining({ code: 'FORBIDDEN' }))
    // })
})