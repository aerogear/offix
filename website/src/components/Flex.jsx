import React from 'react';

export function Flex({ height, width, alignItems, justifyContent, margin, children }) {
  return (
    <div className="flex" style={{
      width, height, alignItems, justifyContent,
      margin
    }}>
      <div>
        { children }
      </div>
    </div>
  );
}

Flex.defaultProps = {
  width: '100%',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto'
}