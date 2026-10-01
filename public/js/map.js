mapboxgl.accessToken = mapToken;

console.log("LISTING:", listing);
console.log("GEOMETRY:", listing.geometry);
console.log("COORDINATES:", listing.geometry?.coordinates);

const coordinates = listing.geometry?.coordinates;

if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(Number(coordinates[0])) &&
    Number.isFinite(Number(coordinates[1]))
) {
    const map = new mapboxgl.Map({
        container: "map",
        center: [
            Number(coordinates[0]),
            Number(coordinates[1])
        ],
        zoom: 9
    });

    new mapboxgl.Marker({
        color: "red"
    })
        .setLngLat([
            Number(coordinates[0]),
            Number(coordinates[1])
        ])
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h4>${listing.location}</h4>
                <p>Exact Location provided after booking</p>
            `)
        )
        .addTo(map);

} else {
    console.error(
        "Invalid coordinates for this listing:",
        coordinates
    );

    document.getElementById("map").innerHTML =
        "<p>Location coordinates are not available for this listing.</p>";
}