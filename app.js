const express = require ('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const bcrypt = require('bcrypt');

const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const mongoose = require('mongoose');
mongoose.connect('mongodb://123:123@localhost/proj');

var db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
	console.log("Connection is open...");
});

var UserSchema = mongoose.Schema({
	userId: { type: Number, required: true, unique: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	fav_locId: [{ type: Number }],
	fav_routeId: [{ type: Number }],
	homeLoc: { latitude: { type: Number },
               longitude: { type: Number } }
});
var User = mongoose.model('User', UserSchema);

var LocationSchema = mongoose.Schema({
    locId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    dir: { type: Boolean, required: true }, // true: outbound, false: inbound
    seq: { type: Number, required: true },
    busArrivalTime: { type: Date, required: true }
});
var Location = mongoose.model('Location', LocationSchema);

var RouteSchema = mongoose.Schema({
	routeId: { type: Number, required: true, unique: true },
	startLocId: { type: Number, required: true },
	endLocId: { type: Number, required: true },
	stopCount: { type: Number, required: true }
});
var Route = mongoose.model('Route', RouteSchema);

var RouteLocationSchema = mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    loc: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }]
});
var RouteLocation = mongoose.model('RouteLocation', RouteLocationSchema);

var CommentSchema = mongoose.Schema({
	commentId: { type: Number, required: true, unique: true },
	userId : { type: Number, required: true },
	content: { type: String, required: true },
	locId: { type: Number, required: true },
    time: { type: Date, required: true }
});
var Comment= mongoose.model('Comment', CommentSchema);

app.use("/", express.static(__dirname));

app.get("/", function(req, res){
    if (req.session['login'] == true)
        res.sendFile(__dirname + '/user.html');
    else if (req.session['loginAdmin'] == true)
        res.sendFile(__dirname + '/admin.html');
    else
        res.sendFile(__dirname + '/root.html');
});

app.get("/signup", function(req, res){
    if (req.session['login'] == true)
        res.send('/user.html');
    else if (req.session['loginAdmin'] == true)
        res.send('/admin.html');
    else
        res.send('/signup.html');
});

app.post("/signup", function(req, res){
    if (req.body['username'] == "" || req.body['password'] == "" || req.body['repeatPassword'] == ""){
        res.send("Please fill in all the fields!");
    }
    else if (req.body['username'].length < 4 || req.body['username'].length > 20){
        res.send("The username should have 4-20 characters!");
    }
    else if (req.body['password'].length < 4 || req.body['password'].length > 20){
        res.send("The username should have 4-20 characters!");
    }
    else{
        User.findOne({username: req.body['username']})
        .exec(function(err, user) {
            if (err) {
                res.send(err);
            }
            else if (user != null){
                res.send("The username already exists!");
            }
            else if (req.body['password'] != req.body['repeatPassword']){
                res.send("Please enter the same password!");
            }
            else{
                User.findOne()
                .sort({userId: -1})
                .select('userId')
                .exec(function(err, result) {
                    if (err){
                        res.send(err);
                    }
                    else {
                        var u;
                        if (result == null) {
                            u = new User({
                                userId: 1,
                                username: req.body['username'],
	                            password: bcrypt.hashSync(req.body['password'], 8)
                            });
                        }
                        else {
                            u = new User({
                                userId: result.userId + 1,
                                username: req.body['username'],
                                password: bcrypt.hashSync(req.body['password'], 8)
                            });
                        }
                        u.save(function(err) {
                            if (err){
                                res.send(err);
                            }
                            else{
                                res.send("/root.html");
                            }
                        });
                    }
                });
            }
        });
    }
});

app.post("/login", function(req, res){
    if (req.body['username'] == "" || req.body['password'] == ""){
        res.send("Please enter username and password!");
    }
    else{
        User.findOne({username: req.body['username']})
        .exec(function(err, user) {
            if (err) {
                res.send(err);
            }
            else if (user == null){
                res.send("Wrong username/password!");
            }
            else{
                bcrypt.compare(req.body['password'], user.password, function(err, result){
                    if (err)
                        res.send(err);
                    else if(result){
                        req.session['login'] = true;
                        req.session['username'] = req.body['username'];
                        res.redirect('./user');
                    }
                    else {
                        res.send("Wrong username/password!");
                    }
                });
            }

        });
    }
});

app.get('/user', function(req, res) {
	if (req.session['login']) {
		res.send("/user.html");
	} else {
		res.send('Please login to view this page!');
	}
});

app.post("/loginAdmin", function(req, res){
    req.session['loginAdmin'] = true;
    res.redirect('./admin');
});

app.get("/admin", function(req,res){
    if (req.session['loginAdmin']) {
        res.send("/admin.html");
	} else {
		res.send('Please login as admin to view this page!');
	}
});

app.post("/logout", function(req, res){
    req.session['login'] = false;
    req.session['username'] = "";
	res.send("root.html");
});

app.post("/logoutAdmin", function(req, res){
    req.session['loginAdmin'] = false;
	res.send("/root.html");
});

app.post("/admin/flush", function(req, res){
    console.log(req.body['route']);
    console.log(req.body['routeLoc']);
    console.log(req.body['loc']);
    console.log(req.body['eta']);

    //store data




    res.send("Done!");
});

// RESTful API
app.get("/locations", function(req,res){

});

app.post("/locations", function(req,res){

});

app.get("/locations/:loc-id", function(req,res){

});

app.put("/locations/:loc-id", function(req,res){

});

app.delete("/locations/:loc-id", function(req,res){

});

const server = app.listen(2064);
