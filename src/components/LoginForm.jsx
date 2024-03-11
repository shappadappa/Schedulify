import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { app } from "../firebase/client"
import ErrorDropdown from "./ErrorDropdown"

export default function LoginForm({ loggingIn }){
    const auth = getAuth(app)

    const [error, setError] = useState("")
    const [passwordRevealed, setPasswordRevealed] = useState(false)

    const createSessionCookie = async(email, password) =>{
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        const idToken = await userCredential.user.getIdToken()

        const res = await fetch("/api/auth/login", {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        })

        if(res.ok){
            window.location.reload(false)
            window.location = "/"
        } else{
            const json = await res.json()

            setError(json.error)
        }
    }

    const handleSubmit = async(e) =>{
        setError("")
        e.preventDefault()

        const formData = new FormData(e.target)

        const email = formData.get("email")
        const password = formData.get("password")

        if(loggingIn){
            if(!email){
                setError("Email required")
                return
            }
            if(!password){
                setError("Password required")
                return
            }

            try{
                await createSessionCookie(email, password)
            } catch(error){
                switch(error.code){
                    case "auth/invalid-credential":
                        setError("Incorrect email or password")
                        break
                    case "auth/too-many-requests":
                        setError("Too many attempts to login. Try again later")
                        break
                    default:
                        setError(error.code)
                }
            }
        } else{
            const res = await fetch(`/api/auth/signup`, {
                method: "POST",
                body: formData
            })

            if(res.ok){
                await createSessionCookie(email, password)
            } else{
                const json = await res.json()
    
                setError(json.error)
            }
        }
    }

    return(
        <>
            <ErrorDropdown error={error} setError={setError} />

            <form onSubmit={e => handleSubmit(e)} className="bg-white max-w-lg my-10 mx-auto border-2 border-pink-100 rounded text-slate-800 p-3 text-lg text-left">
                <p className="text-sm text-center mb-4">
                    {loggingIn ?
                        <>Don't have an account? Sign up <a className="text-pink-400 font-semibold" href="/signup">here</a></>
                    :
                        <>Already have an account? Login <a className="text-pink-400 font-semibold" href="/login">here</a></>
                    }
                </p>

                <div>
                    <label className="block font-semibold mb-1" htmlFor="email">Email</label>
                    <input className="px-1 py-0.5 bg-pink-50 border border-pink-100 rounded focus-visible:outline-none focus-visible:bg-pink-100 transition-colors" type="email" name="email" id="email" />
                </div>

                {!loggingIn &&
                    <div className="mt-5">
                        <label className="block font-semibold mb-1" htmlFor="username">Username</label>
                        <input className="px-1 py-0.5 bg-pink-50 border border-pink-100 rounded focus-visible:outline-none focus-visible:bg-pink-100 transition-colors" type="text" name="username" id="username" />
                    </div>
                }

                <div className="mt-5">
                    <label className="block font-semibold mb-1" htmlFor="Password">Password</label>
                    <input className="px-1 py-0.5 bg-pink-50 border border-pink-100 rounded w-fit focus-visible:outline-none focus-visible:bg-pink-100 transition-colors" type={passwordRevealed ? "text" : "password"} name="password" id="password" />
                    <button className="ml-2" type="button" onClick={() => setPasswordRevealed(!passwordRevealed)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                {passwordRevealed && <path d="M1.646 2.354L13.646 14.354L14.354 13.646L2.354 1.646L1.646 2.354Z"/>}
                            </svg>
                    </button>
                </div>

                <input className="mt-8 font-semibold bg-pink-100 px-2 py-1 rounded cursor-pointer shadow-md shadow-transparent hover:shadow-pink-400 transition-shadow" type="submit" value={loggingIn ? "Login" : "Signup"} />
            </form>
        </>
    )
}