import NextAuth, { type DefaultSession } from "next-auth"
import authConfig from "./auth.config"


import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"
import { getUserById } from "./data/user"


declare module "next-auth" {

    interface Session {
        user: {
          role: "ADMIN" | "USER",
         
        } & DefaultSession["user"]
      }



}

export const { auth, handlers, signIn, signOut } = NextAuth({
    callbacks: {

        // async signIn({user}){

        //     console.log("This is the User",user);
            
        //     const existingUser = await getUserById(user.id as string)
            

        //     if(!existingUser || !existingUser.emailVerified){
        //         return false;
        //     }
        //     return true
        // },
        async session({ token, session }) {

            if (token.sub && session.user) {
                session.user.id = token.sub
            }


            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "USER"
            }

            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token

            const existingUser = await getUserById(token.sub);
            if (!existingUser) return token

            token.role = existingUser.role


            return token
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
})