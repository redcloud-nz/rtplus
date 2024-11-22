
import { cva, type VariantProps } from 'class-variance-authority'
import { InfoIcon, Loader2Icon } from 'lucide-react'
import React from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

import { Link } from './link'


const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
  }
)
Button.displayName = "Button"


export interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>
    label?: React.ReactNode
    pending?: React.ReactNode
    done?: React.ReactNode
}

export function AsyncButton({ children, className, disabled, variant, size, onClick, label, pending, done, ...props}: AsyncButtonProps) {

    const [state, setState] = React.useState<'ready' | 'pending' | 'done'>('ready')

    async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        if(onClick) {
            setState('pending')
            await onClick(event)
            setState('done')
        }
    }

    return <button
        className={cn('group', buttonVariants({ variant, size, className }))}
        disabled={state != 'ready' || disabled}
        onClick={handleClick}
        data-state={state}
        {...props}
    >
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin hidden group-data-[state=pending]:inline" />
        {label ? <SubmitButtonLabel activeState="ready">{label}</SubmitButtonLabel> : null}
        {pending ? <SubmitButtonLabel activeState="pending">{pending}</SubmitButtonLabel> : null}
        {done ? <SubmitButtonLabel activeState="ready">{done}</SubmitButtonLabel> : null}
        {children}
    </button>

}

export type SubmitButtonLabelProps = React.ComponentPropsWithoutRef<'span'> & {
    activeState: 'ready' | 'pending' | 'done'
}

export function SubmitButtonLabel({ children, className, activeState, ...props }: SubmitButtonLabelProps) {
    return <span className={cn(
        'hidden', 
        activeState == 'ready' && 'group-data-[state=ready]:inline', 
        activeState == 'pending' && 'group-data-[state=pending]:inline', 
        activeState == 'done' && 'group-data-[state=done]:inline', 
        className
    )} {...props}>{children}</span>
}

function DocumentationButton({ topic }: { topic: string }) {
    return <Button variant="ghost" asChild>
        <Link href={`/documentation/${topic}`}><InfoIcon/></Link>
    </Button>
}

export { Button, buttonVariants, DocumentationButton }


