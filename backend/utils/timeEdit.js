const egyptTime = (date)=>{
    return date.toLocaleString("en-GB",{
        timeZone: "Africa/Cairo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true    
    });
};


const convertTimeDate_ToDate = (date)=>{
    const today = new Date(date.toLocaleString("en-US", {
        timeZone: "Africa/Cairo"
    }));

    const startDay = new Date(today);
    startDay.setHours(0,0,0,0);
    const endDay = new Date(startDay);
    endDay.setDate(startDay.getDate()+1);

    return {
        $gte:startDay,
        $lt:endDay
    };
}



module.exports = {
    egyptTime,
    convertTimeDate_ToDate
};