
import { UserProvider } from '@auth0/nextjs-auth0/client'

export default function SecureLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <UserProvider>{children}</UserProvider>
}