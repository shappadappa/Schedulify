import type { APIRoute } from "astro";
import { getAuth } from "firebase-admin/auth";
import { app } from "../../../firebase/client"

export const POST: APIRoute = async ({ request, redirect }) => {
    const auth = getAuth(app)

    const formData = await request.formData()

    const email = formData.get("email")?.toString()
    const username = formData.get("username")?.toString()
    const password = formData.get("password")?.toString()

    if(!email){
        return new Response("Email required", {status: 400})
    }
    if(!username){
        return new Response("Username required", {status: 400})
    }
    if(!password){
        return new Response("password required", {status: 400})
    }



    try{
        await auth.createUser({email, displayName: username, password})
    } catch(error: any){
        return new Response("Something went wrong", {status: 400})
    }

    return redirect("/login")
};