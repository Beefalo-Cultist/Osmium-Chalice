const { response } = require('express');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const cookie = require('cookie-signature')
const { createServer } = require("http");
const { Server } = require("socket.io");
const html_specialchars = require('html-specialchars');
const encryptly = require('encryptly');
const editJsonFile = require("edit-json-file");
const base62 = require('base62-random');
require('dotenv').config();

const httpServer = createServer(app);
const io = new Server(httpServer, {});

const port = 80;
const encryptKey = process.env.encryptionkey;
const cookiesecret = process.env.cookiesecret
const history = editJsonFile(`${__dirname}/data/history.json`, {autosave:true});
const accounts = editJsonFile(`${__dirname}/data/accounts.json`, {autosave:true});
const tea = "<head><title>Non TEA Compliant htcpcp Protocol Used</title><body>The server responded with code <code>418 I'm a teapot</code>.<br>If you were not expecting the error, please make sure your next request is short and stout.</body>"

function setJsHeaders(res, path) {
    res.type('js');
}

function updateip(ip,user) {
    let d = new Date()
    d.setTime((getDate('unixtime')+2629746000))
    let safeip = {
        verifiedIp: ip,
        expirationDate: d
    }
    accounts.append(`${user}.safeips`, safeip)
    return true
}

class useraccount {
    constructor(body, safepass, token) {
        this.username = body.username,
        this.email = body.email,
        this.password = safepass,
        this.usertoken = token
        this.safeips = []
    }
}

function authenticate(user="", key, method="") {
    const useraccount = accounts.get(user);
    if (method=="password"&&useraccount) {
        let decryptpass = encryptly.decrypt(useraccount.password, encryptKey);
        if (decryptpass == key) {
            return true;
        } 
    } else if (method=="token"&&useraccount) {
        let safeips = useraccount.safeips.map((ip) => {return ip["verifiedIp"]})
        if (useraccount.usertoken==key.token&&safeips.includes(key.reqip)) {
            return true;
        }
    } else {
        return new Error("Invalid Authorization")
    }
    return false;
}

function getDate(type) {
    let d = new Date();
    switch (type) {
        case "month":
            return d.getMonth();
        case "year":
            return d.getFullYear();
        case "day":
            return d.getDate();
        case "weekday":
            return d.getDay();
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

app.use([express.urlencoded(), cookieParser(cookiesecret)]);

app.all("/", cookieParser(cookiesecret), (req, res) => {
    if (req.signedCookies.usertoken||req.signedCookies.user) {
        if (authenticate(req.signedCookies.user, {token:req.signedCookies.usertoken, reqip:req.ip}, "token")) {res.redirect("/chat");} 
        else {res.redirect("/login");}
    } else {res.redirect("/chat")}
})

app.all('/coffee', (req, res) => {
    console.warn("It is not advisable to attempt to brew coffee with a teapot");
    res.status(418).send(tea);
});

app.post('/newacc', cookieParser(cookiesecret), (req, res) => {
    let usrchk = /^(?=.*[a-zA-Z]{1,})(?=.*[\d]{0,})[a-zA-Z0-9-_]{4,20}$/
    let emlchk = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/
    let passchk = /[A-Za-z0-9!@#$%^&*-_+=:;?,.~]{8,32}/
    if (!(req.body.username&&req.body.email&&req.body.password)) {res.sendStatus(400); return false;}
    if(!(usrchk.test(req.body.username)&&emlchk.test(decodeURIComponent(req.body.email))&&passchk.test(req.body.password))) {res.status(422).send("username, email, or password are incorrectly formatted, please check signup page for formatting requirements."); return}
    let username = req.body.username;
    let email = req.body.email;
    let password = encryptly.encrypt(req.body.password, encryptKey);
    let accstring = JSON.stringify(accounts.get())
    if(accstring.includes(`"${username}"`) || accstring.includes(`"${email}"`)){res.status(409).send("bad request; account with same email or username already exists"); return}
    accounts.set(username, new useraccount(req.body, password, base62(25)));
    accounts.save();
    updateip(req.ip, username);
    res.cookie("usertoken", accounts.get(username).usertoken, {signed:true,httpOnly:true,maxAge:2629746000});
    res.cookie("user", accounts.get(username).username, {signed:true,httpOnly:true,maxAge:2629746000});
    res.status(201).send(username);
});

app.all('/authenticate', cookieParser(cookiesecret), (req, res) => {
    if(!req.get("authorization")) {res.set("WWW-Authenticate", 'Basic realm="osmium chalice login"'); res.sendStatus(401); return}
    let auth = req.get("authorization");
    try {var creds = Buffer.from(auth.split("Basic ")[1], 'base64').toString('utf8')} catch {res.status(401).send("invalid authorization scheme"); return}
    let user = creds.split(":")[0];
    let password = creds.split(":")[1];
    if (accounts.get(user)&&authenticate(user, password, "password")) {
        updateip(req.ip, accounts.get(user).username);
        res.cookie("usertoken", accounts.get(user).usertoken, {signed:true,httpOnly:true,maxAge:2629746000});
        res.cookie("user", encryptly.encrypt(accounts.get(user).username, encryptKey), {signed:true,httpOnly:true,maxAge:2629746000});
        res.status(200).send(user);
        return;
    }
    res.status(401).send("invalid credentials");
})

app.get('/memberchat', cookieParser(cookiesecret), (req, res, next) => {
    let logintoken = req.signedCookies.usertoken;
    try {let username = encryptly.decrypt(req.signedCookies.user, encryptKey)}
    catch {username = null}
    if(!username||!logintoken) {res.redirect(401, "/login"); return}
    if (authenticate(username, {token:logintoken, reqip:req.ip}, "token")) {
        res.status(200);
        next();
    } else {res.redirect(401, "/chat"); return}
})

app.use(express.static('public', { extensions: ['html', 'htm', 'png'] }));
app.use(express.static('public/js', { extensions: ['js'], setHeaders: setJsHeaders }));

io.on("connection", (socket) => {
    let count = io.engine.clientsCount
    console.log("New user connected!")
    if (count == 1) {
        console.log("There is only one user connected.")
    } else { console.log("There are now " + count + " users connected.") }
    let handshakecookies = socket.handshake.headers.cookie;
    try {socket.data.username = encryptly.decrypt(handshakecookies.split("user=s%3A")[1].split(".")[0], encryptKey)}
    catch {socket.data.username = null}
    accounts.get("<GUEST>")

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
        socket.emit("restore", history.get(room));
    })
    socket.on('messageout', (mparams) => {
        let room = mparams.room.trim(); 
        let author;
        if (socket.handshake.headers.referer.includes("memberchat")&&socket.data.username) {author = socket.data.username}
        else if (mparams.username) {author="<GUEST> " + mparams.username}
        else {author=`<GUEST #${socket.id.substring(0,5)}>`}
        let messageOut = author + ": " + mparams.message;
        messageOut = html_specialchars.escape(messageOut) + "<br>";
        io.to(room).emit("messagein", messageOut);
        history.append(room, messageOut);
    })
});



httpServer.listen(port, () => { console.log(`Server connected on port ${port} at ${getDate()}.`) });

