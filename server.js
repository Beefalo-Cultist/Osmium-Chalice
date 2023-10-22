const { response } = require('express');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const Cookie = require('cookie')
const { createServer } = require("http");
const { Server } = require("socket.io");
const html_specialchars = require('html-specialchars');
const httpServer = createServer(app);
const io = new Server(httpServer, {});
const port = 80
const history = {};

const tea = "<head><title>Non TEA Compliant htcpcp Protocol Used</title><body>The server responded with 418 I'm a teapot.<br>If you were not expecting the error, please make sure your next request is short and stout.</body>";

app.use(express.static('public', { index: "welcome.html", extensions: ['html', 'htm', 'png'], }));
app.use(express.static('public/js', { extensions: ['js'], setHeaders: setJsHeaders }));

function setJsHeaders(res, path) {
    res.type('js');
}

function getDate(type) {
    let d = new Date();
    switch (type) {
        case "month":
            return d.getMonth();
        case "year":
            return d.getfullYear();
        case "day":
            return d.getDate();
        case "weekday":
            return d.getday();
        case "hour":
            return d.getHours();
        case "minute": 
            return d.getMinutes();
        case "seconds":
            return d.getSeconds();
        case "miliseconds":
            return d.getMilliseconds();
        case "unixtime":
            return d.getTime();
        default:
            return d;
    }
}


app.get('/hello', function (req, res) {
    res.type('json');
    let cookies = Cookie.parse(req.get('Cookie'));
    console.log(cookies);
    if (cookies.button != "pressed") {
        res.cookie("button", "pressed", { maxage: 1000 * 60 * 60 * 2 });
        res.send(JSON.stringify({ text: "<p>Good job, you pressed a button</p>" }));

    } else {
        res.send(JSON.stringify({ text: "<p>You pressed it again? Why?</p>" }));
    }
    res.end();
});

app.all('/jopy', (req, res) => {
    console.log("Jo's ip is " + req.ip);
    console.log("Jo uses " + req.get("User-Agent"));
    res.type('html');
    res.status(451).send("Server responded with 451 Unavailable For Legal Reasons<br>You try ddos me? reeeee");

})

app.all('/coffee', (req, res) => {
    console.warn("It is not advisable to attempt to brew coffee with a teapot");
    res.status(418).send(tea);
});

io.on("connection", (socket) => {
    let count = io.engine.clientsCount
    console.log("New user connected!")
    if (count == 1) {
        console.log("There is only one user connected.")
    } else { console.log("There are now " + count + " users connected.") }
    socket.on("disconnect", (reason) => {
        console.log("A user disconnected.")
        if (io.engine.clientsCount == 1) {
            console.log("There is only one user connected.")
        } else { console.log("There are now " + io.engine.clientsCount + " users connected.") }
    });
    socket.on("join", (params) => {
        let room = params.room.trim();
        socket.rooms.forEach((value) => {socket.leave(value);});
        socket.join(room);
        socket.emit("restore", history[room]);
    })
    socket.on('messageout', (mparams) => {
        let room = mparams.room.trim(); 
        let messageOut = mparams.username + ": " + mparams.message;
        messageOut = html_specialchars.escape(messageOut) + "<br>";
        io.to(room).emit("messagein", messageOut);
        if (history[room]) {
            history[room].push(messageOut);
        } else {
            history[room] = [messageOut];
        }
    })
});



httpServer.listen(port, () => { console.log(`Server connected on port ${port} at ${getDate()}.`) });

