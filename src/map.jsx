import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PRIMARY = '#E8622E';
const SECONDARY = '#5BADA8';
const CENTER = [10.3157, 123.8854];

const DORMS = [
  { name: 'Sunshine Boarding House', location: 'Cebu City', coords: [10.3157, 123.8854] },
  { name: 'BlueSky Apartments', location: 'Mandaue', coords: [10.3319, 123.9174] },
  { name: 'Casa Mariposa', location: 'Lapu-Lapu City', coords: [10.3096, 123.9446] },
];

export default function Map({ darkMode = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
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
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filteredDorms.map((dorm) => {
      const marker = L.marker(dorm.coords).addTo(mapInstance.current);
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            }}
          />
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              border: 'none',
              background: PRIMARY,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
      }}>
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
