/**
 * Accessibility behaviour for the GREEN TALENT theme.
 *
 * Loaded after app.js so it can wrap behaviour that already exists there.
 * Each section names the checklist item / WCAG success criterion it satisfies.
 *
 * Depends on jQuery (already loaded by the layout) but keeps to plain DOM APIs
 * wherever jQuery buys nothing, so the file stays readable.
 */
(function (window, document) {
    'use strict';

    var FOCUSABLE = [
        'a[href]',
        'area[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'iframe',
        'audio[controls]',
        'video[controls]',
        'summary',
        '[contenteditable]:not([contenteditable="false"])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function isVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function focusableWithin(root) {
        if (!root) return [];
        return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (el) {
            return isVisible(el) && !el.closest('[aria-hidden="true"], [hidden]');
        });
    }

    function focusFirst(root, preferred) {
        var target = preferred && isVisible(preferred) ? preferred : focusableWithin(root)[0];
        if (!target) {
            // Nothing focusable inside - make the container itself the target so
            // focus still lands in the overlay rather than staying behind it.
            root.setAttribute('tabindex', '-1');
            target = root;
        }
        target.focus();
        return target;
    }

    // -------------------------------------------------------------------------
    // Styles for the elements this script creates.
    //
    // The theme stylesheets know nothing about these nodes, and unstyled they
    // are worse than absent - the live region would print its announcements
    // into the page and the skip link would sit visible above the header.
    // Nothing here restyles anything that exists in the original design.
    // -------------------------------------------------------------------------
    function ensureBaseStyles() {
        if (document.getElementById('a11y-base-styles')) return;
        var style = document.createElement('style');
        style.id = 'a11y-base-styles';
        style.textContent = "/* injected by a11y.js - styles only the elements this script creates */.skip-link{position:absolute;top:0;left:-9999px;z-index:10000;display:inline-block;padding:12px 20px;background:#182D10;color:#fff;font-weight:700;text-decoration:underline;border:2px solid #C3EB91;border-radius:0 0 8px 0}.skip-link:focus{left:0}.a11y-live-region{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.a11y-dialog-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:10500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(24,45,16,.75)}.a11y-dialog-backdrop[hidden]{display:none}.a11y-dialog{width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;background:#fff;color:#182D10}.a11y-dialog__actions{display:flex;flex-wrap:wrap;gap:12px}.a11y-error-summary{margin:0 0 18px;padding:2px 0 2px 12px;border-left:2px solid rgba(140,29,24,.55);background:none;border-radius:0;color:#8C1D18;font-size:14px;line-height:1.5}.a11y-error-summary:focus{outline:none}.a11y-error-summary ul{margin:0;padding:0;list-style:none}.a11y-error-summary li+li{margin-top:3px}.a11y-error-summary a{color:inherit;text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}.a11y-error-summary a:hover{text-decoration-color:transparent}.field-error-message{display:block;margin-top:6px;color:#8C1D18;font-size:14px;font-weight:600}.required-marker{color:#B3261E;font-weight:700}.form-required-note{font-size:14px}.field-hint{display:block;margin-top:4px;font-size:14px;color:#4A5A44}label.inputLabel{display:block}/* .container brings 58px of vertical padding into the overlay, pushing the field out of the navbar strip; the <1000px rule already drops it */.navbar #search .container{padding-top:0;padding-bottom:0}/* .navbar-nav is z-index:1000 (a flex item, so it applies at position:static) while #search is 4, so the nav painted over the overlay */.navbar #search{z-index:1010}/* login + forgot: keep the labels added above these inputs left aligned */.login_form_container .field.email,.login_form_container .field.password{align-items:flex-start}/* and re-centre the field icon on the input rather than on label+input */.login_form_container .field.email:after,.login_form_container .field.password:after{top:auto;bottom:23.5px;transform:translateY(50%)}/* buttons standing in for markup that was not a button: inherit everything from the element that used to carry the styling, and drop the UA chrome */.accordion_title .accordion-trigger,.a11y-text-button{display:block;width:100%;margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;font-family:inherit;font-size:inherit;font-weight:inherit;font-style:inherit;line-height:inherit;color:inherit;letter-spacing:inherit;word-spacing:inherit;text-transform:inherit;text-align:inherit;text-decoration:inherit;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none}.accordion_title .accordion-trigger::-moz-focus-inner{border:0;padding:0}";
        (document.head || document.documentElement).appendChild(style);
    }

    // -------------------------------------------------------------------------
    // 4.1.3 Status Messages - one shared polite region, one assertive
    // -------------------------------------------------------------------------
    var liveRegions = {};

    function ensureLiveRegions() {
        ['polite', 'assertive'].forEach(function (politeness) {
            var id = 'a11y-live-' + politeness;
            var el = document.getElementById(id);
            if (!el) {
                el = document.createElement('div');
                el.id = id;
                el.className = 'a11y-live-region';
                el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
                el.setAttribute('aria-live', politeness);
                el.setAttribute('aria-atomic', 'true');
                document.body.appendChild(el);
            }
            liveRegions[politeness] = el;
        });
    }

    function announce(message, politeness) {
        var region = liveRegions[politeness === 'assertive' ? 'assertive' : 'polite'];
        if (!region || !message) return;
        // Clearing first guarantees a re-announcement when the text is unchanged.
        region.textContent = '';
        window.setTimeout(function () {
            region.textContent = message;
        }, 60);
    }

    // -------------------------------------------------------------------------
    // 2.1.2 No Keyboard Trap + 2.4.3 Focus Order - overlay/modal manager
    //
    // Every page-blocking overlay on the site is registered here so it gets the
    // same four guarantees: focus moves in on open, Tab cycles inside, Escape
    // closes, focus returns to the trigger.
    // -------------------------------------------------------------------------
    var overlayStack = [];

    function currentOverlay() {
        return overlayStack[overlayStack.length - 1] || null;
    }

    function openOverlay(options) {
        var overlay = {
            root: options.root,
            close: options.close,
            returnFocusTo: options.returnFocusTo || document.activeElement,
            initialFocus: options.initialFocus || null
        };
        overlayStack.push(overlay);
        document.body.classList.add('a11y-overlay-open');
        // Deferred: the overlay is usually mid-animation when this runs. If it
        // was closed again in the meantime, do not yank focus into it.
        window.setTimeout(function () {
            if (overlayStack.indexOf(overlay) === -1) return;
            focusFirst(overlay.root, overlay.initialFocus);
        }, options.focusDelay || 0);
        return overlay;
    }

    function closeOverlay(root) {
        var index = -1;
        for (var i = overlayStack.length - 1; i >= 0; i--) {
            if (overlayStack[i].root === root) { index = i; break; }
        }
        if (index === -1) return;
        var overlay = overlayStack.splice(index, 1)[0];
        if (!overlayStack.length) document.body.classList.remove('a11y-overlay-open');
        var back = overlay.returnFocusTo;
        if (back && document.contains(back) && isVisible(back)) {
            back.focus();
        }
    }

    // Single global handler: Escape closes the topmost overlay, Tab is wrapped
    // inside it.
    document.addEventListener('keydown', function (event) {
        var overlay = currentOverlay();
        if (!overlay) return;

        if (event.key === 'Escape' || event.keyCode === 27) {
            event.preventDefault();
            if (typeof overlay.close === 'function') overlay.close();
            else closeOverlay(overlay.root);
            return;
        }

        if (event.key !== 'Tab' && event.keyCode !== 9) return;

        var items = focusableWithin(overlay.root);
        if (!items.length) {
            event.preventDefault();
            return;
        }
        var first = items[0];
        var last = items[items.length - 1];
        var active = document.activeElement;

        if (!overlay.root.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }, true);

    // -------------------------------------------------------------------------
    // 2.4.1 Bypass Blocks - skip link
    // -------------------------------------------------------------------------
    function initSkipLink() {
        var link = document.querySelector('.skip-link');
        if (!link) return;
        link.addEventListener('click', function (event) {
            var target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus();
            // Keep the hash out of the URL so back/forward stay meaningful.
            target.scrollIntoView({ block: 'start' });
        });
    }

    // -------------------------------------------------------------------------
    // Mobile menu - 4.1.2 Name, Role, Value (expanded/collapsed) and the
    // page-blocking-overlay rules.
    // -------------------------------------------------------------------------
    function initMobileMenu() {
        var toggle = document.getElementById('mobile-menu-toggle');
        var panel = document.querySelector('#menuToggle .navbar-nav');
        if (!toggle) return;
        if (panel && !panel.id) panel.id = 'menu';
        if (panel) toggle.setAttribute('aria-controls', panel.id);

        function setExpanded(expanded) {
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggle.setAttribute(
                'aria-label',
                expanded ? 'Close main menu' : 'Open main menu'
            );
            if (!panel) return;
            if (expanded) {
                panel.removeAttribute('aria-hidden');
                openOverlay({
                    root: panel,
                    returnFocusTo: toggle,
                    focusDelay: 450, // the slide animation in app.js runs 400ms
                    close: function () { toggle.checked = false; closeAndSync(); }
                });
            } else {
                panel.setAttribute('aria-hidden', 'true');
                closeOverlay(panel);
            }
        }

        function closeAndSync() {
            // app.js listens for `change`, so fire it rather than duplicating the
            // slide-out logic here.
            var evt;
            try {
                evt = new Event('change', { bubbles: true });
            } catch (e) {
                evt = document.createEvent('Event');
                evt.initEvent('change', true, true);
            }
            toggle.dispatchEvent(evt);
            setExpanded(false);
        }

        toggle.addEventListener('change', function () {
            setExpanded(toggle.checked);
        });

        // The control is an <input type="checkbox"> styled as a hamburger.
        // role="button" is set in the markup, so Enter has to work too - Space
        // already toggles a checkbox natively.
        toggle.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
                toggle.checked = !toggle.checked;
                closeAndSyncOrOpen();
            }
        });

        function closeAndSyncOrOpen() {
            var evt;
            try {
                evt = new Event('change', { bubbles: true });
            } catch (e) {
                evt = document.createEvent('Event');
                evt.initEvent('change', true, true);
            }
            toggle.dispatchEvent(evt);
        }

        setExpanded(toggle.checked);
    }

    // -------------------------------------------------------------------------
    // Search overlay - covers the viewport, so it follows the overlay rules.
    // -------------------------------------------------------------------------
    function initSearchOverlay() {
        var panel = document.getElementById('search');
        var trigger = document.querySelector('.navbar .search-btn');
        if (!panel) return;

        var closeBtn = panel.querySelector('.close-search');
        var input = panel.querySelector('#search-input');

        function markOpen(openerEl) {
            panel.removeAttribute('aria-hidden');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            openOverlay({
                root: panel,
                returnFocusTo: openerEl || trigger,
                initialFocus: input,
                close: function () { window.hideSearchForm(); }
            });
        }

        function markClosed() {
            panel.setAttribute('aria-hidden', 'true');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            closeOverlay(panel);
        }

        // app.js owns the show/hide; wrap it so state and focus stay in sync
        // however it is called (navbar button, the mobile menu entry, …).
        var originalShow = window.showSearchForm;
        var originalHide = window.hideSearchForm;

        window.showSearchForm = function () {
            var opener = document.activeElement;
            if (typeof originalShow === 'function') originalShow.apply(this, arguments);
            // showSearchForm() is a toggle - only claim the overlay if it opened.
            if (panel.style.display !== 'none' && isVisible(panel)) markOpen(opener);
            else markClosed();
        };

        window.hideSearchForm = function () {
            if (typeof originalHide === 'function') originalHide.apply(this, arguments);
            markClosed();
        };

        if (closeBtn) {
            closeBtn.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ' || event.keyCode === 13 || event.keyCode === 32) {
                    event.preventDefault();
                    window.hideSearchForm();
                }
            });
        }

        markClosed();
    }

    // -------------------------------------------------------------------------
    // Navigation dropdowns - roles, expanded state, arrow keys, Escape.
    // CSS opens them on :hover; this adds the keyboard half.
    // -------------------------------------------------------------------------
    function initDropdowns() {
        var dropdowns = document.querySelectorAll('.navbar .nav-item.dropdown, #menuToggle .nav-item.dropdown');

        Array.prototype.forEach.call(dropdowns, function (item, index) {
            var trigger = item.querySelector(':scope > a');
            var menu = item.querySelector(':scope > .dropdown-menu');
            if (!trigger || !menu) return;

            if (!menu.id) menu.id = 'nav-dropdown-' + index;
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-controls', menu.id);

            var links = Array.prototype.slice.call(menu.querySelectorAll('a'));

            // Set while Escape is closing the menu: without it the trigger.focus()
            // below bubbles a focusin back into the group and reopens it.
            var dismissed = false;

            function open() {
                if (dismissed) return;
                item.classList.add('is-open');
                menu.style.display = 'block';
                trigger.setAttribute('aria-expanded', 'true');
            }

            function close(returnFocus) {
                item.classList.remove('is-open');
                menu.style.display = '';
                trigger.setAttribute('aria-expanded', 'false');
                if (returnFocus) {
                    dismissed = true;
                    trigger.focus();
                    // Released once the focus events have settled, so the next
                    // deliberate ArrowDown still opens the menu.
                    window.setTimeout(function () { dismissed = false; }, 0);
                }
            }

            trigger.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowDown' || event.keyCode === 40) {
                    event.preventDefault();
                    open();
                    if (links[0]) links[0].focus();
                } else if (event.key === 'ArrowUp' || event.keyCode === 38) {
                    event.preventDefault();
                    open();
                    if (links.length) links[links.length - 1].focus();
                } else if (event.key === 'Escape' || event.keyCode === 27) {
                    close(false);
                }
            });

            menu.addEventListener('keydown', function (event) {
                var pos = links.indexOf(document.activeElement);
                if (event.key === 'ArrowDown' || event.keyCode === 40) {
                    event.preventDefault();
                    (links[pos + 1] || links[0]).focus();
                } else if (event.key === 'ArrowUp' || event.keyCode === 38) {
                    event.preventDefault();
                    (links[pos - 1] || links[links.length - 1]).focus();
                } else if (event.key === 'Home') {
                    event.preventDefault();
                    links[0].focus();
                } else if (event.key === 'End') {
                    event.preventDefault();
                    links[links.length - 1].focus();
                } else if (event.key === 'Escape' || event.keyCode === 27) {
                    event.preventDefault();
                    close(true);
                }
            });

            // Keep the visual state honest when focus moves through the group
            // with plain Tab - and never trap it there.
            item.addEventListener('focusin', open);
            item.addEventListener('focusout', function () {
                window.setTimeout(function () {
                    if (!item.contains(document.activeElement)) close(false);
                }, 0);
            });
        });
    }

    // -------------------------------------------------------------------------
    // Tabs - 4.1.2 role/state plus the APG keyboard pattern.
    // app.js owns show/hide; this owns roving tabindex and ARIA state.
    // -------------------------------------------------------------------------
    function initTabs() {
        var lists = document.querySelectorAll('[role="tablist"]');

        Array.prototype.forEach.call(lists, function (list) {
            var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
            if (!tabs.length) return;
            // Called again on window load, once slick/app.js have settled - do
            // not stack a second set of listeners on the same tabs.
            if (list.dataset.a11yTabs === 'ready') return;
            list.dataset.a11yTabs = 'ready';

            function panelFor(tab) {
                var id = tab.getAttribute('aria-controls') ||
                    (tab.getAttribute('href') || '').replace('#', '');
                return id ? document.getElementById(id) : null;
            }

            function select(tab, moveFocus) {
                tabs.forEach(function (t) {
                    var selected = t === tab;
                    t.setAttribute('aria-selected', selected ? 'true' : 'false');
                    t.setAttribute('tabindex', selected ? '0' : '-1');
                    var panel = panelFor(t);
                    if (panel) {
                        // aria-hidden only - app.js animates display itself and
                        // fighting it here would break the fade.
                        if (selected) panel.removeAttribute('aria-hidden');
                        else panel.setAttribute('aria-hidden', 'true');
                    }
                });
                if (moveFocus) tab.focus();
                announce((tab.textContent || '').trim() + ' tab selected');
            }

            tabs.forEach(function (tab, index) {
                var panel = panelFor(tab);
                if (panel) {
                    if (!panel.getAttribute('role')) panel.setAttribute('role', 'tabpanel');
                    if (!tab.id) tab.id = (list.id || 'tablist') + '-tab-' + index;
                    if (!panel.getAttribute('aria-labelledby')) {
                        panel.setAttribute('aria-labelledby', tab.id);
                    }
                    if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '0');
                    if (!tab.getAttribute('aria-controls')) {
                        tab.setAttribute('aria-controls', panel.id);
                    }
                }
                if (!tab.hasAttribute('tabindex')) {
                    tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
                }

                tab.addEventListener('keydown', function (event) {
                    var next = null;
                    switch (event.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            next = tabs[index + 1] || tabs[0];
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            next = tabs[index - 1] || tabs[tabs.length - 1];
                            break;
                        case 'Home':
                            next = tabs[0];
                            break;
                        case 'End':
                            next = tabs[tabs.length - 1];
                            break;
                        case 'Enter':
                        case ' ':
                            event.preventDefault();
                            tab.click();
                            select(tab, false);
                            return;
                        default:
                            return;
                    }
                    event.preventDefault();
                    next.click();
                    select(next, true);
                });

                tab.addEventListener('click', function () { select(tab, false); });
            });

            // Sync with whatever app.js decided was active on load.
            var initial = tabs.filter(function (t) {
                return t.classList.contains('active') || t.getAttribute('aria-selected') === 'true';
            })[0] || tabs[0];
            select(initial, false);
        });
    }

    // -------------------------------------------------------------------------
    // Accordions - Enter/Space, aria-expanded, aria-hidden on the panel.
    // -------------------------------------------------------------------------
    function initAccordions() {
        // Two shapes exist in the codebase: the work-packages one, where the
        // trigger is a real <button> inside the heading, and the internal
        // repository / sent-messages one, where a plain div or <h3> is wired up
        // with a click handler and nothing else. Upgrade the second shape and
        // keep the state honest for both.
        var toggles = document.querySelectorAll('.accordion-toggle');

        Array.prototype.forEach.call(toggles, function (toggle, index) {
            var nativeTrigger = toggle.querySelector('.accordion-trigger');
            var panel = null;
            var controlsId = (nativeTrigger || toggle).getAttribute('aria-controls');

            if (controlsId) {
                panel = document.getElementById(controlsId);
            } else {
                panel = toggle.nextElementSibling;
                if (panel && !panel.classList.contains('accordion-content')) {
                    panel = toggle.querySelector('.accordion-content');
                }
            }

            var control = nativeTrigger;
            if (!control) {
                // No native control - give the clickable element button
                // semantics so it is reachable and operable from the keyboard.
                control = toggle;
                if (!control.getAttribute('role')) control.setAttribute('role', 'button');
                if (!control.hasAttribute('tabindex')) control.setAttribute('tabindex', '0');

                control.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.key === ' ' ||
                        event.keyCode === 13 || event.keyCode === 32) {
                        event.preventDefault();
                        control.click();
                    }
                });
            }

            if (panel) {
                if (!panel.id) panel.id = 'accordion-panel-' + index;
                control.setAttribute('aria-controls', panel.id);
                if (!panel.getAttribute('role')) panel.setAttribute('role', 'region');
                if (!control.id) control.id = 'accordion-trigger-' + index;
                if (!panel.getAttribute('aria-labelledby')) {
                    panel.setAttribute('aria-labelledby', control.id);
                }
            }

            var startsOpen = panel ? isVisible(panel) : false;
            control.setAttribute('aria-expanded', startsOpen ? 'true' : 'false');

            toggle.addEventListener('click', function (event) {
                if (event.target.closest('.accordion-content')) return;
                // The existing handlers animate with slideUp/slideDown, so read
                // the result once the animation has settled.
                window.setTimeout(function () {
                    var expanded = panel
                        ? isVisible(panel)
                        : control.getAttribute('aria-expanded') !== 'true';
                    control.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                    announce(expanded ? 'Section expanded' : 'Section collapsed');
                }, 350);
            });
        });
    }

    // -------------------------------------------------------------------------
    // 3.3.1 / 3.3.2 / 4.1.3 - forms
    // -------------------------------------------------------------------------
    function labelTextFor(field) {
        var id = field.id;
        var label = id ? document.querySelector('label[for="' + id + '"]') : null;
        if (!label) label = field.closest('label');
        if (!label) {
            // The reporting forms use a sibling <div class="inputLabel">.
            var wrapper = field.closest('.field');
            var sibling = wrapper && wrapper.previousElementSibling;
            if (sibling && sibling.classList.contains('inputLabel')) label = sibling;
        }
        var text = label ? label.textContent : (field.getAttribute('aria-label') || field.name || 'This field');
        return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Wires a form up so a failed submit is perceivable without sight:
     * an error summary is inserted, focus moves to it, and each field is
     * flagged with aria-invalid + aria-describedby.
     */
    function renderErrorSummary(form, errors) {
        var summaryId = 'a11y-error-summary';
        var existing = form.querySelector('.a11y-error-summary');
        if (existing) existing.parentNode.removeChild(existing);

        Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid="true"]'), function (f) {
            f.removeAttribute('aria-invalid');
            var msgId = f.id ? f.id + '-error' : null;
            var msg = msgId ? document.getElementById(msgId) : null;
            if (msg) msg.parentNode.removeChild(msg);
        });

        var entries = Object.keys(errors || {});
        if (!entries.length) return null;

        var summary = document.createElement('div');
        summary.className = 'a11y-error-summary';
        summary.id = summaryId;
        summary.setAttribute('role', 'alert');
        summary.setAttribute('tabindex', '-1');
        // No visible heading - the list speaks for itself. The count still
        // reaches assistive tech as the alert's accessible name, so focusing
        // the block announces what it is before reading the entries.
        summary.setAttribute(
            'aria-label',
            entries.length === 1
                ? 'There is 1 problem with your submission'
                : 'There are ' + entries.length + ' problems with your submission'
        );

        var list = document.createElement('ul');

        entries.forEach(function (name) {
            var messages = [].concat(errors[name]);
            // Field names like "interest[]" are not valid inside an id selector,
            // and October sends dotted names for nested rules.
            var field = null;
            try {
                field = form.querySelector('[name="' + name.replace(/"/g, '\\"') + '"]') ||
                    document.getElementById(name);
            } catch (e) {
                field = null;
            }
            var text = messages[0];

            var li = document.createElement('li');
            if (field) {
                if (!field.id) field.id = 'field-' + name.replace(/[^\w-]/g, '-');
                var link = document.createElement('a');
                link.href = '#' + field.id;
                link.textContent = text;
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    field.focus();
                });
                li.appendChild(link);

                field.setAttribute('aria-invalid', 'true');
                var msgId = field.id + '-error';
                var msg = document.createElement('span');
                msg.className = 'field-error-message';
                msg.id = msgId;
                msg.textContent = text;
                (field.parentNode || form).appendChild(msg);
                var describedBy = (field.getAttribute('aria-describedby') || '')
                    .split(/\s+/).filter(Boolean);
                if (describedBy.indexOf(msgId) === -1) describedBy.push(msgId);
                field.setAttribute('aria-describedby', describedBy.join(' '));
            } else {
                li.textContent = text;
            }
            list.appendChild(li);
        });

        summary.appendChild(list);
        form.insertBefore(summary, form.firstChild);
        // The role="alert" announces the text; the focus move gives keyboard and
        // screen-magnifier users somewhere to continue from.
        window.setTimeout(function () { summary.focus(); }, 100);
        return summary;
    }

    function initForms() {
        var forms = document.querySelectorAll('form');

        Array.prototype.forEach.call(forms, function (form) {
            var fields = form.querySelectorAll('input, select, textarea');

            Array.prototype.forEach.call(fields, function (field) {
                if (field.type === 'hidden') return;

                // 3.3.2 - a required marker in the visible label has to reach the
                // accessibility tree as well.
                var wrapper = field.closest('.field') || field.parentElement;
                var labelEl = field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
                if (!labelEl && wrapper) {
                    var prev = wrapper.previousElementSibling;
                    if (prev && prev.classList.contains('inputLabel')) labelEl = prev;
                }
                var marksRequired = labelEl && /\*/.test(labelEl.textContent);
                if (marksRequired && !field.hasAttribute('aria-required')) {
                    field.setAttribute('aria-required', 'true');
                }

                // 1.3.5 - let the browser and password managers help.
                if (field.type === 'email' && !field.autocomplete) field.autocomplete = 'email';
                if (field.type === 'password' && !field.autocomplete) field.autocomplete = 'current-password';

                // 2.1.1 - date pickers must never block typing.
                if (field.classList.contains('DPText') || field.id.indexOf('datepicker') === 0 ||
                    field.classList.contains('hasDatepicker')) {
                    field.removeAttribute('readonly');
                    field.setAttribute('autocomplete', 'off');
                }
            });
        });

        if (!window.jQuery) return;
        var $ = window.jQuery;

        // October's AJAX framework fires this on a 406 validation response.
        $(document).on('ajaxValidation', 'form', function (event, context, errors) {
            renderErrorSummary(this, errors);
        });

        // Fallback for the handlers that flash a message instead of validating.
        $(document).on('ajaxError', 'form', function (event, context, message) {
            var form = this;
            var errors = (context && context.responseJSON && context.responseJSON.X_OCTOBER_ERROR_FIELDS) || null;
            if (errors) {
                renderErrorSummary(form, errors);
            } else if (message) {
                renderErrorSummary(form, { __form: [message] });
            }
        });

        $(document).on('ajaxSuccess', 'form', function () {
            var summary = this.querySelector('.a11y-error-summary');
            if (summary) summary.parentNode.removeChild(summary);
        });

        // Native (non-AJAX) validation.
        $(document).on('invalid', 'input, select, textarea', function (event) {
            var field = event.target;
            var form = field.form;
            if (!form || form.dataset.a11yNativeErrors === 'pending') return;
            form.dataset.a11yNativeErrors = 'pending';
            window.setTimeout(function () {
                var errors = {};
                Array.prototype.forEach.call(form.querySelectorAll(':invalid'), function (f) {
                    if (f.name) errors[f.name] = [labelTextFor(f) + ': ' + f.validationMessage];
                });
                renderErrorSummary(form, errors);
                delete form.dataset.a11yNativeErrors;
            }, 0);
        });
    }

    // -------------------------------------------------------------------------
    // 4.1.3 - announce AJAX-driven content swaps (filters, load more, toasts)
    // -------------------------------------------------------------------------
    function initDynamicUpdateAnnouncements() {
        if (!window.jQuery) return;
        var $ = window.jQuery;

        $(document).on('ajaxUpdate', function (event, context, data) {
            var target = event.target;
            if (!target || target.closest('.a11y-live-region')) return;
            var message = (data && data.a11y_message) ||
                target.getAttribute('data-a11y-update-message') ||
                'Content updated';
            announce(message);
        });

        $(document).on('ajaxErrorMessage', function (event, message) {
            if (message) announce(message, 'assertive');
        });

        $(document).on('ajaxFlashMessage', function (event, message) {
            if (message && message.text) announce(message.text, message.type === 'error' ? 'assertive' : 'polite');
        });
    }

    // -------------------------------------------------------------------------
    // 2.2.1 Timing Adjustable - session timeout warning
    //
    // Renders only for signed-in visitors; the layout supplies the lifetime.
    // -------------------------------------------------------------------------
    function initSessionTimeout() {
        var config = document.getElementById('a11y-session-config');
        if (!config) return;

        var lifetimeMinutes = parseInt(config.getAttribute('data-lifetime-minutes'), 10);
        if (!lifetimeMinutes || lifetimeMinutes < 2) return;

        var warnBeforeMs = Math.min(5, Math.max(1, Math.floor(lifetimeMinutes / 4))) * 60 * 1000;
        var lifetimeMs = lifetimeMinutes * 60 * 1000;
        var warnAtMs = lifetimeMs - warnBeforeMs;

        var backdrop = document.getElementById('a11y-session-dialog');
        if (!backdrop) return;
        var countdownEl = backdrop.querySelector('.a11y-dialog__countdown');
        var stayBtn = backdrop.querySelector('[data-session-stay]');
        var logoutBtn = backdrop.querySelector('[data-session-logout]');

        var warnTimer = null;
        var expiryTimer = null;
        var tickTimer = null;
        var remainingMs = 0;

        function formatRemaining(ms) {
            var total = Math.max(0, Math.round(ms / 1000));
            var mins = Math.floor(total / 60);
            var secs = total % 60;
            if (mins > 0) {
                return mins + ' minute' + (mins === 1 ? '' : 's') +
                    ' and ' + secs + ' second' + (secs === 1 ? '' : 's');
            }
            return secs + ' second' + (secs === 1 ? '' : 's');
        }

        function hideDialog() {
            if (backdrop.hasAttribute('hidden')) return;
            backdrop.setAttribute('hidden', '');
            closeOverlay(backdrop);
            window.clearInterval(tickTimer);
        }

        function showDialog() {
            remainingMs = warnBeforeMs;
            countdownEl.textContent = formatRemaining(remainingMs);
            backdrop.removeAttribute('hidden');
            openOverlay({
                root: backdrop,
                initialFocus: stayBtn,
                close: keepAlive
            });
            announce(
                'Your session is about to expire. You will be signed out in ' +
                formatRemaining(remainingMs) + '. Choose "Stay signed in" to continue.',
                'assertive'
            );

            tickTimer = window.setInterval(function () {
                remainingMs -= 1000;
                if (remainingMs <= 0) {
                    window.clearInterval(tickTimer);
                    return;
                }
                countdownEl.textContent = formatRemaining(remainingMs);
                // Re-announce sparingly so the countdown does not flood the
                // screen reader's queue.
                if (remainingMs === 60000 || remainingMs === 30000) {
                    announce(formatRemaining(remainingMs) + ' left before you are signed out', 'assertive');
                }
            }, 1000);
        }

        function schedule() {
            window.clearTimeout(warnTimer);
            window.clearTimeout(expiryTimer);
            warnTimer = window.setTimeout(showDialog, warnAtMs);
            expiryTimer = window.setTimeout(function () {
                hideDialog();
                window.location.href = config.getAttribute('data-timeout-redirect') || '/login';
            }, lifetimeMs);
        }

        function keepAlive() {
            hideDialog();
            schedule();
            // Any authenticated request re-stamps the session cookie.
            if (window.fetch) {
                window.fetch(window.location.pathname, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    cache: 'no-store'
                }).catch(function () { /* offline is not a reason to sign out */ });
            }
            announce('Your session has been extended.');
        }

        if (stayBtn) stayBtn.addEventListener('click', keepAlive);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                hideDialog();
                if (window.jQuery && window.jQuery.request) {
                    window.jQuery(document).request('onLogout', { data: { redirect: '/' } });
                } else {
                    window.location.href = '/';
                }
            });
        }

        // Real activity postpones the warning, so the dialog only ever appears
        // when the visitor really has gone idle. Throttled, because rescheduling
        // two timers on every keystroke is wasteful.
        var lastActivity = 0;
        function noteActivity() {
            if (!backdrop.hasAttribute('hidden')) return;
            var now = +new Date();
            if (now - lastActivity < 30000) return;
            lastActivity = now;
            schedule();
        }
        ['click', 'keydown', 'submit'].forEach(function (type) {
            document.addEventListener(type, noteActivity, true);
        });

        schedule();
    }

    // -------------------------------------------------------------------------
    // Safety nets for controls rendered from CMS content we do not author.
    // -------------------------------------------------------------------------
    function initAccessibleNameFallbacks() {
        // 4.1.2 - icon-only links/buttons whose only name is a title attribute.
        var candidates = document.querySelectorAll('a, button, [role="button"]');

        Array.prototype.forEach.call(candidates, function (el) {
            if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return;
            var text = (el.textContent || '').replace(/\s+/g, '').length;
            var img = el.querySelector('img[alt]:not([alt=""])');
            if (text || img) return;

            var title = el.getAttribute('title');
            if (title) {
                el.setAttribute('aria-label', title.trim());
            }
        });

        // 2.4.4 - flag links whose label carries no meaning on its own so the
        // surrounding heading supplies one.
        var vague = /^(click here|read more|more|learn more|here|link|download)$/i;
        Array.prototype.forEach.call(document.querySelectorAll('a'), function (link) {
            if (link.getAttribute('aria-label') || link.getAttribute('aria-labelledby')) return;
            var label = (link.textContent || '').replace(/\s+/g, ' ').trim();
            if (!vague.test(label)) return;

            var context = link.closest('article, .card, .entry_item, li, .row');
            var heading = context && context.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                var headingText = (heading.textContent || '').replace(/\s+/g, ' ').trim();
                if (headingText) link.setAttribute('aria-label', label + ': ' + headingText);
            }
        });

        // 3.2.5 - warn about the new window before it opens.
        Array.prototype.forEach.call(document.querySelectorAll('a[target="_blank"]'), function (link) {
            if (!link.getAttribute('rel')) link.setAttribute('rel', 'noopener noreferrer');
            var label = link.getAttribute('aria-label');
            if (label && /new (window|tab)/i.test(label)) return;
            if (label) {
                link.setAttribute('aria-label', label + ' (opens in new window)');
            } else if ((link.textContent || '').trim()) {
                var note = document.createElement('span');
                note.className = 'sr-only';
                note.textContent = ' (opens in new window)';
                link.appendChild(note);
            }
        });
    }

    // -------------------------------------------------------------------------
    // 2.1.1 Keyboard - elements that only respond to a mouse click
    //
    // The SVG maps hang onclick on <g>/<path>, and a few widgets do the same on
    // <p>/<div>. None of them are focusable or announced, so they are invisible
    // to keyboard and screen-reader users. Give them button semantics without
    // touching the (very large) generated SVG markup.
    // -------------------------------------------------------------------------
    var CLICK_ONLY_SELECTORS = [
        '[onclick]',
        '.dorsal',
        '.read-more[onclick]',
        '.news-image-hover',
        '[data-toggle="modal"]'
    ].join(',');

    var NATIVELY_FOCUSABLE = /^(a|button|input|select|textarea|summary)$/i;

    function initClickOnlyControls() {
        var candidates = document.querySelectorAll(CLICK_ONLY_SELECTORS);

        Array.prototype.forEach.call(candidates, function (el) {
            var tag = el.tagName;
            // <a href> and friends already work from the keyboard.
            if (NATIVELY_FOCUSABLE.test(tag) && !(tag.toLowerCase() === 'a' && !el.hasAttribute('href'))) {
                return;
            }
            if (el.hasAttribute('tabindex')) return;

            el.setAttribute('tabindex', '0');
            if (!el.getAttribute('role')) el.setAttribute('role', 'button');

            if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
                // The maps carry the country / site name in title=, which SVG
                // does not expose as an accessible name on its own.
                var name = el.getAttribute('title') ||
                    (el.textContent || '').replace(/s+/g, ' ').trim();
                if (name) el.setAttribute('aria-label', name);
            }

            el.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ' ||
                    event.keyCode === 13 || event.keyCode === 32) {
                    event.preventDefault();
                    el.click();
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // Bootstrap modals used by the internal repository.
    // -------------------------------------------------------------------------
    function initBootstrapModals() {
        if (!window.jQuery) return;
        var $ = window.jQuery;

        $(document).on('shown.bs.modal', '.modal', function () {
            var modal = this;
            if (!modal.getAttribute('role')) modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            var title = modal.querySelector('.modal-title');
            if (title) {
                if (!title.id) title.id = 'modal-title-' + Math.random().toString(36).slice(2, 8);
                modal.setAttribute('aria-labelledby', title.id);
            }
            var close = modal.querySelector('[data-dismiss="modal"]');
            if (close && !close.getAttribute('aria-label')) close.setAttribute('aria-label', 'Close dialog');

            openOverlay({
                root: modal,
                returnFocusTo: $(modal).data('a11yOpener') || document.activeElement,
                close: function () { $(modal).modal('hide'); }
            });
        });

        $(document).on('hidden.bs.modal', '.modal', function () {
            closeOverlay(this);
        });

        // Remember the trigger so focus can return to it.
        $(document).on('click', '[data-toggle="modal"]', function () {
            var target = $(this).attr('data-target') || $(this).attr('href');
            if (target) $(target).data('a11yOpener', this);
        });
    }

    // -------------------------------------------------------------------------
    // The home popup is opened by app.js; register it as an overlay so Tab is
    // contained and Escape is handled by the same code path as everything else.
    // -------------------------------------------------------------------------
    function initHomePopupTrap() {
        var popup = document.getElementById('homePopup');
        if (!popup || !window.MutationObserver) return;

        var observer = new MutationObserver(function () {
            var visible = popup.classList.contains('is-visible');
            var registered = overlayStack.some(function (o) { return o.root === popup; });
            if (visible && !registered) {
                openOverlay({
                    root: popup,
                    returnFocusTo: document.activeElement,
                    initialFocus: popup.querySelector('.home-popup-close'),
                    focusDelay: 520,
                    close: function () {
                        var closer = popup.querySelector('[data-home-popup-close]');
                        if (closer) closer.click();
                    }
                });
            } else if (!visible && registered) {
                closeOverlay(popup);
            }
        });

        observer.observe(popup, { attributes: true, attributeFilter: ['class'] });
    }

    // -------------------------------------------------------------------------
    // Guarded: a second DOMContentLoaded (or a page-transition library firing it
    // again) would stack duplicate listeners, and initSearchOverlay would wrap
    // its own wrapper around showSearchForm.
    var initialised = false;

    // Each feature is started in isolation. If one throws - a block commented
    // out mid-file, a widget that is not on this page - the rest still run,
    // rather than the whole script dying at the first error.
    function run(name, fn) {
        try {
            if (typeof fn === 'function') fn();
            else if (window.console) console.warn('[a11y] ' + name + ' is unavailable');
        } catch (e) {
            if (window.console) console.error('[a11y] ' + name + ' failed', e);
        }
    }

    function init() {
        if (initialised) return;
        initialised = true;

        run('baseStyles', typeof ensureBaseStyles === 'function' ? ensureBaseStyles : null);
        run('liveRegions', typeof ensureLiveRegions === 'function' ? ensureLiveRegions : null);
        run('skipLink', typeof initSkipLink === 'function' ? initSkipLink : null);
        run('mobileMenu', typeof initMobileMenu === 'function' ? initMobileMenu : null);
        run('searchOverlay', typeof initSearchOverlay === 'function' ? initSearchOverlay : null);
        run('dropdowns', typeof initDropdowns === 'function' ? initDropdowns : null);
        run('tabs', typeof initTabs === 'function' ? initTabs : null);
        run('accordions', typeof initAccordions === 'function' ? initAccordions : null);
        run('forms', typeof initForms === 'function' ? initForms : null);
        run('dynamicUpdates', typeof initDynamicUpdateAnnouncements === 'function' ? initDynamicUpdateAnnouncements : null);
        run('sessionTimeout', typeof initSessionTimeout === 'function' ? initSessionTimeout : null);
        run('clickOnlyControls', typeof initClickOnlyControls === 'function' ? initClickOnlyControls : null);
        run('bootstrapModals', typeof initBootstrapModals === 'function' ? initBootstrapModals : null);
        run('homePopupTrap', typeof initHomePopupTrap === 'function' ? initHomePopupTrap : null);
        run('accessibleNames', typeof initAccessibleNameFallbacks === 'function' ? initAccessibleNameFallbacks : null);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // app.js initialises its tabs inside $(document).ready, which may run after
    // ours - re-sync once the queue has drained.
    if (window.jQuery) {
        window.jQuery(window).on('load', function () {
            run('tabs(late)', typeof initTabs === 'function' ? initTabs : null);
        });
    }

    // Exposed so page-level scripts can reuse the plumbing.
    window.a11y = {
        announce: announce,
        openOverlay: openOverlay,
        closeOverlay: closeOverlay,
        focusableWithin: focusableWithin
    };
})(window, document);
