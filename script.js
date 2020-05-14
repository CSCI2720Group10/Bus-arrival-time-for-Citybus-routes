$(document).ready(function() {
    if($("title").html() == "Bus arrival time for Citybus Routes APP")
       history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/");
    else if($("title").html() == "Home")
        history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/user.html");
    else if($("title").html() == "Admin Home")
        history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/admin.html");

    $(window).on("popstate", function() {
        if (event.state.hasOwnProperty('content')){
            $("#content").html(event.state.content);
            $("title").html(event.state.title);
        }
    });

    $(document).on("click", "#about", function(e) {
        e.preventDefault();
        content = '<h1>About This Project</h1>' +
            '<br>' +
            '<h4><u>Group Members (Group 10)</u></h4>' +
            '<pre>Kwan Tsz Fung		        1155078864\n' +
            'Lee Kwan Hung		        1155108603\n' +
            'Wong Ching Yeung Wallace 	1155093534\n' +
            'Choi Chun Wa                    1155094180</pre>' +
            '<br>' +

            '<h4><u>Workload distribution</u></h4>' +
            'Kwan Tsz Fung: user action#4, 6, admin action#1, 2, 3, charting statistics in admin view<br>' +
            'Lee Kwan Hung: user action#1, 3, admin action#1, 2, 3, 5, non-user action#1, 2, charting statistics in user view<br>' +
            'Together: Debug, design different schemas, demo practice' +
            '<br><br>' +

            '<h4><u>"How to"</u></h4>' +
            '<b>Login page:</b><br>' +
            '-sign in form		(sign in as user)<br>' +
            '-sign up link<br>' +
            '-admin login link	(sign in as admin)<br>' +
            '-About this Proj<br>' +

            '<br><b>Sign in as User:</b><br>' +
            '-Home Page<br>' +
            '(Showing overall locations and separate view locations in map)<br>' +
            '-Location<br>' +
            '(List locations in table, Search locations)<br>' +
            '-See Favourite Locations<br>' +
            '(List favourite locations in table)<br>' +
            '-See Top 5 Locations<br>' +
            '(Bar Chart and Pie Chart showing locations with most comments)<br>' +
            '-Username at top right corner<br>' +
            '(With a dropdown "Logout" which will return to Login Page)<br>' +

            '<br><b>Sign in as Admin:</b><br>' +
            '-Home Page<br>' +
            '(A welcome notice and a flush data function)<br>' +
            '-Location<br>' +
            '(Create, Retrieve, Update and Delete operations of location data)<br>' +
            '-User<br>' +
            '(Create, Retrieve, Update and Delete operations of user data)<br>' +
            '-Create Location Data<br>' +
            '(Import location data by uploading a format-satisfying .csv file)<br>' +
            '-Top 5 Users<br>' +
            '(Showing top 5 active users with most comments and most favourite locations in two bar charts)<br>' +
            '-Logout<br>' +
            '(Return to Login Page)<br><br>' +

            '<h4><u>Data Schemas</u></h4>' +
            '<table class="table table-hover table-sm text-dark w-50">' +
            '<thead class="thead-light">' +
                '<tr>' +
                    '<td>Location</td>' +
                    '<td><ul>' +
                        '<li>locId: String</li>' +
                        '<li>name: String</li>' +
                        '<li>latitude: Number</li>' +
                        '<li>longitude: Number</li>' +
                    '</ul></td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Route</td>' +
                    '<td><ul>' +
                        '<li>routeId: String</li>' +
                        '<li>stopCount: Number</li>' +
                        '<li>dir: String</li>' +
                        '<li>locInfo: {loc: ObjectId to Location, seq: Number}</li>' +
                    '</ul></td>' +
                '</tr>' +
                '<tr>' +
                    '<td>User</td>' +
                    '<td><ul>' +
                        '<li>userId: Number</li>' +
                        '<li>username: String</li>' +
                        '<li>password: String</li>' +
                        '<li>fav_locId: Array of String</li>' +
                        '<li>commentNum: Number</li>' +
                        '<li>favLocNum: Number</li>' +
                        '<li>homeLoc: {latitude: Numebr, longitude: Number}</li>' +
                    '</ul></td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Comment</td>' +
                    '<td><ul>' +
                        '<li>commentId: Number</li>' +
                        '<li>userId: Number</li>' +
                        '<li>username: String</li>' +
                        '<li>content: String</li>' +
                        '<li>locId: String</li>' +
                        '<li>time: String</li>' +
                    '</ul></td>' +
                '</tr>' +
            '</table>' +

            '<h4><u>Technologies and Libraries</u></h4>' +
            '<br><br>' +
            '<b><u>We have read this article in http://www.cuhk.edu.hk/policy/academichonesty carefully.</u></b>';
        $("#content").html(content);
        $("title").html("About This Project");
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/about.html");
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
                    $("title").html("Bus arrival time for Citybus Routes APP");
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
            $("title").html("Bus arrival time for Citybus Routes APP");
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
            .done(function (res) {

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
                $("title").html("Bus arrival time for Citybus Routes APP");
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
                $("title").html("Bus arrival time for Citybus Routes APP");
                history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/");
            });
        });
    });
});
