module.exports = {
  API_URL: process.env.API_URL ||
      (process.env.NODE_ENV === 'production' ?
          'https://api.scrol.ly' : 'http://localhost:8000'),
  ASSET_DRAG_TYPE: 'text/asset',
  PRESET_DRAG_TYPE: 'text/preset',
  DEFAULT_NAME: 'Untitled project',
  FILE_DRAG_TYPE: 'Files',
  JSON_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};
