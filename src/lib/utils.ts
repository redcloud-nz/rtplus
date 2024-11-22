import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'



export function assertNonNull<T>(obj: T, message: string = ""): asserts obj is NonNullable<T> {
    if(obj == null) throw TypeError(message)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(stringOrDate: string | Date) {
    const date = stringOrDate instanceof Date ? stringOrDate : new Date(stringOrDate)

    return format(date, 'HH:mm E d MMM yyyy')
}

export function resolveAfter<R>(valueOrLazy: R | (() => R), delay: number): Promise<R> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const value = valueOrLazy instanceof Function ? valueOrLazy() : valueOrLazy
                resolve(value)
            } catch(ex) {
                reject(ex)
            }
        }, delay)
    })
}