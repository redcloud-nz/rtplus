
import { HistoryEventType } from '@prisma/client'

import prisma from './prisma'


interface RecordEventArgs { 
    orgId: string
    userId: string
    description?: string
    meta?: Record<string, number | string>
}

export async function recordEvent(eventType: HistoryEventType, { orgId, userId, description = '', meta = {} }: RecordEventArgs) {
    await prisma.historyEvent.create({
        data: { orgId, eventType, userId, description, meta }
    })
}