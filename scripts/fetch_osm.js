import https from 'https';
import fs from 'fs';

// OpenStreetMap Official 0.6 Map Data API
// Bounding box format: left,bottom,right,top (min_lon, min_lat, max_lon, max_lat)
const bbox = '75.698,31.248,75.710,31.260';
const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`;

console.log(`Fetching from OSM API: ${url}...`);

const options = {
  headers: {
    'User-Agent': 'LPUSmartCampusNavigator/1.0 (GIS Engineering and Physical Verification)'
  }
};

https.get(url, options, (res) => {
  console.log(`OSM API Status: ${res.statusCode}`);
  let xmlData = '';
  res.on('data', chunk => xmlData += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      fs.writeFileSync('src/data/lpu_osm_raw.xml', xmlData, 'utf8');
      console.log(`SUCCESS! Saved ${xmlData.length} bytes of raw OSM data to src/data/lpu_osm_raw.xml`);
    } else {
      console.error('Failed to fetch from OSM API:', xmlData.slice(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('OSM API Error:', e.message);
});
