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

    $(document).on("click", "#home", function(e){
        e.preventDefault();
        changeNavbar($("#home"));

        $("#userContent").load("/user.html #userContent", function(){
            $("title").html("Home");
            history.replaceState({content: $("#content").html(), title: $("title").html()}, null, "/home.html");
        });
    });

    $(document).on("click", "#listLoc", function(e){
        e.preventDefault();
        changeNavbar($("#listLoc"));

        $.ajax({
            url: "./user/location",
            type: "GET"
        })
        .done(function(res){
            $("title").html("List Locations");
            $("#userContent").html(res);
            history.pushState({content: $("#content").html(), title: $("title").html()}, null, "/list_location.html");
        });
    });

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
});

var map, infoWindow;

//Function for initialize the new map
function initMap()
{
    //Model for setting the property of a google map at the beginning.
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

    //Geolocation 
    infoWindow = new google.maps.InfoWindow;
    var marker = new google.maps.Marker
        ({
            position: map.center,
            map: map
        });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here !');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }
    else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos)
{
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}