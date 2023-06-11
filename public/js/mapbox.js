export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW9uamlybyIsImEiOiJjbDF3b2FidncxczFiM2RvZmhiaDMyc3FvIn0.1xj07WwNRMHd6FHTSK534A';

  // create map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/monjiro/cl2gb9j1r001t14n2k4iyka2i',
    scrollZoom: false,
    //   center: [-80.128473, 25.781842],
    //   zoom: 10.7,
    //   interactive: false // it will show your map as like image
  });

  const bounds = new mapboxgl.LngLatBounds(); //LngLatBounds object represents a geographical bounding box, defined by its southwest and northeast points in longitude and latitude.

  location.forEach((loc) => {
    console.log(loc)
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // this adds popup text to the location mark
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend mapbound to include current locations
    bounds.extend(loc.coordinates);
  });

  // map fits the  bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100,
    },
  });
};
