/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { describe} from 'vitest'

// import { SamplePersonnel } from '@/test/sample-personnel'
// import { createAuthenticatedMockContext } from '@/test/trpc-helpers'

// import { createInnerTRPCContext } from '../init'
// import { appRouter } from './_app'



describe('Notes Router', () => {
    //let mockContext: ReturnType<typeof createAuthenticatedMockContext>

    //const actor = SamplePersonnel.AyazIovita // The person who is interacting with the system

    // beforeEach(async () => {
    //     // Seed some test data in the database
    //     await prisma.person.create({
    //         data: actor
    //     })
    //     await prisma.person.create({
    //         data: SamplePersonnel.BeatrixLavinia
    //     })

    //     // Create a custom auth context that matches the person we want to create a note for
    //     mockContext = createAuthenticatedMockContext({
    //         personId: actor.id,
    //     })
    // })

    // test('create note', async () => {

    //     const caller = appRouter.createCaller(mockContext)

    //     const result = await caller.notes.createNote({ 
    //         personId: actor.id, 
    //         teamId: null,  
    //         noteId: 'NID00001', 
    //         date: '2025-10-10', 
    //         title: "Title", 
    //         content: "Test note" 
    //     })

    //     expect(result).toBeDefined()
    //     expect(result.personId).toBe(actor.id)
    //     expect(result.title).toBe('Title')
    //     expect(result.content).toBe('Test note')
    //     expect(result.date).toBe('2025-10-10')
        
    //     // Verify the note was actually created in the database
    //     const createdNote = await prisma.note.findFirst({
    //         where: { personId: 'PID00001' }
    //     })
    //     expect(createdNote).toBeDefined()
    //     expect(createdNote?.title).toBe('Title')
    // })

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