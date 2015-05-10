/* Riot v2.0.15, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window) {
  // 'use strict' does not allow us to override the events properties https://github.com/muut/riotjs/blob/dev/lib/tag/update.js#L7-L10
  // it leads to the following error on firefox "setting a property that has only a getter"
  //'use strict'

  var riot = { version: 'v2.0.15', settings: {} },
      ieVersion = checkIE()

riot.observable = function(el) {

  el = el || {}

  var callbacks = {},
      _id = 0

  el.on = function(events, fn) {
    if (typeof fn == 'function') {
      fn._id = typeof fn._id == 'undefined' ? _id++ : fn._id

      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else {
      events.replace(/\S+/g, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
            if (cb._id == fn._id) { arr.splice(i, 1); i-- }
          }
        } else {
          callbacks[name] = []
        }
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    function on() {
      el.off(name, on)
      fn.apply(el, arguments)
    }
    return el.on(name, on)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }
    }

    if (callbacks.all && name != 'all') {
      el.trigger.apply(el, ['all', name].concat(args))
    }

    return el
  }

  return el

}
;(function(riot, evt, window) {

  // browsers only
  if (!window) return

  var loc = window.location,
      fns = riot.observable(),
      win = window,
      started = false,
      current

  function hash() {
    return loc.href.split('#')[1] || ''
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  r.stop = function () {
    if (!started) return
    win.removeEventListener ? win.removeEventListener(evt, emit, false) : win.detachEvent('on' + evt, emit)
    fns.off('*')
    started = false
  }

  r.start = function () {
    if (started) return
    win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit)
    started = true
  }

  // autostart the router
  r.start()

})(riot, 'hashchange', window)
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/


var brackets = (function(orig, s, b) {
  return function(x) {

    // make sure we use the current setting
    s = riot.settings.brackets || orig
    if (b != s) b = s.split(' ')

    // if regexp given, rewrite it with current brackets (only if differ from default)
    return x && x.test
      ? s == orig
        ? x : RegExp(x.source
                      .replace(/\{/g, b[0].replace(/(?=.)/g, '\\'))
                      .replace(/\}/g, b[1].replace(/(?=.)/g, '\\')),
                    x.global ? 'g' : '')

      // else, get specific bracket
      : b[x]

  }
})('{ }')


var tmpl = (function() {

  var cache = {},
      reVars = /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_$]\w*)/gi
              // [ 1               ][ 2  ][ 3 ][ 4                                                                                  ][ 5       ]
              // find variable names:
              // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip javascript keywords
              // 5. match var name

  // build a template (or get it from cache), render with data
  return function(str, data) {
    return str && (cache[str] = cache[str] || tmpl(str))(data)
  }


  // create a template instance

  function tmpl(s, p) {

    // default template string to {}
    s = (s || (brackets(0) + brackets(1)))

      // temporarily convert \{ and \} to a non-character
      .replace(brackets(/\\{/g), '\uFFF0')
      .replace(brackets(/\\}/g), '\uFFF1')

    // split string to expression and non-expresion parts
    p = split(s, extract(s, brackets(/{/), brackets(/}/)))

    return new Function('d', 'return ' + (

      // is it a single expression or a template? i.e. {x} or <b>{x}</b>
      !p[0] && !p[2] && !p[3]

        // if expression, evaluate it
        ? expr(p[1])

        // if template, evaluate all expressions in it
        : '[' + p.map(function(s, i) {

            // is it an expression or a string (every second part is an expression)
          return i % 2

              // evaluate the expressions
              ? expr(s, true)

              // process string parts of the template:
              : '"' + s

                  // preserve new lines
                  .replace(/\n/g, '\\n')

                  // escape quotes
                  .replace(/"/g, '\\"')

                + '"'

        }).join(',') + '].join("")'
      )

      // bring escaped { and } back
      .replace(/\uFFF0/g, brackets(0))
      .replace(/\uFFF1/g, brackets(1))

    + ';')

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, brackets, strip comments
      .replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w- "']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' +

          // extract key:val pairs, ignoring any nested objects
          extract(s,

              // name part: name:, "name":, 'name':, name :
              /["' ]*[\w- ]+["' ]*:/,

              // expression part: everything upto a comma followed by a name (see above) or end of line
              /,(?=["' ]*[\w- ]+["' ]*:)|}|$/
              ).map(function(pair) {

                // get key, val parts
                return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function(_, k, v) {

                  // wrap all conditional parts to ignore errors
                  return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",'

                })

              }).join('')

        + '].join(" ").trim()'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    s = s.trim()
    return !s ? '' : '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(reVars, function(s, _, v) { return v ? '(d.'+v+'===undefined?'+(typeof window == 'undefined' ? 'global.' : 'window.')+v+':d.'+v+')' : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')

      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull === true ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }


  // split string by an array of substrings

  function split(str, substrings) {
    var parts = []
    substrings.map(function(sub, i) {

      // push matched expression and part before it
      i = str.indexOf(sub)
      parts.push(str.slice(0, i), sub)
      str = str.slice(i + sub.length)
    })

    // push the remaining part
    return parts.concat(str)
  }


  // match strings between opening and closing regexp, skipping any inner/nested matches

  function extract(str, open, close) {

    var start,
        level = 0,
        matches = [],
        re = new RegExp('('+open.source+')|('+close.source+')', 'g')

    str.replace(re, function(_, open, close, pos) {

      // if outer inner bracket, mark position
      if(!level && open) start = pos

      // in(de)crease bracket level
      level += open ? 1 : -1

      // if outer closing bracket, grab the match
      if(!level && close != null) matches.push(str.slice(start, pos+close.length))

    })

    return matches
  }

})()

// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = brackets(0) + els[1]
    els = els[0].slice(brackets(0).length).trim().split(/,\s*/)
    ret.key = els[0]
    ret.pos = els[1]
  }

  return ret
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  expr = loopKeys(expr)

  function add(pos, item, tag) {
    rendered.splice(pos, 0, item)
    tags.splice(pos, 0, tag)
  }

  // clean template code
  parent.one('update', function() {
    root.removeChild(dom)

  }).one('premount', function() {
    if (root.stub) root = parent.root

  }).on('update', function() {

    var items = tmpl(expr.val, parent)
    if (!items) return

    // object loop. any changes cause full redraw
    if (!Array.isArray(items)) {
      var testsum = JSON.stringify(items)
      if (testsum == checksum) return
      checksum = testsum

      // clear old items
      each(tags, function(tag) { tag.unmount() })
      rendered = []
      tags = []

      items = Object.keys(items).map(function(key) {
        return mkitem(expr, key, items[key])
      })

    }

    // unmount redundant
    each(rendered, function(item) {
      if (item instanceof Object) {
        // skip existing items
        if (items.indexOf(item) > -1) {
          return
        }
      } else {
        // find all non-objects
        var newItems = arrFindEquals(items, item),
            oldItems = arrFindEquals(rendered, item)

        // if more or equal amount, no need to remove
        if (newItems.length >= oldItems.length) {
          return
        }
      }
      var pos = rendered.indexOf(item),
          tag = tags[pos]

      if (tag) {
        tag.unmount()
        rendered.splice(pos, 1)
        tags.splice(pos, 1)
        // to let "each" know that this item is removed
        return false
      }

    })

    // mount new / reorder
    var prevBase = [].indexOf.call(root.childNodes, prev) + 1
    each(items, function(item, i) {

      // start index search from position based on the current i
      var pos = items.indexOf(item, i),
          oldPos = rendered.indexOf(item, i)

      // if not found, search backwards from current i position
      pos < 0 && (pos = items.lastIndexOf(item, i))
      oldPos < 0 && (oldPos = rendered.lastIndexOf(item, i))

      if (!(item instanceof Object)) {
        // find all non-objects
        var newItems = arrFindEquals(items, item),
            oldItems = arrFindEquals(rendered, item)

        // if more, should mount one new
        if (newItems.length > oldItems.length) {
          oldPos = -1
        }
      }

      // mount new
      var nodes = root.childNodes
      if (oldPos < 0) {
        if (!checksum && expr.key) var _item = mkitem(expr, item, pos)

        var tag = new Tag({ tmpl: template }, {
          before: nodes[prevBase + pos],
          parent: parent,
          root: root,
          item: _item || item
        })

        tag.mount()

        add(pos, item, tag)
        return true
      }

      // change pos value
      if (expr.pos && tags[oldPos][expr.pos] != pos) {
        tags[oldPos].one('update', function(item) {
          item[expr.pos] = pos
        })
        tags[oldPos].update()
      }

      // reorder
      if (pos != oldPos) {
        root.insertBefore(nodes[prevBase + oldPos], nodes[prevBase + (pos > oldPos ? pos + 1 : pos)])
        return add(pos, rendered.splice(oldPos, 1)[0], tags.splice(oldPos, 1)[0])
      }

    })

    rendered = items.slice()

  })

}


function parseNamedElements(root, parent, childTags) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      if(dom.parentNode && dom.parentNode.isLoop) dom.isLoop = 1
      if(dom.getAttribute('each')) dom.isLoop = 1
      // custom child tag
      var child = getTag(dom)

      if (child && !dom.isLoop) {
        var tag = new Tag(child, { root: dom, parent: parent }, dom.innerHTML),
          tagName = child.name,
          ptag = parent,
          cachedTag

        while(!getTag(ptag.root)) {
          if(!ptag.parent) break
          ptag = ptag.parent
        }
        // fix for the parent attribute in the looped elements
        tag.parent = ptag

        cachedTag = ptag.tags[tagName]

        // if there are multiple children tags having the same name
        if (cachedTag) {
          // if the parent tags property is not yet an array
          // create it adding the first cached tag
          if (!Array.isArray(cachedTag))
            ptag.tags[tagName] = [cachedTag]
          // add the new nested tag to the array
          ptag.tags[tagName].push(tag)
        } else {
          ptag.tags[tagName] = tag
        }

        // empty the child node once we got its template
        // to avoid that its children get compiled multiple times
        dom.innerHTML = ''
        childTags.push(tag)
      }

      each(dom.attributes, function(attr) {
        if (/^(name|id)$/.test(attr.name)) parent[attr.value] = dom
      })
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(brackets(0)) >= 0) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = dom.getAttribute('each')
    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
      opts = inherit(conf.opts) || {},
      dom = mkdom(impl.tmpl),
      parent = conf.parent,
      expressions = [],
      childTags = [],
      root = conf.root,
      item = conf.item,
      fn = impl.fn,
      tagName = root.tagName.toLowerCase(),
      attr = {},
      loopDom

  if (fn && root._tag) {
    root._tag.unmount(true)
  }
  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  this._id = ~~(new Date().getTime() * Math.random())

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  // grab attributes
  each(root.attributes, function(el) {
    attr[el.name] = el.value
  })


  if (dom.innerHTML && !/select/.test(tagName))
    // replace all the yield tags with the tag inner html
    dom.innerHTML = replaceYield(dom.innerHTML, innerHTML)


  // options
  function updateOpts() {
    each(Object.keys(attr), function(name) {
      opts[name] = tmpl(attr[name], parent || self)
    })
  }

  this.update = function(data, init) {
    extend(self, data, item)
    updateOpts()
    self.trigger('update', item)
    update(expressions, self, item)
    self.trigger('updated')
  }

  this.mount = function() {

    updateOpts()

    // initialiation
    fn && fn.call(self, opts)

    toggle(true)

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    if (!self.parent) self.update()

    // internal use only, fixes #403
    self.trigger('premount')

    if (fn) {
      while (dom.firstChild) root.appendChild(dom.firstChild)

    } else {
      loopDom = dom.firstChild
      root.insertBefore(loopDom, conf.before || null) // null needed for IE8
    }

    if (root.stub) self.root = root = parent.root
    self.trigger('mount')

  }


  this.unmount = function(keepRootTag) {
    var el = fn ? root : loopDom,
        p = el.parentNode

    if (p) {

      if (parent) {
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (Array.isArray(parent.tags[tagName])) {
          each(parent.tags[tagName], function(tag, i) {
            if (tag._id == self._id)
              parent.tags[tagName].splice(i, 1)
          })
        } else
          // otherwise just delete the tag instance
          delete parent.tags[tagName]
      } else {
        while (el.firstChild) el.removeChild(el.firstChild)
      }

      if (!keepRootTag)
        p.removeChild(el)

    }


    self.trigger('unmount')
    toggle()
    self.off('*')
    // somehow ie8 does not like `delete root._tag`
    root._tag = null

  }

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (parent) {
      var evt = isMount ? 'on' : 'off'
      parent[evt]('update', self.update)[evt]('unmount', self.unmount)
    }
  }

  // named elements available for fn
  parseNamedElements(dom, this, childTags)


}

function setEventHandler(name, handler, dom, tag, item) {

  dom[name] = function(e) {

    // cross browser event fix
    e = e || window.event
    e.which = e.which || e.charCode || e.keyCode
    e.target = e.target || e.srcElement
    e.currentTarget = dom
    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      e.preventDefault && e.preventDefault()
      e.returnValue = false
    }

    var el = item ? tag.parent : tag
    el.update()

  }

}

// used by if- attribute
function insertTo(root, node, before) {
  if (root) {
    root.insertBefore(before, node)
    root.removeChild(node)
  }
}

// item = currently looped item
function update(expressions, tag, item) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
        attrName = expr.attr,
        value = tmpl(expr.expr, tag),
        parent = expr.dom.parentNode

    if (value == null) value = ''

    // leave out riot- prefixes from strings inside textarea
    if (parent && parent.tagName == 'TEXTAREA') value = value.replace(/riot-/g, '')

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attrName) return dom.nodeValue = value

    // remove original attribute
    remAttr(dom, attrName)

    // event handler
    if (typeof value == 'function') {
      setEventHandler(attrName, value, dom, tag, item)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub

      // add to DOM
      if (value) {
        stub && insertTo(stub.parentNode, stub, dom)

      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        insertTo(dom.parentNode, dom, stub)
      }

    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (attrName.slice(0, 5) == 'riot-') {
      attrName = attrName.slice(5)
      value ? dom.setAttribute(attrName, value) : remAttr(dom, attrName)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
        value = attrName
      }

      if (typeof value != 'object') dom.setAttribute(attrName, value)

    }

  })

}
function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]
    // return false -> remove current item during loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

// max 2 from objects allowed
function extend(obj, from, from2) {
  from && each(Object.keys(from), function(key) {
    obj[key] = from[key]
  })
  return from2 ? extend(obj, from2) : obj
}

function checkIE() {
  if (window) {
    var ua = navigator.userAgent
    var msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }
    else {
      return 0
    }
  }
}

function optionInnerHTML(el, html) {
  var opt = document.createElement('option'),
      valRegx = /value=[\"'](.+?)[\"']/,
      selRegx = /selected=[\"'](.+?)[\"']/,
      valuesMatch = html.match(valRegx),
      selectedMatch = html.match(selRegx)

  opt.innerHTML = html

  if (valuesMatch) {
    opt.value = valuesMatch[1]
  }

  if (selectedMatch) {
    opt.setAttribute('riot-selected', selectedMatch[1])
  }

  el.appendChild(opt)
}

function mkdom(template) {
  var tagName = template.trim().slice(1, 3).toLowerCase(),
      rootTag = /td|th/.test(tagName) ? 'tr' : tagName == 'tr' ? 'tbody' : 'div',
      el = document.createElement(rootTag)

  el.stub = true

  if (tagName === 'op' && ieVersion && ieVersion < 10) {
    optionInnerHTML(el, template)
  } else {
    el.innerHTML = template
  }
  return el
}

function walk(dom, fn) {
  if (dom) {
    if (fn(dom) === false) walk(dom.nextSibling, fn)
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

function replaceYield (tmpl, innerHTML) {
  return tmpl.replace(/<(yield)\/?>(<\/\1>)?/gim, innerHTML || '')
}

function $$(selector, ctx) {
  ctx = ctx || document
  return ctx.querySelectorAll(selector)
}

function arrDiff(arr1, arr2) {
  return arr1.filter(function(el) {
    return arr2.indexOf(el) < 0
  })
}

function arrFindEquals(arr, el) {
  return arr.filter(function (_el) {
    return _el === el
  })
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtualDom = [],
    tagImpl = {}


function getTag(dom) {
  return tagImpl[dom.getAttribute('riot-tag') || dom.tagName.toLowerCase()]
}

function injectStyle(css) {
  var node = document.createElement('style')
  node.innerHTML = css
  document.head.appendChild(node)
}

function mountTo(root, tagName, opts) {
  var tag = tagImpl[tagName],
      innerHTML = root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    virtualDom.push(tag)
    return tag.on('unmount', function() {
      virtualDom.splice(virtualDom.indexOf(tag), 1)
    })
  }

}

riot.tag = function(name, html, css, fn) {
  if (typeof css == 'function') fn = css
  else if (css) injectStyle(css)
  tagImpl[name] = { name: name, tmpl: html, fn: fn }
  return name
}

riot.mount = function(selector, tagName, opts) {

  var el,
      selctAllTags = function(sel) {
        sel = Object.keys(tagImpl).join(', ')
        sel.split(',').map(function(t) {
          sel += ', *[riot-tag="'+ t.trim() + '"]'
        })
        return sel
      },
      tags = []

  if (typeof tagName == 'object') { opts = tagName; tagName = 0 }

  // crawl the DOM to find the tag
  if(typeof selector == 'string') {
    if (selector == '*') {
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = selctAllTags(selector)
    }
    // or just the ones named like the selector
    el = $$(selector)
  }
  // probably you have passed already a tag or a NodeList
  else
    el = selector

  // select all the registered and mount them inside their root elements
  if (tagName == '*') {
    // get all custom tags
    tagName = selctAllTags(selector)
    // if the root el it's just a single tag
    if (el.tagName) {
      el = $$(tagName, el)
    } else {
      var nodeList = []
      // select all the children for all the different root elements
      each(el, function(tag) {
        nodeList = $$(tagName, tag)
      })
      el = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  function push(root) {
    var name = tagName || root.getAttribute('riot-tag') || root.tagName.toLowerCase(),
        tag = mountTo(root, name, opts)

    if (tag) tags.push(tag)
  }

  // DOM node
  if (el.tagName)
    push(selector)
  // selector or NodeList
  else
    each(el, push)

  return tags

}

// update everything
riot.update = function() {
  return each(virtualDom, function(tag) {
    tag.update()
  })
}

// @deprecated
riot.mountTo = riot.mount



;(function(window) {

  var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
    'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
    'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
    'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
    'typemustmatch,visible').split(',')

  // these cannot be auto-closed
  var VOID_TAGS = 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(',')


  /*
    Following attributes give error when parsed on browser with { exrp_values }

    'd' describes the SVG <path>, Chrome gives error if the value is not valid format
    https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
  */
  var PREFIX_ATTR = ['style', 'src', 'd']

  var HTML_PARSERS = {
    jade: jade
  }

  var JS_PARSERS = {
    coffeescript: coffee,
    none: plainjs,
    cs: coffee,
    es6: es6,
    typescript: typescript,
    livescript: livescript,
    ls: livescript
  }

  var LINE_TAG = /^<([\w\-]+)>(.*)<\/\1>/gim,
      QUOTE = /=({[^}]+})([\s\/\>])/g,
      SET_ATTR = /([\w\-]+)=(["'])([^\2]+?)\2/g,
      EXPR = /{\s*([^}]+)\s*}/g,
      // (tagname) (html) (javascript) endtag
      CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\/}"']>$)?([^\x00]*?)^<\/\1>/gim,
      SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gm,
      STYLE = /<style(\s+type=['"]?([^>'"]+)['"]?|\s+scoped)?>([^\x00]*?)<\/style>/gm,
      CSS_SELECTOR = /(^|\}|\{)\s*([^\{\}]+)\s*(?=\{)/g,
      CSS_COMMENT = /\/\*[^\x00]*?\*\//gm,
      HTML_COMMENT = /<!--.*?-->/g,
      CLOSED_TAG = /<([\w\-]+)([^>]*)\/\s*>/g,
      LINE_COMMENT = /^\s*\/\/.*$/gm,
      JS_COMMENT = /\/\*[^\x00]*?\*\//gm

  function compileHTML(html, opts, type) {

    var brackets = riot.util.brackets

    // foo={ bar } --> foo="{ bar }"
    html = html.replace(brackets(QUOTE), '="$1"$2')

    // whitespace
    html = opts.whitespace ? html.replace(/\n/g, '\\n') : html.replace(/\s+/g, ' ')

    // strip comments
    html = html.trim().replace(HTML_COMMENT, '')

    // alter special attribute names
    html = html.replace(SET_ATTR, function(full, name, _, expr) {
      if (expr.indexOf(brackets(0)) >= 0) {
        name = name.toLowerCase()

        if (PREFIX_ATTR.indexOf(name) >= 0) name = 'riot-' + name

        // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
        else if (BOOL_ATTR.indexOf(name) >= 0) name = '__' + name
      }

      return name + '="' + expr + '"'
    })

    // run expressions trough parser
    if (opts.expr) {
      html = html.replace(brackets(EXPR), function(_, expr) {
        var ret = compileJS(expr, opts, type).trim().replace(/\r?\n|\r/g, '').trim()
        if (ret.slice(-1) == ';') ret = ret.slice(0, -1)
        return brackets(0) + ret + brackets(1)
      })
    }

    // <foo/> -> <foo></foo>
    html = html.replace(CLOSED_TAG, function(_, name, attr) {
      var tag = '<' + name + (attr ? ' ' + attr.trim() : '') + '>'

      // Do not self-close HTML5 void tags
      if (VOID_TAGS.indexOf(name.toLowerCase()) == -1) tag += '</' + name + '>'
      return tag
    })

    // escape single quotes
    html = html.replace(/'/g, "\\'")

    // \{ jotain \} --> \\{ jotain \\}
    html = html.replace(brackets(/\\{|\\}/g), '\\$&')

    // compact: no whitespace between tags
    if (opts.compact) html = html.replace(/> </g, '><')

    return html

  }

  function coffee(js) {
    if (typeof exports === 'undefined') {
      return CoffeeScript.compile(js, { bare: true })
    }
    return require('coffee-script').compile(js, { bare: true })
  }

  function es6(js) {
    if (typeof exports === 'undefined') {
      return babel.transform(js, { blacklist: ['useStrict'] }).code
    }
    return require('babel').transform(js, { blacklist: ['useStrict'] }).code
  }

  function typescript(js) {
    return require('typescript-simple')(js)
  }

  function livescript(js) {
    return require('LiveScript').compile(js, { bare: true, header: false })
  }

  function plainjs(js) {
    return js
  }

  function jade(html) {
    return require('jade').render(html, {pretty: true})
  }

  function riotjs(js) {

    // strip comments
    js = js.replace(LINE_COMMENT, '').replace(JS_COMMENT, '')

    // ES6 method signatures
    var lines = js.split('\n'),
        es6Ident = ''

    lines.forEach(function(line, i) {
      var l = line.trim()

      // method start
      if (l[0] != '}' && l.indexOf('(') > 0 && l.indexOf('function') == -1) {
        var end = /[{}]/.exec(l.slice(-1)),
            m = end && /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)

        if (m && !/^(if|while|switch|for)$/.test(m[2])) {
          lines[i] = m[1] + 'this.' + m[2] + ' = function(' + m[3] + ') {'

          // foo() { }
          if (end[0] == '}') {
            lines[i] += ' ' + l.slice(m[0].length - 1, -1) + '}.bind(this)'

          } else {
            es6Ident = m[1]
          }
        }

      }

      // method end
      if (line.slice(0, es6Ident.length + 1) == es6Ident + '}') {
        lines[i] = es6Ident + '}.bind(this);'
        es6Ident = ''
      }

    })

    return lines.join('\n')

  }

  function scopedCSS (tag, style) {
    return style.replace(CSS_COMMENT, '').replace(CSS_SELECTOR, function (m, p1, p2) {
      return p1 + ' ' + p2.split(/\s*,\s*/g).map(function(sel) {
        return sel[0] == '@' ? sel : tag + ' ' + sel.replace(/:scope\s*/, '')
      }).join(',')
    }).trim()
  }

  function compileJS(js, opts, type) {
    var parser = opts.parser || (type ? JS_PARSERS[type] : riotjs)
    if (!parser) throw new Error('Parser not found "' + type + '"')
    return parser(js, opts)
  }

  function compileTemplate(lang, html) {
    var parser = HTML_PARSERS[lang]
    if (!parser) throw new Error('Template parser not found "' + lang + '"')
    return parser(html)
  }

  function compileCSS(style, tag, type) {
    if (type == 'scoped-css') style = scopedCSS(tag, style)
    return style.replace(/\s+/g, ' ').replace(/\\/g, '\\\\').replace(/'/g, "\\'").trim()
  }

  function mktag(name, html, css, js) {
    return 'riot.tag(\''
      + name + '\', \''
      + html + '\''
      + (css ? ', \'' + css + '\'' : '')
      + ', function(opts) {' + js + '\n});'
  }

  function compile(src, opts) {

    opts = opts || {}

    if (opts.brackets) riot.settings.brackets = opts.brackets

    if (opts.template) src = compileTemplate(opts.template, src)

    src = src.replace(LINE_TAG, function(_, tagName, html) {
      return mktag(tagName, compileHTML(html, opts), '', '')
    })

    return src.replace(CUSTOM_TAG, function(_, tagName, html, js) {

      html = html || ''

      // js wrapped inside <script> tag
      var type = opts.type

      if (!js.trim()) {
        html = html.replace(SCRIPT, function(_, fullType, _type, script) {
          if (_type) type = _type.replace('text/', '')
          js = script
          return ''
        })
      }

      // styles in <style> tag
      var styleType = 'css',
          style = ''

      html = html.replace(STYLE, function(_, fullType, _type, _style) {
        if (fullType && 'scoped' == fullType.trim()) styleType = 'scoped-css'
          else if (_type) styleType = _type.replace('text/', '')
        style = _style
        return ''
      })

      return mktag(
        tagName,
        compileHTML(html, opts, type),
        compileCSS(style, tagName, styleType),
        compileJS(js, opts, type)
      )

    })

  }


  // io.js (node)
  if (!window) {
    this.riot = require(process.env.RIOT || '../riot')
    return module.exports = {
      compile: compile,
      html: compileHTML,
      style: compileCSS,
      js: compileJS
    }
  }

  // browsers
  var doc = window.document,
      promise,
      ready


  function GET(url, fn) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) fn(req.responseText)
    }
    req.open('GET', url, true)
    req.send('')
  }

  function unindent(src) {
    var ident = /[ \t]+/.exec(src)
    if (ident) src = src.replace(new RegExp('^' + ident[0], 'gm'), '')
    return src
  }

  function globalEval(js) {
    var node = doc.createElement('script'),
        root = doc.documentElement

    node.text = compile(js)
    root.appendChild(node)
    root.removeChild(node)
  }

  function compileScripts(fn) {
    var scripts = doc.querySelectorAll('script[type="riot/tag"]'),
        scriptsAmount = scripts.length

    ;[].map.call(scripts, function(script) {
      var url = script.getAttribute('src')

      function compileTag(source) {
        globalEval(source)
        scriptsAmount--
        if (!scriptsAmount) {
          promise.trigger('ready')
          ready = true
          fn && fn()
        }
      }

      return url ? GET(url, compileTag) : compileTag(unindent(script.innerHTML))
    })

  }


  riot.compile = function(arg, fn) {

    // string
    if (typeof arg == 'string') {

      // compile & return
      if (arg.trim()[0] == '<') {
        var js = unindent(compile(arg))
        if (!fn) globalEval(js)
        return js

      // URL
      } else {
        return GET(arg, function(str) {
          var js = unindent(compile(str))
          globalEval(js)
          fn && fn(js, str)
        })
      }
    }

    // must be a function
    if (typeof arg != 'function') arg = undefined

    // all compiled
    if (ready) return arg && arg()

    // add to queue
    if (promise) {
      arg && promise.on('ready', arg);
      riot.doneLoadingTags=function(){
         promise.trigger('ready');
         ready = true;
      }
    // grab riot/tag elements + load & execute them
    } else {
      promise = riot.observable()
      compileScripts(arg)
    }

  }

  // reassign mount methods
  var mount = riot.mount

  riot.mount = function(a, b, c) {
    var ret
    riot.compile(function() { ret = mount(a, b, c) })
    console.log(ret);
    return ret
  }

  // @deprecated
  riot.mountTo = riot.mount

})(typeof window != 'undefined' ? window : undefined)

  // share methods for other riot parts, e.g. compiler
  riot.util = { brackets: brackets, tmpl: tmpl }

  // support CommonJS, AMD & browser
  if (typeof exports === 'object')
    module.exports = riot
  else if (typeof define === 'function' && define.amd)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : undefined);
riot.tag('hp-card', '<h1>{opts.title}</h1><div id="content"><yield></yield></div>', function(opts) {

});
riot.tag('hp-cardlist', '<hp-instacard each="{card, index in cards}" class="card-{index}" riot-style="-webkit-animation-delay:{(index+1)*50}ms" title="How u doin???" model="{card}"></hp-instacard>', function(opts) {

    var myData=veronica.getCurrentComponentData();

    this.isLoading = true;

    if(myData.cards==undefined){
        $.get("response.json").then(function(response) {
            var res = JSON.parse(response);
            this.cards = res.response;
            myData.cards=res.response;
            riot.update();
        })
    }
    else{
        this.cards = myData.cards;
    }
    
});

riot.tag('hp-header', '<div class="container-icon"><img class="icon" width="24" height="24" src="http://google.github.io/material-design-icons/action/svg/ic_turned_in_not_24px.svg"></img></div><div class="container-text"><div class="heading">HashPlay</div><div class="sub-heading">follow your likes from around the web</div></div><a href="/settings"><svg class="icon-settings" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M0 0h24v24h-24z" fill="none"></path><path fill="#fff" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65c-.03-.24-.24-.42-.49-.42h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-7.43 2.52c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg></a>', function(opts) {
        var thisTag=(this.root);
        function updateHeaderSize(){
            if(window.scrollY>100){
                thisTag.classList.add("stickyHeader")
            }
            else{
                if(thisTag.classList.contains("stickyHeader")){
                    thisTag.classList.remove("stickyHeader")
                }
            }

            requestAnimationFrame(updateHeaderSize);
        }

        requestAnimationFrame(updateHeaderSize);
    
});
riot.tag('hp-instacard', '<div class="img"><img riot-src="{opts.model.status.img}" class="img-insta"></div></div><div class="desc"> {opts.model.status.text} </div>', function(opts) {
    
});
riot.tag('hp-settings', '<hp-card title="Change your hashtag"><div class="input"><input class="hashtag"></input></div><div class="action-panel"><button class="submit" onclick="{saveHashtag}">Save</button></div></hp-card>', 'hp-settings hp-card{ background: #fff; display: block; margin: 5px; } hp-settings hp-card h1{ border-bottom: 1px solid yellow; color: black; font-size: 20px; font-weight: normal; padding: 5px; } hp-settings .input{ padding: 10px; } hp-settings .action-panel{ border-top:1px solid #ccc; padding: 10px; } hp-settings input{ padding: 5px; font-size: 14px; width: 100%; }', function(opts) {
    this.saveHashtag = function() {
        var hashValue = this.root.querySelector(".hashtag").value || '';
        localStorage.setItem("hashTag", hashValue);
    }
    
});

/* globals riot,ActiveXObject */ ;

(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v0.0.2",
        settings: {
            viewTag: ".app-body",
            maxPageTransitionTime: 500,
            semiQualifiedBrowsers: [
                "UCBrowser",
                "Opera Mini"
            ]
        }
    };

    var framework = {};

    /* Core ===============*/
    (function(fw,window) {
        var appStatus = {};

        function Core() {
            this.applicationStatus = appStatus;
        }

        Core.prototype.selector = function(domQuery, root) {
            if (root) {
                return root.querySelectorAll(domQuery);
            } else {
                return document.querySelectorAll(domQuery);
            }
        };

        window.$=function(tag,root){
            return document.querySelectorAll(tag,root);
        }

        fw.Core = Core;
    })(framework,window);

    /* Event Bus ===============*/

    /*Reference: https://github.com/munkychop/bullet*/
    (function(veronica) {
        "use strict";

        var PB = function() {
            var _self = this,
                _events = {};

            _self.on = function(event, fn, once) {
                if (arguments.length < 2 ||
                    typeof event !== "string" ||
                    typeof fn !== "function") return;

                var fnString = fn.toString();

                // if the named event object already exists in the dictionary...
                if (typeof _events[event] !== "undefined") {
                    if (typeof once === "boolean") {
                        // the function already exists, so update it's 'once' value.
                        _events[event].callbacks[fnString].once = once;
                    } else {
                        _events[event].callbacks[fnString] = {
                            cb: fn,
                            once: !!once
                        };
                    }
                } else {
                    // create a new event object in the dictionary with the specified name and callback.
                    _events[event] = {
                        callbacks: {}
                    };

                    _events[event].callbacks[fnString] = {
                        cb: fn,
                        once: !!once
                    };
                }
            };

            _self.once = function(event, fn) {
                _self.on(event, fn, true);
            };

            _self.off = function(event, fn) {
                if (typeof event !== "string" ||
                    typeof _events[event] === "undefined") return;

                // remove just the function, if passed as a parameter and in the dictionary.
                if (typeof fn === "function") {
                    var fnString = fn.toString(),
                        fnToRemove = _events[event].callbacks[fnString];

                    if (typeof fnToRemove !== "undefined") {
                        // delete the callback object from the dictionary.
                        delete _events[event].callbacks[fnString];
                    }
                } else {
                    // delete all functions in the dictionary that are
                    // registered to this event by deleting the named event object.
                    delete _events[event];
                }
            };

            _self.trigger = function(event, data) {
                if (typeof event !== "string" ||
                    typeof _events[event] === "undefined") return;

                for (var fnString in _events[event].callbacks) {
                    var callbackObject = _events[event].callbacks[fnString];

                    if (typeof callbackObject.cb === "function") callbackObject.cb(data);
                    if (typeof callbackObject.once === "boolean" && callbackObject.once === true) _self.off(event, callbackObject.cb);
                }
            };

        };

        veronica.eventBus = new PB();

    })(veronica);
    /* Promises ===============*/
    (function(veronica) {
        function Promise() {
            this._successCallbacks = [];
            this._errorCallbacks = [];
        }

        function resolvePromise(func,context,queue,promise){
            queue.push(function() {
                var res = func.apply(context, arguments);
                if (res && typeof res.then === "function")
                    res.then(promise.done, promise);
            });
        }

        Promise.prototype.then = function(func, context) {
            var p;
            if (this._isdone) {
                p = func.apply(context, this.result);
            } else {
                p = new Promise();
                resolvePromise(func,context,this._successCallbacks,p);
            }
            return p;
        };

        Promise.prototype.catch = function(func, context) {
            var p;
            if (this._isdone&&this._isfailure) {
                p = func.apply(context, this.result);
            } else {
                p = new Promise();
                resolvePromise(func,context,this._errorCallbacks,p);
            }
            return p;
        };

        Promise.prototype.resolve = function() {
            this.result = arguments;
            this._isdone = true;
            this._issuccess = true;
            for (var i = 0; i < this._successCallbacks.length; i++) {
                this._successCallbacks[i].apply(null, arguments);
            }
            this._successCallbacks = [];
        };

        Promise.prototype.reject = function() {
            this.result = arguments;
            this._isdone = true;
            this._isfailure = true;
            for (var i = 0; i < this._errorCallbacks.length; i++) {
                this._errorCallbacks[i].apply(null, arguments);
            }
            this._errorCallbacks = [];
        };

        // function join(promises) {
        //     var p = new Promise();
        //     var results = [];

        //     if (!promises || !promises.length) {
        //         p.done(results);
        //         return p;
        //     }

        //     var numdone = 0;
        //     var total = promises.length;

        //     function notifier(i) {
        //         return function() {
        //             numdone += 1;
        //             results[i] = Array.prototype.slice.call(arguments);
        //             if (numdone === total) {
        //                 p.done(results);
        //             }
        //         };
        //     }

        //     for (var i = 0; i < total; i++) {
        //         promises[i].then(notifier(i));
        //     }

        //     return p;
        // }

        // function chain(funcs, args) {
        //     var p = new Promise();
        //     if (funcs.length === 0) {
        //         p.done.apply(p, args);
        //     } else {
        //         funcs[0].apply(null, args).then(function() {
        //             funcs.splice(0, 1);
        //             chain(funcs, arguments).then(function() {
        //                 p.done.apply(p, arguments);
        //             });
        //         });
        //     }
        //     return p;
        // }

        var promise = {
            Promise: Promise
        };

        veronica.promise = promise;
    })(veronica);
    /* Ajax ===============*/
    (function(veronica) {
        function _encode(data) {
            var result = "";
            if (typeof data === "string") {
                result = data;
            } else {
                var e = encodeURIComponent;
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        result += "&" + e(k) + "=" + e(data[k]);
                    }
                }
            }
            return result;
        }

        function new_xhr() {
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            return xhr;
        }


        function ajax(method, url, data, headers) {
            var p = new veronica.promise.Promise();
            var xhr, payload;
            data = data || {};
            headers = headers || {};

            try {
                xhr = new_xhr();
            } catch (e) {
                p.reject(veronicaAjax.ENOXHR);
                return p;
            }

            payload = _encode(data);
            if (method === "GET" && payload) {
                url += "?" + payload;
                payload = null;
            }

            xhr.open(method, url);
            if (method === "POST") {
                xhr.setRequestHeader("Content-type", "application/json");
            } else {
                xhr.setRequestHeader("Content-type", "*/*");
            }
            for (var h in headers) {
                if (headers.hasOwnProperty(h)) {
                    xhr.setRequestHeader(h, headers[h]);
                }
            }

            function onTimeout() {
                xhr.abort();
                p.reject(veronicaAjax.ETIMEOUT, "", xhr);
            }

            var timeout = veronicaAjax.ajaxTimeout;
            if (timeout) {
                var tid = setTimeout(onTimeout, timeout);
            }

            xhr.onreadystatechange = function() {
                if (timeout) {
                    clearTimeout(tid);
                }
                if (xhr.readyState === 4) {
                    var err = (!xhr.status ||
                        (xhr.status < 200 || xhr.status >= 300) &&
                        xhr.status !== 304);
                    if(err){
                        p.reject(err);
                    }
                    else{
                        p.resolve(xhr.responseText, xhr);
                    }

                }
            };

            xhr.send(payload);
            return p;
        }

        function _ajaxer(method) {
            return function(url, data, headers) {
                return ajax(method, url, data, headers);
            };
        }

        var veronicaAjax = {
            ajax: ajax,
            get: _ajaxer("GET"),
            post: _ajaxer("POST"),
            put: _ajaxer("PUT"),
            del: _ajaxer("DELETE"),
            /* Error codes */
            ENOXHR: 1,
            ETIMEOUT: 2,

            /**
             * Configuration parameter: time in milliseconds after which a
             * pending AJAX request is considered unresponsive and is
             * aborted. Useful to deal with bad connectivity (e.g. on a
             * mobile network). A 0 value disables AJAX timeouts.
             *
             * Aborted requests resolve the promise with a ETIMEOUT error
             * code.
             */
            ajaxTimeout: 0
        };

        $.ajax = veronicaAjax.ajax;
        $.get = veronicaAjax.get;
        $.post = veronicaAjax.post;

    })(veronica);
    /* Persistance===============*/
    (function(fw, veronica) {
        var componentDataStore = {};
        var core = new fw.Core();

        veronica.getCurrentComponentData = function() {
            return componentDataStore[core.applicationStatus.currentComponent.tagName.toLowerCase()];
        };

        framework.setCurrentComponentData = function(Obj) {
            componentDataStore[core.applicationStatus.currentComponent.tagName.toLowerCase()] = Obj;
        };


        /* Session */
        var sessionData = [];

        function setSessionData(key, obj) {
            if (sessionStorage) {
                sessionStorage[key] = obj;
            } else {
                sessionData[key] = obj;
            }
        }

        function getSessionData(key) {
            return sessionStorage[key] || sessionData[key];
        }

        veronica.Session = {
            set: setSessionData,
            get: getSessionData
        };


        /* DS */
        var DsData = [];

        function setDsData(key, obj) {
            if (localStorage) {
                localStorage[key] = obj;
            } else {
                DsData[key] = obj;
            }
        }

        function getDsData(key) {
            return localStorage[key] || DsData[key];
        }

        function removeData(key) {
            if (localStorage) {
                localStorage.removeItem(key);
            } else {
                delete DsData[key];
            }
        }

        veronica.DS = {
            set: setDsData,
            get: getDsData,
            removeData: removeData
        };

    })(framework, veronica);
    /* Utils===============*/
    (function(fw) {
        fw.utils = {};
        fw.utils.handleAnchorClick = function(e) {
            var node = e.target;
            var parentCount = 0;
            while (node && parentCount < 4) {
                if (node.tagName === "A") {
                    e.preventDefault();
                    var pageEnterEffect = "mounting";
                    var pageLeaveEffect = "unmount";
                    if (!!node.getAttribute("data-pageentereffect")) {
                        pageEnterEffect = node.getAttribute("data-pageentereffect").trim();
                    }
                    if (!!node.getAttribute("data-pageleaveeffect")) {
                        pageLeaveEffect = node.getAttribute("data-pageleaveeffect").trim();
                    }
                    veronica.loc(node.getAttribute("href"), pageEnterEffect, pageLeaveEffect);
                    break;
                } else {
                    node = node.parentNode;
                    parentCount = parentCount + 1;
                }

            }
        };
    })(framework);
    /* Sensors Provider===============*/
    (function(veronica) {
        var sensorStatus = {
            GPS: "UNKNOWN"
        };

        function getLocation() {
            var locPromise = window.$q();
            var options = {
                enableHighAccuracy: false,
                timeout: 1500,
                maximumAge: 900000
            };

            var successLocation = function(data) {
                locPromise.resolve(data);
            };

            var failure = function(error) {
                if (error.code === error.PERMISSION_DENIED) {
                    sensorStatus.GPS = "BLOCKED";
                    locPromise.reject("LOCATION_BLOCKED");
                } else {
                    sensorStatus.GPS = "N/A";
                    locPromise.reject("LOCATION_ERROR");
                }

            };

            if (navigator.geolocation) {
                sensorStatus.GPS = "AVAILABLE";
                navigator.geolocation.getCurrentPosition(successLocation, failure, options);
            } else {
                sensorStatus.GPS = "N/A";
                locPromise.reject("LOCATION_NOT_AVAILABLE");
            }
            return locPromise;
        }

        veronica.sensors = {
            sensorStatus: sensorStatus,
            getLocation: getLocation
        };
    })(veronica);
    /* Router===============*/
    (function(fw, veronica) {

        var core = new fw.Core();
        var isPageFromPush = false;
        core.applicationStatus.viewTag = null;
        core.applicationStatus.pageTag = null;
        core.applicationStatus.routes = [];
        core.applicationStatus.currentState = {
            name: "",
            state: {}
        };

        core.applicationStatus.currentComponent = null;

        core.applicationStatus.currentComponent = null;

        function createRoute(stateName, urlRegex, componentToMount, preserveDateOnUnmount) {
            return {
                url: urlRegex,
                state: stateName,
                component: componentToMount,
                preserveDateOnUnmount: preserveDateOnUnmount || false
            };
        }

        function getCurrentPath() {
            var route = location.pathname.split("#")[0];
            if (typeof route === "string") {
                return route;
            } else if (route.length > 0) {
                return route[0];
            } else {
                throw new Error("Unable to process route");
            }
        }

        function addRoute(route) {
            var currState = core.applicationStatus.currentState;
            if (route && route.url && route.component) {
                core.applicationStatus.routes.push(route);
                if (currState.name === "") {
                    loc(getCurrentPath());
                }
            } else {
                throw new Error("Route object should contain a URL regex and a component name");
            }
        }

        function loc() {
            if (arguments.length === 0) {
                return core.applicationStatus.currentState;
            } else if (arguments.length > 0 && typeof(arguments[0]) == "string") {
                var newRoute = arguments[0];
                var currRoute = getCurrentPath();
                if (history && history.pushState) {
                    for (var r in core.applicationStatus.routes) {
                        var route = core.applicationStatus.routes[r];
                        if (newRoute.match(route.url) && (core.applicationStatus.currentState.name !== route.state)) {
                            if (core.applicationStatus.currentState.name === "") {
                                history.replaceState(route, "", newRoute);
                            } else {
                                route.prevPage=currRoute;
                                history.pushState(route, "", newRoute);
                                veronica.isPageFromPush = true;
                            }
                            veronica.eventBus.trigger("veronica:stateChange", route);
                            var pageEnterEffect = "mounting";
                            var pageLeaveEffect = "unmount";
                            if (arguments[1] && typeof(arguments[1]) == "string") {
                                pageEnterEffect = arguments[1];
                            }
                            if (arguments[2] && typeof(arguments[2]) == "string") {
                                pageLeaveEffect = arguments[2];
                            }
                            evalRoute(route, pageEnterEffect, pageLeaveEffect);
                            break;
                        }
                    }
                } else {
                    if (newRoute !== currRoute) {
                        throw new Error("full page reload logic here"); //TODO: full page reload logic here
                    }
                }
            }
        }

        window.onpopstate = function(e) {
            // if(e) because veronica shouldn't intrupt the #changes
            if (e && e.state) {
                if (core.applicationStatus.currentState.state.state !== e.state.state) {
                    veronica.eventBus.trigger("veronica:stateChange", e.state);
                }
                evalRoute(e.state, "mounting-pop", "unmount-pop");
            }
        };

        function evalRoute(stateObj, pageEnterEffect, pageLeaveEffect) {
            // declare components and states
            if (stateObj === null) {
                return;
            }

            var componentName = stateObj.component;
            var prevState = core.applicationStatus.currentState;
            var preserveComponentData = false;

            //check if data of this component is to be preserved
            if (prevState && prevState.state && prevState.state.preserveDateOnUnmount) {
                preserveComponentData = prevState.state.preserveDateOnUnmount;
            }

            //initialize current state and component
            core.applicationStatus.currentState.name = stateObj.state;
            core.applicationStatus.currentState.state = stateObj;
            core.applicationStatus.currentComponent = document.createElement(componentName);

            //set current component data in data store
            framework.setCurrentComponentData(veronica.getCurrentComponentData() || {});

            mountNewPage(pageEnterEffect, pageLeaveEffect);

            riot.mount(componentName, {});
        }

        function mountNewPage(pageEnterEffect, pageLeaveEffect) {
            pageEnterEffect = pageEnterEffect || "mounting";
            pageLeaveEffect = pageLeaveEffect || "unmount";

            if (core.applicationStatus.viewTag) {
                //if there is already something in current page
                if (core.applicationStatus.pageTag.children.length > 0) {
                    var elem = document.createElement("div");
                    var shownEventFired = false;
                    elem.className = "page " + core.applicationStatus.currentComponent.tagName.toLowerCase();
                    elem.appendChild(core.applicationStatus.currentComponent);

                    core.applicationStatus.pageTag.addEventListener("webkitTransitionEnd", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        core.applicationStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    core.applicationStatus.pageTag.addEventListener("oTransitionEnd", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        core.applicationStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    core.applicationStatus.pageTag.addEventListener("transitionend", function() {
                        animEndCallback(this, elem);
                        shownEventFired = true;
                        core.applicationStatus.currentComponent.dispatchEvent(new Event("shown"));
                    });

                    setTimeout(function() {
                        if (!shownEventFired) {
                            core.applicationStatus.currentComponent.dispatchEvent(new Event("shown"));
                        }
                    }, veronica.settings.maxPageTransitionTime);

                    if (navigator.userAgent.indexOf("UCBrowser") == -1) {
                        elem.classList.add(pageEnterEffect);
                        core.applicationStatus.pageTag.classList.add(pageLeaveEffect);
                        core.applicationStatus.viewTag.appendChild(elem);

                    } else {
                        var newComponent = core.applicationStatus.currentComponent.tagName.toLowerCase();
                        var newTag = "<div class='page " + newComponent + "'>" + "<" + newComponent + "></" + newComponent + ">" + "</div>";
                        core.applicationStatus.pageTag.innerHTML = newTag;
                    }



                } else {
                    //if this is the first time a page is being mounted
                    core.applicationStatus.pageTag.classList.add(core.applicationStatus.currentComponent.tagName.toLowerCase());
                    core.applicationStatus.pageTag.appendChild(core.applicationStatus.currentComponent);
                }
            }
        }

        function animEndCallback(currElem, newPage) {
            currElem.className = "hidden";
            currElem.remove();
            newPage.className = "page " + core.applicationStatus.currentComponent.tagName.toLowerCase();
            core.applicationStatus.pageTag = newPage;
        }

        function getPrevPageUrl(){
            if(history.state){
                return history.state.prevPage||null;
            }
            else{
                return null;
            }
            
        }

        var router = {
            createRoute: createRoute,
            getCurrentPath: getCurrentPath,
            addRoute: addRoute,
            getPrevPageUrl: getPrevPageUrl,
            loc: loc
        };

        fw.router = router;
        veronica.isPageFromPush = isPageFromPush;

    })(framework, veronica);

    /* Init===============*/
    window.$q = function() {
        return new veronica.promise.Promise();
    };
    window.veronica = veronica;

    function testAnimationCapability() {
        var animation = false,
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            pfx = '',
            elm = $("body")[0];

        if (elm.style.animationName !== undefined) {
            animation = true;
        }

        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }

        return animation;
    }


    function init() {

        var $ = window.$;
        var core = new framework.Core();
        core.applicationStatus.viewTag = $(veronica.settings.viewTag)[0];
        core.applicationStatus.viewTag.innerHTML = "<div class='page'></div>";

        core.applicationStatus.pageTag = core.applicationStatus.viewTag.querySelector(".page");

        if (!testAnimationCapability()) {
            $("body")[0].classList.add("noanim");
        }

        if (core.applicationStatus.routes.length > 0) {
            veronica.loc(veronica.getCurrentPath());
        } else {
            window.dispatchEvent(new Event("veronica:init"));
            riot.mount("*", {});
            riot.doneLoadingTags();
        }

        document.addEventListener("click", framework.utils.handleAnchorClick);
    }

    veronica.createRoute = framework.router.createRoute;
    veronica.getCurrentPath = framework.router.getCurrentPath;
    veronica.addRoute = framework.router.addRoute;
    veronica.loc = framework.router.loc;

    document.onreadystatechange = function() {
        if (document.readyState == "interactive") {
            init();
        }
    };
})(window, riot);
