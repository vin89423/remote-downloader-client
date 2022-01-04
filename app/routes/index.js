'use strict';

const express = require('express');
const router = express.Router();
const createHttpError = require('http-errors');
const helper = require('../services/helper');
const config = require('../../config');

router.use(helper.prepareLocalsMiddleware);

router.all('/', async (req, res, next) => {
  try {
    if (req.method === 'POST') {
      if (!req.body.username || !req.body.password) {
        throw createHttpError(400);
      }
      try {
        const response = await req.helper.makeRequest(`${config.API_URL}auth`, 'POST', {
          username: String(req.body.username).trim(),
          password: String(req.body.password).trim()
        });
        if (response.status !== 200) {
          res.locals.errorMsg = await response.text();
        }

        let accessCookie = {};
        response.headers.get('set-cookie')
          .replace(/\;\s?HttpOnly\s?$/i, '')
          .split('; ')
          .map(part => {
            let parts = part.split('=');
            if (['connect.sid'].includes(parts[0]))
              accessCookie[parts[0]] = parts[1];
          });
        req.session.accessCookies = accessCookie;

        return res.redirect(req.helper.baseUrl('list'));
      } catch (error) {
        console.log(error);
        throw createHttpError(500);
      }
    }

    return res.render('login');
  } catch (error) {
    next(error);
  }
});

router.all('/list', async (req, res, next) => {
  try {
    if (!req.session.accessCookies) {
      return res.redirect(req.helper.baseUrl());
    }

    if (req.method === 'POST') {
      const response = await req.helper.makeRequest(`${config.API_URL}mission`,
        'GET', {}, req.session.accessCookies);
      res.status(response.status);
      return res.send(await response.text());
    }

    return res.render('list');
  } catch (error) {
    next(error);
  }
});

router.use('/mission', require('./mission'));

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