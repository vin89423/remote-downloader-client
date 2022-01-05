'use strict';

const e = require('express');
const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router();
const config = require('../../config');

const ensureLoggedIn = (req, res, next) => {
  try {
    if (!req.session.accessCookie) throw createHttpError(403);
    next();
  } catch (error) {
    next(error);
  }
};

const parseAccessCookie = (cookieStr) => {
  let accessCookie = null;
  cookieStr.replace(/\;\s?HttpOnly\s?$/i, '').split('; ')
    .map(part => {
      let parts = part.split('=');
      if (parts[0] === 'connect.sid') accessCookie = parts[1];
    });
  return accessCookie;
};

router.post('/auth', async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password) {
      throw createHttpError(400);
    }
    try {
      const response = await req.helper.makeRequest(`${config.API_URL}auth`, 'POST', {
        username: String(req.body.username).trim(),
        password: String(req.body.password).trim()
      });
      if (response.status !== 200) {
        req.session.errorMsg = await response.text();
        return res.redirect(req.helper.baseUrl());
      }

      req.session.accessCookie = parseAccessCookie(response.headers.get('set-cookie'));
      return res.redirect(req.helper.baseUrl());
    } catch (error) {
      console.log(error);
      throw createHttpError(500);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/mission/list', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(`${config.API_URL}mission`,
    'GET', {}, req.session.accessCookie);
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.post('/mission/create', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission`,
      'POST',
      req.body,
      req.session.accessCookie
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.post('/mission/remove/:fileId', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/${req.params.fileId}`,
      'DELETE',
      req.body,
      req.session.accessCookie
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.post('/mission/remove-all', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission`,
      'DELETE',
      req.body,
      req.session.accessCookie
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.get('/mission/download/:fileId', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/download/${req.params.fileId}`,
      'GET',
      {},
      req.session.accessCookie
    );
    if (response.status === 200) {
      res.setHeader('Content-type', response.headers.get('content-type'))
      res.setHeader('Content-disposition', response.headers.get('content-disposition'));
      return response.body.pipe(res);
    } else {
      res.status(response.status);
      return res.send(await response.text());
    }
  } catch (error) {
    next(error);
  }
});

router.get('/mission/download-all', ensureLoggedIn, async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/download-all`,
      'GET',
      {},
      req.session.accessCookie
    );
    if (response.status === 200) {
      res.setHeader('Content-type', response.headers.get('content-type'))
      res.setHeader('Content-disposition', response.headers.get('content-disposition'));
      return response.body.pipe(res);
    } else {
      res.status(response.status);
      return res.send(await response.text());
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;