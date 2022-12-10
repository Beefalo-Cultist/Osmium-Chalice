const { response } = require('express');
const express = require('express');
const app = express();
app.use(express.static('public', { index: "mainpage.html", extensions: ['html', 'htm', 'png'], }));
app.use(express.static('public/js', { extensions: ['js'], setHeaders: setJsHeaders }));
const tea = "<head><title>Non TEA Compliant htcpcp Protocol Used</title><body>The server responded with 418 I'm a teapot.<br>If you were not expecting the error, please make sure your next request is short and stout.</body>"
function setJsHeaders(res, path) {
    res.type('js');
}

app.get('/hello', function (req, res) {
    res.type('html')
    res.send('<p>Message Received</p>');
    res.end();
});

app.all('/coffee', (req, res) => {
    console.warn("It is not advisable to attempt to brew coffee with a teapot")
    res.status(418).send(tea)
});


app.listen(8080, () => { console.log('connected!') });

