const socket = io();

function getRoom() {
    let rawroom = document.getElementById("room-select").value; 
    if (!rawroom) {rawroom = "common"} 
    return rawroom;
}

function sendmessage() {
    let messagetext = document.getElementById("messageout").value;
    let username = document.getElementById("username").value;
    const mparams = {
        message: messagetext,
        username: username,
        date: new Date(),
        room: getRoom()
    }
    socket.emit('messageout', mparams)
    document.getElementById("messageout").value = ""
}
function restoreChatHistory(room) {
    if (room) {
        room.forEach((value) => {
            let message = document.createElement('p');
            let messageWrapper = document.getElementById("message-history");
            message.innerHTML = value;
            messageWrapper.appendChild(message);
    })
}
}
socket.on('restore', (arg) => { restoreChatHistory(arg) })

socket.on("messagein", (arg) => {
    const newMessage = document.createElement('p');
    const messageWrapper = document.getElementById("message-history");
    newMessage.innerHTML = arg;
    messageWrapper.appendChild(newMessage);
    messageWrapper.scrollTop = messageWrapper.scrollHeight;
})

function joinRoom() { 
    let connectedRoom;
    document.getElementById("message-history").innerHTML = "<p>This is the start of our room's history!</p>"
    socket.emit("join",{room : getRoom()});
    connectedRoom = (function() {if (getRoom() == 'common'){return "site-wide chat room";} else {return getRoom();}}())
    document.getElementById("room-indicator").innerHTML = `Connected to ${connectedRoom}!`;
    setCookie('lastRoom', getRoom(), 14);
}