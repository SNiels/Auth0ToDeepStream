const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
require('dotenv').config()

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(bodyParser.json())

var jwt = require('express-jwt')

var jwtCheck = jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_CLIENT_ID,
    getToken: function (req) {
        return req.body.idToken
    }
});


app.post('/login-deepstream', jwtCheck, (req, res) => {
    getProfile(req.body.idToken, (profile) => {
        return res.json({
            userId: profile.user_id,
            clientData: {},
            serverData: { profile: profile }
        })
    })
})

function getProfile(idToken, onGetProfile) {
    var url = `https://${process.env.AUTH0_DOMAIN}/tokeninfo`

    request.post(
        url,
        { json: { id_token: idToken } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                onGetProfile && onGetProfile(body)
            }
        }
    );
}

app.get('/', (req, res) => {
    res.render('index', { env: process.env })
})

app.get('/move', (req, res) => {
    res.render('move', { env: process.env })
})

app.listen(process.env.port || 1337, () => {
    console.log('Auth server running at localhost:1337')
})