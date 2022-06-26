var cluster = require("cluster");
var sticky = require("sticky-session");
const app = require("express")();
const cors = require("cors");
var server = require("http").createServer(app);
var info = {port: 8888};
app.use(cors());
app.get("/", (req, res) => {
    res.send("Http Test");
});

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const redisAdapter = require("socket.io-redis");
io.adapter(
    redisAdapter({
        host:"localhost",
        port:6379
    })
);

if (!sticky.listen(server, info.port)) {
    // Master code
    server.once("Listening: ", () => {
        console.log("# Server started on 8888 port");
    });
}
else {
    // Worker code
    io.on("connection", socket => {
        console.log({ connected: socket.id, worker: cluster.worker.id });
        socket.on("join", data => {
            socket.join(data.roomName);
            socket.emit("join", { roomName: data.roomName });
        });
        socket.on("message", data => {
            console.log({message:"", data});
            io.to(data.roomName).emit("message", data);
        });
    });
}