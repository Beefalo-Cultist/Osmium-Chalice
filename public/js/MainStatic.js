function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function gv(id="", input=false) {       //get value function
    let item = document.getElementById(id)
    if (input){
        try{
            value = item.value;
            return value;
        } catch {return "";}
    } else {return item;}
}

function fillname() {
    const username = (new URLSearchParams(window.location.search)).get("uname");
    document.getElementById("username").innerHTML = username;
    }

function restoreLastRoom() {
    let lr = getCookie("lastRoom");
    if (lr && lr != "common") {
        document.getElementById("room-select").value = lr;
    }
    joinRoom()
}
