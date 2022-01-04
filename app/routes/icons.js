'use strict';

const fs = require('fs');
const express = require('express');
const router = express.Router();

router.get('/:type/:ext', async (req, res, next) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  switch (req.params.type) {
    case 'audio':
      return res.send(renderIcon('audio', '128px'));
    case 'video':
      return res.send(renderIcon('video', '128px'));
    case 'image':
      return res.send(renderIcon('image', '128px'));
    case 'text':
      return res.send(renderIcon('text', '128px'));
    default:
      return res.send(renderIcon('file', '128px'));
  }
});

/**
 * Get icon svg
 * @param {String} iconName
 * @param {Number} size
 * @param {String} [title=null]
 */
function renderIcon(iconName, size, title = null) {
  let filename = `${__dirname}/../../public/icons/${iconName}.svg`;
  if (!fs.existsSync(filename)) return;
  let svg = fs.readFileSync(filename, 'utf8'),
    attr = `width="${size}" height="${size}"`;
  if (title) attr+= ` title="${title}"`;
  return svg.replace(/\<svg (.*)\>/i, `<svg $1 ${attr}>`);
}

module.exports = router;