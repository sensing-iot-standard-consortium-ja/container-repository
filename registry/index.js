const express = require('express')
const app = express()
const body = require('body-parser');
const fs = require('fs')
const path = require('path')
const serveIndex = require('serve-index');

app.use(body.raw({ type: '*/*' }));

app.use('/repo', express.static(path.join(__dirname, 'repo')))
app.use('/index', serveIndex(path.join(__dirname, 'repo')))
app.get('/health', (req, res) => {
    res.json({ message: 'maybe good' })
})

app.put('/:name', (req, res) => {
    const name = req.params["name"]
    const filePath = path.join(__dirname, 'repo', `${name}.json`)
    fs.writeFile(filePath, req.body, (err) => {
        if (err) throw err;
        res.end()
    })
})

module.exports = {
    path: '/registry',
    handler: app
}
