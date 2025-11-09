/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /personal/settings
 */
import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'


export default function PersonalSettings_Page() {
    return <Lexington.Root >
        <Lexington.Header breadcrumbs={[
            Paths.personal,
            Paths.personal.settings
        ]}/>
        <Lexington.Page>
            <Lexington.Column>

            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}