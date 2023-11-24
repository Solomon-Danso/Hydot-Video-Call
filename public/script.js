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
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream);
            if (screenStream) {
                const call = myPeer.call(userId, screenStream);
                call.on('stream', userScreenStream => {
                    addVideoStream(video, userScreenStream);
                });
                peers[userId] = call;
            }
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



function addVideoStream(video, stream) {
video.srcObject = stream;
video.addEventListener('loadedmetadata',()=>{
    video.play();
});
videoGrid.append(video)
}


// Existing code...

shareScreenButton.addEventListener('click', async () => {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

        // Broadcast screen share to existing users
        for (const peerId in peers) {
            const call = myPeer.call(peerId, screenStream);
            peers[peerId].close();
            peers[peerId] = call;
        }

        // Replace user's video with the shared screen
        const videoTracks = myVideo.srcObject.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks.forEach(track => {
                track.stop();
            });
        }
        myVideo.srcObject = screenStream;

        // Event listener to stop screen share when ended
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            myVideo.srcObject = myVideoStream;
            for (const peerId in peers) {
                const call = myPeer.call(peerId, myVideoStream);
                peers[peerId].close();
                peers[peerId] = call;
            }
        });
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
});
// ... (existing code)





