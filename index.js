// imports
const apiai = require('apiai')('9a638e79385a4377b4d307b1cd3b1940');
const express = require('express');
const app = express();


// config
app.set('port', process.env.PORT || 5000);


// static files
app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images


// routing
app.get('/', (req, res) => {
    res.sendFile('index.html');
});


// initialize server
const server = app.listen(app.get('port'), () => {
    console.log('Server listening on port', app.get('port'));
});
var io = require('socket.io')(server);


// io connection
io.on('connection', function(socket) {
    socket.on('chat message', (text) => {
        var sessionID = new Date().getTime();
        // console.log('chat message', text, sessionID);

        // get reply from DialogFlow
        let apiaiReq = apiai.textRequest(text, {
            sessionId: sessionID //APIAI_SESSION_ID
        });

        apiaiReq.on('response', (response) => {
            let aiText = response.result.fulfillment.speech;
            socket.emit('bot reply', aiText); // send result back to browser
            console.log('bot reply');
        });

        apiaiReq.on('error', (error) => {
            console.log(error);
        });

        apiaiReq.end()
    });
});