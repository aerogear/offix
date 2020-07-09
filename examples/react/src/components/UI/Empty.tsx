import React from 'react';

export const Empty = () => {
  return (
    <div className="empty" style={{ background: '#fff' }}>
      <div className="empty-icon"><i className="icon icon-3x icon-flag" /></div>
      <p className="empty-title h5">You have no todo items</p>
      <p className="empty-subtitle">Click the button to create a new task</p>
    </div>
  );
};
