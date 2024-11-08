import { Metadata } from "next"

import { AppPage } from "@/components/app-page"



export const metadata: Metadata = { title: "About | RT+" }

export default function AboutPage() {
    return <AppPage label="About"></AppPage>
}