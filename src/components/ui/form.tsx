/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'

import { Slot } from '@radix-ui/react-slot'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { EMPTY_FORM_STATE, FormState } from '@/lib/form-state'
import { cn } from '@/lib/utils'


type FormContextValue = {
    formState: FormState
}

const FormContext = React.createContext<FormContextValue>({ formState: EMPTY_FORM_STATE })


export type FormProps = Omit<React.JSX.IntrinsicElements['form'], 'action'> & {
    action?: (formState: FormState, formData: FormData) => Promise<FormState>
}

export function Form({ action = async () => EMPTY_FORM_STATE, className, ...props }: FormProps) {
    const [formState, formAction] = React.useActionState(action, EMPTY_FORM_STATE)

    return <FormContext.Provider value={{ formState }}>
        <form 
            action={formAction} 
            className={cn('flex flex-col gap-4 max-w-3xl', className)}
            data-component="Form"
            {...props}
        />
    </FormContext.Provider>
}



type FormFieldContextValue = {
    id: string
    name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

export type FormFieldProps = React.ComponentPropsWithRef<'div'> & { 
    name: string
}

export function FormField({ className, name, ...props }: FormFieldProps) {
    const id = React.useId()

    return (
        <FormFieldContext.Provider value={{ id, name }}>
            <div 
                className={cn('flex flex-col gap-2 mb-2', className)}
                data-component="FormField"
                {...props}
            />
        </FormFieldContext.Provider>
    )
}

export const useFormField = () => {
    const formContext = React.useContext(FormContext)
    const fieldContext = React.useContext(FormFieldContext)

    if(!formContext) {
        throw new Error("useForm should be used within <Form>")
    }

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>")
    }

    return {
        id: fieldContext.id,
        name: fieldContext.name,
        fieldControlId: `${fieldContext.id}-field-control`,
        fieldDescriptionId: `${fieldContext.id}-field-description`,
        fieldMessageId: `${fieldContext.id}-field-message`,
        errors: formContext.formState.fieldErrors[fieldContext.name]
    }
}


export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    const { errors, fieldControlId } = useFormField()

    return <Label
        data-component="FieldLabel"
        className={cn(errors && "text-destructive", className)}
        htmlFor={fieldControlId}
        {...props}
    />
}


export function FieldControl(props: React.ComponentProps<typeof Slot>) {
    const { errors, fieldControlId, fieldDescriptionId, fieldMessageId } = useFormField()

    return <Slot
        id={fieldControlId}
        aria-describedby={
            !errors
                ? `${fieldDescriptionId}`
                : `${fieldDescriptionId} ${fieldMessageId}`
        }
        aria-invalid={!!errors}
        {...props}
    />
}

export function FieldDescription({ className, ...props }: React.ComponentPropsWithRef<'p'>) {
    const { fieldDescriptionId } = useFormField()

    return <p
        id={fieldDescriptionId}
        className={cn("text-sm text-muted-foreground", className)}
        data-component="FieldDescription"
        {...props}
    />

}


export function FieldMessage({ className, children, ...props }: React.ComponentPropsWithRef<'p'>) {
    const { errors, fieldMessageId } = useFormField()
    const body = errors ? errors[0] : children

    if (!body) return null

    return <p
        id={fieldMessageId}
        className={cn("text-sm font-medium text-destructive", className)}
        data-component="FieldMessage"
        {...props}
    >
        {body}
    </p>
}


export function FormMessage({ className, ...props }: Omit<React.ComponentPropsWithRef<'p'>, 'children'>) {
    const formContext = React.useContext(FormContext)

    const { status, message } = formContext.formState
    if(!message) return null

    return <p
        className={cn(
            'text-sm font-medium', 
            status == 'ERROR' && 'text-destructive',
            className
        )}
        data-component="FormMessage"
        {...props}
    >
        {message}
    </p>
}


export function FormFooter({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div 
        className={cn('mt-2 flex gap-2', className)}
        data-component="FormFooter"
        {...props}
    />
}

export type FormSubmitButtonProps = React.ComponentPropsWithRef<typeof Button> & {
    label: React.ReactNode
    loading: React.ReactNode
}

export function FormSubmitButton({ label, loading }: FormSubmitButtonProps) {
    const { pending } = useFormStatus()

    return <Button 
        data-component="FormSubmitButton"
        disabled={pending}
        type="submit"
    >{ pending ? loading : label}</Button>
}
