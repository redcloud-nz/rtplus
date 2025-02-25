/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { customAlphabet } from 'nanoid'
import { v4 as uuidv4, validate } from 'uuid'

/**
 * Create a new v4 UUID
 * @returns A new UUID
 */
export function createUUID(): string {
    return uuidv4()
}

/**
 * Validate a UUID
 * @param id The id to validate
 * @returns True if the id is a valid UUID, false otherwise
 */
export function validateUUID(id: string): boolean {
    return validate(id)
}

export const NilUUID = '00000000-0000-0000-0000-000000000000'

export class UUIDValidationSet {

    private readonly ids = new Set<string>()

    validate(id: string) {
        if(!validateUUID(id)) throw new Error(`Invalid UUID: ${id}`)
        else if (this.ids.has(id)) throw new Error(`Duplicate UUID: ${id}`)

        this.ids.add(id)
    }
}

export function createWhereClause(uuidOrRef: string) {
    return validateUUID(uuidOrRef) ? { id: uuidOrRef } : { ref: uuidOrRef }
}


export function createRandomSlug() {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)
    return nanoid()
}