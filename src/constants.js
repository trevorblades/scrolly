const React = require('react');

module.exports = {
  API_URL: process.env.API_URL ||
      (process.env.NODE_ENV === 'production' ?
          'https://api.scrol.ly' : 'http://localhost:8000'),
  ASSET_DRAG_TYPE: 'text/asset',
  SHAPE_DRAG_TYPE: 'text/shape',
  DEFAULT_NAME: 'Untitled project',
  FILE_DRAG_TYPE: 'Files',
  JSON_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  SHAPES: {
    circle: (
      <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
        <circle cx={51} cy={51} r={50}/>
      </svg>
    ),
    square: (
      <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
        <rect height={100} width={100} x={1} y={1}/>
      </svg>
    )
  }
};
