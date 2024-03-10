import { Fragment, useEffect, useState } from "react"
import Modal from "./Modal"

export default function Schedule({ initialActivities }){
    const [activitiesList, setActivitiesList] = useState(initialActivities)
    const [activitiesMap, setActivitiesMap] = useState(new Map())
    const [editing, setEditing] = useState(false)
    const [view, setView] = useState("month")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [day, setDay] = useState(new Date().getDate())
    
    const [mondayIndexes, setMondayIndexes] = useState([...Array(new Date(year, month, 0).getUTCDate() + 1)].map((_, dayNo) => dayNo + 1).filter(dayNo => new Date(year, month - 1, dayNo).getDay() === 1 && dayNo !== 1))
    
    const [firstWeekIndent, setFirstWeekIndent] = useState(8 - mondayIndexes [0])

    const [week, setWeek] = useState(mondayIndexes.filter(mondayIndex => mondayIndex <= day).length)
    
    const colSpans = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6"] // due to tailwind not supporting template literals

    const getDayNo = (weekDayNo, weekNo) =>{
        return weekNo === 0 ? weekDayNo + 1 : weekDayNo + mondayIndexes [weekNo - 1]
    }

    const addNumberSuffix = day =>{
        if(day < 10 || day > 20){
            if(("" + day).charAt(("" + day).length - 1) == 1){
                return "st"
            } else if(("" + day).charAt(("" + day).length - 1) == 2){
                return "nd"
            } else if(("" + day).charAt(("" + day).length - 1) == 3){
                return "rd"
            } else{
                return "th"
            }
        } else{
            return "th"
        }
    }

    useEffect(() =>{
        setFromDate(`${year}-${("" + month).padStart(2, "0")}-${("" + day).padStart(2, "0")}T${new Date().getHours() - 1}:${new Date().getMinutes()}`)
        setToDate(`${year}-${("" + month).padStart(2, "0")}-${("" + day).padStart(2, "0")}T${new Date().getHours()}:${new Date().getMinutes()}`)
    
        const newActivitiesMap = new Map()

        activitiesList.forEach(activity =>{
            if((new Date(activity.fromDate).getFullYear() === year || new Date(activity.toDate).getFullYear() === year) && (new Date(activity.fromDate).getMonth() === month - 1 || new Date(activity.toDate).getMonth() === month - 1)){
                // formatting activities for the current month
                const startDate = new Date(activity.fromDate).getMonth() != month - 1 ? new Date(year, month - 1, 1) : new Date(activity.fromDate)
                const endDate = new Date(activity.toDate).getMonth() != month - 1 ? new Date(year, month, 0, 23, 59, 59) : new Date(activity.toDate)

                const startDay = startDate.toLocaleDateString("en-UK", {day: "2-digit"})
                const endDay = endDate.toLocaleDateString("en-UK", {day: "2-digit"})

                newActivitiesMap.set(`${startDay}/${endDay}`, [...newActivitiesMap.get(`${startDay}/${endDay}`) ?? [], {
                    activity: activity.activity,
                    startDay: new Date(activity.fromDate).toLocaleDateString("en-UK", {day: "2-digit"}),
                    startTime: startDate.toLocaleTimeString("en-UK", {hour: '2-digit', minute: '2-digit', hour12: false}),
                    endDay: new Date(activity.toDate).toLocaleDateString("en-UK", {day: "2-digit"}),
                    endTime: endDate.toLocaleTimeString("en-UK", {hour: '2-digit', minute: '2-digit', hour12: false}),
                    notes: activity.notes
                }])
            }
        })

        setActivitiesMap(newActivitiesMap)

        const newMondayIndexes = [...Array(new Date(year, month, 0).getUTCDate() + 1)].map((_, dayNo) => dayNo + 1).filter(dayNo => new Date(year, month - 1, dayNo).getDay() === 1 && dayNo !== 1)
        
        setMondayIndexes(newMondayIndexes)

        setFirstWeekIndent(8 - newMondayIndexes [0])

        if(week === newMondayIndexes.length + 1){
            setWeek(0)
        }

        if(day > new Date(year, month, 0).getUTCDate() + 1){
            setDay(new Date(year, month, 0).getUTCDate() + 1)
        }
    }, [month])

    useEffect(() =>{
        setWeek(mondayIndexes.filter(mondayIndex => mondayIndex <= day).length)
    }, [day])

    const getDayActivities = (day) =>{
        let dayActivites = []

        for(const key of activitiesMap.keys()){
            if((key.slice(0, 2) <= day && key.slice(3, 5) >= day)){
                dayActivites.push(activitiesMap.get(key))
            }
        }
        
        return dayActivites.flat()
    }

    const addActivity = async(e) =>{
        e.preventDefault()

        const formData = new FormData(e.target)
        
        const res = await fetch("/api/activity", {
            method: "POST",
            body: formData
        })

        if(res.ok){
            let activitiesMapCopy = activitiesMap

            const startDate = new Date(fromDate).getMonth() != month - 1 ? new Date(year, month - 1, 1) : new Date(fromDate)
            const endDate = new Date(toDate).getMonth() != month - 1 ? new Date(year, month, 0, 23, 59, 59) : new Date(toDate)

            const startDay = startDate.toLocaleDateString("en-UK", {day: "2-digit"})
            const endDay = endDate.toLocaleDateString("en-UK", {day: "2-digit"})

            activitiesMapCopy.set(`${startDay}/${endDay}`, [...activitiesMapCopy.get(`${startDay}/${endDay}`) ?? [], {
                activity: formData.get("activity"),
                startDay,
                startTime: startDate.toLocaleTimeString("en-UK", {hour: "2-digit", minute: "2-digit", hour12: false}),
                endDay,
                endTime: endDate.toLocaleTimeString("en-UK", {hour: "2-digit", minute: "2-digit", hour12: false}),
                notes: formData.get("notes")
            }])

            setActivitiesList([...activitiesList, {
                activity: formData.get("activity"),
                fromDate,
                toDate,
                notes: formData.get("notes"),
            }])

            setActivitiesMap(activitiesMapCopy)
            setEditing(false)
        } else{
            const json = await res.json()

            console.error(json.error)
        }
    }

    const handlePeriodChange = direction =>{
        if(view === "month"){
            if(month === 0 && direction === "left"){
                setMonth(11)
                setYear(year - 1)
            } else if(month === 11 && direction === "right"){
                setMonth(0)
                setYear(year + 1)
            } else{
                setMonth(direction === "left" ? month - 1 : month + 1)
            }
        } else if(view === "week"){
            if(week === 0 && direction === "left"){
                setWeek([...Array(new Date(year, month - 1, 0).getUTCDate() + 1)].map((_, dayNo) => dayNo + 1).filter(dayNo => new Date(year, month - 2, dayNo).getDay() === 1 && dayNo !== 1).length)
                setMonth(month - 1)
            } else if(week === mondayIndexes.length && direction === "right"){
                setWeek(0)
                setMonth(month + 1)
            } else{
                setWeek(direction === "left" ? week - 1 : week + 1)
            }
        } else{
            if(day === 1 && direction === "left"){
                setDay(new Date(year, month - 1, 0).getUTCDate() + 1)
                setWeek([...Array(new Date(year, month - 1, 0).getUTCDate() + 1)].map((_, dayNo) => dayNo + 1).filter(dayNo => new Date(year, month - 2, dayNo).getDay() === 1 && dayNo !== 1).length)
                setMonth(month - 1)
            } else if(day === new Date(year, month, 0).getUTCDate() + 1 && direction === "right"){
                setDay(1)
                setWeek(0)
                setMonth(month + 1)
            } else{
                setDay(direction === "left" ? day - 1 : day + 1)
            }
        }
    }

    return(
        <>
            <Modal open={editing} setOpen={setEditing}>
                <h4 className="mx-auto max-w-xs text-slate-800 text-2xl font-semibold pb-2 border-b border-pink-100">Add Activity</h4>

                <form onSubmit={e => addActivity(e)} className="text-slate-800 p-3 text-left">
                    <div className="mt-5">
                        <label className="block font-semibold mb-0.5" htmlFor="activity">Activity</label>
                        <input className="px-1 py-0.5 bg-slate-50 border border-slate-300 rounded focus-visible:outline-none focus-visible:bg-slate-100 transition-colors" type="text" name="activity" id="activity" />
                    </div>

                    <div className="mt-5">
                        <label className="block font-semibold mb-0.5" htmlFor="time">Time</label>

                        <label className="mr-3 text-sm" htmlFor="from">From</label>
                        <input value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-1 py-0.5 bg-slate-50 border border-slate-300 rounded focus-visible:outline-none focus-visible:bg-slate-100 transition-colors" type="datetime-local" name="from" id="from" />

                        <label className="ml-6 mr-3 text-sm" htmlFor="to">To</label>
                        <input value={toDate} onChange={e => setToDate(e.target.value)} className="px-1 py-0.5 bg-slate-50 border border-slate-300 rounded focus-visible:outline-none focus-visible:bg-slate-100 transition-colors" type="datetime-local" name="to" id="to" />
                    </div>

                    <div className="mt-5">
                        <label className="block font-semibold mb-0.5" htmlFor="notes">Notes</label>
                        <textarea className="px-1 py-0.5 bg-slate-50 resize-none border border-slate-300 rounded focus-visible:outline-none focus-visible:bg-slate-100 transition-colors" name="notes" id="notes" cols="30" rows="2"></textarea>
                    </div>

                    <input className="mt-8 font-semibold text-slate-100 bg-slate-500 px-3 py-1 rounded cursor-pointer shadow-md shadow-transparent hover:shadow-slate-400 transition-shadow" type="submit" value="Add" />
                </form>
            </Modal>

            <div className="relative max-w-4xl mx-auto my-8 rounded-lg p-6 grid-rows-8 bg-slate-100 text-slate-900 text-sm">
                <div className="grid grid-rows-2 text-left gap-2 mb-2">
                    <div className="flex gap-4 mb-1">
                        <button className="w-8 h-8 rounded-full bg-slate-400" onClick={() => handlePeriodChange("left")}>&lt;</button>

                        {view !== "day" &&
                            <h4 className="text-2xl text-left font-semibold">
                                {`${new Date(year, month - 1).toLocaleDateString("default", {month: "long"})} ${new Date(year, month).toLocaleDateString("default", {year: "numeric"})}${view === "week" ? " Week " + (week + 1) : ""}`}
                            </h4>
                        }

                        {view === "day" && 
                            <h4 className="text-2xl text-left font-semibold">
                                {`${day}${addNumberSuffix(day)} ${new Date(year, month - 1).toLocaleDateString("default", {month: "long"})} ${year}`}
                            </h4>
                        }

                        <button className="w-8 h-8 rounded-full bg-slate-400" onClick={() => handlePeriodChange("right")}>&gt;</button>
                    </div>

                    <div>
                        <label className={`cursor-pointer transition-colors px-1 py-0.5 rounded ${view === "month" ? "bg-slate-500 text-slate-100" : ""}`} htmlFor="month">Month</label>
                        <input onChange={e => setView(e.target.value)} value="month" className="hidden" type="radio" name="view" id="month" />

                        <label className={`cursor-pointer transition-colors px-1 py-0.5 rounded ml-2 ${view === "week" ? "bg-slate-500 text-slate-100" : ""}`} htmlFor="week">Week</label>
                        <input onChange={e => setView(e.target.value)} value="week" className="hidden" type="radio" name="view" id="week" />

                        <label className={`cursor-pointer transition-colors px-1 py-0.5 rounded ml-2 ${view === "day" ? "bg-slate-500 text-slate-100" : ""}`} htmlFor="day">Day</label>
                        <input onChange={e => setView(e.target.value)} value="day" className="hidden" type="radio" name="view" id="day" />
                    </div>
                </div>

                <button onClick={() => setEditing(!editing)} className="absolute top-4 right-4 rounded-full bg-slate-600 p-3 text-white flex justify-center items-center" title="Edit Schedule">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </button>

                {view !== "day" ? 
                    <div className="grid grid-cols-7 gap-1 font-semibold">
                        {[...Array(7)].map((_, weekDayNo) =>(
                            <div key={weekDayNo} className="p-2 bg-slate-300 rounded">
                                <span>{new Date(2024, 0, weekDayNo + 1).toLocaleString('en-UK', {weekday: 'long'})} </span>

                                {view === "week" && getDayNo(weekDayNo, week) <= new Date(year, month, 0).getUTCDate() + 1 &&
                                    <>
                                        {week === 0 ?
                                            <span>
                                                {mondayIndexes [0] - 8 + getDayNo(weekDayNo, 0) > 0 && 
                                                    <>
                                                        {mondayIndexes [0] - 8 + getDayNo(weekDayNo, 0)}{addNumberSuffix(mondayIndexes [0] - 8 + getDayNo(weekDayNo, 0))}
                                                    </>
                                                }
                                            </span>
                                        :
                                            <span>
                                                {getDayNo(weekDayNo, week) + addNumberSuffix(getDayNo(weekDayNo, week))}
                                            </span>
                                        }
                                    </>
                                }
                            </div>
                        ))}
                    </div>
                :
                    <div className="font-semibold p-2 bg-slate-300 rounded">
                        <span>{new Date(year, month - 1, day).toLocaleString('en-UK', {weekday: 'long'})} {day + addNumberSuffix(day)}</span>
                    </div>
                }

                {view === "month" && [...Array(6)].map((_, weekNo) =>(
                    <div className="grid grid-cols-7 gap-1 my-2" key={weekNo}>
                        {/* in case the first day of the month isn't a Monday, indent the first week */}
                        {weekNo === 0 && firstWeekIndent !== 0 && 
                            <div className={colSpans [firstWeekIndent - 1]}></div>
                        }

                        {/* days of the week */}
                        {[...Array(new Date(year, month, 0).getUTCDate() + 1)]
                        .slice(weekNo ? mondayIndexes [weekNo 
                            - 1] - 1 : 0, weekNo === mondayIndexes.length ? new Date(year, month, 0).getUTCDate() + 1 : mondayIndexes [weekNo] - 1)
                        .map((_, weekDayNo) =>(
                            <div className={`bg-slate-200 text-xs rounded grid grid-cols-3 grid-rows-3 ${new Date().getFullYear() === year && new Date().getMonth() === month - 1 && new Date().getDate() === getDayNo(weekDayNo, weekNo) ? "border-2 border-slate-600 shadow shadow-slate-600" : "border border-slate-300"}`} key={getDayNo(weekDayNo, weekNo)}>
                                <div className="col-span-3 row-span-2 row-start-2 px-2 text-left">
                                    {getDayActivities(getDayNo(weekDayNo, weekNo))?.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 2).map((activity, activityIndex) =>(
                                        <div className="border-l-2 border-l-slate-500 pl-2 my-0.5 flex justify-between items-center" key={activityIndex}>
                                            {activity.activity}
                                            {((activity.startDay != getDayNo(weekDayNo, weekNo) && activity.endDay != getDayNo(weekDayNo, weekNo)) || (activity.startTime == "00:00" && activity.endTime == "23:59")) ?
                                                <div title="All Day">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                                                    </svg>
                                                </div>
                                            :
                                                <div className="text-xxs grid grid-rows-2">
                                                    <span>{activity.startDay !== activity.endDay && getDayNo(weekDayNo, weekNo) == activity.endDay ? "00:00" : activity.startTime}</span>
                                                    <span>{activity.startDay !== activity.endDay && getDayNo(weekDayNo, weekNo) == activity.startDay ? "23:59" : activity.endTime}</span>
                                                </div>
                                            }
                                        </div>
                                    ))}

                                    {getDayActivities(getDayNo(weekDayNo, weekNo)).length > 2 && <div className="text-xxs font-semibold">and {getDayActivities(getDayNo(weekDayNo, weekNo)).length - 2} more</div>}
                                </div>
                                <div className="col-start-3 p-0.5">{getDayNo(weekDayNo, weekNo)}</div>
                            </div>
                        ))}
                    </div>
                ))}

                {view === "week" && 
                    <div className="grid grid-cols-7 gap-1 my-2">
                        {week === 0 && firstWeekIndent !== 0 && <div className={colSpans [firstWeekIndent - 1]}></div>}

                        {[...Array(week === 0 ? 7 - firstWeekIndent : 7)].map((_, weekDayNo) =>(
                            <div key={weekDayNo} className={`bg-slate-200 text-xs rounded p-1.5 min-h-72 text-left ${new Date().getFullYear() === year && new Date().getMonth() === month - 1 && new Date().getDate() === getDayNo(weekDayNo, week) ? "border-2 border-slate-600 shadow shadow-slate-600" : "border border-slate-300"}`}>
                                {getDayActivities(getDayNo(weekDayNo, week))?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((activity, activityIndex) =>(
                                    <div className="border-l-2 border-l-slate-500 pl-2 my-1 flex justify-between items-center" key={activityIndex}>
                                        {activity.activity}
                                        {((activity.startDay != getDayNo(weekDayNo, week) && activity.endDay != getDayNo(weekDayNo, week)) || (activity.startTime == "00:00" && activity.endTime == "23:59")) ?
                                            <div title="All Day">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                                                </svg>
                                            </div>
                                        :
                                            <div className="text-xxs grid grid-rows-2">
                                                <span>{activity.startDay !== activity.endDay && getDayNo(weekDayNo, week) == activity.endDay ? "00:00" : activity.startTime}</span>
                                                <span>{activity.startDay !== activity.endDay && getDayNo(weekDayNo, week) == activity.startDay ? "23:59" : activity.endTime}</span>
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                }

                {view === "day" &&
                    <div className="my-4 p-2 text-base">
                        {getDayActivities(day).length === 0 && <p>No activities</p>}

                        {getDayActivities(day)?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((activity, activityIndex) =>(
                            <Fragment key={activityIndex}>
                                <div className={`border-l-2 border-l-slate-500 pl-2 ${activity.notes ? "mb-1" : "mb-4"} flex justify-between items-center`} key={activityIndex}>
                                    {activity.activity}
                                    {((activity.startDay != day && activity.endDay != day) || (activity.startTime == "00:00" && activity.endTime == "23:59")) ?
                                        <div title="All Day">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                                            </svg>
                                        </div>
                                    :
                                        <div className="text-sm">
                                            <span>{activity.startDay !== activity.endDay && day == activity.endDay ? "00:00" : activity.startTime} - </span>
                                            <span>{activity.startDay !== activity.endDay && day == activity.startDay ? "23:59" : activity.endTime}</span>
                                        </div>
                                    }
                                </div>
                                {activity.notes && 
                                    <div className="text-sm text-left mt-1 ml-2 mb-4 bg-slate-200 rounded p-1.5">
                                        {activity.notes}
                                    </div>
                                }
                            </Fragment>
                        ))}
                    </div>
                }
            </div>
        </>
    )
}