
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/account(.*)', '/api(.*)', '/unified(.*)'])
const isAdminRoute = createRouteMatcher('/manage(.*)')

export default clerkMiddleware(async (auth, req) => {
    
    if(isProtectedRoute(req)) await auth.protect()
    else if(isAdminRoute(req)) await auth.protect({ role: 'org:admin' })
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ]
}