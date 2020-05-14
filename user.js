var map, infoWindow, marker;

//Function for initialize the new map
async function initMap()
{
    //Model for setting the property of a google map at the beginning.
    $.ajax({
        url: "./user/mapping",
        type: "GET"
    })
        .done(function (res) {
            map = new google.maps.Map(document.getElementById('googleMap'), {
                //setting the google map initial location by (lat)
                center: { lat: 22.283948, lng: 114.156309 },
                /* Zoom Level
                   1: World
                   5: Landmass/continent
                   10: City
                   15: Streets
                   20: Building
                */
                zoom: 15,

                //The class style of google map
                styles:
                    [
                        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                        {
                            featureType: 'administrative.locality',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#d59563' }]
                        },
                        {
                            featureType: 'poi',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#d59563' }]
                        },
                        {
                            featureType: 'poi.park',
                            elementType: 'geometry',
                            stylers: [{ color: '#263c3f' }]
                        },
                        {
                            featureType: 'poi.park',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#6b9a76' }]
                        },
                        {
                            featureType: 'road',
                            elementType: 'geometry',
                            stylers: [{ color: '#38414e' }]
                        },
                        {
                            featureType: 'road',
                            elementType: 'geometry.stroke',
                            stylers: [{ color: '#212a37' }]
                        },
                        {
                            featureType: 'road',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#9ca5b3' }]
                        },
                        {
                            featureType: 'road.highway',
                            elementType: 'geometry',
                            stylers: [{ color: '#746855' }]
                        },
                        {
                            featureType: 'road.highway',
                            elementType: 'geometry.stroke',
                            stylers: [{ color: '#1f2835' }]
                        },
                        {
                            featureType: 'road.highway',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#f3d19c' }]
                        },
                        {
                            featureType: 'transit',
                            elementType: 'geometry',
                            stylers: [{ color: '#2f3948' }]
                        },
                        {
                            featureType: 'transit.station',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#d59563' }]
                        },
                        {
                            featureType: 'water',
                            elementType: 'geometry',
                            stylers: [{ color: '#17263c' }]
                        },
                        {
                            featureType: 'water',
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#515c6d' }]
                        },
                        {
                            featureType: 'water',
                            elementType: 'labels.text.stroke',
                            stylers: [{ color: '#17263c' }]
                        }
                    ]
            });
            /*An InfoWindow displays content (usually text or images) in a popup window above the map, 
            at a given location.*/
            var inforString = '<div><h1>This is your home location.</h1></div>';
            infoWindow = new google.maps.InfoWindow({
                content: inforString
            });

            //Geolocation here and reset the location of map.
            if (navigator.geolocation)
            {
                navigator.geolocation.getCurrentPosition(function (position)
                {
                    var pos =
                    {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(pos);

                    //Setting the marker of home location.
                    //marker with custom make-up and animation
                    marker = new google.maps.Marker({
                        position: map.center,
                        icon: "http://maps.google.com/mapfiles/kml/pal3/icon23.png",
                        map: map,
                        animation: google.maps.Animation.BOUNCE
                    });

                    marker.addListener('click', function () {
                        infoWindow.open(map, marker);
                    });


                },function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            }
            else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());

            }


            /*Marking each location and 
              write the details of each location in the infoWindow */

            for (var i = 0; i < res.length; i++) {
                var pos =
                {
                    lat: res[i].latitude,
                    lng: res[i].longitude
                };

                var locationMarker = new google.maps.Marker({
                    position: pos,
                    map: map
                });

                google.maps.event.addListener(locationMarker, 'click', (function (locationMarker, i) {
                    return function () {
                        var contentLocation = '<div id="contentLocation">' +
                            '<h6>Location ID: ' + res[i].locId + '</h6>' +
                            '<h6>Location Name: ' + res[i].name + '</h6>' +
                            '<h6>Location Latitude: ' + res[i].latitude + '</h6>' +
                            '<h6>Location Longitude: ' + res[i].longitude + '</h6>' +
                            '</div>';
                        map.setCenter(locationMarker.position);
                        map.setZoom(17);
                        infoWindow.setContent(contentLocation);
                        infoWindow.open(map, locationMarker);
                    }

                }
                )(locationMarker, i));
            }
        });
}

async function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

var sepMap, mk1, mk2;
/*A separate view for one single location, containing: 
a.a map showing the location 
b.the location details
c.user comments, where users can add new comments(non - threaded) */

//Append comment in the corresponding location
function processForm()
{
    var $new = $("<li><div><p></p></li>");
    $new.addClass("media");
    $new.find("div").addClass("media-body");
    $new.find("p").html($("#inputcomment").val());
    $("#comments").append($new);
    $("form")[0].reset();
}

//Measure the distance between two point
function haversine_distance(pt1Lat, pt1Long, pt2Lat, pt2Long)
{
    var R = 6371.0710; //using kilometers
    var rlat1 = pt1Lat * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = pt2Lat * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (pt2Long - pt1Long) * (Math.PI / 180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}

async function seperateMap()
{
    sepMap = new google.maps.Map(document.getElementById('singleMap'),
        {
            center: { lat: 22.324811, lng: 114.169589 },
            zoom: 15
        });
}

//seperate view of location
$(document).on("click", "#sepBtn", function (e)
{
    e.preventDefault();
    $.ajax({
        url: "./user/mapping/" + $("#sepValue").val(),
        type: "GET"
    })
        .done(function (res)
        {
            if (res != "No this locations!" && res.latitude != undefined)
            {
                var sepCenter =
                {
                    lat: res.latitude, lng: res.longitude
                };

                //display User location here for measuring the distance.
                navigator.geolocation.getCurrentPosition(function (position)
                {
                    var userCenter =
                    {
                        lat: position.coords.latitude, lng: position.coords.longitude
                    }
                    var usercontent = '<h6>User Home Location</h6>' +
                        '<p> Latitude: ' +
                        position.coords.latitude.toFixed(3) +
                        ' | Longitude: ' +
                        position.coords.longitude.toFixed(3) +
                        '</p > ';
                    sepMap.setCenter(sepCenter);
                    sepMap.setZoom(17);
                    //found location marker
                    mk1 = new google.maps.Marker({ position: sepCenter, map: sepMap });

                    //User location marker
                    mk2 = new google.maps.Marker({
                        position: userCenter,
                        icon:"http://maps.google.com/mapfiles/kml/pal3/icon23.png",
                        map: sepMap
                    });

                    //mark the line between user location and found location
                    var line = new google.maps.Polyline({ path: [sepCenter, userCenter], map: sepMap });
                    var distance = haversine_distance(sepCenter.lat, sepCenter.lng, userCenter.lat, userCenter.lng);
                    console.log(distance);

                    //input the user location into html
                    $("#userlocation").html(usercontent);

                    //Measure the distance between user location and found location into html
                    $("#measureDistance").html("nearby " + distance.toFixed(2) + " km to home location");
                    //console.log(res.latitude);
                    //console.log(res.longitude);
                });

                var favContent = '<button type="button" class="btn btn-outline-dark" id="favBtn">Add to Favourite</button>';

                $("#favouriteContent").html(favContent);
                var topicCon = '<h5 class="text-success"> Here is ' + res.name + ' at latlng (' +
                    res.latitude.toFixed(1) + ',' + res.longitude.toFixed(1) + ')</h5>';

                var commentmsg = '<div class="form-group">'+
                    '<label for="comment">Comment</label>'+
                   ' <textarea class="form-control" rows="3" id="inputcomment"></textarea>'+
                    '</div ><button type="button" class="btn btn-primary" id="addComment">Add comment</button>';

                $("#commentBox").html(commentmsg);
                $("#topic").html(topicCon);
            }
            else
            {
                //Error message for not found the location
                $("#topic").addClass("text-warning");
                $("#topic").html("<h5>Location is not found, please try again later!</h5>");
            }
        });

});

//adding the favourite click
$(document).on("click", "#favBtn", function (e) {
    e.preventDefault();
    console.log($("#sepValue").val());
    console.log($("#userName").html());
    $.ajax({
        url: "./user/favourite",
        type: "POST",
        data: {
            locId: $("#sepValue").val(),
            username: $("#userName").html()
        }
    })
        .done(function (res)
        {
            if (res == "You have already added this location!") {
                $("#favmsg").addClass("text-warning");
                $("#favmsg").html("<h6>The location is already added,<br> please try again!</h6>");
            }
            else
            {
                $("#favmsg").html('<h6 class="text-success">' + res + '</h6>')
                
            }
        });
});

//adding comment click
$(document).on("click", "#addComment", function (e)
{
    e.preventDefault();
    processForm();
});

$(document).ready(function ()
{
    function changeNavbar($clickedLink) {
        var $otherLinks = $("nav > div > a, nav div.dropdown-menu > a").not($clickedLink);
        $otherLinks.removeClass("disabled");
        $otherLinks.removeClass("text-danger");
        $otherLinks.addClass("text-success");
        $clickedLink.addClass("disabled");
        $clickedLink.addClass("text-danger");
    }

    $(document).on("click", "#home", function (e) {
        e.preventDefault();
        changeNavbar($("#home"));

        $.ajax({
            url: "./user",
            type: "GET"
        })
            .done(function (res) {
                var $temp = $('<div></div>').append(res);
                $("#userContent").html($temp.find("#userContent").html());
                $("title").html("Home");
                history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/user.html");
            });
    });

    $(document).on("click", "#listLoc", function (e) {
        e.preventDefault();
        changeNavbar($("#listLoc"));

        $.ajax({
            url: "./user/location",
            type: "GET"
        })
            .done(function (res) {
                $("title").html("List Locations");
                $("#userContent").html(res);
                history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/list_location.html");
            });
    });

    // sort table according to locId
    var locIdOrder = 1;
    $(document).on("click", "#locIdCol", function (e) {
        e.preventDefault();

        $.ajax({
            url: "./user/location?locIdOrder=" + locIdOrder,
            type: "GET"
        })
            .done(function (res) {
                $("title").html("List Locations");
                $("thead").find("th").find("a").html("Location ID" + (locIdOrder == 1 ? "▲" : "▼"));
                $("tbody").html(res);
                locIdOrder = -locIdOrder;
            });
    });

    // search location
    $(document).on("click", "#searchLoc", function (e) {
        e.preventDefault();
        changeNavbar($("#searchLoc"));

        //$form.find("input[name=inputcolor]:checked").val()
        var content = '<h1>Search Location</h1>' +
            '<form>' +
            'Choose a search criterion<br>' +
            '<div class="custom-control custom-radio custom-control-inline">' +
            '<input class="custom-control-input" id="locId" type="radio" name="criterion" value="locId">' +
            '<label class="custom-control-label" for="locId">Location ID</label>' +
            '</div>' +
            '<div class="custom-control custom-radio custom-control-inline">' +
            '<input class="custom-control-input" id="locName" type="radio" name="criterion" value="locName">' +
            '<label class="custom-control-label" for="locName">Location name</label>' +
            '</div>' +
            '<div class="form-group mt-2"></div>' +
            '<div id="btn"></div>' +
            '</form>' +
            '<div id="result"></div>';

        $("title").html("Search Locations");
        $("#userContent").html(content);
        history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/search_location.html");
    });

    $(document).on("change", "input[name=criterion]", function (e) {
        $(".form-group").html('<label for="value">' + (e.target.value == "locId" ? "Location ID" : "Location name") + '</label><br>' +
            '<input class="form-control" style="width: 300px" type="text" name="value" id="value">');
        $("#btn").html('<button type="submit" class="btn btn-success" id="searchBtn">Search</button>');
    });

    $(document).on("click", "#searchBtn", function (e) {
        e.preventDefault();

        $.ajax({
            url: "./user/location?" + $("form").find("input[name=criterion]:checked").val() + "=" + $("#value").val(),
            type: "GET"
        })
            .done(function (res) {
                $("#result").html(res);
                $("#value").val("");
            });
    });

    // show top 5 locations with most comments
    $(document).on("click", "#seeTop5Loc", function (e) {
        e.preventDefault();
        changeNavbar($("#seeTop5Loc"));

        $.ajax({
            url: "./user/top5",
            type: "GET"
        })
            .done(function (res) {
                if (res == "No locations!") {
                    $("#userContent").html(res);
                }
                else {
                    var content = '<div class="mx-auto w-75 mb-4"><canvas id="barChart"></canvas></div>' +
                        '<div class="mx-auto w-75"><canvas id="pieChart"></canvas></div>';
                    $("#userContent").html(content);

                    var barChart = new Chart($("#barChart"), {
                        type: 'bar',
                        data: {
                            labels: res.locName,
                            datasets: [{
                                data: res.locCommentNum,
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
                                        labelString: 'Number of Comments'
                                    },
                                    ticks: {
                                        beginAtZero: true,
                                        stepSize: 1
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Top 5 Locations with Most Comments',
                                position: 'top',
                                fontSize: 14
                            }
                        }
                    });

                    var pieChart = new Chart($("#pieChart"), {
                        type: 'pie',
                        data: {
                            labels: res.locName,
                            datasets: [{
                                data: res.locCommentNum,
                                backgroundColor: [
                                    'rgba(153, 102, 255, 1.0)',
                                    'rgba(28, 78, 244, 1.0)',
                                    'rgba(85, 211, 100, 1.0)',
                                    'rgba(201, 201, 68, 1.0)',
                                    'rgba(234, 141, 49, 1.0)'
                                ],
                                labels: res.locName
                            }]
                        },
                        options: {
                            title: {
                                display: true,
                                text: 'Top 5 Locations with Most Comments',
                                position: 'top',
                                fontSize: 14
                            }
                        }
                    });
                }
                $("title").html("Top 5 Locations");
                history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/user_top5_locations.html");
            });
    });

    // May be replaced with the home page.
    $(document).on("click", "#showLoc", function (e) {
        e.preventDefault();
        changeNavbar($("#showLoc"));

        var content = '<h1>Nothing Yet</h1>';
        $("title").html("Map Locations");
        $("#userContent").html(content);
        history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/map_location.html");
    });

    //see favourite location
    $(document).on("click", "#seeFavLoc", function (e)
    {
        e.preventDefault();
        changeNavbar($("#seeFavLoc"));
        var redata, i;
        $.ajax({
            url: "./user/favourite/" + $("#userName").html(),
            type: "GET"
        })
            .done(function (res)
            {
                console.log($("#userName").html());
                $("title").html("Fav Locations");
                $("#userContent").html(res);
                history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/fav_location.html");
            });
    });
});

