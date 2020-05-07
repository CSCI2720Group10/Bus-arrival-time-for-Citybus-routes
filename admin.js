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
    let eta = await getETA(routeLoc);
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
            arr.push(routeLoc[i][j].stop);
        }
        routeLocData.push({routeId : routes[i],
                           locId: arr});

        arr = [];
        console.log(arr);
        for(var j = 0; j < routeLoc[i].length; j++){
            for(var k = 0; k < eta[i][j].length; k++){
                arr.push(eta[i][j][k].eta);
                console.log(eta[i][j][k].eta);
            }
            locData.push({locId : routeLocData[i].locId[j],
                          name: loc[i][j].name_en,
                          latitude: loc[i][j].lat,
                          longitude: loc[i][j].long,
                          dir: routeLoc[i][j].dir,
                          seq: routeLoc[i][j].seq,
                          eta: arr});
            arr = [];
        }
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

    $(document).on("click", "#createUser", function(e){
        e.preventDefault();
        changeNavbar($("#createUser"));
    });

    $(document).on("click", "#retrieveUser", function(e){
        e.preventDefault();
        changeNavbar($("#retrieveUser"));
    });

    $(document).on("click", "#updateUser", function(e){
        e.preventDefault();
        changeNavbar($("#updateUser"));
    });

    $(document).on("click", "#deleteUser", function(e){
        e.preventDefault();
        changeNavbar($("#deleteUser"));
    });

    $(document).on("click", "#createLocData", function(e){
        e.preventDefault();
        changeNavbar($("#createLocData"));
    });

});
