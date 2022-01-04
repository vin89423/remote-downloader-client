'use strict';

const express = require('express');
const router = express.Router();

router.get('/create', async (req, res, next) => {
  // POST mission/

});

router.get('/remove/:fileId', async (req, res, next) => {
  // DELETE mission/:fileId

});

router.get('/remove-all', async (req, res, next) => {
  // DELETE mission/

});

router.get('/download/:fileId', async (req, res, next) => {
  // GET mission/download/:fileId

});

router.get('/download-all', async (req, res, next) => {
  // GET mission/download-all

});


module.exports = router;