/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import {Link} from '@/components/ui/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col min-h-screen [&>main]:flex-1">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b">
            <Link className="flex items-center justify-center" href="/">
            <Image
                className="dark:invert"
                src="/logo.svg"
                alt="RT+ logo"
                width={64}
                height={32}
                priority
            />
            </Link>
            <nav className="ml-auto hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#features">
                Features
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#pricing">
                Pricing
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#testimonials">
                Testimonials
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#faq">
                FAQ
            </Link>
            </nav>
            <div className="ml-6 flex items-center gap-2">
                <SignedIn>
                    <Button asChild>
                        <Link href="/app">RT+ App <ArrowRightIcon/></Link>
                    </Button>
                </SignedIn>
                <SignedOut>
                    <SignInButton>
                        <Button> Sign In</Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </header>
        {children}
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <div className="flex items-center gap-2">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={64}
                    height={32}
                    priority
                />
            </div>
            <p className="text-xs text-muted-foreground sm:ml-4">© 2025 Redcloud Development, Ltd.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="/terms-of-service">
                Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="/privacy-policy">
                Privacy Policy
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="/contact">
                Contact
            </Link>
            </nav>
        </footer>
    </div>
}