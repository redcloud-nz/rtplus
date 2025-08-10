/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /post-sign-in
 */

import { LoadingSpinner } from '@/components/ui/loading'

export default function PostSignInLoading() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <LoadingSpinner className="size-32"/>
            <div className="p-4">Configuring configurable configurations.</div>
        </div>
    )
}