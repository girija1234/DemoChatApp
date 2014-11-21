var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , routes = require('./routes')
  , socket = require('./routes/socket.js')
   , mongoose = require('mongoose')
  , io = require('socket.io').listen(server);



// Heroku config only
if(process.env.PORT) {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });  
}

// Configuration
var config = require('./config')(app, express);

// Routes
app.get('/', routes.index);
app.get('/home', routes.home);
app.get('/getAllUser/:name', routes.findAllUser);
app.get('/getAllMessage', routes.findAllMessage);
app.post('/getUser', routes.findUser);
app.post('/saveMessage', routes.saveMessage);
app.get('/partials/:name', routes.partials);
app.post('/add', routes.createUser);
app.get('/logout/:name', routes.logout);
// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication

io.sockets.on('connection', socket);

// Start server
var port = process.env.PORT || 5000;

server.listen(port);