$(document).ready(function() {
    $("#login").on("click", function(e) {
        e.preventDefault();
        $.ajax({
            url: "http://localhost:3000/login",
            type: "POST",
            data: {username: $("#username").val(),
                   password: $("#password").val()}
        })
        .done(function(res){
            if(res == "empty"){
                $("#errorMsg").html("Please enter Username and Password!");
            }
            else if(res == "fail"){
                $("#errorMsg").html("Wrong username/password!");
            }
            else{
               $("body").html(res);
            }
        });
    });

    $("input").on("keypress", function(){
        $("#errorMsg").html("");
    });

	$("#adminLogin").on("click", function(e) {
        e.preventDefault();
        $.ajax({
            url: "http://localhost:3000/admin",
            type: "POST"
        })
        .done(function(res){
            $("body").html(res);
        });
    });
});
