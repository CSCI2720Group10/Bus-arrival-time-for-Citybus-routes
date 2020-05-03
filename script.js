$(document).ready(function() {
    var $rootBody = $('<h1>Login</h1>'
    + '<form>'
    + '<div class="form-group w-25">'
    + '<label for="name">Username</label>'
    + '<input type="text" class="form-control" id="username" name="username" required>'
    + '<label for="name">Password</label>'
    + '<input type="password" class="form-control" id="password" name="password" required>'
    + '</div>'
    + '<p id="errorMsg"></p>'
    + '<button type="submit" class="btn btn-success" id="login">Login</button>'
    + '</form>'
    + '<a id="loginAdmin" href="">Login as admin</a>');

    $(document).on("click", "#login", function(e) {
        e.preventDefault();
        $.ajax({
            url: "/login",
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

    $(document).on("keypress", "input", function(){
        $("#errorMsg").html("");
    });

	$(document).on("click", "#loginAdmin", function(e) {
        e.preventDefault();
        $.ajax({
            url: "/loginAdmin",
            type: "POST"
        })
        .done(function(res){
            $("body").html(res);
        });
    });

    $(document).on("click", "#logout", function() {
        $.ajax({
            url: "/logout",
            type: "POST"
        })
        .done(function(res){
            $("body").html($rootBody);
        });
    });

    $(document).on("click", "#logoutAdmin", function() {
        $.ajax({
            url: "/logoutAdmin",
            type: "POST"
        })
        .done(function(res){
            $("body").html($rootBody);
        });
    });
});
