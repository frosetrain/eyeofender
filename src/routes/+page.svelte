<script lang="ts">
    import { getDistance, getRhumbLineBearing } from "geolib";
    import { onMount } from "svelte";
    const stronghold = [1.3466, 103.845677];
    let coords = $state({ latitude: 0, longitude: 0 });
    let heading = $state();
    let bearing = $derived(
        getRhumbLineBearing(
            { latitude: coords.latitude, longitude: coords.longitude },
            { latitude: stronghold[0], longitude: stronghold[1] },
        ),
    );
    let distance = $derived(
        getDistance(
            { latitude: coords.latitude, longitude: coords.longitude },
            { latitude: stronghold[0], longitude: stronghold[1] },
        ),
    );
    let loading = $state(false);
    function geoSuccess(location: GeolocationPosition) {
        loading = false;
        coords.latitude = location.coords.latitude;
        coords.longitude = location.coords.longitude;
    }
    function geoError(error: GeolocationPositionError) {
        console.log(error);
    }
    function getPosition() {
        loading = true;
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }
    onMount(async () => {
        startCompassListener((compass) => {
            console.log("hi", compass);
            heading = compass;
        });
        alert("among us");
    });

    function startCompassListener(callback: (compass: number) => void) {
        if (!window["DeviceOrientationEvent"]) {
            alert("DeviceOrientation API not available");
            return;
        }
        let absoluteListener = (e: DeviceOrientationEvent) => {
            alert("absoluteListener");
            if (!e.absolute || e.alpha == null || e.beta == null || e.gamma == null) {
                alert("what");
                return;
            }
            let compass = -(e.alpha + (e.beta * e.gamma) / 90);
            compass -= Math.floor(compass / 360) * 360;
            window.removeEventListener("deviceorientation", webkitListener);
            callback(compass);
        };
        let webkitListener = (e) => {
            alert("webkitListener");
            let compass = e.webkitCompassHeading;
            if (compass != null && !isNaN(compass)) {
                callback(compass);
                window.removeEventListener("deviceorientationabsolute", absoluteListener);
            }
        };
        function addListeners() {
            alert("real");
            window.addEventListener("deviceorientationabsolute", absoluteListener);
            window.addEventListener("deviceorientation", webkitListener);
        }
        if (typeof DeviceOrientationEvent.requestPermission == "function") {
            alert(DeviceOrientationEvent.requestPermission());
            DeviceOrientationEvent.requestPermission().then((response) => {
                alert("ask");
                if (response == "granted") {
                    addListeners();
                } else alert("Permission for DeviceMotionEvent not granted");
            });
        } else addListeners();
    }
</script>

<p>Coordinates: {coords.latitude} {coords.longitude}</p>
<p>Heading: {heading}°</p>
<p>Bearing: {bearing}°</p>
<p>Distance: {distance} m</p>
<button onclick={getPosition} aria-label="Throw eye of ender">
    <img class:animate-spin={loading} src="eye_of_ender.png" alt="An eye of ender." />
</button>
