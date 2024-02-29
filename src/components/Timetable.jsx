export default function Timetable(){
    const year = new Date().getFullYear()
    const month = new Date().getMonth()

    const lastDayOfMonth = new Date(year, month + 1, 0).getUTCDate() + 1

    let mondayIndexes = []
    for(let i = 1; i <= new Date(year, month + 1, 0).getUTCDate() + 1; i++){
        if(new Date(year, month, i).getDay() === 1 && i !== 1){
            mondayIndexes.push(i)
        }
    }

    const firstWeekIndent = 8 - mondayIndexes [0]

    const colSpans = ["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6"] // due to tailwind not supporting template literals

    return(
        <div className="max-w-4xl mx-auto my-8 rounded-lg p-6 grid-rows-8 bg-slate-100 text-slate-900 text-sm">
            <div className="text-2xl text-left pb-6 font-semibold">{`${new Date().toLocaleDateString("default", {month: "long"})} ${new Date().toLocaleDateString("default", {year: "numeric"})}`}</div>

            <div className="grid grid-cols-7 gap-1 font-semibold">
                <div className="p-2 bg-slate-300 rounded">Monday</div>
                <div className="p-2 bg-slate-300 rounded">Tuesday</div>
                <div className="p-2 bg-slate-300 rounded">Wednesday</div>
                <div className="p-2 bg-slate-300 rounded">Thursday</div>
                <div className="p-2 bg-slate-300 rounded">Friday</div>
                <div className="p-2 bg-slate-300 rounded">Saturday</div>
                <div className="p-2 bg-slate-300 rounded">Sunday</div>
            </div>

            {[...Array(6)].map((_, weekNo) =>(
                <div className="grid grid-cols-7 gap-1 my-2" key={weekNo}>
                    {/* in case the first day of the month isn't a Monday, indent the first week */}
                    {weekNo === 0 && firstWeekIndent !== 0 && 
                        <div className={colSpans [firstWeekIndent - 1]}></div>
                    }

                    {/* days of the week */}
                    {[...Array(lastDayOfMonth)]
                    .slice(weekNo ? mondayIndexes [weekNo - 1] - 1 : 0, weekNo === mondayIndexes.length ? lastDayOfMonth : mondayIndexes [weekNo] - 1)
                    .map((_, dayNo) =>(
                        <div className={`bg-slate-200 rounded grid grid-cols-3 grid-rows-3 ${new Date().getUTCDate() === (weekNo === 0 ? dayNo + 1 : dayNo + mondayIndexes [weekNo - 1]) ? "border-2 border-slate-600 shadow shadow-slate-600" : "border border-slate-300"}`} key={dayNo}>
                            <div className="col-span-3 row-span-2 row-start-2"></div>
                            <div className="text-xs col-start-3 p-0.5">{weekNo === 0 ? dayNo + 1 : dayNo + mondayIndexes [weekNo - 1]}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}