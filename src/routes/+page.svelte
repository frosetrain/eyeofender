<script lang="ts">
    import { getDistance, getRhumbLineBearing } from "geolib";

    const stronghold = [1.3466, 103.845677];
    let started = false;
    let coords = $state({ latitude: 0, longitude: 0 });
    let heading = $state();
    let bearingReceived = $state(false);
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
        bearingReceived = true;
    }
    function geoError(error: GeolocationPositionError) {
        console.log(error);
    }
    function getPosition() {
        if (!started) {
            started = true;
            startCompassListener((compass) => {
                heading = compass;
            });
        }
        loading = true;
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }

    // https://stackoverflow.com/a/75792316
    function startCompassListener(callback: (compass: number) => void) {
        if (!window["DeviceOrientationEvent"]) {
            alert("DeviceOrientation API not available");
            return;
        }
        let absoluteListener = (e: DeviceOrientationEvent) => {
            if (!e.absolute || e.alpha == null || e.beta == null || e.gamma == null) {
                return;
            }
            let compass = -(e.alpha + (e.beta * e.gamma) / 90);
            compass -= Math.floor(compass / 360) * 360;
            window.removeEventListener("deviceorientation", webkitListener);
            callback(compass);
        };
        let webkitListener = (e) => {
            let compass = e.webkitCompassHeading;
            if (compass != null && !isNaN(compass)) {
                callback(compass);
                window.removeEventListener("deviceorientationabsolute", absoluteListener);
            }
        };
        function addListeners() {
            window.addEventListener("deviceorientationabsolute", absoluteListener);
            window.addEventListener("deviceorientation", webkitListener);
        }
        if (typeof DeviceOrientationEvent.requestPermission == "function") {
            DeviceOrientationEvent.requestPermission().then((response) => {
                if (response == "granted") {
                    addListeners();
                } else alert("Permission for DeviceMotionEvent not granted");
            });
        } else addListeners();
    }
</script>

<div
    class="aspect-square ring-8 ring-inset ring-emerald-500 overflow-hidden w-screen sm:w-[640px] rounded-full bg-gray-300"
>
    <div
        class="flex aspect-square w-screen sm:w-[640px] flex-col items-center"
        class:hidden={!bearingReceived}
        style="transform: rotate({bearing - heading}deg)"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-12 mt-4"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
        </svg>
    </div>
</div>
<button
    class="absolute top-0 aspect-square w-screen sm:w-[640px] flex justify-center items-center"
    onclick={getPosition}
    aria-label="Throw eye of ender"
>
    <img
        class:animate-spin={loading}
        class="h-32 w-32"
        src="eye_of_ender.png"
        alt="An eye of ender."
    />
</button>
<p>Coordinates: {coords.latitude} {coords.longitude}</p>
<p>Heading: {heading}°</p>
<p>Bearing: {bearing}°</p>
<p>Distance: {distance} m</p>
