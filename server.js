const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server);
const {v4:uuidV4 } = require('uuid')

app.set("view engine","ejs")
app.use(express.static("public"))

app.get('/',(req,res)=>{
res.redirect(`/${uuidV4()}`)
})

app.get('/:room',(req,res)=>{
    res.render("room", {roomId: req.params.room})
})

io.on("connection", socket =>{
    socket.on("join-room", (roomId, userId)=>{
        socket.join(roomId)
        socket.to(roomId).emit('user-connected',userId)
        socket.on('disconnect', ()=>{
            socket.to(roomId).emit('user-disconnected',userId)
        })

        socket.on('reload-page', () => {
            // Emit the 'reload-page' event to all connected clients in the room
            io.to(roomId).emit('reload-page');
        });

    })

})





server.listen(4000)