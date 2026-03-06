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

let savedId = localStorage.getItem('lectureId');
let savedSelected = localStorage.getItem('selectedValue');
let savedLecture = localStorage.getItem('lectureName');

if(savedId){
    textQRCode.value = savedId;
}else{
    qrCode.setAttribute('src','');
    textQRCode.value = "";

}

if(savedSelected){
document.getElementById('stage-dashboard').value = savedSelected;
 filterAbsence();
}

if(savedLecture){
    document.getElementById('lecture-name').innerHTML = `Attendance Records(${savedLecture})`;
}

function showQRCode(lectureId){

    textQRCode.value=lectureId

    textQRCode.style.border = `1px solid #00000074`;


    if(!textQRCode.value.trim()){
        textQRCode.style.border = `1px solid red`;
        return;
    }


let url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${lectureId}`;

qrCode.setAttribute('src',url);

};


const animToast = document.querySelector('.toast-container .no-lec-toast');
const toastNoLec = bootstrap.Toast.getOrCreateInstance( document.getElementById('liveNoLec'));
generateBtn.addEventListener('click',()=>{
    let idForBtn = localStorage.getItem('lectureId');
    if(!idForBtn){
        //reset
        animToast.classList.remove('active')
       
        toastNoLec.show();

        setTimeout(()=>{animToast.classList.add('active');},500)
        
       

        return;
    }
    showQRCode(idForBtn);
});





//--- put data in table --//
let stageChoose = document.querySelector('.stage-choose');
    

async function filterAbsence(){
    let table = document.querySelector('#dashboard .table tbody');
    let number = document.querySelector('.stage-div .count');

    let show_num_QR_page = document.querySelector('#qr .number-div');
    //loading
    table.innerHTML =`
            <tr>
            <th scope="row"></th>

            <td>Loading...</td>
            <td></td>
            <td></td>
            </tr>
    
    `; 
    
    let filterLectureId = localStorage.getItem('lectureId');
    let filterStage =  localStorage.getItem('selectedValue');

    if(!filterLectureId){
       table.innerHTML =`
            <tr>
            <th scope="row"></th>

            <td>لا يوجد بيانات حالياً</td>
            <td></td>
            <td></td>
            </tr>
    
    `;  
       return;
    }

    if(!filterStage){
        return;
    }

    try {
    const response = await axios.get(`${BASE_URL}/api/filter/stageLecture?filterStage=${filterStage}&filterLectureId=${filterLectureId}`,{
    headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    });
    // remove table first 
    table.innerHTML = "";
   


    let students = response.data.filterScan;
    let numOfStudent = response.data.count;
     let rows = "";

    number.innerHTML = `number : ${numOfStudent}`;
    show_num_QR_page.innerHTML = `number : ${numOfStudent}`;
           
        if(students.length === 0 ){
      
        let  notFoundMsg = response.data.message;
        
            table.innerHTML = `
            <tr>
            <th scope="row"></th>

            <td>${notFoundMsg}</td>
            <td></td>
            <td></td>
            </tr>
            
            `;

            return;
        }

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

        rows +=`
                <tr>
                <th scope="row">${counter+=1}</th>
                <td>${firstName} ${lastName}</td>
                <td>${scannedAt}</td>
                <td>${stage}</td>
                </tr>
        `
        
    }

            table.innerHTML =  rows;


    } catch (error) {
        console.log(error);
 
    }

}




stageChoose.addEventListener('change',(e)=>{
    let selectedValue = e.target.value;
    localStorage.setItem('selectedValue',selectedValue);
    filterAbsence();

});

//--- put data in table --//



//---generate new lecture---//
async function newLecture(){

let lectureName = document.querySelector('.body-lecture div .lecture-name');
let lectureStage = document.querySelector('.body-lecture div .stage-lecture')
let lectureTitle = document.querySelector('.stage-div .lecture-name');

let err_stage = document.getElementById('lecStage');
let err_lecName = document.getElementById('lecName');

        //reset
        lectureName.classList.remove('is-invalid');
        err_lecName.innerHTML = "";
        err_stage.classList.remove('is-invalid');


    let bodyParams = {
        lectureName:lectureName.value,
        stage:lectureStage.value
    };

    try {
        const response = await axios.post(`${BASE_URL}/api/lecture`,bodyParams,{
            headers:{
                "Content-Type":'application/json',
                "Authorization":`Bearer ${token}`
            }
        });

        console.log(response);
        let NewlectureName = response.data.result.lectureName;
        let lectureId = response.data.result._id;

        //!soon
        let stage_QR_page = response.data.result.stage;

        localStorage.setItem('lectureName',NewlectureName);
        lectureTitle.innerHTML =`Attendance Records(${NewlectureName})`;

        localStorage.setItem("lectureId",lectureId);

        showQRCode(lectureId);   

        const addNewLectureModal = bootstrap.Modal.getOrCreateInstance("#exampleModalStart");
        addNewLectureModal.hide();

        // open qr
        let idsection = ["dashboard","students","attend","reports"];
        let idTargetBtn = document.querySelectorAll('[data-target]');

        idTargetBtn.forEach(idTarget=>{
            idTarget.classList.remove('active');
        });

        idsection.forEach(id=>{
            document.getElementById(id).classList.remove('active');
        });
        
        document.getElementById('qr').classList.add('active');
        document.querySelector('[data-target="qr"]').classList.add('active');
        //after 1sec
        setTimeout(()=>{
            generateBtn.click();
        },1000);



    } catch (error) {

        let msg = error.response.data.message.toLowerCase() || "Something went wrong";

        if(msg.includes('lecturename') || msg.includes("المحاضرة")){
            lectureName.classList.add('is-invalid');
            err_lecName.innerHTML = msg;
        }else{
            err_stage.classList.add('is-invalid');
        }




    }
}



let formNewLecture = document.querySelector('.form-new-lecture');
formNewLecture.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await newLecture();
});
//---generate new lecture---//
