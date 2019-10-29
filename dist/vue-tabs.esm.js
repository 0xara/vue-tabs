import { getHash, pushHash } from 'js-helpers/dist/hash';
import { forEach } from 'js-helpers/dist/array/forEach';

//

var script = {

    name: 'Tabs',

    props: {
        name: { default: '' },
        scroll: { default: false },
        prefix: { default: 'tab-' }
    },

    data: function data() {
        return { is_scroll: this.scroll };
    },
    created: function created() {
        var hash = getHash();
        hash = this.isEncoded(hash) ? hash : encodeURIComponent(hash);
        pushHash(hash);
    },
    mounted: function mounted() {
        this.$nextTick(function () {
            this.setClickHandlers();

            this.handleHashWatchers();
        });
    },


    methods: {
        setClickHandlers: function setClickHandlers() {
            var _this = this;

            var self = this;

            var $links = this.$el.querySelectorAll('.tab > a');

            forEach($links, function (key, $elm) {
                var $elmHref = $elm.getAttribute('href').replace('#', '');

                var $content = document.getElementById($elmHref);

                self.addClass($content, 'tab-pane');
                self.addClass($content, 'fade');
            });

            var hashHandled = self.handleHash();

            forEach($links, function (key, $elm) {
                var $elmHref = $elm.getAttribute('href').replace('#', '');

                var $content = document.getElementById($elmHref);

                if (!hashHandled && self.hasClass($elm.parentNode, 'active')) {
                    _this.pushHash(self.prefix + $elmHref);
                    self.addClass($content, 'active');
                    self.addClass($content, 'in');
                }

                self.addListener($elm, 'click', function ($e) {
                    $e.preventDefault();

                    if (self.hasClass(this.parentNode, 'active')) return;

                    var href = this.getAttribute('href');

                    self.pushHash(self.prefix + href.replace('#', ''));
                });
            });
        },
        handleHashWatchers: function handleHashWatchers() {
            var self = this;

            window.addEventListener('hashchange', function () {
                self.handleHash();
            });
        },
        handleHash: function handleHash() {
            var self = this;

            var hash_applied = false;

            var hash = decodeURIComponent(getHash());

            hash = hash.split('/');

            forEach(hash, function (key, v) {
                if (v.indexOf(self.prefix) !== 0) return true;

                var id = v.replace(self.prefix, '');

                if (!id) return true;

                var link = self.$el.querySelector('.tab > a[href=\'#' + id + '\']');

                if (link === null) return true;

                forEach(self.$el.querySelectorAll('.tab'), function (k, $e) {
                    self.removeClass($e, 'active');

                    var selectedPanel = document.getElementById($e.querySelector('a').getAttribute('href').replace('#', ''));

                    self.removeClass(selectedPanel, 'in');
                    self.removeClass(selectedPanel, 'active');
                });

                self.addClass(link.parentNode, 'active');

                self.$bus.$emit('tabs-' + self.name, id);
                self.$emit('current-tab', id);

                var $panelEl = document.getElementById(id);

                self.addClass($panelEl, 'active');
                $panelEl.offsetWidth; // reflow need for CSS transitions to be triggered
                self.scrollToId(id);
                self.addClass($panelEl, 'in');

                window.dispatchEvent(new Event('resize'));

                hash_applied = true;
            });

            return hash_applied;
        },
        pushHash: function pushHash$1(link) {
            var _this2 = this;

            var hash = decodeURIComponent(getHash());

            hash = hash.split('/');

            var newHash = [];

            forEach(hash, function (key, v) {
                if (v.indexOf(_this2.prefix) >= 0) return true;
                newHash.push(v);
            });

            newHash.push(link);

            pushHash(encodeURIComponent(newHash.join('/')));
        },
        hasClass: function hasClass(target, className) {
            return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
        },
        addClass: function addClass(target, className) {
            if (this.hasClass(target, className)) return;

            target.className += ' ' + className;
        },
        removeClass: function removeClass(target, className) {
            if (!this.hasClass(target, className)) return;

            target.className = target.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), '');
        },
        addListener: function addListener(element, eventName, handler) {
            element.addEventListener(eventName, handler, false);
        },
        scrollToId: function scrollToId(id) {
            if (!this.is_scroll) return;

            document.getElementById(id).scrollIntoView({
                behavior: 'smooth'
            });
        },
        isEncoded: function isEncoded(uri) {
            // eslint-disable-next-line
            uri = uri || '';

            return uri !== decodeURIComponent(uri);
        }
    }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function __vue_render__() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ul', { staticClass: "nav nav-tabs" }, [_vm._t("default")], 2);
};
var __vue_staticRenderFns__ = [];

/* style */
var __vue_inject_styles__ = undefined;
/* scoped */
var __vue_scope_id__ = undefined;
/* module identifier */
var __vue_module_identifier__ = undefined;
/* functional template */
var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

var Tabs = normalizeComponent_1({ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, undefined, undefined);

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component(Tabs.name, Tabs);
}

// Create module definition for Vue.use()
var plugin = {
  install: install

  // To auto-install when vue is found
  /* global window global */
};var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
Tabs.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default Tabs;
