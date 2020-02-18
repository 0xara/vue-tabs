<template>
  <ul class="nav nav-tabs">
    <slot/>
  </ul>
</template>


<script>

import { getHash, pushHash } from 'js-helpers/dist/hash';
import { forEach } from 'js-helpers/dist/array/forEach';


export default {

    name: 'Tabs',

    props: {
        name: { default: '' },
        scroll: { default: false },
        prefix: { default: 'tab-' }
    },

    data() {
        return { is_scroll: this.scroll };
    },

    created() {
        let hash = getHash();
        hash = this.isEncoded(hash) ? hash : encodeURIComponent(hash);
        pushHash(hash);
    },

    mounted() {
        this.$nextTick(function () {
            this.setClickHandlers();

            this.handleHashWatchers();
        });
    },

    methods: {
        setClickHandlers() {
            const self = this;

            const $links = this.$el.querySelectorAll('.tab > a');

            forEach($links, (key, $elm) => {
                const $elmHref = $elm.getAttribute('href').replace('#', '');

                const $content = document.getElementById($elmHref);

                self.addClass($content, 'tab-pane');
                self.addClass($content, 'fade');
            });

            const hashHandled = self.handleHash();

            forEach($links, (key, $elm) => {
                const $elmHref = $elm.getAttribute('href').replace('#', '');

                const $content = document.getElementById($elmHref);

                if(!hashHandled && self.hasClass($elm.parentNode, 'active')) {
                    this.pushHash(self.prefix + $elmHref);
                    self.addClass($content, 'active');
                    self.addClass($content, 'in');
                }

                self.addListener($elm, 'click', function ($e) {
                    $e.preventDefault();

                    if(self.hasClass(this.parentNode, 'active')) return;

                    const href = this.getAttribute('href');

                    self.pushHash(self.prefix + href.replace('#', ''));
                });
            });
        },

        handleHashWatchers() {
            const self = this;

            window.addEventListener('hashchange', () => {
                self.handleHash();
            });
        },

        handleHash() {
            const self = this;

            let hash_applied = false;

            let hash = decodeURIComponent(getHash());

            hash = hash.split('/');

            forEach(hash, (key, v) => {
                if(v.indexOf(self.prefix) !== 0) return true;

                const id = v.replace(self.prefix, '');

                if(!id) return true;

                const link = self.$el.querySelector(`.tab > a[href='#${id}']`);

                if(link === null) return true;

                forEach(self.$el.querySelectorAll('.tab'), (k, $e) => {
                    self.removeClass($e, 'active');

                    const selectedPanel = document.getElementById($e.querySelector('a').getAttribute('href').replace('#', ''));

                    self.removeClass(selectedPanel, 'in');
                    self.removeClass(selectedPanel, 'active');
                });

                self.addClass(link.parentNode, 'active');

                self.$bus.$emit(`tabs-${self.name}`, id);
                self.$emit('current-tab', id);

                const $panelEl = document.getElementById(id);

                self.addClass($panelEl, 'active');
                $panelEl.offsetWidth; // reflow need for CSS transitions to be triggered
                self.scrollToId(id);
                self.addClass($panelEl, 'in');

                window.dispatchEvent(new CustomEvent('resize'));

                hash_applied = true;
            });

            return hash_applied;
        },

        pushHash(link) {
            let hash = decodeURIComponent(getHash());

            hash = hash.split('/');

            const newHash = [];

            forEach(hash, (key, v) => {
                if(v.indexOf(this.prefix) >= 0) return true;
                newHash.push(v);
            });

            newHash.push(link);

            pushHash(encodeURIComponent(newHash.join('/')));
        },

        hasClass(target, className) {
            return new RegExp(`(\\s|^)${className}(\\s|$)`).test(target.className);
        },

        addClass(target, className) {
            if(this.hasClass(target, className)) return;

            target.className += ` ${className}`;
        },

        removeClass(target, className) {
            if(!this.hasClass(target, className)) return;

            target.className = target.className.replace(new RegExp(`(\\s|^)${className}(\\s|$)`), '');
        },

        addListener(element, eventName, handler) {
            element.addEventListener(eventName, handler, false);
        },

        scrollToId(id) {
            if(!this.is_scroll) return;

            document.getElementById(id).scrollIntoView({
                behavior: 'smooth'
            });
        },

        isEncoded(uri) {
        // eslint-disable-next-line
        uri = uri || '';

            return uri !== decodeURIComponent(uri);
        }

    }

};

</script>
