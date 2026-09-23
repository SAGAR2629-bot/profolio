import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/api';

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  // Inspector & Reference Checking Modal
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [references, setReferences] = useState([]);
  const [checkingRefs, setCheckingRefs] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchMedia = async () => {
    try {
      const data = await api.getMedia();
      setMediaList(data);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to fetch media assets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus({ type: '', text: '' });

    try {
      const uploaded = await api.uploadMedia(file, file.name, file.name);
      setStatus({ type: 'success', text: `Uploaded and optimized "${uploaded.filename}" (${uploaded.width}x${uploaded.height}px).` });
      fetchMedia();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleInspect = async (media) => {
    setSelectedMedia(media);
    setCheckingRefs(true);
    setReferences([]);

    try {
      const refData = await api.getMediaReferences(media.id);
      setReferences(refData.references || []);
    } catch (err) {
      console.warn("Reference check failed:", err.message);
    } finally {
      setCheckingRefs(false);
    }
  };

  const handleCopyUrl = (media) => {
    const fullUrl = media.public_url.startsWith('http')
      ? media.public_url
      : `${API_BASE_URL}${media.public_url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(media.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (media, force = false) => {
    try {
      await api.deleteMedia(media.id, force);
      setStatus({ type: 'success', text: `Media asset "${media.filename}" removed.` });
      setSelectedMedia(null);
      fetchMedia();
    } catch (err) {
      alert(`Deletion rejected: ${err.message}`);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    (m.filename || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) return <div className="admin-loading-state">Accessing media vault...</div>;

  return (
    <div className="media-library-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Centralized Media Library</h1>
          <p className="page-subtitle">Upload, inspect references, and manage Pillow-optimized image assets</p>
        </div>
        <div className="page-header-actions">
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {uploading ? 'Processing & Optimizing...' : '⬆ Upload Image (.jpg, .png, .webp)'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {status.text && (
        <div className={status.type === 'error' ? 'admin-error-banner' : 'badge badge-published'} style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%' }}>
          {status.text}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search media assets by filename, title, or alt text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredMedia.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
          No media assets found matching search criteria. Upload images to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {filteredMedia.map((media) => (
            <div key={media.id} className="admin-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  height: '140px',
                  background: '#0B0F17',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleInspect(media)}
                title="Click to inspect metadata and references"
              >
                <img
                  src={media.public_url}
                  alt={media.alt_text || media.filename}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: '#FFFFFF', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {media.filename}
                </strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                  <span>{media.width && media.height ? `${media.width}×${media.height}` : 'Image'}</span>
                  <span>{formatBytes(media.file_size)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleCopyUrl(media)}
                >
                  {copiedId === media.id ? '✓ Copied!' : 'Copy URL'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleInspect(media)}
                  title="Inspect references and safety"
                >
                  🔍
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspector & Reference Modal */}
      {selectedMedia && (
        <div className="modal-overlay" onClick={() => setSelectedMedia(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-card-title">Media Inspector: {selectedMedia.filename}</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedMedia(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'center', background: '#0B0F17', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <img
                  src={selectedMedia.public_url}
                  alt=""
                  style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div className="system-specs-list" style={{ marginBottom: '1.5rem' }}>
                <div className="spec-row">
                  <span className="spec-label">Storage Path:</span>
                  <span className="spec-value mono">{selectedMedia.storage_path}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Public URL:</span>
                  <span className="spec-value mono">{selectedMedia.public_url}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Dimensions:</span>
                  <span className="spec-value">{selectedMedia.width} × {selectedMedia.height} px</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">MIME Type:</span>
                  <span className="spec-value mono">{selectedMedia.mime_type}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">File Size:</span>
                  <span className="spec-value">{formatBytes(selectedMedia.file_size)}</span>
                </div>
              </div>

              {/* Reference Check Section */}
              <div className="admin-card">
                <h3 className="admin-card-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Safety Check: Active Content References
                </h3>

                {checkingRefs ? (
                  <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Scanning database relations...</p>
                ) : references.length === 0 ? (
                  <p style={{ color: '#10B981', fontSize: '0.85rem' }}>
                    ✓ This asset is NOT referenced by any project, achievement, or certificate. It is safe to delete.
                  </p>
                ) : (
                  <div>
                    <p style={{ color: '#F59E0B', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      ⚠ This asset is actively referenced by {references.length} item(s). Deleting it will create broken references unless removed first!
                    </p>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#D1D5DB' }}>
                      {references.map((ref, idx) => (
                        <li key={idx}>
                          <strong>[{ref.type}]</strong> {ref.name} — <em>{ref.role}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (references.length > 0) {
                    if (window.confirm(`Warning: This asset is used in ${references.length} location(s). Force delete anyway?`)) {
                      handleDelete(selectedMedia, true);
                    }
                  } else {
                    if (window.confirm(`Permanently delete "${selectedMedia.filename}"?`)) {
                      handleDelete(selectedMedia, false);
                    }
                  }
                }}
              >
                🗑 Delete Media Asset
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedMedia(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
