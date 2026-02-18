
// guard
//guard

let cameraOverlay = document.querySelector('#cameraOverlay');
let closeBtn = document.querySelector('#cameraOverlay #div-close-btn #closeOverlay');


//لتخزين الكاميرا نفسها هنا  ونقدر نشيلها بعد ما عمليه المسح تخلص
let html5QrCode;
let isScanning = false;


document.querySelectorAll('.scan-btn').forEach(btn=>{
btn.addEventListener('click',async ()=>{
    
  if(isScanning) return;
  isScanning = true;

    if(html5QrCode){
        try {
            await html5QrCode.stop();
             html5QrCode.clear();

        } catch (e) {}


    }
        cameraOverlay.classList.add("active");

       html5QrCode = new Html5Qrcode("reader");

           await html5QrCode.start(
                { facingMode: "environment" }, // back or front camera
                {
                    fps:20,
                    qrbox:250
                },

                //وهنجيب النص اللي قراه لو في نص نبعته للباك اند
                async (decodedText)=>{
                    console.log("qrText",decodedText);
                    let textQRCOde = decodedText;
                    scannerQrCode(textQRCOde)
                    // and stop camera after reading
                   await html5QrCode.stop();
                    await html5QrCode.clear();
                    cameraOverlay.classList.remove('active');
                    isScanning = false;


                },

                (errorMessage)=>{
                    //عشان لو الطالب عمل مسح لاي حاجه من غير قصد هنطنش الغلط دا ف عنسيب الشرط فاضي
                }
            );
});

})


// stop camera //
closeBtn.addEventListener('click', async()=>{
    await html5QrCode.stop();
    await html5QrCode.clear();
    cameraOverlay.classList.remove('active');
    isScanning = false;

})
// stop camera //





function scannerQrCode(textQRCOde){

const token = localStorage.getItem('token');

    if(!token){
        console.log('Token not found!');
        return;
    }

    const decode = jwt_decode(token);
    const Base_URL =
  window.location.hostname === 'localhost'
    ? 'http://192.168.1.7:3000'
    :  window.location.origin;


    let bodyParams ={
        userId:decode.id,
        qrCode:textQRCOde,
        lectureId:textQRCOde,
    };

axios.post(`${Base_URL}/api/scan`,bodyParams,{
    headers:{
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
}).then((response)=>{
    let attended = response.status  
    if(attended === 201){
        let timeHoursEdit = +response.data.Attend.scannedAt.slice(11,13);
        let timeMinutesEdit = response.data.Attend.scannedAt.slice(14,16);
        let flag;
        
        timeHoursEdit+=2;

        if(timeHoursEdit >= 24){
            timeHoursEdit -= 24;
                }

        if(timeHoursEdit <= 11){
                flag = "AM";
                if(timeHoursEdit === 0){
                    timeHoursEdit = 12; 
                    
                }

                  
            
        }else{
            flag = "PM";
            if(timeHoursEdit !== 12){
                timeHoursEdit = timeHoursEdit -12;
                
            }
            
         
        };

        let scannedAt = ` time ${timeHoursEdit}:${timeMinutesEdit} ${flag}`;

        let name = `${decode.firstName} ${decode.lastName}`;
        
        
        toast(scannedAt,name,attended);
    }else if(attended === 200){
        errMesg = response.data.Message;
        toast('','',attended,errMesg);
    }
}).catch((error)=>{
    console.log(error);
})
};



// attendance test function //
function toast(scannedAt,name,attended,errMsg){
let toastEl = document.querySelector('.toast');
const toast = new bootstrap.Toast(toastEl);

let time = document.querySelector('.toast .toast-header .text-body-secondary');
let scanState  = document.querySelector('.toast .toast-body .row .scan-state');
let userName = document.querySelector('.toast .toast-body .row .user-name');
bg = `${attended === 201? "bg-success-subtle":"bg-danger-subtle"}`;
toastEl.classList.remove("bg-success-subtle", "bg-danger-subtle");
toastEl.classList.add(bg);
time.innerHTML = `${scannedAt}`;
scanState.innerHTML = `${attended === 201 ?"✅Scanned Successfully":`❌${errMsg}`}`;
userName.innerHTML = `${name}`;
toast.show();

};
// attendance test function //

