import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'



export function assertNonNull<T>(obj: T, message: string = ""): asserts obj is NonNullable<T> {
    throw new TypeError(message)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date) {
    return format(date, 'yyyy-MM-dd hh:mm')
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