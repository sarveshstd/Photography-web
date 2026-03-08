import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [viewMode, setViewMode] = useState('leaderboard'); // 'leaderboard' or 'voters'
  const [votersData, setVotersData] = useState({ photos: [], videos: [] });
  const [votersTab, setVotersTab] = useState('photo'); // 'photo' or 'video'
  const [votersLoading, setVotersLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removingVote, setRemovingVote] = useState(null);
  const [showAddVoteModal, setShowAddVoteModal] = useState(false);
  const [addingVote, setAddingVote] = useState(null);
  const [addVoteRegNumber, setAddVoteRegNumber] = useState('');
  const [addVoteLoading, setAddVoteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('coordToken');
    if (!token) {
      navigate('/coordinator');
      return;
    }
    fetchMedia();
    fetchVoters();
  }, [navigate]);

  const fetchVoters = async () => {
    setVotersLoading(true);
    try {
      const res = await api.get('/api/media/voters');
      setVotersData(res.data);
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setVotersLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await api.get('/api/media');
      setMedia(res.data);
    } catch (err) {
      console.error('Error fetching media:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert('Please select a file and enter a title');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', mediaType);
    formData.append('file', file);

    try {
      await api.post('/api/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Media uploaded successfully!');
      setTitle('');
      setFile(null);
      await fetchMedia();
      await fetchVoters();
      // notify any open student galleries that media changed
      localStorage.setItem('mediaUpdated', Date.now().toString());
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await api.delete(`/api/media/${id}`);
      // refresh list from server to be sure
      await fetchMedia();
      await fetchVoters();
      alert('Deleted successfully!');
      // broadcast to student galleries that list changed
      localStorage.setItem('mediaUpdated', Date.now().toString());
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/media/${id}`, { title: editTitle });
      setEditingId(null);
      await fetchMedia();
      localStorage.setItem('mediaUpdated', Date.now().toString());
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleRemoveVote = (registerNumber, mediaId, type, title) => {
    setRemovingVote({ registerNumber, mediaId, type, title });
    setShowRemoveModal(true);
  };

  const confirmRemoveVote = async () => {
    if (!removingVote) return;
    
    try {
      await api.delete('/api/vote/remove', {
        data: {
          registerNumber: removingVote.registerNumber,
          mediaId: removingVote.mediaId,
          type: removingVote.type
        }
      });
      
      alert('Vote removed successfully and voter has been blocked!');
      setShowRemoveModal(false);
      setRemovingVote(null);
      
      // Refresh data
      await fetchVoters();
      await fetchMedia();
      
      // Notify student galleries
      localStorage.setItem('mediaUpdated', Date.now().toString());
    } catch (err) {
      console.error('Remove vote error:', err);
      alert(err.response?.data?.message || 'Failed to remove vote');
    }
  };

  const handleAddVote = (mediaId, type, title) => {
    setAddingVote({ mediaId, type, title });
    setAddVoteRegNumber('');
    setShowAddVoteModal(true);
  };

  const confirmAddVote = async () => {
    if (!addingVote || !addVoteRegNumber.trim()) {
      alert('Please enter a register number');
      return;
    }

    setAddVoteLoading(true);
    try {
      await api.post('/api/vote/coordinator-add', {
        registerNumber: addVoteRegNumber.trim(),
        mediaId: addingVote.mediaId,
        type: addingVote.type
      });
      
      alert('Vote added successfully!');
      setShowAddVoteModal(false);
      setAddingVote(null);
      setAddVoteRegNumber('');
      
      // Refresh data
      await fetchVoters();
      await fetchMedia();
      
      // Notify student galleries
      localStorage.setItem('mediaUpdated', Date.now().toString());
    } catch (err) {
      console.error('Add vote error:', err);
      alert(err.response?.data?.message || 'Failed to add vote');
    } finally {
      setAddVoteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coordToken');
    localStorage.removeItem('coordUsername');
    navigate('/coordinator');
  };

  const sortedMedia = [...media].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const currentVotersList = votersTab === 'photo' ? votersData.photos : votersData.videos;

  return (
    <div className="admin-container">
      {/* hero with event logo */}
      <div className="page-hero">
        <img
          src="/assets/event-logo.png"
          alt="Event Logo"
          className="event-logo"
          width="120"
        />
      </div>

      <div className="admin-header">
        <div className="header-left">
          <img
            src="/assets/download.png"
            alt="Download"
            className="download-logo"
            width="40"
            height="40"
          />
          <h1>Admin Dashboard</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="upload-section">
        <h2>Upload Media</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
          <input
            type="file"
            accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* View Toggle Buttons */}
      <div className="view-toggle">
        <button 
          className={viewMode === 'leaderboard' ? 'active' : ''} 
          onClick={() => setViewMode('leaderboard')}
        >
          Leaderboard
        </button>
        <button 
          className={viewMode === 'voters' ? 'active' : ''} 
          onClick={() => setViewMode('voters')}
        >
          Voters List
        </button>
      </div>

      {viewMode === 'leaderboard' ? (
        <div className="media-section">
          <h2>Leaderboard (Sorted by Votes)</h2>
          <div className="media-grid">
            {sortedMedia.map((item) => (
              <div key={item._id} className="media-card admin-card">
                {item.type === 'photo' ? (
                  <img src={`http://localhost:5000${item.url}`} alt={item.title} />
                ) : (
                  <video src={`http://localhost:5000${item.url}`} controls />
                )}
                <div className="media-info">
                  {editingId === item._id ? (
                    <div className="edit-title">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <button onClick={() => saveEdit(item._id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <h3 onClick={() => startEdit(item)}>{item.title}</h3>
                  )}
                  <p className="vote-count">Votes: {item.votes || 0}</p>
                  <div className="admin-actions">
                    <button 
                      className="add-vote-btn" 
                      onClick={() => handleAddVote(item._id, item.type, item.title)}
                    >
                      Add Vote
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {media.length === 0 && <p className="no-media">No media uploaded yet.</p>}
        </div>
      ) : (
        <div className="voters-section">
          <h2>Voters List</h2>
          
          {/* Tab buttons for Photo/Video */}
          <div className="voters-tabs">
            <button 
              className={votersTab === 'photo' ? 'active' : ''} 
              onClick={() => setVotersTab('photo')}
            >
              Photo Voters
            </button>
            <button 
              className={votersTab === 'video' ? 'active' : ''} 
              onClick={() => setVotersTab('video')}
            >
              Video Voters
            </button>
          </div>

          {votersLoading ? (
            <p className="loading">Loading voters...</p>
          ) : currentVotersList.length === 0 ? (
            <p className="no-media">No voters yet for {votersTab}s.</p>
          ) : (
            <div className="voters-list">
              {currentVotersList.map((item) => (
                <div key={item.mediaId} className="voters-card">
                  <h3>{item.title}</h3>
                  <p className="vote-count">Total Votes: {item.voteCount}</p>
                  <div className="voters-register-numbers">
                    <strong>Voters Register Numbers (Newest First):</strong>
                    {item.voters && item.voters.length > 0 ? (
                      <div className="voters-tags">
                        {/* Reverse the array to show newest first */}
                        {[...item.voters].reverse().map((regNum, index) => (
                          <div key={index} className="voter-tag-row">
                            <span className="voter-tag">{regNum}</span>
                            <button 
                              className="remove-vote-btn"
                              onClick={() => handleRemoveVote(regNum, item.mediaId, votersTab, item.title)}
                            >
                              Remove Vote
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-voters">No voters yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remove Vote Confirmation Modal */}
      {showRemoveModal && removingVote && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Remove Vote</h2>
            <p>Are you sure you want to remove the vote from:</p>
            <div className="confirm-details">
              <p><strong>Register Number:</strong> {removingVote.registerNumber}</p>
              <p><strong>Media:</strong> {removingVote.title}</p>
              <p><strong>Type:</strong> {removingVote.type}</p>
            </div>
            <p className="warning-text">This voter will be blocked and cannot vote again.</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmRemoveVote}>Yes, Remove Vote</button>
              <button className="cancel-btn" onClick={() => setShowRemoveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vote Modal */}
      {showAddVoteModal && addingVote && (
        <div className="modal-overlay" onClick={() => setShowAddVoteModal(false)}>
          <div className="add-vote-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Vote</h2>
            <p>Add a vote for:</p>
            <div className="confirm-details">
              <p><strong>Media:</strong> {addingVote.title}</p>
              <p><strong>Type:</strong> {addingVote.type}</p>
            </div>
            <div className="add-vote-form">
              <label htmlFor="regNumber">Enter Register Number:</label>
              <input
                id="regNumber"
                type="text"
                value={addVoteRegNumber}
                onChange={(e) => setAddVoteRegNumber(e.target.value)}
                placeholder="e.g., 927622bal039"
                className="reg-number-input"
                autoFocus
              />
              <p className="reg-format-hint">Format: 9276 + 22/23/24/25 + 3 letters + 2-3 numbers</p>
            </div>
            <div className="modal-buttons">
              <button 
                className="confirm-btn" 
                onClick={confirmAddVote}
                disabled={addVoteLoading || !addVoteRegNumber.trim()}
              >
                {addVoteLoading ? 'Adding...' : 'Add Vote'}
              </button>
              <button className="cancel-btn" onClick={() => setShowAddVoteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
