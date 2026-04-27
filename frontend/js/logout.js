let logoutDashboard = document.getElementById("logout-dashboard");
const modalLogoutDashboardEl = document.getElementById("logoutDash");

if(logoutDashboard && modalLogoutDashboardEl){

const modalLogoutDashboard = bootstrap.Modal.getOrCreateInstance(modalLogoutDashboardEl);
logoutDashboard.addEventListener("click",()=>{
     modalLogoutDashboard.hide();
     logout();
});


// to solve problem aria-hidden
modalLogoutDashboardEl.addEventListener("hide.bs.modal",()=>{
document.activeElement.blur();
});

}


let logoutScanPage = document.querySelector(".logout-scan-page-btn"); 
const modalStudentProfileEl= document.getElementById('student-profile'); 
const modalLogoutScanEl = document.getElementById('profile-logout') ;

if(logoutScanPage &&  modalStudentProfileEl && modalLogoutScanEl){

const modalLogoutScan = bootstrap.Modal.getOrCreateInstance(modalLogoutScanEl); 

logoutScanPage.addEventListener('click',()=>{
    modalLogoutScan.hide();
    logout();
});

[modalStudentProfileEl,modalLogoutScanEl].forEach((modalEl)=>{
    modalEl.addEventListener('hide.bs.modal',()=>{
        document.activeElement.blur();
    });
});

}



// verify Token//
function getToken(){
    return localStorage.getItem("token");
}

function autoLogout(){
    const token = localStorage.getItem("token");

    if(!token){
        logout();
        return;
    }


    const decode = jwt_decode(token);
    const exp = decode.exp;
    const now = Math.floor(Date.now()/1000);


    if(exp <= now && !isSessionModalOpen){
    const sessionExpiredModalEl = document.getElementById("sessionExpiredModal");
    isSessionModalOpen = true;

    if(sessionExpiredModalEl){
        const sessionExpiredModal = bootstrap.Modal.getOrCreateInstance(sessionExpiredModalEl);
        sessionExpiredModal.show();

    }

        return;
    }

}
// verify Token//

// check auth //
function checkAuthAdmin(){
    const token = getToken();

    if(!token) {
        logout();
        return;
    }

    try {

        const decoded = jwt_decode(token);

        if(!decoded.isAdmin){
            window.location.replace('/scan-page');
            return;
        }

    } catch (error) {
        logout();
        return;
    }

  
}
// check auth //


function logout(){

    localStorage.removeItem('token');
    window.location.replace('/');

}