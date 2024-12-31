/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ZodError } from 'zod'

export type FormState = {
    status: 'UNSET' | 'SUCCESS' | 'ERROR'
    message: string
    fieldErrors: Record<string, string[] | undefined>
    timestamp: number
}

export const EMPTY_FORM_STATE: FormState = {
    status: 'UNSET' as const,
    message: "",
    fieldErrors: {},
    timestamp: Date.now()
}

export function fromErrorToFormState(error: unknown): FormState {
    if(error instanceof ZodError) {
        return { 
            status: 'ERROR' as const,
            message: "",
            fieldErrors: error.flatten().fieldErrors,
            timestamp: Date.now()
        }
    } else if(error instanceof Error) {
        return {
            status: 'ERROR' as const,
            message: error.message,
            fieldErrors: {},
            timestamp: Date.now(),
        }
    } else {
        return {
            status: 'ERROR' as const,
            message: 'An unknown error occurred',
            fieldErrors: {},
            timestamp: Date.now()
        }
    }
}

export function toFormState(status: FormState['status'], message: string): FormState {
    return {
        status, message, fieldErrors: {}, timestamp: Date.now()
    }
}

export function fieldError(fieldName: string, message: string): FormState {
    return {
        status: 'ERROR' as const,
        message: "",
        fieldErrors: { [fieldName]: [message] },
        timestamp: Date.now()
    }
}