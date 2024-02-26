export default function Navbar({ user }){
    const handleLogout = async() =>{
        const res = await fetch("/api/auth/logout")

        if(res.redirected){
            window.location = "/login"
        }
    }

    return(
        <nav className="fixed top-0 left-0 bg-slate-900 h-full p-8">
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
        </nav>
    )
}