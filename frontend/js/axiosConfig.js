let isSessionModalOpen = false;

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        if (error.response?.status === 401 && !isSessionModalOpen) {
            isSessionModalOpen = true;
            sessionExpiredModal("show");

        }
        return Promise.reject(error);
    }
);


const sessionExpiredModalEl = document.getElementById("sessionExpiredModal");

if(sessionExpiredModalEl){
sessionExpiredModalEl.addEventListener('hide.bs.modal',()=>{
    document.activeElement.blur();
});


}


function sessionExpiredModal(action){
    if(!sessionExpiredModalEl) return;

    const sessionExpiredModal = bootstrap.Modal.getOrCreateInstance(sessionExpiredModalEl);


    if(action === "show"){
        sessionExpiredModal.show();
    }else if(action === "hide"){
        sessionExpiredModal.hide();

    }


}

const loginAgainBtn = document.querySelector('.login-again');

if(loginAgainBtn){
    loginAgainBtn.addEventListener('click',()=>{
    sessionExpiredModal("hide");
    isSessionModalOpen = false;
    logout();

});

}


