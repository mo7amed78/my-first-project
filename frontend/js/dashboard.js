
    const token = localStorage.getItem('token');

    if(!token){
        console.log("invalid token");
    }

    const BASE_URL =
    window.location.hostname === "localhost"
    ?'http://192.168.1.7:3000'
    :window.location.origin;


//--- open sections--- //
let sectionBtn = document.querySelectorAll('.offcanvas-body ul li .nav-link');
let openSection = document.querySelectorAll('.section');
let closeNav = document.querySelector('.offcanvas-header .btn-close');
let navContent = document.querySelector('.offcanvas-body .navbar-nav')

let activeSection = localStorage.getItem('id');

if(activeSection){
document.getElementById(activeSection).classList.add('active');
document.querySelector(`[data-target="${activeSection}"]`).classList.add('active');
}else{
document.getElementById("dashboard").classList.add('active');
document.querySelector(`[data-target="dashboard"]`).classList.add('active');
}

navContent.addEventListener('click',(e)=>{
    
    if(e.target.classList.contains('nav-link')){
        e.preventDefault();

        sectionBtn.forEach(s=>s.classList.remove('active'));
        openSection.forEach(o=>o.classList.remove('active'));
        closeNav.click();
        

        e.target.classList.add('active');

        localStorage.setItem('id',e.target.dataset.target);

        document.getElementById(e.target.dataset.target).classList.add('active');

        
    }

});
//--- open sections--- //


//--- remove footer--- //
const footer = document.querySelector('.footer-student');
const mainContent = document.querySelector('#dashboard');
window.addEventListener('scroll', () => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollBottom >= docHeight) {
        footer.style.transform = 'translateY(100%)';
        footer.style.transition = 'transform 0.3s';
    } else {
        footer.style.transform = 'translateY(0)';
    }
});
//--- remove footer--- //


//---add students---//
let formAdd = document.querySelector('.modal-add-user');
let modalAddBtn = document.querySelector('.footer-student .modal-user-btn');

function addUser(){
    let email = document.querySelector('.modal-add-user .div-email #inputEmail');
    let password = document.querySelector('.modal-add-user .div-password #inputPassword');
    let firstName = document.querySelector('.modal-add-user .div-first #first-name');
    let lastName = document.querySelector('.modal-add-user .div-last #last-name');
    let stage = document.querySelector('.modal-add-user .div-stage #stage');

    let bodyParmas = {
        email:email.value,
        password:password.value,
        firstName:firstName.value,
        lastName:lastName.value,
        stage:stage.value
    };

    axios.post(`${BASE_URL}/api/auth/register`,bodyParmas,
        {
            headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`

            }
        }
        ).then((response)=>{
            let msg = response.data.message;
            let statusCode_state = response.status;
            let alertText = document.querySelector('.alert-success');

            if(statusCode_state === 201){

                
                // reset and vlidate success!
            document.querySelectorAll('.modal-add-user input').forEach(input=>{
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            });

            document.querySelector('.modal-add-user .div-stage .stage').classList.remove('is-invalid','is-valid');

            document.querySelectorAll('.modal-add-user .invalid-feedback').forEach(msg=>{
                msg.innerHTML = '';
            });



                const modalUser = document.querySelector('.modal-form');
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalUser);
                setTimeout(()=>{modalInstance.hide();},1000);
                alertText.innerHTML = msg;
                alertText.classList.remove('d-none');

                setTimeout(()=>{alertText.classList.add('d-none')},3000);
            }else if(statusCode_state === 200){
                let dublicateEmail = document.querySelector('.div-email #email-validate');
                let emailValid = document.querySelector('#inputEmail');
                emailValid.classList.add('is-invalid');
                dublicateEmail.innerHTML = msg;
            }
            
            
        }).catch((error)=>{
            //reset error 
            document.querySelectorAll('.modal-add-user input').forEach(input=>{
                input.classList.remove('is-invalid');
            });

            document.querySelectorAll('.modal-add-user .invalid-feedback').forEach(msg=>{
                msg.innerHTML = '';
            });

            document.querySelector('.modal-add-user .div-stage .stage').classList.remove('is-invalid');

            err_msg = error.response.data.message.toLowerCase();
            
            let inputs = ["email" ,"password" , "firstname", "lastname" , "stage"];

            inputs.forEach((inp)=>{

            if(err_msg.includes(inp)){
                 validateNewStudent(inp,err_msg);
            }

            });

        });
    

}


formAdd.addEventListener('submit',(e)=>{
    e.preventDefault();
    addUser();
});

modalAddBtn.addEventListener('click',()=>{
    //reset all inputs and error message here and reset form
    document.querySelectorAll('.modal-add-user input').forEach(input=>{
        input.classList.remove('is-invalid','is-valid');
    });

    document.querySelectorAll('modal-add-user .invalid-feedback').forEach(msg=>{
        msg.innerHTML = '';
    });

    document.querySelector('.modal-add-user .div-stage .stage').classList.remove('is-invalid','is-valid');
    formAdd.reset();
});



function validateNewStudent(id,message){
    let validation = document.getElementById(`${id}-validate`);
    let inputValidate = document.querySelector(`.${id}`);

    inputValidate.classList.add('is-invalid');
    validation.innerHTML = message;
    
}
//---add students---//




//--- all data about student in cards ---//
    let U_email = document.querySelector('.modal-update-user .div-email #inputEmail');
    let U_password = document.querySelector('.modal-update-user .div-password #inputPassword');
    let U_firstName = document.querySelector('.modal-update-user .div-first #first-name');
    let U_lastName = document.querySelector('.modal-update-user .div-last #last-name');
    let U_stage = document.querySelector('.modal-update-user .div-stage #stage');
    let currentPage = 1;
    function getAllStudent(currentPage){
        let num_Student = document.querySelector('.student-infrom p');
        let tableStudents = document.querySelector('.table-studens-data tbody');
        
        
        axios.get(`${BASE_URL}/api/users?page=${currentPage}`,{
            headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        }).then((response)=>{
            let count = response.data.count;
            let users = response.data.users;
            let page = response.data.page;
            let limit = response.data.limit;
            let totalPages = response.data.totalPages;

            localStorage.setItem('page',page);

            num_Student.innerHTML = count;

            let rows = "";
            let counter = (page - 1) * limit;
            for(let user of users){
                rows += `

                    <tr id="${user._id}">
                    <th scope="row">${counter+=1}</th>
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.stage}</td>

                    <td class="settings col-2">
                        <div class="update-user">

                        <button type="button" class="btn btn-success update-btn" data-id="${user._id}"  data-bs-target="#staticBackdropUpdate"><i class="fa-solid fa-pen-to-square" style="color: #ffffff; font-size:18px;"></i></button>        
                        
                        </div>

                        <div class="delete-user">
                        
                        <button type="button" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button> 
                        
                        </div>
                    </td>
                    
                    </tr>
                
                `
            }
            

            tableStudents.innerHTML = rows;

          
            // pagination
            renderPagination(page,totalPages)
           

            
        }).catch((error)=>{
            console.log(error);
        });
    }

    function presentAndAbsent(){
        let present_student = document.querySelector('.present-infrom p');
        let absence_student = document.querySelector('.absent-infrom p');

        let filterLectureId =localStorage.getItem('encodedText');

        if(!filterLectureId){
                 present_student.innerHTML = 0;
                 absence_student.innerHTML = 0;
                 return;
        }

        axios.get(`${BASE_URL}/api/filter?filterLectureId=${filterLectureId}`,{
            headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        }).then((response)=>{
                let countPresent = response.data.countPresent;
                let countAbsence = response.data.countAbsence;

                 present_student.innerHTML = countPresent;
                 absence_student.innerHTML = countAbsence;

        }).catch((error)=>{
            console.log(error);

        });
    }

    presentAndAbsent();
    getAllStudent(currentPage);

    let paginationContent = document.querySelector('.pag-nav .pagination');

    paginationContent.addEventListener('click',(e)=>{
        e.preventDefault();

        if(e.target.classList.contains('page-link')){
            
            currentPage = +e.target.dataset.page;
            if(!currentPage || currentPage<1){
                return;
            }else{

            getAllStudent(currentPage);
                
            }
           
        }
    });


//! update soon for Split pagination
function renderPagination(currentPage,totalPages){
    let pagination = document.querySelector('#students .pag-nav .pagination');
    pagination.innerHTML = "";

    pagination.innerHTML += `
    
    <li class="page-item ${currentPage === 1 ? "disabled" : "" }">

    <a class="page-link" href="#" ${currentPage === 1 ? "" : `data-page = "${currentPage - 1}" `}>Previous</a>
    
    </li>
    
    `

    for(let i=1; i<=totalPages; i++){

        pagination.innerHTML += `
        
        <li class="page-item ${currentPage === i ? "active" : ""}">

        <a class="page-link" href="#" data-page="${i}">${i}</a>

        </li>

        `
        }

        pagination.innerHTML += `
        
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">

        <a class="page-link" href="#" ${currentPage === totalPages ? "" : `data-page = "${currentPage + 1}"`}>Next</a>

        </li>
        
        `

    


}
//--- all data about student in cards ---//



//--- get student by id put data in update modal ---//
async function getStudentsId(id){
    try {
    const response = await axios.get(`${BASE_URL}/api/users/${id}`,{
    headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    });
    
    let data =  response.data.user;

    update(data.email,data.firstName,data.lastName,data.stage);
        
    } catch (error) {
        console.log("error",error);
    }
}
//--- get student by id put data in update modal ---//




//--- search in students table --- //
let searchText = document.querySelector('.sch-div form .sch');

async function searchStudents(search){

    let tableStudents = document.querySelector('.table-studens-data tbody');
    try {
    const response = await axios.get(`${BASE_URL}/api/search?search=${search}`,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        }
    });

        let searchs = response.data.result;

        
        let rows = "";
        
        
            
            if(searchs.length === 0 ){

            rows +=`
                <tr>
                <th scope="row"></th>
                <td>${response.data.message}</td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
            
            `

            tableStudents.innerHTML = rows;

            }else{


            counter = 0;
            for(search of searchs){

            rows +=`
                <tr>
                <th scope="row">${counter+=1}</th>
                <td>${search.firstName} ${search.lastName}</td>
                <td>${search.email}</td>
                <td>${search.stage}</td>

                <td class="settings col-2">
                    <div class="update-user">

                    <button type="button" class="btn btn-success update-btn" data-id="${search._id}"  data-bs-target="#staticBackdropUpdate"><i class="fa-solid fa-pen-to-square" style="color: #ffffff; font-size:18px;"></i></button>        
                    
                    </div>

                    <div class="delete-user">
                    
                    <button type="button" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button> 
                    
                    </div>
                </td>

                </tr>
            
            `
        }

                tableStudents.innerHTML = rows;

                
            }


    } catch (error) {
        console.log(error.response)
    }

}


let searchBtn = document.querySelector('.sch-div form  .sch-btn');
searchBtn.addEventListener('click',(e)=>{

    searchText.style.border = "0.1px #0000003c solid"
    
    e.preventDefault();
    
    if(!searchText.value){
        searchText.style.border = "0.1px #f3050598 solid"
        
        
    }else{

        searchStudents(searchText.value);

    }


});
//--- search in students table --- //


//--- update and delete student--- //

let settingsContent = document.querySelector('.table-studens-data tbody');
    settingsContent.addEventListener('click',(e)=>{
    //reset
    document.querySelectorAll('.modal-update-user input').forEach(input=>{
    input.classList.remove('is-invalid','is-valid');
    });

    document.querySelectorAll('modal-update-user .invalid-feedback').forEach(msg=>{
        msg.innerHTML = '';
    });

    document.querySelector('.modal-update-user .div-stage .stage').classList.remove('is-invalid','is-valid');

    let checkBtn = e.target.closest('.update-btn');

    if(!checkBtn) return;
    if(checkBtn.disabled) return;
    checkBtn.disabled = true;
    
    getStudentsId(checkBtn.dataset.id);
    localStorage.setItem('studentId',checkBtn.dataset.id);

    setTimeout(()=>{
        checkBtn.disabled = false;
    },500);
        
   
});

async function updateStudents(studentId){

    let bodyParmas = {
    email:U_email.value,
    password:U_password.value,
    firstName:U_firstName.value,
    lastName:U_lastName.value,
    stage:U_stage.value
    }

    try {

    const response = await axios.put(`${BASE_URL}/api/users/${studentId}`,bodyParmas,{
    headers:{
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    }
    });

        let msg = response.data.message;
        let alertText = document.querySelector('.alert-success');

            
            // reset and vlidate success!
        document.querySelectorAll('.modal-update-user input').forEach(input=>{
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        });

        document.querySelector('.modal-update-user .div-stage .stage').classList.remove('is-invalid','is-valid');

        document.querySelectorAll('.modal-update-user .invalid-feedback').forEach(msg=>{
            msg.innerHTML = '';
        });



            const modalUser = document.querySelector('.modal-form-update');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalUser);
            setTimeout(()=>{modalInstance.hide();},1000);
            alertText.innerHTML = msg;
            alertText.classList.remove('d-none');

            setTimeout(()=>{alertText.classList.add('d-none')},3000);

        
    }catch (error) {
        //reset error 
        document.querySelectorAll('.modal-update-user input').forEach(input=>{
            input.classList.remove('is-invalid');
        });

        document.querySelectorAll('.modal-update-update .invalid-feedback').forEach(msg=>{
            msg.innerHTML = '';
        });

        document.querySelector('.modal-update-user .div-stage .stage').classList.remove('is-invalid');

        err_msg = error.response.data.message.toLowerCase();
        
        let inputs = ["email" ,"password" , "firstname", "lastname" , "stage"];

        inputs.forEach((inp)=>{

        if(err_msg.includes(inp)){
                validateUpdStudent(inp,err_msg);
        }else if(err_msg.includes("الالكتروني")){
            let inp = "email";
            validateUpdStudent(inp,err_msg)
        }

        });

        
    }
    
    
}


function validateUpdStudent(id,message){
   
let validation = document.getElementById(`${id}-validate2`);
let inputValidate = document.querySelector(`.modal-update-user .${id}`);

inputValidate.classList.add('is-invalid');
validation.innerHTML = message;

}



let formUpdate = document.querySelector('.modal-update-user');

formUpdate.addEventListener("submit",async (e)=>{
    e.preventDefault();
    let studentId = localStorage.getItem('studentId')
try {
    await updateStudents(studentId);
    let page = localStorage.getItem('page') || 1;
    getAllStudent(page);
} catch(err) {
    console.log("حدث خطأ أثناء التحديث", err);
}    
});

function update(email,firstName,lastName,stage){
U_email.value = email;
U_firstName.value = firstName;
U_lastName.value = lastName;
U_stage.value = stage;
const modal  = new bootstrap.Modal(document.getElementById('staticBackdropUpdate'));
modal.show();
}




//--- update and delete student--- //


