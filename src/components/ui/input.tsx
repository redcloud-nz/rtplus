import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            data-component="Input"
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export interface HiddenInputProps {
    name: string
    value: string | number | undefined
}

export function HiddenInput({ name, value }: HiddenInputProps) {
    return <input type="hidden" name={name} value={value}/>
}

export { Input }
