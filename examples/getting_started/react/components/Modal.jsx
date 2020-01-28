import React from 'react';

const Modal = ({
  title, subtitle, active, close, Component
}) => {

  const modalClassName = (!active) ? 'modal' : 'modal active';

  return (
    <div className={modalClassName}>
      <a href="#close" onClick={close} className="modal-overlay" aria-label="Close" />
      <div className="modal-container">
        <div className="hero hero-sm bg-white">
          <div className="hero-body">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <div>
          <Component />
        </div>
      </div>
    </div>
  );
};

export default Modal;
