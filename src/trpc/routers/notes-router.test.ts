/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { describe, test, expect, beforeEach } from 'vitest'
import { createInnerTRPCContext } from '../init'
import { appRouter } from './_app'
import { createAuthenticatedMockContext } from '@/test/trpc-helpers'
import prisma from '@/server/prisma'
import { TRPCError } from '@trpc/server'

describe('Notes Router', () => {
    let mockContext: ReturnType<typeof createAuthenticatedMockContext>

    beforeEach(async () => {
        // Create a custom auth context that matches the person we want to create a note for
        mockContext = createAuthenticatedMockContext({
        personId: 'PID00001'
        })
    })

    test('create note', async () => {
        // Seed some test data in the database
        await prisma.person.create({
        data: {
            id: 'PID00001',
            name: 'Test Person',
            email: 'test@example.com',
        }
        })

        const ctx = createInnerTRPCContext(mockContext)
        const caller = appRouter.createCaller(ctx)

        const result = await caller.notes.createNote({ 
            personId: "PID00001", 
            teamId: null,  
            noteId: 'NID00001', 
            date: '2025-10-10', 
            title: "Title", 
            content: "Test note" 
        })

        expect(result).toBeDefined()
        expect(result.personId).toBe('PID00001')
        expect(result.title).toBe('Title')
        expect(result.content).toBe('Test note')
        expect(result.date).toBe('2025-10-10')
        
        // Verify the note was actually created in the database
        const createdNote = await prisma.note.findFirst({
            where: { personId: 'PID00001' }
        })
        expect(createdNote).toBeDefined()
        expect(createdNote?.title).toBe('Title')
    })

    test('create note requires valid person', async () => {
        const ctx = createInnerTRPCContext(mockContext)
        const caller = appRouter.createCaller(ctx)

        // This should fail because the person doesn't exist
        await expect(
            caller.notes.createNote({ 
                personId: "PID99999", 
                teamId: null,  
                noteId: 'NID99999', 
                date: '2025-10-10', 
                title: "Title", 
                content: "Test note" 
            })
        ).rejects.toThrow(TRPCError)
    })
})