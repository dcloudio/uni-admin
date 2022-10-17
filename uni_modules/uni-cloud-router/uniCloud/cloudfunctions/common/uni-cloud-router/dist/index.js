"use strict";
Object.defineProperty(exports, "__esModule", {
  value: !0
});
var e = require("fs"),
  t = require("path"),
  n = require("events"),
  r = require("querystring");

function i(e) {
  return e && "object" == typeof e && "default" in e ? e : {
    default: e
  }
}
var o = i(e),
  s = i(t);

function a(e, t) {
  return e(t = {
    exports: {}
  }, t.exports), t.exports
}
var c = a((function(e, t) {
    ! function(n) {
      const r = Function.prototype.toString;

      function i(e) {
        if ("function" != typeof e) return !1;
        if (/^class[\s{]/.test(r.call(e))) return !0;
        const t = function(e) {
          return r.call(e).replace(/^[^{]*{\s*/, "").replace(/\s*}[^}]*$/, "")
        }(e);
        return /classCallCheck\(/.test(t) || /TypeError\("Cannot call a class as a function"\)/.test(t)
      }
      e.exports && (t = e.exports = i), t.isClass = i
    }()
  })),
  u = (c.isClass, a((function(e) {
    const t = {};
    e.exports = function(n = "./", ...r) {
      const i = new Map,
        a = {};
      return i.set(a, {
          path: s.default.isAbsolute(n) ? s.default.join(n, "./") : s.default.join(s.default.dirname(e.parent
            .filename), n, "./"),
          is_class: !1
        }),
        function e(n) {
          return new Proxy(n, {
            get: (n, s) => {
              if (s in n || "symbol" == typeof s || "inspect" == s) return n[s];
              const a = i.get(n);
              if (a.is_class) return a.instance || (a.instance = new n(...r)), a.instance[s] ? a.instance[
                s] : "$map" == s ? a : a.instance[s];
              if ("$map" == s) return a;
              let u = {};
              const f = a.path + s + "/",
                l = a.path + s + ".js";
              if (t[f] || ((e => o.default.existsSync(e) && o.default.statSync(e).isFile())(l) ? t[f] =
                  "file" : (e => o.default.existsSync(e) && o.default.statSync(e).isDirectory())(f) ? t[
                  f] = "dir" : t[f] = "none"), "file" == t[f]) u = require(l);
              else if ("dir" != t[f]) return;
              return i.set(u, {
                path: f,
                is_class: c(u)
              }), n[s] = e(u), n[s]
            },
            set: (e, t, n) => {
              if (t in e) return e[t] = n, !0;
              const o = i.get(e);
              return o.is_class ? (o.instance || (o.instance = new e(...r)), o.instance[t] = n, !0) : (e[
                t] = n, !0)
            }
          })
        }(a)
    }
  })));

function f(e, t) {
  void 0 === t && (t = {});
  for (var n = function(e) {
        for (var t = [], n = 0; n < e.length;) {
          var r = e[n];
          if ("*" !== r && "+" !== r && "?" !== r)
            if ("\\" !== r)
              if ("{" !== r)
                if ("}" !== r)
                  if (":" !== r)
                    if ("(" !== r) t.push({
                      type: "CHAR",
                      index: n,
                      value: e[n++]
                    });
                    else {
                      var i = 1,
                        o = "";
                      if ("?" === e[a = n + 1]) throw new TypeError('Pattern cannot start with "?" at ' + a);
                      for (; a < e.length;)
                        if ("\\" !== e[a]) {
                          if (")" === e[a]) {
                            if (0 == --i) {
                              a++;
                              break
                            }
                          } else if ("(" === e[a] && (i++, "?" !== e[a + 1])) throw new TypeError(
                            "Capturing groups are not allowed at " + a);
                          o += e[a++]
                        } else o += e[a++] + e[a++];
                      if (i) throw new TypeError("Unbalanced pattern at " + n);
                      if (!o) throw new TypeError("Missing pattern at " + n);
                      t.push({
                        type: "PATTERN",
                        index: n,
                        value: o
                      }), n = a
                    }
          else {
            for (var s = "", a = n + 1; a < e.length;) {
              var c = e.charCodeAt(a);
              if (!(c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || 95 === c)) break;
              s += e[a++]
            }
            if (!s) throw new TypeError("Missing parameter name at " + n);
            t.push({
              type: "NAME",
              index: n,
              value: s
            }), n = a
          } else t.push({
            type: "CLOSE",
            index: n,
            value: e[n++]
          });
          else t.push({
            type: "OPEN",
            index: n,
            value: e[n++]
          });
          else t.push({
            type: "ESCAPED_CHAR",
            index: n++,
            value: e[n++]
          });
          else t.push({
            type: "MODIFIER",
            index: n,
            value: e[n++]
          })
        }
        return t.push({
          type: "END",
          index: n,
          value: ""
        }), t
      }(e), r = t.prefixes, i = void 0 === r ? "./" : r, o = "[^" + l(t.delimiter || "/#?") + "]+?", s = [], a = 0, c =
      0, u = "", f = function(e) {
        if (c < n.length && n[c].type === e) return n[c++].value
      }, d = function(e) {
        var t = f(e);
        if (void 0 !== t) return t;
        var r = n[c],
          i = r.type,
          o = r.index;
        throw new TypeError("Unexpected " + i + " at " + o + ", expected " + e)
      }, p = function() {
        for (var e, t = ""; e = f("CHAR") || f("ESCAPED_CHAR");) t += e;
        return t
      }; c < n.length;) {
    var h = f("CHAR"),
      y = f("NAME"),
      m = f("PATTERN");
    if (y || m) {
      var v = h || ""; - 1 === i.indexOf(v) && (u += v, v = ""), u && (s.push(u), u = ""), s.push({
        name: y || a++,
        prefix: v,
        suffix: "",
        pattern: m || o,
        modifier: f("MODIFIER") || ""
      })
    } else {
      var g = h || f("ESCAPED_CHAR");
      if (g) u += g;
      else if (u && (s.push(u), u = ""), f("OPEN")) {
        v = p();
        var w = f("NAME") || "",
          x = f("PATTERN") || "",
          E = p();
        d("CLOSE"), s.push({
          name: w || (x ? a++ : ""),
          pattern: w && !x ? o : x,
          prefix: v,
          suffix: E,
          modifier: f("MODIFIER") || ""
        })
      } else d("END")
    }
  }
  return s
}

function l(e) {
  return e.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1")
}

function d(e) {
  return e && e.sensitive ? "" : "i"
}

function p(e, t, n) {
  return function(e, t, n) {
    void 0 === n && (n = {});
    for (var r = n.strict, i = void 0 !== r && r, o = n.start, s = void 0 === o || o, a = n.end, c = void 0 === a ||
        a, u = n.encode, f = void 0 === u ? function(e) {
          return e
        } : u, p = "[" + l(n.endsWith || "") + "]|$", h = "[" + l(n.delimiter || "/#?") + "]", y = s ? "^" : "", m =
        0, v = e; m < v.length; m++) {
      var g = v[m];
      if ("string" == typeof g) y += l(f(g));
      else {
        var w = l(f(g.prefix)),
          x = l(f(g.suffix));
        if (g.pattern)
          if (t && t.push(g), w || x)
            if ("+" === g.modifier || "*" === g.modifier) {
              var E = "*" === g.modifier ? "?" : "";
              y += "(?:" + w + "((?:" + g.pattern + ")(?:" + x + w + "(?:" + g.pattern + "))*)" + x + ")" + E
            } else y += "(?:" + w + "(" + g.pattern + ")" + x + ")" + g.modifier;
        else y += "(" + g.pattern + ")" + g.modifier;
        else y += "(?:" + w + x + ")" + g.modifier
      }
    }
    if (c) i || (y += h + "?"), y += n.endsWith ? "(?=" + p + ")" : "$";
    else {
      var b = e[e.length - 1],
        C = "string" == typeof b ? h.indexOf(b[b.length - 1]) > -1 : void 0 === b;
      i || (y += "(?:" + h + "(?=" + p + "))?"), C || (y += "(?=" + h + "|" + p + ")")
    }
    return new RegExp(y, d(n))
  }(f(e, n), t, n)
}

function h(e, t, n) {
  return e instanceof RegExp ? function(e, t) {
    if (!t) return e;
    var n = e.source.match(/\((?!\?)/g);
    if (n)
      for (var r = 0; r < n.length; r++) t.push({
        name: r,
        prefix: "",
        suffix: "",
        modifier: "",
        pattern: ""
      });
    return e
  }(e, t) : Array.isArray(e) ? function(e, t, n) {
    var r = e.map((function(e) {
      return h(e, t, n).source
    }));
    return new RegExp("(?:" + r.join("|") + ")", d(n))
  }(e, t, n) : p(e, t, n)
}
const y = "INVOKE_FUNCTION_FAILED",
  m = "undefined" != typeof uniCloud,
  v = () => !1,
  g = () => !0;

function w(e) {
  if ("string" == typeof e) {
    const t = h(e, [], {
      end: !1
    });
    return t.global && (t.lastIndex = 0), e => t.test(e.event.action)
  }
  if (e instanceof RegExp) return t => (e.global && (e.lastIndex = 0), e.test(t.event.action));
  if ("function" == typeof e) return e;
  if (Array.isArray(e)) {
    const t = e.map(e => w(e));
    return e => t.some(t => t(e))
  }
  throw new Error("match/ignore pattern must be RegExp, Array or String, but got " + e)
}
class x {
  constructor(e) {
    this.ctx = e, this.config = e.config, this.service = e.service, this.controller = e.controller, this.throw = e
      .throw, this.db = e.db, this.curl = e.curl, this.httpclient = e.httpclient
  }
  pick(e, t) {
    return e = e || {}, "string" == typeof t && (t = t.split(/ +/)), t.reduce((function(t, n) {
      return null == e[n] || (t[n] = e[n]), t
    }), {})
  }
}
var E = function(e) {
  if (!Array.isArray(e)) throw new TypeError("Middleware stack must be an array!");
  for (const t of e)
    if ("function" != typeof t) throw new TypeError("Middleware must be composed of functions!");
  return function(t, n) {
    let r = -1;
    return function i(o) {
      if (o <= r) return Promise.reject(new Error("next() called multiple times"));
      r = o;
      let s = e[o];
      o === e.length && (s = n);
      if (!s) return Promise.resolve();
      try {
        return Promise.resolve(s(t, i.bind(null, o + 1)))
      } catch (e) {
        return Promise.reject(e)
      }
    }(0)
  }
};
const b = e => "string" != typeof e,
  C = "application/json";

function A(e, t) {
  if (t) {
    const {
      headers: t,
      httpMethod: n,
      body: i,
      queryStringParameters: o
    } = e.event;
    if (function(e) {
        const t = Object.keys(e).find(e => "content-type" === e.toLowerCase());
        t ? (e["content-type"] = e[t].toLowerCase(), "content-type" !== t && delete e[t]) : e["content-type"] = C
      }(t), e.query = o, "GET" === n) e.data = e.query;
    else if (e.data = Object.create(null), i) {
      const n = t["content-type"];
      if (n === C) try {
        e.data = JSON.parse(i)
      } catch (e) {} else "application/x-www-form-urlencoded" === n && (e.data = r.parse(i))
    }
  }
  e.set = function(t, n) {
    if (2 === arguments.length) Array.isArray(n) ? n = n.map(e => "string" == typeof e ? e : String(e)) : "string" !=
      typeof n && (n = String(n)), e.headers[t] = n;
    else if (b(t))
      for (const n in t) e.set(n, t[n])
  }
}
async function R(e, t) {
  const n = function(e, t) {
    const n = t.env;
    return !(!n || "http" !== n.MP_SOURCE) || !(!e.httpMethod || !e.headers)
  }(e.event, e.context);
  if (A(e, n), n) {
    const n = {
      "content-type": C
    };
    try {
      await t()
    } catch (t) {
      const r = {
        code: t.code || y,
        message: t.message
      };
      return !0 === e.config.debug && (r.stack = t.stack || ""), e.body = {
        mpserverlessComposedResponse: !0,
        statusCode: 400,
        headers: n,
        body: JSON.stringify(r)
      }
    }
    const r = e.headers["content-type"] || C;
    e.body = {
      mpserverlessComposedResponse: !0,
      isBase64Encoded: !!e.isBase64Encoded,
      statusCode: e.status,
      headers: Object.assign(e.headers, {
        "content-type": r
      }),
      body: r === C ? JSON.stringify(e.body) : e.body
    }
  } else await t()
}

function O(e) {
  const t = async function(t) {
    t.throw(e)
  };
  return t._name = "error", t
}
class S extends n.EventEmitter {
  constructor(e) {
    super(), this.middleware = [], this.config = e || {};
    const {
      baseDir: t = process.cwd(),
      middleware: n
    } = this.config;
    this.serviceDir = s.default.resolve(t, "service"), this.controllerDir = s.default.resolve(t, "controller"), this
      .initMiddleware(n)
  }
  use(e, t) {
    if ("function" != typeof e) throw new TypeError("middleware must be a function");
    return this.middleware.push(this.wrapMiddleware(e, t)), this
  }
  async serve(e, t) {
    const n = function(e, t, n, r, i) {
        const o = {
          state: {},
          event: t,
          context: n
        };
        return o.config = e, o.service = u(r, o), o.controller = u(i, o), o.query = Object.create(null), o.data = t
          .data || Object.create(null), o.status = 200, o.headers = Object.create(null), o.throw = (e, t) => {
            if (t) throw {
              code: e,
              message: t
            };
            throw {
              code: y,
              message: e
            }
          }, m && (o.db = uniCloud.database(), o.curl = uniCloud.httpclient.request.bind(uniCloud.httpclient), o
            .httpclient = uniCloud.httpclient), o
      }(this.config, e || m && uniCloud.$args, t || m && uniCloud.$ctx, this.serviceDir, this.controllerDir),
      r = this.controller(n);
    let i;
    return i = "error" === r._name ? E([R, r]) : E(this.middleware.concat(r)), new Promise(e => {
      i(n).then(() => {
        e(this.respond(n))
      }).catch(t => {
        e(this.failed(t))
      })
    })
  }
  initMiddleware(e) {
    this.use(R, {
      name: "http"
    }), Array.isArray(e) && e.forEach(([e, t]) => {
      this.use(e, t)
    })
  }
  wrapMiddleware(e, t) {
    const n = function(e) {
        if (!e) return g;
        const {
          enable: t,
          match: n,
          ignore: r
        } = e;
        if (!1 === t) return v;
        if (!n && !r) return g;
        if (n && r) throw new Error("options.match and options.ignore can not both present");
        const i = w(n || r);
        return function(e) {
          const t = i(e);
          return n ? t : !t
        }
      }(t),
      r = (t, r) => n(t) ? e(t, r) : r();
    return t && t.name && (r._name = t.name), r._name || (r._name = e._name || e.name), r
  }
  controller(e) {
    const t = function(e) {
      !e.action && e.path && (e.action = e.path.substr(1));
      let t = String(e.action || "");
      return t.startsWith("/") && (e.action = t = t.substr(1)), t
    }(e.event);
    if (!t) return O("action is required");
    const n = t.split("/").filter(Boolean),
      r = n.length;
    if (1 === r) return O('action must contain "/"');
    const i = n[r - 1];
    let o = e.controller;
    for (let e = 0; e < r - 1; e++) o = o[n[e]];
    if (!o) return O(`controller/${t.replace(new RegExp("/"+i+"$"),"")} not found`);
    const s = o[i];
    if ("function" != typeof s) return O(`controller/${t.replace(new RegExp("/"+i+"$"),"."+i)} is not a function`);
    const a = async function(e) {
      const t = await s.call(o, e);
      void 0 !== t && (e.body = t)
    };
    return a._name = i, a
  }
  failed(e) {
    const t = {
      code: e.code || y,
      message: e.message || e
    };
    return !0 === this.config.debug && (t.stack = e.stack || ""), t
  }
  respond(e) {
    return e.body
  }
}
const M = x,
  _ = x;
exports.Controller = _, exports.Router = S, exports.Service = M;
