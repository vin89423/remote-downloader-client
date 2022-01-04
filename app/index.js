'use strict';

const config = require('../config');
const express = require('express');
const app = express();

// Set trust proxy
app.set('trust proxy', config.TRUST_PROXY);

// serve static files
app.use(express.static('public/', { etag: false }));

// session
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  resave: false,
  secret: config.SESSION_SECRET,
  saveUninitialized: true
}));

// express parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());

// view engine
app.set('views', './app/views');
app.set('view engine', 'pug');

// route
app.use(require('./routes'));

// export
module.exports = app;









