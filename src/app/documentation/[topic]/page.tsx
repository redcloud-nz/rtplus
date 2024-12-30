import { NotImplemented } from '@/components/errors'

export default async function DocumentationPage(props: { params: Promise<{ topic: string}> }) {
    const params = await props.params;
    return <NotImplemented label={`Documentation: ${params.topic}`}/>
}