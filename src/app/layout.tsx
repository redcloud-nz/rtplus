
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClerkProvider } from '@clerk/nextjs'

import { AppSidebar } from "@/components/app-sidebar"
import { FrontendProvider } from '@/components/frontend-provider'
import { SidebarInset } from '@/components/ui/sidebar'
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <ClerkProvider>
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <FrontendProvider>
                    <AppSidebar />
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                    <Toaster/>
                </FrontendProvider>
            </body>
        </html>
    </ClerkProvider>
}
