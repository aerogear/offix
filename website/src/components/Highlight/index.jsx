import React from 'react';

export function Highlight() {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#FFA939'
    }}>
      <h1 className="gradient--text">Some text here</h1>
    </div>
  );
}