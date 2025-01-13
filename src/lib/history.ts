/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { createId } from '@paralleldrive/cuid2'
import { HistoryEvent, HistoryEventObjectType, HistoryEventType } from '@prisma/client'


export type HistoryEventData = Omit<HistoryEvent, 'timestamp' | 'meta'> & { meta: Record<string, number | string> }

interface CreateEventArgs {
    description?: string
    meta?: Record<string, number | string>
}

/**
 * Helper class for building history events.
 */
export class EventBuilder {

    readonly orgId: string
    readonly userId: string | null
    readonly parentId: string | null

    private constructor(orgId: string, userId: string | null, parentId: string | null) {
        this.orgId = orgId
        this.userId = userId
        this.parentId = parentId
    }

    /**
     * Create a new EventBuilder instance.
     */
    static create(orgId: string, userId: string | null): EventBuilder {
        return new EventBuilder(orgId, userId, null)
    }

    /**
     * Create a new EventBuilder instance with a parent event.
     */
    static createGrouped(orgId: string, userId: string | null): EventBuilder {
       return new EventBuilder(orgId, userId, createId())
    }

    buildRootEvent(eventType: HistoryEventType, objectType: HistoryEventObjectType, objectId: string, { description = "", meta = {} }: CreateEventArgs = {}): HistoryEventData {
        return { id: this.parentId!!, orgId: this.orgId, userId: this.userId, parentId: null, eventType, objectType, objectId, description, meta }
    }

    buildEvent(eventType: HistoryEventType, objectType: HistoryEventObjectType, objectId: string, { description = "", meta = {} }: CreateEventArgs = {}): HistoryEventData {
        return { id: createId(), orgId: this.orgId, userId: this.userId, parentId: this.parentId, eventType, objectType, objectId, description, meta }
    }
}