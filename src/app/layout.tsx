
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { FrontendProvider } from '@/components/frontend-provider'
import { Toaster } from '@/components/ui/toaster'

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
    title: "RT+",
    description: "RT+ App",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await currentUser()

    return <ClerkProvider>
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <FrontendProvider>
                    <AppSidebar signedIn={user != null}/>
                    <AppPageContainer>
                        {children}
                    </AppPageContainer>
                    <Toaster/>
                </FrontendProvider>
            </body>
        </html>
    </ClerkProvider>
}
