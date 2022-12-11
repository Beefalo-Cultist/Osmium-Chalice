const { response } = require('express');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const Cookie = require('cookie')
app.use(express.static('public', { index: "mainpage.html", extensions: ['html', 'htm', 'png'], }));
app.use(express.static('public/js', { extensions: ['js'], setHeaders: setJsHeaders }));
const tea = "<head><title>Non TEA Compliant htcpcp Protocol Used</title><body>The server responded with 418 I'm a teapot.<br>If you were not expecting the error, please make sure your next request is short and stout.</body>"
function setJsHeaders(res, path) {
    res.type('js');
}

app.get('/hello', function (req, res) {
    res.type('json');
    let cookies = Cookie.parse(req.get('Cookie'))
    console.log(cookies)
    if (cookies.button != "pressed") {
        res.cookie("button", "pressed", { maxage: 1000 * 60 * 60 * 2 });
        res.send(JSON.stringify({ text: "<p>Good job, you pressed a button</p>" }));

    } else {
        res.send(JSON.stringify({ text: "<p>You pressed it again? Why?</p>" }));
    }
    res.end();
});

app.all('/jopy', (req, res) => {
    console.log("Jo's ip is " + req.ip)
    res.type('html')
    res.status(451).send("Server responded with 451 Unavailable For Legal Reasons<br>You try ddos me? reeeee")

})

app.all('/coffee', (req, res) => {
    console.warn("It is not advisable to attempt to brew coffee with a teapot")
    res.status(418).send(tea)
});


app.listen(8080, () => { console.log('connected!') });

