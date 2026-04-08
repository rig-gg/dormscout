import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PRIMARY = '#E8622E';
const SECONDARY = '#5BADA8';
const CENTER = [10.3157, 123.8854];

const orangePinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="${PRIMARY}"/>
    <circle cx="15" cy="14" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
});

const BLUE = '#2563EB';

function makeBlueLabel(abbr) {
  const parts = abbr.split(/[-\s]+/);
  const isMultiLine = parts.length > 1 && abbr.length > 5;
  const fontSize = abbr.length > 6 ? 7 : abbr.length > 4 ? 8 : 9;

  let textHtml;
  if (isMultiLine) {
    const line1 = parts[0];
    const line2 = parts.slice(1).join(' ');
    textHtml = `<text x="22" y="18" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-weight="700" font-family="sans-serif">${line1}</text>
      <text x="22" y="${18 + fontSize + 1}" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-weight="700" font-family="sans-serif">${line2}</text>`;
  } else {
    textHtml = `<text x="22" y="24" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-weight="700" font-family="sans-serif">${abbr}</text>`;
  }

  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
      <path d="M22 0C9.85 0 0 9.85 0 22c0 15.4 22 34 22 34s22-18.6 22-34C44 9.85 34.15 0 22 0z" fill="${BLUE}"/>
      ${textHtml}
    </svg>`,
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -56],
  });
}

const DORMS = [
  { name: 'Sunshine Boarding House', location: 'Cebu City', coords: [10.3157, 123.8854] },
  { name: 'BlueSky Apartments', location: 'Mandaue', coords: [10.3319, 123.9174] },
  { name: 'Casa Mariposa', location: 'Lapu-Lapu City', coords: [10.3096, 123.9446] },
];

const UNIVERSITIES = [
  { name: 'Cebu Institute of Technology - University', abbr: 'CIT', coords: [10.29457049495325, 123.8810696234642] },
  { name: 'University of San Carlos - Downtown', abbr: 'USC-DC', coords: [10.299533411273078, 123.89894228028311] },
  { name: 'University of the Visayas', abbr: 'UV', coords: [10.298701521575332, 123.90136409833146] },
  { name: 'University of Cebu - Main', abbr: 'UC Main', coords: [10.29859134168097, 123.89769041976133] },
  { name: 'University of San Carlos - Talamban', abbr: 'USC-TC', coords: [10.352530648303398, 123.91257785415208] },
  { name: 'University of Cebu - Banilad', abbr: 'UC Banilad', coords: [10.338903100091237, 123.91192294436264] },
  { name: 'University of Cebu - METC', abbr: 'UC METC', coords: [10.287151042846553, 123.87788175785442] },
  { name: 'University of San Jose-Recoletos - Main', abbr: 'USJR Main', coords: [10.294176444197102, 123.89750739647967] },
  { name: 'University of San Jose-Recoletos - Basak', abbr: 'USJR Basak', coords: [10.290123577674795, 123.8624596247838] },
  { name: 'Cebu Normal University', abbr: 'CNU', coords: [10.301911563323149, 123.8962597988632] },
  { name: 'University of the Philippines Cebu', abbr: 'UP', coords: [10.32250556542723, 123.89824335176846] },
  { name: 'Southwestern University PHINMA', abbr: 'SWU', coords: [10.303344727301218, 123.89140215600317] },
  { name: 'Cebu Technological University', abbr: 'CTU', coords: [10.297444457685753, 123.90659062522744] },
  { name: 'Saint Theresa\'s College', abbr: 'STC', coords: [10.3127944559912, 123.89601129648001] },
];

export default function Map({ darkMode = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const uniMarkersRef = useRef([]);
  const [search, setSearch] = useState('');
  const [selectedDorm, setSelectedDorm] = useState(null);

  const filteredDorms = DORMS.filter((dorm) =>
    dorm.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    dorm.location.toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: CENTER,
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    // Add university markers (always visible)
    uniMarkersRef.current = UNIVERSITIES.map((uni) => {
      const marker = L.marker(uni.coords, { icon: makeBlueLabel(uni.abbr) }).addTo(mapInstance.current);
      marker.bindPopup(`<strong>${uni.name}</strong>`);
      return marker;
    });

    return () => {
      mapInstance.current.remove();
      mapInstance.current = null;
      uniMarkersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filteredDorms.map((dorm) => {
      const marker = L.marker(dorm.coords, { icon: orangePinIcon }).addTo(mapInstance.current);
      marker.bindPopup(`<strong>${dorm.name}</strong><br/>${dorm.location}`);
      return marker;
    });
  }, [filteredDorms]);

  useEffect(() => {
    if (selectedDorm && mapInstance.current) {
      mapInstance.current.setView(selectedDorm.coords, 14, {
        animate: true,
      });
    }
  }, [selectedDorm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dorms"
            style={{
              minWidth: '260px',
              padding: '12px 16px',
              borderRadius: '14px',
              border: `1px solid ${SECONDARY}`,
              fontSize: '14px',
              outline: 'none',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            height: '520px',
            borderRadius: '28px',
            overflow: 'hidden',
            border: `1px solid ${SECONDARY}`,
            background: '#fff',
          }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: darkMode ? 'rgba(22,33,62,0.9)' : 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            fontSize: '13px',
            color: darkMode ? '#eaeaea' : '#333',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>Legend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="16" height="22" viewBox="0 0 30 42">
                <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill={PRIMARY}/>
                <circle cx="15" cy="14" r="6" fill="#fff"/>
              </svg>
              <span>Dorms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="22" viewBox="0 0 30 42">
                <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill={BLUE}/>
                <circle cx="15" cy="14" r="6" fill="#fff"/>
              </svg>
              <span>Universities</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}>
          {filteredDorms.length === 0 ? (
            <div style={{
              padding: '24px',
              borderRadius: '20px',
              background: darkMode ? '#16213e' : '#fff',
              border: `1px solid ${SECONDARY}`,
              color: darkMode ? '#fff' : '#333',
            }}>
              No dorms found. Try another search term.
            </div>
          ) : (
            filteredDorms.map((dorm) => (
              <button
                key={dorm.name}
                type="button"
                onClick={() => setSelectedDorm(dorm)}
                style={{
                  padding: '18px',
                  borderRadius: '22px',
                  border: `1px solid ${SECONDARY}`,
                  background: darkMode ? '#16213e' : '#fff',
                  color: darkMode ? '#fff' : '#333',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{dorm.name}</div>
                <div style={{ color: darkMode ? '#a0a0b0' : '#666', fontSize: '13px' }}>{dorm.location}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
