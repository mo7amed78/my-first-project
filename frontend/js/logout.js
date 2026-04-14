let logoutDashboard = document.getElementById("logout-dashboard");
const modalLogoutDashboardEl = document.getElementById("logoutDash");
const modalLogoutDashboard = bootstrap.Modal.getOrCreateInstance(modalLogoutDashboardEl)
logoutDashboard.addEventListener("click", async ()=>{
     modalLogoutDashboard.hide();
     logout();
});




// to solve problem aria-hidden
modalLogoutDashboardEl.addEventListener("hide.bs.modal",()=>{
document.activeElement.blur();
});


function logout(){
    localStorage.clear();
    window.location.href = '/';
}