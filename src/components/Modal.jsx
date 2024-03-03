export default function Modal({ open, setOpen, children }){
    return(
        <>
            {open &&
                <div className="text-base fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 grid place-items-center">
                    <div className="relative py-6 px-4 w-full max-w-2xl bg-slate-100 text-black rounded-lg shadow-md shadow-slate-600">
                        <button onClick={() => setOpen(false)} className="absolute top-0 right-0 bg-slate-600 text-slate-100 rounded-bl-xl w-8 h-8 grid place-items-center text-sm">x</button>

                        {children}
                    </div>
                </div>
            }
        </>
    )
}