/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'


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

export default async function Root_Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <ClerkProvider
        appearance={{
            cssLayerName: 'clerk'
        }}
        taskUrls={{
            'choose-organization': "/onboarding/choose-organization",
        }}
    >
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    </ClerkProvider>
}
