function fetchreq(url, options) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => document.write(data));
}
