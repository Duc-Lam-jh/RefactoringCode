function createMap(token, containerId) {
	const mapContainer = document.getElementById(containerId);

	/* ========= Utilities ========== */
	const Markers = () => {
		const markerList = [];

		return {
			append: function (marker) {
				markerList.push(marker);
			},
			removeAll: function () {
				markerList.forEach(function (item) {
					item.remove();
				});
				markerList.length = 0;
			},
			get: function (index) {
				return markerList[index];
			},
			length: function () {
				return markerList.length;
			}
		};
	};

	function hideElement(id) {
		if (mapContainer.querySelector('#' + id).classList.contains('none')) {
			return;
		}
		mapContainer.querySelector('#' + id).classList.add('none');
	}

	/* ========= Variables declarations ========== */
	mapboxgl.accessToken = token;
	const availableMarkers = Markers();
	const mapNavigationControls = new mapboxgl.NavigationControl();
	let isFindingRouteFuncOn = false;
	let debounceTimer;
	const mainMap = new mapboxgl.Map({
		container: containerId,
		style: 'mapbox://styles/mapbox/streets-v11',
		zoom: 15,
	}); //initial declaration of the main map into the div 'map' with zoom level 15

	mainMap.addControl(mapNavigationControls);

	/* ========= Functions declarations ========== */

	function debounce(func, time) {
		debounceTimer = clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(func, time);
	}

	/* === Initialization of the map === */
	function loadMap() {
		goToMyLocation();
		setUpSearch();

		navigateButton = mapContainer.querySelector('.navigate');
		navigateButton.addEventListener('click', () => toggleNavigator());

		myLocationButton = mapContainer.querySelector('.my-location');
		myLocationButton.addEventListener('click', () => goToMyLocation());
	}

	function goToMyLocation() {
		//if successfully get position, execute successLocation, otherwise execute errorLocation
		navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
			enableHighAccuracy: true,
		});
	}

	function successLocation(position) {
		flyToPlace([position.coords.longitude, position.coords.latitude]);
	}

	function errorLocation() {
		flyToPlace([0, 0]);
	}

	function setUpSearch() {
		//add searching functionality to the original searchbox
		const searchbox = mapContainer.querySelector('#searchbox');
		searchbox.addEventListener('keyup', function () {
			debounce(() => searchForPlace(''), 500);
		});

		//add search functionality to the second searchbox (for navigating)
		const secondSearchbox = mapContainer.querySelector('#second-searchbox');
		secondSearchbox.addEventListener('keyup', function () {
			debounce(() => searchForPlace('second'), 500);
		});

		//if the user click outside of the searchboxes, the search results will be hidden
		mapContainer.addEventListener('click', function (e) {
			if (
				e.target != mapContainer.querySelector('searchbox') ||
				e.target != mapContainer.querySelector('search-results')
			) {
				hideElement('search-results');
			}

			if (
				e.target != mapContainer.querySelector('second-searchbox') ||
				e.target != mapContainer.querySelector('second-search-results')
			) {
				hideElement('second-search-results');
			}
		});
	}

	/* === Search functionality === */
	/**
	 * Pass in the prefix of a searchbox's id to get the text value 
	 * and call mapbox api to get coordinates
	 * 
	 * @param searchBoxPrefixId
	 * 
	 * Example:
	 * - searchForPlace('') will get text value from the div 'searchbox'
	 * - searchForPlace('second') will get text value from the div 'second-searchbox'
	 */
	async function searchForPlace(searchBoxPrefixId) {
		searchBoxPrefixId = searchBoxPrefixId.length > 0 ? searchBoxPrefixId + '-' : searchBoxPrefixId;
		const text = mapContainer.querySelector('#' + searchBoxPrefixId + 'searchbox').value;

		if (text.length > 0) {
			const url =
				'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
				text +
				'.json?fuzzyMatch=false&access_token=' +
				mapboxgl.accessToken;

			const response = await fetch(url, {
				method: 'GET',
			});

			const data = await response.json();
			loadResults(data.features, searchBoxPrefixId);
		} else {
			//do nothing
		}
	}

	function loadResults(destinationList, searchBoxPrefixId) {
		//show results box
		const resultsBox = mapContainer.querySelector('#' + searchBoxPrefixId + 'search-results');
		resultsBox.innerHTML = '';

		if (resultsBox.classList.contains('none')) {
			resultsBox.classList.remove('none');
		} else {
			//do nothing
		}

		//add results into box
		destinationList.forEach(function (item) {
			const name = document.createElement('div');
			name.classList.add('name');
			name.innerHTML = item.text;

			const address = document.createElement('div');
			address.classList.add('address');
			address.innerHTML = item.place_name;

			const searchItem = document.createElement('div');
			searchItem.classList.add('search-item');
			searchItem.appendChild(name);
			searchItem.appendChild(address);
			searchItem.addEventListener('click', function () {
				flyToPlace(item.center);
				hideElement('search-results');
				hideElement('second-search-results');
			});

			resultsBox.appendChild(searchItem);
		});
	}

	/**
	 * Pass in an array containing the coordinates of the destination
	 * 
	 * @param destination [Longitude, Latitude]
	 */
	async function flyToPlace(destination) {
		//built-in mapbox method to zoom to a place
		mainMap.flyTo({
			center: destination,
			essential: true,
		});

		if (!isFindingRouteFuncOn) {
			availableMarkers.removeAll();
		}	else {
			if (availableMarkers.length() == 2) {
				availableMarkers.removeAll();
			}
		}
		//create a new marker and show it on the map
		const marker = new mapboxgl.Marker().setLngLat(destination).addTo(mainMap);
		availableMarkers.append(marker);

		if (isFindingRouteFuncOn && availableMarkers.length() == 2) {
			/**_lngLat is the object that contains the coordinates of the position
			* we convert it into an array to get the [longitude, latitude] format
			*/
			getRoute(availableMarkers.get(0)._lngLat.toArray(), availableMarkers.get(1)._lngLat.toArray());
		} else {
			//do nothing
		}
	}

	/* === Find route functionality === */
	async function getRoute(start, end) {
		//get type: walking, cycling, driving
		const type = mapContainer.querySelector('#typeOfDistance').value;

		const distanceUrl =
			'https://api.mapbox.com/directions/v5/mapbox/' +
			type +
			'/' +
			start +
			';' +
			end +
			'?geometries=geojson&access_token=' + mapboxgl.accessToken;

		const response = await fetch(distanceUrl);
		const data = await response.json();

		//show the estimated distance
		const distanceBox = mapContainer.querySelector('#distance');
		distanceBox.innerHTML = 'Distance: ' + data.routes[0].distance + 'm';
		distanceBox.style.display = 'flex';

		//draw route onto map
		const route = data.routes[0].geometry.coordinates;
		drawRoute(route);
	}

	function drawRoute(route) {
		const geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: route,
			},
		};
		// if the route already exists on the map, reset it
		if (mainMap.getSource('route')) {
			mainMap.getSource('route').setData(geojson);
		}	else {
			// otherwise, make a new request
			mainMap.addLayer({
				id: 'route',
				type: 'line',
				source: {
					type: 'geojson',
					data: geojson,
				},
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#667aab',
					'line-width': 5,
					'line-opacity': 0.75,
				},
			});
		}
	}

	function toggleNavigator() {
		const secondSearchbox = mapContainer.querySelector('#secondSearch');
		const typeDistance = mapContainer.querySelector('#typeDistance');
		const distance = mapContainer.querySelector('#distance');

		availableMarkers.removeAll();

		//if it is off then show its components
		if (secondSearchbox.classList.contains('none')) {
			secondSearchbox.classList.remove('none');
			typeDistance.style.display = 'flex';
			isFindingRouteFuncOn = true;
		}	else {
			//other wise hide them all
			secondSearchbox.classList.add('none');
			typeDistance.style.display = 'none';
			distance.style.display = 'none';
			isFindingRouteFuncOn = false;

			mainMap.removeLayer('route');
			mainMap.removeSource('route');
		}
	}

	return {
		loadMap
	}
}
/* ========== Execution ========== */
const upMap = createMap('pk.eyJ1IjoiZHVjbGFtMjI3IiwiYSI6ImNrd3Z6OHhqZDA4a3cyb3M4czltcHAwZXMifQ.5bneNUlldaEBHRv9vr0vNA', 'map');
const downMap = createMap('pk.eyJ1IjoiZHVjbGFtMjI3IiwiYSI6ImNrd3Z6OHhqZDA4a3cyb3M4czltcHAwZXMifQ.5bneNUlldaEBHRv9vr0vNA', 'map2')
upMap.loadMap();
downMap.loadMap();
