const express = require ('express');
const app = express();

app.all("/",function(req,res)
{
	res.send("Welcome to VM !");
});

const server= app.listen(2064);
