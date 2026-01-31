import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import GuestCard from './components/GuestCard';
import './App.css'; // Make sure to import this if we add styles later, otherwise purely index.css

function App() {
  const [posterImage, setPosterImage] = useState(
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop'
  );

  const [logo, setLogo] = useState({ type: 'default' }); // type: 'default' | 'image'

  const [texts, setTexts] = useState({
    tagline: 'Exclusive Event',
    title: 'DESIGN FUTURE',
    description: 'Join us for a night of innovation and art. Meet the visionaries shaping tomorrow.',
    dateLabel: 'Date',
    dateValue: 'OCT 24',
    locationLabel: 'Location',
    locationValue: 'NY CITY'
  });

  const [guests, setGuests] = useState([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      name: 'Sarah J.',
      title: 'Designer'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
      name: 'Mike T.',
      title: 'Artist'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      name: 'Emma W.',
      title: 'Architect'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      name: 'Jessica L.',
      title: 'Innovator'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      name: 'David R.',
      title: 'Tech Lead'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      name: 'Anna K.',
      title: 'Strategy'
    }
  ]);

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // 'logo', 'poster', or guestId
  const [editingTarget, setEditingTarget] = useState(null);

  const fileInputRef = useRef(null);
  const posterRef = useRef(null);

  // --- Handlers ---

  const handleTextUpdate = (field, value) => {
    setTexts(prev => ({ ...prev, [field]: value }));
  };

  const updateGuest = (id, field, value) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleImageClick = (target) => {
    setEditingTarget(target);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newUrl = event.target.result;

      if (editingTarget === 'logo') {
        setLogo({ type: 'image', src: newUrl });
      } else if (editingTarget === 'poster') {
        setPosterImage(newUrl);
      } else {
        // assume editingTarget is guest ID
        setGuests(prev => prev.map(g => g.id === editingTarget ? { ...g, image: newUrl } : g));
      }

      // Reset input
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const addGuest = () => {
    if (guests.length >= 9) {
      alert('Maximum 9 guests allowed.');
      return;
    }
    const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
    setGuests(prev => [
      ...prev,
      {
        id: newId,
        image: 'https://placehold.co/400x400/2a2a2a/ffffff?text=Add+Image',
        name: 'Name',
        title: 'Title'
      }
    ]);
  };

  const removeGuest = () => {
    if (guests.length === 0) return;
    setGuests(prev => prev.slice(0, -1));
  };

  const generateCanvas = async () => {
    if (!posterRef.current) return null;

    const originalBorderRadius = posterRef.current.style.borderRadius;
    const originalBoxShadow = posterRef.current.style.boxShadow;

    // Handle Title Gradient (html2canvas issue with background-clip: text)
    const titleEl = posterRef.current.querySelector('h1');
    const prevTitleStyle = {
      background: titleEl.style.background,
      webkitBackgroundClip: titleEl.style.webkitBackgroundClip,
      webkitTextFillColor: titleEl.style.webkitTextFillColor,
      color: titleEl.style.color
    };

    // Remove rounded corners and shadow for a clean full-bleed PDF/Image
    posterRef.current.style.borderRadius = '0';
    posterRef.current.style.boxShadow = 'none';

    // Apply safe styles for Title
    titleEl.style.background = 'none';
    titleEl.style.webkitBackgroundClip = 'unset';
    titleEl.style.webkitTextFillColor = 'unset';
    titleEl.style.color = '#ffffff';

    const canvas = await html2canvas(posterRef.current, {
      scale: 4, // High quality
      useCORS: true,
      backgroundColor: null,
    });

    // Restore original styles
    posterRef.current.style.borderRadius = originalBorderRadius;
    posterRef.current.style.boxShadow = originalBoxShadow;
    titleEl.style.background = prevTitleStyle.background;
    titleEl.style.webkitBackgroundClip = prevTitleStyle.webkitBackgroundClip;
    titleEl.style.webkitTextFillColor = prevTitleStyle.webkitTextFillColor;
    titleEl.style.color = prevTitleStyle.color;

    return canvas;
  };

  const handleDownloadPDF = async () => {
    setShowDownloadModal(false);
    const canvas = await generateCanvas();
    if (!canvas) return;

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to match A4
    const pdfWidth = 210;
    const pdfHeight = (canvas.height / canvas.width) * 210;

    const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('poster.pdf');
  };

  const handleDownloadImage = async () => {
    setShowDownloadModal(false);
    const canvas = await generateCanvas();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <div className="noise"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="poster-container" ref={posterRef}>
        <div
          className="poster-image"
          style={{ backgroundImage: `url('${posterImage}')` }}
          onClick={() => handleImageClick('poster')}
          title="Click to change poster image"
        ></div>

        <div className="poster-content">
          <div>
            <div
              className="tagline"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextUpdate('tagline', e.target.innerText)}
            >
              {texts.tagline}
            </div>
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextUpdate('title', e.target.innerText)}
            >
              {texts.title}
            </h1>
            <p
              className="description"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextUpdate('description', e.target.innerText)}
            >
              {texts.description}
            </p>
          </div>

          <div>
            {guests.length > 0 && (
              <p
                className="guests-label"
                contentEditable
                suppressContentEditableWarning
              // We don't really have a state for this label text in the original plan, 
              // but user could edit it. I didn't add it to state object, let's just let it be static or add it if needed.
              // For now, I'll leave it editable visually but not saved to state (gets reset on reload), 
              // or I can add it to state. Let's add it to state for completeness.
              >
                Special Guests
              </p>
            )}

            <div className="guests-grid" data-count={guests.length}>
              {guests.map(guest => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onUpdate={updateGuest}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          </div>

          <div className="details">
            <div className="detail-item">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextUpdate('dateLabel', e.target.innerText)}
              >
                {texts.dateLabel}
              </span>
              <h3
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextUpdate('dateValue', e.target.innerText)}
              >
                {texts.dateValue}
              </h3>
            </div>
            <div className="detail-item">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextUpdate('locationLabel', e.target.innerText)}
              >
                {texts.locationLabel}
              </span>
              <h3
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextUpdate('locationValue', e.target.innerText)}
              >
                {texts.locationValue}
              </h3>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div
          className="logo"
          title="Click to change logo"
          onClick={() => handleImageClick('logo')}
        >
          {logo.type === 'default' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span>NEXUS</span>
            </>
          ) : (
            <img
              src={logo.src}
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
              alt="Logo"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="control-btn add-btn" onClick={addGuest}>Add Guest</button>
        <button className="control-btn remove-btn" onClick={removeGuest}>Remove Guest</button>
        <button className="control-btn download-btn" onClick={() => setShowDownloadModal(true)}>Download PDF</button>
      </div>

      {/* Download Selection Modal */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }} onClick={() => setShowDownloadModal(false)}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            color: 'white'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Select Format</h3>
            <button className="cta-btn" onClick={handleDownloadPDF}>Download PDF</button>
            <button className="cta-btn" onClick={handleDownloadImage}>Download Photo (HQ)</button>
            <button
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                marginTop: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => setShowDownloadModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
}

export default App;
