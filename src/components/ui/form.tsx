/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    useFormContext,
  } from 'react-hook-form'
import { VariantProps } from 'tailwind-variants'

import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

import { Button, buttonVariants } from './button'
import { Label } from './label'


export { FormProvider } from 'react-hook-form'


type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

export function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) {
    return <FormFieldContext.Provider value={{ name: props.name }}>
        <Controller {...props} />
    </FormFieldContext.Provider>
}

export const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()

    const fieldState = getFieldState(fieldContext.name, formState)

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>")
    }

    const { id } = itemContext

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    }
}

type FormItemContextValue = {
    id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
)

export function FormItem({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    const id = React.useId()

    return <FormItemContext.Provider value={{ id }}>
        <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
}


export function FormLabel({ className, ...props }: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>) {
    const { error, formItemId } = useFormField()

    return <Label
        className={cn(error && "text-destructive", className)}
        htmlFor={formItemId}
        {...props}
    />
}

export function FormControl({ ...props }:  React.ComponentPropsWithoutRef<typeof Slot>) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return <Slot
        id={formItemId}
        aria-describedby={
            !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
        />
}

export function FormDescription({ className, ...props }: React.ComponentPropsWithRef<'p'>) {
    const { formDescriptionId } = useFormField()

    return <p
        id={formDescriptionId}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
}

export function FormMessage({ className, children, ...props }: React.ComponentPropsWithRef<'p'>) {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) return null

    return <p
        id={formMessageId}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
        >
        {body}
    </p>
}


export interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    labels?: {
        ready?: React.ReactNode
        validating?: React.ReactNode
        submitting?: React.ReactNode
        submitted?: React.ReactNode
    }
}

const defaultLabels = {
    ready: 'Submit',
    validating: 'Validating...',
    submitting: 'Submitting...',
    submitted: 'Submitted',
}

export function FormSubmitButton({ children, className, disabled, variant, size, labels = {}, ...props}: FormSubmitButtonProps) {
    labels = { ...defaultLabels, ...labels }

    const { formState: { isSubmitted, isSubmitSuccessful, isSubmitting, isValidating } } = useFormContext()

    const state = isValidating ? 'validating' :
        isSubmitting ? 'submitting' :
        (isSubmitted && isSubmitSuccessful) ? 'submitted' : 
        "ready"

    return <button
        className={cn('group', buttonVariants({ variant, size, className }))}
        disabled={disabled || isValidating || isSubmitting || (isSubmitted && isSubmitSuccessful)}
        data-state={state}
        type="submit"
        {...props}
    >
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin hidden group-data-[state=validating]:inline group-data-[state=submitting]:inline" />
        {labels.ready ? <FormSubmitButtonLabel activeState="ready">{labels.ready}</FormSubmitButtonLabel> : null}
        {labels.validating ? <FormSubmitButtonLabel activeState="validating">{labels.validating}</FormSubmitButtonLabel> : null}
        {labels.submitting ? <FormSubmitButtonLabel activeState="submitting">{labels.submitting}</FormSubmitButtonLabel> : null}
        {labels.submitted ? <FormSubmitButtonLabel activeState="submitted">{labels.submitted}</FormSubmitButtonLabel> : null}
        {children}
    </button>
}

export type FormSubmitButtonLabelProps = React.ComponentPropsWithRef<'span'> & {
    activeState: 'ready' | 'validating' | 'submitting' | 'submitted'
}

export function FormSubmitButtonLabel({ children, className, activeState, ...props }: FormSubmitButtonLabelProps) {
    return <span className={cn(
        'hidden', 
        activeState == 'ready' && 'group-data-[state=ready]:inline', 
        activeState == 'validating' && 'group-data-[state=validating]:inline', 
        activeState == 'submitting' && 'group-data-[state=submitting]:inline', 
        activeState == 'submitted' && 'group-data-[state=submitted]:inline', 
        className
    )} {...props}>{children}</span>
}


export function FormCancelButton({ children = "Cancel", onClick, variant = 'ghost', ...props }: React.ComponentPropsWithRef<typeof Button>) {
    const router = useRouter()

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        if (onClick) onClick(event)
        else router.back()
    }

    return <Button variant={variant} type="button" onClick={handleClick} {...props}>Cancel</Button>
}

export function FormButtons({ children, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div className="flex justify-start space-x-2 pt-8" {...props}>
        {children}
    </div>

}