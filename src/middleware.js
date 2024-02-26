import { app } from "./firebase/server"
import { getAuth } from "firebase-admin/auth"

export async function onRequest({ url, locals, cookies, redirect }, next){
    const auth = getAuth(app)

    const sessionCookie = cookies.get("session")

    // unprotected routes (login and signup pages and API routes for login + signup)
    if((url.pathname.includes("/login") || url.pathname.includes("/signup"))){
        if(sessionCookie){
            return redirect("/")
        }

        return next()
    }

    // protected routes
    if(!sessionCookie){
        return redirect("/login")
    }

    try{
        const decodedCookie = await auth.verifySessionCookie(sessionCookie.value)

        locals.user = {
            uid: decodedCookie.user_id, 
            username: decodedCookie.name
        }
    } catch(error){
        cookies.delete("session")
        return redirect("/login")
    }

    return next()
}