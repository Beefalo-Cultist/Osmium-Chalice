const socket = io();

function sendmessage() {
    var messagetext = document.getElementById("messageout").value;
    var username = document.getElementById("username").value;
    const mparams = {
        message: messagetext,
        username: username,
        date: new Date(),
        room: 'all'
    }
    socket.emit('messageout', mparams)
    messagetext = ""
}
function restoreChatHistory(room) {
    room.forEach((value) => {
        let message = document.createElement('p');
        let messageWrapper = document.getElementById("message-history");
        message.innerHTML = value;
        messageWrapper.appendChild(message);
    })
}
socket.on('restore', (arg) => { restoreChatHistory(arg) })

socket.on("messagein", (arg) => {
    const newMessage = document.createElement('p');
    const messageWrapper = document.getElementById("message-history");
    newMessage.innerHTML = arg;
    messageWrapper.appendChild(newMessage);
    messageWrapper.scrollTop = messageWrapper.scrollHeight;
})