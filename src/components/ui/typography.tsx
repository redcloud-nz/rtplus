import { cn } from '@/lib/utils'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export function Heading({ className, level = 1, ...props }: HeadingProps) {
    const Element: `h${typeof level}` = `h${level}`

    return <Element {...props} className={cn(
        level == 1 && 'scroll-m-20 text-2xl lg:text-4xl font-extrabold tracking-tight ',
        level == 2 && 'scroll-m-20 border-b pb-2 text-2xl lg:text-3xl font-semibold tracking-tight first:mt-0',
        level == 3 && 'scroll-m-20 text-2xl font-semibold tracking-tight',
        level >= 4 && 'scroll-m-20 text-xl font-semibold tracking-tight',
        className
    )}/>
}

export function Paragraph({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props}/>
}

export function Blockquote({ className, ...props}: React.ComponentPropsWithoutRef<'blockquote'>) {
    return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props}/>
}

export function InlineCode({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
    return <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)} {...props}/>
}

export function Description({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p 
        className={cn(
            'mt-2 text-sm text-gray-700', 
            className
        )} 
        {...props}
    />
}