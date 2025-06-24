/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { MarketingSection } from '../marketing-section'

export default function ContactPage() {
    return <main>
        <MarketingSection>
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p>If you have any questions or need assistance, please reach out to us at:</p>
            <ul className="list-disc pl-5 mt-2">
                <li>Email: <a href="mailto:support@rtplus.nz" className="text-blue-600 hover:underline">support@rtplus.nz</a></li>
            </ul>
            
        </MarketingSection>
    </main>
}