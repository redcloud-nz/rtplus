import {cn} from '@/lib/utils'

export function Text({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p
        data-slot="text"
        {...props}
        className={cn('text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400', className)}
      />
}