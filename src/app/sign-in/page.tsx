/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /sign-in
 */

import { SignIn } from '@clerk/nextjs'

export const metadata = {
    title: 'Sign In',
    description: 'Sign in to your RT+ account',
}

export default function SignInPage() {
    return <div className="flex flex-col items-center justify-center w-full h-screen">
        <SignIn/>
    </div>
}