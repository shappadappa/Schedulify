import { useEffect, useState } from "react"

export default function ErrorDropdown({ error, setError }){
    const [errorMsg, setErrorMsg] = useState("")
    const [timerId, setTimerId] = useState()
    const [rising, setRising] = useState(false)

    useEffect(() =>{
        if(error){
            setErrorMsg(error)

            if(timerId){
                clearTimeout(timerId)
            }

            const timerIdCopy = setTimeout(() => {
                setRising(true)
                
                setTimeout(() => {
                    setErrorMsg("")
                    setTimerId()
                    setRising(false)
                }, 350)
            }, 3000)

            setTimerId(timerIdCopy)
        }

        setError("")
    }, [error])

    return(
        <>
            {errorMsg &&
                <div className={`text-lg fixed top-4 inset-x-0 mx-auto w-full max-w-sm rounded p-3 bg-red-800 border border-red-700 bg-opacity-95 z-[51] grid grid-cols-[10%_auto] place-items-center animate-drop-down${rising ? " animate-rise" : ""}`}>
                    <button className="absolute top-0 right-0 w-6 h-6 rounded-bl-lg bg-red-700 grid text-sm" onClick={() => {
                        setError("")
                        clearTimeout(timerId)
                        setTimerId()
                        setRising(true)
                
                        setTimeout(() => {
                            setErrorMsg("")
                            setRising(false)
                        }, 350)
                    }}>x</button>

                    <span className="text-4xl font-bold">!</span>
                    <span className="p-3 text-wrap break-words">{errorMsg}</span>
                </div>
            }
        </>
    )
}