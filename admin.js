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

async function getRouteLoc_in(){                                   //get all locations in each route
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

async function getRouteLoc_out(){                                   //get all locations in each route
    var data = [];
    var promises;

    try{
        promises = routes.map(async route => {
            return await $.ajax({
                url: "https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/" + route + "/outbound",
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

    let routeLoc_in;
    let routeLoc_out;
    let loc; // 1D array of location data
    try{
        routeLoc_in = await getRouteLoc_in();
        routeLoc_out = await getRouteLoc_out();

        // get all non-duplicate locId
        var arr_locId = [];
        for(var locs of routeLoc_in){       //inbound
            for(var l of locs){
                if (!arr_locId.includes(l.stop)) {
                    arr_locId.push(l.stop);
                }
            }
        }
        for(var locs of routeLoc_out){      //outound
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

    let routeInData = [];
    let routeOutData = [];
    let routeLocInData = [];
    let routeLocOutData = [];
    let locData = [];

    for(var i = 0; i < 10; i++){
        let arr_in = [];
        let arr_out = [];
        let arr = [];

        routeInData.push({routeId : routeLoc_in[i][0].route,
                        startLocId: routeLoc_in[i][0].stop,
                        endLocId: routeLoc_in[i][routeLoc_in[i].length - 1].stop,
                        stopCount: routeLoc_in[i].length});

        routeOutData.push({routeId : routeLoc_out[i][0].route,
                        startLocId: routeLoc_out[i][0].stop,
                        endLocId: routeLoc_out[i][routeLoc_out[i].length - 1].stop,
                        stopCount: routeLoc_out[i].length});

        for(var j = 0; j < routeLoc_in[i].length; j++){
            arr_in.push({
                locId: routeLoc_in[i][j].stop,
                seq: routeLoc_in[i][j].seq});
        }
        for(var j = 0; j < routeLoc_out[i].length; j++){
            arr_out.push({
                locId: routeLoc_out[i][j].stop,
                seq: routeLoc_out[i][j].seq});
        }
        arr.push(arr_in);
        arr.push(arr_out);

        routeLocInData.push({routeId : routeLoc_in[i][0].route,
                             loc: arr_in});
        routeLocOutData.push({routeId : routeLoc_out[i][0].route,
                              loc: arr_out});
    }
    for(var i = 0; i < loc.length; i++){
        locData.push({locId : loc[i].stop,
                      name: loc[i].name_en,
                      latitude: loc[i].lat,
                      longitude: loc[i].long});
    }
    console.log(routeInData);
    console.log(routeOutData);
    console.log(routeLocInData);
    console.log(routeLocOutData);
    console.log(locData);

    try {
        await $.ajax({
            url: "./admin/flush",
            type: "POST",
            data: {routeIn: routeInData,
                   routeOut: routeOutData,
                   routeLocIn: routeLocInData,
                   routeLocOut: routeLocOutData,
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
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/create_location.html");
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

        var selectMenu = '<option value="" hidden selected">Select Route</option>';
        for(var route of routes){
            selectMenu += '<option value="' + route + '">' + route + '</option>';
        }

        var content = '<h1>Retrieve Location</h1>' +
			'<form>' +
            '<div class="form-group">' +
            '<label for="name">Which route\'s locations you want to retrieve?</label>' +
            '<br><select id="retrieveLocSelectMenu" style="width: 300px" class="custom-select">' +
            selectMenu +
            '</select>' +
            '</div>' +
			'</form>' +
            '<div id="result"></div>';
        $("title").html("Retrieve Location");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/retrieve_location.html");
    });

    $(document).on("change", "#retrieveLocSelectMenu", function(e){
        $.ajax({
            url: "./admin/location?routeId=" + e.target.value,
            type: "GET"
        })
        .done(function(res){
            $("#result").html(res);
            $("form").trigger("reset");
        });
    });

                                                                        //update location
    $(document).on("click", "#updateLoc", function(e){
        e.preventDefault();
        changeNavbar($("#updateLoc"));

        /*$.ajax({
            url: "./admin/location",
            type: "GET"
        })
        .done(function(res){
            $("title").html("Update Location");
            $("#adminContent").html("<h1>Location Information</h1>" +
                                    "<div align='right'><a href='#locBottom'>Go to bottom</a></div>" + res);
            $(".locInfo").append('<br><button type="button" class="btn btn-warning editLocId mr-3">Edit Location ID</button>' +
                                  '<button type="button" class="btn btn-warning editLocName mr-3">Edit Location Name</button>'
                                 //+ '<button type="button" class="btn btn-warning editLocLat mr-3">Edit Location Latitude</button>' +
                                 // '<button type="button" class="btn btn-warning editLocLong">Edit Location Longitude</button>'
                                 );
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/update_location.html");
        });*/
        var selectMenu = '<option value="" hidden selected">Select Route</option>';
        for(var route of routes){
            selectMenu += '<option value="' + route + '">' + route + '</option>';
        }

        var content = '<h1>Update Location</h1>' +
            '<form>' +
            '<div class="form-group">' +
            '<label for="name">Which route\'s locations you want to update?</label>' +
            '<br><select id="updateLocSelectMenu" style="width: 300px" class="custom-select">' +
            selectMenu +
            '</select>' +
            '</div>' +
            '</form>' +
            '<div id="result"></div>';
        $("title").html("Update Location");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/update_location.html");
    });

    $(document).on("change", "#updateLocSelectMenu", function(e){
        $.ajax({
            url: "./admin/location?routeId=" + e.target.value,
            type: "GET"
        })
        .done(function(res){
            $("#result").html(res);
            $("form").trigger("reset");
            $(".locInfo").append('<br><button type="button" class="btn btn-warning editLocId mr-3">Edit Location ID</button>' +
                                 '<button type="button" class="btn btn-warning editLocName mr-3">Edit Location Name</button>' +
                                 '<button type="button" class="btn btn-warning editLocLat mr-3">Edit Location Latitude</button>' +
                                 '<button type="button" class="btn btn-warning editLocLong">Edit Location Longitude</button>');
        });
    });

    $(document).on("click", ".editLocId", function(){
        var newLocId = prompt("Please enter the new location ID");
        if(newLocId != null){
            var $this = $(this);
            var locId = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/location",
                type: "PUT",
                data: {locId: locId,
                       newLocId: newLocId}
            })
            .done(function(res){
                if(res != "Location ID Updated"){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(0).html(newLocId);
                    alert(res);
                }
            });
        }
    });

    $(document).on("click", ".editLocName", function(){
        var newLocName = prompt("Please enter the new location name");
        if(newLocName != null){
            var $this = $(this);
            var locId = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/location",
                type: "PUT",
                data: {locId: locId,
                       newLocName: newLocName}
            })
            .done(function(res){
                if(res != "Location Name Updated"){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(1).html(newLocName);
                    alert(res);
                }
            });
        }
    });

    $(document).on("click", ".editLocLat", function(){
        var newLocLat = prompt("Please enter the new latitude");
        if(newLocLat != null){
            var $this = $(this);
            var locId = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/location",
                type: "PUT",
                data: {locId: locId,
                       newLocLat: newLocLat}
            })
            .done(function(res){
                if(res != "Location Latitude Updated"){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(2).html(newLocLat);
                    alert(res);
                }
            });
        }
    });

    $(document).on("click", ".editLocLong", function(){
        var newLocLong = prompt("Please enter the new longitude");
        if(newLocLong != null){
            var $this = $(this);
            var locId = $this.parent().find("span").eq(0).html();
            $.ajax({
                url: "./admin/location",
                type: "PUT",
                data: {locId: locId,
                       newLocLong: newLocLong}
            })
            .done(function(res){
                if(res != "Location Longitude Updated"){
                    alert(res);
                }
                else{
                    $this.parent().find("span").eq(3).html(newLocLong);
                    alert(res);
                }
            });
        }
    });

                                                                        //delete location
    $(document).on("click", "#deleteLoc", function(e){
        e.preventDefault();
        changeNavbar($("#deleteLoc"));

        var selectMenu = '<option value="" hidden selected">Select Route</option>';
        for(var route of routes){
            selectMenu += '<option value="' + route + '">' + route + '</option>';
        }

        var content = '<h1>Delete Location</h1>' +
			'<form>' +
            '<div class="form-group">' +
            '<label for="name">Which route\'s locations you want to delete?</label>' +
            '<br><select id="deleteLocSelectMenu" style="width: 300px" class="custom-select">' +
            selectMenu +
            '</select>' +
            '</div>' +
			'</form>' +
            '<div id="result"></div>';
        $("title").html("Delete Location");
        $("#adminContent").html(content);
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/delete_location.html");
    });

    $(document).on("change", "#deleteLocSelectMenu", function(e){
        $.ajax({
            url: "./admin/location?routeId=" + e.target.value,
            type: "GET"
        })
        .done(function(res){
            $("#result").html(res);
            $("form").trigger("reset");
            $(".locInfo").append('<br><button type="button" class="btn btn-warning deleteLocBtn">Delete Location</button>');
        });
    });

    $(document).on("click", ".deleteLocBtn", function(){
        var $this = $(this);
        var locId = $(this).parent().find("span").eq(0).html();

        $.ajax({
            url: "./admin/location",
            type: "DELETE",
            data: {locId: locId}
        })
        .done(function(res){
            alert(res);
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
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/create_user.html");
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
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/retrieve_user.html");
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
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/update_user.html");
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
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/delete_user.html");
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
            alert(res);
            $this.parent().remove();
        });
    });

                                                                        //CSV Location Import
    $(document).on("click", "#createLocData", function (e)
    {
        e.preventDefault();
        changeNavbar($("#createLocData"));
        var locDataForm = '<div class="container" >'+
           '<h1>Create the Location Data</h1>' +
            '<h4>Please follow the structure below:</h4>'+
            '<h4>DateFeature: |Location ID | Location Name | Location Latitude | Location Longitude | </h4>'+
            '<img src="CSV_format.PNG" alt="Format of CSV file" width="50%" height ="50%" >'+
            '<h6>Reminder:<br><i>1. The Location name should  <strong>not</strong> include any "," <br>2. Location ID should be a 6-unit string of value.</i></h6>'+
            '<form class="form-inline">' +
                '<div class="form-group">' +
                    '<label for="files">Please Upload a CSV file here: <br></label>' +
                    '<input type="file" id="files" class="form-control" accept=".csv" required />' +
                '</div>' +
                 '<div class="form-group">' +
                    '<button type="submit" id="submit-file" class="btn btn-primary">Upload File</button>' +
                    '</div>' +
            ' </form>' +
            '<div class="row">' +
                '<div class="row" id="parsed_csv_list">'+
                '</div > '+
            '</div >' +
            '<h3 id="msg"></h3>'+
           '</div>';
        $("title").html("Location Data Create");
        $("#adminContent").html(locDataForm);
        history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/csv_location.html");
    });
    var imported = document.createElement('script');
    document.head.appendChild(imported);

    function displayHTMLTable(results)
    {
        var table = "<table class='table'>";
        var data = results.data;

        for (i = 0; i < data.length; i++)
        {
            table += "<tr>";
            var row = data[i];
            var cells = row.join(",").split(",");

            //Skip the feature line and empty data
            if (cells[0] == "")
            {
                continue;
            }

            for (j = 0; j <4; j++)
            {
                table += "<td>";
                table += cells[j];
                table += "</th>";
            }
            if (i > 0)
            {
                $.ajax({
                    url: "./admin/csv",
                    type: "POST",
                    data: {
                        locId: cells[0],
                        locName: cells[1],
                        locLat: cells[2],
                        locLong: cells[3]
                    }
                })
                    .done(function (res) {
                        if (res == "Create CSV location successfully!") {
                            $("#msg").addClass("text-success");
                           // $("form").trigger("reset");
                        }
                        $("#msg").html(res);
                    });
            }
            table += "</tr>";
        }


       // console.log(data.length);
        table += "</table>";
        $("#parsed_csv_list").html(table);
    }

    $.getScript('papaparse.min.js', function () {
        $(document).on("click", "#submit-file", function (e) {
            e.preventDefault();
            $('#files').parse(
                {
                    config: {
                        delimiter: "auto",
                        complete: displayHTMLTable,
                    },
                    before: function (file, inputElem) {
                        console.log("Parsing file...", file);
                    },
                    error: function (err, file) {
                        console.log("ERROR:", err, file);
                    },
                    complete: function () {
                        console.log("Done with all files");
                    }
                });
        });
    });

                                                                        //Top 5 Users
    $(document).on("click", "#seeTop5Users", function (e){
        e.preventDefault();
        changeNavbar($("#seeTop5Users"));

        $.ajax({
            url: "./admin/top5",
            type: "GET"
        })
        .done(function(res){
            if(res == "No Users!"){
                $("#adminContent").html(res);
            }
            else{
                var content = '<div class="mx-auto w-75 mb-4"><canvas id="admin_barChart"></canvas></div>' +
                '<div class="mx-auto w-75"><canvas id="admin_pieChart"></canvas></div>';
                $("#adminContent").html(content);

                var barChart = new Chart($("#admin_barChart"), {
                    type: 'bar',
                    data: {
                        labels: res.userName,
                        datasets: [{
                            data: res.userCommentNum,
                            backgroundColor: [
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(153, 102, 255, 0.2)'
                            ],
                            borderColor: [
                                'rgba(153, 102, 255, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Number of Comments Posted'
                                },
                                ticks: {
                                    beginAtZero:true,
                                    stepSize: 1
                                }
                            }]
                        },
                        title: {
                            display: true,
                            text: 'Top 5 Users with Most Comments',
                            position: 'top',
                            fontSize: 14
                        }
                    }
                });
            }
        });
        $("title").html("Top 5 Locations");
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/user_top5_locations.html");
    });

});
