const express = require('express');
const app = express();
app.use(express.static('public', { index: "mainpage.html" }))

app.listen(8080, () => { console.log('connected!') })