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

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,

}).then( stream=>{
addVideoStream(myVideo, stream);

myPeer.on('call',call=>{
call.answer(stream);
const video = document.createElement('video');
call.on('stream',userVideoStream=>{
addVideoStream(video, userVideoStream);
})


})


// ... (existing code)

const muteButton = document.getElementById('muteButton');
const stopVideoButton = document.getElementById('stopVideoButton');

let isAudioMuted = false;
let isVideoStopped = false;

muteButton.addEventListener('click', () => {
    isAudioMuted = !isAudioMuted;
    const audioTracks = myVideo.srcObject.getAudioTracks();
    audioTracks.forEach(track => {
        track.enabled = !isAudioMuted;
    });
    muteButton.innerText = isAudioMuted ? 'Unmute Audio' : 'Mute Audio';
});

stopVideoButton.addEventListener('click', () => {
    isVideoStopped = !isVideoStopped;
    const videoTracks = myVideo.srcObject.getVideoTracks();
    videoTracks.forEach(track => {
        track.enabled = !isVideoStopped;
    });
    stopVideoButton.innerText = isVideoStopped ? 'Start Video' : 'Stop Video';
});

// ... (remaining code)




socket.on('user-connected', userId =>{
    connectToNewUser(userId, stream);
})


})


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



function addVideoStream(video, stream) {
video.srcObject = stream;
video.addEventListener('loadedmetadata',()=>{
    video.play();
});
videoGrid.append(video)
}


// Existing code...

let screenStream = null; // To store the screen sharing stream

const shareScreenButton = document.getElementById('shareScreenButton');

shareScreenButton.addEventListener('click', async () => {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

        // Replace the existing stream with the screen sharing stream
        const videoTracks = myVideo.srcObject.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks.forEach(track => {
                track.stop();
            });
        }

        myVideo.srcObject = screenStream;

        // Broadcast the screen share to other users
        for (const peerId in peers) {
            const call = myPeer.call(peerId, screenStream);
            peers[peerId].close();
            peers[peerId] = call;
        }

        // Close the screen sharing when stopped
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            myVideo.srcObject = stream;
            for (const peerId in peers) {
                const call = myPeer.call(peerId, stream);
                peers[peerId].close();
                peers[peerId] = call;
            }
        });
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
});

// ... (existing code)





