import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './StudentGallery.css';

export default function StudentGallery() {
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewingMedia, setViewingMedia] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/');
      return;
    }
    fetchMedia();

    const handler = (e) => {
      if (e.key === 'mediaUpdated') {
        fetchMedia();
      }
    };
    window.addEventListener('storage', handler);

    const interval = setInterval(fetchMedia, 15000);
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, [navigate]);

  const fetchMedia = async () => {
    try {
      const res = await api.get('/api/media');
      setMedia(res.data);
    } catch (err) {
      console.error('Error fetching media:', err);
    }
  };



  const handleVote = (item) => {
    setSelectedMedia(item);
    setShowVoteModal(true);
  };

  const handleView = (item) => {
    setViewingMedia(item);
    setViewModal(true);
  };

  const confirmVote = async () => {
    try {
      const voteEndpoint = selectedMedia.type === 'photo' ? '/api/vote/photo' : '/api/vote/video';
      const res = await api.post(voteEndpoint, {
        mediaId: selectedMedia._id
      });
      
      if (res.data.student) {
        localStorage.setItem('studentInfo', JSON.stringify(res.data.student));
      }
      
      alert('Vote submitted successfully! 🎆');
      setShowVoteModal(false);
      fetchMedia();
    } catch (err) {
      console.error('Vote error:', err);
      alert(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    navigate('/');
  };

  const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
  const votedPhotoId = studentInfo.votedPhoto;
  const votedVideoId = studentInfo.votedVideo;
  const hasVotedPhoto = !!votedPhotoId;
  const hasVotedVideo = !!votedVideoId;

  const votedPhoto = votedPhotoId ? media.find(m => m._id === votedPhotoId) : null;
  const votedVideo = votedVideoId ? media.find(m => m._id === votedVideoId) : null;
  
  const otherMedia = media.filter(m => 
    m._id !== votedPhotoId && m._id !== votedVideoId
  );

  const filteredOtherMedia = filter === 'all' 
    ? otherMedia 
    : otherMedia.filter(m => m.type === filter);

  const votedMedia = [];
  if (votedPhoto && (filter === 'all' || filter === 'photo')) {
    votedMedia.push(votedPhoto);
  }
  if (votedVideo && (filter === 'all' || filter === 'video')) {
    votedMedia.push(votedVideo);
  }

  return (
    <div className="gallery-container">
      {/* hero with event logo */}
      <div className="gallery-hero">
        <img
          src="/assets/event-logo.png"
          alt="Event Logo"
          className="event-logo"
        />
      </div>

      <div className="gallery-header">
        <div className="header-left">
          <h1>📸 Photo & Video Gallery</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Celebratory banner when voted */}
      {(hasVotedPhoto || hasVotedVideo) && (
        <div className="celebration-banner">
          <div className="confetti">🎉</div>
          <span className="celebration-title">You have voted! 🎆</span>
          <div className="confetti">🎊</div>
        </div>
      )}

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'photo' ? 'active' : ''} 
          onClick={() => setFilter('photo')}
        >
          Photos
        </button>
        <button 
          className={filter === 'video' ? 'active' : ''} 
          onClick={() => setFilter('video')}
        >
          Videos
        </button>
      </div>

      {/* Rules Section */}
      <div className="rules-section">
        <h3 className="rules-title">📋 Voting Rules</h3>
        <ul className="rules-list">
          <li>🖼️ Vote for <strong>1 photo only</strong></li>
          <li>🎥 Vote for <strong>1 video only</strong></li>
          <li>👁️ <strong>View and confirm</strong> your vote before submitting</li>
          <li>🔒 Once voted, you <strong>cannot re-vote</strong></li>
        </ul>
      </div>

      {/* Show voted media at top */}
      {votedMedia.length > 0 && (
        <div className="voted-section">
          <h2>✨ Your Votes ✨</h2>
          <div className="gallery-grid">
            {votedMedia.map((item) => (
              <div key={item._id} className="gallery-card voted-card">
                {item.type === 'photo' ? (
                  <img
                    src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
                    alt={item.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <video
                    src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
                    controls
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <button className="view-btn" onClick={() => handleView(item)}>
                    👁 View
                  </button>
                  <button className="voted-btn" disabled>You Voted ✓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other media */}
      <div className="other-section">
        <h2>{votedMedia.length > 0 ? 'Other Media' : 'Gallery'}</h2>
        <div className="gallery-grid">
{filteredOtherMedia.map((item) => {
            const hasVoted = item.type === 'photo' ? hasVotedPhoto : hasVotedVideo;
            return (
              <div key={item._id} className="gallery-card">
                {item.type === 'photo' ? (
                  <img
                    src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
                    alt={item.title}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <video
                    src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
                    controls
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <button className="view-btn" onClick={() => handleView(item)}>
                    👁 View
                  </button>
                  {hasVoted ? (
                    <button className="voted-btn" disabled>You Voted ✓</button>
                  ) : (
                    <button className="vote-btn" onClick={() => handleVote(item)}>
                      Vote
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredOtherMedia.length === 0 && votedMedia.length === 0 && (
        <p className="no-media">No media found.</p>
      )}

      {/* Vote Confirmation Modal */}
      {showVoteModal && (
        <div className="modal-overlay" onClick={() => setShowVoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Vote</h2>
            <p>Are you sure you want to vote for "{selectedMedia?.title}"?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmVote}>Yes, Vote!</button>
              <button className="cancel-btn" onClick={() => setShowVoteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Media Modal */}
      {viewModal && viewingMedia && (
        <div className="view-modal-overlay" onClick={() => setViewModal(false)}>
          <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-view-btn" onClick={() => setViewModal(false)}>✕</button>
            <h2>{viewingMedia.title}</h2>
{viewingMedia.type === 'photo' ? (
              <img 
                src={viewingMedia.url.startsWith('http') ? viewingMedia.url : `${API_BASE_URL}${viewingMedia.url}`} 
                alt={viewingMedia.title} 
                className="full-media"
              />
            ) : (
              <video 
                src={viewingMedia.url.startsWith('http') ? viewingMedia.url : `${API_BASE_URL}${viewingMedia.url}`} 
                controls 
                className="full-media"
              />
            )}
            <p className="media-type">{viewingMedia.type === 'photo' ? '📷 Photo' : '🎬 Video'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
