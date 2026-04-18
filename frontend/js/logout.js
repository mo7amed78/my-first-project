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





function logout(){
    localStorage.clear();
    window.location.href = '/';
}