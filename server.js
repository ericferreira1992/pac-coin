// import express from 'express'
let express = require('express');

const app = express()

app.use(express.static(__dirname + '/dist'));
app.listen(8080, function() {console.log(`Server is listening on port 8080`)})

module.exports = app;