const USGS_API_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

const darkModeToggle = document.getElementById('dark-mode-toggle');
const toggleIcon = document.getElementById('toggle-icon');

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggleIcon.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        toggleIcon.textContent = '☀️';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        toggleIcon.textContent = '🌙';
    }
});

const dataTypeDropdown = document.getElementById('data-type');
const earthSection = document.getElementById('earth-section');
const marsSection = document.getElementById('mars-section');
const moonSection = document.getElementById('moon-section');

dataTypeDropdown.addEventListener('change', () => {
    const selectedValue = dataTypeDropdown.value;
    earthSection.style.display = 'none';
    marsSection.style.display = 'none';
    moonSection.style.display = 'none';
    if (selectedValue === 'earth') {
        earthSection.style.display = 'block';
    } else if (selectedValue === 'mars') {
        marsSection.style.display = 'block';
    } else if (selectedValue === 'moon') {
        moonSection.style.display = 'block';
    }
});

const map = L.map('earth-map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

async function fetchEarthData(timeframe, elementId, timeRange, interval) {
    const now = new Date();
    const pastTime = new Date(now.getTime() - timeRange * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${pastTime.toISOString()}&endtime=${now.toISOString()}&minmagnitude=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        data.features.forEach(feature => {
            const lat = feature.geometry.coordinates[1];
            const lon = feature.geometry.coordinates[0];
            const mag = feature.properties.mag;

            const marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`Magnitude: ${mag}, Location: (${lat}, ${lon})`);
        });

        const aggregatedData = aggregateData(data.features, timeRange, interval);
        plotSeismograph(aggregatedData, elementId, `Earthquakes - Last ${timeRange / 60} Hour(s)`);

    } catch (error) {
        console.error(`Error fetching Earth data (${timeframe}):`, error);
    }
}

function aggregateData(features, timeRange, interval) {
    const aggregatedData = {};
    
    features.forEach(feature => {
        const time = new Date(feature.properties.time);
        const timeKey = Math.floor(time.getTime() / 1000 / interval) * interval;
        
        if (!aggregatedData[timeKey]) {
            aggregatedData[timeKey] = {
                time: time,
                maxMag: feature.properties.mag
            };
        } else {
            aggregatedData[timeKey].maxMag = Math.max(aggregatedData[timeKey].maxMag, feature.properties.mag);
        }
    });

    const times = [];
    const magnitudes = [];

    for (const key in aggregatedData) {
        times.push(new Date(key * 1000));
        magnitudes.push(aggregatedData[key].maxMag);
    }

    return { times, magnitudes };
}

function plotSeismograph(data, elementId, title) {
    const times = data.times;
    const magnitudes = data.magnitudes;

    const trace = {
        x: times,
        y: magnitudes,
        mode: 'lines+markers',
        marker: { size: 8, color: 'blue' },
        line: { color: 'red' },
        name: 'Magnitude'
    };

    const layout = {
        title: title,
        xaxis: {
            title: 'Time',
            type: 'date',
            tickformat: '%H:%M\n%b %d'
        },
        yaxis: {
            title: 'Magnitude',
            range: [0, Math.max(...magnitudes) + 1]
        },
        dragmode: 'zoom',
        autosize: true,
        responsive: true
    };

    const plotData = [trace];

    Plotly.newPlot(elementId, plotData, layout);
}

async function fetchMarsData(elementId, timeRange, interval) {
    const now = new Date();
    const pastTime = new Date(now.getTime() - timeRange * 60 * 1000);

    const features = Array.from({ length: timeRange / interval }, (_, i) => ({
        properties: {
            time: new Date(now.getTime() - (i * interval * 60 * 1000)).toISOString(),
            mag: Math.random() * 3 + 1
        }
    }));

    const aggregatedData = aggregateData(features, timeRange, interval);
    plotSeismograph(aggregatedData, elementId, `Marsquakes - Last ${timeRange / 60} Hour(s)`);
}

async function fetchMoonData(elementId, timeRange, interval) {
    const now = new Date();
    const pastTime = new Date(now.getTime() - timeRange * 60 * 1000);

    const features = Array.from({ length: timeRange / interval }, (_, i) => ({
        properties: {
            time: new Date(now.getTime() - (i * interval * 60 * 1000)).toISOString(),
            mag: Math.random() * 2 + 0.5
        }
    }));

    const aggregatedData = aggregateData(features, timeRange, interval);
    plotSeismograph(aggregatedData, elementId, `Moonquakes - Last ${timeRange / 60} Hour(s)`);
}

fetchEarthData('5 hours', 'earth-1min', 300, 5);
fetchEarthData('24 hours', 'earth-10min', 1440, 10);
fetchEarthData('48 hours', 'earth-1hour', 2880, 60);

fetchMarsData('mars-1min', 300, 5);
fetchMarsData('mars-10min', 1440, 10);
fetchMarsData('mars-1hour', 2880, 60);

fetchMoonData('moon-1min', 300, 5);
fetchMoonData('moon-10min', 1440, 10);
fetchMoonData('moon-1hour', 2880, 60);

setInterval(() => {
    fetchEarthData('5 hours', 'earth-1min', 300, 5);
    fetchEarthData('24 hours', 'earth-10min', 1440, 10);
    fetchEarthData('48 hours', 'earth-1hour', 2880, 60);
    
    fetchMarsData('mars-1min', 300, 5);
    fetchMarsData('mars-10min', 1440, 10);
    fetchMarsData('mars-1hour', 2880, 60);
    
    fetchMoonData('moon-1min', 300, 5);
    fetchMoonData('moon-10min', 1440, 10);
    fetchMoonData('moon-1hour', 2880, 60);
}, 60000);
