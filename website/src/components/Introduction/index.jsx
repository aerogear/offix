import React from 'react';

export function Introduction() {
  return(
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#009CC6'
    }}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>
              <div>
                <h1 className="title">Offline First!</h1>
                <p style={{ width: '80%' }}>Offix allows you to execute your GraphQL mutations and queries while your application is offline (or while the server is unreachable). Offline Mutations are scheduled and persisted (across application restarts) and are replayed when server becomes available again.</p>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <img src={'img/undraw_contrast.svg'} style={{ width: '80%', margin: '0 auto' }} alt=""/>
          </div>
        </div>
      </div>
    </div>
  );
}
