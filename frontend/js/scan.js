
setInterval(()=>{autoLogout();},60000);

 BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://192.168.1.7:3000'
    :  window.location.origin;



let cameraOverlay = document.querySelector('#cameraOverlay');
let closeBtn = document.querySelector('#cameraOverlay #div-close-btn #closeOverlay');


//لتخزين الكاميرا نفسها هنا  ونقدر نشيلها بعد ما عمليه المسح تخلص
let html5QrCode;
let isScanning = false;


document.querySelectorAll('.scan-btn').forEach(btn=>{
btn.addEventListener('click',async ()=>{
    
    if(isScanning) return;
    isScanning = true;
    cameraOverlay.classList.add("active");


    if(html5QrCode){
        try {
            await html5QrCode.stop();
            html5QrCode.clear();

        } catch (e) {}

    }
    
   


       html5QrCode = new Html5Qrcode("reader");
       
       try {
        
           await html5QrCode.start(
                { facingMode: "environment" }, // back or front camera
                {
                    fps:20,
                    qrbox:250
                },

                //وهنجيب النص اللي قراه لو في نص نبعته للباك اند
                async (decodedText)=>{

                    if(!isScanning) return;
                    isScanning = false;
                    let textQRCOde = decodedText;

                    setTimeout( async ()=>{

                    scannerQrCode(textQRCOde)
                    // and stop camera after reading
                   await html5QrCode.stop();
                    await html5QrCode.clear();
                    cameraOverlay.classList.remove('active');


                    },2000);

                },

                (errorMessage)=>{
                    //عشان لو الطالب عمل مسح لاي حاجه من غير قصد هنطنش الغلط دا ف هنسيب الشرط فاضي
                }
            ); 
       } catch (error) {
            alert("يجب السماح للمتصفح باستخدام الكاميرا أولاً");
            cameraOverlay.classList.remove("active");
            isScanning = false;
       }
});

});


// stop camera //
closeBtn.addEventListener('click', async()=>{
    await html5QrCode.stop();
    await html5QrCode.clear();
    cameraOverlay.classList.remove('active');
    isScanning = false;

})
// stop camera //





function scannerQrCode(textQRCOde){
    const token = getToken();

    const decode = jwt_decode(token);

    let bodyParams ={
        userId:decode.id,
        lectureId:textQRCOde,
    };

axios.post(`${BASE_URL}/api/scan`,bodyParams,{
    headers:{
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
}).then((response)=>{
    let attended = response.status  
    if(attended === 201){
        let timeEdit = response.data.Attend.timeEdit.split(',')[1];

        let scannedAt = ` time ${timeEdit}`;

        let name = `${decode.firstName} ${decode.lastName}`;
        
        
        toast(scannedAt,name,attended);
    }else if(attended === 200){
        errMesg = response.data.message;

        if(errMesg.toLowerCase().includes("lectureid")){
            errMesg = "المحاضرة غير موجودة"
            toast('','',attended,errMesg);
            return;
        }

        toast('','',attended,errMesg);
    }
}).catch((error)=>{
    console.log(error);
})
};



// attendance test function //
function toast(scannedAt,name,attended,errMsg){
let toastEl = document.querySelector('.toast');
const toast_scan_student = document.getElementById("toast-scan-student");
const toastScanInstance = bootstrap.Toast.getOrCreateInstance(toast_scan_student);

    toast_scan_student.classList.remove('active')
    
    toastScanInstance.show();

    setTimeout(()=>{toast_scan_student.classList.add('active');},500)



    let time = document.querySelector('.toast .toast-header .text-body-secondary');
    let scanState  = document.querySelector('.toast .toast-body .row .scan-state');
    let userName = document.querySelector('.toast .toast-body .row .user-name');
    bg = `${attended === 201? "bg-success-subtle":"bg-danger-subtle"}`;
    toastEl.classList.remove("bg-success-subtle", "bg-danger-subtle");
    toastEl.classList.add(bg);
    time.innerHTML = `${scannedAt}`;
    scanState.innerHTML = `${attended === 201 ?`<i class="fa-solid fa-circle-check fs-6 text-success"></i> Scan Successfully!`:`<i class="fa-solid fa-circle-xmark fs-4 text-danger"></i> ${errMsg}`}`;
    userName.innerHTML = `${name}`;
    

};
// attendance test function //


// show student profile //
async function studentProfile(){
    const token = getToken();

    let student_profile = document.querySelector('.student-profile-body');
   
    try {
        const response = await axios.get(`${BASE_URL}/api/users/profile`,{
            headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        });
        let studentData = response.data.UserProfile;

        student_profile.innerHTML = `
       <span>اسم الطالب : ${studentData.firstName} ${studentData.lastName}</span> 
       <span>البريد الالكتروني : ${studentData.email}</span> 
       <span> الصف : ${studentData.stage}</span>
        `
    } catch (error) {
        console.log(error);
    }
}

studentProfile();
// show student profile //
