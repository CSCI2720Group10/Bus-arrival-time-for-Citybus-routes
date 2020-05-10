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
    var data = [];
    var promises;

    try{
        promises = routes.map(async route => {
            return await $.ajax({
                url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/" + route + "/inbound",
                type: "GET"
            })
            .done(function(res){
                data.push(res.data);
            });
        });
        for(var p of promises) {
            await p;
        }
    } catch(err) {
        console.log(err);
    }

    return data;
}

async function getLoc(arr_locId){                    //get all locations
    var data = [];
    var promises;

    try{
        promises = arr_locId.map(async locId => {
            return await $.ajax({
                url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/" + locId,
                type: "GET"
            })
            .done(function(res){
                data.push(res.data);
            });
        });
        for(var p of promises) {
            await p;
        }
    } catch(err) {
        console.log(err);
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

    let routeLoc;
    let loc; // 1D array of location data
    try{
        routeLoc = await getRouteLoc();

        // get all non-duplicate locId
        var arr_locId = [];
        for(var locs of routeLoc){
            for(var l of locs){
                if (!arr_locId.includes(l.stop)) {
                    arr_locId.push(l.stop);
                }
            }
        }

        loc = await getLoc(arr_locId);
    } catch(err) {
        console.log(err);
    }

    console.log(routeLoc);
    console.log(loc);

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
            arr.push({
                locId: routeLoc[i][j].stop,
                dir: routeLoc[i][j].dir,
                seq: routeLoc[i][j].seq});
        }

        routeLocData.push({routeId : routes[i],
                           loc: arr});
    }
    console.log(routeData);
    console.log(routeLocData);
    for(var i = 0; i < loc.length; i++){
        locData.push({locId : loc[i].stop,
                      name: loc[i].name_en,
                      latitude: loc[i].lat,
                      longitude: loc[i].long});
    }
    console.log(locData);

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

        $("#adminContent").load("/admin.html #adminContent", function(){
            $("title").html("Admin Home");
            history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/admin.html");
        });
    });

                                                                        //create location
    $(document).on("click", "#createLoc", function(e){
        e.preventDefault();
        changeNavbar($("#createLoc"));

        var content = '<h1>Create Location</h1>' +
			'<form>' +
            '<div class="form-group">' +
            '<label for="name">Location ID</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="locId" name="locId" required>' +
            '<label for="name">Location Name (in English)</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="locName" name="locName" required>' +
            '<label for="name">Location Latitude</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="locLat" name="locLat" required>' +
            '<label for="name">Location Longitude</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="locLong" name="locLong" required>' +
            '</div>' +
            '<p id="msg"></p>'+
            '<button type="submit" class="btn btn-success" id="createLocBtn">Create</button>' +
			'</form>';
        $("title").html("Create Location");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/create_location.html");
    });

    $(document).on("click", "#createLocBtn", function(e){
        e.preventDefault();
        $("#msg").removeClass("text-success");

        $.ajax({
            url: "./admin/location",
            type: "POST",
            data: {locId: $("#locId").val(),
                  locName: $("#locName").val(),
                  locLat: $("#locLat").val(),
                  locLong: $("#locLong").val()
                  }
        })
        .done(function(res){
            if(res == "Create location successfully!"){
                $("#msg").addClass("text-success");
                $("form").trigger("reset");
            }
            $("#msg").html(res);
        });
    });


                                                                        //retrieve locations
    $(document).on("click", "#retrieveLoc", function(e){
        e.preventDefault();
        changeNavbar($("#retrieveLoc"));

        var content = '<h1>Retrieve Location</h1>' +
			'<form>' +
            '<div class="form-group">' +
            '<label for="name">Which route\'s locations you want to retrieve (' + routes.join(', ') + ')?</label>' +
            '<input type="text" style="width: 300px" class="form-control inputBox" id="routeId" name="routeId" required>' +
            '</div>' +
            '<p id="msg"></p>'+
            '<button type="submit" class="btn btn-success" id="retrieveLocBtn">Retrieve</button>' +
			'</form>' +
            '<div id="result"></div>';
        $("title").html("Retrieve Location");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/retrieve_location.html");
    });

    $(document).on("click", "#retrieveLocBtn", function(e){
        e.preventDefault();
        $("#msg").removeClass("text-success");

        $.ajax({
            url: "./admin/location?routeId=" + $("#routeId").val(),
            type: "GET"
        })
        .done(function(res){
            if(res[0] == "<"){
                $("#result").html(res);
                $("form").trigger("reset");
            }
            else{
                $("#msg").html(res);
            }
        });
    });

    $(document).on("click", "#updateLoc", function(e){
        e.preventDefault();
        changeNavbar($("#updateLoc"));
    });

                                                                        //delete location
    $(document).on("click", "#deleteLoc", function(e){
        e.preventDefault();
        changeNavbar($("#deleteLoc"));

        $.ajax({
            url: "./admin/location_del_retr",
            type: "GET"
        })
        .done(function(res){
            $("title").html("Delete Location");
            $("#adminContent").html("<h1 id='locTop'>Location Information</h1>" +
                                    "<div align='right'><a href='#locBottom'>Go to bottom</a></div>" + res);
            $(".locInfo").append('<br><button type="button" class="btn btn-warning deleteLocBtn">Delete Location</button>');
            history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/delete_location.html");
        });
    });


    $(document).on("click", ".deleteLocBtn", function(){
        var $this = $(this);
        var locId = $(this).parent().find("span").html();
        $.ajax({
            url: "./admin/location",
            type: "DELETE",
            data: {locId: locId}
        })
        .done(function(res){
            $this.parent().remove();
        });
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
            '<button type="submit" class="btn btn-success" id="createUserBtn">Create</button>' +
			'</form>';
        $("title").html("Create User");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/create_user.html");
    });

    $(document).on("click", "#createUserBtn", function(e){
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
            $(".userInfo").append('<br><button type="button" class="btn btn-warning deleteUserBtn">Delete user</button>');
            history.pushState({content: $("#content").html(), nav: $("nav").html(), title: $("title").html()}, null, "/delete_user.html");
        });
    });

    $(document).on("click", ".deleteUserBtn", function(){
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

        var 


    });
});
