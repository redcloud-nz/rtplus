/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { appendDiff, SkillCheckDiff } from './skill-check-data'

describe('appendDiff', () => {
    const existingDiffs: SkillCheckDiff[] = [
        { type: 'UPDATE_SESSION', session: { id: '1', assessorId: '1.5', name: 'Session', date: 'NOW', status: 'Draft' } }, 
        { type: 'ADD_ASSESSEE', assesseeId: '2' }, 
        { type: 'REMOVE_ASSESSEE', assesseeId: '3' }, 
        { type: 'ADD_SKILL', skillId: '4' }, 
        { type: 'REMOVE_SKILL', skillId: '5' }, 
        { type: 'UPDATE_CHECK', check: { id: '6', assesseeId: '7', skillId: '8', competenceLevel: 'NotAssessed', notes: '', timestamp: 'NOW' } }
    ]

    it('should append a new UPDATE_SESSION', () => {
        const withoutSessionDiff = existingDiffs.slice(1)
        const newDiff: SkillCheckDiff = { type: 'UPDATE_SESSION', session: { id: '1', assessorId: '1.5', name: 'Session 2', date: 'LATER', status: 'Draft' } }
        const result = appendDiff(withoutSessionDiff, newDiff)
        expect(result).toEqual([...withoutSessionDiff, newDiff])
    })

    it('should replace an existing UPDATE_SESSION', () => {
        const newDiff: SkillCheckDiff = { type: 'UPDATE_SESSION', session: { id: '1', assessorId: '1.5', name: 'Session 3', date: 'LATER', status: 'Draft' } }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(1), newDiff])
    })

    it('should append a new ADD_ASSESSEE', () => {
        const newDiff: SkillCheckDiff = { type: 'ADD_ASSESSEE', assesseeId: '9' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs, newDiff])
    })

    it('should cancel an existing REMOVE_ASSESSEE', () => {
        const newDiff: SkillCheckDiff = { type: 'ADD_ASSESSEE', assesseeId: '3' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(0,2), ...existingDiffs.slice(3)])
    })

    it('should append a new REMOVE_ASSESSEE', () => {
        const newDiff: SkillCheckDiff = { type: 'REMOVE_ASSESSEE', assesseeId: '10' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs, newDiff])
    })

    it('should cancel an existing ADD_ASSESSEE', () => {
        const newDiff: SkillCheckDiff = { type: 'REMOVE_ASSESSEE', assesseeId: '2' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(0,1), ...existingDiffs.slice(2)])
    })

    it('should append a new ADD_SKILL', () => {
        const newDiff: SkillCheckDiff = { type: 'ADD_SKILL', skillId: '11' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs, newDiff])
    })

    it('should cancel an existing REMOVE_SKILL', () => {
        const newDiff: SkillCheckDiff = { type: 'ADD_SKILL', skillId: '5' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(0,4), ...existingDiffs.slice(5)])
    })

    it('should append a new REMOVE_SKILL', () => {
        const newDiff: SkillCheckDiff = { type: 'REMOVE_SKILL', skillId: '12' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs, newDiff])
    })

    it('should cancel an existing ADD_SKILL', () => {
        const newDiff: SkillCheckDiff = { type: 'REMOVE_SKILL', skillId: '4' }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(0,3), ...existingDiffs.slice(4)])
    })

    it('should append a new UPDATE_CHECK', () => {
        const newDiff: SkillCheckDiff = { type: 'UPDATE_CHECK', check: { id: '13', assesseeId: '14', skillId: '15', competenceLevel: 'NotAssessed', notes: '', timestamp: 'NOW' } }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs, newDiff])
    })

    it('should replace an existing UPDATE_CHECK', () => {
        const newDiff: SkillCheckDiff = { type: 'UPDATE_CHECK', check: { id: '6', assesseeId: '7', skillId: '8', competenceLevel: 'Competent', notes: '', timestamp: 'NOW' } }
        const result = appendDiff(existingDiffs, newDiff)
        expect(result).toEqual([...existingDiffs.slice(0,5), newDiff])
    })
})