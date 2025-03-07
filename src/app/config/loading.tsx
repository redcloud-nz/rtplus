/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system
 */

import { AppPage } from "@/components/app-page"
import { LoaderIcon } from "lucide-react"

export default function Loading() {

    return <AppPage label="Loading" variant="centered">
        <div>
            <LoaderIcon className="animate-spin size-20"/>
        </div>
    </AppPage>
}