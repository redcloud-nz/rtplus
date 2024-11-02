import { LogInIcon } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/logo.svg"
          alt="RT+ logo"
          width={180}
          height={38}
          priority
        />
        <p>
            A collection of tools for managing response teams.
        </p>
        <ul className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Integrates with D4H.</li>
          <li className="mb-2">Works with multiple teams.</li>
          <li>Open Source</li>
        </ul>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
        <Button asChild>
            <a href="/api/auth/login">
            <LogInIcon/> Login
            </a>
        </Button>
        </div>
      </main>
    </div>
  );
}
