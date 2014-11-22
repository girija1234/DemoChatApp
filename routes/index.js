
/*
 * GET home page.
 */
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/chatDemo');
//var uristring = 'mongodb://heroku_app31833432:adish1234@ds053080.mongolab.com:53080/heroku_app31833432';

var uristring =process.env.MONGOLAB_URI ||process.env.MONGOHQ_URL || 'mongodb://localhost/chatDemo';
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});
//mongoose.connect(uristring);

var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    birthDate: { type: String, required: true },
    isActive: { type: String}

});
var msgSchema = new Schema({
    message: { type: String },
    fromUser: { type: String },
    messageDate: { type: Date }
});
var User = mongoose.model('user', userSchema);
var Message =mongoose.model('message',msgSchema);

exports.createUser = function(req, res) {
    var user = new User(req.body);
    user.save(function(error, user) {
        if(error) res.sendStatus(error);

        res.json({ user: user });

    });
};
exports.findUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.find({username: username,password: password}, function(error, currUser) {
        if(error)res.sendStatus(error);
        User.find({username: username,password: password})
        .update({isActive:'true'},function(error, message) {
            if(error) res.sendStatus(error);
            //res.send(201);
            res.json({ message: message });
        });

        res.json({ currUser: currUser });


    });
};
exports.findAllUser = function(req, res) {
    var name = req.params.name;
    User.find({username:{$ne : name}}, function(error, allUsers) {
        if(error) res.sendStatus(error);
        res.json({ allUsers: allUsers });
    });
};

exports.saveMessage = function(req, res) {
    var message = new Message(req.body);
    message.save(function(error, message) {
        if(error) res.sendStatus(error);
        //res.send(201);
        res.json({ message: message });
    });
};

exports.findAllMessage = function(req, res) {
    var query = Message.find().sort({$natural : -1});
    query.exec(function(error, allMessages) {
        if(error) res.sendStatus(error);
        res.json({ allMessages: allMessages });
    });
};

exports.logout = function(req, res) {
    var name = req.params.name;
    User.find({username:  name})
        .update({isActive:'false'}, function(error, logoutUser) {
        if(error) console.log(error);
        res.json({ logoutUser: logoutUser });
    });
};

exports.index = function(req, res){
  res.render('login');
};
exports.home = function(req, res){
    res.render('home');
};
exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};