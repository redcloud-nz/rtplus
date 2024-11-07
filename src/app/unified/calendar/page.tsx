import { AppPage } from '@/components/app-page'


export default async function CalendarPage() {
    return <AppPage label="Calendar" breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
    </AppPage>
}