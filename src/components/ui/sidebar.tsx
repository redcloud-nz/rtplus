/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { PanelLeftIcon, PanelRightIcon } from 'lucide-react'
import React from 'react'
import { tv, type VariantProps} from 'tailwind-variants'

import { Slot } from '@radix-ui/react-slot'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

import { Button } from './button'
import { Input } from './input'
import { Separator } from './separator'
import { Sheet, SheetContent, SheetTitle } from './sheet'
import { Skeleton } from './skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { VisuallyHidden } from './visually-hidden'


const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarState = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean) => void
    openMobile: boolean
    setOpenMobile: (open: boolean) => void
    toggleSidebar: () => void
}

type SidebarContext = {
    left: SidebarState
    right: SidebarState
    isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar(side: "left" | "right" = "left") {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return {
        ...context[side],
        isMobile: context.isMobile
    }
}


type SidebarProviderProps = React.ComponentPropsWithRef<'div'> & {
    defaultOpenLeft?: boolean
    defaultOpenRight?: boolean
    openLeft?: boolean
    openRight?: boolean
    onOpenChangeLeft?: (open: boolean) => void
    onOpenChangeRight?: (open: boolean) => void
}

export function SidebarProvider({ 
    defaultOpenLeft = true, 
    defaultOpenRight = true,
    openLeft: openLeftProp, 
    openRight: openRightProp,
    onOpenChangeLeft: setOpenLeftProp,
    onOpenChangeRight: setOpenRightProp,
    className, 
    style, 
    children, 
    ...props 
}: SidebarProviderProps) {
    const isMobile = useIsMobile()
    const [openMobileLeft, setOpenMobileLeft] = React.useState(false)
    const [openMobileRight, setOpenMobileRight] = React.useState(false)

    // Left sidebar state
    const [_openLeft, _setOpenLeft] = React.useState(defaultOpenLeft)
    const openLeft = openLeftProp ?? _openLeft
    const setOpenLeft = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(openLeft) : value
        if (setOpenLeftProp) {
            setOpenLeftProp(openState)
        } else {
            _setOpenLeft(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}:left=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }, [setOpenLeftProp, openLeft])

    // Right sidebar state
    const [_openRight, _setOpenRight] = React.useState(defaultOpenRight)
    const openRight = openRightProp ?? _openRight
    const setOpenRight = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(openRight) : value
        if (setOpenRightProp) {
            setOpenRightProp(openState)
        } else {
            _setOpenRight(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}:right=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }, [setOpenRightProp, openRight])

    // Helper to toggle the left sidebar.
    const toggleSidebarLeft = React.useCallback(() => {
        return isMobile
            ? setOpenMobileLeft((open) => !open)
            : setOpenLeft((open) => !open)
    }, [isMobile, setOpenLeft, setOpenMobileLeft])

    // Helper to toggle the right sidebar.
    const toggleSidebarRight = React.useCallback(() => {
        return isMobile
            ? setOpenMobileRight((open) => !open)
            : setOpenRight((open) => !open)
    }, [isMobile, setOpenRight, setOpenMobileRight])

    // Adds a keyboard shortcut to toggle the left sidebar.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                toggleSidebarLeft()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebarLeft])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const stateLeft = openLeft ? "expanded" : "collapsed"
    const stateRight = openRight ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(() => ({
        left: {
            state: stateLeft,
            open: openLeft,
            setOpen: setOpenLeft,
            openMobile: openMobileLeft,
            setOpenMobile: setOpenMobileLeft,
            toggleSidebar: toggleSidebarLeft,
        },
        right: {
            state: stateRight,
            open: openRight,
            setOpen: setOpenRight,
            openMobile: openMobileRight,
            setOpenMobile: setOpenMobileRight,
            toggleSidebar: toggleSidebarRight,
        },
        isMobile,
    }), [stateLeft, openLeft, setOpenLeft, openMobileLeft, setOpenMobileLeft, toggleSidebarLeft,
         stateRight, openRight, setOpenRight, openMobileRight, setOpenMobileRight, toggleSidebarRight,
         isMobile])

    return <SidebarContext.Provider value={contextValue}>
        <div
            style={{
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
            } as React.CSSProperties}
            className={cn(
                "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
                className
            )}
            {...props}
        >
            {children}
        </div>
    </SidebarContext.Provider>
}


type SidebarProps = React.ComponentProps<'div'> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }

export function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }: SidebarProps) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar(side)

    if (collapsible === "none") {
        return <div
            className={cn(
                "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
                className
            )}
            {...props}
        >
            {children}
        </div>
    }

    if (isMobile) {
        return <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
            <SheetContent
                data-sidebar="sidebar"
                data-mobile="true"
                className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                style={{
                    "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                } as React.CSSProperties}
                side={side}
            >
                <VisuallyHidden>
                    <SheetTitle id="sidebar-title">RT+ Sidebar</SheetTitle>
                </VisuallyHidden>
                
                <div className="flex h-full w-full flex-col">{children}</div>
            </SheetContent>
        </Sheet>
    }

    return <div
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
    >
        {/* This is what handles the sidebar gap on desktop */}
        <div
            className={cn(
                "duration-200 relative h-svh w-(--sidebar-width) bg-transparent transition-[width] ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset"
                ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )}
        />
        <div
            className={cn(
                "duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex",
                side === "left"
                ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset"
                ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
            )}
            {...props}
        >
            <div
                data-sidebar="sidebar"
                className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
            >
                {children}
            </div>
        </div>
    </div>
}


export function SidebarTrigger({ 
    side = "left", 
    onClick, 
    ...props 
}: React.ComponentPropsWithRef<typeof Button> & { side?: "left" | "right" }) {
    const { toggleSidebar } = useSidebar(side)

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button
                data-sidebar="trigger"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                    onClick?.(event)
                    toggleSidebar()
                }}
                {...props}
            >
                { side == 'left' ? <PanelLeftIcon /> : <PanelRightIcon /> }
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Sidebar</TooltipContent>
    </Tooltip>
    
    
}


export function SidebarRail({ 
    side = "left", 
    className, 
    ...props 
}: React.ComponentPropsWithRef<'button'> & { side?: "left" | "right" }) {
    const { toggleSidebar } = useSidebar(side)

    return <button
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
            "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
            "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
            "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
            "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
            "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
            "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
            className
        )}
        {...props}
    />
}


export function SidebarInset({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        className={cn(
            "relative flex min-h-svh flex-1 flex-col bg-background",
            "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
            className
        )}
        {...props}
    />
}


export function SidebarInput({ className, ...props }: React.ComponentPropsWithRef<typeof Input>) {
    return <Input
        data-sidebar="input"
        className={cn(
            "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            className
        )}
        {...props}
    />
}

export function SidebarHeader({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        data-sidebar="header"
        className={cn("h-[49px] flex justify-center items-center p-2 border-b", className)}
        {...props}
    />
}


export function SidebarFooter({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        data-sidebar="footer"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
    />
}


export function SidebarSeparator({ className, ...props }: React.ComponentPropsWithRef<typeof Separator>) {
    return <Separator
        data-sidebar="separator"
        className={cn("mx-2 w-auto bg-sidebar-border", className)}
        {...props}
    />
}


export function SidebarContent({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        data-sidebar="content"
        className={cn(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
            className
        )}
        {...props}
    />
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return <div
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
    />
}

export function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentPropsWithRef<'div'> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "div"

    return <Comp
        data-sidebar="group-label"
        className={cn(
            "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
            "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
            className
        )}
        {...props}
    />
}


export function SidebarGroupAction({ className, asChild = false, ...props }: React.ComponentPropsWithRef<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

    return <Comp
        data-sidebar="group-action"
        className={cn(
            "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
            // Increases the hit area of the button on mobile.
            "after:absolute after:-inset-2 md:after:hidden",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
}


export function SidebarGroupContent({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
        data-sidebar="group-content"
        className={cn("w-full text-sm", className)}
        {...props}
    />
}


export function SidebarMenu({ className, ...props }: React.ComponentPropsWithRef<'ul'>) {
    return <ul
        data-sidebar="menu"
        className={cn("flex w-full min-w-0 flex-col", className)}
        {...props}
    />
}


export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
    return <li
        data-sidebar="menu-item"
        className={cn("group/menu-item relative", className)}
        {...props}
    />
}


const sidebarMenuButtonVariants = tv({
    base: "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
})

type SidebarMenuButtonProps = React.ComponentPropsWithRef<'button'> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentPropsWithRef<typeof TooltipContent>
    side?: "left" | "right"
} & VariantProps<typeof sidebarMenuButtonVariants>

export function SidebarMenuButton({ 
    asChild = false, 
    isActive = false, 
    variant = "default", 
    size = "default", 
    side = "left",
    tooltip, 
    className, 
    ...props 
}: SidebarMenuButtonProps) {
    const Comp = asChild ? Slot : 'button'
    const { isMobile, state } = useSidebar(side)

    const button = (
      <Comp
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
}


export function SidebarMenuAction({ className, asChild = false, showOnHover = false, ...props }: React.ComponentPropsWithRef<'button'> & { asChild?: boolean, showOnHover?: boolean }) {
    const Comp = asChild ? Slot : 'button'

    return <Comp
        data-sidebar="menu-action"
        className={cn(
            "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
            // Increases the hit area of the button on mobile.
            "after:absolute after:-inset-2 md:after:hidden",
            "peer-data-[size=sm]/menu-button:top-1",
            "peer-data-[size=default]/menu-button:top-1.5",
            "peer-data-[size=lg]/menu-button:top-2.5",
            "group-data-[collapsible=icon]:hidden",
            showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
            className
        )}
        {...props}
    />
}


export function SidebarMenuBadge({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return <div
    
        data-sidebar="menu-badge"
        className={cn(
            "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
            "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
            "peer-data-[size=sm]/menu-button:top-1",
            "peer-data-[size=default]/menu-button:top-1.5",
            "peer-data-[size=lg]/menu-button:top-2.5",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
}


export function SidebarMenuSkeleton({ className, showIcon = false, ...props }: React.ComponentPropsWithRef<'div'> & { showIcon?: boolean }) {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`
    }, [])

    return <div
        data-sidebar="menu-skeleton"
        className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
        {...props}
    >
        {showIcon && <Skeleton
            className="size-4 rounded-md"
            data-sidebar="menu-skeleton-icon"
        />}
        <Skeleton
            className="h-4 flex-1 max-w-(--skeleton-width)"
            data-sidebar="menu-skeleton-text"
            style={{ "--skeleton-width": width } as React.CSSProperties }
        />
    </div>
}


export function SidebarMenuSub({ className, ...props }: React.ComponentPropsWithRef<'ul'>) {
    return <ul
        data-sidebar="menu-sub"
        className={cn(
            "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
}


export function SidebarMenuSubItem(props: React.ComponentPropsWithRef<"li">) {
    return <li {...props} />
}


type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }

export function SidebarMenuSubButton({ asChild = false, size = "md", isActive, className, ...props }: SidebarMenuSubButtonProps) {
    const Comp = asChild ? Slot : 'a'

    return <Comp
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
            "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
        />
}
