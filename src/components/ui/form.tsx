'use client'

import React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE, FormState } from '@/lib/form-state'
import { cn } from '@/lib/utils'




type FormContextValue = {
    formState: FormState
}

const FormContext = React.createContext<FormContextValue>({ formState: EMPTY_FORM_STATE })


export type FormProps = React.HtmlHTMLAttributes<HTMLFormElement> & {
    action: (formState: FormState, formData: FormData) => Promise<FormState>
}

function Form({ action, className, ...props }: FormProps) {
    const [formState, formAction] = useFormState(action, EMPTY_FORM_STATE)

    return <FormContext.Provider value={{ formState }}>
        <form action={formAction} className={cn('flex flex-col gap-4 max-w-3xl', className)} {...props}/>
    </FormContext.Provider>
}


type FormFieldContextValue = {
    id: string
    name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

export type FormFieldProps = React.ComponentPropsWithoutRef<'div'> & { name: string }

const FormField = ({ className, name, ...props }: FormFieldProps) => {
    const id = React.useId()

    return (
        <FormFieldContext.Provider value={{ id, name }}>
            <div className={cn('space-y-2', className)} {...props}/>
        </FormFieldContext.Provider>
    )
}

const useFormField = () => {
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


const FieldLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => {
    const { errors, fieldControlId } = useFormField()

    return (
        <Label
            ref={ref}
            className={cn(errors && "text-destructive", className)}
            htmlFor={fieldControlId}
            {...props}
        />
    )
})
FieldLabel.displayName = "FieldLabel"


const FieldControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { errors, fieldControlId, fieldDescriptionId, fieldMessageId } = useFormField()

    return (
        <Slot
            ref={ref}
            id={fieldControlId}
            aria-describedby={
                !errors
                    ? `${fieldDescriptionId}`
                    : `${fieldDescriptionId} ${fieldMessageId}`
            }
            aria-invalid={!!errors}
            {...props}
        />
    )
})
FieldControl.displayName = "FieldControl"

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
    const { fieldDescriptionId } = useFormField()

    return (
        <p
            ref={ref}
            id={fieldDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
})
FieldDescription.displayName = "FieldDescription"


const FieldMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
    const { errors, fieldMessageId } = useFormField()
    const body = errors ? errors[0] : children

    if (!body) {
        return null
    }

    return (
        <p
            ref={ref}
            id={fieldMessageId}
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    )
})
FieldMessage.displayName = "FieldMessage"


const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
    const formContext = React.useContext(FormContext)

    const { message } = formContext.formState
    if(!message) return null

    return <p
        ref={ref}
        className={cn("text-sm font-medium", className)}
        {...props}
    >
        {message}
    </p>
})
FormMessage.displayName = "FormMessage"


export function FormFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <div className={cn('mt-2', className)} {...props}/>
}

export interface FormSubmitButtonProps {
    label: string
    loading: React.ReactNode
}

export function FormSubmitButton({ label, loading }: FormSubmitButtonProps) {
    const { pending } = useFormStatus()

    return <Button disabled={pending} type="submit">{ pending ? loading : label}</Button>
}


export {
  useFormField,
  Form,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
  FormField,
  FormMessage,
}
