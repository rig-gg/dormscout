import React, { useState, useEffect, useRef } from 'react';

// Simple listings manager used by DashboardLandlord
// Stores listings in localStorage under key 'dormscout_listings'

export default function Listings() {
  const STORAGE_KEY = 'dormscout_listings';
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', address: '', price: '', rooms: '', description: '', images: [] });
  const [imageFiles, setImageFiles] = useState([]); // File objects selected but not yet saved
  const [previewUrls, setPreviewUrls] = useState([]); // object URLs for previews of selected files
  const [errors, setErrors] = useState({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setListings(JSON.parse(raw));
      } else {
        // seed example data if none
        const seed = [
          { id: Date.now(), title: 'Sunshine Boarding House', address: '123 Campus Rd', price: '3500', rooms: 'Single/Double', description: 'Cozy place near campus', images: [] }
        ];
        setListings(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (e) {
      console.error('Failed to load listings', e);
    }

    return () => {
      mountedRef.current = false;
      // revoke any created object URLs
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Broadcast listings changes to the rest of the app
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error('Failed to save listings', e);
    }
    try {
      const evt = new CustomEvent('dormscout:listingsUpdated', { detail: listings });
      window.dispatchEvent(evt);
    } catch (e) {
      // ignore
    }
  }, [listings]);

  function resetForm() {
    setForm({ title: '', address: '', price: '', rooms: '', description: '', images: [] });
    // revoke preview urls and clear
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setImageFiles([]);
    setErrors({});
    setEditingId(null);
  }

  function validateForm() {
    const next = {};
    if (!form.title || !form.title.trim()) next.title = 'Title is required';
    if (!form.price || isNaN(Number(form.price))) next.price = 'Enter a numeric price';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // helper: convert File objects to data URLs
  function filesToDataUrls(files) {
    const readers = Array.from(files).map((file) => new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    }));
    return Promise.all(readers);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!validateForm()) return;

    let images = form.images || [];
    if (imageFiles && imageFiles.length > 0) {
      try {
        const dataUrls = await filesToDataUrls(imageFiles);
        images = [...images, ...dataUrls].slice(0, 3); // enforce max 3 images
      } catch (err) {
        console.error('Failed to read images', err);
      }
    }

    const newListing = { id: Date.now(), ...form, images };
    setListings((s) => [newListing, ...s]);
    resetForm();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!validateForm()) return;

    let images = form.images || [];
    if (imageFiles && imageFiles.length > 0) {
      try {
        const dataUrls = await filesToDataUrls(imageFiles);
        images = [...images, ...dataUrls].slice(0, 3);
      } catch (err) {
        console.error('Failed to read images', err);
      }
    }

    setListings((s) => s.map((l) => (l.id === editingId ? { ...l, ...form, images } : l)));
    resetForm();
  }

  function startEdit(listing) {
    setEditingId(listing.id);
    setForm({ title: listing.title || '', address: listing.address || '', price: listing.price || '', rooms: listing.rooms || '', description: listing.description || '', images: listing.images || [] });
    // clear previous previews
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setImageFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeListing(id) {
    if (!window.confirm('Delete this listing?')) return;
    setListings((s) => s.filter((l) => l.id !== id));
  }

  function handleFileChange(e) {
    const files = e.target.files;
    if (!files) return;
    const allowed = Array.from(files).slice(0, 3); // limit selection

    // revoke previous preview urls
    previewUrls.forEach((u) => URL.revokeObjectURL(u));

    const urls = allowed.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setImageFiles(allowed);
  }

  function removeSelectedFile(index) {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    // revoke old urls and make new ones
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setImageFiles(newFiles);
    setPreviewUrls(urls);
  }

  function removeExistingImage(index) {
    // remove image from form.images when editing
    const imgs = (form.images || []).slice();
    imgs.splice(index, 1);
    setForm((f) => ({ ...f, images: imgs }));
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginTop: 0 }}>Manage Listings</h3>
        <p style={{ color: '#666', marginTop: 4 }}>Add, edit, and remove listings. Data is saved locally in your browser (localStorage).</p>

        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Listing title" style={{ height: 44, padding: '8px 12px', borderRadius: 8, width: '100%' }} />
              {errors.title && <div style={{ color: 'crimson', fontSize: 13, marginTop: 6 }}>{errors.title}</div>}
            </div>

            <div>
              <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="Price (e.g., 3500)" style={{ height: 44, padding: '8px 12px', borderRadius: 8, width: '100%' }} />
              {errors.price && <div style={{ color: 'crimson', fontSize: 13, marginTop: 6 }}>{errors.price}</div>}
            </div>

            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Address" style={{ height: 44, padding: '8px 12px', borderRadius: 8 }} />
            <input value={form.rooms} onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))} placeholder="Rooms (e.g., Single, Double)" style={{ height: 44, padding: '8px 12px', borderRadius: 8 }} />
          </div>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" style={{ width: '100%', marginTop: 12, height: 100, padding: 12, borderRadius: 8 }} />

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Upload images (max 3)</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {/* preview selected image files with remove button */}
              {previewUrls && previewUrls.length > 0 && previewUrls.map((url, idx) => (
                <div key={`preview-${idx}`} style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee', position: 'relative' }}>
                  <img src={url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeSelectedFile(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>x</button>
                </div>
              ))}

              {/* preview existing images on edit with remove option */}
              {form.images && form.images.length > 0 && form.images.map((src, idx) => (
                <div key={`existing-${idx}`} style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee', position: 'relative' }}>
                  <img src={src} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeExistingImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>x</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button type="submit" style={{ padding: '10px 16px', background: '#E8622E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'Update Listing' : 'Add Listing'}</button>
            {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px 16px', background: '#fff', color: '#E8622E', border: '1px solid #E8622E', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>}
          </div>
        </form>

        <div>
          {listings.length === 0 ? (
            <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>No listings yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {listings.map((l) => (
                <div key={l.id} style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {l.images && l.images[0] ? (
                      <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                        <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : null}
                    <div>
                      <div style={{ fontWeight: 700 }}>{l.title}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>{l.address} • ₱{l.price} • {l.rooms}</div>
                      {l.description && <div style={{ marginTop: 8, color: '#444' }}>{l.description}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(l)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => removeListing(l.id)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside style={{ width: 320 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
          <h4 style={{ marginTop: 0 }}>Listing Tips</h4>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            <li>Use a clear, descriptive title.</li>
            <li>Include price and room types.</li>
            <li>Add a short description for better clicks.</li>
            <li>Keep listings up to date.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
