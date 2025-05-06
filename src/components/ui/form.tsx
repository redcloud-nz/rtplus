/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Loader2Icon } from 'lucide-react'
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
import { Link } from './link'


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


export type FormCancelButtonProps = Omit<React.ComponentPropsWithRef<typeof Button>, 'onClick'> & (
    | { onClick: React.MouseEventHandler<HTMLButtonElement>, href?: never }
    | { onClick?: never, href: string }
)


/**
 * A customizable cancel button component for forms. It supports either an `onClick` handler
 * or a navigation `href` link, but not both simultaneously.
 *
 * @param {object} props - The properties for the FormCancelButton component.
 * @param {React.ReactNode} [props.children="Cancel"] - The content to display inside the button. Defaults to "Cancel".
 * @param {string} [props.href] - The URL to navigate to when the button is clicked. If provided, `onClick` will be ignored.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick] - The click event handler for the button. If provided, it takes precedence over `href`.
 * @param {string} [props.variant="ghost"] - The visual style variant of the button. Defaults to "ghost".
 * @param {object} [props.props] - Additional props to pass to the underlying button component.
 *
 * @returns {JSX.Element} A button element that either triggers an `onClick` handler or navigates to a specified `href`.
 *
 * @remarks
 * - If both `onClick` and `href` are provided, a warning will be logged, and `onClick` will take precedence.
 * - If neither `onClick` nor `href` is provided, a warning will be logged indicating that `onClick` is required.
 */
export function FormCancelButton({ children = "Cancel", href, onClick, variant = 'ghost', ...props }: FormCancelButtonProps) {

    if(onClick) {
        if(href) console.warn("FormCancelButton: onClick and href props are mutually exclusive. onClick will be used.")
        
        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            onClick(event)
        }

        return <Button variant={variant} type="button" onClick={handleClick} {...props}>{children}</Button>
    } else {
        if(!href) console.warn("FormCancelButton: onClick prop is required when href is not provided.")

        return <Button variant={variant} type="button" {...props}>
            <Link href={href}>{children}</Link>
        </Button>
    }
}

/**
 * A component that renders a container for form action buttons.
 * It is designed to be used within a form and provides a consistent layout for action buttons.
 *
 * @param children - The child elements to be rendered inside the container.
 * @param props - Additional props to be passed to the underlying `div` element.
 * 
 * @example
 * ```tsx
 * <FormActions>
 *   <button type="submit">Submit</button>
 *   <button type="button">Cancel</button>
 * </FormActions>
 * ```
 */
export function FormActions({ children, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div className="flex justify-start space-x-2 pt-4" {...props}>
        {children}
    </div>

}


export function FormValue({ className, ...props }: React.ComponentPropsWithRef<'div'>) {

    return <div className={cn("h-10 w-full bg-background px-3 py-2", className)} {...props}/>
}