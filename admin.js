const routes = [20, 22, 70, 117, 260, 307, 592, 608, 681, 969];

async function getRoute(){
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

async function getRouteLoc(){
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

async function getLoc(routeLoc){
    let data = [];
    for(var loc of routeLoc){
        let arr = [];
        for(var l of loc){
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

async function getETA(routeLoc){
    let data = [];
    let i = 0;
    for(var loc of routeLoc){
        let arr = [];
        for(var l of loc){
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
    try {
        $("#msg").removeClass("text-success");
        $("#msg").html("Flushing...");
        let routeLoc = await getRouteLoc();
        let loc = await getLoc(routeLoc);
        let eta = await getETA(routeLoc);
        //console.log(eta);
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

            for(var j = 0; j < eta[i].length; j++){
                for(var k = 0; k < eta[i][j].length; k++){
                    arr.push(eta[i][j][k].eta);
                }
            }
            for(var j = 0; j < routeLoc[i].length; j++){
                locData.push({locId : routeLocData[i].locId[j],
                              name: loc[i][j].name_en,
                              latitude: loc[i][j].lat,
                              longitude: loc[i][j].long,
                              dir: routeLoc[i][j].dir,
                              seq: routeLoc[i][j].seq,
                              eta: arr});
            }

        }

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

$(document).ready(function() {
    $(document).on("click", "#flush", async function(){ await flushData()});

    $(document).on("mouseenter mouseleave", "#locDropdown", function(){
        $("#locDropdownMenu").toggle();
    });

    $(document).on("mouseenter mouseleave", "#userDropdown", function(){
        $("#userDropdownMenu").toggle();
    });

    $(document).on("click", "#adminHome", function(){

    });

    $(document).on("click", "#createLoc", function(){

    });

    $(document).on("click", "#retrieveLoc", function(){

    });

    $(document).on("click", "#updateLoc", function(){

    });

    $(document).on("click", "#deleteLoc", function(){

    });

    $(document).on("click", "#createUser", function(){

    });

    $(document).on("click", "#retrieveUser", function(){

    });

    $(document).on("click", "#updateUser", function(){

    });

    $(document).on("click", "#deleteUser", function(){

    });

});
