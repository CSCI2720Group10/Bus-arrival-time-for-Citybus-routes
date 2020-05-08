const express = require ('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb' ,extended: true}));
app.use(bodyParser.urlencoded({limit: '100mb' ,extended: true, parameterLimit: 1000000}));

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
                                                                //User Schema
var UserSchema = mongoose.Schema({
	userId: { type: Number, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	fav_locId: [{ type: Number }],
	fav_routeId: [{ type: Number }],
	homeLoc: { latitude: { type: Number },
               longitude: { type: Number } }
});
var User = mongoose.model('User', UserSchema);

                                                                //Location Schema
var LocationSchema = mongoose.Schema({
    locId: { type: Number, required: true},
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    dir: { type: String, required: true }, // I: inbound, O: outbound
    seq: { type: Number, required: true },
    eta: { type: Array, required: true }     //estimated time of arrival
});
var Location = mongoose.model('Location', LocationSchema);

                                                                //Route Schema
var RouteSchema = mongoose.Schema({
	routeId: { type: Number, required: true, unique: true },
	startLocId: { type: Number, required: true },
	endLocId: { type: Number, required: true },
	stopCount: { type: Number, required: true }
});
var Route = mongoose.model('Route', RouteSchema);

                                                                //Route Location Schema
var RouteLocationSchema = mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    loc: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }]
});
var RouteLocation = mongoose.model('RouteLocation', RouteLocationSchema);

                                                                //Comment Schema
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

                                                                //Sign up page
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
        res.send("The password should have 4-20 characters!");
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

                                                                //Login page
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

                                                                //User page
app.get('/user', function(req, res) {
	if (req.session['login']) {
		res.send("/user.html");
	} else {
		res.send('Please login to view this page!');
	}
});

app.post("/logout", function(req, res){
    req.session['login'] = false;
    req.session['username'] = "";
	res.send("/root.html");
});

                                                                //Admin page
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

app.post("/logoutAdmin", function(req, res){
    req.session['loginAdmin'] = false;
	res.send("/root.html");
});

                                                //admin flush data
app.post("/admin/flush", function(req, res){
    console.log(req.body['route']);
    console.log(req.body['routeLoc']);
    console.log(req.body['loc']);

    //store data

    var arr_route = req.body['route'];
    var arr_routeLoc = req.body['routeLoc'];
    var arr_loc = req.body['loc'];

    console.log(arr_route.length);
    for(var i=0; i < arr_route.length; i++){            //Route Data
        a = new Route(arr_route[i]);
        a.save(function(err) {
            if(err)
                console.log(err);
        });
    };

    res.write("Route Data Completed<br>");
 /*                                                     //not working since the array format is not the same as the schemas
    for(var i=0; i < arr_routeLoc.length; i++){
        b = new RouteLocation(arr_routeLoc[i]);
        b.save(function(err) {
            if(err)
                console.log(err);
        });
    };

    res.write("Route Location Data Completed<br>");
 */
    for(var i=0; i < arr_loc.length; i++){              //Location Data
        c = new Location(arr_loc[i]);
        c.save(function(err) {
            if(err)
                console.log(err);
        });
    };

    res.write("Location Data Completed<br>");


    res.end("Done!");
});

                                                // Admin CRUD actions for location data
//retrieve location
app.get("/admin/location", function(req, res){

});
//create location
app.post("/admin/location", function(req,res){

});
//update location
app.put("/admin/location", function(req,res){

});
//delete location
app.delete("/admin/location", function(req,res){

});

                                                // Admin CRUD actions for user data
//retrieve users
app.get("/admin/user", function(req, res){
    User.find()
	.select('username password')
    .sort({userId: 1})
	.exec(function(err, users) {
		if (err)
			res.send(err);
		else if (users.length == 0)
			res.send("No users!");
		else {
			var output = "";
			for(var i = 0; i < users.length; i++) {
				output += '<div class="mb-3 userInfo">Username: <span>' + users[i].username + "</span><br>" +
				"Password: <span>" + users[i].password + "</span></div>";
            }
			res.send(output);
		}
	});
});
//create users
app.post("/admin/user", function(req,res){
    if (req.body['username'] == "" || req.body['password'] == ""){
        res.send("Please fill in all the fields!");
    }
    else if (req.body['username'].length < 4 || req.body['username'].length > 20){
        res.send("The username should have 4-20 characters!");
    }
    else if (req.body['password'].length < 4 || req.body['password'].length > 20){
        res.send("The password should have 4-20 characters!");
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
                                res.send("Create user successfully!");
                            }
                        });
                    }
                });
            }
        });
    }
});
//update users
app.put("/admin/user", function(req,res){
    if(req.body['newUsername'] != undefined){
        if (req.body['newUsername'].length < 4 || req.body['newUsername'].length > 20){
            res.send("The username should have 4-20 characters!");
        }
        else{
            User.findOne({username: req.body['newUsername']})
            .exec(function(err, user) {
                if (err){
                    res.send(err);
                }
                else if (user != null){
                    res.send("The username already exists!");
                }
                else{
                    User.updateOne({username: req.body['username']},{username: req.body['newUsername']})
                    .exec(function(err, result) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.send();
                        }
                    });
                }
            });
        }
    }
    else{
        if (req.body['newPassword'].length < 4 || req.body['newPassword'].length > 20){
            res.send("The password should have 4-20 characters!");
        }
        else{
            var hashedPassword =  bcrypt.hashSync(req.body['newPassword'], 8);
            User.updateOne({username: req.body['username']},{password: hashedPassword})
            .exec(function(err, user) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(hashedPassword);
                }
            });
        }
    }
});
//delete users
app.delete("/admin/user", function(req,res){
    User.remove({username: req.body['username']})
    .exec(function(err, user) {
        if (err) {
            res.send(err);
        }
        else {
            res.send();
        }
    });
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
