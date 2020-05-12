$(document).ready(function ()
{
    function changeNavbar($clickedLink){
        var $otherLinks = $("nav > div > a, nav div.dropdown-menu > a").not($clickedLink);
        $otherLinks.removeClass("disabled");
        $otherLinks.removeClass("text-danger");
        $otherLinks.addClass("text-success");
        $clickedLink.addClass("disabled");
        $clickedLink.addClass("text-danger");
    }

    $(document).on("click", "#home", function (e)
    {

        changeNavbar($("#home"));

        $("#userContent").load("/user.html #userContent", function(){
            $("title").html("user");
            history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/user.html");
        });
    });

    $(document).on("click", "#listLoc", function(e){
        e.preventDefault();
        changeNavbar($("#listLoc"));

        $.ajax({
            url: "./user/location",
            type: "GET"
        })
            .done(function (res) {
                $("title").html("List Locations");
                $("#userContent").html(res);
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/list_location.html");
        });
    });

    // sort table according to locId
    var locIdOrder = 1;
    $(document).on("click", "#locIdCol", function(e){
        e.preventDefault();

        $.ajax({
            url: "./user/location?locIdOrder=" + locIdOrder,
            type: "GET"
        })
        .done(function(res){
            $("title").html("List Locations");
            $("thead").find("th").find("a").html("Location ID" + (locIdOrder == 1 ? "▲" : "▼"));
            $("tbody").html(res);
            locIdOrder = -locIdOrder;
        });
    });

    // search location
    $(document).on("click", "#searchLoc", function(e){
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
        history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/search_location.html");
    });

    $(document).on("change", "input[name=criterion]", function(e){
        $(".form-group").html('<label for="value">' + (e.target.value == "locId" ? "Locarion ID" : "Location name") + '</label><br>' +
        '<input class="form-control" style="width: 300px" type="text" name="value" id="value">');
        $("#btn").html('<button type="submit" class="btn btn-success" id="searchBtn">Search</button>');
    });

    $(document).on("click", "#searchBtn", function(e){
        e.preventDefault();

        $.ajax({
            url: "./user/location?" + $("form").find("input[name=criterion]:checked").val() + "=" + $("#value").val(),
            type: "GET"
        })
        .done(function(res){
            $("#result").html(res);
            $("#value").val("");
        });
    });

    $(document).on("click", "#showLoc", function (e)
    {
        e.preventDefault();
        changeNavbar($("#searchLoc"));

        var content = '<h1>mapping to location</h1>' +
            '<div>' +
            '<div id="mapresult"></div>' +
            '</div>';

        $.ajax({
            url: "./user/mapping/003505",
            type: "GET"
        })
            .done(function (res) {

                console.log(res.latitude);
                $("title").html("Map Locations");
                $("#userContent").html(res);
                history.pushState({ content: $("#content").html(), title: $("title").html() }, null, "/map_location.html");
            });
    });

});
var map, infoWindow, marker;

//Function for initialize the new map
async function initMap()
{
    //Model for setting the property of a google map at the beginning.
    $.ajax({
        url: "./user/mapping",
        type: "GET"
    })
        .done(function (res)
        {
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
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos =
                    {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(pos);

                    //Setting the marker of home location.
                    marker = new google.maps.Marker({
                        position: map.center,
                        map: map
                    });

                    marker.addListener('click', function () {
                        infoWindow.open(map, marker);
                    });


                }, function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            }
            else
            {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());

            }


            /*Marking each location and 
              write the details of each location in the infoWindow */

            for (var i = 0; i < res.length; i++)
            {
                var pos =
                {
                    lat: res[i].latitude,
                    lng: res[i].longitude
                };
                
                var locationMarker = new google.maps.Marker({
                    position:pos,
                    map: map
                });
               
                google.maps.event.addListener(locationMarker, 'click', (function (locationMarker, i) {
                    return function () {
                        var contentLocation = '<div id="contentLocation">'+
                        '<h6>Location ID: ' + res[i].locId + '</h6>' +
                        '<h6>Location Name: ' + res[i].name + '</h6>'+
                        '<h6>Location Latitude: ' + res[i].latitude + '</h6>'+
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

async function handleLocationError(browserHasGeolocation, infoWindow, pos)
{
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}
