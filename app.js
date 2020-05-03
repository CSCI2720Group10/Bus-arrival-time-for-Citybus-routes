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
mongoose.connect('');

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
	homeLoc: { latitude: { type: Number, required: true },
               longitude: { type: Number, required: true } },
    status: { type: Number, required: true }
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
	locId: { type: Number, required: true, unique: true },
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

app.get("/", function(req,res){
    res.sendFile(__dirname + "/root.html");
});

app.post("/login", function(req, res){
    //console.log(bcrypt.hashSync(password));

    User.findOne({username: req.body['username']})
	.exec(function(err, user) {
		if (err) {
			res.send(err);
        }
        else if (user == null){
            res.send("empty");
        }
        else if (user.password == req.body['password']){
            req.session['login'] = true;
            req.session['username'] = req.body['username'];
            res.redirect('/user');
        }
        else{
            res.send("fail");
        }
    });
});

app.get('/user', function(req, res) {
	if (req.session['login']) {
		res.sendFile(__dirname + "/user.html");
	} else {
		res.send('Please login to view this page!');
	}
});

app.post("/loginAdmin", function(req, res){
    req.session['loginAdmin'] = true;
    res.redirect('/admin');
});

app.get("/admin", function(req,res){
    if (req.session['adminLogin']) {
        res.sendFile(__dirname + "/admin.html");
	} else {
		res.send('Please login as admin to view this page!');
	}
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
