
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

sectionBtn.forEach((section)=>{
    section.addEventListener('click',(e)=>{
        e.preventDefault();

        sectionBtn.forEach(s=>s.classList.remove('active'));
        openSection.forEach(o=> o.classList.remove('active'));
        closeNav.click();

        section.classList.add('active');
        document.getElementById(section.dataset.target).classList.add('active');
        
    });
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
let form = document.querySelector('.modal-add-user');
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

            err_msg = error.response.data.message.toLowerCase();
            
            let inputs = ["email" ,"password" , "firstname", "lastname" , "stage"];

            inputs.forEach((inp)=>{

            if(err_msg.includes(inp)){
                 validateNewStudent(inp,err_msg);
            }

            });

        });
    

}


form.addEventListener('submit',(e)=>{
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
    form.reset();
});



function validateNewStudent(id,message){
    let validation = document.getElementById(`${id}-validate`);
    let inputValidate = document.querySelector(`.${id}`);

    inputValidate.classList.add('is-invalid');
    validation.innerHTML = message;
    
}
//---add students---//



//!update soon for pagination
//--- all data about student in cards ---//
    function getAllStudent(){
        let num_Student = document.querySelector('.student-infrom p');

        axios.get(`${BASE_URL}/api/users`,{
            headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        }).then((response)=>{

            let count = response.data.count;
            num_Student.innerHTML = count;
            
        }).catch((error)=>{
            console.log(error);
        });
    }

    getAllStudent();
//--- all data about student in cards ---//



