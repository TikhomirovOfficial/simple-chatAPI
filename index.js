const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")

const options={
    cors:true,
    origins:["*"]
}

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, options);

const messages = []
let isTypingUsers = []

app.use(cors())
app.use(bodyParser.json())


app.get("/messages", (req, res) =>{
    res.json(messages)
});

app.post("/messages", (req, res) =>{
    messages.push(req.body)
    io.emit('message', req.body)
});

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        socket.broadcast.emit("join", name)
    })
    socket.on('typing', (data) => {
        if (data[0]) {
            if (!isTypingUsers.filter(user => user.uid === data[2])[0]){
                isTypingUsers.push({
                    name:data[1],
                    uid:data[2]
                })
            }
        } else {
            isTypingUsers = isTypingUsers.filter(user => user.uid !== data[2])
        }
        socket.broadcast.emit('typing', isTypingUsers)
    })
})

const server = http.listen(process.env.PORT || 8000, () => {
    const { port } = server.address();
    console.log(`Listening on port ${port}`);
});
