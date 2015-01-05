/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';
  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================
  function transitionEnd() {
    var el = document.createElement('bootstrap');
    var transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
      };
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }
    return false;
  }
  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this;
    $(this).one($.support.transition.end, function () {
      called = true;
    });
    var callback = function () {
      if (!called)
        $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };
  $(function () {
    $.support.transition = transitionEnd();
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: affix.js v3.1.1
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';
  // AFFIX CLASS DEFINITION
  // ======================
  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);
    this.$window = $(window).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
    this.$element = $(element);
    this.affixed = this.unpin = this.pinnedOffset = null;
    this.checkPosition();
  };
  Affix.RESET = 'affix affix-top affix-bottom';
  Affix.DEFAULTS = { offset: 0 };
  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset)
      return this.pinnedOffset;
    this.$element.removeClass(Affix.RESET).addClass('affix');
    var scrollTop = this.$window.scrollTop();
    var position = this.$element.offset();
    return this.pinnedOffset = position.top - scrollTop;
  };
  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1);
  };
  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible'))
      return;
    var scrollHeight = $(document).height();
    var scrollTop = this.$window.scrollTop();
    var position = this.$element.offset();
    var offset = this.options.offset;
    var offsetTop = offset.top;
    var offsetBottom = offset.bottom;
    if (this.affixed == 'top')
      position.top += scrollTop;
    if (typeof offset != 'object')
      offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function')
      offsetTop = offset.top(this.$element);
    if (typeof offsetBottom == 'function')
      offsetBottom = offset.bottom(this.$element);
    var affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? 'bottom' : offsetTop != null && scrollTop <= offsetTop ? 'top' : false;
    if (this.affixed === affix)
      return;
    if (this.unpin)
      this.$element.css('top', '');
    var affixType = 'affix' + (affix ? '-' + affix : '');
    var e = $.Event(affixType + '.bs.affix');
    this.$element.trigger(e);
    if (e.isDefaultPrevented())
      return;
    this.affixed = affix;
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;
    this.$element.removeClass(Affix.RESET).addClass(affixType).trigger($.Event(affixType.replace('affix', 'affixed')));
    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() });
    }
  };
  // AFFIX PLUGIN DEFINITION
  // =======================
  var old = $.fn.affix;
  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.affix');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.affix', data = new Affix(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.affix.Constructor = Affix;
  // AFFIX NO CONFLICT
  // =================
  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  };
  // AFFIX DATA-API
  // ==============
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this);
      var data = $spy.data();
      data.offset = data.offset || {};
      if (data.offsetBottom)
        data.offset.bottom = data.offsetBottom;
      if (data.offsetTop)
        data.offset.top = data.offsetTop;
      $spy.affix(data);
    });
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: collapse.js v3.1.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';
  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================
  var Collapse = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.transitioning = null;
    if (this.options.parent)
      this.$parent = $(this.options.parent);
    if (this.options.toggle)
      this.toggle();
  };
  Collapse.DEFAULTS = { toggle: true };
  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width');
    return hasWidth ? 'width' : 'height';
  };
  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in'))
      return;
    var startEvent = $.Event('show.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented())
      return;
    var actives = this.$parent && this.$parent.find('> .panel > .in');
    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse');
      if (hasData && hasData.transitioning)
        return;
      actives.collapse('hide');
      hasData || actives.data('bs.collapse', null);
    }
    var dimension = this.dimension();
    this.$element.removeClass('collapse').addClass('collapsing')[dimension](0);
    this.transitioning = 1;
    var complete = function () {
      this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('auto');
      this.transitioning = 0;
      this.$element.trigger('shown.bs.collapse');
    };
    if (!$.support.transition)
      return complete.call(this);
    var scrollSize = $.camelCase([
        'scroll',
        dimension
      ].join('-'));
    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
  };
  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in'))
      return;
    var startEvent = $.Event('hide.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented())
      return;
    var dimension = this.dimension();
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
    this.$element.addClass('collapsing').removeClass('collapse').removeClass('in');
    this.transitioning = 1;
    var complete = function () {
      this.transitioning = 0;
      this.$element.trigger('hidden.bs.collapse').removeClass('collapsing').addClass('collapse');
    };
    if (!$.support.transition)
      return complete.call(this);
    this.$element[dimension](0).one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350);
  };
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']();
  };
  // COLLAPSE PLUGIN DEFINITION
  // ==========================
  var old = $.fn.collapse;
  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);
      if (!data && options.toggle && option == 'show')
        option = !option;
      if (!data)
        $this.data('bs.collapse', data = new Collapse(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.collapse.Constructor = Collapse;
  // COLLAPSE NO CONFLICT
  // ====================
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  };
  // COLLAPSE DATA-API
  // =================
  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href;
    var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
    //strip for ie7
    var $target = $(target);
    var data = $target.data('bs.collapse');
    var option = data ? 'toggle' : $this.data();
    var parent = $this.attr('data-parent');
    var $parent = parent && $(parent);
    if (!data || !data.transitioning) {
      if ($parent)
        $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed');
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed');
    }
    $target.collapse(option);
  });
}(jQuery);
/*! { "name": "vissense", "version": "0.2.0", "copyright": "(c) 2014 tbk" } */
!function (root, factory) {
  'use strict';
  'function' == typeof define && define.amd ? define([], function () {
    return factory(root, root.document);
  }) : 'object' == typeof exports ? module.exports = factory(root, root.document) : root.VisSense = factory(root, root.document);
}(this, function (window, document, undefined) {
  'use strict';
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var self = this, args = arguments;
      clearTimeout(timer), timer = setTimeout(function () {
        fn.apply(self, args);
      }, delay);
    };
  }
  function defaults(dest, source) {
    if (!isObject(dest))
      return source;
    for (var keys = Object.keys(source), i = 0, n = keys.length; n > i; i++) {
      var prop = keys[i];
      void 0 === dest[prop] && (dest[prop] = source[prop]);
    }
    return dest;
  }
  function defer(callback) {
    return window.setTimeout(function () {
      callback();
    }, 0);
  }
  function fireIf(when, callback) {
    return function () {
      return (isFunction(when) ? when() : when) ? callback() : undefined;
    };
  }
  function extend(dest, source, callback) {
    for (var index = -1, props = Object.keys(source), length = props.length, ask = isFunction(callback); ++index < length;) {
      var key = props[index];
      dest[key] = ask ? callback(dest[key], source[key], key, dest, source) : source[key];
    }
    return dest;
  }
  function identity(value) {
    return value;
  }
  function isDefined(value) {
    return value !== undefined;
  }
  function isArray(value) {
    return value && 'object' == typeof value && 'number' == typeof value.length && '[object Array]' === Object.prototype.toString.call(value) || !1;
  }
  function isElement(value) {
    return value && 1 === value.nodeType || !1;
  }
  function isFunction(value) {
    return 'function' == typeof value || !1;
  }
  function isObject(value) {
    var type = typeof value;
    return 'function' === type || value && 'object' === type || !1;
  }
  function noop() {
  }
  function now() {
    return new Date().getTime();
  }
  function viewport() {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    };
  }
  function isVisibleByOffsetParentCheck(element, computedStyle) {
    if (!element.offsetParent) {
      var position = styleProperty(computedStyle, 'position');
      if ('fixed' !== position)
        return !1;
    }
    return !0;
  }
  function computedStyle(element) {
    return isDefined(element.style) ? window.getComputedStyle(element, null) : null;
  }
  function styleProperty(style, property) {
    return style ? style.getPropertyValue(property) : undefined;
  }
  function isDisplayed(element, style) {
    if (!style && (style = computedStyle(element), !style))
      return !1;
    var display = styleProperty(style, 'display');
    if ('none' === display)
      return !1;
    var visibility = styleProperty(style, 'visibility');
    return 'hidden' === visibility || 'collapse' === visibility ? !1 : element.parentNode && element.parentNode.style ? isDisplayed(element.parentNode, computedStyle(element)) : !0;
  }
  function isVisibleByStyling(element) {
    if (element === document)
      return !0;
    if (!element || !element.parentNode)
      return !1;
    var style = computedStyle(element), displayed = isDisplayed(element, style);
    return displayed !== !0 ? !1 : isVisibleByOffsetParentCheck(element, style) ? !0 : !1;
  }
  function isInViewport(rect, viewport) {
    return !rect || rect.width <= 0 || rect.height <= 0 ? !1 : rect.bottom > 0 && rect.right > 0 && rect.top < viewport.height && rect.left < viewport.width;
  }
  function percentage(element) {
    if (!isPageVisible())
      return 0;
    var rect = element.getBoundingClientRect(), view = viewport();
    if (!isInViewport(rect, view) || !isVisibleByStyling(element))
      return 0;
    var vh = 0, vw = 0;
    return rect.top >= 0 ? vh = Math.min(rect.height, view.height - rect.top) : rect.bottom > 0 && (vh = Math.min(view.height, rect.bottom)), rect.left >= 0 ? vw = Math.min(rect.width, view.width - rect.left) : rect.right > 0 && (vw = Math.min(view.width, rect.right)), Math.round(vh * vw / (rect.height * rect.width) * 1000) / 1000;
  }
  function isPageVisible() {
    return VisibilityApi ? !document[VisibilityApi[0]] : !0;
  }
  function VisSense(element, config) {
    if (!(this instanceof VisSense))
      return new VisSense(element, config);
    if (!isElement(element))
      throw new Error('not an element node');
    this._element = element, this._config = defaults(config, {
      fullyvisible: 1,
      hidden: 0
    });
  }
  function newVisState(state, percentage, previous) {
    return previous && previous && delete previous.previous, function (state, percentage, previous) {
      return {
        code: state[0],
        state: state[1],
        percentage: percentage,
        previous: previous,
        fullyvisible: state[0] === STATES.FULLY_VISIBLE[0],
        visible: state[0] === STATES.VISIBLE[0] || state[0] === STATES.FULLY_VISIBLE[0],
        hidden: state[0] === STATES.HIDDEN[0]
      };
    }(state, percentage, previous);
  }
  function nextState(visobj, currentState) {
    var newState = visobj.state(), percentage = newState.percentage;
    return currentState && percentage === currentState.percentage && currentState.percentage === currentState.previous.percentage ? currentState : newState.hidden ? VisSense.VisState.hidden(percentage, currentState) : newState.fullyvisible ? VisSense.VisState.fullyvisible(percentage, currentState) : VisSense.VisState.visible(percentage, currentState);
  }
  function fireListeners(listeners, context) {
    for (var keys = Object.keys(listeners), i = 0, n = keys.length; n > i; i++)
      listeners[i].call(context || window);
  }
  function VisMon(visobj, inConfig) {
    var me = this, config = defaults(inConfig, { strategy: new VisMon.Strategy.NoopStrategy() }), strategies = isArray(config.strategy) ? config.strategy : [config.strategy];
    me._strategy = new VisMon.Strategy.CompositeStrategy(strategies), me._visobj = visobj, me._lastListenerId = -1, me._state = {}, me._listeners = {}, me._events = [
      'update',
      'hidden',
      'visible',
      'fullyvisible',
      'percentagechange',
      'visibilitychange'
    ];
    for (var i = 0, n = me._events.length; n > i; i++)
      config[me._events[i]] && me.on(me._events[i], config[me._events[i]]);
  }
  var VisibilityApi = function (undefined) {
      for (var event = 'visibilitychange', dict = [
            [
              'hidden',
              event
            ],
            [
              'mozHidden',
              'moz' + event
            ],
            [
              'webkitHidden',
              'webkit' + event
            ],
            [
              'msHidden',
              'ms' + event
            ]
          ], i = 0, n = dict.length; n > i; i++)
        if (document[dict[i][0]] !== undefined)
          return dict[i];
    }();
  VisSense.prototype.state = function () {
    var perc = percentage(this._element);
    return perc <= this._config.hidden ? VisSense.VisState.hidden(perc) : perc >= this._config.fullyvisible ? VisSense.VisState.fullyvisible(perc) : VisSense.VisState.visible(perc);
  }, VisSense.prototype.percentage = function () {
    return this.state().percentage;
  }, VisSense.prototype.isFullyVisible = function () {
    return this.state().fullyvisible;
  }, VisSense.prototype.isVisible = function () {
    return this.state().visible;
  }, VisSense.prototype.isHidden = function () {
    return this.state().hidden;
  }, VisSense.fn = VisSense.prototype, VisSense.of = function (element, config) {
    return new VisSense(element, config);
  };
  var STATES = {
      HIDDEN: [
        0,
        'hidden'
      ],
      VISIBLE: [
        1,
        'visible'
      ],
      FULLY_VISIBLE: [
        2,
        'fullyvisible'
      ]
    };
  return VisSense.VisState = {
    hidden: function (percentage, previous) {
      return newVisState(STATES.HIDDEN, percentage, previous || {});
    },
    visible: function (percentage, previous) {
      return newVisState(STATES.VISIBLE, percentage, previous || {});
    },
    fullyvisible: function (percentage, previous) {
      return newVisState(STATES.FULLY_VISIBLE, percentage, previous || {});
    }
  }, VisMon.prototype.visobj = function () {
    return this._visobj;
  }, VisMon.prototype.state = function () {
    return this._state;
  }, VisMon.prototype.start = function () {
    return this._strategy.start(this), this;
  }, VisMon.prototype.stop = function () {
    return this._strategy.stop(this);
  }, VisMon.prototype.use = function (strategy) {
    return this.stop(), this._strategy = strategy, this.start();
  }, VisMon.prototype.update = function () {
    this._state = nextState(this._visobj, this._state), fireListeners(this._listeners, this);
  }, VisMon.prototype.onUpdate = function (callback) {
    return isFunction(callback) ? (this._lastListenerId += 1, this._listeners[this._lastListenerId] = callback.bind(undefined, this), this._lastListenerId) : -1;
  }, VisMon.prototype.onVisibilityChange = function (callback) {
    var me = this;
    return this.onUpdate(function () {
      me._state.code !== me._state.previous.code && callback(me);
    });
  }, VisMon.prototype.onPercentageChange = function (callback) {
    var me = this;
    return this.onUpdate(function () {
      var newValue = me._state.percentage, oldValue = me._state.previous.percentage;
      newValue !== oldValue && callback(newValue, oldValue, me);
    });
  }, VisMon.prototype.onVisible = function (callback) {
    var me = this;
    return me.onVisibilityChange(fireIf(function () {
      return me._state.visible && !me._state.previous.visible;
    }, callback));
  }, VisMon.prototype.onFullyVisible = function (callback) {
    var me = this;
    return me.onVisibilityChange(fireIf(function () {
      return me._state.fullyvisible;
    }, callback));
  }, VisMon.prototype.onHidden = function (callback) {
    var me = this;
    return me.onVisibilityChange(fireIf(function () {
      return me._state.hidden;
    }, callback));
  }, VisMon.prototype.on = function (eventName, callback) {
    var me = this;
    switch (eventName) {
    case 'update':
      return me.onUpdate(callback);
    case 'hidden':
      return me.onHidden(callback);
    case 'visible':
      return me.onVisible(callback);
    case 'fullyvisible':
      return me.onFullyVisible(callback);
    case 'percentagechange':
      return me.onPercentageChange(callback);
    case 'visibilitychange':
      return me.onVisibilityChange(callback);
    }
    return -1;
  }, VisMon.Strategy = function () {
  }, VisMon.Strategy.prototype.start = function () {
    throw new Error('Strategy#start needs to be overridden.');
  }, VisMon.Strategy.prototype.stop = function () {
    throw new Error('Strategy#stop needs to be overridden.');
  }, VisMon.Strategy.NoopStrategy = function () {
  }, VisMon.Strategy.NoopStrategy.prototype = Object.create(VisMon.Strategy.prototype), VisMon.Strategy.NoopStrategy.prototype.start = function (monitor) {
    monitor.update();
  }, VisMon.Strategy.NoopStrategy.prototype.stop = function () {
  }, VisMon.Strategy.CompositeStrategy = function (strategies) {
    this._strategies = isArray(strategies) ? strategies : [], this._started = !1;
  }, VisMon.Strategy.CompositeStrategy.prototype = Object.create(VisMon.Strategy.prototype), VisMon.Strategy.CompositeStrategy.prototype.start = function (monitor) {
    for (var i = 0, n = this._strategies.length; n > i; i++)
      this._strategies[i].start(monitor);
  }, VisMon.Strategy.CompositeStrategy.prototype.stop = function (monitor) {
    for (var i = 0, n = this._strategies.length; n > i; i++)
      this._strategies[i].stop(monitor);
  }, VisMon.Strategy.PollingStrategy = function (config) {
    this._config = defaults(config, { interval: 1000 }), this._started = !1;
  }, VisMon.Strategy.PollingStrategy.prototype = Object.create(VisMon.Strategy.prototype), VisMon.Strategy.PollingStrategy.prototype.start = function (monitor) {
    var me = this;
    return me._started || (me._update = function () {
      monitor.update();
    }, addEventListener('visibilitychange', me._update), function update() {
      monitor.update(), me._timeoutId = setTimeout(update, me._config.interval);
    }(), me._started = !0), me._started;
  }, VisMon.Strategy.PollingStrategy.prototype.stop = function () {
    var me = this;
    return me._started ? (clearTimeout(me._timeoutId), removeEventListener('visibilitychange', me._update), me._started = !1, !0) : !1;
  }, VisMon.Strategy.EventStrategy = function (config) {
    this._config = defaults(config, { debounce: 30 }), this._started = !1;
  }, VisMon.Strategy.EventStrategy.prototype = Object.create(VisMon.Strategy.prototype), VisMon.Strategy.EventStrategy.prototype.start = function (monitor) {
    var me = this;
    return me._started || (me._update = debounce(function () {
      monitor.update();
    }, me._config.debounce), addEventListener('visibilitychange', me._update), addEventListener('scroll', me._update), addEventListener('resize', me._update), me._update(), me._started = !0), this._started;
  }, VisMon.Strategy.EventStrategy.prototype.stop = function () {
    var me = this;
    return me._started ? (removeEventListener('resize', me._update), removeEventListener('scroll', me._update), removeEventListener('visibilitychange', me._update), me._started = !1, !0) : !1;
  }, VisSense.VisMon = VisMon, VisSense.fn.monitor = function (config) {
    return new VisMon(this, config);
  }, VisSense.Utils = {
    debounce: debounce,
    defaults: defaults,
    defer: defer,
    extend: extend,
    fireIf: fireIf,
    identity: identity,
    isArray: isArray,
    isDefined: isDefined,
    isElement: isElement,
    isFunction: isFunction,
    isObject: isObject,
    isPageVisible: isPageVisible,
    isVisibleByStyling: isVisibleByStyling,
    noop: noop,
    now: now,
    percentage: percentage,
    _viewport: viewport,
    _isInViewport: isInViewport,
    _isDisplayed: isDisplayed,
    _computedStyle: computedStyle,
    _styleProperty: styleProperty
  }, VisSense;
});
/*! { "name": "vissense-metrics", "version": "0.0.1-rc1", "copyright": "(c) 2015 tbk" } */
!function (a) {
  'use strict';
  !function (a) {
    Date.now || (Date.now = function () {
      return new Date().getTime();
    }), a.performance || (a.performance = a.performance || {}, a.performance.now = a.performance.now || a.performance.mozNow || a.performance.msNow || a.performance.oNow || a.performance.webkitNow || Date.now);
  }(a);
  var b = function () {
      function a(b) {
        return this instanceof a ? ((+b !== b || 0 > b) && (b = 0), void (this._$ = { i: b })) : new a(b);
      }
      var b = Math.pow(2, 32), c = function (a) {
          return +a !== a ? 1 : +a;
        };
      return a.MAX_VALUE = b, a.prototype.inc = function (a) {
        return this.set(this.get() + c(a)), this.get();
      }, a.prototype.dec = function (a) {
        return this.inc(-1 * c(a));
      }, a.prototype.clear = function () {
        var a = this._$.i;
        return this._$.i = 0, a;
      }, a.prototype.get = function () {
        return this._$.i;
      }, a.prototype.set = function (a) {
        return this._$.i = c(a), this._$.i < 0 ? this._$.i = 0 : this._$.i > b && (this._$.i -= b), this.get();
      }, a;
    }(), c = function () {
      function b(a) {
        return this instanceof b ? (this._config = a || {}, this._config.performance = this._config.performance === !0, void (this._$ = {
          ts: 0,
          te: 0,
          r: !1
        })) : new b(a);
      }
      var c = function (b) {
          return b ? a.performance.now() : Date.now();
        }, d = function (a, b) {
          return +a === a ? +a : b;
        };
      return b.prototype._orNow = function (a) {
        return d(a, c(this._config.performance));
      }, b.prototype.startIf = function (a, b) {
        return a && (this._$.r = !0, this._$.ts = this._orNow(b), this._$.te = null), this;
      }, b.prototype.start = function (a) {
        return this.startIf(!this._$.r, a);
      }, b.prototype.restart = function (a) {
        return this.startIf(!0, a);
      }, b.prototype.stop = function (a) {
        return this.stopIf(!0, a);
      }, b.prototype.stopIf = function (a, b) {
        return this._$.r && a && (this._$.te = this._orNow(b), this._$.r = !1), this;
      }, b.prototype.interim = function (a) {
        return this._$.r ? this._orNow(a) - this._$.ts : 0;
      }, b.prototype.get = function (a) {
        return this._$.te ? this._$.te - this._$.ts : this.time(a);
      }, b.prototype.running = function () {
        return this._$.r;
      }, b.prototype.getAndRestartIf = function (a, b) {
        var c = this.get(b);
        return a && this.restart(b), c;
      }, b.prototype.forceStart = b.prototype.restart, b.prototype.time = b.prototype.interim, b;
    }();
  a.CountOnMe = {
    counter: b,
    stopwatch: c
  };
}(window), function (a, b, c, d) {
  'use strict';
  function e(a, b) {
    a > 0 && b(a);
  }
  function f() {
    this.metrics = {}, this.addMetric = function (a, b) {
      this.metrics[a] = b;
    }, this.getMetric = function (a) {
      return this.metrics[a];
    };
  }
  function g(a) {
    function b(a) {
      var b = a.state(), c = b.percentage;
      i.getMetric('percentage').set(c), c < i.getMetric('percentage.min').get() && i.getMetric('percentage.min').set(c), c > i.getMetric('percentage.max').get() && i.getMetric('percentage.max').set(c);
    }
    function c(a) {
      var b = a.state();
      e(m.get(), function (a) {
        i.getMetric('time.duration').set(a);
      }), e(l.running() ? l.stop().get() : -1, function (a) {
        i.getMetric('time.hidden').inc(a);
      }), e(j.running() ? j.stop().get() : -1, function (a) {
        i.getMetric('time.visible').inc(a), i.getMetric('time.relativeVisible').inc(a * b.percentage);
      }), e(k.running() ? k.stop().get() : -1, function (a) {
        i.getMetric('time.fullyvisible').inc(a);
      }), j.startIf(b.visible), k.startIf(b.fullyvisible), l.startIf(b.hidden), m.startIf(!m.running());
    }
    var g = this, h = !1, i = new f(), j = d.stopwatch(), k = d.stopwatch(), l = d.stopwatch(), m = d.stopwatch();
    i.addMetric('time.visible', new d.counter()), i.addMetric('time.fullyvisible', new d.counter()), i.addMetric('time.hidden', new d.counter()), i.addMetric('time.relativeVisible', new d.counter()), i.addMetric('time.duration', new d.counter()), i.addMetric('percentage', new d.counter()), i.addMetric('percentage.max', new d.counter(0)), i.addMetric('percentage.min', new d.counter(1));
    var n = function () {
      c(a), b(a);
    };
    a.onUpdate(function () {
      n();
    }), g.getMetric = function (a) {
      return i.getMetric(a);
    }, g.running = function () {
      return h;
    }, g.start = function () {
      return h || (a.start(), n(), h = !0), this;
    }, g.stop = function () {
      return h && (n(), a.stop(), h = !1), this;
    };
  }
  b.fn.metrics = function (a) {
    if (this._metrics)
      return this._metrics;
    var b = a || {};
    return this._metrics = new g(this.monitor(b)), this._metrics;
  };
}.call(this, window, window.VisSense, window.VisSense.Utils, window.CountOnMe);
/*! { "name": "vissense-plugin-percentage-time-test", "version": "0.2.0", "copyright": "(c) 2014 tbk" } */
;
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    factory(root, require('vissense'));
  } else if (typeof exports === 'object') {
    factory(root, root.VisSense);
  } else {
    factory(root, root.VisSense);
  }
}(this, function (window, VisSense, undefined) {
  'use strict';
  /**
    * @doc method
    * @name VisSense:onPercentageTimeTestPassed
    *
    * @param {Object} config Config object
    * @param {Function} callback The function to call when the condition is fulfilled

    * @param {Number} config.percentageLimit Percentage limit between 0 and 1
    * @param {Number} config.timeLimit Time limit in milliseconds
    * @param {Number} config.interval Time in milliseconds between checks (default: 100)
    * @param {Number} config.debounce Time in milliseconds to debounce the update (e.g. when scrolling)
    *
    * @returns {undefined}
    *
    * @description
    * This function invokes a callback if and only if the element has been visible at least
    * ´percentageLimit´ percent for at least ´timeLimit´ milliseconds.
    *
    * Important: Every invocation starts a new test! This means the callback will not be called 
    * for at least ´timeLimit´ milliseconds.
    *
    * If not provided, the check interval defaults to 1000 ms.
    */
  VisSense.fn.onPercentageTimeTestPassed = function (callback, config) {
    var _config = VisSense.Utils.defaults(config, {
        percentageLimit: 1,
        timeLimit: 1000,
        interval: 100,
        debounce: 30,
        strategy: []
      });
    var strategy = !VisSense.Utils.isArray(_config.strategy) || _config.strategy.length > 0 ? _config.strategy : new VisSense.VisMon.Strategy.EventStrategy({ debounce: _config.debounce });
    var timeElapsed = 0;
    var timeStarted = null;
    var innerMonitor = null;
    var timeoutId = null;
    var outerMonitor = this.monitor({
        strategy: strategy,
        visible: function () {
          innerMonitor = innerMonitor || outerMonitor.visobj().monitor({
            update: function () {
              var percentage = innerMonitor.state().percentage;
              if (percentage < _config.percentageLimit) {
                timeStarted = null;
              } else {
                var now = VisSense.Utils.now();
                timeStarted = timeStarted || now;
                timeElapsed = now - timeStarted;
              }
              if (timeElapsed >= _config.timeLimit) {
                clearTimeout(timeoutId);
                outerMonitor.stop();
                callback();
              } else {
                timeoutId = setTimeout(function () {
                  innerMonitor.update();
                }, _config.interval);
              }
            }
          });
          innerMonitor.start();
        },
        hidden: function () {
          clearTimeout(timeoutId);
        }
      });
    outerMonitor.start();
  };
  /**
    * @doc method
    * @name VisSense:onPercentageTimeTestPassed
    *
    * @param {Function} callback The function to call when the condition is fulfilled
    *
    * @returns {undefined}
    *
    * @description
    * This function invokes a callback if and only if the element has been visible at least 
    * 50 percent for at least 1 second. It checks the visibility in 100ms intervals.
    */
  VisSense.fn.on50_1TestPassed = function (callback) {
    this.onPercentageTimeTestPassed(callback, {
      percentageLimit: 0.5,
      timeLimit: 970,
      debounce: 30,
      interval: 100
    });
  };
}));
(function (window, document, angular, _, jQuery, undefined) {
  'use strict';
  angular.module('vissensePlayground', [
    'restangular',
    'vissense.playground.states',
    'nvd3ChartDirectives',
    'hljs'
  ]).filter('reverse', function () {
    return function (items) {
      return items.slice().reverse();
    };
  }).factory('tbkVisSense', [
    '$window',
    function ($window) {
      return $window.VisSense;
    }
  ]);
  ;
}(window, document, angular, _, jQuery));
(function (angular) {
  'use strict';
  angular.module('vissense.playground.states', ['ui.router']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.when('', '/demos/overview');
      $urlRouterProvider.when('/', '/demos/overview');
      $stateProvider.state('home', {
        url: '/',
        templateUrl: 'partials/demos.html',
        controller: 'DemoCtrl'
      }).state('demos', {
        abstract: true,
        url: '/demos',
        template: '<ui-view/>'
      }).state('demos.overview', {
        url: '/overview',
        templateUrl: 'partials/demos.html',
        controller: 'DemoCtrl'
      }).state('demos.fire-callbacks', {
        url: '/demo-fire-callbacks',
        templateUrl: 'partials/demos/demo_fire_callbacks.html',
        controller: 'FireCallbacksDemoCtrl'
      }).state('demos.track-visibility', {
        url: '/demo-track-visibility',
        templateUrl: 'partials/demos/demo_track_visibility.html',
        controller: 'TrackVisiblityDemoCtrl'
      }).state('demos.track-sections', {
        url: '/demo-track-sections',
        templateUrl: 'partials/demos/demo_track_sections.html',
        controller: 'MainCtrl'
      }).state('demos.draggable-element', {
        url: '/single',
        templateUrl: 'partials/demos/demo_draggable_element.html',
        controller: 'SingleCtrl'
      }).state('demos.percentage-time-test', {
        url: '/demo-percentage-time-test',
        templateUrl: 'partials/demos/demo_percentage_time_test.html',
        controller: 'SingleCtrl'
      });
      $urlRouterProvider.otherwise('/demos/overview');
    }
  ]);
  ;
}(angular));
;
(function (angular, _, undefined) {
  var newVisSenseFromElementId = function (elementId, vissense) {
    var elementById = document.getElementById(elementId);
    var vis = vissense(elementById, {});
    return vis;
  };
  var newMonitor = function (elementId, vissense, config) {
    var vis = newVisSenseFromElementId(elementId, vissense);
    return vis.monitor(config);
  };
  angular.module('vissensePlayground').directive('tbkHeader', function () {
    var d = {
        scope: {},
        templateUrl: 'partials/navs/header.html',
        controller: [
          '$scope',
          function ($scope) {
          }
        ],
        link: function ($scope, $element) {
          $element.addClass('tbkHeader');
          var querySelector = document.querySelector.bind(document);
          var navdrawerContainer = querySelector('.navdrawer-container');
          var body = document.body;
          var appbarElement = querySelector('.app-bar');
          var menuBtn = querySelector('.menu');
          var main = querySelector('main');
          function closeMenu() {
            body.classList.remove('open');
            appbarElement.classList.remove('open');
            navdrawerContainer.classList.remove('open');
          }
          function toggleMenu() {
            body.classList.toggle('open');
            appbarElement.classList.toggle('open');
            navdrawerContainer.classList.toggle('open');
            navdrawerContainer.classList.add('opened');
          }
          main.addEventListener('click', closeMenu);
          menuBtn.addEventListener('click', toggleMenu);
          navdrawerContainer.addEventListener('click', function (event) {
            if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
              closeMenu();
            }
          });
        }
      };
    return d;
  }).directive('tbkDraggable', [
    '$document',
    function ($document) {
      return function (scope, element, attr) {
        var startX = 0, startY = 0, x = 0, y = 0;
        element.on('mousedown', function (event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });
        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        }
        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      };
    }
  ]).directive('tbkGithubForkRibbon', function () {
    var d = {
        scope: {
          repo: '@tbkGithubForkRibbon',
          label: '@'
        },
        template: '<div class="github-fork-ribbon-wrapper right">' + '<div class="github-fork-ribbon">' + '<a data-ng-href="{{href}}">{{text}}</a>' + '</div>' + '</div>',
        controller: [
          '$scope',
          function ($scope) {
            $scope.href = 'https://github.com/' + $scope.repo;
            $scope.text = $scope.label || 'Fork me on GitHub';
          }
        ],
        link: function ($scope, $element) {
          $element.addClass('tbk-github-fork-ribbon');
        }
      };
    return d;
  }).directive('tbkGithubVersion', function () {
    var d = {
        scope: { repo: '@tbkGithubVersion' },
        template: '<span>{{version}}',
        controller: [
          '$scope',
          '$http',
          function ($scope, $http) {
            $scope.version = '?';
            $http.get('https://api.github.com/repos/' + $scope.repo + '/git/refs/tags', { cache: true }).success(function (data) {
              if (angular.isArray(data) && data.length > 0) {
                var latest = data[data.length - 1];
                var versionIndex = latest.ref.search(/(\d(\.)?){3}$/);
                if (versionIndex > -1) {
                  var version = latest.ref.substring(versionIndex, latest.ref.length);
                  $scope.version = version;
                }
              }
            });
          }
        ],
        link: function ($scope, $element) {
          $element.addClass('tbk-github-version');
        }
      };
    return d;
  }).directive('tbkDefaultDemoNavigation', function () {
    /*
     * example
     * list: [{
     *   text:'Create images for multiple resolutions'
     *   link: ''
     * }, {
     *   text:'Create images for multiple resolutions'
     *   link: ''
     * }, ... ]
     * */
    var d = {
        scope: {},
        template: '<section data-tbk-demo-navigation data-list="list"></section>',
        controller: [
          '$scope',
          function ($scope) {
            $scope.list = [
              {
                text: 'draggable element',
                path: '/demos/single'
              },
              {
                text: 'percentage time test',
                path: '/demos/demo-percentage-time-test'
              },
              {
                text: 'fire callbacks',
                path: '/demos/demo-fire-callbacks'
              },
              {
                text: 'track viewtime',
                path: '/demos/demo-track-visibility'
              },
              {
                text: 'track sections',
                path: '/demos/demo-track-sections'
              }
            ];
          }
        ],
        link: function ($scope, $element) {
          $element.addClass('tbk-default-demo-navigation');
        }
      };
    return d;
  }).directive('tbkDemoNavigation', function () {
    /*
    * example
    * list: [{
    *   text:'Create images for multiple resolutions'
    *   link: ''
    * }, {
    *   text:'Create images for multiple resolutions'
    *   link: ''
    * }, ... ]
    * */
    var d = {
        scope: { list: '=' },
        template: '<section class="styleguide__article-nav">' + '<div class="container-medium">' + '<nav class="article-nav">' + '<a data-ng-click="navigate(current.path)" class="article-nav-link article-nav-link--prev"><p ' + ' class="article-nav-count">{{currentC + 1}}</p>' + '<p>{{current.text}}</p>' + '</a> ' + '<a data-ng-click="navigate(current2.path)" class="article-nav-link article-nav-link--next"><p ' + ' class="article-nav-count">{{current2C + 1}}</p>' + '<p>{{current2.text}}</p>' + '</a>' + '</nav>' + '</div>' + '</section>',
        controller: [
          '$scope',
          '$location',
          function ($scope, $location) {
            function setup() {
              $scope.cursor = _.indexOf($scope.list, _.findWhere($scope.list, function (e) {
                return e.path === $location.path();
              }));
              $scope.cursor = $scope.cursor > 0 ? $scope.cursor : 0;
              console.log($scope.cursor);
              if ($scope.cursor <= 0) {
                $scope.currentC = $scope.list.length - 1;
              } else {
                $scope.currentC = $scope.cursor - 1;
              }
              $scope.current = $scope.list[$scope.currentC];
              if ($scope.cursor < $scope.list.length - 1) {
                $scope.current2C = $scope.cursor + 1;
              } else {
                $scope.current2C = 0;
              }
              $scope.current2 = $scope.list[$scope.current2C];
            }
            setup();
            $scope.navigate = function (path) {
              $location.path(path);
            };
          }
        ],
        link: function ($scope, $element) {
          $element.addClass('tbk-demo-navigation');
        }
      };
    return d;
  });
  ;
}(angular, _));
(function (window, document, angular, _, jQuery, undefined) {
  'use strict';
  angular.module('vissensePlayground').controller('GettingStartedCtrl', [
    '$window',
    '$scope',
    '$interval',
    '$timeout',
    'tbkVisSense',
    function ($window, $scope, $interval, $timeout, tbkVisSense) {
      $scope.title = 'vissense.js';
      $scope.scrollToElement = function (id) {
        $('html, body').animate({ scrollTop: jQuery('#' + id).offset().top }, 500);  //$window.scrollTo(0, top);
      };
      $scope.collapse = function (id, mode) {
        jQuery(id).collapse(mode ? mode : 'toggle');
      };
      jQuery('#main-page-affix').affix({
        offset: {
          top: 325,
          bottom: 0
        }
      });
    }
  ]);
  ;
}(window, document, angular, _, jQuery));
(function (window, document, angular, _, jQuery, undefined) {
  'use strict';
  angular.module('vissensePlayground').controller('MainCtrl', [
    '$window',
    '$scope',
    '$interval',
    '$timeout',
    'tbkVisSense',
    function ($window, $scope, $interval, $timeout, tbkVisSense) {
      $scope.title = 'vissense.js';
      $scope.scrollToElement = function (id) {
        $('html, body').animate({ scrollTop: jQuery('#' + id).offset().top }, 500);  //$window.scrollTo(0, top);
      };
      $scope.collapse = function (id, mode) {
        jQuery(id).collapse(mode ? mode : 'toggle');
      };
      jQuery('#main-page-affix').affix({
        offset: {
          top: 325,
          bottom: 0
        }
      });
    }
  ]);
  ;
}(window, document, angular, _, jQuery));
(function (window, document, angular, _, moment, jQuery, undefined) {
  'use strict';
  angular.module('vissensePlayground').directive('tbkVissenseReportPercentiles', [function () {
      var d = {
          scope: { elementId: '@tbkVissenseReportPercentiles' },
          controller: [
            '$scope',
            '$interval',
            'tbkVisSense',
            function ($scope, $interval, tbkVisSense) {
              var elementById = document.getElementById($scope.elementId);
              var vis = tbkVisSense(elementById, {});
              var metrics = vis.metrics({ strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }) }).start();
              var _update = function () {
                $scope.percentiles = metrics.getMetric('percentage').percentiles();
              };
              var _debounce_update = _.debounce(function () {
                  $scope.$apply(function () {
                    _update();
                  });
                }, 100);
              var intervalId = $interval(_debounce_update, 200);
              $scope.$on('$destroy', function () {
                metrics.stop();
                $interval.cancel(intervalId);
              });
            }
          ],
          template: '<div style="background-color: white">' + '<div>0,1%: {{percentiles["0.001"] * 100 | number: 2}}%</div>' + '<div>1%: {{percentiles["0.01"] * 100 | number: 2}}%</div>' + '<div>5%: {{percentiles["0.05"] * 100 | number: 2}}%</div>' + '<div>25%: {{percentiles["0.25"] * 100 | number: 2}}%</div>' + '<div>50%: {{percentiles["0.5"] * 100 | number: 2}}%</div>' + '<div>75%: {{percentiles["0.75"] * 100 | number: 2}}%</div>' + '<div>90%: {{percentiles["0.9"] * 100 | number: 2}}%</div>' + '<div>95%: {{percentiles["0.95"] * 100 | number: 2}}%</div>' + '<div>99%: {{percentiles["0.99"] * 100 | number: 2}}%</div>' + '<div>99,9%: {{percentiles["0.999"] *100 | number: 2}}%</div>' + '</div>'
        };
      return d;
    }]).directive('tbkVissenseReportPercentagesLinechart', [function () {
      var lastId = 0;
      var d = {
          scope: { elementId: '@tbkVissenseReportPercentagesLinechart' },
          controller: [
            '$scope',
            '$interval',
            'tbkVisSense',
            function ($scope, $interval, tbkVisSense) {
              $scope.id = 'vissense-report-percentages-linechart-' + lastId++;
              var intervalId = null;
              var started = false;
              var startTime = VisSenseUtils.now();
              var elementById = document.getElementById($scope.elementId);
              var vis = tbkVisSense(elementById, {});
              $scope.data = [{
                  key: 'Visibility Percentage',
                  values: []
                }];
              var updatePercentage = function () {
                if (!started) {
                  return;
                }
                var currentPercentage = Math.round(vis.percentage() * 1000) / 10;
                $scope.data[0].values.push([
                  (VisSenseUtils.now() - startTime) / 1000,
                  currentPercentage
                ]);
              };
              vis.monitor().onPercentageChange(_.debounce(updatePercentage, 100));
              vis.timer().every(1000, updatePercentage);
              var _update = function () {
                //updatePercentage();
                //$scope.data[0].values = _.last($scope.data[0].values, 10);
                $scope.data = [VisSenseUtils.extend({}, $scope.data[0])];
              };
              var _debounce_update = _.debounce(function () {
                  $scope.$apply(function () {
                    _update();
                  });
                }, 100);
              $scope.start = function () {
                intervalId = $interval(_debounce_update, 500);
                started = true;
              };
              $scope.stop = function () {
                $interval.cancel(intervalId);
                started = false;
              };
              $scope.$on('$destroy', function () {
                $scope.stop();
              });
            }
          ],
          template: '<div>' + '<button class="btn btn-default" data-ng-click="start()">start</button>' + '<button class="btn btn-default" data-ng-click="stop()">stop</button>' + '<nvd3-line-with-focus-chart ' + ' data="data" ' + ' id="{{id}}" ' + ' height="300" ' + ' height2="50" ' + ' margin="{left:30,top:30,bottom:20,right:20}" ' + '> ' + ' <svg></svg> ' + '</nvd3-line-with-focus-chart>' + '</div>'
        };
      return d;
    }]).directive('tbkVissenseCurrentPercentage', [function () {
      var d = {
          scope: { elementId: '@tbkVissenseCurrentPercentage' },
          controller: [
            '$scope',
            '$document',
            '$interval',
            'tbkVisSense',
            function ($scope, $document, $interval, tbkVisSense) {
              var elementById = $document[0].getElementById($scope.elementId);
              var vis = tbkVisSense(elementById, {});
              var _update = function () {
                $scope.percentage = vis.percentage();
              };
              var intervalId = $interval(_update, 200);
              $scope.$on('$destroy', function () {
                $interval.cancel(intervalId);
              });
            }
          ],
          template: '<span>{{percentage * 100 | number:0}}%</span>'
        };
      return d;
    }]).directive('tbkVissenseReportPercentages', [function () {
      var d = {
          scope: { elementId: '@tbkVissenseReportPercentages' },
          controller: [
            '$scope',
            '$interval',
            'tbkVisSense',
            function ($scope, $interval, tbkVisSense) {
              var elementById = document.getElementById($scope.elementId);
              var vis = tbkVisSense(elementById, {});
              var metrics = vis.metrics({ strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }) }).start();
              var _update = function () {
                $scope.percentage = {
                  current: metrics.getMetric('percentage').get(),
                  max: metrics.getMetric('percentage.max').get(),
                  min: metrics.getMetric('percentage.min').get()
                };
              };
              var _debounce_update = _.debounce(function () {
                  $scope.$apply(function () {
                    _update();
                  });
                }, 100);
              var intervalId = $interval(_debounce_update, 200);
              $scope.$on('$destroy', function () {
                metrics.stop();
                $interval.cancel(intervalId);
              });
            }
          ],
          template: '<div style="background-color: white">' + '<div>current: {{percentage.current * 100 | number:2}}%</div>' + '<div>max: {{percentage.max * 100 | number: 2 }}%</div>' + '<div>min: {{percentage.min * 100 | number: 2 }}%</div>' + '</div>'
        };
      return d;
    }]).directive('tbkDefaultDraggableElement', [function () {
      var d = {
          scope: { elementId: '@tbkDefaultDraggableElement' },
          controller: [
            '$scope',
            function ($scope) {
              $scope.model = { elementId: $scope.elementId };
            }
          ],
          templateUrl: 'partials/directives/default-draggable-element.html'
        };
      return d;
    }]).directive('tbkBoolLabel', [function () {
      var lastId = 0;
      var d = {
          scope: { v: '=tbkBoolLabel' },
          replace: true,
          controller: [
            '$scope',
            function ($scope) {
            }
          ],
          template: '<span class="label" data-ng-class="{\'label-danger\': !v, \'label-success\': v === true }">{{v}}</span>'
        };
      return d;
    }]).directive('tbkVissenseReportTimesBarchart', [function () {
      var lastId = 0;
      var d = {
          scope: { elementId: '@tbkVissenseReportTimesBarchart' },
          controller: [
            '$scope',
            '$window',
            '$interval',
            'tbkVisSense',
            function ($scope, $window, $interval, tbkVisSense) {
              $scope.id = 'vissense-report-times-barchart-' + lastId++;
              var elementById = document.getElementById($scope.elementId);
              var visobj = tbkVisSense(elementById, {});
              var metrics = visobj.metrics({
                  strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }),
                  visibleUpdateInterval: 1000,
                  hiddenUpdateInterval: 1000
                }).start();
              $scope.data = [{
                  key: 'Series 1',
                  values: []
                }];
              var round = function (val) {
                return Math.round(val / 100) / 10;
              };
              var _update = _.debounce(function () {
                  $scope.$apply(function () {
                    $scope.timeHidden = round(metrics.getMetric('time.hidden').get());
                    $scope.timeVisible = round(metrics.getMetric('time.visible').get());
                    $scope.timeFullyVisible = round(metrics.getMetric('time.fullyvisible').get());
                    $scope.data = [
                      {
                        key: 'hidden',
                        values: [[
                            0,
                            $scope.timeHidden
                          ]]
                      },
                      {
                        key: 'visible',
                        values: [[
                            0,
                            $scope.timeVisible
                          ]]
                      },
                      {
                        key: 'fully visible',
                        values: [[
                            0,
                            $scope.timeFullyVisible
                          ]]
                      }
                    ];
                  });
                }, 100);
              var intervalId = $interval(_update, 515);
              $scope.$on('$destroy', function () {
                metrics.stop();
                $interval.cancel(intervalId);
              });
              $scope.xFunction = function () {
                return function (d) {
                  return d.key;
                };
              };
              $scope.yFunction = function () {
                return function (d) {
                  return d.y;
                };
              };
            }
          ],
          template: '<div style="background-color: white">' + '<nvd3-multi-bar-chart ' + ' data="data"' + ' id="exampleId"' + ' height="350"' + ' showLabels="true"' + ' showLegend="true"' + ' tooltips="true"' + ' showXAxis="true"' + ' showYAxis="true">' + '  <svg height="250"></svg>' + '</nvd3-multi-bar-chart>' + '</div>'
        };
      return d;
    }]).directive('tbkVissenseReportPercentagesPiechart', [function () {
      var lastId = 0;
      var d = {
          scope: { elementId: '@tbkVissenseReportPercentagesPiechart' },
          controller: [
            '$scope',
            '$window',
            '$interval',
            'tbkVisSense',
            function ($scope, $window, $interval, tbkVisSense) {
              $scope.id = 'vissense-report-percentages-piechart-' + lastId++;
              var elementById = document.getElementById($scope.elementId);
              var visobj = tbkVisSense(elementById, {});
              var metrics = visobj.metrics({
                  strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }),
                  visibleUpdateInterval: 1000,
                  hiddenUpdateInterval: 1000
                }).start();
              $scope.data = [
                {
                  key: 'hidden',
                  y: 0
                },
                {
                  key: 'visible',
                  y: 0
                },
                {
                  key: 'fully visible',
                  y: 0
                }
              ];
              var _update = _.debounce(function () {
                  $scope.$apply(function () {
                    $scope.timeHidden = metrics.getMetric('time.hidden').get();
                    $scope.timeVisible = metrics.getMetric('time.visible').get();
                    $scope.timeFullyVisible = metrics.getMetric('time.fullyvisible').get();
                    $scope.duration = metrics.getMetric('time.duration').get();
                    $scope.percentageHidden = $scope.timeHidden * 100 / $scope.duration;
                    $scope.percentageVisible = ($scope.timeVisible - $scope.timeFullyVisible) * 100 / $scope.duration;
                    $scope.percentageFullyVisible = $scope.timeFullyVisible * 100 / $scope.duration;
                    $scope.data.push({
                      key: 'hidden',
                      y: $scope.percentageHidden
                    });
                    $scope.data.push({
                      key: 'visible',
                      y: $scope.percentageVisible
                    });
                    $scope.data.push({
                      key: 'fully visible',
                      y: $scope.percentageFullyVisible
                    });
                    //$scope.data[0] = ({ key: "hidden", y: $scope.percentageHidden });
                    //$scope.data[1] = ({ key: "visible", y: $scope.percentageVisible });
                    //$scope.data[2] = ({ key: "fully visible", y: $scope.percentageFullyVisible });
                    $scope.data = _.last($scope.data, 3);
                  });
                }, 100);
              var intervalId = $interval(_update, 505);
              $scope.$on('$destroy', function () {
                metrics.stop();
                $interval.cancel(intervalId);
              });
              $scope.xFunction = function () {
                return function (d) {
                  return d.key;
                };
              };
              $scope.yFunction = function () {
                return function (d) {
                  return d.y;
                };
              };
            }
          ],
          template: '<div style="background-color: white">' + '<nvd3-pie-chart' + ' data="data"' + ' id="{{id}}"' + ' x="xFunction()"' + ' y="yFunction()"' + ' height="250"' + ' showLabels="true"' + ' showLegend="true"' + ' tooltips="true"' + ' labelType="percent"' + ' noData="Data not available"' + '>' + '  <svg height="250"></svg>' + '</nvd3-pie-chart>' + '</div>'
        };
      return d;
    }]).directive('tbkVissenseVisibilityInfocard', [function () {
      var d = {
          scope: { elementId: '@tbkVissenseVisibilityInfocard' },
          controller: [
            '$scope',
            '$window',
            '$interval',
            'tbkVisSense',
            function ($scope, $window, $interval, tbkVisSense) {
              var elementById = document.getElementById($scope.elementId);
              var visobj = tbkVisSense(elementById, {});
              var metrics = visobj.metrics({ strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }) }).start();
              var _update = _.debounce(function () {
                  $scope.$apply(function () {
                    $scope.timeHidden = metrics.getMetric('time.hidden').get();
                    $scope.timeVisible = metrics.getMetric('time.visible').get();
                    $scope.timeFullyVisible = metrics.getMetric('time.fullyvisible').get();
                    $scope.timeRelativeVisible = metrics.getMetric('time.relativeVisible').get();
                    $scope.duration = metrics.getMetric('time.duration').get();
                    $scope.percentage = {
                      current: metrics.getMetric('percentage').get(),
                      max: metrics.getMetric('percentage.max').get(),
                      min: metrics.getMetric('percentage.min').get()
                    };
                  });
                }, 0);
              var intervalId = $interval(_update, 200);
              $scope.$on('$destroy', function () {
                metrics.stop();
                $interval.cancel(intervalId);
              });
            }
          ],
          templateUrl: 'partials/directives/visibility-infocard.html'
        };
      return d;
    }]).controller('DemoCtrl', [
    '$scope',
    function ($scope) {
      $scope.subtitle = 'demos';
    }
  ]).controller('TrackVisiblityDemoCtrl', [
    '$window',
    '$scope',
    '$interval',
    '$timeout',
    'tbkVisSense',
    function ($window, $scope, $interval, $timeout, tbkVisSense) {
      $scope.tbkVisSense = tbkVisSense;
    }
  ]).controller('SingleCtrl', [
    '$scope',
    function ($scope) {
    }
  ]).controller('FireCallbacksDemoCtrl', [
    '$log',
    '$scope',
    '$interval',
    '$timeout',
    'tbkVisSense',
    function ($log, $scope, $interval, $timeout, tbkVisSense) {
      $scope.model = { events: [] };
      var addEvent = function (name, description) {
        $scope.model.events.push({
          time: Date.now(),
          name: name,
          description: description
        });
        $scope.model.events = _.last($scope.model.events, 100);
      };
      var addEventDigest = function (name, description) {
        $scope.$apply(function () {
          addEvent(name, description);
        });
      };
      var element = document.getElementById('example1');
      var visobj = new VisSense(element);
      var vismon = visobj.monitor({
          strategy: new VisSense.VisMon.Strategy.PollingStrategy(1000),
          fullyvisible: function () {
            addEvent('fullyvisible', 'Element became fully visible');
          },
          hidden: function () {
            addEvent('hidden', 'Element became hidden');
          },
          visible: function () {
            addEvent('visible', 'Element became visible');
          },
          update: function () {
            setTimeout(function () {
              $scope.$digest();
            });
            $log.info('update!');
          },
          percentagechange: function (newValue, oldValue) {
            var o = angular.isNumber(oldValue) ? Math.round(oldValue * 1000) / 10 : '?';
            var n = Math.round(newValue * 1000) / 10;
            addEvent('percentagechange', 'Element\'s percentage changed! ' + o + '% -> ' + n + '%');
            $log.info('percentagechange! ' + o + '% -> ' + n + '%');
          },
          visibilitychange: function () {
            addEvent('visibilitychange', 'Element\'s visibility changed!');
          }
        }).start();
      $scope.$on('$destory', function () {
        vismon.stop();
      });
    }
  ]);
}(window, document, angular, _, moment, jQuery));
;
(function (angular, _, undefined) {
  var newVisSenseFromElementId = function (elementId, vissense) {
    var elementById = document.getElementById(elementId);
    var vis = vissense(elementById, {});
    return vis;
  };
  var newMonitor = function (elementId, vissense, config) {
    var vis = newVisSenseFromElementId(elementId, vissense);
    return vis.monitor(config);
  };
  angular.module('vissensePlayground').directive('tbkVismonState', [
    'tbkVisSense',
    '$timeout',
    function (tbkVisSense, $timeout) {
      var d = {
          scope: {
            elementId: '@tbkVismonState',
            fullyvisible: '@',
            hidden: '@',
            strategy: '@'
          },
          link: function ($scope) {
            $timeout(function () {
              var elementById = document.getElementById($scope.elementId);
              var vis = tbkVisSense(elementById, {
                  fullyvisible: parseFloat($scope.fullyvisible) || 1,
                  hidden: parseFloat($scope.hidden) || 0
                });
              var strategy = new tbkVisSense.VisMon.Strategy.EventStrategy({ debounce: 20 });
              if ($scope.strategy === 'PollingStrategy') {
                strategy = new tbkVisSense.VisMon.Strategy.PollingStrategy({ interval: 250 });
              }
              var vismon = vis.monitor({
                  strategy: strategy,
                  visibilitychange: function () {
                    $scope.$apply(function () {
                      $scope.state = vismon.state();
                    });
                  }
                });
              setTimeout(function () {
                vismon.start();
              }, 0);
              $scope.$on('$destroy', function () {
                vismon.stop();
              });
            }, 1);
          },
          template: '<span class="label" data-ng-class="{ \'label-success\': state.visible, \'label-danger\': state.hidden}">' + '<span data-ng-show="state.visible && !state.fullyvisible">visible</span>' + '<span data-ng-show="state.fullyvisible">fully visible</span>' + '<span data-ng-show="state.hidden">hidden</span>' + '</span>'
        };
      return d;
    }
  ]).directive('tbkVismonPercentage', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: { elementId: '@tbkVismonPercentage' },
          controller: [
            '$scope',
            '$interval',
            function ($scope, $interval) {
              $scope.vismon = newMonitor($scope.elementId, tbkVisSense, {
                strategy: new tbkVisSense.VisMon.Strategy.PollingStrategy({ interval: 100 }),
                percentagechange: function () {
                  var state = $scope.vismon.state();
                  $scope.percentage = state.percentage;
                }
              });
              $scope.vismon.start();
              $scope.$on('$destroy', function () {
                $scope.vismon.stop();
              });
            }
          ],
          template: '<span class="label" data-ng-class="{ \'label-success\': percentage > 0, \'label-danger\': !percentage}">' + '{{percentage * 100 | number:0}}%' + '</span>'
        };
      return d;
    }
  ]).directive('tbkVismonPercentageTimeTest', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: {
            elementId: '@tbkVismonPercentageTimeTest',
            timeLimit: '@',
            percentageLimit: '@',
            interval: '@'
          },
          controller: [
            '$scope',
            function ($scope) {
              $scope.visobj = newVisSenseFromElementId($scope.elementId, tbkVisSense);
              $scope.passed = false;
              $scope.visobj.onPercentageTimeTestPassed(function () {
                $scope.$apply(function () {
                  $scope.passed = true;
                });
              }, {
                percentageLimit: $scope.percentageLimit,
                timeLimit: $scope.timeLimit,
                interval: $scope.interval
              });
            }
          ],
          template: '<span>' + '{{percentageLimit * 100 | number:0}}/{{timeLimit / 1000 | number:0}} test: ' + '<span data-ng-style="{ color : passed ? \'green\' : \'red\'}">{{passed}}</span>' + '</span>'
        };
      return d;
    }
  ]).directive('tbkVismonFiftyOneTest', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: { elementId: '@tbkVismonFiftyOneTest' },
          template: '<span data-tbk-vismon-percentage-time-test="{{elementId}}" ' + 'data-percentage-limit="0.5" ' + 'data-time-limit="1000" ' + 'data-interval="100">' + '</span>'
        };
      return d;
    }
  ]).directive('tbkVismonSixtyOneTest', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: { elementId: '@tbkVismonSixtyOneTest' },
          template: '<span data-tbk-vismon-percentage-time-test="{{elementId}}" ' + 'data-percentage-limit="0.6" ' + 'data-time-limit="1000" ' + 'data-interval="100">' + '</span>'
        };
      return d;
    }
  ]).directive('tbkVismonStateDebug', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: { elementId: '@tbkVismonStateDebug' },
          controller: [
            '$scope',
            '$interval',
            function ($scope, $interval) {
              $scope.vismon = newVisSenseFromElementId($scope.elementId, tbkVisSense).monitor({
                strategy: new VisSense.VisMon.Strategy.PollingStrategy(),
                update: function (monitor) {
                  $scope.state = monitor.state();
                }
              }).start();
              $scope.state = $scope.vismon.state();
              $scope.$on('$destroy', function () {
                $scope.vismon.stop();
              });
            }
          ],
          template: '{{ state | json }}'
        };
      return d;
    }
  ]).directive('tbkVissenseDebugUtils', [
    'tbkVisSense',
    function (tbkVisSense) {
      var d = {
          scope: { elementId: '@tbkVissenseDebugUtils' },
          controller: [
            '$scope',
            '$window',
            '$interval',
            function ($scope, $window, $interval) {
              var element = document.getElementById($scope.elementId);
              var _update = _.debounce(function () {
                  var viewport = VisSense.Utils._viewport(element);
                  $scope.viewportHeight = viewport.height;
                  $scope.viewportWidth = viewport.width;
                  var rect = element.getBoundingClientRect();
                  $scope.isInViewport = VisSense.Utils._isInViewport(rect, viewport);
                  $scope.isVisibleByStyling = VisSense.Utils.isVisibleByStyling(element);
                }, 100);
              _update();
              (function () {
                var intervalId = $interval(_update, 1000);
                $scope.$on('$destroy', function () {
                  $interval.cancel(intervalId);
                });
              }());
            }
          ],
          template: '<dl>' + '<dt>viewport</dt> <dd>{{viewportWidth  | number:0}}x{{viewportHeight | number:0}}</dd>' + '<dt>isInViewport</dt> <dd><span data-tbk-bool-label="isInViewport"></span></dd>' + '<dt>isVisibleByStyling</dt> <dd><span data-tbk-bool-label="isVisibleByStyling"></span></dd>' + '</dl>'
        };
      return d;
    }
  ]);
  ;
}(angular, _));
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos.html', '<header class="container"><h2 class="xlarge">Demos</h2><p>a small collection of examples demonstrating VisSense.js</p></header><ul class="list-links list-links--primary"><li><a data-ui-sref="demos.draggable-element">draggable element</a></li><li><a data-ui-sref="demos.percentage-time-test">percentage time test</a></li><li><a data-ui-sref="demos.fire-callbacks">fire callbacks</a></li><li><a data-ui-sref="demos.track-visibility">track viewtime</a></li><li><a data-ui-sref="demos.track-sections">track sections</a></li></ul>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/main.html', '');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos/demo_draggable_element.html', '<section data-tbk-default-demo-navigation=""></section><header class="container"><h2>Draggable Element Demo</h2></header><section class="styleguide__editorial-header"><div class="editorial-header"><div class="container"><p class="editorial-header__excerpt g-wide--pull-1">This demo lets you drag an element around the screen to explore the main features of VisSense.js, which essentially are measuring the state of the element and the percentage of the surface area within the visible area of a viewer\'s browser window on an in focus web page.</p><p class="g-wide--pull-1">In this example the element is considered "hidden" if its surface area is less than 10% and "fullyvisibile" if it is more than 90%. See the code below.</p></div></div></section><div class="container" id="draggable-example-container"><table class="table-2" style="margin-bottom: 30px;"><colgroup><col span="1"><col span="1"></colgroup><thead><tr><th>state</th><th>percentage</th></tr></thead><tbody><tr><td><span data-tbk-vismon-state="myElement" data-fullyvisible="0.9" data-hidden="0.1" data-strategy="PollingStrategy"></span></td><td><span data-tbk-vismon-percentage="myElement"></span></td></tr></tbody></table><div id="myElement" class="default-draggable-element" data-tbk-draggable=""><div tbk-default-draggable-element="myElement"></div></div><h3>state()</h3><section class="styleguide__editorial-header"><div class="editorial-header"><div class="container"><p class="g-wide--pull-1">Drag the element around to see the <code>state</code> property change its value.</p></div></div></section><pre data-hljs="" data-tbk-vismon-state-debug="myElement"></pre><h3>Code</h3><code data-hljs="">\n' + 'var element = document.getElementById(\'myElement\');\n' + 'var visobj = VisSense(element, {\n' + '  hidden: 0.1,\n' + '  fullyvisible: 0.9\n' + '});\n' + '\n' + 'var vismon = visobj.monitor({\n' + '  strategy: new VisSense.VisMon.Strategy.PollingStrategy()\n' + '}).start();\n' + '\n' + 'vismon.state();\n' + '  </code><br data-ng-repeat="i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]"></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos/demo_fire_callbacks.html', '<section data-tbk-default-demo-navigation=""></section><style>\n' + '  .log-container {\n' + '    font-size: 0.8em;\n' + '\n' + '    height: 400px;\n' + '    margin-bottom: 30px;\n' + '\n' + '    overflow-y: scroll;\n' + '  }\n' + '\n' + '  .log {\n' + '    padding: 5px;\n' + '    margin-bottom: 3px;\n' + '  }\n' + '\n' + '</style><header class="container"><h2>Fire Callbacks Demo</h2></header><section class="styleguide__editorial-header"><div class="editorial-header"><div class="container"><p class="editorial-header__excerpt g-wide--pull-1">This demo demonstrates the events fired during monitoring a target elements visibility.</p><p class="g-wide--pull-1">Move the element around to update the table content with triggered events. Notice the behaviour of the "visible" event - it will always be triggered when transitioning from "hidden" but it wont fire when changing from "fullyvisible" to "visible" (while instead a "visibilitychange" event will be triggered).</p></div></div></section><div class="container" id="draggable-example-container"><div class=""><div class="log-container" style="margin-top: 26px;"><table class="table-3" style="margin-top: 0;"><thead><tr><th>time</th><th>event</th><th>description</th></tr></thead><tbody><tr data-ng-repeat="event in model.events | reverse" class="log alert" data-ng-class="{ \'color--danger\': event.name == \'hidden\', \'color--green\': event.name == \'fullyvisible\', \'color--yellow\': event.name == \'visible\', \'color--highlight\': event.name == \'visibilitychange\', \'color--learning\': event.name == \'percentagechange\' }"><td class="pull-right"><i class="fa fa-clock-o"></i> {{event.time | date:\'MMM d, y h:mm:ss.sss a\'}}</td><td>{{event.name}}</td><td>{{event.description}}</td></tr></tbody></table></div><div style="margin-bottom: 20px;"><div id="example1" class="default-draggable-element" data-tbk-draggable=""><div tbk-default-draggable-element="example1"></div></div></div></div><h3>Code</h3><code data-hljs="">\n' + 'var element = document.getElementById(\'example1\');\n' + 'var visobj = new VisSense(element);\n' + '\n' + 'var vismon = visobj.monitor({\n' + '  strategy: new VisSense.VisMon.Strategy.PollingStrategy(1000),\n' + '  fullyvisible: function() { ... },\n' + '  hidden: function() { ... },\n' + '  visible: function() { ... },\n' + '  update: function() { ... },\n' + '  percentagechange: function(newValue, oldValue) { ... },\n' + '  visibilitychange: function() { ... }\n' + '}).start();\n' + '  </code><div data-ng-repeat="i in [1,2,3,4,5,6]" style="height: 100px;"></div></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos/demo_percentage_time_test.html', '<section data-tbk-default-demo-navigation=""></section><header class="container"><h2>Percentage Time Tests</h2></header><section class="styleguide__editorial-header"><div class="editorial-header"><div class="container"><p class="editorial-header__excerpt g-wide--pull-1">Percentage time tests inform you when an element has passed a viewability test. The 60/1-Test for example is passed only if at least 60% of the elements surface area is within the visible area of a viewer\'s browser window on an in focus web page for at least one second.</p><p class="g-wide--pull-1">A percentage time test will start once the target element becomes visible the first and time and restarts if the percentage falls below the percentage limit and the test has not been passed yet.</p></div></div></section><div class="container" id="draggable-example-container"><table class="table-5" style="margin-bottom: 30px;"><colgroup><col span="1"><col span="1"><col span="1"><col span="1"><col span="1"></colgroup><thead><tr><th>percentage</th><th>50/1 Test</th><th>60/1 Test</th><th>66/3 Test *</th><th>100/10 Test **</th></tr></thead><tbody><tr><td><span data-tbk-vismon-percentage="myElement"></span></td><td><span data-tbk-vismon-fifty-one-test="myElement"></span></td><td><span data-tbk-vismon-sixty-one-test="myElement"></span></td><td><span data-tbk-vismon-percentage-time-test="myElement" data-percentage-limit="0.66" ,="" data-time-limit="3000" data-interval="100"></span></td><td><span data-tbk-vismon-percentage-time-test="myElement" data-percentage-limit="1" ,="" data-time-limit="10000" data-interval="100"></span></td></tr></tbody></table><div id="myElement" class="default-draggable-element" data-tbk-draggable=""><div tbk-default-draggable-element="myElement"></div></div><section class="styleguide__editorial-header"><div class="editorial-header"><div class="container"><p class=""><small>* 66/3 Test: At least 66% visible for 3 seconds.</small><br><small>** 100/10 Test: Fully visible for 10 seconds.</small><br></p></div></div></section><h3>Code</h3><code data-hljs="">\n' + 'var element = document.getElementById(\'myElement\');\n' + 'var visobj = VisSense(element);\n' + '\n' + '// 50/1 test\n' + 'visobj.onPercentageTimeTestPassed(function() {\n' + '  ...\n' + '}, {\n' + '  percentageLimit: 0.5,\n' + '  timeLimit: 1000,\n' + '  interval: 100\n' + '});\n' + '\n' + '// 100/10 test\n' + 'visobj.onPercentageTimeTestPassed(function() {\n' + '  ...\n' + '}, {\n' + '  percentageLimit: 1,\n' + '  timeLimit: 10000,\n' + '  interval: 100\n' + '});\n' + '  </code><br data-ng-repeat="i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]"></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos/demo_track_sections.html', '<section data-tbk-default-demo-navigation=""></section><style>\n' + '\n' + '  .section-stats-container {\n' + '    margin: 0px;\n' + '    position: fixed;\n' + '    left: 42px;\n' + '    bottom: 13px;\n' + '    width: 600px;\n' + '    height: 140px;\n' + '    box-shadow: 3px 3px 15px 3px rgba(0, 0, 0, 0.4);\n' + '    z-index: 99999;\n' + '    background-color: rgba(242,242,242,0.9);\n' + '   }\n' + '</style><header class="container"><h2>Track Section Demo</h2></header><div class="section-stats-container"><ul><li><a data-ng-click="scrollToElement(\'examples-section\')">section 1</a> <span data-tbk-vismon-state="examples-section"></span></li><li><a data-ng-click="scrollToElement(\'demo-section\')">section 2</a> <span data-tbk-vismon-state="demo-section"></span></li><li><a data-ng-click="scrollToElement(\'plugins-section\')">section 3</a> <span data-tbk-vismon-state="plugins-section"></span></li></ul></div><div class=""><div class="code-sample"><div class="highlight-module highlight-module--left highlight-module--learning" id="examples-section"><div class="highlight-module__container"><div class="pull-left" style="font-size: 150px; padding: 30px;"><span class="fa fa-eye"></span></div><div class="highlight-module__content g-wide--push-1 g-wide--pull-1 g-medium--push-1"><h2 class="highlight-module__title">1 Track visibility</h2><p class="highlight-module__text">immediately know when an element becomes hidden, partly visible or fully visible.</p></div></div></div></div><div class="code-sample"><div class="highlight-module highlight-module--right highlight-module--remember" id="demo-section"><div class="highlight-module__container row"><div class="pull-right" style="font-size: 150px; padding: 30px;"><span class="fa fa-paw"></span></div><div class="highlight-module__content g-wide--push-1 g-wide--pull-1 g-medium--pull-1"><h2 class="highlight-module__title">2 Observe changes</h2><p class="highlight-module__text">react on visibility changes and execute proper actions.</p></div></div></div></div><div class="code-sample"><div class="highlight-module highlight-module--left highlight-module--learning" id="plugins-section"><div class="highlight-module__container"><div class="pull-left" style="font-size: 150px; padding: 30px;"><span class="fa fa-puzzle-piece"></span></div><div class="highlight-module__content g-wide--push-1 g-wide--pull-1 g-medium--pull-1"><h2 class="highlight-module__title">3 Create extensions</h2><p class="highlight-module__text">vissense.js can be extended. checkout existing plugins or create your own extension - it\'s supereasy.</p></div></div></div></div></div><br data-ng-repeat="i in [1,2,3,4,5,6,7,8,9,10]">');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/demos/demo_track_visibility.html', '<section data-tbk-default-demo-navigation=""></section><header class="container"><h2>Track Viewtime Demo</h2></header><div class="container" id="draggable-example-container" style="margin-top: 30px;"><div id="example1" class="default-draggable-element" data-tbk-draggable=""><div tbk-default-draggable-element="example1"></div></div><div data-tbk-vissense-visibility-infocard="example1"></div><div class="lorem-ipsum"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.</p><p>Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.</p><p>Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices.</p><p>Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim.</p><p>Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo.</p><p>Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam.</p></div><br data-ng-repeat="i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]"></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/directives/default-draggable-element.html', '<div style="text-align: center"><i class="icon icon-user-input"></i><br><span>Drag me!</span><br><span data-tbk-vissense-current-percentage="{{ elementId }}"></span></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/directives/visibility-infocard.html', '<style>\n' + '  .visibility-stats-container {\n' + '    margin: 0px;\n' + '    position: fixed;\n' + '    left: 42px;\n' + '    bottom: 13px;\n' + '    width: 600px;\n' + '    height: 200px;\n' + '    box-shadow: 3px 3px 15px 3px rgba(0, 0, 0, 0.4);\n' + '    z-index: 99999;\n' + '    background-color: rgba(242,242,242,0.9);\n' + '  }\n' + '  .flexbox {\n' + '    display: box;\n' + '    display: -webkit-box;\n' + '    display: -moz-box;\n' + '\n' + '    box-orient: horizontal;\n' + '    -webkit-box-orient: horizontal;\n' + '    -moz-box-orient: horizontal;\n' + '  }\n' + '\n' + '  .box {\n' + '    font-size: 23px;\n' + '    padding: 10px;\n' + '    width: 150px;\n' + '    text-align: center;\n' + '  }\n' + '  .box small {\n' + '    color: #888;\n' + '  }\n' + '</style><div class="visibility-stats-container"><div style="text-align:center" data-tbk-vismon-state="example1"></div><div class="flexbox"><div class="box"><div>{{timeVisible / 1000 | number:1}}s</div><small>time visible</small></div><div class="box"><div>{{timeFullyVisible / 1000 | number:1}}s</div><small>time fullyvisible</small></div><div class="box"><div>{{timeHidden * 100 / duration | number:0}}%</div><small>percentage hidden</small></div><div class="box"><div>{{timeVisible * 100 / duration | number:0}}%</div><small>percentage visible</small></div></div><div class="flexbox"><div class="box"><div>{{timeHidden / 1000 | number:1}}s</div><small>time hidden</small></div><div class="box"><div>{{timeRelativeVisible / 1000 | number:1}}s</div><small>time relative</small></div><div class="box"><div>{{percentage.min * 100 | number:0}}%</div><small>percentage min</small></div><div class="box"><div>{{percentage.max * 100 | number:0}}%</div><small>percentage max</small></div></div></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/documentation/api.html', '<h3 class="h3">vissense</h3><div data-hljs="">vis.percentage();</div><span>gets the current visible percentage (0..1)</span><hr><div data-hljs="">vis.isHidden();</div><span>\xb4true\xb4 if element is hidden</span><hr><div data-hljs="">vis.isVisible();</div><span>\xb4true\xb4 if element is visible</span><hr><div data-hljs="">vis.isFullyVisible();</div><span>\xb4true\xb4 if element is fully visible</span><hr><div data-hljs="">vis.state();</div><span>gets an object representing the current state</span><div data-hljs="">{ "code": 1, "state": "visible", "percentage": 0.55, "visible": true, "fullyvisible": false, "hidden": false "previous" : {} }</div><hr><h3 class="h3">vissense-monitor</h3><ul><li><code>start()</code> starts observing the element</li><li><code>stop()</code> stops observing the element</li><li><code>update()</code> manually run the update procedure. this will fire any registered handlers</li></ul><hr><div data-hljs="">vismon.on();</div><span>registers an event handler</span><div data-hljs="">vismon.on(\'update\', function(monitor) { ... }); vismon.on(\'hidden\', function(monitor) { ... }); vismon.on(\'visible\', function(monitor) { ... }); vismon.on(\'fullyvisible\', function(monitor) { ... }); vismon.on(\'percentagechange\', function(newValue, oldValue, monitor) { ... }); vismon.on(\'visibilitychange\', function(monitor) { ... });</div><hr><div data-hljs="">vismon.state();</div><span>gets an object representing the current state</span><div data-hljs="">{ "code": 1, "state": "visible", "percentage": 0.55, "visible": true, "fullyvisible": false, "hidden": false "previous" : { "code": 2, "state": "fullyvisible", "percentage": 1, "visible": true, "fullyvisible": true, "hidden": false } }</div><hr>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/documentation/usage.html', '<p>Include <code>vissense.js</code> in your page, it has no dependencies.</p><p>Call <code>VisSense()</code> passing an element node and an optional config object:</p><ul><li><code>hidden</code> <span class="label label-default">default: 0</span> if percentage is equal or below this limit the element is considered hidden</li><li><code>fullyvisible</code><span class="label label-default">default: 1</span> if percentage is equal or above this limit the element is considered fully visible</li></ul><div data-hljs="">var element = document.getElementById(\'my-element\'); var vis = new VisSense(element, { hidden: 0.1, fullyvisible: 0.9 });</div><h3 class="h3">vissense-monitor</h3><p>Call <code>monitor()</code> of your vissense instance passing an optional config object with the following:</p><ul><li><code>update</code> function to run when elements update function is called</li><li><code>hidden</code> function to run when element becomes hidden</li><li><code>visible</code> function to run when element becomes visible</li><li><code>fullyvisible</code> function to run when element becomes fully visible</li><li><code>visibilitychange</code> function to run when the visibility of the element changes</li><li><code>percentagechange</code> function to run when the percentage of the element changes</li><li><code>strategy</code> the strategy for observing the element. vissense comes with three predefined strategies:<ul><li><code>NoopStrategy</code> <span class="label label-default">default</span> this strategy (like implied by its name) does nothing on its own. it is your responsibility to invoke <code>update()</code> on the monitor instance.</li><li><code>EventStrategy</code> this strategy registers event handlers for <code>visibilitychange</code>, <code>scroll</code> and <code>resize</code> and calls <code>update()</code> accordingly.</li><li><code>PollingStrategy</code> this strategy invokes <code>update()</code> periodically.</li></ul></li></ul><div data-hljs="">var vismon = vis.monitor({ strategy: new VisSense.VisMon.Strategy.PollingStrategy({ interval: 1000 // ms }), update: function() { ... }, hidden: function() { ... }, visible: function() { ... }, fullyvisible: function() { ... }, visibilitychange: function() { ... }, percentagechange: function() { ... } });</div><p>alternatively you can always register event handlers later with <code>on()</code></p><div data-hljs="">vismon.on(\'percentagechange\', function() { ... });</div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/navs/bottom.html', '<div class="container"><div class="footer" id="footer"><p class="pull-right">with <i class="fa fa-code"></i></p></div></div><div data-tbk-github-fork-ribbon="vissense/vissense" data-label="Fork me on GitHub"></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/navs/header.html', '<div><header class="app-bar promote-layer"><div class="app-bar-container"><button class="menu"><i class="fa fa-list"></i></button><h1 class="logo"><a data-ui-sref="home">Vis<strong>Sense</strong>.js</a></h1></div></header><nav class="navdrawer-container promote-layer"><h4>Navigation</h4><ul><li data-ui-sref-active="active"><a data-ui-sref="demos.overview">Demos</a></li><li><p style="color:#bbb;">Version <span data-tbk-github-version="vissense/vissense"></span></p></li><li><a href="https://github.com/vissense/vissense"><i class="fa fa-github"></i> GitHub Project</a></li></ul></nav></div>');
    }
  ]);
}());
(function (module) {
  try {
    module = angular.module('vissensePlayground');
  } catch (e) {
    module = angular.module('vissensePlayground', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('partials/navs/top.html', '<div class="container"><div class="row"><div class="header"><ul class="nav nav-pills pull-right"><li data-ui-sref-active="active"><a data-ui-sref="home">Home</a></li><li data-ui-sref-active="active"><a data-ui-sref="gettingstarted">Getting started</a></li><li data-ui-sref-active="active"><a data-ui-sref="documentation">Documentation</a></li><li data-ui-sref-active="active"><a data-ui-sref="demos.overview">Demos</a></li></ul><h3 class="h3"><img src="images/logo.png" alt="logo" class="logo" height="30"> vissense.js</h3></div></div></div>');
    }
  ]);
}());