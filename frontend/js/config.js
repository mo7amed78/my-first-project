function getBaseURL(){
    return 'https://education-backend-production-a297.up.railway.app';
};

const BASE_URL = getBaseURL();

let socket = null;

function getSocket() {
    if (!socket) {
        socket = io(BASE_URL);

        socket.on("connect", () => {
            console.log("socket connected");
        });
    }

    return socket;
}