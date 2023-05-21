mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
	center: parkingLot.geometry.coordinates, // starting position [lng, lat]
	zoom: 8, // starting zoom
});

new mapboxgl.Marker()
	.setLngLat(parkingLot.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({offset: 25})
		.setHTML(
			`<h6>${parkingLot.name}</h6>`
		)
	)
	.addTo(map);