const express = require('express');
const app = express();
app.use(express.static('public', { index: "mainpage.html", extensions: ['html', 'htm', 'png'] }))

app.listen(8080, () => { console.log('connected!') })