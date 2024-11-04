import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'

import { type Session } from '@auth0/nextjs-auth0'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function getUserId(session: Session | null | undefined) {
    if(!session) throw new Error("You must be signed in to perform this action")

    return session.user.sub as string
}

export function formatDateTime(date: Date) {
    return format(date, 'yyyy-MM-dd hh:mm')
}