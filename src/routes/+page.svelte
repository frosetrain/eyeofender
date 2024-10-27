<script lang="ts">
    let playerCoords = $state({ latitude: 0.0, longitude: 0.0 });
    let heading = $state(0);
    let bearing = $state(0);
    let ready = $state(false);
    let eyeSpinning = $state(false);
    let compassStarted = false;
    let eyeCount = $state(10);

    function getCoordinates() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
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

    async function throwEye() {
        eyeSpinning = true;
        eyeCount--;
        if (!compassStarted) {
            startCompassListener((compass) => {
                heading = compass;
            });
            compassStarted = true;
        }
        const location = await getCoordinates();
        console.log(location);
        playerCoords.latitude = location.coords.latitude;
        playerCoords.longitude = location.coords.longitude;
        fetch(`/api/throwEye?latitude=${playerCoords.latitude}&longitude=${playerCoords.longitude}`)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                console.log(response);
                bearing = response.bearing;
                eyeSpinning = false;
                ready = true;
            });
    }
</script>

<div
    class="aspect-square ring-8 ring-inset ring-emerald-500 overflow-hidden w-screen sm:w-[640px] rounded-full bg-gray-300"
>
    <div
        class="flex aspect-square w-screen sm:w-[640px] flex-col items-center"
        class:hidden={!ready}
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
    onclick={throwEye}
    aria-label="Throw eye of ender"
>
    <img
        class:animate-spin={eyeSpinning}
        class="h-32 w-32"
        src="eye_of_ender.png"
        alt="An eye of ender."
    />
</button>
<p>Number of eyes: {eyeCount}</p>
<p>Coordinates: {playerCoords.latitude} {playerCoords.longitude}</p>
<p>Heading: {heading}°</p>
<p>Bearing: {bearing}°</p>
