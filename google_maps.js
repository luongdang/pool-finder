var _google_maps = {
	map: null,
	homeAddress: "181 Shoreham Dr, Toronto",
	mapCenter: { "lat": 43.7, "lng": -79.4 },
	geocoder : null,
	markers : new Array(),
	infoWindows : new Array()
};

function address2Location(addr) {
	var deferred = new $.Deferred();

	if (!_google_maps.geocoder)
		_google_maps.geocoder = new google.maps.Geocoder();

	_google_maps.geocoder.geocode({ address: addr }, function (result, status) {
		switch (status) {
			case google.maps.GeocoderStatus.OK:
				deferred.resolve(result);
				break;

			case google.maps.GeocoderStatus.INVALID_REQUEST:
				deferred.reject('Invalid request');
				break;

			case google.maps.GeocoderStatus.ERROR:
				deferred.reject("There was a problem contacting Google's geocoding service");
				break;

			case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
				deferred.reject("The webpage has gone over the requests limit in too short a period of time");
				break;

			case google.maps.GeocoderStatus.REQUEST_DENIED:
				deferred.reject("The webpage is not allowed to use the geocoder.");
				break;

			case google.maps.GeocoderStatus.UNKNOWN_ERROR:
				deferred.reject("A geocoding request could not be processed due to a server error. The request may succeed if you try again");
				break;

			case google.maps.GeocoderStatus.ZERO_RESULTS:
				deferred.reject("No result was found for address " + addr);
				break;

			default:
				deferred.reject(status);
				break;
		}
	});

	return deferred;
}

// This function should be used un the debugger only
function getLatLng(addr) {
	$.when(address2Location(addr))
		.done(function (result) {
			for (i = 0; i < result.length ; i++)
			{
				var loc = result[i].geometry.location;
				console.log(i + '/' + (result.length - 1) + ': '
							  + result[i].formatted_address + ' = { "lat" : ' + loc.lat() + ', "lng" : ' + loc.lng() + '}');
			}
		})
		.fail(function (msg) {
			console.log (msg);
		});
}

function addFacility(facility) {
	var infoWindow = new google.maps.InfoWindow({
		content: '<h2>' + facility.name + '</h2>'
					+ '<div>' + facility.address + '. '
					+ '<a href="javascript:getDirection(\'' + facility.address + '\')">direction</a>'
					+ '<a href="' + facility.url + '" target="_blank">website</a>'
					+ '</div>'
	});

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(facility.location.lat, facility.location.lng),
		map: _google_maps.map,
		title: facility.name,
		icon: function() {
			switch (facility.city) {
				case "Toronto":
					return "images/swimming_blue.png";
					break;
				case "Mississauga":
					return "images/swimming_orange.png";
					break;
			
				case "Vaughan":
					return "images/swimming_green.png";
					break;
				
				default:
					return null;
			}
		}()
	});

	marker.infoWindow = infoWindow;

	_google_maps.infoWindows.push(infoWindow);
	_google_maps.markers.push(marker)

	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.open(_google_maps.map, marker);
	});

	return marker;
}

function loadMap(ele) {
	var mapOptions = {
		center: new google.maps.LatLng(_google_maps.mapCenter.lat, _google_maps.mapCenter.lng),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	_google_maps.map = new google.maps.Map(ele, mapOptions);
	for (var i = 0; i < window.facilities.length; i++) {
		facilities[i].marker = addFacility(window.facilities[i]);
	}

}

function getDirection(destination) {
	var url = 'https://maps.google.ca/maps?saddr=' + _google_maps.homeAddress + '&daddr=' + destination;
	window.open(encodeURI(url));
}