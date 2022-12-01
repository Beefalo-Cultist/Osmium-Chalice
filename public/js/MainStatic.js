function docload(id, url) {
    ajaxreq = new XMLHttpRequest();
    ajaxreq.onload = function () {
        while (true) {
            if (this.reponseText == undefined) {
                continue
            }
            else {
                document.getElementById(id).innerHTML = this.reponseText;
                console.log("log: " + this.reponseTest)
            }
        }
    }
    ajaxreq.onreadystatechange = function () { console.log(this.readyState); console.log(this.status) };
    ajaxreq.open("GET", url);
    ajaxreq.send();
}

function hi() {
    docload("welcome", "/testdoc.txt")
}