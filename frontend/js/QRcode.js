    token = localStorage.getItem('token');

    if(!token){
        console.log("invalid token");
    }
   
    BASE_URL =
    window.location.hostname === "localhost"
    ?'http://192.168.1.7:3000'
    :window.location.origin;

let textQRCode = document.querySelector('.input-qr');
let generateBtn = document.querySelector('.generate-btn');
let qrCode = document.querySelector('.qrcode-img');


function showQRCode(){

    textQRCode.style.border = `1px solid #00000074`;


    if(!textQRCode.value.trim()){
        textQRCode.style.border = `1px solid red`;
        return;
    }

let encodedText = encodeURIComponent(textQRCode.value.trim());

localStorage.setItem('encodedText',encodedText);

let url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedText}`;

qrCode.setAttribute('src',url);

};

generateBtn.addEventListener('click',()=>{
    showQRCode()
});





//--- put data in table --//
let stageChoose = document.querySelector('.stage-choose');
    

function filterAbsence(){
    let table = document.querySelector('#dashboard .table tbody');
    let number = document.querySelector('.stage-div .count');
    let lectureName = document.querySelector('.stage-div .lecture-name');

    
    let filterLectureId = localStorage.getItem('encodedText');
    let filterStage =  localStorage.getItem('selectedValue');

    lectureName.innerHTML = `
        Attendance Records (${filterLectureId})
    `
     

    axios.get(`${BASE_URL}/api/filter/stageLecture?filterStage=${filterStage}&filterLectureId=${filterLectureId}`,{
    headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    }).then((response)=>{

    // remove table first 
    table.innerHTML = "";

    let students = response.data.filterScan;
    let numOfStudent = response.data.count;

    number.innerHTML = `number : ${numOfStudent}`;

     let counter = 0;

    for(let student of students){
       
        let firstName = student.userId.firstName;
        let lastName = student.userId.lastName;
        let stage = student.userId.stage;
        let timeHoursEdit = +student.scannedAt.slice(11,13);
        let timeMinutesEdit = student.scannedAt.slice(14,16);
        let flag;

        timeHoursEdit+=2;

        if(timeHoursEdit >= 24){
            timeHoursEdit -= 24;
                }

        if(timeHoursEdit <= 11){
                flag = "AM";
                if(timeHoursEdit === 0){
                    timeHoursEdit = 12; 
                    
                }

                  
            
        }else{
            flag = "PM";
            if(timeHoursEdit !== 12){
                timeHoursEdit = timeHoursEdit -12;
                
            }
            
         
        };

        let scannedAt = `${timeHoursEdit}:${timeMinutesEdit} ${flag}`;


        table.innerHTML += `
                <tr>
                <th scope="row">${counter+=1}</th>
                <td>${firstName} ${lastName}</td>
                <td>${scannedAt}</td>
                <td>${stage}</td>
                </tr>
        `
    }
}).catch((error)=>{

    notFoundMsg = error.response.data.message;

    
    table.innerHTML = `
    <tr>
    <th scope="row"></th>

    <td>${notFoundMsg}</td>
    <td></td>
    <td></td>
    </tr>
    
    `;
});

}

stageChoose.addEventListener('change',(e)=>{
    let selectedValue = e.target.value;
    localStorage.setItem('selectedValue',selectedValue);
    filterAbsence();

});



// if page Refresh
document.addEventListener('DOMContentLoaded',()=>{
    let saveChanges =  localStorage.getItem('selectedValue');

    if(saveChanges){
        stageChoose.value = saveChanges;
        filterAbsence();
    }
});


//--- put data in table --//


