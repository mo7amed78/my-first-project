const loginContent1 = document.querySelector('.hello-msg-mobile');
const loginContent2 = document.querySelector('#login-form');
const dashboardNav = document.querySelector('.main-nav');
const dashboardFooter = document.querySelector('.footer-student');
const dashboardContent = document.querySelectorAll('section');
const scanNav = document.querySelector('.nav-scan');
const scanContainer = document.querySelector('.contain-scan');
const scanNote = document.querySelector('small');
const scanFooter = document.querySelector('.footer-scan')

window.addEventListener('load',()=>{
    const loading = document.querySelector('.loading-bcg');

    loading?.classList.add('hidden');

    //login content//
    if(loginContent1) loginContent1.classList.remove('hidden');
    if(loginContent2) loginContent2.classList.remove('hidden');
    //login content//

    // dashboard content//
    if(dashboardNav) dashboardNav.classList.remove('hidden');
    if(dashboardContent){
        dashboardContent.forEach((content)=>{
            content.classList.remove('hidden');
        });
    }
    if(dashboardFooter) dashboardFooter.classList.remove('hidden');
    // dashboard content//


    //scan content//
    if(scanNav) scanNav.classList.remove('hidden');
    if(scanContainer) scanContainer.classList.remove('hidden');
    if(scanNote) scanNote.classList.remove('hidden');
    if(scanFooter) scanFooter.classList.remove('hidden');
    //scan content//


});