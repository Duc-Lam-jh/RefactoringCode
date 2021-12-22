/* ========= Utilities ========== */
const Markers = () => {
	const markerList = [];

	return {
		append    : function (marker) {
			markerList.push(marker);
		},
		removeAll : function () {
			markerList.forEach(function (item) {
				item.remove();
			});
			markerList.length = 0;
		},
		get       : function (index) {
			return markerList[index];
		},
		length : function(){
			return markerList.length;
		}
	};
};

function HideElement(id){
	if (!document.getElementById(id).classList.contains('none')) {
		document.getElementById(id).classList.add('none');
	}
}

/* ========= Declarations ========== */
const markers = Markers(); //an array to store the available markers on the map
let navigate = false; //a flag to indicate if the navigating function is turned on
mapboxgl.accessToken =
	'pk.eyJ1IjoiZHVjbGFtMjI3IiwiYSI6ImNrd3Z6OHhqZDA4a3cyb3M4czltcHAwZXMifQ.5bneNUlldaEBHRv9vr0vNA'; //personal access token
const map = new mapboxgl.Map({
	container : 'map',
	style     : 'mapbox://styles/mapbox/streets-v11',
	zoom      : 15,
}); //initial declaration of the main map into the div 'map' with zoom level 15

//declare the zoom and rotate controls and add them to the map
const nav = new mapboxgl.NavigationControl();
map.addControl(nav);

//debounce timer to serve the searchbox
let debounceTimer;
function Debounce (func, time) {
	debounceTimer = clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(func, time);
}

/* === Initialization of the map === */
//FUNCTION to set up the map
function LoadMap () {
	//get user's current location, if success, call function SuccessLocation, otherwise call ErrorLocation
	GoToMyLocation();

	//set up search events
	SetUpSearch();
}

//FUNCTION: when successfully got user's location, zoom in on it on the map
function SuccessLocation (position) {
	FlyToPlace([ position.coords.longitude, position.coords.latitude ]);
}

//FUNCTION: if cannot get user's location, zoom into the default coords
function ErrorLocation () {}

//FUNCTION to jump to my current location
function GoToMyLocation () {
	navigator.geolocation.getCurrentPosition(SuccessLocation, ErrorLocation, {
		enableHighAccuracy : true,
	});
}

function SetUpSearch(){
	//add searching functionality to the original searchbox
	const searchbox = document.getElementById('searchbox');
	searchbox.addEventListener('keyup', function () {
		Debounce(() => SearchForPlace(''), 500);
	});

	//add search functionality to the second searchbox (for navigating)
	const secondSearchbox = document.getElementById('second-searchbox');
	secondSearchbox.addEventListener('keyup', function () {
		Debounce(() => SearchForPlace('second'), 500);
	});

	//if the user click outside of the searchboxes, the search results will be hidden
	document.addEventListener('click', function (e) {
		if (
			e.target != document.getElementById('searchbox') ||
			e.target != document.getElementById('search-results')
		) {
			HideElement('search-results');
		}

		if (
			e.target != document.getElementById('second-searchbox') ||
			e.target != document.getElementById('second-search-results')
		) {
			HideElement('second-search-results');
		}
	});
}

/* === Search functionality === */
//FUNCTION to grab the value from searchbox and look for the place
async function SearchForPlace (id) {
	id = id.length > 0 ? id + '-' : id;
	const text = document.getElementById(id + 'searchbox').value;

	if (text.length > 0) {
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			text +
			'.json?fuzzyMatch=false&access_token=' +
			mapboxgl.accessToken;

		const response = await fetch(url, {
			method : 'GET',
		});

		const data = await response.json();
		LoadResults(data.features, id);
	}
}

//FUNCTION to show search results
function LoadResults (array, id) {
	//show results box
	const resultsBox = document.getElementById(id + 'search-results');
	resultsBox.innerHTML = '';

	if (resultsBox.classList.contains('none')) {
		resultsBox.classList.remove('none');
	}

	//add results into box
	array.forEach(function (item) {
		const name = document.createElement('div');
		name.classList.add('name');
		name.innerHTML = item.text;

		const address = document.createElement('div');
		address.classList.add('address');
		address.innerHTML = item.place_name;

		const searchitem = document.createElement('div');
		searchitem.classList.add('search-item');
		searchitem.appendChild(name);
		searchitem.appendChild(address);
		searchitem.addEventListener('click', function () {
			FlyToPlace(item.center);
			HideElement('search-results');
			HideElement('second-search-results');
		});

		resultsBox.appendChild(searchitem);
	});
}

//FUNCTION to zoom in onto a pair of coordinates: center = [longitude, latitude]
async function FlyToPlace (center) {
	//built-in mapbox method to zoom to a place
	map.flyTo({
		center    : center,
		essential : true,
	});

	//if the navigating flag is false, remove all markers
	if (!navigate) {
		markers.removeAll();
	}
	else {
		//if the navigating flag is on and there are already 2 markers, remove all markers
		if (markers.length() == 2) {
			markers.removeAll();
		}
	}
	//create a new marker and show it on the map
	const marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
	markers.append(marker);

	//if the navigating flag is on and there are 2 markers in total, get the route between the two
	if (navigate && markers.length() == 2) {
		//._lngLat is the object that contains the coordinates of the position
		//convert it into an array to get the [longitude, latitude] format
		GetRoute(markers.get(0)._lngLat.toArray(), markers.get(1)._lngLat.toArray());
	}
}

/* === Navigating functionality === */
//FUNCTION to get a route between 2 points: start, end = [longitude, latitude]
async function GetRoute (start, end) {
	//get type: walking, cycling, driving
	const type = document.getElementById('typeOfDistance').value;

	const distanceUrl =
		'https://api.mapbox.com/directions/v5/mapbox/' +
		type +
		'/' +
		start +
		';' +
		end +
		'?geometries=geojson&access_token=pk.eyJ1IjoiZHVjbGFtMjI3IiwiYSI6ImNrd3Z6OHhqZDA4a3cyb3M4czltcHAwZXMifQ.5bneNUlldaEBHRv9vr0vNA';
	console.log(distanceUrl);

	const response = await fetch(distanceUrl);
	const data = await response.json();

	//show the estimated distance
	const distanceBox = document.getElementById('distance');
	distanceBox.innerHTML = 'Distance: ' + data.routes[0].distance + 'm';
	distanceBox.style.display = 'flex';

	//draw route onto map
	const route = data.routes[0].geometry.coordinates;
	const geojson = {
		type       : 'Feature',
		properties : {},
		geometry   : {
			type        : 'LineString',
			coordinates : route,
		},
	};
	// if the route already exists on the map, reset it
	if (map.getSource('route')) {
		map.getSource('route').setData(geojson);
	}
	else {
		// otherwise, make a new request
		map.addLayer({
			id     : 'route',
			type   : 'line',
			source : {
				type : 'geojson',
				data : geojson,
			},
			layout : {
				'line-join' : 'round',
				'line-cap'  : 'round',
			},
			paint  : {
				'line-color'   : '#667aab',
				'line-width'   : 5,
				'line-opacity' : 0.75,
			},
		});
	}
}

//FUNCTION to toggle the navigation functionality
function ToggleNavigator () {
	const secondSearchbox = document.getElementById('secondSearch');
	const typeDistance = document.getElementById('typeDistance');
	const distance = document.getElementById('distance');

	//reset the markers
	markers.removeAll();

	//if it is off then show its components
	if (secondSearchbox.classList.contains('none')) {
		secondSearchbox.classList.remove('none');
		typeDistance.style.display = 'flex';
		navigate = true;
	}
	else {
		//other wise hide them all
		secondSearchbox.classList.add('none');
		typeDistance.style.display = 'none';
		distance.style.display = 'none';
		navigate = false;

		map.removeLayer('route');
		map.removeSource('route');
	}
}

/* ========== Execution ========== */
LoadMap();


const addingMoreStuff = () => {
	console.log('testing adding sth');
}