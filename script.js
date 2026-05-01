document.addEventListener('DOMContentLoaded', () => {
    const timeSlider = document.getElementById('time-slider');
    const autoplayBtn = document.getElementById('autoplay-btn');
    const blade = document.querySelector('.blade');
    const body = document.querySelector('body');
    const skyEffects = document.getElementById('sky-effects');

    let isPlaying = false;
    let playInterval;

    // Time of Day Color Map (Percentage: [R, G, B])
    const skyColors = [
        { p: 0, c: [10, 14, 39] },    // Midnight
        { p: 20, c: [153, 255, 221] }, // Dawn
        { p: 50, c: [135, 206, 235] }, // Noon
        { p: 80, c: [255, 230, 128] }, // Evening
        { p: 90, c: [255, 153, 102] }, // Sunset
        { p: 100, c: [10, 14, 39] }   // Midnight
    ];

    // Initial Setup
    createClouds();
    createStars();
    updateEnvironment(timeSlider.value);

    // Listeners
    timeSlider.addEventListener('input', (e) => {
        if (isPlaying) toggleAutoplay();
        updateEnvironment(e.target.value);
    });

    autoplayBtn.addEventListener('click', toggleAutoplay);

    function updateEnvironment(value) {
        const p = value / 100;

        // 1. Calculate Sun Position (Parabolic Arc)
        // x goes from 0% to 100%
        // y is a parabola: y = -a(x-0.5)^2 + k
        const sunX = p * 110 - 5; // -5 to 105 range
        const sunY = 400 - (Math.sin(p * Math.PI) * 350); 
        
        document.documentElement.style.setProperty('--sun-x', `${sunX}%`);
        document.documentElement.style.setProperty('--sun-y', `${sunY}px`);

        // 2. Interpolate Sky Color
        const color = getInterpolatedColor(value);
        document.documentElement.style.setProperty('--sky-color', color);

        // 3. Windmill Speed (Faster in afternoon p=0.5, stopped at night)
        const speed = Math.sin(p * Math.PI) * 2; // peaks at 1s rotation
        if (speed > 0.1) {
            blade.style.animation = `rotate ${2.5 - speed}s linear infinite`;
        } else {
            blade.style.animation = 'none';
        }

        // 4. Toggle Particles
        body.classList.toggle('night-time', p < 0.15 || p > 0.85);
        body.classList.toggle('day-time', p >= 0.15 && p <= 0.85);
    }

    function getInterpolatedColor(percent) {
        let low = skyColors[0];
        let high = skyColors[skyColors.length - 1];

        for (let i = 0; i < skyColors.length - 1; i++) {
            if (percent >= skyColors[i].p && percent <= skyColors[i+1].p) {
                low = skyColors[i];
                high = skyColors[i+1];
                break;
            }
        }

        const range = high.p - low.p;
        const ratio = range === 0 ? 0 : (percent - low.p) / range;
        
        const r = Math.round(low.c[0] + (high.c[0] - low.c[0]) * ratio);
        const g = Math.round(low.c[1] + (high.c[1] - low.c[1]) * ratio);
        const b = Math.round(low.c[2] + (high.c[2] - low.c[2]) * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    }

    function toggleAutoplay() {
        isPlaying = !isPlaying;
        autoplayBtn.textContent = isPlaying ? '⏸ Pause Cycle' : '▶ Auto-Cycle';
        
        if (isPlaying) {
            playInterval = setInterval(() => {
                let val = parseInt(timeSlider.value);
                val = (val + 1) % 101;
                timeSlider.value = val;
                updateEnvironment(val);
            }, 100);
        } else {
            clearInterval(playInterval);
        }
    }

    function createClouds() {
        for (let i = 0; i < 8; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            const width = Math.random() * 200 + 100;
            cloud.style.width = width + 'px';
            cloud.style.height = (width / 2) + 'px';
            cloud.style.top = Math.random() * 40 + '%';
            cloud.style.left = '-200px';
            cloud.style.animationDuration = (Math.random() * 30 + 30) + 's';
            cloud.style.animationDelay = (Math.random() * 60) + 's';
            skyEffects.appendChild(cloud);
        }
    }

    function createStars() {
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.top = Math.random() * 50 + '%';
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDuration = (Math.random() * 3 + 2) + 's';
            star.style.animationDelay = (Math.random() * 5) + 's';
            skyEffects.appendChild(star);
        }
    }
});
