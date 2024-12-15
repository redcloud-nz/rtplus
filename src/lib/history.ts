
import prisma from './prisma'

export type HistoryEventType = 
    'CreatePerson' | 'CreateTeam'
    | 'DeletePerson' | 'DeleteTeam'
    | 'UpdatePerson' | 'UpdateTeam'


interface RecordEventArgs { 
    orgId: string
    userId: string
    description?: string
    meta?: Record<string, any>
}

export async function recordEvent(eventType: HistoryEventType, { orgId, userId, description = '', meta = {} }: RecordEventArgs) {

    await prisma.historyEvent.create({
        data: { orgId, eventType, userId, description, meta }
    })
}