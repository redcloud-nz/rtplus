
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

export type GridListProps = React.ComponentProps<'ul'>

export function GridList({ className, role = 'list', ...props }: GridListProps) {
    return <ul 
        className={cn(className, 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6')} 
        role={role}
        {...props}
    />
}

export type GridListItemProps = React.ComponentProps<'li'> & { asChild?: boolean}

export function GridListItem({ className, asChild = false, ...props }: GridListItemProps) {
    const Comp = asChild ? Slot : 'li'

    return <Comp
        className={cn(className, 'col-span-1 divide-y divide-gray-200 rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-gray-50 active:bg-gray-100')}
        {...props}
    />
}