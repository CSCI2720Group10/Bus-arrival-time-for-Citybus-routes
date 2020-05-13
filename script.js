$(document).ready(function() {
    history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/");

    $(window).on("popstate", function() {
        if (event.state.hasOwnProperty('content')){
            $("#content").html(event.state.content);
            $("title").html(event.state.title);
        }
    });

    $(document).on("click", "#signup", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./signup",
            type: "GET"
        })
        .done(function(res){
            $("body").load(res + " #content", function(){
                $("title").html("Sign Up");
                history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/signup.html");
            });
        });
    });

    $(document).on("click", "#signupSubmit", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./signup",
            type: "POST",
            data: {username: $("#username").val(),
                   password: $("#password").val(),
                   repeatPassword: $("#repeatPassword").val()}
        })
        .done(function(res){
            if(res == "/root.html"){
                $("body").load(res + " #content", function(){
                    $("#msg").html("Sign up successful!");
                    $("title").html("Login");
                    history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/");
                });
            }
            else{
                $("#msg").html(res);
            }
        });
    });

    $(document).on("click", "#login", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./",
            type: "GET"
        })
        .done(function(res){
            var $temp = $('<div></div>').append(res);
            $("#content").html($temp.find("#content").html());
            $("title").html("Login");
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/");
        });
    });

    $(document).on("click", "#loginUser", function(e) {
        e.preventDefault();
        var user = $("#username").val();
        $.ajax({
            url: "./login",
            type: "POST",
            data: {username: $("#username").val(),
                   password: $("#password").val()}
        })
        .done(function(res){
            if(res[0] == '<'){
                var $temp = $('<div></div>').append(res);
                $("#content").html($temp.find("#content").html());
                $("title").html("Home");
                $("#userName").html(user);
                history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/user.html");
            }
            else{
                $("#msg").html(res);
            }
        });
    });

    $(document).on("keypress", ".inputBox", function(){
        $("#msg").html("");
    });

	$(document).on("click", "#loginAdmin", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./loginAdmin",
            type: "POST"
        })
        .done(function(res){
            $("body").load(res + " #content", function(){
                $("title").html("Admin Home");
                history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/admin.html");
            });
        });
    });

    $(document).on("click", "#logout", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./logout",
            type: "POST"
        })
        .done(function(res){
			/*res = res.split("body");
			res = res[1].slice(1, res[1].length - 2);
            $("body").html(res);*/
            $("body").load(res + " #content", function(){
                $("title").html("Login");
                history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/");
            });
        });
    });

    $(document).on("click", "#logoutAdmin", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./logoutAdmin",
            type: "POST"
        })
        .done(function(res){
			/*res = res.split("body");
			res = res[1].slice(1, res[1].length - 2);
            $("body").html(res);*/
            $("body").load(res + " #content", function(){
                $("title").html("Login");
                history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/");
            });
        });
    });
});
