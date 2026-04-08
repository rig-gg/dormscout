import React from 'react';
import Listings from './components/Listings';

export default function ListingPage({ darkMode = false }) {
  return (
    <div>
      <Listings mode="board" />
    </div>
  );
}
