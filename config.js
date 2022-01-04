require('dotenv').config();

const config = {
  // Node
  TRUST_PROXY:                  ['127.0.0.1'],
  APP_NAME:                     process.env.APP_NAME || 'Remote-Downloader-Client',
  BASE_URL:                     process.env.BASE_URL || 'http://localhost:6901/',
  PORT:                         process.env.PORT || 6901,

  // Password And Auth
  SESSION_SECRET:               process.env.SESSION_SECRET || 'DUMMY',

  API_URL:                      process.env.API_URL || 'http://localhost:6900/'

};

module.exports = config;