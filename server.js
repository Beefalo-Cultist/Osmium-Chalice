const express = require('express');
const app = express();
app.use(express.static('public', { index: "mainpage.html", extensions: ['html', 'htm', 'png'] }))

app.get('/mainreq', function (req, res) {
    res.send('hi, S;KGLHKGc;iyflufLGD;iyfdLUY;Fltud;LUYFALutdflU.YDKTudKUYDKYG')
})

app.listen(8080, () => { console.log('connected!') })