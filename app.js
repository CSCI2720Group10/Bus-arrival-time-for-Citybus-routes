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
                                                                //Location Schema
var LocationSchema = mongoose.Schema({
    locId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    commentNum: { type: Number, required: true },
    favLocNum: { type: Number, required: true}
});
var Location = mongoose.model('Location', LocationSchema);

//User Schema
var UserSchema = mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fav_loc: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    fav_routeId: [{ type: Number }],
    commentNum: { type: Number, required: true },
    favLocNum: { type: Number, required: true },
    homeLoc:
    {
        latitude: { type: Number },
        longitude: { type: Number }
    }
});
var User = mongoose.model('User', UserSchema);

                                                                  //Route Schema
var RouteSchema = mongoose.Schema({
	routeId: { type: String, required: true },
	startLocId: { type: Number, required: true },
	endLocId: { type: Number, required: true },
	stopCount: { type: Number, required: true },
    dir: { type: String, required: true },
    locInfo: [{ loc: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
                seq: { type: Number, required: true } }]
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
	                            password: bcrypt.hashSync(req.body['password'], 8),
                                commentNum: 0,
                                favLocNum: 0
                            });
                        }
                        else {
                            u = new User({
                                userId: result.userId + 1,
                                username: req.body['username'],
                                password: bcrypt.hashSync(req.body['password'], 8),
                                commentNum: 0,
                                favLocNum: 0
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
                                                               //Loin pageg
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
		res.sendFile(__dirname + "/user.html");
	} else {
		res.send('Please login to view this page!');
	}
});

app.post("/logout", function(req, res){
    req.session['login'] = false;
    req.session['username'] = "";
	res.send("/root.html");
});


// list locations in a table
app.get("/user/location", function (req, res)
{
    if (req.query['locId'] != undefined)
    {
        Location.find({locId: new RegExp(req.query['locId'])})
        .exec(function(err, loc) {
            if(err){
                console.log(err);
            }
            else if(loc.length == 0){
                res.send("No locations!")
            }
            else
            {
                var table = '<table class="table table-borderless table-hover table-sm text-center text-dark mx-auto">' +
                    '<thead class="thead-light"><tr>' +
                    '<th>Location ID</th>' +
                    '<th>Name</th>' +
                    '<th>Latitude</th>' +
                    '<th>Longitude</th>' +
                    '<th>#Comment</th>' +
                    '<th>#Favourite</th>' +
                    '</tr></thead><tbody>';
                for (l of loc)
                {
                    table += '<tr>' +
                    '<td>' + l.locId + '</td>' +
                    '<td>' + l.name + '</td>' +
                    '<td>' + l.latitude + '</td>' +
                    '<td>' + l.longitude + '</td>' +
                    '<td>' + l.commentNum + '</td>' +
                    '<td>' + l.favLocNum + '</td>' +
                    '</tr>';
                }
                table += '</tbody></table>';;
                res.send(table);
            }
        });
    }
    else if(req.query['locName'] != undefined){
        Location.find({name: new RegExp(req.query['locName'])})
        .exec(function(err, loc) {
            if(err){
                console.log(err);
            }
            else if(loc.length == 0){
                res.send("No locations!")
            }
            else{
                var table = '<table class="table table-borderless table-hover table-sm text-center text-dark mx-auto">' +
                '<thead class="thead-light"><tr>' +
                '<th>Location ID</th>' +
                '<th>Name</th>' +
                '<th>Latitude</th>' +
                '<th>Longitude</th>' +
                '<th>#Comment</th>' +
                '<th>#Favourite</th>' +
                '</tr></thead><tbody>';
                for (l of loc)
                {
                    table += '<tr>' +
                    '<td>' + l.locId + '</td>' +
                    '<td>' + l.name + '</td>' +
                    '<td>' + l.latitude + '</td>' +
                    '<td>' + l.longitude + '</td>' +
                    '<td>' + l.commentNum + '</td>' +
                    '<td>' + l.favLocNum + '</td>' +
                    '</tr>';
                }
                table += '</tbody></table>';;
                res.send(table);
            }
        });
    }
    else if(req.query['locIdOrder'] != undefined){
        Location.find()
        .sort({locId: req.query['locIdOrder']})
        .exec(function(err, loc) {
            if(err){
                console.log(err);
            }
            else if(loc.length == 0){
                res.send("No locations!")
            }
            else{
                var tableBody = '';
                for(l of loc){
                    tableBody += '<tr>' +
                    '<td>' + l.locId + '</td>' +
                    '<td>' + l.name + '</td>' +
                    '<td>' + l.latitude + '</td>' +
                    '<td>' + l.longitude + '</td>' +
                    '<td>' + l.commentNum + '</td>' +
                    '<td>' + l.favLocNum + '</td>' +
                    '</tr>';
                }
                res.send(tableBody);
            }
        });
    }
    else{
        Location.find()
        .exec(function(err, loc) {
            if(err){
                console.log(err);
            }
            else if(loc.length == 0){
                res.send("No locations!")
            }
            else
            {
                var table = '<table class="table table-borderless table-hover table-sm text-center text-dark mx-auto">' +
                '<thead class="thead-light"><tr>' +
                '<th><a id="locIdCol" class="text-dark" href="">Location ID</a></th>' +
                '<th>Name</th>' +
                '<th>Latitude</th>' +
                '<th>Longitude</th>' +
                '<th>#Comment</th>' +
                '<th>#Favourite</th>' +
                '</tr></thead><tbody>';
                for (l of loc ){
                    table += '<tr>' +
                    '<td>' + l.locId + '</td>' +
                    '<td>' + l.name + '</td>' +
                    '<td>' + l.latitude + '</td>' +
                    '<td>' + l.longitude + '</td>' +
                    '<td>' + l.commentNum + '</td>' +
                    '<td>' + l.favLocNum + '</td>' +
                    '</tr>';
                }
                table += '</tbody></table>';;
                res.send(table);
            }
        });
    }
});


//find top 5 locations with most comments
app.get("/user/top5", function (req, res)
{
    Comment.aggregate([
        {$group: {_id:'$locId',
                  commentNum: { $sum:1 }},
        },
        {$sort: { commentNum: -1 }},
        {$limit: 5}
    ])
    .exec(function(err, result) {
        if(err){
            console.log(err);
        }
        else if(result.length == 0){
            res.send("No locations/comments");
        }
        else{
            var arr_locId = [];
            var locName = [];
            var locCommentNum = [];

            for (var r of result){
                arr_locId.push(r._id);
            }

            Location.find({locId: {$in: arr_locId}})
            .exec(function(err, loc){
                if(err){
                    console.log(err);
                }
                else{
                    for (var i = 0; i < result.length; i++){
                        locName.push(loc[i].name);
                        locCommentNum.push(result[i].commentNum);
                    }
                    res.send({locName: locName,
                              locCommentNum: locCommentNum});
                }
            });
        }
    });
});

//mapping all the location into the google map
app.get("/user/mapping", function (req, res)
{
    var locationData = [];
    console.log("passing all map");

    Location.find({}, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Finding all location");
            for (var i = 0; i < result.length; i++) {
                locationData.push(result[i]);
            }
            //console.log(locationData);
            res.send(locationData);
        }
    });
});

//finding a single location in the google map
app.get("/user/mapping/:locId", function (req, res)
{
    console.log("passing targete location");
    Location.findOne({ locId: req.params['locId'] }, function (error, result)
    {

        if (error) {
            console.log(error);
        }
        else if (result == null ) {
            console.log("Can not found the location in the seperate view map!")
            res.send("No this locations!")
        }
        else
        {
            console.log("Finding this single location!");
            res.send(result);
        }
    });
});

//Adding the favourite location to fav list.
app.post("/user/favourite", function (req, res)
{
    console.log("get in the fav list");
    var location_id;
    Location.findOne({ locId: req.body['locId'] }, function (error, doc)
    {
        //First find the locId of found location
        if (error) {
            res.send(error);
        }
        location_id = doc._id;

        doc.favLocNum += 1;

        //Then find the user information refer to the user name
        User.findOne({ username: req.body['username'] }, function (error, userdoc)
        {
            if (error) {
                res.send(error);
            }
            //To prevent the duplicated case of fav adding.
            for (prevent of userdoc.fav_loc)
            {
                console.log(prevent);
                if (prevent.toString().trim() === location_id.toString().trim())
                {
                    res.send("You have already added this location!");
                    return;
                }
            }
            doc.save();
            userdoc.favLocNum += 1;
            userdoc.fav_loc.push(location_id);
            userdoc.save();
            res.send("Favourite location stored successfully !");
        });
    });
});

//Show all the favourite location of the user.
app.get("/user/favourite/:username", function (req, res)
{
    User.find({ username: req.params['username'] })
        .populate('fav_loc')
        .exec(function (err, result)
        {
            //console.log(result);
        if (err) {
            console.log(err);
        }
        else
        {
            var table = '<table class="table table-borderless table-hover table-sm text-center text-dark mx-auto">' +
                '<thead class="thead-light"><tr>' +
                '<th>Location ID</th>' +
                '<th>Name</th>' +
                '<th>Latitude</th>' +
                '<th>Longitude</th>' +
                '<th>#Comment</th>' +
                '<th>#Favourite</th>' +
                '</tr></thead><tbody>';

            for (var i = 0; i < result[0].fav_loc.length; i++)
            {
                table += '<tr>' +
                    '<td>' + result[0].fav_loc[i].locId + '</td>' +
                    '<td>' + result[0].fav_loc[i].name + '</td>' +
                    '<td>' + result[0].fav_loc[i].latitude + '</td>' +
                    '<td>' + result[0].fav_loc[i].longitude + '</td>' +
                    '<td>' + result[0].fav_loc[i].commentNum + '</td>' +
                    '<td>' + result[0].fav_loc[i].favLocNum + '</td>' +
                    '</tr>';
            }
            table += '</tbody></table>';
            res.send(table);         
        }
    });
});

//input the comment according to the location.
app.post("/user/comment", function (req, res) {

    console.log("Comment is coming !");
    Comment.findOne({ locId: req.body['locId'] }, function (error, doc) {



    });
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
        var arr_routeIn = req.body['routeIn'];
        var arr_routeOut = req.body['routeOut'];
        var arr_routeLocIn = req.body['routeLocIn'];
        var arr_routeLocOut = req.body['routeLocOut'];
        var arr_loc = req.body['loc'];

        // store locations
        var promises;
        await (async () => {
            try{
                promises = arr_loc.map(async loc => {
                    var l = new Location(
                    {
                        locId: loc.locId,
                        name: loc.name,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        commentNum: 0,
                        favLocNum: 0
                    });
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

        // obtain location info of each inbound direction route
        var locInInfo = [];
        await (async()=>{
            for(var i = 0; i < arr_routeIn.length; i++){      //1-10 routes
                var locId_in = []; // all locId in a route
                for (var loc of arr_routeLocIn[i].loc){        //inbound
                    locId_in.push(loc.locId);
                }

                var arr_in = [];
                var j = 0;
                for (var id of locId_in){
                    await Location.findOne({locId: id})
                        .then(function(loc){
                            arr_in.push({loc: loc._id,
                                      seq: arr_routeLocIn[i].loc[j].seq});
                            j++;
                    });
                }
                locInInfo.push(arr_in);
            }
        })();

        // obtain location info of each outbound direction route
        var locOutInfo = [];
        await (async()=>{
            for(var i = 0; i < arr_routeOut.length; i++){      //1-10 routes
                var locId_out = []; // all locId in a route
                j = 0;
                for (var loc of arr_routeLocOut[i].loc){        //outbound
                    locId_out.push(loc.locId);
                }

                var arr_out = [];
                var j = 0;
                for (var id of locId_out){
                    await Location.findOne({locId: id})
                        .then(function(loc){
                            arr_out.push({loc: loc._id,
                                      seq: arr_routeLocOut[i].loc[j].seq});
                            j++;
                    });
                }
                locOutInfo.push(arr_out);
            }
        })();

        // store routes
        var i = 0;
        for await (var route of arr_routeIn){
            try{
                var r = new Route({
                    routeId: route.routeId,
                    startLocId: route.startLocId,
                    endLocId: route.endLocId,
                    stopCount: route.stopCount,
                    dir: "I",
                    locInfo: locInInfo[i]});            //locInfo[i]

                await r.save().then();
                i++;
            } catch(err){
                console.log(err);
            }
        }

        i = 0;
        for await (var route of arr_routeOut){
            try{
                var r = new Route({
                    routeId: route.routeId,
                    startLocId: route.startLocId,
                    endLocId: route.endLocId,
                    stopCount: route.stopCount,
                    dir: "O",
                    locInfo: locOutInfo[i]});            //locInfo[i]

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
                var l = new Location(
                {
                    locId: req.body['locId'],
                    name: req.body['locName'],
                    latitude: req.body['locLat'],
                    longitude: req.body['locLong'],
                    commentNum: 0,
                    favLocNum: 0
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
    Route.find({routeId: routeId})
    .sort({dir: 1})
    .populate('locInfo.loc')
    .exec(function(err, result){
        if(err){
            console.log(err);
        }
        else{
            var output = "<h3>Route ID: " + routeId + "</h3>" +
                "<h3>Route direction: Inbound</h3><br>";
            if(result[0].locInfo.length == 0){
                output += "No locations";
            }
            else{
                for(var i = 0; i < result[0].locInfo.length; i++){
                    output += "<div class='mb-3 locInfo'><b>Bus stop ID: <span>" + result[0].locInfo[i].loc.locId + "</span></b><br>" +
                    "Bus stop name: <span>" + result[0].locInfo[i].loc.name + "</span><br>" +
                    "Bus stop location (latitude, longitude): (<span>" + result[0].locInfo[i].loc.latitude + "</span>, <span>" + result[0].locInfo[i].loc.longitude + "</span>)<br>" +
                    "Bus stop sequence number: <span>" + result[0].locInfo[i].seq + "</span><br>" +
                    "Number of comments: <span>" + result[0].locInfo[i].loc.commentNum + "</span><br>" +
                    "Number of favourites: <span>" + result[0].locInfo[i].loc.favLocNum + "</span>" +
                    "</div>";
                }
            }
            output += "<br><br><h3>Route direction: Outbound</h3><br>";
            if(result[1].locInfo.length == 0){
                output += "No locations";
            }
            else{
                for(var i = 0; i < result[1].locInfo.length; i++){
                    output += "<div class='mb-3 locInfo'><b>Bus stop ID: <span>" + result[1].locInfo[i].loc.locId + "</span></b><br>" +
                    "Bus stop name: <span>" + result[1].locInfo[i].loc.name + "</span><br>" +
                    "Bus stop location (latitude, longitude): (<span>" + result[1].locInfo[i].loc.latitude + "</span>, <span>" + result[1].locInfo[i].loc.longitude + "</span>)<br>" +
                    "Bus stop sequence number: <span>" + result[1].locInfo[i].seq + "</span><br>" +
                    "Number of comments: <span>" + result[1].locInfo[i].loc.commentNum + "</span><br>" +
                    "Number of favourites: <span>" + result[0].locInfo[i].loc.favLocNum + "</span>" +
                    "</div>";
                }
            }
            res.send(output);
        }
    });
});

//update location
app.put("/admin/location", function(req,res){
    /*if(req.body['newLocId'] != undefined){
        Location.findOne({locId: req.body['newLocId']})
        .exec(function(err, nloc) {
            if (err){
                res.send(err);
            }
            else if (nloc != null){
                res.send("The Location ID already exists!");
            }
            else{
                Location.updateOne({locId: req.body['locId']},{locId: req.body['newLocId']})
                .exec(function(err, result) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send("Location ID Updated");
                    }
                });
            }
        });
    }
    else*/
    if (req.body['newLocName'] != undefined){
        Location.findOne({name: req.body['newLocName']})
        .exec(function(err, nloc) {
            if (err){
                res.send(err);
            }
            else if (nloc != null){
                res.send("The Location Name already exists!");
            }
            else{
                Location.updateOne({locId: req.body['locId']},{name: req.body['newLocName']})
                .exec(function(err, result) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        console.log(req.body['locId']);
                        console.log(req.body['newLocName']);
                        res.send("Location Name Updated");
                    }
                });
            }
        });
    }
    else if (req.body['newLocLat'] != undefined){
        Location.updateOne({locId: req.body['locId']},{latitude: req.body['newLocLat']})
        .exec(function(err, result) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("Location Latitude Updated");
            }
        });
    }
    else{
        Location.updateOne({locId: req.body['locId']},{longitude: req.body['newLocLong']})
        .exec(function(err, result) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("Location Longitude Updated");
            }
        });
    }
});

//delete location
                                                            //retrieve locations for delete
/*app.get("/admin/location_del_retr", function(req, res) {
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
                        "Location Name: <span>" + loc[i].name + "</span><br>" +
                        "Location Latitude: <span>" + loc[i].latitude + "</span><br>" +
                        "Location Longitude: <span>" + loc[i].longitude + "</span></div><br><br>";
                }
                output += "<div id='locBottom' align='right'><a href='#locTop'>Go to top.</a></div>"
                res.send(output);
            }
    })
});*/

app.delete("/admin/location", function(req,res){
    Location.findOne({locId: req.body['locId']})
    .exec(function(err, loc){
        if(err){
            console.log(err);
        }
        else{
            Route.update({"locInfo.loc": loc._id}, {$pull: {locInfo: {loc: loc._id}}, $inc: {stopCount: -1 }}, { multi: true })
            .exec(function(err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    var locId = req.body['locId'];
                    Location.remove({locId: req.body['locId']})
                    .exec(function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(loc);
                            res.send("Location " + locId + " is deleted.");
                        }
                    });
                }
            });
        }
    });
});

//write the CSV data into the location databse by the admin

app.post("/admin/csv", function (req, res)
{
    //Bug Case 1: Empty location.
    //Solved:  the empty lcoation would be skipped in the admin.js already.

    Location.findOne({ locId: req.body['locId'] }).exec(function (err, loc)
    {
        if (err) {
            res.send(err);
        }

        //Bug Case 2: Duplicated Location
        //Solved: != NULL of location.
        else if (loc != null)
        {
            res.send("The location already exists!");
        }
        else
        {
            var result = new Location(
                {
                    locId: req.body['locId'],
                    name: req.body['locName'],
                    latitude: req.body['locLat'],
                    longitude: req.body['locLong'],
                    commentNum: 0,
                    favLocNum: 0
                });
            result.save(function (error) {

                if (error) {
                    res.send(error);
                    return;
                }
                console.log("CSV Location Post by Admin successfully !");
                res.send("Create CSV location successfully!");
            });
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
	                            password: bcrypt.hashSync(req.body['password'], 8),
                                commentNum: 0,
                                favLocNum: 0
                            });
                        }
                        else {
                            u = new User({
                                userId: result.userId + 1,
                                username: req.body['username'],
                                password: bcrypt.hashSync(req.body['password'], 8),
                                commentNum: 0,
                                favLocNum: 0
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
	.select('username password commentNum favLocNum')
    .sort({userId: 1})
	.exec(function(err, users) {
		if (err)
			res.send(err);
		else if (users.length == 0)
			res.send("No users!");
		else {
			var output = "<br>";
			for(var i = 0; i < users.length; i++) {
				output += '<div class="mb-3 userInfo"><b>Username: <span>' + users[i].username + "</span></b><br>" +
				"Password: <span>" + users[i].password + "</span><br>" +
                "#Comments: <span>" + users[i].commentNum + "</span><br>" +
                "#Favourites: <span>" + users[i].favLocNum + "</span>" +
                "</div>";
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
                            res.send("Username Updated!");
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
    var del_user = req.body['username'];
    User.remove({username: req.body['username']})
    .exec(function(err, user) {
        if (err) {
            res.send(err);
        }
        else {
            res.send("User " + del_user + " is deleted!");

        }
    });
});


//Top 5 User Chart
app.get("/admin/top5", function (req, res)
{
    userName_comment = [];
    userCommentNum = [];
    userName_favLoc = [];
    userFavLocNum = [];


    User.find()                                         //comments part
    .limit(5)
    .sort({commentNum: -1})
    .exec(function(err, user) {
        if(err){
            console.log(err);
        }
        else if(user.length == 0){
            res.send("No Users!")
        }
        else
        {
            for(var u of user){
                userName_comment.push(u.username);
                userCommentNum.push(u.commentNum);
            }

            User.find()                                         //favLoc part
            .limit(5)
            .sort({favLocNum: -1})
            .exec(function(err, user) {
                if(err){
                    console.log(err);
                }
                else if(user.length == 0){
                    res.send("No Users!")
                }
                else
                {
                    for(var u of user){
                        userName_favLoc.push(u.username);
                        userFavLocNum.push(u.favLocNum);
                    }
                }
                res.send({userName_comment: userName_comment,
                          userCommentNum: userCommentNum,
                          userName_favLoc: userName_favLoc,
                          userFavLocNum: userFavLocNum});
            });

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
