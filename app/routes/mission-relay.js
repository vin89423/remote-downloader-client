'use strict';

const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router();

router.use((req, res, next) => {
  try {
    if (!req.session.accessCookies) throw createHttpError(403);
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission`,
      'POST',
      req.body,
      req.session.accessCookies
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.get('/remove/:fileId', async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/${req.params.fileId}`,
      'DELETE',
      req.body,
      req.session.accessCookies
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.get('/remove-all', async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission`,
      'DELETE',
      req.body,
      req.session.accessCookies
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.get('/download/:fileId', async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/download/${req.params.fileId}`,
      'GET',
      {},
      req.session.accessCookies
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});

router.get('/download-all', async (req, res, next) => {
  try {
    const response = await req.helper.makeRequest(
      `${config.API_URL}mission/download-all`,
      'GET',
      {},
      req.session.accessCookies
    );
    res.status(response.status);
    return res.send(await response.text());
  } catch (error) {
    next(error);
  }
});


module.exports = router;