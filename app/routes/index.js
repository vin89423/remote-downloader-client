'use strict';

const express = require('express');
const router = express.Router();
const createHttpError = require('http-errors');
const helper = require('../services/helper');

router.use((req, res, next) => {
  res.locals.req = req;
  req.helper = {...helper.url, ...helper.string, ...helper.network };
  res.locals = { ...res.locals, ...req.helper };

  res.locals.loggedIn = !!req.session.accessCookie;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    if (req.session.errorMsg) {
      res.locals.errorMsg = req.session.errorMsg;
      delete req.session.errorMsg;
    }
    if (!req.session.accessCookie) {
      return res.render('login');
    } else {
      return res.render('list');
    }
  } catch (error) {
    next(error);
  }
});

router.use('/relay', require('./relay'));

router.use('/icons', require('./icons'));

router.all('/session', async (req, res, next) => {
  return res.json(req.session);
});

router.all('*', (req, res, next) => next(createHttpError(404, 'Page Not Found')));

// error handler
router.use((error, req, res, next) => {
  console.error(`URL: ${req.url}\n`, error);
  const errNo = error.statusCode || 500;
  return res.status(errNo).send(error.message);
});

module.exports = router;