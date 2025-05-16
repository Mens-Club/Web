import React from 'react';
import Modal from './Modal';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onCancel, onConfirm, title, message }) {
  const actions = (
    <>
      <button className="modal-cancel-button" onClick={onCancel}>
        취소
      </button>
      <button className="modal-confirm-button" onClick={onConfirm}>
        확인
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} actions={actions}>
      <p className="confirm-message">{message}</p>
    </Modal>
  );
}

export default ConfirmModal;
