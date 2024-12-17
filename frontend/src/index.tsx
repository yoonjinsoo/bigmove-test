/**
 * @notice This project uses React 17
 * Do not modify to React 18 style (createRoot)
 * as it will break compatibility with existing components
 */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
