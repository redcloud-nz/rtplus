/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /sign-in
 */

import { SignUp } from '@clerk/nextjs'

export const metadata = {
    title: 'Sign Up',
    description: 'Create a new account to get started with RT+',
}

export default function SignUpPage() {
    return <div className="flex flex-col items-center justify-center w-full h-screen">
        <SignUp/>
    </div>
}