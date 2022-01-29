const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/src'))
app.use('/three/', express.static(path.join(__dirname, 'node_modules/three')));
app.use('/mediapipe/', express.static(path.join(__dirname, 'node_modules/@mediapipe')));

app.listen(5000, () =>
	console.log('Visit http://localhost:5000')
);