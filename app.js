const express = require ('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb' ,extended: true}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit: 1000000}));

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
    locId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});
var Location = mongoose.model('Location', LocationSchema);

                                                                //Route Schema
var RouteSchema = mongoose.Schema({
	routeId: { type: String, required: true, unique: true },
	startLocId: { type: Number, required: true },
	endLocId: { type: Number, required: true },
	stopCount: { type: Number, required: true },
    locInfo: [{ loc: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
                dir: { type: String, required: true },
                seq: { type: Number, required: true } }]      //array of location(including dir, seq)
});
var Route = mongoose.model('Route', RouteSchema);

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
		res.send('Please login as dmin to view this page!');
	}
});

app.post("/logoutAdmin", function(req, res){
    req.session['loginAdmin'] = false;
	res.send("/root.html");
});
                                                //admin flush data
app.post("/admin/flush", function(req, res){
    /*console.log(req.body['route']);
    console.log(req.body['routeLoc']);
    console.log(req.body['loc']);*/

    (async () => {
        // remove routes and locations collections before storing data
        await Location.remove({}, function(err, result){
            if(err)
                console.log(err);
            else
                console.log("Remove Location");
        });
        await Route.remove({}, function(err, result){
            if(err)
                console.log(err);
            else
                console.log("Remove Route");
        });

        // store data
        var arr_route = req.body['route'];
        var arr_routeLoc = req.body['routeLoc'];
        var arr_loc = req.body['loc'];

        // store locations
        var promises;
        await (async () => {
            try{
                promises = arr_loc.map(async loc => {
                    var l = new Location(loc);
                    return l.save().then();
                });
                for(var p of promises) {
                    await p;
                }
            } catch(err) {
                console.log(err);
            }
        })();
        console.log("Location Data Completed");
        res.write("Location Data Completed<br>");

        // obtain location info of each route
        var locInfo = [];
        await (async()=>{
            for(var i = 0; i < arr_route.length; i++){
                var locId = []; // all locId in a route
                for (var loc of arr_routeLoc[i].loc){
                    locId.push(loc.locId);
                }

                var arr = [];
                var j = 0;
                for (var id of locId){
                    await Location.findOne({locId: id}) // synchronised?
                        .then(function(loc){
                            arr.push({loc: loc._id,
                                      dir: arr_routeLoc[i].loc[j].dir,
                                      seq: arr_routeLoc[i].loc[j].seq});
                            j++;
                    });
                }
                locInfo.push(arr);
            }
        })();

        // store routes
        var i = 0;
        for await (var route of arr_route){
            try{
                var r = new Route({
                    routeId: route.routeId,
                    startLocId: route.startLocId,
                    endLocId: route.endLocId,
                    stopCount: route.stopCount,
                    locInfo: locInfo[i]});

                await r.save().then();
                i++;
            } catch(err){
                console.log(err);
            }
        }
        console.log("Route Data Completed");
        res.write("Route Data Completed<br>");

        /*Route.findOne({routeId: "969"})
        .populate('locInfo.loc')
        .exec(function(err, result){
            if(err)
                console.log(err);
            else if(result == null)
                console.log("not found")
            else{
                for(var i = 0; i < result.locInfo.length; i++){
                    console.log(result.locInfo[i].loc.locId)
                    console.log(result.locInfo[i].seq);
                    console.log(result.locInfo[i].dir);
                }
            }
        });*/

        res.end("Done!");
    })();
});

                                                // Admin CRUD actions for location data
//create location
app.post("/admin/location", function(req,res){
    if (req.body['locId'] == "" || req.body['locName'] == ""
        || req.body['locLat'] == "" || req.body['locLong'] == ""){
        res.send("Please fill in all the fields!");
    }
    else{
        Location.findOne({locId: req.body['locId']})
        .exec(function(err, loc) {
            if (err) {
                res.send(err);
            }
            else if (loc != null){
                res.send("The location already exists!");
            }
            else{
                l = new Location({
                    locId: req.body['locId'],
                    name: req.body['locName'],
                    latitude: req.body['locLat'],
                    longitude: req.body['locLong']
                });

                l.save(function(err) {
                    if (err){
                        res.send(err);
                    }
                    else{
                        res.send("Create location successfully!");
                    }
                });
            }
        })
    }
});

//retrieve location
app.get("/admin/location", function(req, res){
    var routeId = req.query['routeId'];

    if(routeId == ""){
        res.send("Please enter the route ID");
    }
    else{
        Route.findOne({routeId: routeId})
        .exec(function(err, route){
            if(err){
                console.log(err);
            }
            else if (route == null){
                res.send("This route does not exist!");
            }
            else{
                Route.findOne({routeId: routeId})
                .populate('locInfo.loc')
                .exec(function(err, result){
                    if(err)
                        console.log(err);
                    else if(result == null)
                        console.log("not found")
                    else{
                        var output = "<h5>Route ID: " + routeId + "</h5>" +
                            "<h5>Route direction: " + (result.locInfo[0].dir == "I" ? "Inbound" : "Outbound") + "</h5>";
                        for(var i = 0; i < result.locInfo.length; i++){
                            output += "Bus stop ID: " + result.locInfo[i].loc.locId + "<br>" +
                            "Bus stop name: " + result.locInfo[i].loc.name + "<br>" +
                            "Bus stop location (latitude, longitude): (" + result.locInfo[i].loc.latitude + ", " + result.locInfo[i].loc.longitude + ")<br>" +
                            "Bus stop sequence number: " + result.locInfo[i].seq + "<br><br>";
                        }
                        res.send(output);
                    }
                });
            }
        });
    }
});

//update location
app.put("/admin/location", function(req,res){

});

//delete location
                                                            //retrieve locations for delete

app.get("/admin/location_del_retr", function(req, res) {
    Location.find().select('locId name latitude longitude').exec(function(err, loc) {
        if(err){
                console.log(err);
            }
            else if (loc == null){
                res.send("There are no locations!");
            }
            else {
                var output = "";
                for(var i = 0; i < loc.length; i++){
                    output += "<div class='mb-3 locInfo'>Location ID: <span>" + loc[i].locId + "</span><br>" +
                        "Location Name: " + loc[i].name + "<br>" +
                        "Location Latitude: " + loc[i].latitude + "<br>" +
                        "Location Longitude: " + loc[i].longitude + "</div><br><br>";
                }
                output += "<div id='locBottom' align='right'><a href='#locTop'>Go to top.</a></div>"
                res.send(output);
            }
    })
});

app.delete("/admin/location", function(req,res){
    Location.remove({locId: req.body['locId']})
    .exec(function(err, user) {
        if (err) {
            res.send(err);
        }
        else {
            res.send();
        }
    });
});

                                                // Admin CRUD actions for user data
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
app.get("/locations", function (req, res) {


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
