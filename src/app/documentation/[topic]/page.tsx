import { NotImplemented } from '@/components/errors'

export default async function DocumentationPage({ params}: { params: { topic: string} }) {
    return <NotImplemented label={`Documentation: ${params.topic}`}/>
}