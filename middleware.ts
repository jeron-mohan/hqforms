import authConfig from "./auth.config"
import NextAuth from "next-auth"

import {
    publicRoutes,
    isPublicRouteUpdated,
    authRoutes,
    apiAuthPrefix,
    DEFAULT_LOGIN_REDIRECT


} from "@/routes"

const { auth } = NextAuth(authConfig)


export default auth((req) => {

    const {nextUrl} = req

    const isLoggedIn = !!req.auth // get true for loged in false for not logged in

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix) // api routes
    const isPublicRoute = isPublicRouteUpdated(nextUrl.pathname) // public route
    const isAuthRoute = authRoutes.includes(nextUrl.pathname) // public route


    if(isApiAuthRoute){
        return null
    }

    if(isAuthRoute){

        if(isLoggedIn){
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT,nextUrl))
        }

        return null
    }

    if(!isLoggedIn && !isPublicRoute){

        return Response.redirect(new URL("/auth/login",nextUrl))

    }

    return null
  
})
 
// Optionally, don't invoke Middleware on some paths
// Change the routes here if you want
export const config = {
  matcher: [
     // Skip Next.js internals and all static files, unless found in search params
     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
     // Always run for API routes
     '/(api|trpc)(.*)',
  ],
}