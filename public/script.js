const socket = io('/')

var myPeer = new Peer(undefined,{
    host:'/',
    port:"3001"
});

myPeer.on('open',id=>{
    socket.emit('join-room', ROOM_ID, id)
})

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');



myVideo.muted = true;
const peers = {};


let myVideoStream; 




navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video');
            if (screenStream) {
                return ""
            }else{

                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream);
                });
            }
            
          
        });

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream);
           
        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });





socket.on('user-disconnected', userId =>{
 if( peers[userId])  peers[userId].close();
})




function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const userVideo = document.createElement('video');

    call.on('stream', userVideoStream =>{
        addVideoStream(userVideo, userVideoStream)
    })

    call.on('close',()=>{
        userVideo.remove();
    })

peers[userId] = call

}


function connectToNewUserStream(userId, stream){
    const call = myPeer.call(userId, stream)
    const userVideo = document.createElement('video');

    call.on('stream', userVideoStream =>{
        addShareStream(userVideo, userVideoStream)
    })

    call.on('close',()=>{
        userVideo.remove();
    })

peers[userId] = call

}



function addVideoStream(video, stream) {
video.srcObject = stream;
video.addEventListener('loadedmetadata',()=>{
    video.play();
});
videoGrid.append(video)
}

function addShareStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    });
    shareGrid.append(video)
    }



const shareGrid = document.getElementById('share');
const myShare = document.createElement('video');

let screenStream = null;
let myShareStream = null;



shareScreenButton.addEventListener('click', async () => {
    if (!screenStream) {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true,});
        myShareStream = screenStream;
        myShare.srcObject = screenStream;
        myShare.muted = true; // Mute if necessary
        
        // Clear existing shared screen before adding a new one
        

        addShareStream(myShare, screenStream);

        socket.on('user-connected', userId => {
            connectToNewUserStream(userId, screenStream);
        });
    }
});

// Function to clear the shared screen
function clearShareScreen() {
    myShare.srcObject = null;
    myShareStream = null;
    screenStream = null;

    // Remove shared video elements from the shareGrid
    const sharedVideos = document.querySelectorAll('#share video');
    sharedVideos.forEach(video => {
        video.srcObject = null;
        video.remove();
    });
}




const stopSharingButton = document.getElementById('stopSharingButton');

stopSharingButton.addEventListener('click', () => {
    if (screenStream) {
        // Stop screen sharing
        const tracks = screenStream.getTracks();
        tracks.forEach(track => track.stop());

        // Remove the shared screen from the view
        myShare.srcObject = null;
        myShareStream = null;
        screenStream = null;
        

        // You might also want to notify other users that sharing has stopped
        // For instance, emit an event to the socket server
        socket.emit('stop-sharing');

        // Remove shared video element from the shareGrid
        const sharedVideo = document.querySelector('#share video');
        if (sharedVideo) {
            sharedVideo.remove();
        }
    }
});


const muteButton = document.getElementById('muteButton');
const unmuteButton = document.getElementById('unmuteButton');

muteButton.addEventListener('click', () => {
    toggleMute(true); // Mute the video streams
});

unmuteButton.addEventListener('click', () => {
    toggleMute(false); // Unmute the video streams
});

// Function to toggle mute/unmute for all video streams
function toggleMute(isMuted) {
    // Mute/unmute my video
    myVideoStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });

    // Mute/unmute shared screen video
    if (screenStream) {
        screenStream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });
    }
}



const stopVideoButton = document.getElementById('stopVideoButton');
const allowVideoButton = document.getElementById('allowVideoButton');

stopVideoButton.addEventListener('click', () => {
    toggleVideo(false); // Stop the video streams
});

allowVideoButton.addEventListener('click', () => {
    toggleVideo(true); // Allow the video streams
});

// Function to toggle stop/allow video for all video streams
function toggleVideo(isVideoAllowed) {
    // Stop/allow my video
    myVideoStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoAllowed;
    });

    // Stop/allow shared screen video
    if (screenStream) {
        screenStream.getVideoTracks().forEach(track => {
            track.enabled = isVideoAllowed;
        });
    }
}






