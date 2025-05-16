import React from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {title && <h2 className="modal-title">{title}</h2>}
          <div className="modal-body">{children}</div>
          {actions && <div className="modal-actions">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export default Modal;
