import React from 'react';

const GuestCard = ({ guest, onUpdate, onImageClick }) => {
  const handleBlur = (field, e) => {
    onUpdate(guest.id, field, e.target.innerText);
  };

  return (
    <div className="guest-card">
      <div
        className="guest-img editable-img"
        style={{ backgroundImage: `url('${guest.image}')` }}
        role="img"
        aria-label={`Guest ${guest.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(guest.id);
        }}
      />
      <div
        className="guest-name"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleBlur('name', e)}
      >
        {guest.name}
      </div>
      <div
        className="guest-title"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleBlur('title', e)}
      >
        {guest.title}
      </div>
    </div>
  );
};

export default GuestCard;
