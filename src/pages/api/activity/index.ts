import type { APIRoute } from "astro";
import { db } from "../../../firebase/server";
import { getAuth } from "firebase-admin/auth";

export const POST: APIRoute = async({ request, cookies, redirect }) =>{
    const auth = getAuth()

    const sessionCookie = cookies.get("session").value

    let uid: string

    try{
        uid = (await auth.verifySessionCookie(sessionCookie)).uid
    } catch(error){
        return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 401})
    }
    
    const formData = await request.formData()

    const activity = formData.get("activity")?.toString()
    const fromDate = formData.get("from")?.toString()
    const toDate = formData.get("to")?.toString()
    const notes = formData.get("notes")?.toString()

    if(!activity){
        return new Response(JSON.stringify({error: "Activity required"}), {status: 400})
    }
    if(!fromDate){
        return new Response(JSON.stringify({error: "From date required"}), {status: 400})
    }
    if(!toDate){
        return new Response(JSON.stringify({error: "To date required"}), {status: 400})
    }
    if(toDate < fromDate){
        return new Response(JSON.stringify({error: "To date cannot be before from date"}), {status: 400})
    }
    

    try{
        const activitiesRef = db.collection("activity")

        await activitiesRef.add({
            activity,
            fromDate,
            toDate,
            notes,
            uid
        })
    } catch(error){
        return new Response(JSON.stringify({error: "Something went wrong"}), {status: 500})
    }

    return redirect("/")
}