

import { type Session, getSession } from '@auth0/nextjs-auth0'

import 'server-only'

export async function getUserSession(): Promise<{ session: Session, userId: string }> {
    const session = await getSession()

    if(!session) throw new Error("You must be signed in to perform this action")

    const userId = session.user.sub as string
    return { userId, session }
}

