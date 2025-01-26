/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { HistoryEvent, HistoryEventObjectType, HistoryEventType } from '@prisma/client'

import { createUUID } from './id'


export type HistoryEventData = Omit<HistoryEvent, 'timestamp' | 'meta'> & { meta: Record<string, number | string> }

interface CreateEventArgs {
    description?: string
    meta?: Record<string, number | string>
}

/**
 * Helper class for building history events.
 */
export class EventBuilder {

    readonly personId: string | null
    readonly parentId: string | null

    private constructor(personid: string | null, parentId: string | null) {
        this.personId = personid
        this.parentId = parentId
    }

    /**
     * Create a new EventBuilder instance.
     */
    static create(userId: string | null): EventBuilder {
        return new EventBuilder(userId, null)
    }

    /**
     * Create a new EventBuilder instance with a parent event.
     */
    static createGrouped(userId: string | null): EventBuilder {
       return new EventBuilder(userId, createUUID())
    }

    buildRootEvent(eventType: HistoryEventType, objectType: HistoryEventObjectType, objectId: string, { description = "", meta = {} }: CreateEventArgs = {}): HistoryEventData {
        return { id: this.parentId!, personId: this.personId, parentId: null, eventType, objectType, objectId, description, meta }
    }

    buildEvent(eventType: HistoryEventType, objectType: HistoryEventObjectType, objectId: string, { description = "", meta = {} }: CreateEventArgs = {}): HistoryEventData {
        return { id: createUUID(), personId: this.personId, parentId: this.parentId, eventType, objectType, objectId, description, meta }
    }
}