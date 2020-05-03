const express = require ('express');
const app = express();

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
	userName: { type: String, required: true },
	password: { type: String, required: true },
	fav_locId: [{ type: Number, required: true }],
	fav_routeId: { type: Number, required: true },
	searchHistory: { type: String, required: true },
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

app.all("/",function(req,res)
{
	res.send("Welcome to VM !");
});

const server = app.listen(2064);
