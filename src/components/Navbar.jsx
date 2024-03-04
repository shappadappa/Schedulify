import { useState } from "react"

export default function Navbar({ user }){
    const [seen, setSeen] = useState(false)

    const handleLogout = async() =>{
        const res = await fetch("/api/auth/logout")

        if(res.redirected){
            window.location = "/login"
        }
    }

    return(
        <nav className={`fixed z-50 top-0 left-0 h-full p-8 ${seen && "bg-slate-900"}`}>
            <button className="mb-4 w-6 flex flex-col gap-2" onClick={() => setSeen(!seen)}>
                <div className="h-0.5 w-full bg-pink-100"></div>
                <div className="h-0.5 w-full bg-pink-100"></div>
                <div className="h-0.5 w-full bg-pink-100"></div>
            </button>

            {seen && 
            <>
                <h1 className="text-3xl font-semibold tracking-wider text-pink-50"><a href="/">schedulify.</a></h1>
        
                <ul className="mt-8">
                    {user ?
                        <>
                            <a href="/" className="block bg-slate-800 text-center rounded p-2 my-2"><li>Home</li></a>
                            <button className="block w-full bg-slate-800 text-center rounded p-2 my-2" onClick={handleLogout}><li>Logout</li></button>
                        </>
                    :
                        <>
                            <a href="/login" className="block bg-slate-800 text-center rounded p-2 my-2"><li>Login</li></a>
                            <a href="/signup" className="block bg-slate-800 text-center rounded p-2 my-2"><li>Signup</li></a>
                        </>
                    }
                </ul>
            </>}
        </nav>
    )
}