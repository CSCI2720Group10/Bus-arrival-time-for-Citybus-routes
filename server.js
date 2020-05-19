/*
Kwan Tsz Fung		        1155078864
Lee Kwan Hung		        1155108603
Wong Ching Yeung Wallace 	1155093534
Choi Chun Wa                1155094180
*/

const express = require ('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb' ,extended: true}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit: 1000000}));

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
    longitude: { type: Number, required: true }
});
var Location = mongoose.model('Location', LocationSchema);

//User Schema
var UserSchema = mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fav_locId: [{ type: String }],
    commentNum: { type: Number, required: true },
    favLocNum: { type: Number, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
});
var User = mongoose.model('User', UserSchema);

                                                                  //Route Schema
var RouteSchema = mongoose.Schema({
	routeId: { type: String, required: true },
	stopCount: { type: Number, required: true },
    dir: { type: String, required: true },
    locInfo: [{ loc: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
                seq: { type: Number, required: true } }]
});
var Route = mongoose.model('Route', RouteSchema);

                                                                //Comment Schema
var CommentSchema = mongoose.Schema({
	commentId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    username:{type:String},                          //Adding user name for comment finding
	content: { type: String, required: true },
	locId: { type: String, required: true },
    time: { type: String, required: true }
});
var Comment= mongoose.model('Comment', CommentSchema);

// RESTful API
app.get("/api/locations", function (req, res) {
    if(req.headers.authorization == "Bearer csci2720"){
        Location.find()
        .exec(function(err, loc){
            if(err){
                res.send(err);
            }
            else if(loc == null){
                res.send("No locations!");
            }
            else {
                var output = "";
                for(var l of loc){
                    output += "<location><name>" + l.name + "</name>" +
                    "<id>" + l.locId + "</id>" +
                    "<latitude>" + l.latitude + "</latitude>" +
                    "<longitude>" + l.longitude + "</longitude></location>"
                }
                res.send(output);
            }
        });
    }
    else{
        res.status(401).send();
    }
});

app.post("/api/locations", function(req,res){
    if(req.headers.authorization == "Bearer csci2720"){

    }
    else{
        res.status(401).send();
    }
});

app.get("/api/locations/:locId", function(req,res){
    if(req.headers.authorization == "Bearer csci2720"){
        Location.findOne({locId: req.params['locId']})
        .exec(function(err, loc){
            if(err){
                res.send(err);
            }
            else if(loc == null){
                res.send("No locations!");
            }
            else {
                var output = "<location><name>" + loc.name + "</name>" +
                "<id>" + loc.locId + "</id>" +
                "<latitude>" + loc.latitude + "</latitude>" +
                "<longitude>" + loc.longitude + "</longitude></location>"
            }

            res.send(output);
        });
    }
    else{
        res.status(401).send();
    }
});

app.put("/api/locations/:locId", function(req,res){
    if(req.headers.authorization == "Bearer csci2720"){

    }
    else{
        res.status(401).send();
    }
});

app.delete("/api/locations/:locId", function(req,res){
    if(req.headers.authorization == "Bearer csci2720"){

    }
    else{
        res.status(401).send();
    }
});

const server = app.listen(2064);
