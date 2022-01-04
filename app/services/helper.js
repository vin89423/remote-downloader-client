/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const dot = require('dot-object');
const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const config = require('../../config');

const helper = {
  // URL helper
  url: {
    /**
    * Get absolute URL for this website
    * @param {String} [suffix=''] URL path after baseUrl
    * @param {URLSearchParams} [query=null] URLSearchParams to parse as URL query
    * @returns {String} URL starts with Base URL
    */
    baseUrl: (suffix = '', query = null) => {
      let prefix = config.BASE_URL,
        queryStr = '';
      if (query !== null) queryStr = `?${query.toString()}`;
      return `${prefix}${suffix}${queryStr}`
    },
    /** Get current URL
    * @param {Request} req Use request data to calculate current URL Path
    * @returns {String} Specify language of current URL
    */
    currentUrl: (req) => {
      return `${config.BASE_URL}${req.originalUrl.replace(/^\//, '')}`;
    },
    /** Refresh the current page
    * @param {Request} req Use request data to calculate current URL Path
    * @param {Response} res Send redirect location header
    */
    refresh: (req, res) => {
      return res.redirect(`${config.BASE_URL}${req.originalUrl.replace(/^\//, '')}`);
    },
    /** Refresh the current page
    * @param {Request} req Use request data to calculate current URL Path
    * @param {Response} res Send redirect location header
    * @param {String} fallbackUrl Location to redirect if not Referrer URL
    */
    redirectReferrer: (req, res, fallbackUrl) => {
      if (req.headers.referer) {
        return res.redirect(req.headers.referer);
      }
      return res.redirect(fallbackUrl);
    },

    /**
     * @param {Object} param
     * @return {URLSearchParams}
     */
    httpBuildQuery: (object) => {
      const params = new URLSearchParams();
      Object.entries(object).map(([key, value]) => {
        params.append(key, value);
      })

      return params;
    }
  },
  // String helper
  string: {
    /** Create string fit in URL
    * @param {String} str Original String Content
    * @param {Integer} maxlen Max length of URL friend string
    * @returns {String} URL friend string
    */
    friendlyUrl: (str, maxlen) => {
      if (!str) return '';
      maxlen = maxlen || 80
      var len = str.length, prevdash = false, sb = [], c;
      for (var i = 0; i < len; ++i) {
        c = str[i]
        if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
          sb.push(c);
          prevdash = false;
        } else if (c >= 'A' && c <= 'Z') {
          sb.push(c.toLowerCase());
          prevdash = false;
        } else if (c === ' ' || c === ',' || c === '.' || c === '/' ||
          c === '\\' || c === '-' || c === '_' || c === '=') {
          if (!prevdash && sb.length > 0) {
            sb.push('-');
            prevdash = true;
          }
        } else if (c.charCodeAt(0) >= 128) {
          var remapped = remapInternationalCharToAscii(c);
          if (remapped) {
            sb.push(remapped);
            prevdash = false;
          }
        }
        if (sb.length === maxlen) break
      }
      if (prevdash) return sb.join('').substring(0, sb.length - 1);
      else return sb.join('');
    },
    /** Remove all HTML tag and convert line-break to space from a string
    * @param {String} str
    */
    stripTags: (str) => {
      return str.replace(/<br\s?\/?>/gi, ' ').replace( /<.*?>/g, '' )
    },
    /**
    * Remove spceify character at the begin or tail form a string
    * @param {String} str Original String Content
    * @param {String} [char=' '] Character to trim off
    */
    trimChar: (str, char = ' ') => {
      str = str.replace(new RegExp("^[" + char + "]+"), "");
      return str.replace(new RegExp("[" + char + "]+$"), "");
    }
  },

  network: {
    /**
     * @param {String} endpoint Endpoint URL
     * @param {String} method Request method
     * @param {Object} [data={}] Form Body
     * @param {Object} [cookies=null] Request cookies
     *
     */
    makeRequest: async function(endpoint, method, data = {}, cookies = null) {
      method = String(method).toLocaleLowerCase();

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 5000);

      const options = {
        method: method,
        signal: controller.signal
      };
      if (!['get', 'head'].includes(method) && data) {
        options.body = helper.url.httpBuildQuery(data);
      }
      if (cookies) {
        const cookieStr = Object.entries(cookies).map(([key, value]) => {
          return `${key}=${value}`;
        });
        options.headers = {
          cookie: cookieStr.join('; ')
        };
      }
      try {
        return await fetch(endpoint, options);
      } catch (error) {
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
  },


  prepareLocalsMiddleware
};

module.exports = helper;

/**
 * Prepare view required infos
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
function prepareLocalsMiddleware(req, res, next) {
  res.locals.req = req;
  req.helper = {...helper.url, ...helper.string, ...helper.network };
  res.locals = { ...res.locals, ...req.helper };
  res.locals.apiUrl = config.API_URL;

  res.locals.loggedIn = !!req.session.accessCookies;

  next();
}

function remapInternationalCharToAscii (c) {
  if ('àåáâãåa'.indexOf(c) !== -1) return 'a'
  else if ('èéêe'.indexOf(c) !== -1) return 'e'
  else if ('ìíîïi'.indexOf(c) !== -1) return 'i'
  else if ('òóôõøoð'.indexOf(c) !== -1) return 'o'
  else if ('ùúûuu'.indexOf(c) !== -1) return 'u'
  else if ('çccc'.indexOf(c) !== -1) return 'c'
  else if ('zzž'.indexOf(c) !== -1) return 'z'
  else if ('ssšs'.indexOf(c) !== -1) return 's'
  else if ('ñn'.indexOf(c) !== -1) return 'n'
  else if ('ýÿ'.indexOf(c) !== -1) return 'y'
  else if ('gg'.indexOf(c) !== -1) return 'g'
  else if (c === 'r') return 'r'
  else if (c === 'l') return 'l'
  else if (c === 'd') return 'd'
  else if (c === 'ä') return 'ae'
  else if (c === 'ö') return 'oe'
  else if (c === 'ü') return 'ue'
  else if (c === 'ß') return 'ss'
  else if (c === 'Þ') return 'th'
  else if (c === 'h') return 'h'
  else if (c === 'j') return 'j'
  else return ''
}