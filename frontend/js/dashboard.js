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

function addUser(){
    let email = document.querySelector('.modal-add-user .div-email #inputEmail');
    let password = document.querySelector('.modal-add-user .div-password #inputPassword');
    let firstName = document.querySelector('.modal-add-user .div-first #first-name');
    let lastName = document.querySelector('.modal-add-user .div-last #last-name');
    let stage = document.querySelector('.modal-add-user .div-stage #stage');
    // console.log(email,password,firstName,lastName,stage)
    const token = localStorage.getItem('token');

    const BASE_URL =
    window.location.hostname === "localhost"
    ?'http://192.168.1.7:3000'
    :window.location.origin;

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

                const modalUser = document.querySelector('.modal-form');
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalUser);
                modalInstance.hide();
                form.reset();
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

function validateNewStudent(id,message){
    let validation = document.getElementById(`${id}-validate`);
    let inputValidate = document.querySelector(`.${id}`);

    
    inputValidate.classList.add('is-invalid');
    validation.innerHTML = message;
    
}

//---add students---//