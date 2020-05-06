$(document).ready(function() {
    history.replaceState({content: $("body").html(), title: $("title").html()}, null, "\\");

    $(window).on("popstate", function() {
        if (event.state.hasOwnProperty('file')){
            $("body").load(event.state.file + " #content");
            $("title").html(event.state.title);
        }
        else{
            $("body").html(event.state.content);
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
            /*res = res.split("body");
            res = res[1].slice(1, res[1].length - 2);
            $("body").html(res);*/
            $("body").load(res + " #content");
            $("title").html("Sign Up");
            history.pushState({file: res, title: $("title").html()}, null, res);
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
				/*res = res.split("body");
				res = res[1].slice(1, res[1].length - 2);
				$("body").html(res);*/
                $("body").load(res + " #content");
                $("#msg").html("Sign up successful!");
                $("title").html("Login");
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
			res = res.split("body");
			res = res[1].slice(1, res[1].length - 2);
            $("body").html(res);
            $("title").html("Login");
            history.pushState({content: res, title: $("title").html()}, null, "\\");
        });
    });

    $(document).on("click", "#loginUser", function(e) {
        e.preventDefault();
        $.ajax({
            url: "./login",
            type: "POST",
            data: {username: $("#username").val(),
                   password: $("#password").val()}
        })
        .done(function(res){
            if(res == "/user.html"){
				/*res = res.split("body");
				res = res[1].slice(1, res[1].length - 2);
				$("body").html(res);*/
                $("body").load(res + " #content");
                $("title").html("Home");
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
            /*res = res.split("body");
			res = res[1].slice(1, res[1].length - 2);
            $("body").html(res);*/
            $("body").load(res + " #content");
            $("title").html("Admin Home");
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
            $("body").load(res + " #content");
            $("title").html("Login");
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
            $("body").load(res + " #content");
            $("title").html("Login");
        });
    });
});
