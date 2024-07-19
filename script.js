let map;
let service;
let autocomplete;
const places = [];
const markers = [];
const apiUrl = 'https://raw.githubusercontent.com/baeowsky/RBMap/main/places.json';

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 2
    });

    const input = document.getElementById('place-search');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
            alert("Nie znaleziono miejsca");
            return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(14);

        const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
    });

    map.addListener('click', (e) => {
        const name = prompt("Podaj nazwę miejsca:");
        const description = prompt("Podaj opis miejsca (opcjonalnie):");

        if (name) {
            const marker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                title: name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${name}</b><br>${description || ''}`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            const place = { name, description, latLng: e.latLng.toJSON() };
            places.push(place);
            markers.push(marker);

            savePlaces();
            updatePlacesList();
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('place-search').value;
        const request = {
            query,
            fields: ['name', 'geometry']
        };

        service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                map.setCenter(results[0].geometry.location);
                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                map.setZoom(14);
            }
        });
    });

    loadPlaces();
}

function updatePlacesList() {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';

    places.forEach((place, index) => {
        const li = document.createElement('li');
        li.textContent = `${place.name} - ${place.description || ''}`;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Usuń';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            markers[index].setMap(null);

            places.splice(index, 1);

            markers.splice(index, 1);

            savePlaces();
            updatePlacesList();
        });

        li.appendChild(removeBtn);
        li.addEventListener('click', () => {
            map.setCenter(new google.maps.LatLng(place.latLng.lat, place.latLng.lng));
            map.setZoom(10);
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${place.name}</b><br>${place.description || ''}`,
                position: new google.maps.LatLng(place.latLng.lat, place.latLng.lng)
            });
            infoWindow.open(map);
        });

        placesList.appendChild(li);
    });
}

function savePlaces() {
    localStorage.setItem('places', JSON.stringify(places));
}

function loadPlaces() {
    const savedPlaces = JSON.parse(localStorage.getItem('places'));
    if (savedPlaces) {
        savedPlaces.forEach(place => {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(place.latLng.lat, place.latLng.lng),
                map: map,
                title: place.name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${place.name}</b><br>${place.description || ''}`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            places.push(place);
            markers.push(marker);
        });
        updatePlacesList();
    }
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
});
