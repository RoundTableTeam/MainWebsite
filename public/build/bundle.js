
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src/inc/navbar.svelte generated by Svelte v3.44.0 */

    const file$D = "src/inc/navbar.svelte";

    function create_fragment$D(ctx) {
    	let header;
    	let nav;
    	let div3;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let button;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let span2;
    	let t3;
    	let span3;
    	let t4;
    	let div1;
    	let ul0;
    	let li0;
    	let a1;
    	let t6;
    	let i0;
    	let t7;
    	let li1;
    	let a2;
    	let t9;
    	let i1;
    	let t10;
    	let li2;
    	let a3;
    	let t12;
    	let i2;
    	let t13;
    	let ul1;
    	let li3;
    	let a4;
    	let t15;
    	let i3;
    	let t16;
    	let li4;
    	let a5;
    	let t18;
    	let i4;
    	let t19;
    	let li5;
    	let a6;
    	let t21;
    	let i5;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			button = element("button");
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			span2 = element("span");
    			t3 = space();
    			span3 = element("span");
    			t4 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "تیم ما";
    			t6 = space();
    			i0 = element("i");
    			t7 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "تماس با ما";
    			t9 = space();
    			i1 = element("i");
    			t10 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "خدمات ما";
    			t12 = space();
    			i2 = element("i");
    			t13 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "نمونه کار ها";
    			t15 = space();
    			i3 = element("i");
    			t16 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "درباره ما";
    			t18 = space();
    			i4 = element("i");
    			t19 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "خانه";
    			t21 = space();
    			i5 = element("i");
    			if (!src_url_equal(img.src, img_src_value = "images/rt-logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "data-at2x", "images/logo-black@3x.png");
    			attr_dev(img, "class", "default-logo");
    			attr_dev(img, "alt", "");
    			add_location(img, file$D, 6, 20, 354);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$D, 5, 16, 300);
    			attr_dev(div0, "class", "col-6 px-lg-0 menu-logo");
    			add_location(div0, file$D, 4, 12, 246);
    			attr_dev(span0, "class", "navbar-toggler-line");
    			add_location(span0, file$D, 11, 20, 757);
    			attr_dev(span1, "class", "navbar-toggler-line");
    			add_location(span1, file$D, 12, 20, 819);
    			attr_dev(span2, "class", "navbar-toggler-line");
    			add_location(span2, file$D, 13, 20, 881);
    			attr_dev(span3, "class", "navbar-toggler-line");
    			add_location(span3, file$D, 14, 20, 943);
    			attr_dev(button, "class", "navbar-toggler float-end");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNav");
    			attr_dev(button, "aria-controls", "navbarNav");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$D, 10, 16, 570);
    			attr_dev(a1, "href", "/team");
    			attr_dev(a1, "class", "nav-link");
    			add_location(a1, file$D, 19, 28, 1283);
    			attr_dev(i0, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i0, "data-bs-toggle", "dropdown");
    			attr_dev(i0, "aria-hidden", "true");
    			add_location(i0, file$D, 20, 28, 1355);
    			attr_dev(li0, "class", "nav-item dropdown megamenu");
    			add_location(li0, file$D, 18, 24, 1215);
    			attr_dev(a2, "href", "/contact");
    			attr_dev(a2, "class", "nav-link");
    			add_location(a2, file$D, 23, 28, 1578);
    			attr_dev(i1, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i1, "data-bs-toggle", "dropdown");
    			attr_dev(i1, "aria-hidden", "true");
    			add_location(i1, file$D, 24, 28, 1657);
    			attr_dev(li1, "class", "nav-item dropdown simple-dropdown");
    			add_location(li1, file$D, 22, 24, 1503);
    			attr_dev(a3, "href", "/service");
    			attr_dev(a3, "class", "nav-link");
    			add_location(a3, file$D, 27, 28, 1880);
    			attr_dev(i2, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i2, "data-bs-toggle", "dropdown");
    			attr_dev(i2, "aria-hidden", "true");
    			add_location(i2, file$D, 28, 28, 1957);
    			attr_dev(li2, "class", "nav-item dropdown simple-dropdown");
    			add_location(li2, file$D, 26, 24, 1805);
    			attr_dev(ul0, "class", "navbar-nav alt-font navbar-left justify-content-end");
    			add_location(ul0, file$D, 17, 20, 1126);
    			attr_dev(a4, "href", "/portfolio");
    			attr_dev(a4, "class", "nav-link");
    			add_location(a4, file$D, 33, 28, 2279);
    			attr_dev(i3, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i3, "data-bs-toggle", "dropdown");
    			attr_dev(i3, "aria-hidden", "true");
    			add_location(i3, file$D, 34, 28, 2362);
    			attr_dev(li3, "class", "nav-item dropdown ");
    			add_location(li3, file$D, 32, 24, 2219);
    			attr_dev(a5, "href", "/about");
    			attr_dev(a5, "class", "nav-link");
    			add_location(a5, file$D, 37, 28, 2585);
    			attr_dev(i4, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i4, "data-bs-toggle", "dropdown");
    			attr_dev(i4, "aria-hidden", "true");
    			add_location(i4, file$D, 38, 28, 2661);
    			attr_dev(li4, "class", "nav-item dropdown simple-dropdown");
    			add_location(li4, file$D, 36, 24, 2510);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "nav-link");
    			add_location(a6, file$D, 41, 28, 2884);
    			attr_dev(i5, "class", "fa fa-angle-down dropdown-toggle");
    			attr_dev(i5, "data-bs-toggle", "dropdown");
    			attr_dev(i5, "aria-hidden", "true");
    			add_location(i5, file$D, 42, 28, 2950);
    			attr_dev(li5, "class", "nav-item dropdown simple-dropdown");
    			add_location(li5, file$D, 40, 24, 2809);
    			attr_dev(ul1, "class", "navbar-nav alt-font navbar-right justify-content-start");
    			add_location(ul1, file$D, 31, 20, 2127);
    			attr_dev(div1, "class", "collapse navbar-collapse justify-content-between");
    			attr_dev(div1, "id", "navbarNav");
    			add_location(div1, file$D, 16, 16, 1027);
    			attr_dev(div2, "class", "col-auto col-lg-12 px-lg-0 menu-order");
    			add_location(div2, file$D, 9, 12, 502);
    			attr_dev(div3, "class", "container-lg nav-header-container");
    			add_location(div3, file$D, 3, 8, 186);
    			attr_dev(nav, "class", "navbar navbar-expand-lg top-space navbar-dark bg-black header-dark fixed-top menu-logo-center");
    			add_location(nav, file$D, 2, 4, 70);
    			attr_dev(header, "class", "header-with-topbar");
    			add_location(header, file$D, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, span0);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			append_dev(button, t2);
    			append_dev(button, span2);
    			append_dev(button, t3);
    			append_dev(button, span3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(li0, t6);
    			append_dev(li0, i0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(li1, t9);
    			append_dev(li1, i1);
    			append_dev(ul0, t10);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(li2, t12);
    			append_dev(li2, i2);
    			append_dev(div1, t13);
    			append_dev(div1, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(li3, t15);
    			append_dev(li3, i3);
    			append_dev(ul1, t16);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(li4, t18);
    			append_dev(li4, i4);
    			append_dev(ul1, t19);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			append_dev(li5, t21);
    			append_dev(li5, i5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/inc/home/hero.svelte generated by Svelte v3.44.0 */

    const file$C = "src/inc/home/hero.svelte";

    function create_fragment$C(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let a0;
    	let t3;
    	let span0;
    	let t4;
    	let div4;
    	let a1;
    	let span1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ما میز گردیم داداش";
    			t2 = space();
    			a0 = element("a");
    			t3 = text("همین حالا شروع کن");
    			span0 = element("span");
    			t4 = space();
    			div4 = element("div");
    			a1 = element("a");
    			span1 = element("span");
    			span1.textContent = "اسکرول";
    			attr_dev(div0, "class", "position-absolute cover-background top-0px left-0px w-100 h-100");
    			attr_dev(div0, "data-parallax-background-ratio", "0.5");
    			set_style(div0, "background-image", "url('images/home-design-agency-bg-img-01.png')");
    			add_location(div0, file$C, 1, 4, 145);
    			attr_dev(h1, "class", "alt-font font-weight-600 title-large text-extra-dark-gray letter-spacing-minus-4px margin-4-half-rem-bottom sm-letter-spacing-minus-1-half xs-w-65");
    			add_location(h1, file$C, 5, 16, 563);
    			attr_dev(span0, "class", "bg-white");
    			add_location(span0, file$C, 6, 161, 907);
    			attr_dev(a0, "href", "/service");
    			attr_dev(a0, "class", "btn btn-extra-large btn-expand-ltr text-extra-dark-gray btn-rounded align-self-start font-weight-600");
    			add_location(a0, file$C, 6, 16, 762);
    			attr_dev(div1, "class", "col-12 col-lg-5 col-md-6 col-sm-7 full-screen md-h-650px sm-h-500px d-flex flex-column justify-content-center padding-8-rem-tb");
    			add_location(div1, file$C, 4, 12, 406);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$C, 3, 8, 376);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$C, 2, 4, 344);
    			attr_dev(span1, "class", "scroll-down-text alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-1-half margin-5px-bottom");
    			add_location(span1, file$C, 12, 12, 1158);
    			attr_dev(a1, "href", "#about");
    			attr_dev(a1, "class", "section-link d-block w-2px h-35px bg-white mx-auto right-0px left-0px position-absolute");
    			add_location(a1, file$C, 11, 8, 1032);
    			attr_dev(div4, "class", "scroll-down-bottom");
    			add_location(div4, file$C, 10, 4, 991);
    			attr_dev(section, "class", "parallax p-0");
    			attr_dev(section, "data-parallax-background-ratio", "0.3");
    			set_style(section, "background-image", "url('images/home-design-agency-bg-img-01.jpg')");
    			add_location(section, file$C, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(section, t0);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, a0);
    			append_dev(a0, t3);
    			append_dev(a0, span0);
    			append_dev(section, t4);
    			append_dev(section, div4);
    			append_dev(div4, a1);
    			append_dev(a1, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    let clients = [
            {
                name: "کوک",
                img: "images/clients-logo-06.png",
                link: "https://aerbir.ir"
            },
         {
             name: "کوک",
             img: "images/clients-logo-06.png",
             link: "https://aerbir.ir"
         },
         {
             name: "کوک",
             img: "images/clients-logo-06.png",
             link: "https://aerbir.ir"
         },
         {
             name: "کوک",
             img: "images/clients-logo-06.png",
             link: "https://aerbir.ir"
         },
         {
             name: "کوک",
             img: "images/clients-logo-06.png",
             link: "https://aerbir.ir"
         },
         {
             name: "کوک",
             img: "images/clients-logo-06.png",
             link: "https://aerbir.ir"
         },
            ];

    /* src/inc/home/partners.svelte generated by Svelte v3.44.0 */
    const file$B = "src/inc/home/partners.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:12) {#each _clients as client}
    function create_each_block$b(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			attr_dev(img, "alt", /*client*/ ctx[1].name);
    			if (!src_url_equal(img.src, img_src_value = /*client*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$B, 10, 60, 546);
    			attr_dev(a, "href", /*client*/ ctx[1].link);
    			attr_dev(a, "class", "client-logo");
    			add_location(a, file$B, 10, 16, 502);
    			attr_dev(div, "title", /*client*/ ctx[1].name);
    			attr_dev(div, "class", "col text-center md-margin-50px-bottom wow animate__fadeIn");
    			add_location(div, file$B, 9, 12, 392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(9:12) {#each _clients as client}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let each_value = /*_clients*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row align-items-center row-cols-1 row-cols-lg-4 row-cols-sm-2 client-logo-style-02");
    			add_location(div0, file$B, 7, 8, 244);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$B, 6, 4, 212);
    			attr_dev(section, "class", "padding-100px-tb bg-gradient-white-light-gray md-padding-75px-tb sm-padding-50px-tb");
    			add_location(section, file$B, 5, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_clients*/ 1) {
    				each_value = /*_clients*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Partners', slots, []);
    	let _clients = clients.slice(0, 4);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Partners> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ clients, _clients });

    	$$self.$inject_state = $$props => {
    		if ('_clients' in $$props) $$invalidate(0, _clients = $$props._clients);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_clients];
    }

    class Partners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Partners",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/inc/home/about.svelte generated by Svelte v3.44.0 */

    const file$A = "src/inc/home/about.svelte";

    function create_fragment$A(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let t0;
    	let section;
    	let div12;
    	let div2;
    	let div0;
    	let h4;
    	let span0;
    	let t2;
    	let span1;
    	let b0;
    	let t4;
    	let b1;
    	let t6;
    	let b2;
    	let t8;
    	let div1;
    	let span2;
    	let t10;
    	let p;
    	let t12;
    	let div11;
    	let div4;
    	let div3;
    	let i0;
    	let t13;
    	let span3;
    	let t15;
    	let div6;
    	let div5;
    	let i1;
    	let t16;
    	let span4;
    	let t18;
    	let div8;
    	let div7;
    	let i2;
    	let t19;
    	let span5;
    	let t21;
    	let div10;
    	let div9;
    	let i3;
    	let t22;
    	let span6;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			t0 = space();
    			section = element("section");
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			span0 = element("span");
    			span0.textContent = "خلاق، جادار آگاه";
    			t2 = space();
    			span1 = element("span");
    			b0 = element("b");
    			b0.textContent = "استراتژی تبلیغات";
    			t4 = space();
    			b1 = element("b");
    			b1.textContent = "همه چی خوبه";
    			t6 = space();
    			b2 = element("b");
    			b2.textContent = "لوگوی زیبا :)";
    			t8 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "درباره میز گرد";
    			t10 = space();
    			p = element("p");
    			p.textContent = "متنی در اینجا بنگارید.";
    			t12 = space();
    			div11 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			i0 = element("i");
    			t13 = space();
    			span3 = element("span");
    			span3.textContent = "کار ۱";
    			t15 = space();
    			div6 = element("div");
    			div5 = element("div");
    			i1 = element("i");
    			t16 = space();
    			span4 = element("span");
    			span4.textContent = "کار ۲";
    			t18 = space();
    			div8 = element("div");
    			div7 = element("div");
    			i2 = element("i");
    			t19 = space();
    			span5 = element("span");
    			span5.textContent = "کار ۳";
    			t21 = space();
    			div10 = element("div");
    			div9 = element("div");
    			i3 = element("i");
    			t22 = space();
    			span6 = element("span");
    			span6.textContent = "میشود آیکون را انتخاب نمود۴";
    			if (!src_url_equal(script0.src, script0_src_value = "../../js/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$A, 1, 4, 18);
    			if (!src_url_equal(script1.src, script1_src_value = "../../js/theme-vendors.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$A, 2, 4, 70);
    			if (!src_url_equal(script2.src, script2_src_value = "../../js/main.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$A, 3, 4, 129);
    			attr_dev(span0, "class", "d-block p-0");
    			add_location(span0, file$A, 10, 20, 569);
    			attr_dev(b0, "class", "text-gradient-fast-blue-purple border-width-2px border-bottom border-gradient-fast-blue-purple letter-spacing-minus-1px is-visible");
    			add_location(b0, file$A, 12, 32, 717);
    			attr_dev(b1, "class", "text-gradient-fast-blue-purple border-width-2px border-bottom border-gradient-fast-blue-purple letter-spacing-minus-1px");
    			add_location(b1, file$A, 13, 32, 912);
    			attr_dev(b2, "class", "text-gradient-fast-blue-purple border-width-2px border-bottom border-gradient-fast-blue-purple letter-spacing-minus-1px");
    			add_location(b2, file$A, 14, 32, 1091);
    			attr_dev(span1, "class", "cd-words-wrapper d-initial p-0");
    			add_location(span1, file$A, 11, 20, 639);
    			attr_dev(h4, "class", "alt-font cd-headline slide font-weight-600 text-extra-dark-gray letter-spacing-minus-1px");
    			add_location(h4, file$A, 9, 16, 447);
    			attr_dev(div0, "class", "col-12 col-xl-4 col-lg-5 col-md-6 xs-margin-30px-bottom text-center text-md-start wow animate__fadeIn");
    			attr_dev(div0, "data-wow-delay", "0.2s");
    			add_location(div0, file$A, 8, 12, 293);
    			attr_dev(span2, "class", "alt-font font-weight-600 text-extra-dark-gray text-uppercase d-block margin-15px-bottom");
    			add_location(span2, file$A, 19, 16, 1501);
    			attr_dev(p, "class", "text-extra-medium w-95 line-height-36px md-w-100");
    			add_location(p, file$A, 20, 16, 1641);
    			attr_dev(div1, "class", "col-12 col-xl-5 offset-xl-2 col-md-6 offset-lg-1 text-center text-md-start last-paragraph-no-margin wow animate__fadeIn");
    			attr_dev(div1, "data-wow-delay", "0.4s");
    			add_location(div1, file$A, 18, 12, 1329);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$A, 7, 8, 263);
    			attr_dev(i0, "class", "feather icon-feather-shopping-bag align-middle icon-small text-extra-dark-gray margin-15px-right");
    			add_location(i0, file$A, 27, 20, 2130);
    			attr_dev(span3, "class", "alt-font font-weight-500 text-uppercase");
    			add_location(span3, file$A, 28, 20, 2263);
    			attr_dev(div3, "class", "d-flex justify-content-center align-items-center h-100");
    			add_location(div3, file$A, 26, 16, 2041);
    			attr_dev(div4, "class", "col md-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div4, "data-wow-delay", "0.2s");
    			add_location(div4, file$A, 25, 12, 1943);
    			attr_dev(i1, "class", "feather icon-feather-shopping-bag align-middle icon-small text-extra-dark-gray margin-15px-right");
    			add_location(i1, file$A, 35, 20, 2657);
    			attr_dev(span4, "class", "alt-font font-weight-500 text-uppercase");
    			add_location(span4, file$A, 36, 20, 2790);
    			attr_dev(div5, "class", "d-flex justify-content-center align-items-center h-100");
    			add_location(div5, file$A, 34, 16, 2568);
    			attr_dev(div6, "class", "col md-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div6, "data-wow-delay", "0.3s");
    			add_location(div6, file$A, 33, 12, 2470);
    			attr_dev(i2, "class", "feather icon-feather-shopping-bag align-middle icon-small text-extra-dark-gray margin-15px-right");
    			add_location(i2, file$A, 43, 20, 3184);
    			attr_dev(span5, "class", "alt-font font-weight-500 text-uppercase");
    			add_location(span5, file$A, 44, 20, 3318);
    			attr_dev(div7, "class", "d-flex justify-content-center align-items-center h-100");
    			add_location(div7, file$A, 42, 16, 3095);
    			attr_dev(div8, "class", "col xs-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div8, "data-wow-delay", "0.4s");
    			add_location(div8, file$A, 41, 12, 2997);
    			attr_dev(i3, "class", "feather icon-feather-shopping-bag align-middle icon-small text-extra-dark-gray margin-15px-right");
    			add_location(i3, file$A, 51, 20, 3690);
    			attr_dev(span6, "class", "alt-font font-weight-500 text-uppercase");
    			add_location(span6, file$A, 52, 20, 3823);
    			attr_dev(div9, "class", "d-flex justify-content-center align-items-center h-100");
    			add_location(div9, file$A, 50, 16, 3601);
    			attr_dev(div10, "class", "col wow animate__fadeIn");
    			attr_dev(div10, "data-wow-delay", "0.5s");
    			add_location(div10, file$A, 49, 12, 3525);
    			attr_dev(div11, "class", "row row-cols-1 row-cols-lg-4 row-cols-sm-2 justify-content-center margin-9-rem-top md-margin-6-rem-top");
    			add_location(div11, file$A, 23, 8, 1770);
    			attr_dev(div12, "class", "container");
    			add_location(div12, file$A, 6, 4, 231);
    			attr_dev(section, "class", "big-section");
    			attr_dev(section, "id", "about");
    			add_location(section, file$A, 5, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div12);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h4);
    			append_dev(h4, span0);
    			append_dev(h4, t2);
    			append_dev(h4, span1);
    			append_dev(span1, b0);
    			append_dev(span1, t4);
    			append_dev(span1, b1);
    			append_dev(span1, t6);
    			append_dev(span1, b2);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(div1, t10);
    			append_dev(div1, p);
    			append_dev(div12, t12);
    			append_dev(div12, div11);
    			append_dev(div11, div4);
    			append_dev(div4, div3);
    			append_dev(div3, i0);
    			append_dev(div3, t13);
    			append_dev(div3, span3);
    			append_dev(div11, t15);
    			append_dev(div11, div6);
    			append_dev(div6, div5);
    			append_dev(div5, i1);
    			append_dev(div5, t16);
    			append_dev(div5, span4);
    			append_dev(div11, t18);
    			append_dev(div11, div8);
    			append_dev(div8, div7);
    			append_dev(div7, i2);
    			append_dev(div7, t19);
    			append_dev(div7, span5);
    			append_dev(div11, t21);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, i3);
    			append_dev(div9, t22);
    			append_dev(div9, span6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src/inc/home/ability.svelte generated by Svelte v3.44.0 */

    const file$z = "src/inc/home/ability.svelte";

    function create_fragment$z(ctx) {
    	let section;
    	let div25;
    	let div24;
    	let div5;
    	let figure0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let figcaption0;
    	let div2;
    	let span0;
    	let t4;
    	let h50;
    	let t5;
    	let br0;
    	let t6;
    	let t7;
    	let span1;
    	let i0;
    	let t8;
    	let div4;
    	let div3;
    	let p0;
    	let t10;
    	let a0;
    	let t12;
    	let div11;
    	let figure1;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let div6;
    	let t14;
    	let div7;
    	let t15;
    	let figcaption1;
    	let div8;
    	let span2;
    	let t17;
    	let h51;
    	let t18;
    	let br1;
    	let t19;
    	let t20;
    	let span3;
    	let i1;
    	let t21;
    	let div10;
    	let div9;
    	let p1;
    	let t23;
    	let a1;
    	let t25;
    	let div17;
    	let figure2;
    	let img2;
    	let img2_src_value;
    	let t26;
    	let div12;
    	let t27;
    	let div13;
    	let t28;
    	let figcaption2;
    	let div14;
    	let span4;
    	let t30;
    	let h52;
    	let t31;
    	let br2;
    	let t32;
    	let t33;
    	let span5;
    	let i2;
    	let t34;
    	let div16;
    	let div15;
    	let p2;
    	let t36;
    	let a2;
    	let t38;
    	let div23;
    	let figure3;
    	let img3;
    	let img3_src_value;
    	let t39;
    	let div18;
    	let t40;
    	let div19;
    	let t41;
    	let figcaption3;
    	let div20;
    	let span6;
    	let t43;
    	let h53;
    	let t44;
    	let br3;
    	let t45;
    	let t46;
    	let span7;
    	let i3;
    	let t47;
    	let div22;
    	let div21;
    	let p3;
    	let t49;
    	let a3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div25 = element("div");
    			div24 = element("div");
    			div5 = element("div");
    			figure0 = element("figure");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			figcaption0 = element("figcaption");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "01";
    			t4 = space();
    			h50 = element("h5");
    			t5 = text("کار ");
    			br0 = element("br");
    			t6 = text("جالب");
    			t7 = space();
    			span1 = element("span");
    			i0 = element("i");
    			t8 = space();
    			div4 = element("div");
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "متنی در اینجا بنگارید";
    			t10 = space();
    			a0 = element("a");
    			a0.textContent = "با ما تماس بگیرید";
    			t12 = space();
    			div11 = element("div");
    			figure1 = element("figure");
    			img1 = element("img");
    			t13 = space();
    			div6 = element("div");
    			t14 = space();
    			div7 = element("div");
    			t15 = space();
    			figcaption1 = element("figcaption");
    			div8 = element("div");
    			span2 = element("span");
    			span2.textContent = "01";
    			t17 = space();
    			h51 = element("h5");
    			t18 = text("کار ");
    			br1 = element("br");
    			t19 = text("جالب");
    			t20 = space();
    			span3 = element("span");
    			i1 = element("i");
    			t21 = space();
    			div10 = element("div");
    			div9 = element("div");
    			p1 = element("p");
    			p1.textContent = "متنی در اینجا بنگارید";
    			t23 = space();
    			a1 = element("a");
    			a1.textContent = "با ما تماس بگیرید";
    			t25 = space();
    			div17 = element("div");
    			figure2 = element("figure");
    			img2 = element("img");
    			t26 = space();
    			div12 = element("div");
    			t27 = space();
    			div13 = element("div");
    			t28 = space();
    			figcaption2 = element("figcaption");
    			div14 = element("div");
    			span4 = element("span");
    			span4.textContent = "01";
    			t30 = space();
    			h52 = element("h5");
    			t31 = text("کار ");
    			br2 = element("br");
    			t32 = text("جالب");
    			t33 = space();
    			span5 = element("span");
    			i2 = element("i");
    			t34 = space();
    			div16 = element("div");
    			div15 = element("div");
    			p2 = element("p");
    			p2.textContent = "متنی در اینجا بنگارید";
    			t36 = space();
    			a2 = element("a");
    			a2.textContent = "با ما تماس بگیرید";
    			t38 = space();
    			div23 = element("div");
    			figure3 = element("figure");
    			img3 = element("img");
    			t39 = space();
    			div18 = element("div");
    			t40 = space();
    			div19 = element("div");
    			t41 = space();
    			figcaption3 = element("figcaption");
    			div20 = element("div");
    			span6 = element("span");
    			span6.textContent = "01";
    			t43 = space();
    			h53 = element("h5");
    			t44 = text("کار ");
    			br3 = element("br");
    			t45 = text("جالب");
    			t46 = space();
    			span7 = element("span");
    			i3 = element("i");
    			t47 = space();
    			div22 = element("div");
    			div21 = element("div");
    			p3 = element("p");
    			p3.textContent = "متنی در اینجا بنگارید";
    			t49 = space();
    			a3 = element("a");
    			a3.textContent = "با ما تماس بگیرید";
    			attr_dev(img0, "class", "w-100");
    			if (!src_url_equal(img0.src, img0_src_value = "images/home-web-agency-img-01.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$z, 5, 20, 409);
    			attr_dev(div0, "class", "opacity-light bg-extra-dark-gray");
    			add_location(div0, file$z, 6, 20, 498);
    			attr_dev(div1, "class", "interactive-banners-overlay bg-transparent-gradient-fast-blue-purple");
    			add_location(div1, file$z, 7, 20, 571);
    			attr_dev(span0, "class", "text-extra-medium text-white opacity-6 d-block margin-10px-bottom position-relative z-index-1");
    			add_location(span0, file$z, 10, 28, 932);
    			add_location(br0, file$z, 11, 108, 1158);
    			attr_dev(h50, "class", "alt-font font-weight-600 text-white position-relative z-index-1");
    			add_location(h50, file$z, 11, 28, 1078);
    			attr_dev(i0, "class", "line-icon-Add-Window text-white icon-large");
    			add_location(i0, file$z, 12, 73, 1247);
    			attr_dev(span1, "class", "interactive-banners-hover-icon");
    			add_location(span1, file$z, 12, 28, 1202);
    			attr_dev(div2, "class", "interactive-banners-content align-items-start padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin xl-padding-2-rem-all lg-padding-4-rem-all xs-padding-5-rem-all");
    			add_location(div2, file$z, 9, 24, 717);
    			attr_dev(p0, "class", "interactive-banners-action-content w-80 text-white opacity-6 lg-w-70");
    			add_location(p0, file$z, 16, 32, 1639);
    			attr_dev(a0, "href", "our-services.html");
    			attr_dev(a0, "class", "btn btn-link btn-extra-large text-white margin-20px-top");
    			add_location(a0, file$z, 17, 32, 1777);
    			attr_dev(div3, "class", "padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin lg-padding-4-rem-all xl-padding-3-rem-all xs-padding-5-rem-all");
    			add_location(div3, file$z, 15, 28, 1466);
    			attr_dev(div4, "class", "interactive-banners-hover-action align-items-end d-flex");
    			add_location(div4, file$z, 14, 24, 1368);
    			add_location(figcaption0, file$z, 8, 20, 680);
    			attr_dev(figure0, "class", "m-0");
    			add_location(figure0, file$z, 4, 16, 368);
    			attr_dev(div5, "class", "col-12 col-xl-3 col-md-6 col-sm-8 interactive-banners-style-09 lg-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div5, "data-wow-delay", "0.2s");
    			add_location(div5, file$z, 3, 12, 189);
    			attr_dev(img1, "class", "w-100");
    			if (!src_url_equal(img1.src, img1_src_value = "images/home-web-agency-img-01.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$z, 25, 20, 2268);
    			attr_dev(div6, "class", "opacity-light bg-extra-dark-gray");
    			add_location(div6, file$z, 26, 20, 2357);
    			attr_dev(div7, "class", "interactive-banners-overlay bg-transparent-gradient-fast-blue-purple");
    			add_location(div7, file$z, 27, 20, 2430);
    			attr_dev(span2, "class", "text-extra-medium text-white opacity-6 d-block margin-10px-bottom position-relative z-index-1");
    			add_location(span2, file$z, 30, 28, 2791);
    			add_location(br1, file$z, 31, 108, 3017);
    			attr_dev(h51, "class", "alt-font font-weight-600 text-white position-relative z-index-1");
    			add_location(h51, file$z, 31, 28, 2937);
    			attr_dev(i1, "class", "line-icon-Add-Window text-white icon-large");
    			add_location(i1, file$z, 32, 73, 3106);
    			attr_dev(span3, "class", "interactive-banners-hover-icon");
    			add_location(span3, file$z, 32, 28, 3061);
    			attr_dev(div8, "class", "interactive-banners-content align-items-start padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin xl-padding-2-rem-all lg-padding-4-rem-all xs-padding-5-rem-all");
    			add_location(div8, file$z, 29, 24, 2576);
    			attr_dev(p1, "class", "interactive-banners-action-content w-80 text-white opacity-6 lg-w-70");
    			add_location(p1, file$z, 36, 32, 3498);
    			attr_dev(a1, "href", "our-services.html");
    			attr_dev(a1, "class", "btn btn-link btn-extra-large text-white margin-20px-top");
    			add_location(a1, file$z, 37, 32, 3636);
    			attr_dev(div9, "class", "padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin lg-padding-4-rem-all xl-padding-3-rem-all xs-padding-5-rem-all");
    			add_location(div9, file$z, 35, 28, 3325);
    			attr_dev(div10, "class", "interactive-banners-hover-action align-items-end d-flex");
    			add_location(div10, file$z, 34, 24, 3227);
    			add_location(figcaption1, file$z, 28, 20, 2539);
    			attr_dev(figure1, "class", "m-0");
    			add_location(figure1, file$z, 24, 16, 2227);
    			attr_dev(div11, "class", "col-12 col-xl-3 col-md-6 col-sm-8 interactive-banners-style-09 lg-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div11, "data-wow-delay", "0.2s");
    			add_location(div11, file$z, 23, 12, 2048);
    			attr_dev(img2, "class", "w-100");
    			if (!src_url_equal(img2.src, img2_src_value = "images/home-web-agency-img-01.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$z, 45, 20, 4127);
    			attr_dev(div12, "class", "opacity-light bg-extra-dark-gray");
    			add_location(div12, file$z, 46, 20, 4216);
    			attr_dev(div13, "class", "interactive-banners-overlay bg-transparent-gradient-fast-blue-purple");
    			add_location(div13, file$z, 47, 20, 4289);
    			attr_dev(span4, "class", "text-extra-medium text-white opacity-6 d-block margin-10px-bottom position-relative z-index-1");
    			add_location(span4, file$z, 50, 28, 4650);
    			add_location(br2, file$z, 51, 108, 4876);
    			attr_dev(h52, "class", "alt-font font-weight-600 text-white position-relative z-index-1");
    			add_location(h52, file$z, 51, 28, 4796);
    			attr_dev(i2, "class", "line-icon-Add-Window text-white icon-large");
    			add_location(i2, file$z, 52, 73, 4965);
    			attr_dev(span5, "class", "interactive-banners-hover-icon");
    			add_location(span5, file$z, 52, 28, 4920);
    			attr_dev(div14, "class", "interactive-banners-content align-items-start padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin xl-padding-2-rem-all lg-padding-4-rem-all xs-padding-5-rem-all");
    			add_location(div14, file$z, 49, 24, 4435);
    			attr_dev(p2, "class", "interactive-banners-action-content w-80 text-white opacity-6 lg-w-70");
    			add_location(p2, file$z, 56, 32, 5357);
    			attr_dev(a2, "href", "our-services.html");
    			attr_dev(a2, "class", "btn btn-link btn-extra-large text-white margin-20px-top");
    			add_location(a2, file$z, 57, 32, 5495);
    			attr_dev(div15, "class", "padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin lg-padding-4-rem-all xl-padding-3-rem-all xs-padding-5-rem-all");
    			add_location(div15, file$z, 55, 28, 5184);
    			attr_dev(div16, "class", "interactive-banners-hover-action align-items-end d-flex");
    			add_location(div16, file$z, 54, 24, 5086);
    			add_location(figcaption2, file$z, 48, 20, 4398);
    			attr_dev(figure2, "class", "m-0");
    			add_location(figure2, file$z, 44, 16, 4086);
    			attr_dev(div17, "class", "col-12 col-xl-3 col-md-6 col-sm-8 interactive-banners-style-09 lg-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div17, "data-wow-delay", "0.2s");
    			add_location(div17, file$z, 43, 12, 3907);
    			attr_dev(img3, "class", "w-100");
    			if (!src_url_equal(img3.src, img3_src_value = "images/home-web-agency-img-01.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$z, 65, 20, 5986);
    			attr_dev(div18, "class", "opacity-light bg-extra-dark-gray");
    			add_location(div18, file$z, 66, 20, 6075);
    			attr_dev(div19, "class", "interactive-banners-overlay bg-transparent-gradient-fast-blue-purple");
    			add_location(div19, file$z, 67, 20, 6148);
    			attr_dev(span6, "class", "text-extra-medium text-white opacity-6 d-block margin-10px-bottom position-relative z-index-1");
    			add_location(span6, file$z, 70, 28, 6509);
    			add_location(br3, file$z, 71, 108, 6735);
    			attr_dev(h53, "class", "alt-font font-weight-600 text-white position-relative z-index-1");
    			add_location(h53, file$z, 71, 28, 6655);
    			attr_dev(i3, "class", "line-icon-Add-Window text-white icon-large");
    			add_location(i3, file$z, 72, 73, 6824);
    			attr_dev(span7, "class", "interactive-banners-hover-icon");
    			add_location(span7, file$z, 72, 28, 6779);
    			attr_dev(div20, "class", "interactive-banners-content align-items-start padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin xl-padding-2-rem-all lg-padding-4-rem-all xs-padding-5-rem-all");
    			add_location(div20, file$z, 69, 24, 6294);
    			attr_dev(p3, "class", "interactive-banners-action-content w-80 text-white opacity-6 lg-w-70");
    			add_location(p3, file$z, 76, 32, 7216);
    			attr_dev(a3, "href", "our-services.html");
    			attr_dev(a3, "class", "btn btn-link btn-extra-large text-white margin-20px-top");
    			add_location(a3, file$z, 77, 32, 7354);
    			attr_dev(div21, "class", "padding-4-half-rem-lr padding-5-rem-tb last-paragraph-no-margin lg-padding-4-rem-all xl-padding-3-rem-all xs-padding-5-rem-all");
    			add_location(div21, file$z, 75, 28, 7043);
    			attr_dev(div22, "class", "interactive-banners-hover-action align-items-end d-flex");
    			add_location(div22, file$z, 74, 24, 6945);
    			add_location(figcaption3, file$z, 68, 20, 6257);
    			attr_dev(figure3, "class", "m-0");
    			add_location(figure3, file$z, 64, 16, 5945);
    			attr_dev(div23, "class", "col-12 col-xl-3 col-md-6 col-sm-8 interactive-banners-style-09 lg-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div23, "data-wow-delay", "0.2s");
    			add_location(div23, file$z, 63, 12, 5766);
    			attr_dev(div24, "class", "row justify-content-center");
    			add_location(div24, file$z, 2, 8, 136);
    			attr_dev(div25, "class", "container-fluid padding-30px-lr xs-padding-15px-lr");
    			add_location(div25, file$z, 1, 4, 63);
    			attr_dev(section, "class", "py-0 lg-padding-20px-lr xs-no-padding-lr");
    			add_location(section, file$z, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div5);
    			append_dev(div5, figure0);
    			append_dev(figure0, img0);
    			append_dev(figure0, t0);
    			append_dev(figure0, div0);
    			append_dev(figure0, t1);
    			append_dev(figure0, div1);
    			append_dev(figure0, t2);
    			append_dev(figure0, figcaption0);
    			append_dev(figcaption0, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t4);
    			append_dev(div2, h50);
    			append_dev(h50, t5);
    			append_dev(h50, br0);
    			append_dev(h50, t6);
    			append_dev(div2, t7);
    			append_dev(div2, span1);
    			append_dev(span1, i0);
    			append_dev(figcaption0, t8);
    			append_dev(figcaption0, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t10);
    			append_dev(div3, a0);
    			append_dev(div24, t12);
    			append_dev(div24, div11);
    			append_dev(div11, figure1);
    			append_dev(figure1, img1);
    			append_dev(figure1, t13);
    			append_dev(figure1, div6);
    			append_dev(figure1, t14);
    			append_dev(figure1, div7);
    			append_dev(figure1, t15);
    			append_dev(figure1, figcaption1);
    			append_dev(figcaption1, div8);
    			append_dev(div8, span2);
    			append_dev(div8, t17);
    			append_dev(div8, h51);
    			append_dev(h51, t18);
    			append_dev(h51, br1);
    			append_dev(h51, t19);
    			append_dev(div8, t20);
    			append_dev(div8, span3);
    			append_dev(span3, i1);
    			append_dev(figcaption1, t21);
    			append_dev(figcaption1, div10);
    			append_dev(div10, div9);
    			append_dev(div9, p1);
    			append_dev(div9, t23);
    			append_dev(div9, a1);
    			append_dev(div24, t25);
    			append_dev(div24, div17);
    			append_dev(div17, figure2);
    			append_dev(figure2, img2);
    			append_dev(figure2, t26);
    			append_dev(figure2, div12);
    			append_dev(figure2, t27);
    			append_dev(figure2, div13);
    			append_dev(figure2, t28);
    			append_dev(figure2, figcaption2);
    			append_dev(figcaption2, div14);
    			append_dev(div14, span4);
    			append_dev(div14, t30);
    			append_dev(div14, h52);
    			append_dev(h52, t31);
    			append_dev(h52, br2);
    			append_dev(h52, t32);
    			append_dev(div14, t33);
    			append_dev(div14, span5);
    			append_dev(span5, i2);
    			append_dev(figcaption2, t34);
    			append_dev(figcaption2, div16);
    			append_dev(div16, div15);
    			append_dev(div15, p2);
    			append_dev(div15, t36);
    			append_dev(div15, a2);
    			append_dev(div24, t38);
    			append_dev(div24, div23);
    			append_dev(div23, figure3);
    			append_dev(figure3, img3);
    			append_dev(figure3, t39);
    			append_dev(figure3, div18);
    			append_dev(figure3, t40);
    			append_dev(figure3, div19);
    			append_dev(figure3, t41);
    			append_dev(figure3, figcaption3);
    			append_dev(figcaption3, div20);
    			append_dev(div20, span6);
    			append_dev(div20, t43);
    			append_dev(div20, h53);
    			append_dev(h53, t44);
    			append_dev(h53, br3);
    			append_dev(h53, t45);
    			append_dev(div20, t46);
    			append_dev(div20, span7);
    			append_dev(span7, i3);
    			append_dev(figcaption3, t47);
    			append_dev(figcaption3, div22);
    			append_dev(div22, div21);
    			append_dev(div21, p3);
    			append_dev(div21, t49);
    			append_dev(div21, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ability', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ability> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Ability extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ability",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/inc/home/process.svelte generated by Svelte v3.44.0 */

    const file$y = "src/inc/home/process.svelte";

    function create_fragment$y(ctx) {
    	let section;
    	let div26;
    	let div25;
    	let div22;
    	let div0;
    	let span0;
    	let t1;
    	let h4;
    	let t3;
    	let div21;
    	let div5;
    	let div4;
    	let div2;
    	let div1;
    	let t5;
    	let span1;
    	let t6;
    	let div3;
    	let span2;
    	let t8;
    	let p0;
    	let t10;
    	let div10;
    	let div9;
    	let div7;
    	let div6;
    	let t12;
    	let span3;
    	let t13;
    	let div8;
    	let span4;
    	let t15;
    	let p1;
    	let t17;
    	let div15;
    	let div14;
    	let div12;
    	let div11;
    	let t19;
    	let div13;
    	let span5;
    	let t21;
    	let p2;
    	let t23;
    	let div20;
    	let div19;
    	let div17;
    	let div16;
    	let t25;
    	let div18;
    	let span6;
    	let t27;
    	let p3;
    	let t29;
    	let div24;
    	let div23;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div26 = element("div");
    			div25 = element("div");
    			div22 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "رویه کار";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "چگونه انجام میدهیم";
    			t3 = space();
    			div21 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "1";
    			t5 = space();
    			span1 = element("span");
    			t6 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "کار";
    			t8 = space();
    			p0 = element("p");
    			p0.textContent = "فلان بیسار ... .شسیسی شس.ی شسی شسی";
    			t10 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "2";
    			t12 = space();
    			span3 = element("span");
    			t13 = space();
    			div8 = element("div");
    			span4 = element("span");
    			span4.textContent = "کار";
    			t15 = space();
    			p1 = element("p");
    			p1.textContent = "فلان بیسار ... .شسیسی شس.ی شسی شسی";
    			t17 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "3";
    			t19 = space();
    			div13 = element("div");
    			span5 = element("span");
    			span5.textContent = "کار";
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "فلان بیسار ... .شسیسی شس.ی شسی شسی";
    			t23 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "4";
    			t25 = space();
    			div18 = element("div");
    			span6 = element("span");
    			span6.textContent = "کار";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "فلان بیسار ... .شسیسی شس.ی شسی شسی";
    			t29 = space();
    			div24 = element("div");
    			div23 = element("div");
    			img = element("img");
    			attr_dev(span0, "class", "alt-font font-weight-600 text-gradient-fast-blue-purple text-uppercase d-inline-block margin-15px-bottom");
    			add_location(span0, file$y, 5, 20, 329);
    			attr_dev(h4, "class", "alt-font font-weight-600 text-extra-dark-gray d-block letter-spacing-minus-1px");
    			add_location(h4, file$y, 6, 20, 484);
    			attr_dev(div0, "class", "col-12 p-0 margin-5-rem-bottom wow animate__fadeIn");
    			add_location(div0, file$y, 4, 16, 244);
    			attr_dev(div1, "class", "process-step-icon text-center border-all border-color-fast-blue border-width-2px bg-fast-blue alt-font font-weight-500");
    			add_location(div1, file$y, 13, 32, 978);
    			attr_dev(span1, "class", "process-step-item-box-bfr bg-medium-gray");
    			add_location(span1, file$y, 14, 32, 1150);
    			attr_dev(div2, "class", "process-step-icon-wrap");
    			add_location(div2, file$y, 12, 28, 909);
    			attr_dev(span2, "class", "alt-font d-block font-weight-500 text-extra-dark-gray margin-5px-bottom");
    			add_location(span2, file$y, 17, 32, 1363);
    			attr_dev(p0, "class", "w-60 md-w-80 xs-w-100");
    			add_location(p0, file$y, 18, 32, 1493);
    			attr_dev(div3, "class", "process-content last-paragraph-no-margin");
    			add_location(div3, file$y, 16, 28, 1276);
    			attr_dev(div4, "class", "process-step-item");
    			add_location(div4, file$y, 11, 24, 849);
    			attr_dev(div5, "class", "col-12 p-0 process-step-style-02 wow animate__fadeIn");
    			attr_dev(div5, "data-wow-delay", "0.1s");
    			add_location(div5, file$y, 10, 20, 736);
    			attr_dev(div6, "class", "process-step-icon text-center border-all border-color-fast-blue border-width-2px bg-fast-blue alt-font font-weight-500");
    			add_location(div6, file$y, 27, 32, 2015);
    			attr_dev(span3, "class", "process-step-item-box-bfr bg-medium-gray");
    			add_location(span3, file$y, 28, 32, 2187);
    			attr_dev(div7, "class", "process-step-icon-wrap");
    			add_location(div7, file$y, 26, 28, 1946);
    			attr_dev(span4, "class", "alt-font d-block font-weight-500 text-extra-dark-gray margin-5px-bottom");
    			add_location(span4, file$y, 31, 32, 2400);
    			attr_dev(p1, "class", "w-60 md-w-80 xs-w-100");
    			add_location(p1, file$y, 32, 32, 2530);
    			attr_dev(div8, "class", "process-content last-paragraph-no-margin");
    			add_location(div8, file$y, 30, 28, 2313);
    			attr_dev(div9, "class", "process-step-item");
    			add_location(div9, file$y, 25, 24, 1886);
    			attr_dev(div10, "class", "col-12 p-0 process-step-style-02 wow animate__fadeIn");
    			attr_dev(div10, "data-wow-delay", "0.2s");
    			add_location(div10, file$y, 24, 20, 1773);
    			attr_dev(div11, "class", "process-step-icon text-center border-all border-color-fast-blue border-width-2px bg-fast-blue alt-font font-weight-500");
    			add_location(div11, file$y, 41, 32, 3051);
    			attr_dev(div12, "class", "process-step-icon-wrap");
    			add_location(div12, file$y, 40, 28, 2982);
    			attr_dev(span5, "class", "alt-font d-block font-weight-500 text-extra-dark-gray margin-5px-bottom");
    			add_location(span5, file$y, 44, 32, 3341);
    			attr_dev(p2, "class", "w-60 md-w-80 xs-w-100");
    			add_location(p2, file$y, 45, 32, 3471);
    			attr_dev(div13, "class", "process-content last-paragraph-no-margin");
    			add_location(div13, file$y, 43, 28, 3254);
    			attr_dev(div14, "class", "process-step-item");
    			add_location(div14, file$y, 39, 24, 2922);
    			attr_dev(div15, "class", "col-12 p-0 process-step-style-02 wow animate__fadeIn");
    			attr_dev(div15, "data-wow-delay", "0.3s");
    			add_location(div15, file$y, 38, 20, 2809);
    			attr_dev(div16, "class", "process-step-icon text-center border-all border-color-fast-blue border-width-2px bg-fast-blue alt-font font-weight-500");
    			add_location(div16, file$y, 53, 32, 3944);
    			attr_dev(div17, "class", "process-step-icon-wrap");
    			add_location(div17, file$y, 52, 28, 3875);
    			attr_dev(span6, "class", "alt-font d-block font-weight-500 text-extra-dark-gray margin-5px-bottom");
    			add_location(span6, file$y, 56, 32, 4234);
    			attr_dev(p3, "class", "w-60 md-w-80 xs-w-100");
    			add_location(p3, file$y, 57, 32, 4364);
    			attr_dev(div18, "class", "process-content last-paragraph-no-margin");
    			add_location(div18, file$y, 55, 28, 4147);
    			attr_dev(div19, "class", "process-step-item");
    			add_location(div19, file$y, 51, 24, 3815);
    			attr_dev(div20, "class", "col-12 p-0 process-step-style-02 wow animate__fadeIn");
    			attr_dev(div20, "data-wow-delay", "0.3s");
    			add_location(div20, file$y, 50, 20, 3702);
    			attr_dev(div21, "class", "col-12 p-0");
    			add_location(div21, file$y, 8, 16, 638);
    			attr_dev(div22, "class", "col-12 col-xl-5 col-lg-6 col-md-9 md-margin-3-rem-bottom");
    			add_location(div22, file$y, 3, 12, 157);
    			if (!src_url_equal(img.src, img_src_value = "images/home-web-agency-img-05.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "overflow-hidden");
    			attr_dev(img, "alt", "");
    			add_location(img, file$y, 65, 20, 4758);
    			attr_dev(div23, "class", "outside-box-right position-relative");
    			add_location(div23, file$y, 64, 16, 4688);
    			attr_dev(div24, "class", "col-12 col-lg-6 offset-xl-1 wow animate__fadeInRight");
    			attr_dev(div24, "data-wow-delay", "0.5s");
    			add_location(div24, file$y, 63, 12, 4583);
    			attr_dev(div25, "class", "row align-items-center justify-content-center");
    			add_location(div25, file$y, 2, 8, 85);
    			attr_dev(div26, "class", "container");
    			add_location(div26, file$y, 1, 4, 53);
    			attr_dev(section, "class", "web-agency wow animate__fadeIn");
    			add_location(section, file$y, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div22);
    			append_dev(div22, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(div22, t3);
    			append_dev(div22, div21);
    			append_dev(div21, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t5);
    			append_dev(div2, span1);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, span2);
    			append_dev(div3, t8);
    			append_dev(div3, p0);
    			append_dev(div21, t10);
    			append_dev(div21, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t12);
    			append_dev(div7, span3);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, span4);
    			append_dev(div8, t15);
    			append_dev(div8, p1);
    			append_dev(div21, t17);
    			append_dev(div21, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div12, div11);
    			append_dev(div14, t19);
    			append_dev(div14, div13);
    			append_dev(div13, span5);
    			append_dev(div13, t21);
    			append_dev(div13, p2);
    			append_dev(div21, t23);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div17);
    			append_dev(div17, div16);
    			append_dev(div19, t25);
    			append_dev(div19, div18);
    			append_dev(div18, span6);
    			append_dev(div18, t27);
    			append_dev(div18, p3);
    			append_dev(div25, t29);
    			append_dev(div25, div24);
    			append_dev(div24, div23);
    			append_dev(div23, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Process', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Process> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Process extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Process",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    let samples = [
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
        {
            name: "کار۱",
            type: "نوع",
            img: "images/portfolio-106.jpg",
            link: "https://instagram.com"
        },
    ];

    /* src/inc/home/samples.svelte generated by Svelte v3.44.0 */
    const file$x = "src/inc/home/samples.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (17:24) {#each _samples as sample}
    function create_each_block$a(ctx) {
    	let div6;
    	let a;
    	let div5;
    	let div4;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let t1_value = /*sample*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*sample*/ ctx[1].type + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			a = element("a");
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*sample*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*sample*/ ctx[1].name);
    			add_location(img, file$x, 21, 44, 1186);
    			attr_dev(div0, "class", "alt-font text-extra-dark-gray font-weight-500 d-block");
    			add_location(div0, file$x, 24, 52, 1478);
    			attr_dev(div1, "class", "text-uppercase text-medium-gray text-small alt-font d-block");
    			add_location(div1, file$x, 25, 52, 1617);
    			attr_dev(div2, "class", "scale");
    			add_location(div2, file$x, 23, 48, 1406);
    			attr_dev(div3, "class", "portfolio-hover bg-white justify-content-center d-flex flex-column");
    			add_location(div3, file$x, 22, 44, 1277);
    			attr_dev(div4, "class", "portfolio-image bg-gradient-sky-blue-pink");
    			add_location(div4, file$x, 20, 40, 1086);
    			attr_dev(div5, "class", "portfolio-box");
    			add_location(div5, file$x, 19, 36, 1018);
    			attr_dev(a, "href", /*sample*/ ctx[1].link);
    			add_location(a, file$x, 18, 32, 957);
    			attr_dev(div6, "class", "col text-center margin-30px-bottom sm-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div6, "data-wow-delay", "0.2s");
    			add_location(div6, file$x, 17, 28, 812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, a);
    			append_dev(a, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div6, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(17:24) {#each _samples as sample}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let h4;
    	let t1;
    	let p;
    	let t3;
    	let div4;
    	let div3;
    	let each_value = /*_samples*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "پروژه های اخیر";
    			t1 = space();
    			p = element("p");
    			p.textContent = "در اینجا اینجا";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h4, "class", "alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-1px margin-20px-bottom sm-margin-10px-bottom");
    			add_location(h4, file$x, 9, 16, 400);
    			add_location(p, file$x, 10, 16, 560);
    			attr_dev(div0, "class", "col-12 col-xl-4 col-lg-5 col-md-7 col-sm-9 text-center last-paragraph-no-margin margin-5-rem-bottom md-margin-3-rem-bottom wow animate__fadeIn");
    			add_location(div0, file$x, 8, 12, 227);
    			attr_dev(div1, "class", "row justify-content-center");
    			add_location(div1, file$x, 7, 8, 174);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$x, 6, 4, 142);
    			attr_dev(div3, "class", "row justify-content-center row-cols-2 ");
    			add_location(div3, file$x, 15, 20, 680);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$x, 14, 8, 636);
    			attr_dev(section, "class", "bg-light-blue");
    			add_location(section, file$x, 5, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(section, t3);
    			append_dev(section, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_samples*/ 1) {
    				each_value = /*_samples*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Samples', slots, []);
    	let _samples = samples.slice(0, 4);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Samples> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ samples, _samples });

    	$$self.$inject_state = $$props => {
    		if ('_samples' in $$props) $$invalidate(0, _samples = $$props._samples);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_samples];
    }

    class Samples extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Samples",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    let teams = [
        {
            name: "مهدی مهدی نژاد",
            role: "Founder",
            img: "images/our-team-member-01.jpg",
            about: "The beast ever never like even",
            social: [{name: "instagram", logo: "fab fa-instagram", link: "https://aerbir.ir"},]
        },
        {
            name: "مهدی مهدی نژاد",
            role: "Founder",
            img: "images/our-team-member-01.jpg",
            about: "The beast ever never like even",
            social: [{name: "instagram", logo: "fab fa-instagram", link: "https://aerbir.ir"},]
        },
        {
            name: "مهدی مهدی نژاد",
            role: "Founder",
            img: "images/our-team-member-01.jpg",
            about: "The beast ever never like even",
            social: [{name: "instagram", logo: "fab fa-instagram", link: "https://aerbir.ir"},]
        },
        {
            name: "مهدی مهدی نژاد",
            role: "Founder",
            img: "images/our-team-member-01.jpg",
            about: "The beast ever never like even",
            social: [{name: "instagram", logo: "fab fa-instagram", link: "https://aerbir.ir"},]
        },
        {
            name: "مهدی مهدی نژاد",
            role: "Founder",
            img: "images/our-team-member-01.jpg",
            about: "The beast ever never like even",
            social: [{name: "instagram", logo: "fab fa-instagram", link: "https://aerbir.ir"},]
        }
    ];

    /* src/inc/home/team.svelte generated by Svelte v3.44.0 */
    const file$w = "src/inc/home/team.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (25:28) {#each team.social as social}
    function create_each_block_1$2(ctx) {
    	let a;
    	let i;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", /*social*/ ctx[4].logo);
    			add_location(i, file$w, 25, 153, 1546);
    			set_style(a, "cursor", "pointer");
    			attr_dev(a, "title", /*social*/ ctx[4].name);
    			attr_dev(a, "href", /*social*/ ctx[4].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "icon-very-small text-white");
    			add_location(a, file$w, 25, 32, 1425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(25:28) {#each team.social as social}",
    		ctx
    	});

    	return block;
    }

    // (16:12) {#each _teams as team}
    function create_each_block$9(ctx) {
    	let div3;
    	let figure;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let figcaption;
    	let div2;
    	let t2;
    	let span0;
    	let t3_value = /*team*/ ctx[1].name + "";
    	let t3;
    	let t4;
    	let span1;
    	let t5_value = /*team*/ ctx[1].role + "";
    	let t5;
    	let t6;
    	let each_value_1 = /*team*/ ctx[1].social;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			figure = element("figure");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			figcaption = element("figcaption");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			span0 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span1 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(img, "alt", "");
    			if (!src_url_equal(img.src, img_src_value = /*team*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$w, 19, 24, 993);
    			attr_dev(div0, "class", "team-overlay bg-transparent-gradient-fast-blue-purple border-radius-5px");
    			add_location(div0, file$w, 20, 24, 1047);
    			attr_dev(div1, "class", "team-member-image");
    			add_location(div1, file$w, 18, 20, 937);
    			attr_dev(div2, "class", "social-icon mt-auto");
    			add_location(div2, file$w, 23, 24, 1301);
    			attr_dev(span0, "class", "team-title d-block alt-font text-white font-weight-500 mt-auto");
    			add_location(span0, file$w, 28, 24, 1692);
    			attr_dev(span1, "class", "team-sub-title text-small d-block text-white-transparent text-uppercase");
    			add_location(span1, file$w, 29, 24, 1812);
    			attr_dev(figcaption, "class", "align-items-center d-flex flex-column padding-20px-lr padding-30px-tb");
    			add_location(figcaption, file$w, 22, 20, 1186);
    			attr_dev(figure, "class", "border-radius-5px");
    			add_location(figure, file$w, 17, 16, 882);
    			attr_dev(div3, "class", "col team-style-01 text-start md-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.2s");
    			add_location(div3, file$w, 16, 16, 737);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, figure);
    			append_dev(figure, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(figure, t1);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(figcaption, t2);
    			append_dev(figcaption, span0);
    			append_dev(span0, t3);
    			append_dev(figcaption, t4);
    			append_dev(figcaption, span1);
    			append_dev(span1, t5);
    			append_dev(div3, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_teams*/ 1) {
    				each_value_1 = /*team*/ ctx[1].social;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(16:12) {#each _teams as team}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let section;
    	let div5;
    	let div1;
    	let div0;
    	let h4;
    	let t1;
    	let p;
    	let t3;
    	let div2;
    	let t4;
    	let div4;
    	let div3;
    	let span;
    	let t5;
    	let a;
    	let each_value = /*_teams*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "تیم ما";
    			t1 = space();
    			p = element("p");
    			p.textContent = "متنی بنگار.";
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			span = element("span");
    			t5 = text("دوست داشتی ؟\n                            ");
    			a = element("a");
    			a.textContent = "همه رو ببین.";
    			attr_dev(h4, "class", "alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-1px margin-20px-bottom sm-margin-10px-bottom");
    			add_location(h4, file$w, 8, 16, 391);
    			add_location(p, file$w, 9, 16, 543);
    			attr_dev(div0, "class", "col-12 col-xl-4 col-lg-5 col-md-7 col-sm-9 text-center last-paragraph-no-margin margin-6-rem-bottom md-margin-4-rem-bottom md-margin-5-rem-bottom wow animate__fadeIn");
    			add_location(div0, file$w, 7, 12, 195);
    			attr_dev(div1, "class", "row justify-content-center");
    			add_location(div1, file$w, 6, 8, 142);
    			attr_dev(div2, "class", "row row-cols-1 row-cols-lg-4 row-cols-sm-2 justify-content-center");
    			add_location(div2, file$w, 14, 8, 606);
    			attr_dev(a, "class", "font-weight-600 text-fast-blue text-decoration-line-bottom");
    			attr_dev(a, "href", "/team");
    			add_location(a, file$w, 42, 28, 2389);
    			attr_dev(span, "class", "alt-font font-weight-500 text-extra-medium text-extra-dark-gray letter-spacing-minus-1-half");
    			add_location(span, file$w, 40, 24, 2213);
    			attr_dev(div3, "class", "col-12 text-center margin-6-half-rem-top lg-margin-5-rem-top wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.7s");
    			add_location(div3, file$w, 39, 12, 2072);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$w, 38, 8, 2042);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$w, 5, 4, 110);
    			add_location(section, file$w, 4, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div5, t3);
    			append_dev(div5, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, span);
    			append_dev(span, t5);
    			append_dev(span, a);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_teams*/ 1) {
    				each_value = /*_teams*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	let _teams = teams.slice(0, 4);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ teams, _teams });

    	$$self.$inject_state = $$props => {
    		if ('_teams' in $$props) $$invalidate(0, _teams = $$props._teams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_teams];
    }

    class Team$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/inc/home/explain.svelte generated by Svelte v3.44.0 */

    const file$v = "src/inc/home/explain.svelte";

    function create_fragment$v(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let span;
    	let t2;
    	let h4;
    	let t4;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "یه کار";
    			t2 = space();
    			h4 = element("h4");
    			h4.textContent = "متنی بنگار";
    			t4 = space();
    			p = element("p");
    			p.textContent = "متنی بنگار.";
    			attr_dev(div0, "class", "col-12 col-lg-6 cover-background md-h-550px sm-h-400px xs-h-300px wow animate__fadeInLeft");
    			attr_dev(div0, "data-wow-delay", "0.2s");
    			set_style(div0, "background-image", "url('images/home-web-agency-bg-img-02.jpg')");
    			add_location(div0, file$v, 3, 12, 133);
    			attr_dev(span, "class", "alt-font font-weight-500 text-extra-medium text-uppercase letter-spacing-minus-1-half d-block margin-25px-bottom");
    			add_location(span, file$v, 5, 16, 579);
    			attr_dev(h4, "class", "alt-font font-weight-600 text-white letter-spacing-minus-1px w-65 margin-2-half-rem-bottom xl-w-100");
    			add_location(h4, file$v, 6, 16, 736);
    			attr_dev(p, "class", "w-60 xl-w-100");
    			add_location(p, file$v, 7, 16, 880);
    			attr_dev(div1, "class", "col-12 col-lg-6 padding-8-half-rem-tb padding-10-half-rem-lr xl-padding-7-half-rem-all lg-padding-4-half-rem-all md-padding-5-half-rem-all xs-padding-5-rem-lr wow animate__fadeIn");
    			attr_dev(div1, "data-wow-delay", "0.6s");
    			add_location(div1, file$v, 4, 12, 348);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$v, 2, 8, 103);
    			attr_dev(div3, "class", "container-fluid");
    			add_location(div3, file$v, 1, 4, 65);
    			attr_dev(section, "class", "p-0 bg-extra-dark-gray wow animate__fadeIn");
    			add_location(section, file$v, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			append_dev(div1, t2);
    			append_dev(div1, h4);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Explain', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Explain> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Explain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Explain",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src/inc/home/counter.svelte generated by Svelte v3.44.0 */

    const file$u = "src/inc/home/counter.svelte";

    function create_fragment$u(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let t0;
    	let section;
    	let div5;
    	let div4;
    	let div0;
    	let h30;
    	let t1;
    	let span1;
    	let span0;
    	let t3;
    	let t4;
    	let div1;
    	let h31;
    	let t5;
    	let span3;
    	let span2;
    	let t7;
    	let t8;
    	let div2;
    	let h32;
    	let t9;
    	let span5;
    	let span4;
    	let t11;
    	let t12;
    	let div3;
    	let h33;
    	let t13;
    	let span7;
    	let span6;
    	let t15;

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			t0 = space();
    			section = element("section");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t1 = space();
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "فلان";
    			t3 = text(" بیسار");
    			t4 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			t5 = space();
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "فلان";
    			t7 = text(" بیسار");
    			t8 = space();
    			div2 = element("div");
    			h32 = element("h3");
    			t9 = space();
    			span5 = element("span");
    			span4 = element("span");
    			span4.textContent = "فلان";
    			t11 = text(" بیسار");
    			t12 = space();
    			div3 = element("div");
    			h33 = element("h3");
    			t13 = space();
    			span7 = element("span");
    			span6 = element("span");
    			span6.textContent = "فلان";
    			t15 = text(" بیسار");
    			if (!src_url_equal(script0.src, script0_src_value = "../../js/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$u, 3, 4, 20);
    			if (!src_url_equal(script1.src, script1_src_value = "../../js/theme-vendors.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$u, 4, 4, 72);
    			if (!src_url_equal(script2.src, script2_src_value = "../../js/main.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$u, 5, 4, 131);
    			attr_dev(h30, "class", "vertical-counter d-inline-flex text-extra-dark-gray alt-font appear font-weight-600 letter-spacing-minus-2px mb-0");
    			attr_dev(h30, "data-to", "2500");
    			add_location(h30, file$u, 11, 16, 455);
    			attr_dev(span0, "class", "font-weight-600");
    			add_location(span0, file$u, 12, 89, 691);
    			attr_dev(span1, "class", "alt-font text-uppercase text-medium d-block margin-5px-top");
    			add_location(span1, file$u, 12, 16, 618);
    			attr_dev(div0, "class", "col text-center sm-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div0, "data-wow-delay", "0.2s");
    			add_location(div0, file$u, 10, 12, 345);
    			attr_dev(h31, "class", "vertical-counter d-inline-flex text-extra-dark-gray alt-font appear font-weight-600 letter-spacing-minus-2px mb-0");
    			attr_dev(h31, "data-to", "2500");
    			add_location(h31, file$u, 15, 16, 887);
    			attr_dev(span2, "class", "font-weight-600");
    			add_location(span2, file$u, 16, 89, 1123);
    			attr_dev(span3, "class", "alt-font text-uppercase text-medium d-block margin-5px-top");
    			add_location(span3, file$u, 16, 16, 1050);
    			attr_dev(div1, "class", "col text-center sm-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div1, "data-wow-delay", "0.2s");
    			add_location(div1, file$u, 14, 12, 777);
    			attr_dev(h32, "class", "vertical-counter d-inline-flex text-extra-dark-gray alt-font appear font-weight-600 letter-spacing-minus-2px mb-0");
    			attr_dev(h32, "data-to", "2500");
    			add_location(h32, file$u, 19, 16, 1319);
    			attr_dev(span4, "class", "font-weight-600");
    			add_location(span4, file$u, 20, 89, 1555);
    			attr_dev(span5, "class", "alt-font text-uppercase text-medium d-block margin-5px-top");
    			add_location(span5, file$u, 20, 16, 1482);
    			attr_dev(div2, "class", "col text-center sm-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div2, "data-wow-delay", "0.2s");
    			add_location(div2, file$u, 18, 12, 1209);
    			attr_dev(h33, "class", "vertical-counter d-inline-flex text-extra-dark-gray alt-font appear font-weight-600 letter-spacing-minus-2px mb-0");
    			attr_dev(h33, "data-to", "2500");
    			add_location(h33, file$u, 23, 16, 1751);
    			attr_dev(span6, "class", "font-weight-600");
    			add_location(span6, file$u, 24, 89, 1987);
    			attr_dev(span7, "class", "alt-font text-uppercase text-medium d-block margin-5px-top");
    			add_location(span7, file$u, 24, 16, 1914);
    			attr_dev(div3, "class", "col text-center sm-margin-40px-bottom wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.2s");
    			add_location(div3, file$u, 22, 12, 1641);
    			attr_dev(div4, "class", "row row-cols-1 row-cols-md-4 row-cols-sm-2 align-items-center justify-content-center");
    			add_location(div4, file$u, 9, 8, 234);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$u, 8, 4, 202);
    			add_location(section, file$u, 7, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t5);
    			append_dev(div1, span3);
    			append_dev(span3, span2);
    			append_dev(span3, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div2);
    			append_dev(div2, h32);
    			append_dev(div2, t9);
    			append_dev(div2, span5);
    			append_dev(span5, span4);
    			append_dev(span5, t11);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, h33);
    			append_dev(div3, t13);
    			append_dev(div3, span7);
    			append_dev(span7, span6);
    			append_dev(span7, t15);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Counter', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Counter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Counter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Counter",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/inc/footer.svelte generated by Svelte v3.44.0 */

    const file$t = "src/inc/footer.svelte";

    function create_fragment$t(ctx) {
    	let footer;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let i0;
    	let span0;
    	let t0;
    	let li1;
    	let a1;
    	let i1;
    	let span1;
    	let t1;
    	let li2;
    	let a2;
    	let i2;
    	let span2;
    	let t2;
    	let li3;
    	let a3;
    	let i3;
    	let span3;
    	let t3;
    	let li4;
    	let a4;
    	let i4;
    	let span4;
    	let t4;
    	let h40;
    	let t6;
    	let h41;
    	let a5;
    	let t8;
    	let p;
    	let t9;
    	let br;
    	let t10;
    	let a6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			i0 = element("i");
    			span0 = element("span");
    			t0 = space();
    			li1 = element("li");
    			a1 = element("a");
    			i1 = element("i");
    			span1 = element("span");
    			t1 = space();
    			li2 = element("li");
    			a2 = element("a");
    			i2 = element("i");
    			span2 = element("span");
    			t2 = space();
    			li3 = element("li");
    			a3 = element("a");
    			i3 = element("i");
    			span3 = element("span");
    			t3 = space();
    			li4 = element("li");
    			a4 = element("a");
    			i4 = element("i");
    			span4 = element("span");
    			t4 = space();
    			h40 = element("h4");
    			h40.textContent = "برای برقراری ارتباط ایمیل دهید";
    			t6 = space();
    			h41 = element("h4");
    			a5 = element("a");
    			a5.textContent = "info@theroundtable.ir";
    			t8 = space();
    			p = element("p");
    			t9 = text("© 2021 Alright saved for Round Table ");
    			br = element("br");
    			t10 = text(" Powered by ");
    			a6 = element("a");
    			a6.textContent = "Sporzin";
    			attr_dev(i0, "class", "fab fa-facebook-f");
    			add_location(i0, file$t, 6, 108, 459);
    			add_location(span0, file$t, 6, 141, 492);
    			attr_dev(a0, "class", "facebook text-white");
    			attr_dev(a0, "href", "https://www.facebook.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$t, 6, 28, 379);
    			add_location(li0, file$t, 6, 24, 375);
    			attr_dev(i1, "class", "fab fa-dribbble");
    			add_location(i1, file$t, 7, 107, 622);
    			add_location(span1, file$t, 7, 138, 653);
    			attr_dev(a1, "class", "dribbble text-white");
    			attr_dev(a1, "href", "http://www.dribbble.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$t, 7, 28, 543);
    			add_location(li1, file$t, 7, 24, 539);
    			attr_dev(i2, "class", "fab fa-linkedin-in");
    			add_location(i2, file$t, 8, 107, 783);
    			add_location(span2, file$t, 8, 141, 817);
    			attr_dev(a2, "class", "linkedin text-white");
    			attr_dev(a2, "href", "http://www.linkedin.com/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$t, 8, 28, 704);
    			add_location(li2, file$t, 8, 24, 700);
    			attr_dev(i3, "class", "fab fa-instagram");
    			add_location(i3, file$t, 9, 109, 949);
    			add_location(span3, file$t, 9, 141, 981);
    			attr_dev(a3, "class", "instagram text-white");
    			attr_dev(a3, "href", "http://www.instagram.com/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$t, 9, 28, 868);
    			add_location(li3, file$t, 9, 24, 864);
    			attr_dev(i4, "class", "fab fa-behance");
    			add_location(i4, file$t, 10, 105, 1109);
    			add_location(span4, file$t, 10, 135, 1139);
    			attr_dev(a4, "class", "behance text-white");
    			attr_dev(a4, "href", "http://www.behance.com/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$t, 10, 28, 1032);
    			add_location(li4, file$t, 10, 24, 1028);
    			attr_dev(ul, "class", "large-icon");
    			add_location(ul, file$t, 5, 20, 327);
    			attr_dev(div0, "class", "social-icon-style-10 margin-3-half-rem-bottom");
    			add_location(div0, file$t, 4, 16, 247);
    			attr_dev(h40, "class", "alt-font text-slate-blue-light font-weight-300 margin-10px-bottom d-block letter-spacing-minus-2px");
    			add_location(h40, file$t, 13, 16, 1227);
    			attr_dev(a5, "href", "mailto:info@domain.com");
    			attr_dev(a5, "class", "text-gradient-sky-blue-dark-pink");
    			add_location(a5, file$t, 14, 73, 1447);
    			attr_dev(h41, "class", "alt-font font-weight-600 margin-7-rem-bottom");
    			add_location(h41, file$t, 14, 16, 1390);
    			add_location(br, file$t, 15, 130, 1682);
    			attr_dev(a6, "href", "https://sporzin.ir");
    			add_location(a6, file$t, 15, 146, 1698);
    			attr_dev(p, "class", "alt-font text-small text-slate-blue-light text-uppercase m-0");
    			add_location(p, file$t, 15, 16, 1568);
    			attr_dev(div1, "class", "col-12 col-lg-8 text-center");
    			add_location(div1, file$t, 3, 12, 189);
    			attr_dev(div2, "class", "row justify-content-center");
    			add_location(div2, file$t, 2, 8, 136);
    			attr_dev(div3, "class", "container padding-40px-tb border-bottom border-color-white-transparent");
    			add_location(div3, file$t, 1, 4, 43);
    			attr_dev(footer, "class", "footer-dark bg-black ");
    			add_location(footer, file$t, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, i0);
    			append_dev(a0, span0);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, i1);
    			append_dev(a1, span1);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, i2);
    			append_dev(a2, span2);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, i3);
    			append_dev(a3, span3);
    			append_dev(ul, t3);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, i4);
    			append_dev(a4, span4);
    			append_dev(div1, t4);
    			append_dev(div1, h40);
    			append_dev(div1, t6);
    			append_dev(div1, h41);
    			append_dev(h41, a5);
    			append_dev(div1, t8);
    			append_dev(div1, p);
    			append_dev(p, t9);
    			append_dev(p, br);
    			append_dev(p, t10);
    			append_dev(p, a6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/comps/home.svelte generated by Svelte v3.44.0 */
    const file$s = "src/comps/home.svelte";

    function create_fragment$s(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let t0;
    	let main;
    	let navbar;
    	let t1;
    	let hero;
    	let t2;
    	let partners;
    	let t3;
    	let about;
    	let t4;
    	let ability;
    	let t5;
    	let process;
    	let t6;
    	let samples;
    	let t7;
    	let team;
    	let t8;
    	let explain;
    	let t9;
    	let counter;
    	let t10;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	hero = new Hero({ $$inline: true });
    	partners = new Partners({ $$inline: true });
    	about = new About$2({ $$inline: true });
    	ability = new Ability({ $$inline: true });
    	process = new Process({ $$inline: true });
    	samples = new Samples({ $$inline: true });
    	team = new Team$1({ $$inline: true });
    	explain = new Explain({ $$inline: true });
    	counter = new Counter({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			t0 = space();
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			create_component(hero.$$.fragment);
    			t2 = space();
    			create_component(partners.$$.fragment);
    			t3 = space();
    			create_component(about.$$.fragment);
    			t4 = space();
    			create_component(ability.$$.fragment);
    			t5 = space();
    			create_component(process.$$.fragment);
    			t6 = space();
    			create_component(samples.$$.fragment);
    			t7 = space();
    			create_component(team.$$.fragment);
    			t8 = space();
    			create_component(explain.$$.fragment);
    			t9 = space();
    			create_component(counter.$$.fragment);
    			t10 = space();
    			create_component(footer.$$.fragment);
    			if (!src_url_equal(script0.src, script0_src_value = "../../js/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$s, 14, 4, 592);
    			if (!src_url_equal(script1.src, script1_src_value = "../../js/theme-vendors.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$s, 15, 4, 644);
    			if (!src_url_equal(script2.src, script2_src_value = "../../js/main.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$s, 16, 4, 703);
    			add_location(main, file$s, 18, 0, 760);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t1);
    			mount_component(hero, main, null);
    			append_dev(main, t2);
    			mount_component(partners, main, null);
    			append_dev(main, t3);
    			mount_component(about, main, null);
    			append_dev(main, t4);
    			mount_component(ability, main, null);
    			append_dev(main, t5);
    			mount_component(process, main, null);
    			append_dev(main, t6);
    			mount_component(samples, main, null);
    			append_dev(main, t7);
    			mount_component(team, main, null);
    			append_dev(main, t8);
    			mount_component(explain, main, null);
    			append_dev(main, t9);
    			mount_component(counter, main, null);
    			append_dev(main, t10);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(partners.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(ability.$$.fragment, local);
    			transition_in(process.$$.fragment, local);
    			transition_in(samples.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(explain.$$.fragment, local);
    			transition_in(counter.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(partners.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(ability.$$.fragment, local);
    			transition_out(process.$$.fragment, local);
    			transition_out(samples.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(explain.$$.fragment, local);
    			transition_out(counter.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(hero);
    			destroy_component(partners);
    			destroy_component(about);
    			destroy_component(ability);
    			destroy_component(process);
    			destroy_component(samples);
    			destroy_component(team);
    			destroy_component(explain);
    			destroy_component(counter);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Hero,
    		Partners,
    		About: About$2,
    		Ability,
    		Process,
    		Samples,
    		Team: Team$1,
    		Explain,
    		Counter,
    		Footer
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/inc/about/title.svelte generated by Svelte v3.44.0 */

    const file$r = "src/inc/about/title.svelte";

    function create_fragment$r(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let h1;
    	let t2;
    	let h2;
    	let t4;
    	let div2;
    	let a;
    	let i;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*about_us*/ ctx[0]}`;
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = `${/*who_we_are*/ ctx[1]}`;
    			t4 = space();
    			div2 = element("div");
    			a = element("a");
    			i = element("i");
    			attr_dev(div0, "class", "opacity-extra-medium bg-extra-dark-gray");
    			add_location(div0, file$r, 7, 4, 221);
    			attr_dev(h1, "class", "alt-font text-white opacity-6 margin-20px-bottom");
    			add_location(h1, file$r, 11, 16, 554);
    			attr_dev(h2, "class", "text-white alt-font font-weight-500 w-55 md-w-65 sm-w-80 center-col xs-w-100 letter-spacing-minus-1px line-height-50 sm-line-height-45 xs-line-height-30 no-margin-bottom");
    			add_location(h2, file$r, 12, 16, 647);
    			attr_dev(div1, "class", "col-12 position-relative page-title-extra-small text-center d-flex align-items-center justify-content-center flex-column");
    			add_location(div1, file$r, 10, 12, 403);
    			attr_dev(i, "class", "ti-arrow-down icon-extra-small text-white bg-transparent-black padding-15px-all xs-padding-10px-all border-radius-100");
    			add_location(i, file$r, 14, 88, 954);
    			attr_dev(a, "href", "#about");
    			attr_dev(a, "class", "section-link");
    			add_location(a, file$r, 14, 50, 916);
    			attr_dev(div2, "class", "down-section text-center");
    			add_location(div2, file$r, 14, 12, 878);
    			attr_dev(div3, "class", "row align-items-stretch justify-content-center small-screen");
    			add_location(div3, file$r, 9, 8, 317);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$r, 8, 4, 285);
    			attr_dev(section, "class", "parallax");
    			attr_dev(section, "data-parallax-background-ratio", "0.5");
    			set_style(section, "background-image", "url('images/about-us-bg.jpg')");
    			add_location(section, file$r, 6, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(section, t0);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, i);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let about_us = "درباره میز گرد";
    	let who_we_are = "ما میز گرد هستیم";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ about_us, who_we_are });

    	$$self.$inject_state = $$props => {
    		if ('about_us' in $$props) $$invalidate(0, about_us = $$props.about_us);
    		if ('who_we_are' in $$props) $$invalidate(1, who_we_are = $$props.who_we_are);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [about_us, who_we_are];
    }

    class Title$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/inc/about/about.svelte generated by Svelte v3.44.0 */

    const file$q = "src/inc/about/about.svelte";

    function create_fragment$q(ctx) {
    	let section;
    	let div7;
    	let div6;
    	let div1;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let span0;
    	let t2;
    	let p0;
    	let t4;
    	let a;
    	let t5_value = /*about_us*/ ctx[0].link.txt + "";
    	let t5;
    	let t6;
    	let div5;
    	let img;
    	let img_src_value;
    	let t7;
    	let div4;
    	let span1;
    	let t9;
    	let p1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = `${/*about_us*/ ctx[0].title}`;
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = `${/*about_us*/ ctx[0].desc}`;
    			t4 = space();
    			a = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			img = element("img");
    			t7 = space();
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = `${/*about_work*/ ctx[1].title}`;
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = `${/*about_work*/ ctx[1].desc}`;
    			attr_dev(div0, "class", "w-100 md-h-700px sm-h-550px xs-h-450px cover-background");
    			set_style(div0, "background-image", "url('" + /*about_us*/ ctx[0].img + "')");
    			add_location(div0, file$q, 19, 16, 732);
    			attr_dev(div1, "class", "col-12 col-lg-4 pe-lg-0 d-flex md-margin-30px-bottom");
    			add_location(div1, file$q, 18, 12, 649);
    			attr_dev(span0, "class", "text-extra-large alt-font font-weight-500 text-white margin-20px-bottom d-block");
    			add_location(span0, file$q, 23, 20, 1137);
    			attr_dev(p0, "class", "text-white opacity-7");
    			add_location(p0, file$q, 24, 20, 1275);
    			attr_dev(a, "href", /*about_us*/ ctx[0].link.url);
    			attr_dev(a, "class", "btn btn-large btn-link text-white text-white-hover align-self-start");
    			add_location(a, file$q, 25, 20, 1347);
    			attr_dev(div2, "class", "justify-content-center w-100 d-flex flex-column bg-fast-blue padding-5-half-rem-lr lg-padding-3-rem-lr md-padding-4-rem-all");
    			add_location(div2, file$q, 22, 16, 979);
    			attr_dev(div3, "class", "col-12 col-lg-4 col-md-6 ps-lg-0 d-flex sm-margin-30px-bottom");
    			add_location(div3, file$q, 21, 12, 887);
    			if (!src_url_equal(img.src, img_src_value = /*about_work*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$q, 29, 16, 1586);
    			attr_dev(span1, "class", "alt-font text-extra-dark-gray font-weight-500 margin-10px-bottom d-block");
    			add_location(span1, file$q, 31, 20, 1815);
    			add_location(p1, file$q, 32, 20, 1948);
    			attr_dev(div4, "class", "bg-white padding-3-half-rem-lr padding-3-rem-tb lg-padding-2-rem-all md-padding-2-half-rem-all sm-padding-4-rem-all last-paragraph-no-margin");
    			add_location(div4, file$q, 30, 16, 1640);
    			attr_dev(div5, "class", "col-12 col-lg-4 col-md-6");
    			add_location(div5, file$q, 28, 12, 1531);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$q, 17, 8, 619);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$q, 16, 4, 587);
    			attr_dev(section, "id", "about");
    			attr_dev(section, "class", "bg-light-gray");
    			add_location(section, file$q, 15, 0, 540);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div6, t0);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t2);
    			append_dev(div2, p0);
    			append_dev(div2, t4);
    			append_dev(div2, a);
    			append_dev(a, t5);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, img);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(div4, t9);
    			append_dev(div4, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);

    	let about_us = {
    		title: "ما یک سال است که در این حوزه فعالیت داریم داریم .",
    		desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
    		img: "images/about-us-img-07.jpg",
    		link: { url: "/service", txt: "خدمات ما" }
    	};

    	let about_work = {
    		title: "درباره کار ما",
    		desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
    		img: "images/about-us-img-07.jpg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ about_us, about_work });

    	$$self.$inject_state = $$props => {
    		if ('about_us' in $$props) $$invalidate(0, about_us = $$props.about_us);
    		if ('about_work' in $$props) $$invalidate(1, about_work = $$props.about_work);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [about_us, about_work];
    }

    class About$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/inc/about/clients.svelte generated by Svelte v3.44.0 */
    const file$p = "src/inc/about/clients.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (16:12) {#each _clients as client }
    function create_each_block$8(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "client-box-image");
    			if (!src_url_equal(img.src, img_src_value = /*client*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*client*/ ctx[2].name);
    			add_location(img, file$p, 18, 32, 996);
    			attr_dev(a, "href", "#");
    			add_location(a, file$p, 18, 20, 984);
    			attr_dev(div0, "class", "client-box padding-15px-all border border-color-dark-gray");
    			add_location(div0, file$p, 17, 16, 892);
    			attr_dev(div1, "class", "col text-center margin-30px-bottom sm-margin-15px-bottom wow animate__fadeIn");
    			add_location(div1, file$p, 16, 16, 784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(16:12) {#each _clients as client }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let h5;
    	let t1;
    	let div2;
    	let each_value = /*_clients*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(h5, "text-align", "center");
    			set_style(h5, "direction", "rtl");
    			attr_dev(h5, "class", "alt-font text-extra-dark-gray font-weight-500 mb-0");
    			add_location(h5, file$p, 10, 16, 428);
    			attr_dev(div0, "class", "col-12 col-xl-7 col-lg-8 col-md-7 col-sm-10 text-center text-md-start sm-margin-30px-bottom");
    			add_location(div0, file$p, 9, 12, 306);
    			attr_dev(div1, "class", "row align-items-center justify-content-center");
    			add_location(div1, file$p, 8, 8, 234);
    			attr_dev(div2, "class", "row row-cols-1 row-cols-md-4 row-cols-sm-2 client-logo-style-01 align-items-center margin-7-half-rem-top sm-margin-5-rem-top");
    			add_location(div2, file$p, 14, 8, 589);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$p, 7, 4, 202);
    			attr_dev(section, "class", "wow animate__fadeIn");
    			add_location(section, file$p, 6, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_clients*/ 2) {
    				each_value = /*_clients*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clients', slots, []);
    	let title = "۱ سال است که با اتخار افتخار میکنیم";
    	let _clients = clients.slice(0, 8);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clients> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, clients, _clients });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('_clients' in $$props) $$invalidate(1, _clients = $$props._clients);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, _clients];
    }

    class Clients extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clients",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    let features = [
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },
        {
            icon: "line-icon-Heart",
            title: "تایتل",
            desc: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ",
        },

    ];

    /* src/inc/about/features.svelte generated by Svelte v3.44.0 */
    const file$o = "src/inc/about/features.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (19:12) {#each _features as feature}
    function create_each_block$7(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let i;
    	let t0;
    	let div1;
    	let span;
    	let t1_value = /*feature*/ ctx[3].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*feature*/ ctx[3].desc + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			attr_dev(i, "class", "" + (/*feature*/ ctx[3].icon + " icon-medium text-fast-blue"));
    			add_location(i, file$o, 22, 24, 1085);
    			attr_dev(div0, "class", "feature-box-icon");
    			add_location(div0, file$o, 21, 20, 1030);
    			attr_dev(span, "class", "alt-font font-weight-500 margin-10px-bottom d-block text-extra-dark-gray");
    			add_location(span, file$o, 25, 24, 1273);
    			add_location(p, file$o, 26, 24, 1407);
    			attr_dev(div1, "class", "feature-box-content last-paragraph-no-margin");
    			add_location(div1, file$o, 24, 20, 1190);
    			attr_dev(div2, "class", "feature-box-overlay bg-gradient-fast-blue-purple");
    			add_location(div2, file$o, 28, 20, 1476);
    			attr_dev(div3, "class", "feature-box h-100 feature-box-left-icon border-radius-5px bg-white box-shadow-small feature-box-dark-hover overflow-hidden padding-4-rem-all");
    			add_location(div3, file$o, 20, 16, 855);
    			attr_dev(div4, "class", "col-12 col-lg-6 col-md-9 margin-30px-bottom xs-margin-15px-bottom");
    			add_location(div4, file$o, 19, 16, 759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, i);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, span);
    			append_dev(span, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div4, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(19:12) {#each _features as feature}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h5;
    	let t3;
    	let div2;
    	let each_value = /*_features*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = `${/*title2*/ ctx[1]}`;
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "text-extra-medium margin-15px-bottom alt-font d-block w-100");
    			add_location(span, file$o, 13, 16, 413);
    			attr_dev(h5, "class", "alt-font text-extra-dark-gray font-weight-500 margin-2-rem-bottom sm-w-100");
    			add_location(h5, file$o, 14, 16, 518);
    			attr_dev(div0, "class", "col-12 col-lg-6 col-sm-8 text-center margin-5-rem-bottom md-margin-3-rem-bottom");
    			add_location(div0, file$o, 12, 12, 303);
    			attr_dev(div1, "class", "row justify-content-center");
    			add_location(div1, file$o, 11, 8, 250);
    			attr_dev(div2, "class", "row justify-content-center");
    			add_location(div2, file$o, 17, 8, 661);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$o, 10, 4, 218);
    			attr_dev(section, "class", "bg-light-gray wow animate__fadeIn");
    			add_location(section, file$o, 9, 0, 162);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h5);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_features*/ 4) {
    				each_value = /*_features*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Features', slots, []);
    	let title = "تایتل";
    	let title2 = "تایتل2";
    	let _features = features.slice(0, 4);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Features> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, title2, features, _features });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('title2' in $$props) $$invalidate(1, title2 = $$props.title2);
    		if ('_features' in $$props) $$invalidate(2, _features = $$props._features);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, title2, _features];
    }

    class Features$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Features",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/comps/about.svelte generated by Svelte v3.44.0 */
    const file$n = "src/comps/about.svelte";

    function create_fragment$n(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let title;
    	let t1;
    	let about;
    	let t2;
    	let client;
    	let t3;
    	let features;
    	let t4;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	title = new Title$2({ $$inline: true });
    	about = new About$1({ $$inline: true });
    	client = new Clients({ $$inline: true });
    	features = new Features$1({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(title.$$.fragment);
    			t1 = space();
    			create_component(about.$$.fragment);
    			t2 = space();
    			create_component(client.$$.fragment);
    			t3 = space();
    			create_component(features.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$n, 11, 0, 323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(title, main, null);
    			append_dev(main, t1);
    			mount_component(about, main, null);
    			append_dev(main, t2);
    			mount_component(client, main, null);
    			append_dev(main, t3);
    			mount_component(features, main, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(client.$$.fragment, local);
    			transition_in(features.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(client.$$.fragment, local);
    			transition_out(features.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(title);
    			destroy_component(about);
    			destroy_component(client);
    			destroy_component(features);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Title: Title$2,
    		About: About$1,
    		Client: Clients,
    		Features: Features$1,
    		Footer
    	});

    	return [];
    }

    class About_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About_1",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/inc/team/header.svelte generated by Svelte v3.44.0 */

    const file$m = "src/inc/team/header.svelte";

    function create_fragment$m(ctx) {
    	let section;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let span0;
    	let t1;
    	let br;
    	let t2;
    	let span1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "تیمی که میترکونه زمانی که باشیم با";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "! همیدیگر";
    			attr_dev(span0, "class", "alt-font font-weight-500 text-white text-uppercase text-small letter-spacing-1px bg-extra-dark-gray d-inline-block padding-20px-lr padding-5px-tb");
    			add_location(span0, file$m, 5, 60, 327);
    			attr_dev(div0, "class", "margin-20px-bottom d-block");
    			add_location(div0, file$m, 5, 20, 287);
    			add_location(br, file$m, 6, 20, 555);
    			attr_dev(span1, "class", "text-extra-big alt-font text-uppercase text-extra-dark-gray font-weight-700 letter-spacing-minus-5px image-mask cover-background xs-letter-spacing-minus-1px");
    			set_style(span1, "background-image", "url('images/fancy-text-img-01.jpg')");
    			add_location(span1, file$m, 7, 20, 580);
    			attr_dev(div1, "class", "tilt-box");
    			add_location(div1, file$m, 4, 16, 244);
    			attr_dev(div2, "class", "col-md-12 text-center margin-7-rem-bottom z-index-0");
    			add_location(div2, file$m, 3, 12, 162);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$m, 2, 8, 132);
    			attr_dev(div4, "class", "container-fluid");
    			add_location(div4, file$m, 1, 4, 94);
    			attr_dev(section, "class", "fix-background");
    			set_style(section, "background-image", "url('images/our-team-bg2.jpg')");
    			add_location(section, file$m, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div1, t1);
    			append_dev(div1, br);
    			append_dev(div1, t2);
    			append_dev(div1, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/inc/team/team.svelte generated by Svelte v3.44.0 */
    const file$l = "src/inc/team/team.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:32) {#each team.social as social}
    function create_each_block_1$1(ctx) {
    	let a;
    	let i;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", /*social*/ ctx[3].logo);
    			add_location(i, file$l, 16, 153, 1289);
    			set_style(a, "cursor", "pointer");
    			attr_dev(a, "title", /*social*/ ctx[3].name);
    			attr_dev(a, "href", /*social*/ ctx[3].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "icon-very-small text-white");
    			add_location(a, file$l, 16, 32, 1168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(16:32) {#each team.social as social}",
    		ctx
    	});

    	return block;
    }

    // (8:12) {#each teams as team}
    function create_each_block$6(ctx) {
    	let div5;
    	let figure;
    	let div3;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t1_value = /*team*/ ctx[0].about + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let figcaption;
    	let div4;
    	let t4_value = /*team*/ ctx[0].name + "";
    	let t4;
    	let t5;
    	let span;
    	let t6_value = /*team*/ ctx[0].role + "";
    	let t6;
    	let t7;
    	let each_value_1 = /*team*/ ctx[0].social;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			figure = element("figure");
    			div3 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			figcaption = element("figcaption");
    			div4 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			span = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(img, "alt", "");
    			if (!src_url_equal(img.src, img_src_value = /*team*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$l, 11, 24, 669);
    			attr_dev(div0, "class", "text-white opacity-7 w-85 sm-w-95");
    			add_location(div0, file$l, 13, 28, 909);
    			attr_dev(div1, "class", "social-icon w-100 position-absolute bottom-40px left-0px");
    			add_location(div1, file$l, 14, 28, 1003);
    			attr_dev(div2, "class", "team-member-details bg-transparent-gradient-fast-blue-purple align-items-center justify-content-center d-flex flex-column padding-2-half-rem-lr");
    			add_location(div2, file$l, 12, 24, 723);
    			attr_dev(div3, "class", "team-member-image border-radius-5px overflow-hidden");
    			add_location(div3, file$l, 10, 20, 579);
    			attr_dev(div4, "class", "text-extra-dark-gray alt-font line-height-18px text-medium text-uppercase font-weight-500");
    			add_location(div4, file$l, 22, 24, 1608);
    			attr_dev(span, "class", "text-small text-uppercase");
    			add_location(span, file$l, 23, 24, 1753);
    			attr_dev(figcaption, "class", "team-member-position text-center padding-35px-tb sm-padding-25px-tb");
    			add_location(figcaption, file$l, 21, 20, 1495);
    			add_location(figure, file$l, 9, 16, 550);
    			attr_dev(div5, "class", "col team-style-02 text-center");
    			add_location(div5, file$l, 8, 16, 490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, figure);
    			append_dev(figure, div3);
    			append_dev(div3, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(figure, t3);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, div4);
    			append_dev(div4, t4);
    			append_dev(figcaption, t5);
    			append_dev(figcaption, span);
    			append_dev(span, t6);
    			append_dev(div5, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teams*/ 0) {
    				each_value_1 = /*team*/ ctx[0].social;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(8:12) {#each teams as team}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let each_value = teams;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 justify-content-center");
    			add_location(div0, file$l, 6, 8, 346);
    			attr_dev(div1, "class", "container-fluid padding-seven-lr xl-padding-three-lr md-padding-2-half-rem-lr xs-padding-15px-lr");
    			add_location(div1, file$l, 5, 4, 227);
    			attr_dev(section, "id", "down-section");
    			attr_dev(section, "class", "padding-100px-top md-padding-70px-top md-padding-40px-bottom sm-padding-50px-top xs-padding-20px-top sm-padding-25px-bottom");
    			add_location(section, file$l, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*teams*/ 0) {
    				each_value = teams;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ teams });
    	return [];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/inc/team/talk.svelte generated by Svelte v3.44.0 */

    const file$k = "src/inc/team/talk.svelte";

    function create_fragment$k(ctx) {
    	let section;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let h4;
    	let t2;
    	let span1;
    	let t4;
    	let a;
    	let t5;
    	let span2;
    	let t6;
    	let div1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "متنی در اینجا";
    			t1 = space();
    			h4 = element("h4");
    			t2 = text("مانند متنی ");
    			span1 = element("span");
    			span1.textContent = "در اینجا";
    			t4 = space();
    			a = element("a");
    			t5 = text("خدمات ما");
    			span2 = element("span");
    			t6 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(span0, "class", "alt-font font-weight-500 text-large text-extra-dark-gray text-decoration-line-bottom d-inline-block margin-35px-bottom");
    			add_location(span0, file$k, 5, 20, 573);
    			attr_dev(span1, "class", "font-weight-600");
    			add_location(span1, file$k, 6, 136, 863);
    			attr_dev(h4, "class", "alt-font font-weight-500 text-extra-dark-gray letter-spacing-minus-1-half margin-45px-bottom");
    			add_location(h4, file$k, 6, 20, 747);
    			attr_dev(span2, "class", "bg-extra-dark-gray");
    			add_location(span2, file$k, 7, 108, 1022);
    			attr_dev(a, "href", "/service");
    			attr_dev(a, "class", "btn btn-large btn-expand-ltr text-white section-link");
    			add_location(a, file$k, 7, 20, 934);
    			attr_dev(div0, "class", "col-12 col-xl-5 col-lg-6 offset-xl-1 col-md-8 order-lg-2 padding-100px-bottom md-padding-6-rem-bottom text-center text-lg-start wow animate__fadeIn");
    			attr_dev(div0, "data-wow-delay", "0.4s");
    			add_location(div0, file$k, 4, 16, 369);
    			if (!src_url_equal(img.src, img_src_value = "images/our-team-01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$k, 10, 20, 1236);
    			attr_dev(div1, "class", "col-12 col-lg-6 order-lg-1 text-center align-self-end wow animate__fadeIn");
    			attr_dev(div1, "data-wow-delay", "0.2s");
    			add_location(div1, file$k, 9, 16, 1106);
    			attr_dev(div2, "class", "row align-items-center justify-content-center");
    			add_location(div2, file$k, 3, 12, 293);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$k, 2, 8, 257);
    			attr_dev(div4, "class", "bg-gradient-light-orange-light-pink border-radius-5px overflow-hidden padding-9-rem-top md-padding-6-rem-top");
    			add_location(div4, file$k, 1, 4, 126);
    			attr_dev(section, "class", "py-0 padding-seven-lr xl-padding-three-lr md-padding-2-half-rem-lr sm-no-padding-lr wow animate__fadeIn");
    			add_location(section, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(h4, t2);
    			append_dev(h4, span1);
    			append_dev(div0, t4);
    			append_dev(div0, a);
    			append_dev(a, t5);
    			append_dev(a, span2);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Talk', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Talk> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Talk extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Talk",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/inc/team/apply.svelte generated by Svelte v3.44.0 */

    const file$j = "src/inc/team/apply.svelte";

    function create_fragment$j(ctx) {
    	let section;
    	let div;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			attr_dev(div, "class", "container");
    			add_location(div, file$j, 1, 4, 61);
    			attr_dev(section, "id", "position-open");
    			attr_dev(section, "class", "wow animate__fadeIn");
    			add_location(section, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Apply', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Apply> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Apply extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Apply",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/comps/team.svelte generated by Svelte v3.44.0 */
    const file$i = "src/comps/team.svelte";

    function create_fragment$i(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let thead;
    	let t1;
    	let team;
    	let t2;
    	let talk;
    	let t3;
    	let apply;
    	let t4;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	thead = new Header({ $$inline: true });
    	team = new Team({ $$inline: true });
    	talk = new Talk({ $$inline: true });
    	apply = new Apply({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(thead.$$.fragment);
    			t1 = space();
    			create_component(team.$$.fragment);
    			t2 = space();
    			create_component(talk.$$.fragment);
    			t3 = space();
    			create_component(apply.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$i, 10, 0, 306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(thead, main, null);
    			append_dev(main, t1);
    			mount_component(team, main, null);
    			append_dev(main, t2);
    			mount_component(talk, main, null);
    			append_dev(main, t3);
    			mount_component(apply, main, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(thead.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(talk.$$.fragment, local);
    			transition_in(apply.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(thead.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(talk.$$.fragment, local);
    			transition_out(apply.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(thead);
    			destroy_component(team);
    			destroy_component(talk);
    			destroy_component(apply);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, THead: Header, Team, Talk, Apply, Footer });
    	return [];
    }

    class Team_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team_1",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/inc/title.svelte generated by Svelte v3.44.0 */

    const file$h = "src/inc/title.svelte";

    function create_fragment$h(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div0;
    	let h1;
    	let span;
    	let t0;
    	let t1;
    	let div1;
    	let h4;
    	let t2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			t0 = text(/*page*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t2 = text(/*description*/ ctx[1]);
    			attr_dev(span, "class", "page-title-separator-line bg-black w-70px sm-w-40px");
    			add_location(span, file$h, 9, 164, 486);
    			attr_dev(h1, "class", "alt-font text-extra-dark-gray position-relative padding-90px-left padding-15px-right sm-padding-55px-left mb-md-0 sm-margin-20px-bottom");
    			add_location(h1, file$h, 9, 16, 338);
    			attr_dev(div0, "class", "w-100 w-md-50 page-title-extra-small");
    			add_location(div0, file$h, 8, 12, 271);
    			attr_dev(h4, "class", "alt-font font-weight-500 text-extra-dark-gray mb-0");
    			add_location(h4, file$h, 12, 16, 646);
    			attr_dev(div1, "class", "w-100 w-md-50");
    			add_location(div1, file$h, 11, 12, 602);
    			attr_dev(div2, "class", "d-flex flex-column flex-md-row justify-content-end extra-small-screen align-items-end");
    			add_location(div2, file$h, 7, 8, 159);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$h, 6, 4, 127);
    			attr_dev(section, "class", "bg-gradient-light-orange-light-pink");
    			add_location(section, file$h, 5, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, span);
    			append_dev(h1, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page*/ 1) set_data_dev(t0, /*page*/ ctx[0]);
    			if (dirty & /*description*/ 2) set_data_dev(t2, /*description*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { page } = $$props;
    	let { description } = $$props;
    	const writable_props = ['page', 'description'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ page, description });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, description];
    }

    class Title$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { page: 0, description: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !('page' in props)) {
    			console.warn("<Title> was created without expected prop 'page'");
    		}

    		if (/*description*/ ctx[1] === undefined && !('description' in props)) {
    			console.warn("<Title> was created without expected prop 'description'");
    		}
    	}

    	get page() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/inc/contact/office.svelte generated by Svelte v3.44.0 */

    const file$g = "src/inc/contact/office.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (29:20) {#each addresses as address }
    function create_each_block$5(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*address*/ ctx[2].location + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*address*/ ctx[2].address + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4_value = /*address*/ ctx[2].phone + "";
    	let t4;
    	let t5;
    	let a;
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			t6 = text("دیدن در نقشه");
    			t7 = space();
    			attr_dev(span0, "class", "alt-font d-block text-extra-dark-gray font-weight-500 margin-10px-bottom");
    			add_location(span0, file$g, 30, 24, 917);
    			attr_dev(p, "class", "w-80 margin-5px-bottom lg-w-90");
    			add_location(p, file$g, 31, 24, 1054);
    			attr_dev(span1, "class", "d-block margin-10px-bottom");
    			add_location(span1, file$g, 32, 24, 1142);
    			attr_dev(a, "href", /*address*/ ctx[2].google_map);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "text-uppercase text-small text-extra-dark-gray font-weight-500 text-decoration-line-bottom");
    			add_location(a, file$g, 33, 24, 1230);
    			attr_dev(div, "class", "col-12 col-sm-6 xs-margin-30px-bottom");
    			add_location(div, file$g, 29, 24, 841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, t4);
    			append_dev(div, t5);
    			append_dev(div, a);
    			append_dev(a, t6);
    			append_dev(div, t7);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(29:20) {#each addresses as address }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let section;
    	let div4;
    	let div3;
    	let div0;
    	let h5;
    	let t1;
    	let div2;
    	let div1;
    	let each_value = /*addresses*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h5, "class", "alt-font w-50 text-extra-dark-gray font-weight-500 mb-0 lg-w-65 md-w-100");
    			add_location(h5, file$g, 24, 16, 565);
    			attr_dev(div0, "class", "col-12 col-lg-6 col-md-4 sm-margin-30px-bottom");
    			add_location(div0, file$g, 23, 12, 488);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$g, 27, 16, 749);
    			attr_dev(div2, "class", "col-12 col-lg-6 col-md-8");
    			add_location(div2, file$g, 26, 12, 694);
    			attr_dev(div3, "class", "row align-items-end");
    			add_location(div3, file$g, 22, 8, 442);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$g, 21, 4, 410);
    			add_location(section, file$g, 20, 0, 396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h5);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*addresses*/ 2) {
    				each_value = /*addresses*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Office', slots, []);
    	let title = "متن برای اینجا";

    	let addresses = [
    		{
    			location: "کرج",
    			address: "آدرس",
    			phone: "+989102625250",
    			google_map: "https://goo.gl/maps/c6VAWeVMSnUMZLKz5"
    		},
    		{
    			location: "تهران",
    			address: "آدرس",
    			phone: "+989102625250",
    			google_map: "https://goo.gl/maps/c6VAWeVMSnUMZLKz5"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Office> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, addresses });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('addresses' in $$props) $$invalidate(1, addresses = $$props.addresses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, addresses];
    }

    class Office extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Office",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/inc/contact/image.svelte generated by Svelte v3.44.0 */

    const file$f = "src/inc/contact/image.svelte";

    function create_fragment$f(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let a;
    	let t1;
    	let div4;
    	let div3;
    	let div2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "میز گرد";
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			attr_dev(a, "class", "btn btn-extra-large btn-dark-gray btn-box-shadow z-index-2");
    			add_location(a, file$f, 3, 12, 202);
    			attr_dev(div0, "class", "row align-items-center justify-content-center one-third-screen");
    			add_location(div0, file$f, 2, 8, 113);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$f, 1, 4, 81);
    			attr_dev(div2, "class", "swiper-slide cover-background");
    			set_style(div2, "background-image", "url('images/contact-us-modern-01.jpg')");
    			add_location(div2, file$f, 8, 12, 422);
    			attr_dev(div3, "class", "swiper-wrapper");
    			add_location(div3, file$f, 7, 8, 381);
    			attr_dev(div4, "class", "swiper-container position-absolute top-0px");
    			add_location(div4, file$f, 6, 4, 315);
    			attr_dev(section, "class", "one-third-screen p-0 position-relative wow animate__fadeIn");
    			add_location(section, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(section, t1);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Image', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/inc/contact/map.svelte generated by Svelte v3.44.0 */

    const file$e = "src/inc/contact/map.svelte";

    function create_fragment$e(ctx) {
    	let section0;
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let section1;
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			section1 = element("section");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			iframe = element("iframe");
    			attr_dev(div0, "class", "col-12 col-lg-5 col-md-8 md-margin-50px-bottom");
    			add_location(div0, file$e, 7, 12, 415);
    			attr_dev(div1, "class", "row align-items-end justify-content-center");
    			add_location(div1, file$e, 6, 8, 346);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$e, 5, 4, 314);
    			attr_dev(section0, "class", "big-section wow animate__fadeIn");
    			add_location(section0, file$e, 4, 0, 260);
    			attr_dev(iframe, "class", "w-100 h-100 filter-grayscale-100");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*map*/ ctx[0])) attr_dev(iframe, "src", iframe_src_value);
    			add_location(iframe, file$e, 20, 20, 769);
    			attr_dev(div3, "class", "map-style-3 h-500px xs-h-300px");
    			add_location(div3, file$e, 19, 16, 704);
    			attr_dev(div4, "class", "col-md-12 px-0");
    			add_location(div4, file$e, 18, 12, 659);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$e, 17, 8, 629);
    			attr_dev(div6, "class", "container-fluid");
    			add_location(div6, file$e, 16, 4, 591);
    			attr_dev(section1, "class", "no-padding-tb wow animate__fadeIn");
    			add_location(section1, file$e, 15, 0, 535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, iframe);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Map', slots, []);
    	let map = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d51743.463919613816!2d50.9558051!3d35.8498251!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDUxJzU1LjMiTiA1MMKwNTgnMDUuMSJF!5e0!3m2!1sen!2s!4v1636456272022!5m2!1sen!2s";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ map });

    	$$self.$inject_state = $$props => {
    		if ('map' in $$props) $$invalidate(0, map = $$props.map);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [map];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/inc/contact/s_contact.svelte generated by Svelte v3.44.0 */

    const file$d = "src/inc/contact/s_contact.svelte";

    function create_fragment$d(ctx) {
    	let section;
    	let div7;
    	let div6;
    	let div1;
    	let div0;
    	let i0;
    	let t0;
    	let span;
    	let t2;
    	let div3;
    	let div2;
    	let i1;
    	let t3;
    	let a0;
    	let t4;
    	let t5;
    	let div5;
    	let div4;
    	let i2;
    	let t6;
    	let a1;
    	let t7;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = `${/*phone*/ ctx[0]}`;
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			i1 = element("i");
    			t3 = space();
    			a0 = element("a");
    			t4 = text(/*email*/ ctx[1]);
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			i2 = element("i");
    			t6 = space();
    			a1 = element("a");
    			t7 = text(/*domain*/ ctx[2]);
    			attr_dev(i0, "class", "feather icon-feather-phone align-middle icon-extra-small text-gradient-magenta-orange margin-10px-right");
    			add_location(i0, file$d, 12, 20, 509);
    			attr_dev(span, "class", "text-extra-dark-gray alt-font text-medium");
    			add_location(span, file$d, 13, 20, 649);
    			attr_dev(div0, "class", "d-flex justify-content-center align-items-center padding-15px-lr h-100");
    			add_location(div0, file$d, 11, 16, 404);
    			attr_dev(div1, "class", "col-12 col-sm-auto sm-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div1, "data-wow-delay", "0.2s");
    			add_location(div1, file$d, 10, 12, 291);
    			attr_dev(i1, "class", "feather icon-feather-mail align-middle icon-extra-small text-gradient-magenta-orange margin-10px-right");
    			add_location(i1, file$d, 20, 20, 1076);
    			attr_dev(a0, "href", "mailto:" + /*email*/ ctx[1]);
    			attr_dev(a0, "class", "text-extra-dark-gray alt-font text-medium");
    			add_location(a0, file$d, 21, 20, 1215);
    			attr_dev(div2, "class", "d-flex justify-content-center align-items-center padding-15px-lr h-100");
    			add_location(div2, file$d, 19, 16, 971);
    			attr_dev(div3, "class", "col-12 col-sm-auto sm-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.4s");
    			add_location(div3, file$d, 18, 12, 858);
    			attr_dev(i2, "class", "feather icon-feather-globe align-middle icon-extra-small text-gradient-magenta-orange margin-10px-right");
    			add_location(i2, file$d, 28, 20, 1636);
    			attr_dev(a1, "href", "https://" + /*domain*/ ctx[2]);
    			attr_dev(a1, "class", "text-extra-dark-gray alt-font text-medium");
    			add_location(a1, file$d, 29, 20, 1776);
    			attr_dev(div4, "class", "d-flex justify-content-center align-items-center padding-15px-lr h-100");
    			add_location(div4, file$d, 27, 16, 1531);
    			attr_dev(div5, "class", "col-12 col-sm-auto wow animate__fadeIn");
    			attr_dev(div5, "data-wow-delay", "0.6s");
    			add_location(div5, file$d, 26, 12, 1440);
    			attr_dev(div6, "class", "row justify-content-center");
    			add_location(div6, file$d, 8, 8, 195);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$d, 7, 4, 163);
    			attr_dev(section, "class", "half-section");
    			add_location(section, file$d, 6, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, i1);
    			append_dev(div2, t3);
    			append_dev(div2, a0);
    			append_dev(a0, t4);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, i2);
    			append_dev(div4, t6);
    			append_dev(div4, a1);
    			append_dev(a1, t7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S_contact', slots, []);
    	let phone = "+989102625250";
    	let email = "info@theroundtable.ir";
    	let domain = "theroundtable.ir";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S_contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ phone, email, domain });

    	$$self.$inject_state = $$props => {
    		if ('phone' in $$props) $$invalidate(0, phone = $$props.phone);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    		if ('domain' in $$props) $$invalidate(2, domain = $$props.domain);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [phone, email, domain];
    }

    class S_contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S_contact",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/comps/contact.svelte generated by Svelte v3.44.0 */
    const file$c = "src/comps/contact.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let title;
    	let t1;
    	let office;
    	let t2;
    	let image;
    	let t3;
    	let br;
    	let t4;
    	let map;
    	let t5;
    	let s_contact;
    	let t6;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	title = new Title$1({
    			props: {
    				page: "ارتباط با ما",
    				description: "جایی هست که میشه بود متن اینجا !"
    			},
    			$$inline: true
    		});

    	office = new Office({ $$inline: true });
    	image = new Image({ $$inline: true });
    	map = new Map$1({ $$inline: true });
    	s_contact = new S_contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(title.$$.fragment);
    			t1 = space();
    			create_component(office.$$.fragment);
    			t2 = space();
    			create_component(image.$$.fragment);
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			create_component(map.$$.fragment);
    			t5 = space();
    			create_component(s_contact.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			add_location(br, file$c, 18, 4, 505);
    			add_location(main, file$c, 11, 0, 371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(title, main, null);
    			append_dev(main, t1);
    			mount_component(office, main, null);
    			append_dev(main, t2);
    			mount_component(image, main, null);
    			append_dev(main, t3);
    			append_dev(main, br);
    			append_dev(main, t4);
    			mount_component(map, main, null);
    			append_dev(main, t5);
    			mount_component(s_contact, main, null);
    			append_dev(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(office.$$.fragment, local);
    			transition_in(image.$$.fragment, local);
    			transition_in(map.$$.fragment, local);
    			transition_in(s_contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(office.$$.fragment, local);
    			transition_out(image.$$.fragment, local);
    			transition_out(map.$$.fragment, local);
    			transition_out(s_contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(title);
    			destroy_component(office);
    			destroy_component(image);
    			destroy_component(map);
    			destroy_component(s_contact);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Title: Title$1,
    		Office,
    		Image,
    		Map: Map$1,
    		S_contact,
    		Footer
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/inc/service/about.svelte generated by Svelte v3.44.0 */

    const file$b = "src/inc/service/about.svelte";

    function create_fragment$b(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let h4;
    	let t3;
    	let p;
    	let t5;
    	let a;
    	let t6_value = /*service*/ ctx[0].action + "";
    	let t6;
    	let i;
    	let t7;
    	let div1;
    	let figure;
    	let img;
    	let img_src_value;
    	let t8;
    	let span1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = `${/*service*/ ctx[0].title}`;
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = `${/*service*/ ctx[0].first_ti}`;
    			t3 = space();
    			p = element("p");
    			p.textContent = `${/*service*/ ctx[0].sec_ti}`;
    			t5 = space();
    			a = element("a");
    			t6 = text(t6_value);
    			i = element("i");
    			t7 = space();
    			div1 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t8 = space();
    			span1 = element("span");
    			attr_dev(span0, "class", "alt-font margin-20px-bottom text-gradient-sky-blue-pink d-inline-block text-uppercase font-weight-500 letter-spacing-1px");
    			add_location(span0, file$b, 15, 16, 554);
    			attr_dev(h4, "class", "alt-font font-weight-600 text-extra-dark-gray w-95");
    			add_location(h4, file$b, 16, 16, 728);
    			attr_dev(p, "class", "w-80 lg-w-95");
    			add_location(p, file$b, 17, 16, 831);
    			attr_dev(i, "class", "feather icon-feather-arrow-right icon-very-small right-icon");
    			add_location(i, file$b, 18, 133, 1009);
    			attr_dev(a, "href", "#services");
    			attr_dev(a, "class", "btn btn-medium btn-dark-gray margin-15px-top btn-round-edge section-link");
    			add_location(a, file$b, 18, 16, 892);
    			attr_dev(div0, "class", "col-12 col-lg-5 col-md-9 md-margin-7-rem-bottom");
    			add_location(div0, file$b, 14, 12, 476);
    			attr_dev(img, "class", "border-radius-6px");
    			if (!src_url_equal(img.src, img_src_value = "images/our-services-01.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$b, 22, 20, 1292);
    			attr_dev(span1, "class", "bg-gradient-light-purple-light-orange border-radius-6px overlay");
    			add_location(span1, file$b, 23, 20, 1385);
    			attr_dev(figure, "class", "position-right w-100");
    			add_location(figure, file$b, 21, 16, 1233);
    			attr_dev(div1, "class", "col-12 col-lg-7 col-md-9 padding-55px-lr md-padding-5px-left sm-padding-50px-right");
    			add_location(div1, file$b, 20, 12, 1120);
    			attr_dev(div2, "class", "row align-items-center justify-content-center");
    			add_location(div2, file$b, 13, 8, 404);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$b, 12, 4, 372);
    			add_location(section, file$b, 11, 0, 358);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(div0, t5);
    			append_dev(div0, a);
    			append_dev(a, t6);
    			append_dev(a, i);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, figure);
    			append_dev(figure, img);
    			append_dev(figure, t8);
    			append_dev(figure, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);

    	let service = {
    		title: "تایتل",
    		first_ti: "متنی در اینجا و آنجا متن متن متن متن",
    		sec_ti: "متنی در اینجا و آنجا متن متن متن متنمتنی در اینجا و آنجا متن متن متن متنمتنی در اینجا و آنجا متن متن متن متنمتنی در اینجا و آنجا متن متن متن متنمتنی در اینجا و آنجا متن متن متن متن",
    		action: "خدمات ما"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ service });

    	$$self.$inject_state = $$props => {
    		if ('service' in $$props) $$invalidate(0, service = $$props.service);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [service];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/inc/service/possibilities.svelte generated by Svelte v3.44.0 */

    const file$a = "src/inc/service/possibilities.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (34:12) {#each services as service, i}
    function create_each_block$4(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let span;
    	let t0_value = /*i*/ ctx[6] + 1 + "";
    	let t0;
    	let t1;
    	let h6;
    	let t2_value = /*service*/ ctx[4].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*service*/ ctx[4].des + "";
    	let t4;
    	let t5;
    	let div0;
    	let t6;
    	let a;
    	let t7;
    	let i_1;
    	let t8;
    	let div2;
    	let t9;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			h6 = element("h6");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div0 = element("div");
    			t6 = space();
    			a = element("a");
    			t7 = text(/*action*/ ctx[2]);
    			i_1 = element("i");
    			t8 = space();
    			div2 = element("div");
    			t9 = space();
    			attr_dev(span, "class", "margin-15px-bottom d-block text-extra-medium");
    			add_location(span, file$a, 37, 24, 1678);
    			attr_dev(h6, "class", "alt-font font-weight-600 d-block text-extra-dark-gray");
    			add_location(h6, file$a, 38, 24, 1774);
    			add_location(p, file$a, 39, 24, 1885);
    			attr_dev(div0, "class", "h-1px bg-medium-gray margin-25px-bottom w-100");
    			add_location(div0, file$a, 40, 24, 1930);
    			attr_dev(i_1, "class", "feather icon-feather-arrow-right icon-extra-small float-end");
    			add_location(i_1, file$a, 41, 137, 2133);
    			attr_dev(a, "class", "text-small font-weight-500 text-uppercase alt-font d-block text-extra-dark-gray");
    			attr_dev(a, "href", "/about");
    			add_location(a, file$a, 41, 24, 2020);
    			attr_dev(div1, "class", "feature-box-content");
    			add_location(div1, file$a, 36, 20, 1620);
    			attr_dev(div2, "class", "feature-box-overlay bg-white");
    			add_location(div2, file$a, 43, 20, 2260);
    			attr_dev(div3, "class", "feature-box text-start box-shadow-large box-shadow-double-large-hover bg-white padding-4-rem-all lg-padding-3-rem-all md-padding-4-half-rem-all");
    			add_location(div3, file$a, 35, 16, 1442);
    			attr_dev(div4, "class", "col-12 col-lg-4 col-md-9 md-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn");
    			add_location(div4, file$a, 34, 12, 1323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			append_dev(div1, h6);
    			append_dev(h6, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div1, t6);
    			append_dev(div1, a);
    			append_dev(a, t7);
    			append_dev(a, i_1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div4, t9);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(34:12) {#each services as service, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h5;
    	let t3;
    	let div2;
    	let each_value = /*services*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = `${/*title2*/ ctx[1]}`;
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "alt-font margin-10px-bottom d-inline-block text-uppercase font-weight-500 text-gradient-sky-blue-pink letter-spacing-1px");
    			add_location(span, file$a, 27, 16, 881);
    			attr_dev(h5, "class", "alt-font text-extra-dark-gray font-weight-600 letter-spacing-minus-1px");
    			add_location(h5, file$a, 28, 16, 1047);
    			attr_dev(div0, "class", "col-12 col-md-6 text-center margin-5-rem-bottom sm-margin-3-rem-bottom");
    			add_location(div0, file$a, 26, 12, 780);
    			attr_dev(div1, "class", "row justify-content-center");
    			add_location(div1, file$a, 25, 8, 727);
    			attr_dev(div2, "class", "row justify-content-center");
    			add_location(div2, file$a, 31, 8, 1186);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$a, 24, 4, 695);
    			attr_dev(section, "class", "bg-light-gray wow animate__fadeIn");
    			add_location(section, file$a, 23, 0, 639);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h5);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*action, services*/ 12) {
    				each_value = /*services*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Possibilities', slots, []);
    	let title = "کار هایی که میکنیم";
    	let title2 = "سوشال مدیاااا";
    	let action = "بیشتر بخوانید";

    	let services = [
    		{
    			title: "تایتل",
    			des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
    		},
    		{
    			title: "تایتل",
    			des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
    		},
    		{
    			title: "تایتل",
    			des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Possibilities> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, title2, action, services });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('title2' in $$props) $$invalidate(1, title2 = $$props.title2);
    		if ('action' in $$props) $$invalidate(2, action = $$props.action);
    		if ('services' in $$props) $$invalidate(3, services = $$props.services);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, title2, action, services];
    }

    class Possibilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Possibilities",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/inc/service/services.svelte generated by Svelte v3.44.0 */

    const file$9 = "src/inc/service/services.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (40:28) {#each services as service}
    function create_each_block$3(ctx) {
    	let li;
    	let t_value = /*service*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			set_style(li, "text-align", "center");
    			attr_dev(li, "class", "border-color-dark-white-transparent mb-0");
    			add_location(li, file$9, 40, 28, 2083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(40:28) {#each services as service}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let div7;
    	let div6;
    	let div2;
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h5;
    	let t3;
    	let p;
    	let t5;
    	let div5;
    	let div4;
    	let div3;
    	let i;
    	let t6;
    	let h6;
    	let t8;
    	let ul;
    	let each_value = /*services*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = `${/*title2*/ ctx[1]}`;
    			t3 = space();
    			p = element("p");
    			p.textContent = `${/*desc*/ ctx[2]}`;
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			i = element("i");
    			t6 = space();
    			h6 = element("h6");
    			h6.textContent = `${/*services_header*/ ctx[3]}`;
    			t8 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "alt-font margin-20px-bottom text-gradient-sky-blue-pink d-inline-block text-uppercase font-weight-500 letter-spacing-1px");
    			add_location(span, file$9, 27, 24, 855);
    			attr_dev(h5, "class", "alt-font font-weight-600 text-extra-dark-gray");
    			add_location(h5, file$9, 28, 24, 1029);
    			attr_dev(p, "class", "w-80 margin-4-half-rem-bottom md-w-100");
    			add_location(p, file$9, 29, 24, 1125);
    			attr_dev(div0, "class", "col-12 position-relative margin-5-half-rem-bottom sm-margin-7-half-rem-bottom");
    			add_location(div0, file$9, 26, 20, 739);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$9, 25, 16, 701);
    			attr_dev(div2, "class", "col-12 col-xl-7 col-lg-8 col-md-12 md-margin-40px-bottom");
    			add_location(div2, file$9, 24, 12, 614);
    			attr_dev(i, "class", "line-icon-Cursor-Click2 title-extra-large-heavy text-extra-dark-gray opacity-2 position-absolute top-minus-20px left-minus-30px");
    			add_location(i, file$9, 36, 24, 1594);
    			set_style(h6, "text-align", "right");
    			attr_dev(h6, "class", "alt-font font-weight-500 text-white margin-35px-bottom sm-margin-15px-bottom position-relative z-index-1");
    			add_location(h6, file$9, 37, 24, 1762);
    			attr_dev(ul, "class", "list-style-03 alt-font text-white");
    			add_location(ul, file$9, 38, 24, 1952);
    			attr_dev(div3, "class", "bg-gradient-fast-blue-purple w-100 overflow-hidden border-radius-4px padding-4-rem-all lg-padding-3-rem-all md-padding-4-rem-all position-relative");
    			add_location(div3, file$9, 35, 20, 1408);
    			attr_dev(div4, "class", "sticky-top lg-position-relative");
    			add_location(div4, file$9, 34, 16, 1342);
    			attr_dev(div5, "class", "col-12 col-lg-4 col-md-12 offset-xl-1");
    			add_location(div5, file$9, 33, 12, 1274);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$9, 23, 8, 584);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$9, 22, 4, 552);
    			attr_dev(section, "class", "parallax overflow-visible wow animate__fadeIn");
    			attr_dev(section, "id", "services");
    			attr_dev(section, "data-parallax-background-ratio", "0.1");
    			set_style(section, "background-image", "url('images/our-services-17.png')");
    			add_location(section, file$9, 21, 0, 372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h5);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, i);
    			append_dev(div3, t6);
    			append_dev(div3, h6);
    			append_dev(div3, t8);
    			append_dev(div3, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*services*/ 16) {
    				each_value = /*services*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	let title = "تایتل";
    	let title2 = "سوشال مدیاااا";
    	let desc = "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر";
    	let services_header = "خدمات ما";
    	let services = ["خدمات 1", "خدمات 2", "خدمات 3", "خدمات 4", "خدمات 5", "خدمات 6"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		title,
    		title2,
    		desc,
    		services_header,
    		services
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('title2' in $$props) $$invalidate(1, title2 = $$props.title2);
    		if ('desc' in $$props) $$invalidate(2, desc = $$props.desc);
    		if ('services_header' in $$props) $$invalidate(3, services_header = $$props.services_header);
    		if ('services' in $$props) $$invalidate(4, services = $$props.services);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, title2, desc, services_header, services];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/inc/service/features.svelte generated by Svelte v3.44.0 */
    const file$8 = "src/inc/service/features.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (10:12) {#each features as feature}
    function create_each_block$2(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let i;
    	let t0;
    	let span0;
    	let svg;
    	let path;
    	let t1;
    	let div1;
    	let span1;
    	let t2_value = /*feature*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*feature*/ ctx[0].desc + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			span0 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(i, "class", "" + (/*feature*/ ctx[0].icon + " icon-medium text-gradient-sky-blue-pink"));
    			add_location(i, file$8, 13, 24, 525);
    			attr_dev(path, "fill", "#fff");
    			attr_dev(path, "d", "M88.6,52.5C56,107.7,-69.9,110.3,-100.2,56.5C-130.5,2.7,-65.2,-107.7,-2.3,-109C60.6,-110.3,121.2,-2.7,88.6,52.5Z");
    			add_location(path, file$8, 15, 116, 784);
    			attr_dev(svg, "width", "100");
    			attr_dev(svg, "viewBox", "-110 -110 220 220");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$8, 15, 36, 704);
    			attr_dev(span0, "class", "feature-box-svg-shap drop-shadow");
    			add_location(span0, file$8, 14, 24, 620);
    			attr_dev(div0, "class", "feature-box-icon feature-box-svg margin-20px-bottom");
    			add_location(div0, file$8, 12, 20, 435);
    			attr_dev(span1, "class", "alt-font font-weight-500 margin-10px-bottom d-block text-extra-dark-gray");
    			add_location(span1, file$8, 19, 24, 1102);
    			add_location(p, file$8, 20, 24, 1236);
    			attr_dev(div1, "class", "feature-box-content last-paragraph-no-margin");
    			add_location(div1, file$8, 18, 20, 1019);
    			attr_dev(div2, "class", "feature-box padding-4-half-rem-all lg-padding-3-rem-all");
    			add_location(div2, file$8, 11, 16, 345);
    			attr_dev(div3, "class", "col wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.4s");
    			add_location(div3, file$8, 10, 12, 269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, svg);
    			append_dev(svg, path);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(span1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div3, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:12) {#each features as feature}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let each_value = features;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row row-cols-1 row-cols-lg-3 row-cols-sm-2");
    			add_location(div0, file$8, 8, 8, 160);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$8, 7, 4, 128);
    			attr_dev(section, "class", "bg-light-gray wow animate__fadeIn");
    			add_location(section, file$8, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*features*/ 0) {
    				each_value = features;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Features', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Features> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ features });
    	return [];
    }

    class Features extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Features",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/inc/service/told.svelte generated by Svelte v3.44.0 */
    const file$7 = "src/inc/service/told.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (40:12) {#each tolds as told }
    function create_each_block_1(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let div0;
    	let i;
    	let t1;
    	let p;
    	let t2_value = /*told*/ ctx[7].told + "";
    	let t2;
    	let t3;
    	let span0;
    	let t4_value = /*told*/ ctx[7].name + "";
    	let t4;
    	let t5;
    	let span1;
    	let t6_value = /*told*/ ctx[7].pos + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "d-inline-block");
    			if (!src_url_equal(img.src, img_src_value = /*told*/ ctx[7].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$7, 42, 20, 1610);
    			attr_dev(i, "class", "fa fa-quote-left icon-small text-gradient-light-purple-light-orange");
    			add_location(i, file$7, 45, 28, 1903);
    			attr_dev(div0, "class", "testimonials-rounded-icon bg-white rounded-circle");
    			add_location(div0, file$7, 44, 24, 1811);
    			add_location(p, file$7, 47, 24, 2042);
    			attr_dev(span0, "class", "alt-font font-weight-500 text-extra-dark-gray text-uppercase d-block");
    			add_location(span0, file$7, 48, 24, 2085);
    			attr_dev(span1, "class", "alt-font font-weight-500 text-small text-uppercase d-block");
    			add_location(span1, file$7, 49, 24, 2211);
    			attr_dev(div1, "class", "testimonials-content padding-3-half-rem-all text-center bg-white lg-padding-2-half-rem-lr");
    			add_location(div1, file$7, 43, 20, 1683);
    			attr_dev(div2, "class", "testimonials-style-02 border-radius-5px overflow-hidden");
    			add_location(div2, file$7, 41, 16, 1520);
    			attr_dev(div3, "class", "col wow animate__fadeIn");
    			attr_dev(div3, "data-wow-delay", "0.6s");
    			add_location(div3, file$7, 40, 12, 1444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, span0);
    			append_dev(span0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, span1);
    			append_dev(span1, t6);
    			append_dev(div3, t7);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(40:12) {#each tolds as told }",
    		ctx
    	});

    	return block;
    }

    // (57:12) {#each _clients as client}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = space();
    			attr_dev(img, "alt", /*client*/ ctx[4].name);
    			if (!src_url_equal(img.src, img_src_value = /*client*/ ctx[4].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$7, 59, 32, 2744);
    			attr_dev(a, "href", "#");
    			add_location(a, file$7, 59, 20, 2732);
    			attr_dev(span, "class", "client-overlay bg-white box-shadow-small border-radius-4px");
    			add_location(span, file$7, 60, 20, 2813);
    			attr_dev(div0, "class", "client-box padding-25px-all text-center");
    			attr_dev(div0, "title", /*client*/ ctx[4].name);
    			add_location(div0, file$7, 58, 16, 2636);
    			attr_dev(div1, "class", "col text-center sm-no-margin wow animate__fadeIn");
    			add_location(div1, file$7, 57, 12, 2557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(div1, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(57:12) {#each _clients as client}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let div4;
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h5;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let each_value_1 = /*tolds*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*_clients*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = `${/*title2*/ ctx[1]}`;
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "alt-font margin-10px-bottom d-inline-block text-uppercase font-weight-500 text-gradient-sky-blue-pink letter-spacing-1px");
    			add_location(span, file$7, 34, 16, 969);
    			attr_dev(h5, "class", "alt-font text-extra-dark-gray font-weight-600 letter-spacing-minus-1px");
    			add_location(h5, file$7, 35, 16, 1135);
    			attr_dev(div0, "class", "col-12 col-md-6 text-center margin-5-rem-bottom sm-margin-3-rem-bottom");
    			add_location(div0, file$7, 33, 12, 868);
    			attr_dev(div1, "class", "row justify-content-center");
    			add_location(div1, file$7, 32, 8, 815);
    			attr_dev(div2, "class", "row row-cols-1 row-cols-lg-3 row-cols-md-2 justify-content-center margin-9-rem-bottom lg-margin-7-rem-bottom");
    			add_location(div2, file$7, 38, 8, 1274);
    			attr_dev(div3, "class", "row row-cols-1 row-cols-lg-6 row-cols-md-3 row-cols-sm-2 client-logo-style-04");
    			add_location(div3, file$7, 55, 8, 2414);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$7, 31, 4, 783);
    			attr_dev(section, "class", "bg-light-gray wow animate__fadeIn");
    			add_location(section, file$7, 30, 0, 727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h5);
    			append_dev(div4, t3);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div4, t4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tolds*/ 4) {
    				each_value_1 = /*tolds*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*_clients*/ 8) {
    				each_value = /*_clients*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Told', slots, []);
    	let title = "تایتل";
    	let title2 = "تایتل2";

    	let tolds = [
    		{
    			told: "عالی است بسیار بسیار",
    			name: "احمد ذوقی",
    			pos: "مدیر مالی آستارا",
    			img: "images/testimonial-img-11.jpg"
    		},
    		{
    			told: "عالی است بسیار بسیار",
    			name: "احمد ذوقی",
    			pos: "مدیر مالی آستارا",
    			img: "images/testimonial-img-11.jpg"
    		},
    		{
    			told: "عالی است بسیار بسیار",
    			name: "احمد ذوقی",
    			pos: "مدیر مالی آستارا",
    			img: "images/testimonial-img-11.jpg"
    		}
    	];

    	let _clients = clients.slice(0, 6);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Told> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, title2, tolds, clients, _clients });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('title2' in $$props) $$invalidate(1, title2 = $$props.title2);
    		if ('tolds' in $$props) $$invalidate(2, tolds = $$props.tolds);
    		if ('_clients' in $$props) $$invalidate(3, _clients = $$props._clients);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, title2, tolds, _clients];
    }

    class Told extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Told",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/comps/services.svelte generated by Svelte v3.44.0 */
    const file$6 = "src/comps/services.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let title;
    	let t1;
    	let about;
    	let t2;
    	let possibilities;
    	let t3;
    	let services;
    	let t4;
    	let features;
    	let t5;
    	let told;
    	let t6;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	title = new Title$1({
    			props: {
    				page: "خدمات ما",
    				description: "بیا باز زندگی کنیم با هم"
    			},
    			$$inline: true
    		});

    	about = new About({ $$inline: true });
    	possibilities = new Possibilities({ $$inline: true });
    	services = new Services({ $$inline: true });
    	features = new Features({ $$inline: true });
    	told = new Told({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(title.$$.fragment);
    			t1 = space();
    			create_component(about.$$.fragment);
    			t2 = space();
    			create_component(possibilities.$$.fragment);
    			t3 = space();
    			create_component(services.$$.fragment);
    			t4 = space();
    			create_component(features.$$.fragment);
    			t5 = space();
    			create_component(told.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$6, 12, 0, 443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(title, main, null);
    			append_dev(main, t1);
    			mount_component(about, main, null);
    			append_dev(main, t2);
    			mount_component(possibilities, main, null);
    			append_dev(main, t3);
    			mount_component(services, main, null);
    			append_dev(main, t4);
    			mount_component(features, main, null);
    			append_dev(main, t5);
    			mount_component(told, main, null);
    			append_dev(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(possibilities.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(features.$$.fragment, local);
    			transition_in(told.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(possibilities.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(features.$$.fragment, local);
    			transition_out(told.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(title);
    			destroy_component(about);
    			destroy_component(possibilities);
    			destroy_component(services);
    			destroy_component(features);
    			destroy_component(told);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Title: Title$1,
    		About,
    		Possibilities,
    		Services,
    		Features,
    		Told,
    		Footer
    	});

    	return [];
    }

    class Services_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/inc/portfolio/title.svelte generated by Svelte v3.44.0 */

    const file$5 = "src/inc/portfolio/title.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let h2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = `${/*title2*/ ctx[1]}`;
    			attr_dev(h1, "class", "alt-font text-gradient-sky-blue-pink margin-15px-bottom d-inline-block");
    			add_location(h1, file$5, 10, 16, 511);
    			attr_dev(h2, "class", "text-extra-dark-gray alt-font font-weight-500 letter-spacing-minus-1px line-height-50 sm-line-height-45 xs-line-height-30 no-margin-bottom");
    			add_location(h2, file$5, 11, 16, 623);
    			attr_dev(div0, "class", "col-12 col-xl-6 col-lg-7 col-md-8 page-title-extra-small text-center d-flex justify-content-center flex-column");
    			add_location(div0, file$5, 9, 12, 370);
    			attr_dev(div1, "class", "row align-items-stretch justify-content-center extra-small-screen");
    			add_location(div1, file$5, 8, 8, 278);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$5, 7, 4, 246);
    			attr_dev(section, "class", "half-section bg-light-gray parallax");
    			attr_dev(section, "data-parallax-background-ratio", "0.5");
    			set_style(section, "background-image", "url('images/portfolio-bg2.jpg')");
    			add_location(section, file$5, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let title = "نمونه کارها";
    	let title2 = "اینجا نمونه کار هامونه";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, title2 });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('title2' in $$props) $$invalidate(1, title2 = $$props.title2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, title2];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/inc/portfolio/list.svelte generated by Svelte v3.44.0 */
    const file$4 = "src/inc/portfolio/list.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (11:20) {#each samples as sample}
    function create_each_block(ctx) {
    	let div6;
    	let a;
    	let div5;
    	let div4;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let t1_value = /*sample*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*sample*/ ctx[0].type + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			a = element("a");
    			div5 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*sample*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*sample*/ ctx[0].name);
    			add_location(img, file$4, 15, 36, 805);
    			attr_dev(div0, "class", "alt-font text-extra-dark-gray font-weight-500 d-block");
    			add_location(div0, file$4, 18, 44, 1073);
    			attr_dev(div1, "class", "text-uppercase text-medium-gray text-small alt-font d-block");
    			add_location(div1, file$4, 19, 44, 1204);
    			attr_dev(div2, "class", "scale");
    			add_location(div2, file$4, 17, 40, 1009);
    			attr_dev(div3, "class", "portfolio-hover bg-white justify-content-center d-flex flex-column");
    			add_location(div3, file$4, 16, 36, 888);
    			attr_dev(div4, "class", "portfolio-image bg-gradient-sky-blue-pink");
    			add_location(div4, file$4, 14, 32, 713);
    			attr_dev(div5, "class", "portfolio-box");
    			add_location(div5, file$4, 13, 28, 653);
    			attr_dev(a, "href", /*sample*/ ctx[0].link);
    			add_location(a, file$4, 12, 24, 600);
    			attr_dev(div6, "class", "col text-center margin-30px-bottom sm-margin-15px-bottom wow animate__fadeIn");
    			attr_dev(div6, "data-wow-delay", "0.2s");
    			add_location(div6, file$4, 11, 20, 463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, a);
    			append_dev(a, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div6, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:20) {#each samples as sample}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let each_value = samples;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "portfolio-bordered portfolio-wrapper row row-cols-1 row-cols-md-2 row-cols-sm-2 client-logo-style-01 align-items-center margin-7-half-rem-top sm-margin-5-rem-top text-center");
    			add_location(div0, file$4, 9, 16, 209);
    			attr_dev(div1, "class", "col-12 filter-content");
    			add_location(div1, file$4, 8, 12, 157);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$4, 7, 8, 127);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$4, 6, 4, 95);
    			attr_dev(section, "class", "pt-0");
    			add_location(section, file$4, 4, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*samples*/ 0) {
    				each_value = samples;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ samples });
    	return [];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/comps/portfolio.svelte generated by Svelte v3.44.0 */
    const file$3 = "src/comps/portfolio.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let title;
    	let t1;
    	let list;
    	let t2;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	title = new Title({ $$inline: true });
    	list = new List({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(title.$$.fragment);
    			t1 = space();
    			create_component(list.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$3, 9, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(title, main, null);
    			append_dev(main, t1);
    			mount_component(list, main, null);
    			append_dev(main, t2);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(list.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(list.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(title);
    			destroy_component(list);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, Title, List, Footer });
    	return [];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/inc/404/not_found.svelte generated by Svelte v3.44.0 */

    const file$2 = "src/inc/404/not_found.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let h6;
    	let t1;
    	let h1;
    	let t3;
    	let span;
    	let t5;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "ببخشید!!";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "404";
    			t3 = space();
    			span = element("span");
    			span.textContent = "صفحه مورد نظر وجود ندارد";
    			t5 = space();
    			a = element("a");
    			a.textContent = "بازگشت به خانه.";
    			set_style(h6, "direction", "rtl");
    			attr_dev(h6, "class", "alt-font text-fast-blue font-weight-600 letter-spacing-minus-1px margin-10px-bottom text-uppercase");
    			add_location(h6, file$2, 4, 16, 368);
    			attr_dev(h1, "class", "alt-font text-extra-big font-weight-700 letter-spacing-minus-5px text-extra-dark-gray margin-6-rem-bottom md-margin-4-rem-bottom");
    			add_location(h1, file$2, 5, 16, 532);
    			attr_dev(span, "class", "alt-font font-weight-500 text-extra-dark-gray d-block margin-20px-bottom");
    			add_location(span, file$2, 6, 16, 698);
    			set_style(a, "direction", "rtl");
    			set_style(a, "color", "#ffffff");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-large btn-gradient-sky-blue-pink");
    			add_location(a, file$2, 7, 16, 833);
    			attr_dev(div0, "class", "col-12 col-xl-6 col-lg-7 col-md-8 text-center d-flex align-items-center justify-content-center flex-column");
    			add_location(div0, file$2, 3, 12, 231);
    			attr_dev(div1, "class", "row align-items-stretch justify-content-center full-screen");
    			add_location(div1, file$2, 2, 8, 146);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$2, 1, 4, 114);
    			attr_dev(section, "class", "p-0 cover-background wow animate__fadeIn");
    			set_style(section, "background-image", "url('images/404-bg.jpg')");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(div0, t3);
    			append_dev(div0, span);
    			append_dev(div0, t5);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Not_found', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Not_found> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Not_found$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Not_found",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/comps/not_found.svelte generated by Svelte v3.44.0 */
    const file$1 = "src/comps/not_found.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let notfound;
    	let t1;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	notfound = new Not_found$1({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(notfound.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$1, 8, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(notfound, main, null);
    			append_dev(main, t1);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(notfound.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(notfound.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(notfound);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Not_found', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Not_found> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, NotFound: Not_found$1, Footer });
    	return [];
    }

    class Not_found extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Not_found",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let switch_instance;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(main, file, 26, 0, 727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page$1;
    	page('/', () => $$invalidate(0, page$1 = Home));
    	page('/about', () => $$invalidate(0, page$1 = About_1));
    	page('/team', () => $$invalidate(0, page$1 = Team_1));
    	page('/contact', () => $$invalidate(0, page$1 = Contact));
    	page('/service', () => $$invalidate(0, page$1 = Services_1));
    	page('/Portfolio', () => $$invalidate(0, page$1 = Portfolio));
    	page('*', () => $$invalidate(0, page$1 = Not_found));
    	page.start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		router: page,
    		Home,
    		About: About_1,
    		Team: Team_1,
    		Contact,
    		Service: Services_1,
    		Portfolio,
    		NotFound: Not_found,
    		page: page$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page$1 = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
