const routes = [20, 22, 70, 117, 260, 307, 592, 608, 681, 969];

async function getRoute(){                                      //get details for each route
    let data = [];
    for(var r of routes){
        try {
            await $.ajax({
                url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/CTB/" + r,
                type: "GET"
            })
            .done(function(res){
                data.push(res.data);
            });
        } catch (err) {
            console.log(err);
        }
    }
    return data;
}

async function getRouteLoc(){                                   //get all locations in each route
    let data = [];
    for(var r of routes){
        try {
            await $.ajax({
                url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/" + r + "/inbound",
                type: "GET"
            })
            .done(function(res){
                data.push(res.data);
            });
        } catch (err) {
            console.log(err);
        }
    }
    return data;
}

async function getLoc(routeLoc){                    //get all locations details in each route
    let data = [];
    for(var loc of routeLoc){                       //for every series of locations in each route
        let arr = [];
        for(var l of loc){                          //for every locations in that series
            try {
                await $.ajax({
                    url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/" + l.stop,
                    type: "GET"
                })
                .done(function(res){
                    arr.push(res.data);
                });
            } catch (err) {
                console.log(err);
            }
        }
        data.push(arr);
    }
    return data;
}

async function getETA(routeLoc){                    //get the ETA info for each loc in each route
    let data = [];
    let i = 0;                                      //from the first route
    for(var loc of routeLoc){                       //all the location series
        let arr = [];
        for(var l of loc){                          //all the locations in that series
            try {
                await $.ajax({
                    url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/CTB/" + l.stop+ "/" + routes[i],
                    type: "GET"
                })
                .done(function(res){
                    arr.push(res.data);
                });
            } catch (err) {
                console.log(err);
            }
        }
        data.push(arr);
        i++;
    }
    return data;
}

async function flushData(){
    $("#msg").removeClass("text-success");
    $("#msg").html("Flushing...");
    let routeLoc = await getRouteLoc();
    let loc = await getLoc(routeLoc);

    let routeData = [];
    let routeLocData = [];
    let locData = [];

    for(var i = 0; i < 10; i++){
        let arr = [];
        routeData.push({routeId : routes[i],
                        startLocId: routeLoc[i][0].stop,
                        endLocId: routeLoc[i][routeLoc[i].length - 1].stop,
                        stopCount: routeLoc[i].length});

        for(var j = 0; j < routeLoc[i].length; j++){
            locData.push({locId : routeLoc[i][j].stop,
                          name: loc[i][j].name_en,
                          latitude: loc[i][j].lat,
                          longitude: loc[i][j].long});

            arr.push({
                locId: routeLoc[i][j].stop,
                dir: routeLoc[i][j].dir,
                seq: routeLoc[i][j].seq});
        }

        routeLocData.push({routeId : routes[i],
                           loc: arr});
    }

    try {
        await $.ajax({
            url: "./admin/flush",
            type: "POST",
            data: {route: routeData,
                   routeLoc: routeLocData,
                   loc: locData}
        })
        .done(function(res){
            $("#msg").addClass("text-success");
            $("#msg").html(res);
        });
    } catch (err) {
        console.log(err);
    }
}

function changeNavbar($clickedLink){
    var $otherLinks = $("nav > div > a, nav div.dropdown-menu > a").not($clickedLink);
    $otherLinks.removeClass("disabled");
    $otherLinks.removeClass("text-danger");
    $otherLinks.addClass("text-success");
    $clickedLink.addClass("disabled");
    $clickedLink.addClass("text-danger");
}

$(document).ready(function() {
    $(document).on("click", "#flush", async function(){ await flushData()});

    $(document).on("click", "#adminHome", function(e){
        e.preventDefault();
        changeNavbar($("#adminHome"));

        $("#adminContent").load("/admin.html #adminContent");
    });

    $(document).on("click", "#createLoc", function(e){
        e.preventDefault();
        changeNavbar($("#createLoc"));
    });

    $(document).on("click", "#retrieveLoc", function(e){
        e.preventDefault();
        changeNavbar($("#retrieveLoc"));
    });

    $(document).on("click", "#updateLoc", function(e){
        e.preventDefault();
        changeNavbar($("#updateLoc"));
    });

    $(document).on("click", "#deleteLoc", function(e){
        e.preventDefault();
        changeNavbar($("#deleteLoc"));
    });

                                                                        //create users
    $(document).on("click", "#createUser", function(e){
        e.preventDefault();
        changeNavbar($("#createUser"));

        var content = '<h1>Create User</h1>' +
			'<form>' +
            '<div class="form-group">' +
            '<label for="name">Username(between 4 and 20 charcters)</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="username" name="username" required>' +
            '<label for="name">Password(between 4 and 20 charcters)</label>' +
            '<input type="password" style="width: 300px" class="form-control inputBox" id="password" name="password" required>' +
            '</div>' +
            '<p id="msg"></p>'+
            '<button type="submit" class="btn btn-success" id="create">Create</button>' +
			'</form>';
        $("title").html("Create User");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/create_user.html");
    });

    $(document).on("click", "#create", function(e){
        e.preventDefault();
        $("#msg").removeClass("text-success");

        $.ajax({
            url: "./admin/user",
            type: "POST",
            data: {username: $("#username").val(),
                   password: $("#password").val()}
        })
        .done(function(res){
            if(res == "Create user successfully!"){
                $("#msg").addClass("text-success");
                $("form").trigger("reset");
            }
            $("#msg").html(res);
        });
    });

                                                                        //retrieve users
    $(document).on("click", "#retrieveUser", function(e){
        e.preventDefault();
        changeNavbar($("#retrieveUser"));

        $.ajax({
            url: "./admin/user",
            type: "GET"
        })
        .done(function(res){
            $("title").html("Retrieve User");
            $("#adminContent").html("<h1>User Information</h1>" + res);
            history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/retrieve_user.html");
        });
    });

                                                                        //update users
    $(document).on("click", "#updateUser", function(e){
        e.preventDefault();
        changeNavbar($("#updateUser"));

        $.ajax({
            url: "./admin/user",
            type: "GET"
        })
        .done(function(res){
            $("title").html("Update User");
            $("#adminContent").html("<h1>User Information</h1>" + res);
            $(".userInfo").append('<br><button type="button" class="btn btn-warning editUsername mr-3">Edit username</button><button type="button" class="btn btn-warning editPassword">Edit password</button>');
            history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/update_user.html");
        });
    });

    $(document).on("click", ".editUsername ", function(){
        var newUsername = prompt("Please enter the new username");
        if(newUsername != null){
            var $this = $(this);
            var username = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/user",
                type: "PUT",
                data: {username: username,
                       newUsername: newUsername}
            })
            .done(function(res){
                if(res != ""){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(0).html(newUsername);
                }
            });
        }
    });

    $(document).on("click", ".editPassword", function(){
        var newPassword = prompt("Please enter the new password");
        if(newPassword != null){
            var $this = $(this);
            var username = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/user",
                type: "PUT",
                data: {username: username,
                       newPassword: newPassword}
            })
            .done(function(res){
                if(res[0] != "$"){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(1).html(res);
                }
            });
        }
    });

                                                                        //delete users
    $(document).on("click", "#deleteUser", function(e){
        e.preventDefault();
        changeNavbar($("#deleteUser"));

        $.ajax({
            url: "./admin/user",
            type: "GET"
        })
        .done(function(res){
            $("title").html("Delete User");
            $("#adminContent").html("<h1>User Information</h1>" + res);
            $(".userInfo").append('<br><button type="button" class="btn btn-warning delete">Delete user</button>');
            history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/delete_user.html");
        });
    });

    $(document).on("click", ".delete", function(){
        var $this = $(this);
        var username = $(this).parent().find("span").eq(0).html();
        $.ajax({
            url: "./admin/user",
            type: "DELETE",
            data: {username: username}
        })
        .done(function(res){
            $this.parent().remove();
        });
    });


    $(document).on("click", "#createLocData", function(e){
        e.preventDefault();
        changeNavbar($("#createLocData"));
    });
});
