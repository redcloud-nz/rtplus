/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClerkProvider, UserButton } from '@clerk/nextjs'

import { FrontendProvider } from '@/components/frontend-provider'

import './globals.css'
import { AppSidebar } from '@/components/app-sidebar'

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: "%s | RT+",
        default: "RT+",
    },
    description: "RT+ App",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <ClerkProvider>
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <FrontendProvider>
                    <AppSidebar/>
                    {children}
                    <div className="fixed top-0 right-0 h-12 w-12 flex justify-center items-center">
                        <UserButton/>
                    </div>
                </FrontendProvider>
            </body>
        </html>
    </ClerkProvider>
}
