const token =localStorage.getItem('token');

if(token){

    try {
        
    const decode = jwt_decode(token);

    if(decode.isAdmin){
        window.location.replace('/dashboard-page')

    }else{
        window.location.replace('/scan-page')

    }
    } catch (error) {
        localStorage.removeItem('token');
    }

}


let email = document.querySelector('form div #exampleInputEmail1');
let password = document.querySelector('form div #exampleInputPassword1');
let form = document.querySelector('form');

//? login post
function Login(){




let bodyParams = {
    email: email.value,
    password: password.value
};

axios.post(`${BASE_URL}/api/auth/login`,bodyParams)
.then((response)=>{

    email.setAttribute('class','form-control is-valid');
    password.setAttribute('class',"form-control is-valid");    

    let token =  response.data.token;
    localStorage.setItem('token',token);


    const decode = jwt_decode(token);
    if(decode.isAdmin){
        window.location.replace('/dashboard-page');
    }else{
        window.location.replace('/scan-page');
    }

            
     
}).catch((error)=>{
    // reset error
    email.className = 'form-control';
    password.className = 'form-control';
    document.querySelector('form div .email').innerHTML = '';
    document.querySelector('form div .password').innerHTML = '';


    let message = error.response?.data?.message || 'Something went wrong';
    let E_Msg = message.toLowerCase();    
   
    if(E_Msg.includes("email")){
    email.setAttribute('class',"form-control is-invalid");
    document.querySelector('form div .email').innerHTML = message;
   }else if(E_Msg.includes("password")){
    password.setAttribute('class',"form-control is-invalid");  
    document.querySelector('form div .password').innerHTML = message;
   }else{
    email.setAttribute('class',"form-control is-invalid");
    password.setAttribute('class',"form-control is-invalid");  
    document.querySelector('form div .email').innerHTML = message;
    document.querySelector('form div .password').innerHTML = message;
   }
});

};

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    Login();
});
