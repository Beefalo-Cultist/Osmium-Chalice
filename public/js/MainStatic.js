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

function dbbt(url, id,) {
    if (!getCookie('button')) {
        document.cookie = "button=unpressed"
    }

    const options = {
        credentials: 'include',
    }
    fetch(url, options)
        .then((response) => response.json())
        .then((data) => { console.log(data); document.getElementById(id).innerHTML = data.text});
}
