// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

var geojsonMarkerOptions = {
    radius: 2.5, // overwrite later for each earthquake 
    fillColor: "#ff7800", // overwrite later for each earthquake
    color: "#000", 
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a circular marker
    // Color and radius  of circle determined by earthquake magnitude
    function pointToLayer(feature, latlng) {
        var quakeMag = feature.properties.mag;

        var circleColor = "";

        // Small differences mean a lot in earthquake magnitude.
        // I am squaring magnitude and then doubling to get circles
        // that better convey strength of earthquake
        var circleRadius = 2 * (quakeMag * quakeMag);

        if (quakeMag < 3.5) {
            circleColor = "#DAF7A6";
        }
        else if (quakeMag < 4.5) {
            circleColor = "#FFC300";
        }
        else if (quakeMag < 5.5) {
            circleColor = "#FF5733";
        }
        else if (quakeMag < 6.5) {
            circleColor = "#C70039";
        }
        else if (quakeMag < 7.5) {
            circleColor = "#900C3F";
        } else {
            circleColor = "#581845";
        };

        // set radius and color for this earthquake
        geojsonMarkerOptions.radius = circleRadius;
        geojsonMarkerOptions.fillColor = circleColor;

        return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place, time, and magnitude of the earthquake
    function onEachFeature(feature, layer) {

        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>" +
            "<h3>Magnitude: " + feature.properties.mag + "</h3>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the pointToLayer function once for each piece of data in the array
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define base layer maps

    var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satmap,
        "Grayscale Map": lightmap,
        "Outdoors Map": outmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes (Last 30 Days)": earthquakes
    };

    // Create our map, giving it the satmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Did we go over adding legends to MapBox?  I don't recall that.
    // I googled it and found this, which works but maybe there are easier ways?

    // Create a control on bottom right
    var legend = L.control({ position: "bottomright" });

    // create a new div for control
    // add some html elements with background colors matching map circle coloring
    // add some text describing that color's magnitude
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Magnitude</h4>";
        div.innerHTML += '<i style="background: #DAF7A6"></i><span>2.5 - 3.5</span><br>';
        div.innerHTML += '<i style="background: #FFC300"></i><span>3.5 - 4.5</span><br>';
        div.innerHTML += '<i style="background: #FF5733"></i><span>4.5 - 5.5</span><br>';
        div.innerHTML += '<i style="background: #C70039"></i><span>5.5 - 6.5</span><br>';
        div.innerHTML += '<i style="background: #900C3F"></i><span>6.5 to 7.5</span><br>';
        div.innerHTML += '<i style="background: #581845"></i><span>7.5+</span><br>';

        return div;
    };

    // add legend control to our map
    legend.addTo(myMap);
}
