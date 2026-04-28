   
 const BASE_URL = getBaseURL();



let textQRCode = document.querySelector('.input-qr');
let generateBtn = document.querySelector('.generate-btn');
let qrCode = document.querySelector('.qrcode-img');
let stageNameQrPage = document.querySelector('#qr .info-div .stage-name-div ');


let savedId = localStorage.getItem('lectureId');
let savedSelected = localStorage.getItem('selectedValue');
let savedLecture = localStorage.getItem('lectureName');
let savedStageInQR = localStorage.getItem('stage_QR_page');


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

if(savedStageInQR){
    stageNameQrPage.classList.remove('d-none');
    stageNameQrPage.innerHTML = savedStageInQR;
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
    const token = getToken();

    let table = document.querySelector('#dashboard .table tbody');
    let number = document.querySelector('.stage-div .count');

    let show_num_QR_page = document.querySelector('#qr .info-div .number-div');
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

    if(filterStage === null || filterStage === undefined){
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
      
        let  notFoundMsg = response.data.message || 'لا يوجد نتائج حالياً';
        
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
       
        if(!student.userId){
            continue;
        }

        let firstName = student.userId?.firstName || "هذا المستخدم تم حذفه";
        let lastName = student.userId?.lastName || "";
        let stage = student.userId?.stage || "";
        let timeEdit = student.timeEdit.split(',')?.[1] || "";


        let scannedAt = `${timeEdit}`;

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

const token = getToken();

let lectureName = document.querySelector('.body-lecture div .lecture-name');
let lectureStage = document.querySelector('.body-lecture div .stage-lecture');
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

        let NewlectureName = response.data.result.lectureName;
        let lectureId = response.data.result._id;

        let today = new Date(response.data.result.createdAt);
  
        let date = today.toLocaleDateString("en-CA", {
            timeZone: "Africa/Cairo"
        });
       

        let stage_QR_page = response.data.result.stage;

        //change the value of stage in localStorage
        localStorage.setItem("selectedValue",stage_QR_page);


        localStorage.setItem('stage_QR_page',stage_QR_page);
        localStorage.setItem('lectureName',NewlectureName);
        localStorage.setItem("dateLecture",date);

        lectureTitle.innerHTML =`Attendance Records(${NewlectureName})`;
        stageNameQrPage.classList.remove('d-none');
        stageNameQrPage.innerHTML = stage_QR_page;

        localStorage.setItem("lectureId",lectureId);

        showQRCode(lectureId);   

        const addNewLectureModal = bootstrap.Modal.getOrCreateInstance("#exampleModalStart");
        addNewLectureModal.hide();

        // open qr
        let idsection = ["dashboard","students","attend"];
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

        let msg = error.response?.data?.message?.toLowerCase() || "Something went wrong";

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

const modalAddNewLectureEl = document.getElementById('exampleModalStart');
modalAddNewLectureEl.addEventListener('hide.bs.modal',()=>{
    document.activeElement.blur();
});
//---generate new lecture---//


//---get all lectures and export as excel---//
async function getAllAttendance(){
    const token = getToken();

    let attendanceInfo = document.getElementById('attendance-info');
    try {
      const response = await axios.get(`${BASE_URL}/api/lecture`,{
        headers:{
            "Content-Type":'application/json',
            "Authorization":`Bearer ${token}`
        }
      });

        let Lectures = response.data.get_lecs;
        let rows = "";

        if(!Lectures){
            return;
        }
    
        for(let lecture of Lectures){
            rows+=`
                <div class="col">
                <div class="card text">
                <div class="card-body">

                <h5 class="card-title d-flex  align-items-center text-body-secondary">
                <i class="fa-regular fa-calendar" style="font-size:35px;"></i> 
                <span style="font-size:18px;">${lecture.timeEdit.split(', ')[0].replaceAll("/","-")}</span>
                </h5>

                <hr>
                <p class="card-text">
                    <h5>${lecture.lectureName}</h5>
                    <h6 class="text-body-secondary">${lecture.stage}</h6>
                </p>
                <button data-lecture="${lecture._id}" class=" show-btn btn btn-success text-light fw-bold mw-100" type="button"  aria-expanded="false" aria-controls="collapseExample" style="width:200%">Show Data</button>
                </div>
                </div>
                </div>
            
            `
        }

        attendanceInfo.innerHTML = rows;
      

    } catch (error) {
        console.log(error);
    }
}


async function getAttendanceById(lectureId){
    const token = getToken();


    let tableData = document.getElementById("table-attend-excel");
    let attendHeadInfo = document.querySelector("#attend .attend-head .attend-info");
    let excelBtn = document.querySelector('#attend .attend-head .excel-div .excel-btn');

    tableData.innerHTML = "";


    try {
        const response = await axios.get(`${BASE_URL}/api/filter/stageLecture?filterLectureId=${lectureId}`,{
            headers:{
                "Content-Type":'application/json',
                "Authorization":`Bearer ${token}`
            }
        });

        let records = response.data.filterScan;
        let infoLecture = response.data.infoLecture;

        if(infoLecture){

            let lecAttendName = infoLecture.lectureName;
            let stageAttend = infoLecture.stage;
            let dateAttend = infoLecture.timeEdit.split(', ')[0].replaceAll("/","-");

            attendHeadInfo.innerHTML = `
            <h5>${lecAttendName} - ${stageAttend}</h5>
            <span>${dateAttend}</span>

        `
        }

        let rows = "";

        if(records.length === 0){
            let msg = response.data.message;
            excelBtn.disabled = true;
            
            tableData.innerHTML = `
            <tr>
            <th scope="row">${msg}</th>
            <td></td>
            <td></td>
            <td></td>
            </tr>


            `
            return;
        }
       
        excelBtn.disabled = false;


        let counter = 0;
        for(let record of records){
            
            let first_name_attend = record.userId.firstName;
            let last_name_attend = record.userId.lastName;
            let email_attend = record.userId.email;
            let timeEdit = record.timeEdit.split(',')[1];
        

            let scannedAt = `${timeEdit}`;


            rows+=`

            <tr>
            <th scope="row">${counter+=1}</th>
            <td>${first_name_attend} ${last_name_attend}</td>
            <td>${scannedAt}</td>
            <td>${email_attend}</td>
            </tr>

            
            `

        }
        
        tableData.innerHTML = rows;

        
    } catch (error) {
        console.log(error);
    }
}


let attendContainer = document.getElementById('attendance-info');
const collapseAttend = document.getElementById('collapseAttend');
const collapseAttendInstance = bootstrap.Collapse.getOrCreateInstance(collapseAttend,{toggle:false});

attendContainer.addEventListener('click',(e)=>{

    let showBtn = e.target.closest(".show-btn");

    if(showBtn){
        localStorage.setItem("exporExcelId",showBtn.dataset.lecture);
        collapseAttendInstance.show();
        getAttendanceById(showBtn.dataset.lecture);
    }
});

getAllAttendance();

let excelBtn = document.querySelector('#attend .container .collapse .excel-div .excel-btn');

async function exportToExcel(lectureExcelId){
    const token = getToken();

    try {
        const response = await axios.get(`${BASE_URL}/api/export/excel/${lectureExcelId}`,{
             responseType: 'blob',
            
            headers:{
            "Authorization":`Bearer ${token}`

            }
        });

        let file_name = response.headers['content-disposition'];
        let fileName = "attendance.xlsx";

        if(file_name && file_name.toLowerCase().includes('filename=')){
            fileName = file_name.split('; filename=')[1].replace(/"/g,'').trim();
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

    } catch (error) {

        console.log(error);

    } finally {

        excelBtn.disabled = false;
        excelBtn.innerHTML = `
            <i class="fa-solid fa-file-excel"></i> Export to Excel
        `

    }
}



excelBtn.addEventListener("click",()=>{
    let ExcelId = localStorage.getItem("exporExcelId");

    excelBtn.disabled = true;
    excelBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Loading...</span>
      `

    if(!ExcelId){

    excelBtn.disabled = false;
    excelBtn.innerHTML = `
        <i class="fa-solid fa-file-excel"></i> Export to Excel
        `
        return;
    }

    
        exportToExcel(ExcelId);
    

});

//---get all lectures and export as excel---//
