import React from 'react';

const Error = () => {

  return (
    <div className="empty" style={{ background: '#fff' }}>
      <div className="empty-icon"><i className="icon icon-3x icon-flag" /></div>
      <p className="empty-title h5">There was an error</p>
      <p className="empty-subtitle">Try refreshing the page.</p>
    </div>
  );
}

export default Error;
