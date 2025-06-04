/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 477:
/***/ (function() {

/* (ignored) */

/***/ }),

/***/ 8435:
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4114);
/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8111);
/* harmony import */ var core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_iterator_constructor_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es_iterator_map_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1701);
/* harmony import */ var core_js_modules_es_iterator_map_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_iterator_map_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6587);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_3__);




/*
	Masked Input plugin for jQuery
	Version: 1.2.2 (03/09/2009 22:39:06)
	Modification : build 1.0 (23/11/2010)
	Usage : ex. 
		$("#mask1").mask("99/99/9999",{placeholder:"_"});
		$("#mask2").mask("aaaaaaaa");
		$("#mask3").mask("AAAAAAAAAA");
		$("#mask4").mask("eeeeeee");
		$("#mask5").mask("EEEEEE");
		$("#mask6").mask("xxxxxxxxxx");
		$("#mask7").mask("XXXXXXXXXX");
		$("#mask8").mask("(100)T");
		$("#mask9").mask("**********");		
*/
(function ($) {
  var pasteEventName = "input.mask";
  var iPhone = window.orientation != undefined;
  $.mask = {
    //Predefined character definitions
    definitions: {
      '9': "[0-9]",
      '*': "[A-Za-z0-9]",
      'E': "[A-Z]",
      'e': "[A-Za-z]",
      'A': "[A-Z0-9#&+_-]",
      'a': "[A-Za-z0-9#&+_-]",
      'X': "[A-Z0-9!\"#$%&'()*+,.\\/:;<=>?@^_`{|}~-]",
      'x': "[A-Za-z0-9!\"#$%&'()*+,.\\/:;<=>?@^_`{|}~-]",
      'T': "[^~]"
    }
  };
  $.fn.extend({
    //Helper Function for Caret positioning
    caret: function (begin, end) {
      if (this.length == 0) return;
      if (typeof begin == 'number') {
        end = typeof end == 'number' ? end : begin;
        return this.each(function () {
          if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(begin, end);
          } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', begin);
            range.select();
          }
        });
      } else {
        if (this[0].setSelectionRange) {
          begin = this[0].selectionStart;
          end = this[0].selectionEnd;
        } else if (document.selection && document.selection.createRange) {
          var range = document.selection.createRange();
          begin = 0 - range.duplicate().moveStart('character', -100000);
          end = begin + range.text.length;
        }
        return {
          begin: begin,
          end: end
        };
      }
    },
    unmask: function () {
      return this.trigger("unmask");
    },
    mask: function (mask, settings) {
      if (!mask && this.length > 0) {
        var $input = $(this[0]);
        var tests = $input.data("tests");
        return $.map($input.data("buffer"), function (c, i) {
          return tests[i] ? c : null;
        }).join('');
      }
      settings = $.extend({
        placeholder: "",
        entirely: false,
        completed: null
      }, settings);
      var defs = $.mask.definitions;
      tests = [];
      var firstIdx = mask.indexOf("(");
      var lastIdx = mask.indexOf(")");
      if (firstIdx >= 0 && lastIdx >= 0) {
        var count = mask.substring(firstIdx + 1, lastIdx);
        var buf = mask.substring(0, firstIdx);
        var str2 = mask.substring(lastIdx + 1);
        var cntr = eval(count);
        for (var i = 0; i < cntr; i++) buf += str2.charAt(0);
        buf += str2.substring(1);
        mask = buf;
      }
      var firstNonMaskPos = null;
      var partialPosition = mask.length;
      var len = mask.length;
      $.each(mask.split(""), function (i, c) {
        if (c == '?') {
          len--;
          partialPosition = i;
        } else if (defs[c]) {
          tests.push(new RegExp(defs[c]));
          if (firstNonMaskPos == null) firstNonMaskPos = tests.length - 1;
        } else {
          tests.push(null);
        }
      });
      return this.each(function () {
        var $input = $(this);
        var buffer = $.map(mask.split(""), function (c) {
          if (c != '?') return defs[c] ? settings.placeholder : c;
        });
        var ignore = false; //Variable for ignoring control keys
        var focusText = $input.val();
        var keycode = "";
        $input.data("buffer", buffer).data("tests", tests);
        var mask_input = buffer.join('');
        function seekNext(pos) {
          while (++pos <= len && !tests[pos]);
          return pos;
        }
        function shiftL(pos) {
          if (pos > -1 && pos < len) {
            while (!tests[pos] && --pos >= 0);
            for (var i = pos; i < len; i++) {
              if (tests[i]) {
                buffer[i] = settings.placeholder;
                var j = seekNext(i);
                if (j < len && tests[i].test(buffer[j])) {
                  buffer[i] = buffer[j];
                } else break;
              }
            }
            writeBuffer();
            $input.caret(Math.max(firstNonMaskPos, pos));
          }
        }
        function shiftL2(begin) {
          if (begin > -1 && begin < len) {
            while (!tests[begin] && --begin >= 0);
            writeBuffer();
            $input.caret(Math.max(firstNonMaskPos, begin));
          }
        }
        function shiftR(pos) {
          for (var i = pos, c = settings.placeholder; i < len; i++) {
            if (tests[i]) {
              var j = seekNext(i);
              var t = buffer[i];
              buffer[i] = c;
              if (j < len && tests[j].test(t)) c = t;else break;
            }
          }
        }
        function keydownEvent(e) {
          if ($(this).is("[readonly]")) return true;
          var pos = $(this).caret();
          var k = e.charCode || e.keyCode || e.which;
          keycode = e.charCode || e.keyCode || e.which;
          ignore = k < 16 || k > 16 && k < 32 || k > 32 && k < 41;
          //delete selection before proceeding
          if (pos.begin - pos.end != 0 && (!ignore || k == 8 || k == 46)) {
            clearBuffer(pos.begin, pos.end);
          }
          //backspace, delete, and escape get special treatment
          if (k == 8 || k == 46 || iPhone && k == 127) {
            //backspace/delete
            if (pos.begin - pos.end != 0) {
              shiftL2(pos.begin, pos.end);
              if ($input.val() == mask_input) {
                $input.val("");
              }
            } else {
              shiftL(pos.begin + (k == 46 ? 0 : -1));
              if ($input.val() == mask_input) {
                $input.val("");
              }
            }
            triggerInput($input);
            return false;
          } else if (k == 27) {
            //escape
            $input.val(focusText);
            $input.caret(0, checkVal());
            return false;
          }
        }
        function checkLength() {
          if (settings.placeholder != "") {
            if ($input.val().indexOf(settings.placeholder) > -1 || $input.val().length == 0) {
              return true;
            } else {
              return false;
            }
          }
          if ($input.val().length < mask.length) {
            return true;
          }
          return false;
        }
        function keypressEvent(e) {
          if ($(this).is("[readonly]")) return true;
          if (ignore) {
            ignore = false;
            //Fixes Mac FF bug on backspace
            return e.keyCode == 8 ? false : null;
          }
          e = e || window.event;
          var k = e.charCode || e.keyCode || e.which;
          var pos = $(this).caret();
          if (checkLetter()) {
            clearBuffer2();
          }
          //alert("keycode in keypress : "+k+" character : "+String.fromCharCode(k)+" keycode in keydown: "+keycode);
          if (e.ctrlKey || e.altKey || e.metaKey) {
            //Ignore
            return true;
          } else if (keycode >= 32 && keycode <= 125 && keycode != 45 && keycode != 46 || keycode >= 186) {
            //typeable characters
            var p = seekNext(pos.begin - 1);
            if (checkLength() || pos.begin - pos.end != 0) {
              if (p < len) {
                if ($input.val().length == 0) buffer = $.map(mask.split(""), function (c) {
                  if (c != '?') return defs[c] ? settings.placeholder : c;
                });
                if (settings.placeholder != "") {
                  writeBuffer();
                }
                var c = String.fromCharCode(k);
                if (isUpper(findDefs(tests[p].source))) c = c.toUpperCase();
                if (tests[p].test(c)) {
                  shiftR(p);
                  buffer[p] = c;
                  writeBuffer();
                  var next = seekNext(p);
                  $(this).caret(next);
                  if (settings.completed && next == len) {
                    settings.completed.call($input);
                  }
                }
              }
            }
            triggerInput($input);
          }
          return false;
        }
        function clearBuffer(start, end) {
          for (let i = start; i < end && i < len; i++) {
            if (tests[i]) buffer[i] = settings.placeholder;
          }
          if (checkLetter()) {
            var j = 0;
            var temp = $.map(mask.split(""), function (c) {
              if (c != '?') return defs[c] ? settings.placeholder : c;
            });
            for (let i = 0; i < buffer.length; i++) {
              if (buffer[i] != "" && tests[i]) {
                temp[j++] = buffer[i];
              }
            }
            buffer = temp;
          }
        }
        function clearBuffer2() {
          if (!checkBuffer()) {
            var j = 0;
            var temp = $.map(mask.split(""), function (c) {
              if (c != '?') return defs[c] ? settings.placeholder : c;
            });
            for (var i = 0; i < buffer.length; i++) {
              if (buffer[i] != "" && tests[i]) {
                temp[j++] = buffer[i];
              } else {
                break;
              }
            }
            buffer = temp;
          }
        }
        function checkBuffer() {
          if ($input.val().length > -1) {
            var temp_input = "";
            for (var i = 0; i < len; i++) {
              if (buffer[i] == "") {
                break;
              }
              temp_input = temp_input + buffer[i];
            }
            if (buffer.join('') == temp_input) {
              return true;
            }
          }
          return false;
        }
        function checkLetter() {
          for (var i = 0; i < mask.length; i++) {
            if (defs[mask.charAt(i)] == null) {
              return false;
            }
          }
          return true;
        }
        function findDefs(src) {
          for (var p in defs) {
            if (defs[p] == src) return p;
          }
          return "";
        }
        function isUpper(c) {
          return c == 'E' || c == 'A' || c == 'X';
        }
        function writeBuffer() {
          let v = buffer.join('');
          $input.val(v);
          return v;
        }
        function triggerInput($input) {
          $input.get(0).dispatchEvent(new Event('input', {
            bubbles: true
          }));
        }
        function checkVal(allow) {
          //try to place characters where they belong
          var test = $input.val();
          var lastMatch = -1;
          for (var i = 0, pos = 0; i < len; i++) {
            if (tests[i]) {
              buffer[i] = settings.placeholder;
              while (pos++ < test.length) {
                var c = test.charAt(pos - 1);
                if (tests[i].test(c)) {
                  buffer[i] = c;
                  lastMatch = i;
                  break;
                }
              }
              if (pos > test.length) break;
            } else if (buffer[i] == test[pos] && i != partialPosition) {
              pos++;
              lastMatch = i;
            }
          }
          if (!allow && lastMatch + 1 < partialPosition) {
            if (settings.entirely) {
              $input.val("");
              clearBuffer(0, len);
            }
          } else if (allow || lastMatch + 1 >= partialPosition) {
            writeBuffer();
            if (!allow) {
              $input.val($input.val().substring(0, lastMatch + 1));
            }
          }
          return partialPosition ? i : firstNonMaskPos;
        }
        if (!$input.attr("readonly")) $input.one("unmask", function () {
          $input.unbind(".mask").removeData("buffer").removeData("tests");
        }).bind("focus.mask", function () {
          focusText = $input.val();
          let pos = checkVal();
          if (pos == mask.length) $input.caret(0, pos);else $input.caret(pos);
        }).bind("blur.mask", function () {
          checkVal();
          if ($input.val() != focusText) {
            $input.trigger("change");
          }
        }).bind("keydown.mask", keydownEvent).bind("keypress.mask", keypressEvent).bind(pasteEventName, function () {
          setTimeout(function () {
            $input.caret(checkVal(true));
          }, 0);
          return false;
        });
        checkVal(); //Perform initial check for existing values
      });
    }
  });
})((jquery__WEBPACK_IMPORTED_MODULE_3___default()));

/***/ }),

/***/ 9933:
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./node_modules/jquery/dist/jquery.js
var jquery = __webpack_require__(6587);
var jquery_default = /*#__PURE__*/__webpack_require__.n(jquery);
// EXTERNAL MODULE: ./node_modules/jquery-ui-dist/jquery-ui.js
var jquery_ui = __webpack_require__(9827);
// EXTERNAL MODULE: ./node_modules/bootstrap/dist/js/bootstrap.js
var bootstrap = __webpack_require__(5707);
// EXTERNAL MODULE: ./node_modules/bootbox/dist/bootbox.js
var bootbox = __webpack_require__(7597);
// EXTERNAL MODULE: ./src/assets/jquery/js/jquery.maskedinput.js
var jquery_maskedinput = __webpack_require__(8435);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.constructor.js
var es_iterator_constructor = __webpack_require__(8111);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.find.js
var es_iterator_find = __webpack_require__(116);
;// ./src/assets/clockpicker/bootstrap-clockpicker.js


/*!
 * ClockPicker v0.0.7 (http://weareoutman.github.io/clockpicker/)
 * Copyright 2014 Wang Shenwei.
 * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/gh-pages/LICENSE)
 */


(function () {
  var $ = (jquery_default()),
    $win = $(window),
    $doc = $(document),
    $body;

  // Can I use inline svg ?
  var svgNS = 'http://www.w3.org/2000/svg',
    svgSupported = 'SVGAngle' in window && function () {
      var supported,
        el = document.createElement('div');
      el.innerHTML = '<svg/>';
      supported = (el.firstChild && el.firstChild.namespaceURI) == svgNS;
      el.innerHTML = '';
      return supported;
    }();

  // Can I use transition ?
  var transitionSupported = function () {
    var style = document.createElement('div').style;
    return 'transition' in style || 'WebkitTransition' in style || 'MozTransition' in style || 'msTransition' in style || 'OTransition' in style;
  }();

  // Listen touch events in touch screen device, instead of mouse events in desktop.
  var touchSupported = 'ontouchstart' in window,
    mousedownEvent = 'mousedown' + (touchSupported ? ' touchstart' : ''),
    mousemoveEvent = 'mousemove.clockpicker' + (touchSupported ? ' touchmove.clockpicker' : ''),
    mouseupEvent = 'mouseup.clockpicker' + (touchSupported ? ' touchend.clockpicker' : '');

  // Vibrate the device if supported
  var vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;
  function createSvgElement(name) {
    return document.createElementNS(svgNS, name);
  }
  function leadingZero(num) {
    return (num < 10 ? '0' : '') + num;
  }

  // Get a unique id
  var idCounter = 0;
  function uniqueId(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  }

  // Clock size
  var dialRadius = 100,
    outerRadius = 80,
    // innerRadius = 80 on 12 hour clock
    innerRadius = 54,
    tickRadius = 13,
    diameter = dialRadius * 2,
    duration = transitionSupported ? 350 : 1;

  // Popover template
  var tpl = ['<div class="popover clockpicker-popover">', '<div class="arrow"></div>', '<div class="popover-title">', '<span class="clockpicker-span-hours text-primary"></span>', ' : ', '<span class="clockpicker-span-minutes"></span>', '<span class="clockpicker-span-am-pm"></span>', '</div>', '<div class="popover-content">', '<div class="clockpicker-plate">', '<div class="clockpicker-canvas"></div>', '<div class="clockpicker-dial clockpicker-hours"></div>', '<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>', '</div>', '<span class="clockpicker-am-pm-block">', '</span>', '</div>', '</div>'].join('');

  // ClockPicker
  function ClockPicker(element, options) {
    var popover = $(tpl),
      plate = popover.find('.clockpicker-plate'),
      hoursView = popover.find('.clockpicker-hours'),
      minutesView = popover.find('.clockpicker-minutes'),
      amPmBlock = popover.find('.clockpicker-am-pm-block'),
      isInput = element.prop('tagName') === 'INPUT',
      input = isInput ? element : element.find('input'),
      addon = element.find('.input-group-addon'),
      self = this;
    //timer;

    this.id = uniqueId('cp');
    this.element = element;
    this.options = options;
    this.isAppended = false;
    this.isShown = false;
    this.currentView = 'hours';
    this.isInput = isInput;
    this.input = input;
    this.addon = addon;
    this.popover = popover;
    this.plate = plate;
    this.hoursView = hoursView;
    this.minutesView = minutesView;
    this.amPmBlock = amPmBlock;
    this.spanHours = popover.find('.clockpicker-span-hours');
    this.spanMinutes = popover.find('.clockpicker-span-minutes');
    this.spanAmPm = popover.find('.clockpicker-span-am-pm');
    this.amOrPm = "PM";
    //TSO: default set input to readonly
    if (options.cleartext) {
      this.element.prop("readonly", "readonly");
      if (!(this.element.attr("editable") == "false")) {
        var sty = this.element.attr("style");
        if (!sty) sty = "";
        sty = sty + " background-color: #ffffff; cursor: auto;";
        this.element.attr("style", sty);
      }
    }
    // Setup for for 12 hour clock if option is selected
    if (options.twelvehour) {
      /*
      var  amPmButtonsTemplate = ['<div class="clockpicker-am-pm-block">',
      	'<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-am-button">',
      	'AM</button>',
      	'<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-pm-button">',
      	'PM</button>',
      	'</div>'].join('');
      
      var amPmButtons = $(amPmButtonsTemplate);*/
      //amPmButtons.appendTo(plate);

      ////Not working b/c they are not shown when this runs
      //$('clockpicker-am-button')
      //    .on("click", function() {
      //        self.amOrPm = "AM";
      //        $('.clockpicker-span-am-pm').empty().append('AM');
      //    });
      //    
      //$('clockpicker-pm-button')
      //    .on("click", function() {
      //         self.amOrPm = "PM";
      //        $('.clockpicker-span-am-pm').empty().append('PM');
      //    });

      $('<button type="button" class="btn btn-sm btn-default clockpicker-button am-button">' + "AM" + '</button>').on("click", function () {
        self.amOrPm = "AM";
        $('.clockpicker-span-am-pm').empty().append('AM');
      }).appendTo(this.amPmBlock);
      $('<button type="button" class="btn btn-sm btn-default clockpicker-button pm-button">' + "PM" + '</button>').on("click", function () {
        self.amOrPm = 'PM';
        $('.clockpicker-span-am-pm').empty().append('PM');
      }).appendTo(this.amPmBlock);
    }
    if (!options.autoclose) {
      // If autoclose is not setted, append a button
      $('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button clock-close-button">' + options.donetext + '</button>').click($.proxy(this.done, this)).appendTo(popover);
    }
    if (options.cleartext) {
      $('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button clock-clear-button">' + options.cleartext + '</button>')
      //.click($.proxy(this.clear, this))
      .on("click", () => {
        this.clear();
        if (options.autoclose) this.hide();
      }).appendTo(popover);
    }

    // Placement and arrow align - make sure they make sense.
    if ((options.placement === 'top' || options.placement === 'bottom') && (options.align === 'top' || options.align === 'bottom')) options.align = 'left';
    if ((options.placement === 'left' || options.placement === 'right') && (options.align === 'left' || options.align === 'right')) options.align = 'top';
    popover.addClass(options.placement);
    popover.addClass('clockpicker-align-' + options.align);
    this.spanHours.click($.proxy(this.toggleView, this, 'hours'));
    this.spanMinutes.click($.proxy(this.toggleView, this, 'minutes'));

    // Show or toggle
    input.on('focus.clockpicker click.clockpicker', $.proxy(this.show, this));
    addon.on('click.clockpicker', $.proxy(this.toggle, this));

    // Build ticks
    var tickTpl = $('<div class="clockpicker-tick"></div>'),
      i,
      tick,
      radian,
      radius;

    // Hours view
    if (options.twelvehour) {
      for (i = 1; i < 13; i += 1) {
        tick = tickTpl.clone();
        radian = i / 6 * Math.PI;
        radius = outerRadius;
        tick.css('font-size', '120%');
        tick.css({
          left: dialRadius + Math.sin(radian) * radius - tickRadius,
          top: dialRadius - Math.cos(radian) * radius - tickRadius
        });
        tick.html(i === 0 ? '00' : i);
        hoursView.append(tick);
        tick.on(mousedownEvent, mousedown);
      }
    } else {
      for (i = 0; i < 24; i += 1) {
        tick = tickTpl.clone();
        radian = i / 6 * Math.PI;
        var inner = i > 0 && i < 13;
        radius = inner ? innerRadius : outerRadius;
        tick.css({
          left: dialRadius + Math.sin(radian) * radius - tickRadius,
          top: dialRadius - Math.cos(radian) * radius - tickRadius
        });
        if (inner) {
          tick.css('font-size', '120%');
        }
        tick.html(i === 0 ? '00' : i);
        hoursView.append(tick);
        tick.on(mousedownEvent, mousedown);
      }
    }

    // Minutes view
    for (i = 0; i < 60; i += 5) {
      tick = tickTpl.clone();
      radian = i / 30 * Math.PI;
      tick.css({
        left: dialRadius + Math.sin(radian) * outerRadius - tickRadius,
        top: dialRadius - Math.cos(radian) * outerRadius - tickRadius
      });
      tick.css('font-size', '120%');
      tick.html(leadingZero(i));
      minutesView.append(tick);
      tick.on(mousedownEvent, mousedown);
    }

    // Clicking on minutes view space
    plate.on(mousedownEvent, function (e) {
      if ($(e.target).closest('.clockpicker-tick').length === 0) {
        mousedown(e, true);
      }
    });

    // Mousedown or touchstart
    function mousedown(e, space) {
      var offset = plate.offset(),
        isTouch = /^touch/.test(e.type),
        x0 = offset.left + dialRadius,
        y0 = offset.top + dialRadius,
        dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
        dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
        z = Math.sqrt(dx * dx + dy * dy),
        moved = false;

      // When clicking on minutes view space, check the mouse position
      if (space && (z < outerRadius - tickRadius || z > outerRadius + tickRadius)) {
        return;
      }
      e.preventDefault();

      // Set cursor style of body after 200ms
      var movingTimer = setTimeout(function () {
        $body.addClass('clockpicker-moving');
      }, 200);

      // Place the canvas to top
      if (svgSupported) {
        plate.append(self.canvas);
      }

      // Clock
      self.setHand(dx, dy, !space, true);

      // Mousemove on document
      $doc.off(mousemoveEvent).on(mousemoveEvent, function (e) {
        e.preventDefault();
        var isTouch = /^touch/.test(e.type),
          x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
          y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
        if (!moved && x === dx && y === dy) {
          // Clicking in chrome on windows will trigger a mousemove event
          return;
        }
        moved = true;
        self.setHand(x, y, false, true);
      });

      // Mouseup on document
      $doc.off(mouseupEvent).on(mouseupEvent, function (e) {
        $doc.off(mouseupEvent);
        e.preventDefault();
        var isTouch = /^touch/.test(e.type),
          x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
          y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
        if ((space || moved) && x === dx && y === dy) {
          self.setHand(x, y);
        }
        if (self.currentView === 'hours') {
          self.toggleView('minutes', duration / 2);
        } else {
          if (options.autoclose) {
            self.minutesView.addClass('clockpicker-dial-out');
            setTimeout(function () {
              self.done();
            }, duration / 2);
          }
        }
        plate.prepend(canvas);

        // Reset cursor style of body
        clearTimeout(movingTimer);
        $body.removeClass('clockpicker-moving');

        // Unbind mousemove event
        $doc.off(mousemoveEvent);
      });
    }
    if (svgSupported) {
      // Draw clock hands and others
      var canvas = popover.find('.clockpicker-canvas'),
        svg = createSvgElement('svg');
      svg.setAttribute('class', 'clockpicker-svg');
      svg.setAttribute('width', diameter);
      svg.setAttribute('height', diameter);
      var g = createSvgElement('g');
      g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
      var bearing = createSvgElement('circle');
      bearing.setAttribute('class', 'clockpicker-canvas-bearing');
      bearing.setAttribute('cx', 0);
      bearing.setAttribute('cy', 0);
      bearing.setAttribute('r', 2);
      var hand = createSvgElement('line');
      hand.setAttribute('x1', 0);
      hand.setAttribute('y1', 0);
      var bg = createSvgElement('circle');
      bg.setAttribute('class', 'clockpicker-canvas-bg');
      bg.setAttribute('r', tickRadius);
      var fg = createSvgElement('circle');
      fg.setAttribute('class', 'clockpicker-canvas-fg');
      fg.setAttribute('r', 3.5);
      g.appendChild(hand);
      g.appendChild(bg);
      g.appendChild(fg);
      g.appendChild(bearing);
      svg.appendChild(g);
      canvas.append(svg);
      this.hand = hand;
      this.bg = bg;
      this.fg = fg;
      this.bearing = bearing;
      this.g = g;
      this.canvas = canvas;
    }
    raiseCallback(this.options.init);
  }
  function raiseCallback(callbackFunction) {
    if (callbackFunction && typeof callbackFunction === "function") {
      callbackFunction();
    }
  }

  // Default options
  ClockPicker.DEFAULTS = {
    'default': '',
    // default time, 'now' or '13:14' e.g.
    fromnow: 0,
    // set default time to * milliseconds from now (using with default = 'now')
    placement: 'bottom',
    // clock popover placement
    align: 'left',
    // popover arrow align
    donetext: '完成',
    // done button text
    autoclose: false,
    // auto close when minute is selected
    twelvehour: false,
    // change to 12 hour AM/PM clock from 24 hour
    vibrate: true // vibrate the device when dragging clock hand
  };

  // Show or hide popover
  ClockPicker.prototype.toggle = function () {
    this[this.isShown ? 'hide' : 'show']();
  };

  // Set popover position
  ClockPicker.prototype.locate = function () {
    var element = this.element,
      popover = this.popover,
      offset = element.offset(),
      width = element.outerWidth(),
      height = element.outerHeight(),
      placement = this.options.placement,
      align = this.options.align,
      styles = {};
    //self = this;

    popover.show();

    // Place the popover
    switch (placement) {
      case 'bottom':
        styles.top = offset.top + height;
        break;
      case 'right':
        styles.left = offset.left + width;
        break;
      case 'top':
        styles.top = offset.top - popover.outerHeight();
        break;
      case 'left':
        styles.left = offset.left - popover.outerWidth();
        break;
    }

    // Align the popover arrow
    switch (align) {
      case 'left':
        styles.left = offset.left;
        break;
      case 'right':
        styles.left = offset.left + width - popover.outerWidth();
        break;
      case 'top':
        styles.top = offset.top;
        break;
      case 'bottom':
        styles.top = offset.top + height - popover.outerHeight();
        break;
    }
    popover.css(styles);
  };

  // Show popover
  ClockPicker.prototype.show = function () {
    // Not show again
    if (this.isShown) {
      return;
    }
    //TSO: verify disable & editable 
    if (this.element.is(":disabled")) return;
    //if(this.element.is("[readonly]")) return;
    if (this.element.attr("editable") == "false") return;
    raiseCallback(this.options.beforeShow);
    var self = this;

    // Initialize
    if (!this.isAppended) {
      // Append popover to body
      $body = $(document.body).append(this.popover);

      // Reset position when resize
      $win.on('resize.clockpicker' + this.id, function () {
        if (self.isShown) {
          self.locate();
        }
      });
      this.isAppended = true;
    }

    // Get the time
    var value = ((this.input.prop('value') || this.options['default'] || '') + '').split(':');
    if (value[0] === 'now') {
      var now = new Date(+new Date() + this.options.fromnow);
      value = [now.getHours(), now.getMinutes()];
    }
    this.hours = +value[0] || 0;
    this.minutes = +value[1] || 0;
    this.spanHours.html(leadingZero(this.hours));
    this.spanMinutes.html(leadingZero(this.minutes));

    // Toggle to hours view
    this.toggleView('hours');

    // Set position
    this.locate();
    this.isShown = true;

    // Hide when clicking or tabbing on any element except the clock, input and addon
    $doc.on('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id, function (e) {
      var target = $(e.target);
      if (!target.hasClass("modal") && target.closest(self.popover).length === 0 && target.closest(self.addon).length === 0 && target.closest(self.input).length === 0) {
        self.hide();
      }
    });

    // Hide when ESC is pressed
    $doc.on('keyup.clockpicker.' + this.id, function (e) {
      if (e.keyCode === 27) {
        self.hide();
      }
    });
    raiseCallback(this.options.afterShow);
  };

  // Hide popover
  ClockPicker.prototype.hide = function () {
    raiseCallback(this.options.beforeHide);
    this.isShown = false;

    // Unbinding events on document
    $doc.off('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id);
    $doc.off('keyup.clockpicker.' + this.id);
    this.popover.hide();
    raiseCallback(this.options.afterHide);
  };

  // Toggle to hours or minutes view
  ClockPicker.prototype.toggleView = function (view, delay) {
    var raiseAfterHourSelect = false;
    if (view === 'minutes' && $(this.hoursView).css("visibility") === "visible") {
      raiseCallback(this.options.beforeHourSelect);
      raiseAfterHourSelect = true;
    }
    var isHours = view === 'hours',
      nextView = isHours ? this.hoursView : this.minutesView,
      hideView = isHours ? this.minutesView : this.hoursView;
    this.currentView = view;
    this.spanHours.toggleClass('text-primary', isHours);
    this.spanMinutes.toggleClass('text-primary', !isHours);

    // Let's make transitions
    hideView.addClass('clockpicker-dial-out');
    nextView.css('visibility', 'visible').removeClass('clockpicker-dial-out');

    // Reset clock hand
    this.resetClock(delay);

    // After transitions ended
    clearTimeout(this.toggleViewTimer);
    this.toggleViewTimer = setTimeout(function () {
      hideView.css('visibility', 'hidden');
    }, duration);
    if (raiseAfterHourSelect) {
      raiseCallback(this.options.afterHourSelect);
    }
  };

  // Reset clock hand
  ClockPicker.prototype.resetClock = function (delay) {
    var view = this.currentView,
      value = this[view],
      isHours = view === 'hours',
      unit = Math.PI / (isHours ? 6 : 30),
      radian = value * unit,
      radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
      x = Math.sin(radian) * radius,
      y = -Math.cos(radian) * radius,
      self = this;
    if (svgSupported && delay) {
      self.canvas.addClass('clockpicker-canvas-out');
      setTimeout(function () {
        self.canvas.removeClass('clockpicker-canvas-out');
        self.setHand(x, y);
      }, delay);
    } else {
      this.setHand(x, y);
    }
  };

  // Set clock hand to (x, y)
  ClockPicker.prototype.setHand = function (x, y, roundBy5, dragging) {
    var radian = Math.atan2(x, -y),
      isHours = this.currentView === 'hours',
      unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
      z = Math.sqrt(x * x + y * y),
      options = this.options,
      inner = isHours && z < (outerRadius + innerRadius) / 2,
      radius = inner ? innerRadius : outerRadius,
      value;
    if (options.twelvehour) {
      radius = outerRadius;
    }

    // Radian should in range [0, 2PI]
    if (radian < 0) {
      radian = Math.PI * 2 + radian;
    }

    // Get the round value
    value = Math.round(radian / unit);

    // Get the round radian
    radian = value * unit;

    // Correct the hours or minutes
    if (options.twelvehour) {
      if (isHours) {
        if (value === 0) {
          value = 12;
        }
      } else {
        if (roundBy5) {
          value *= 5;
        }
        if (value === 60) {
          value = 0;
        }
      }
    } else {
      if (isHours) {
        if (value === 12) {
          value = 0;
        }
        value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
      } else {
        if (roundBy5) {
          value *= 5;
        }
        if (value === 60) {
          value = 0;
        }
      }
    }

    // Once hours or minutes changed, vibrate the device
    if (this[this.currentView] !== value) {
      if (vibrate && this.options.vibrate) {
        // Do not vibrate too frequently
        if (!this.vibrateTimer) {
          navigator[vibrate](10);
          this.vibrateTimer = setTimeout($.proxy(function () {
            this.vibrateTimer = null;
          }, this), 100);
        }
      }
    }
    this[this.currentView] = value;
    this[isHours ? 'spanHours' : 'spanMinutes'].html(leadingZero(value));

    // If svg is not supported, just add an active class to the tick
    if (!svgSupported) {
      this[isHours ? 'hoursView' : 'minutesView'].find('.clockpicker-tick').each(function () {
        var tick = $(this);
        tick.toggleClass('active', value === +tick.html());
      });
      return;
    }

    // Place clock hand at the top when dragging
    if (dragging || !isHours && value % 5) {
      this.g.insertBefore(this.hand, this.bearing);
      this.g.insertBefore(this.bg, this.fg);
      this.bg.setAttribute('class', 'clockpicker-canvas-bg clockpicker-canvas-bg-trans');
    } else {
      // Or place it at the bottom
      this.g.insertBefore(this.hand, this.bg);
      this.g.insertBefore(this.fg, this.bg);
      this.bg.setAttribute('class', 'clockpicker-canvas-bg');
    }

    // Set clock hand and others' position
    var cx = Math.sin(radian) * radius,
      cy = -Math.cos(radian) * radius;
    this.hand.setAttribute('x2', cx);
    this.hand.setAttribute('y2', cy);
    this.bg.setAttribute('cx', cx);
    this.bg.setAttribute('cy', cy);
    this.fg.setAttribute('cx', cx);
    this.fg.setAttribute('cy', cy);
  };

  //TSO: add method clear
  ClockPicker.prototype.clear = function () {
    this.input.val("");
    this.input.get(0).dispatchEvent(new Event('input'));
  };

  // Hours and minutes are selected
  ClockPicker.prototype.done = function () {
    raiseCallback(this.options.beforeDone);
    this.hide();
    var last = this.input.prop('value'),
      value = leadingZero(this.hours) + ':' + leadingZero(this.minutes);
    if (this.options.twelvehour) {
      value = value + this.amOrPm;
    }
    this.input.prop('value', value);
    if (value !== last) {
      this.input.triggerHandler('change');
      if (!this.isInput) {
        this.element.trigger('change');
      }
    }
    if (this.options.autoclose) {
      this.input.trigger('blur');
    }
    raiseCallback(this.options.afterDone);
  };

  // Remove clockpicker from input
  ClockPicker.prototype.remove = function () {
    this.element.removeData('clockpicker');
    this.input.off('focus.clockpicker click.clockpicker');
    this.addon.off('click.clockpicker');
    if (this.isShown) {
      this.hide();
    }
    if (this.isAppended) {
      $win.off('resize.clockpicker' + this.id);
      this.popover.remove();
    }
  };

  // Extends $.fn.clockpicker
  $.fn.clockpicker = function (option) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
      var $this = $(this),
        data = $this.data('clockpicker');
      if (!data) {
        var options = $.extend({}, ClockPicker.DEFAULTS, $this.data(), typeof option == 'object' && option);
        $this.data('clockpicker', new ClockPicker($this, options));
      } else {
        // Manual operatsions. show, hide, remove, e.g.
        if (typeof data[option] === 'function') {
          data[option].apply(data, args);
        }
      }
    });
  };
})();
;// ./src/assets/json/program_message.json
var program_message_namespaceObject = /*#__PURE__*/JSON.parse('[{"code":"QS0001","TH":"คุณต้องการลบรายการนี้ใช่หรือไม่ %s","EN":"Do you want to delete this transaction? %s"},{"code":"QS0002","TH":"คุณต้องการบันทึกรายการนี้ใช่หรือไม่","EN":"Do you want to save this transaction?"},{"code":"QS0003","TH":"คุณต้องการยกเลิกรายการนี้ใช่หรือไม่","EN":"Do you want to cancel this transaction?"},{"code":"QS0004","TH":"บันทึกรายการเรียบร้อยแล้ว %s","EN":"Process Success %s"},{"code":"QS0005","TH":"ท่านต้องการลบรายการนี้ใช่หรือไม่ %s","EN":"Do you want to delete this record? %s"},{"code":"QS0006","TH":"คุณต้องการส่งรายการนี้ใช่หรือไม่","EN":"Do you want to send this transaction?"},{"code":"QS0007","TH":"คุณต้องการปรับปรุงรายการนี้ใช่หรือไม่","EN":"Do you want to update this transaction?"},{"code":"QS0008","TH":"คุณต้องการล้างรายการนี้ใช่หรือไม่","EN":"Do you want to clear this?"},{"code":"QS0009","TH":"คุณต้องการดำเนินการ รายการนี้ใช่หรือไม่","EN":"Do you want to process this transaction?"},{"code":"QS0010","TH":"คุณต้องการบันทึกเป็นรายการนี้ใช่หรือไม่","EN":"Do you want to save as this transaction ?"},{"code":"QS0011","TH":"คุณต้องการยืนยันการรับรายการนี้ใช่หรือไม่","EN":"Do you want to receive this transaction?"},{"code":"QS0012","TH":"คุณต้องการล้างและเริ่มใหม่รายการนี้ใช่หรือไม่","EN":"Do you want to reset this transaction?"},{"code":"QS0013","TH":"คุณต้องการลบ %s รายการใช่หรือไม่","EN":"Do you want to delete %s row(s)?"},{"code":"QS0014","TH":"คุณต้องการยืนยันการอนุมัติ  %s รายการนี้ใช่หรือไม่","EN":"Are you sure to confirm approve the %s request?"},{"code":"QS0015","TH":"คุณต้องการยืนยันการปฏิเสธ  %s รายการนี้ใช่หรือไม่","EN":"Are you sure to reject %s?"},{"code":"QS0016","TH":"คุณต้องการยืนยันการสร้างใบคำร้องใช่หรือไม่","EN":"Do you want to create this request?"},{"code":"QS0017","TH":"คุณต้องการนำเข้ารายการนี้ใช่หรือไม่","EN":"Do you want to import this transaction?"},{"code":"QS0018","TH":"คุณต้องการนำออกรายการนี้ใช่หรือไม่","EN":"Do you want to export this transaction?"},{"code":"QS0019","TH":"คุณต้องการส่งรายการนี้ใหม่ใช่หรือไม่?","EN":"Do you want to resend this transaction?"},{"code":"QS0020","TH":"คุณต้องการยืนยันการแก้ไขใหม่  %s รายการนี้ใช่หรือไม่","EN":"Are you sure to revise %s?"},{"code":"QS0306","TH":"ท่านต้องการลบรายการนี้ใช่หรือไม่ %s","EN":"Do you want to delete this model? %s"},{"code":"fsconfirmbtn","TH":"ตกลง","EN":"OK"},{"code":"fscancelbtn","TH":"ยกเลิก","EN":"Cancel"},{"code":"fssavebtn","TH":"บันทึก","EN":"Save"},{"code":"fsclosebtn","TH":"ปิด","EN":"Close"},{"code":"fsokbtn","TH":"ตกลง","EN":"OK"},{"code":"fsmessagetitle","TH":"ข้อความ","EN":"Message"},{"code":"fsaccepttitle","TH":"ยืนยัน","EN":"Confirm"},{"code":"fssuccessmsg","TH":"การดำเนินการสำเร็จ","EN":"Process success"},{"code":"fsfailmsg","TH":"การดำเนินการไม่สำเร็จ","EN":"Process fail"},{"code":"fsalert","TH":"คำเตือน","EN":"Alert"},{"code":"fswarn","TH":"คำเตือน","EN":"Warning"},{"code":"fsconfirm","TH":"ยืนยัน","EN":"Confirmation"},{"code":"fsinfo","TH":"ข้อความ","EN":"Information"},{"code":"QS8021","TH":"ท่านไม่มีสิทธิ์ดูรายการนี้","EN":"No permission to retrieve this transaction"},{"code":"QS8022","TH":"ท่านไม่มีสิทธิ์แก้ไขรายการนี้","EN":"No permission to edit this transaction"},{"code":"QS8023","TH":"ท่านไม่มีสิทธิ์ลบรายการนี้","EN":"No permission to delete this transaction"},{"code":"QS8024","TH":"ท่านไม่มีสิทธิ์สร้างรายการนี้","EN":"No permission to add this transaction"},{"code":"QS8025","TH":"ท่านไม่มีสิทธิ์นำเข้ารายการนี้","EN":"No permission to import this transaction"},{"code":"QS8026","TH":"ท่านไม่มีสิทธิ์นำออกรายการนี้","EN":"No permission to export this transaction"},{"code":"QS0101","TH":"ไม่พบข้อมูลที่ต้องการ โปรดกรุณาระบุและค้นหาใหม่","EN":"Record not found"},{"code":"QS0102","TH":"นำเข้าข้อมูลไม่ถูกต้อง","EN":"Invalid input"},{"code":"QS0103","TH":"ข้อมูลไม่ได้ระบุ","EN":"Value is undefined"},{"code":"QS0104","TH":"ปรับปรุงข้อมูลเรียบร้อย","EN":"Update success"},{"code":"QS0105","TH":"นำเข้าข้อมูลซ้ำซ้อน","EN":"Duplicate record"},{"code":"QS0201","TH":"Reset password success, Please verify your email for new password changed","EN":"Reset password success, Please verify your email for new password changed"},{"code":"QS0202","TH":"Reset Two Factor Success","EN":"Reset Two Factor Success"}]');
;// ./src/assets/json/default_label.json
var default_label_namespaceObject = /*#__PURE__*/JSON.parse('[{"language":"TH","label":[{"name":"EN_lang","value":"อังกฤษ"},{"name":"TH_lang","value":"ไทย"},{"name":"VN_lang","value":"เวียดนาม"},{"name":"CN_lang","value":"จีน"},{"name":"LA_lang","value":"ลาว"},{"name":"KM_lang","value":"กัมพูชา"},{"name":"JP_lang","value":"ญี่ปุ่น"},{"name":"english_lang","value":"อังกฤษ"},{"name":"thai_lang","value":"ไทย"},{"name":"title_new","value":"สร้างใหม่"},{"name":"title_edit","value":"แก้ไข"},{"name":"title_view","value":"มอง"},{"name":"save_button","value":"บันทึก"},{"name":"delete_button","value":"ลบ"},{"name":"retrieve_button","value":"เรียกดู"},{"name":"search_button","value":"ค้นหา"},{"name":"saveas_button","value":"บันทึกเป็น"},{"name":"submit_button","value":"ส่งข้อมูล"},{"name":"cancel_button","value":"ยกเลิก"},{"name":"clear_button","value":"ล้าง"},{"name":"reset_button","value":"ล้าง"},{"name":"update_button","value":"ปรับปรุง"},{"name":"close_button","value":"ปิด"},{"name":"send_button","value":"ส่ง"},{"name":"complete_button","value":"สำเร็จ"},{"name":"download_button","value":"ดาวน์โหลด"},{"name":"insert_button","value":"เพิ่ม"},{"name":"executebutton","value":"ปฏิบัติการ"},{"name":"ok_button","value":"ตกลง"},{"name":"import_button","value":"นำเข้า"},{"name":"export_button","value":"นำออก"},{"name":"remove_button","value":"ลบ"},{"name":"upload_button","value":"อัพโหลด"},{"name":"consend_button","value":"ส่งแบบสอบถาม"},{"name":"version_label","value":"รุ่น"},{"name":"action_label","value":" "},{"name":"active_label","value":"ใช้งาน"},{"name":"inactive_label","value":"ไม่ใช้งาน"},{"name":"all_label","value":"ทั้งหมด"},{"name":"seqno_label","value":"ลำดับที่"},{"name":"page_notfound","value":"ไม่พบหน้าใช้งาน"},{"name":"record_notfound","value":"ไม่พบรายการ"},{"name":"trx_notfound","value":"ไม่พบรายการ"},{"name":"invalid_alert","value":"กรอกข้อมูลไม่ถูกต้อง"},{"name":"empty_alert","value":"กรุณากรอกข้อมูล"}]},{"language":"EN","label":[{"name":"EN_lang","value":"English"},{"name":"TH_lang","value":"Thai"},{"name":"VN_lang","value":"Vietnam"},{"name":"CN_lang","value":"China"},{"name":"LA_lang","value":"Laos"},{"name":"KM_lang","value":"Cambodia"},{"name":"JP_lang","value":"Japan"},{"name":"english_lang","value":"English"},{"name":"thai_lang","value":"Thai"},{"name":"title_new","value":"Add New"},{"name":"title_edit","value":"Edit"},{"name":"title_view","value":"View"},{"name":"save_button","value":"Save"},{"name":"delete_button","value":"Delete"},{"name":"retrieve_button","value":"Retrieve"},{"name":"search_button","value":"Search"},{"name":"saveas_button","value":"Save As"},{"name":"submit_button","value":"Submit Data"},{"name":"cancel_button","value":"Cancel"},{"name":"clear_button","value":"Clear"},{"name":"reset_button","value":"Clear"},{"name":"close_button","value":"Close"},{"name":"update_button","value":"Update"},{"name":"send_button","value":"Send"},{"name":"complete_button","value":"Complete"},{"name":"download_button","value":"Down Load"},{"name":"insert_button","value":"Insert"},{"name":"execute_button","value":"Execute"},{"name":"ok_button","value":"OK"},{"name":"import_button","value":"Import"},{"name":"export_button","value":"Export"},{"name":"remove_button","value":"Remove"},{"name":"upload_button","value":"Upload"},{"name":"consend_button","value":"Send"},{"name":"version_label","value":"Version"},{"name":"action_label","value":" "},{"name":"active_label","value":"Active"},{"name":"inactive_label","value":"Inactive"},{"name":"all_label","value":"All"},{"name":"seqno_label","value":"No."},{"name":"page_notfound","value":"Page not found"},{"name":"record_notfound","value":"Record not found"},{"name":"trx_notfound","value":"Transaction not found"},{"name":"invalid_alert","value":"Invalid input"},{"name":"empty_alert","value":"This cannot be empty"}]}]');
;// ./src/assets/json/program_label.json
var program_label_namespaceObject = /*#__PURE__*/JSON.parse('[{"language":"TH","label":[{"name":"caption_title","value":"จัดตั้งงาน"},{"name":"fromdate_label","value":"จากวันที่"},{"name":"todate_label","value":"ถึงวันที่"},{"name":"taskname_head","value":"ชื่องาน"},{"name":"createdate_head","value":"วันที่"},{"name":"createtime_head","value":"เวลา"},{"name":"tasktype_head","value":"ประเภทงาน"},{"name":"taskid_label","value":"รหัสงาน"},{"name":"shareflag_label","value":"แบ่งปัน"},{"name":"taskname_label","value":"ชื่องาน"},{"name":"connectid_label","value":"การเชื่อมต่อ"},{"name":"taskconfigs_label","value":"กำหนดค่างาน"},{"name":"taskmodel_label","value":"แบบงาน"},{"name":"modelname_label","value":"ชื่อแบบ"},{"name":"tablename_label","value":"ชื่อตาราง"},{"name":"tablefields_label","value":"เขตข้อมูลตาราง"},{"name":"tablesettings_label","value":"ตั้งค่าตาราง"},{"name":"submodels_label","value":"แบบงานย่อย"},{"name":"title_new_connection","value":"สร้างการเชื่อมต่อใหม่"},{"name":"title_edit_connection","value":"แก้ไขการเชื่อมต่อ"},{"name":"connectid_label","value":"รหัสการเชื่อมต่อ"},{"name":"connectname_label","value":"ชื่อการเชื่อมต่อ"},{"name":"connecttype_label","value":"ชนิดการเชื่อมต่อ"},{"name":"connectapi_label","value":"API URL"},{"name":"connectsetting_label","value":"API Header"},{"name":"connectbody_label","value":"API Parameter"},{"name":"connectsettinginfo_label","value":"JSON format settings eg. {\\"key1\\":\\"value1\\",\\"key2\\":\\"value2\\"}"},{"name":"connectbodyinfo_label","value":"JSON format settings eg. {\\"key1\\":\\"value1\\",\\"key2\\":\\"value2\\"}"},{"name":"connectdialect_label","value":"ชนิดฐานข้อมูล"},{"name":"connecturl_label","value":"การเชื่อมต่อ URL"},{"name":"connectuser_label","value":"ผู้ใช้"},{"name":"connectpassword_label","value":"รหัสผ่าน"},{"name":"connectdatabase_label","value":"ฐานข้อมูล"},{"name":"connecthost_label","value":"โฮส"},{"name":"connectport_label","value":"ช่องสื่อสาร"}]},{"language":"EN","label":[{"name":"caption_title","value":"Task Setting"},{"name":"fromdate_label","value":"From Date"},{"name":"todate_label","value":"To Date"},{"name":"taskname_head","value":"Task Name"},{"name":"createdate_head","value":"Date"},{"name":"createtime_head","value":"Time"},{"name":"tasktype_head","value":"Task Type"},{"name":"taskid_label","value":"Task ID"},{"name":"shareflag_label","value":"Sharing"},{"name":"taskname_label","value":"Task Name"},{"name":"connectid_label","value":"Connection"},{"name":"taskconfigs_label","value":"Task Configuration"},{"name":"taskmodel_label","value":"Task Model"},{"name":"modelname_label","value":"Model Name"},{"name":"tablename_label","value":"Table Name"},{"name":"tablefields_label","value":"Table Fields"},{"name":"tablesettings_label","value":"Table Setting"},{"name":"submodels_label","value":"Sub Model"},{"name":"title_new_connection","value":"New Connection"},{"name":"title_edit_connection","value":"Edit Connection"},{"name":"connectid_label","value":"Connection ID"},{"name":"connectname_label","value":"Connection Name"},{"name":"connecttype_label","value":"Connection Type"},{"name":"connectapi_label","value":"API URL"},{"name":"connectsetting_label","value":"API Header"},{"name":"connectbody_label","value":"API Parameter"},{"name":"connectsettinginfo_label","value":"JSON format settings eg. {\\"key1\\":\\"value1\\",\\"key2\\":\\"value2\\"}"},{"name":"connectbodyinfo_label","value":"JSON format settings eg. {\\"key1\\":\\"value1\\",\\"key2\\":\\"value2\\"}"},{"name":"connectdialect_label","value":"Dialect"},{"name":"connecturl_label","value":"Connection URL"},{"name":"connectuser_label","value":"User"},{"name":"connectpassword_label","value":"Password"},{"name":"connectdatabase_label","value":"Database"},{"name":"connecthost_label","value":"Host"},{"name":"connectport_label","value":"Port"}]}]');
// EXTERNAL MODULE: ./node_modules/@willsofts/will-app/index.js
var will_app = __webpack_require__(4122);
// EXTERNAL MODULE: ./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var runtime_core_esm_bundler = __webpack_require__(6768);
// EXTERNAL MODULE: ./node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
var runtime_dom_esm_bundler = __webpack_require__(5130);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/AppVmte001.vue?vue&type=template&id=6d6e1971

const _hoisted_1 = {
  class: "pt-page pt-page-current pt-page-controller search-pager"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_PageHeader = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("PageHeader");
  const _component_SearchForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("SearchForm");
  const _component_EntryForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("EntryForm");
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, [_cache[0] || (_cache[0] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    id: "fswaitlayer",
    class: "fa fa-spinner fa-spin"
  }, null, -1)), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_1, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_PageHeader, {
    ref: "pageHeader",
    labels: $setup.labels,
    pid: "emte001",
    version: "1.0.0",
    showLanguage: "true",
    onLanguageChanged: $options.changeLanguage,
    multiLanguages: $setup.multiLanguages,
    build: $setup.buildVersion
  }, null, 8, ["labels", "onLanguageChanged", "multiLanguages", "build"]), (0,runtime_core_esm_bundler/* createVNode */.bF)(_component_SearchForm, {
    ref: "searchForm",
    labels: $setup.labels,
    dataCategory: $setup.dataCategory,
    onDataSelect: $options.dataSelected,
    onDataInsert: $options.dataInsert
  }, null, 8, ["labels", "dataCategory", "onDataSelect", "onDataInsert"])]), ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createBlock */.Wv)(runtime_core_esm_bundler/* Teleport */.Im, {
    to: "#modaldialog"
  }, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_EntryForm, {
    ref: "entryForm",
    labels: $setup.labels,
    dataCategory: $setup.dataCategory,
    onDataSaved: $options.dataSaved,
    onDataUpdated: $options.dataUpdated,
    onDataDeleted: $options.dataDeleted
  }, null, 8, ["labels", "dataCategory", "onDataSaved", "onDataUpdated", "onDataDeleted"])]))], 64);
}
;// ./src/AppVmte001.vue?vue&type=template&id=6d6e1971

// EXTERNAL MODULE: ./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var reactivity_esm_bundler = __webpack_require__(144);
// EXTERNAL MODULE: ./node_modules/@willsofts/will-control/dist/will-control.umd.js
var will_control_umd = __webpack_require__(3301);
// EXTERNAL MODULE: ./node_modules/@vue/shared/dist/shared.esm-bundler.js
var shared_esm_bundler = __webpack_require__(4232);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/SearchForm.vue?vue&type=template&id=5b306cd6

const SearchFormvue_type_template_id_5b306cd6_hoisted_1 = {
  id: "searchpanel",
  class: "panel-body search-panel"
};
const _hoisted_2 = {
  class: "row row-height"
};
const _hoisted_3 = {
  class: "col-height col-md-2"
};
const _hoisted_4 = {
  class: "col-height col-md-2"
};
const _hoisted_5 = {
  for: "fromdate"
};
const _hoisted_6 = {
  class: "col-height col-md-2"
};
const _hoisted_7 = {
  for: "todate"
};
const _hoisted_8 = {
  class: "col-height col-md"
};
const _hoisted_9 = {
  id: "listpanel",
  class: "table-responsive fa-list-panel"
};
function SearchFormvue_type_template_id_5b306cd6_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_InputDate = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("InputDate");
  const _component_DataTable = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("DataTable");
  const _component_DataPaging = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("DataPaging");
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("div", SearchFormvue_type_template_id_5b306cd6_hoisted_1, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_2, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_3, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", null, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.taskname_label), 1), (0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
    type: "text",
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.localData.taskname = $event),
    class: "form-control input-md",
    maxlength: "150"
  }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.taskname]])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_4, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_5, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.fromdate_label), 1), (0,runtime_core_esm_bundler/* createVNode */.bF)(_component_InputDate, {
    modelValue: $setup.localData.fromdate,
    "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.localData.fromdate = $event)
  }, null, 8, ["modelValue"])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_6, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_7, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.todate_label), 1), (0,runtime_core_esm_bundler/* createVNode */.bF)(_component_InputDate, {
    modelValue: $setup.localData.todate,
    "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => $setup.localData.todate = $event)
  }, null, 8, ["modelValue"])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_8, [_cache[9] || (_cache[9] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("br", null, null, -1)), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", {
    onClick: _cache[3] || (_cache[3] = (...args) => $options.searchClick && $options.searchClick(...args)),
    class: "btn btn-dark btn-sm btn-ctrl"
  }, [_cache[6] || (_cache[6] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("i", {
    class: "fa fa-search fa-btn-icon",
    "aria-hidden": "true"
  }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.search_button), 1)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", {
    onClick: _cache[4] || (_cache[4] = (...args) => $options.resetClick && $options.resetClick(...args)),
    class: "btn btn-dark btn-sm btn-ctrl"
  }, [_cache[7] || (_cache[7] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("i", {
    class: "fa fa-refresh fa-btn-icon",
    "aria-hidden": "true"
  }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.reset_button), 1)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", {
    onClick: _cache[5] || (_cache[5] = (...args) => $options.insertClick && $options.insertClick(...args)),
    class: "btn btn-dark btn-sm btn-ctrl pull-right"
  }, [_cache[8] || (_cache[8] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("i", {
    class: "fa fa-plus fa-btn-icon",
    "aria-hidden": "true"
  }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.insert_button), 1)])])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_9, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_DataTable, {
    ref: "dataTable",
    settings: $setup.tableSettings,
    labels: $props.labels,
    dataset: $setup.dataset,
    onDataSelect: $options.dataSelected,
    onDataSort: $options.dataSorted
  }, null, 8, ["settings", "labels", "dataset", "onDataSelect", "onDataSort"]), (0,runtime_core_esm_bundler/* createVNode */.bF)(_component_DataPaging, {
    ref: "dataPaging",
    settings: $setup.pagingSettings,
    onPageSelect: $options.pageSelected
  }, null, 8, ["settings", "onPageSelect"])])]);
}
;// ./src/components/SearchForm.vue?vue&type=template&id=5b306cd6

;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/SearchForm.vue?vue&type=script&lang=js







const APP_URL = "/api/emte001";
const defaultData = {
  taskname: '',
  fromdate: "",
  todate: ""
};
const tableSettings = {
  sequence: {
    label: "seqno_label"
  },
  columns: [{
    name: "taskname",
    type: "STRING",
    sorter: "taskname",
    label: "taskname_head"
  }, {
    name: "createdate",
    type: "DATE",
    sorter: "createdate",
    label: "createdate_head",
    css: "text-center"
  }, {
    name: "createtime",
    type: "TIME",
    sorter: "createtime",
    label: "createtime_head",
    css: "text-center"
  }, {
    name: "tasktype",
    type: "STRING",
    sorter: "tasktype",
    label: "tasktype_head",
    css: "text-center"
  }],
  actions: [{
    type: "button",
    action: "edit"
  }, {
    type: "button",
    action: "delete"
  }]
};
/* harmony default export */ var SearchFormvue_type_script_lang_js = ({
  components: {
    InputDate: will_control_umd.InputDate,
    DataTable: will_control_umd.DataTable,
    DataPaging: will_control_umd.DataPaging
  },
  props: {
    labels: Object,
    formData: Object,
    dataCategory: Object
  },
  emits: ["data-select", "data-insert"],
  setup(props) {
    const localData = (0,reactivity_esm_bundler/* ref */.KR)({
      ...defaultData,
      ...props.formData
    });
    let paging = new will_app/* Paging */.lK();
    let pagingSettings = paging.setting;
    let filters = {};
    //select2 data options must in format {id:?, text:?}
    //const statusOptions = props.dataCategory.marrystatus.map((item) => { return {id: item.key, text: item.text}});
    const dataset = (0,reactivity_esm_bundler/* ref */.KR)({});
    const mask = new will_app/* KnMask */.O6();
    return {
      localData,
      tableSettings,
      pagingSettings,
      paging,
      filters,
      dataset,
      mask
    };
  },
  methods: {
    reset(newData) {
      if (newData) this.localData = {
        ...newData
      };
    },
    getPagingOptions(settings) {
      if (!settings) settings = this.pagingSettings;
      return {
        page: settings.page,
        limit: settings.limit,
        rowsPerPage: settings.rowsPerPage,
        orderBy: settings.orderBy ? settings.orderBy : "",
        orderDir: settings.orderDir ? settings.orderDir : ""
      };
    },
    resetClick() {
      this.localData = {
        ...defaultData
      };
      this.resetFilters();
      this.$refs.dataTable.clear();
      this.$refs.dataPaging.clear();
      this.pagingSettings.rows = 0;
    },
    insertClick() {
      this.$emit('data-insert', this.filters);
    },
    searchClick() {
      this.filters = {
        ...this.localData
      };
      this.resetFilters();
      this.search();
    },
    resetFilters() {
      this.pagingSettings.page = 1;
      this.pagingSettings.orderBy = "";
      this.pagingSettings.orderDir = "";
    },
    search(ensurePaging = false) {
      if (ensurePaging) {
        if (this.pagingSettings.rows <= 1 && this.pagingSettings.page > 1) {
          this.pagingSettings.page = this.pagingSettings.page - 1;
        }
      }
      console.log("search: pagingSettings", this.pagingSettings);
      let options = this.getPagingOptions();
      this.collecting(options, this.filters);
    },
    collecting(options, criterias) {
      console.log("collecting: options", options, ", criteria", criterias);
      let jsondata = Object.assign({
        ajax: true
      }, options);
      //Object.assign(jsondata,criterias);
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, criterias);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + APP_URL + "/collect",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("collecting: success", data);
          if (data.body) {
            this.$refs.dataTable.reset(data.body);
            this.$refs.dataPaging.reset(data.body?.offsets);
            this.pagingSettings.rows = data.body?.rows?.length;
          }
        }
      });
    },
    pageSelected(item) {
      console.log("page selected:", item);
      this.pagingSettings.page = item.page;
      let options = this.getPagingOptions();
      this.collecting(options, this.filters);
    },
    dataSelected(item, action) {
      console.log("dataSelected", item, "action", action);
      this.$emit('data-select', item, action);
    },
    dataSorted(sorter, direction) {
      console.log("dataSorted", sorter, "direction", direction);
      this.pagingSettings.orderBy = sorter;
      this.pagingSettings.orderDir = direction;
      let options = this.getPagingOptions();
      this.collecting(options, this.filters);
    }
  }
});
;// ./src/components/SearchForm.vue?vue&type=script&lang=js
 
// EXTERNAL MODULE: ./node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(1241);
;// ./src/components/SearchForm.vue




;
const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.A)(SearchFormvue_type_script_lang_js, [['render',SearchFormvue_type_template_id_5b306cd6_render]])

/* harmony default export */ var SearchForm = (__exports__);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/EntryForm.vue?vue&type=template&id=4c73cd07

const EntryFormvue_type_template_id_4c73cd07_hoisted_1 = {
  key: 0,
  class: "modal-title"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_2 = {
  key: 1,
  class: "modal-title"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_3 = {
  class: "row row-height"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_4 = {
  class: "col-height col-md-7"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_5 = {
  for: "taskid"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_6 = {
  key: 0,
  class: "has-error"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_7 = {
  class: "col-height col-md-3"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_8 = {
  class: "checkbox checkbox form-check",
  id: "shareflagbox"
};
const EntryFormvue_type_template_id_4c73cd07_hoisted_9 = {
  for: "shareflag",
  class: "control-label form-check-label",
  title: "Sharing task with other"
};
const _hoisted_10 = {
  class: "row row-height"
};
const _hoisted_11 = {
  class: "col-height col-md-10"
};
const _hoisted_12 = {
  for: "taskname"
};
const _hoisted_13 = {
  key: 0,
  class: "has-error"
};
const _hoisted_14 = {
  class: "row row-height"
};
const _hoisted_15 = {
  class: "col-height col-md-7"
};
const _hoisted_16 = {
  class: "input-group"
};
const _hoisted_17 = ["value"];
const _hoisted_18 = {
  class: "row row-height"
};
const _hoisted_19 = {
  class: "col-height col-md-12"
};
const _hoisted_20 = {
  for: "taskconfigs"
};
const _hoisted_21 = {
  key: 0,
  class: "has-error"
};
const _hoisted_22 = {
  class: "row row-height"
};
const _hoisted_23 = {
  class: "col-height col-md-12"
};
const _hoisted_24 = {
  id: "fsmodeltablayer"
};
const _hoisted_25 = {
  id: "fsmodeltabbar",
  class: "nav nav-tabs navbar-left nav-tabbar-agent",
  role: "tablist"
};
const _hoisted_26 = ["id", "href", "data-target", "aria-controls", "aria-selected"];
const _hoisted_27 = ["id", "onClick"];
const _hoisted_28 = {
  id: "entrytabmodel",
  class: "tab-content"
};
const _hoisted_29 = ["id", "data-model", "data-index"];
const _hoisted_30 = {
  class: "btn btn-dark btn-sm",
  "data-dismiss": "modal"
};
function EntryFormvue_type_template_id_4c73cd07_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ModelForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("ModelForm");
  const _component_DialogForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("DialogForm");
  const _component_ConnectionForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("ConnectionForm");
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_DialogForm, {
    ref: "dialogForm"
  }, {
    header: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [$options.insertMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("h4", EntryFormvue_type_template_id_4c73cd07_hoisted_1, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.title_new), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), $options.updateMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("h4", EntryFormvue_type_template_id_4c73cd07_hoisted_2, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.title_edit), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]),
    default: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", EntryFormvue_type_template_id_4c73cd07_hoisted_3, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", EntryFormvue_type_template_id_4c73cd07_hoisted_4, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", EntryFormvue_type_template_id_4c73cd07_hoisted_5, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.taskid_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.taskid.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "taskid",
      type: "text",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.localData.taskid = $event),
      id: "taskid",
      class: "form-control input-md",
      maxlength: "50",
      readonly: ""
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.taskid]]), _cache[10] || (_cache[10] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.taskid.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", EntryFormvue_type_template_id_4c73cd07_hoisted_6, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.taskid.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", EntryFormvue_type_template_id_4c73cd07_hoisted_7, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", EntryFormvue_type_template_id_4c73cd07_hoisted_8, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "shareflag",
      type: "checkbox",
      id: "shareflag",
      "true-value": 1,
      "false-value": 0,
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.localData.shareflag = $event),
      class: "form-control input-md form-check-input",
      title: "Sharing task with other"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelCheckbox */.lH, $setup.localData.shareflag]]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", EntryFormvue_type_template_id_4c73cd07_hoisted_9, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.shareflag_label), 1)])])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_10, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_11, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_12, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.taskname_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.taskname.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "taskname",
      type: "text",
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => $setup.localData.taskname = $event),
      id: "taskname",
      class: "form-control input-md",
      maxlength: "150"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.taskname]]), _cache[11] || (_cache[11] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.taskname.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_13, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.taskname.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_14, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_15, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", null, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectid_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_16, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("select", {
      ref: "connectid",
      "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => $setup.localData.connectid = $event),
      class: "form-control input-md"
    }, [_cache[12] || (_cache[12] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("option", {
      value: ""
    }, null, -1)), ((0,runtime_core_esm_bundler/* openBlock */.uX)(true), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, (0,runtime_core_esm_bundler/* renderList */.pI)($props.dataCategory.tmigrateconnect, (value, key) => {
      return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("option", {
        key: key,
        value: key
      }, (0,shared_esm_bundler/* toDisplayString */.v_)(value), 9, _hoisted_17);
    }), 128))], 512), [[runtime_dom_esm_bundler/* vModelSelect */.u1, $setup.localData.connectid]]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("a", {
      href: "javascript:void(0)",
      id: "connecteditbutton",
      onClick: _cache[4] || (_cache[4] = (...args) => $options.connectRetrieve && $options.connectRetrieve(...args)),
      class: "input-group-addon input-group-append input-group-text",
      title: "Edit Connection",
      tabindex: "-1"
    }, _cache[13] || (_cache[13] = [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-edit",
      "aria-hidden": "true"
    }, null, -1)])), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("a", {
      href: "javascript:void(0)",
      id: "connectnewbutton",
      onClick: _cache[5] || (_cache[5] = (...args) => $options.connectInsert && $options.connectInsert(...args)),
      class: "input-group-addon input-group-append input-group-text",
      title: "New Connection",
      tabindex: "-1"
    }, _cache[14] || (_cache[14] = [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-plus",
      "aria-hidden": "true"
    }, null, -1)]))])])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_18, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_19, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_20, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.taskconfigs_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.taskconfigs.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
      ref: "taskconfigs",
      type: "text",
      "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => $setup.localData.taskconfigs = $event),
      id: "taskconfigs",
      class: "form-control input-md validate-json",
      rows: "5"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.taskconfigs]])], 2), $setup.v$.taskconfigs.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_21, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.taskconfigs.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_22, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_23, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", null, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.taskmodel_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("a", {
      href: "javascript:void(0)",
      id: "addmodelbutton",
      onClick: _cache[7] || (_cache[7] = (...args) => $options.addModelClick && $options.addModelClick(...args)),
      class: "btn btn-primary btn-md",
      title: "Add Model",
      tabindex: "-1"
    }, _cache[15] || (_cache[15] = [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("i", {
      class: "fa fa-plus fa-btn-icon",
      "aria-hidden": "true"
    }, null, -1)]))])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_24, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("ul", _hoisted_25, [((0,runtime_core_esm_bundler/* openBlock */.uX)(true), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, (0,runtime_core_esm_bundler/* renderList */.pI)($setup.localData.models, (item, index) => {
      return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("li", {
        key: item.modelid,
        class: "nav-item active",
        role: "presentation"
      }, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("a", {
        class: (0,shared_esm_bundler/* normalizeClass */.C4)(["nav-link model-link", {
          active: index === 0
        }]),
        "data-toggle": "tab",
        role: "tab",
        id: 'linker_' + item.modelid,
        href: '#entrymodel_' + item.modelid,
        "data-target": '#entrymodel_' + item.modelid,
        "aria-controls": 'entrymodel_' + item.modelid,
        "aria-selected": index === 0 ? 'true' : 'false'
      }, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", null, (0,shared_esm_bundler/* toDisplayString */.v_)(item.modelname), 1), !(index === 0) ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", {
        key: 0,
        id: 'dellink_' + item.modelid,
        class: "del-linker",
        onClick: $event => $options.deleteModelClick(item)
      }, _cache[16] || (_cache[16] = [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("i", {
        class: "fa fa-times-circle"
      }, null, -1)]), 8, _hoisted_27)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)], 10, _hoisted_26)]);
    }), 128))])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_28, [((0,runtime_core_esm_bundler/* openBlock */.uX)(true), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, (0,runtime_core_esm_bundler/* renderList */.pI)($setup.localData.models, (item, index) => {
      return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("div", {
        key: item.modelid,
        class: (0,shared_esm_bundler/* normalizeClass */.C4)(["tab-pane fade entry-models", {
          'active show': index === 0
        }]),
        id: 'entrymodel_' + item.modelid,
        "data-model": item.modelid,
        "data-index": index
      }, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_ModelForm, {
        scope: "entry",
        ref_for: true,
        ref: "modelForm",
        labels: $props.labels,
        dataCategory: $props.dataCategory,
        dataModel: item,
        index: index
      }, null, 8, ["labels", "dataCategory", "dataModel", "index"])], 10, _hoisted_29);
    }), 128))])]),
    footer: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [$options.insertMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("button", {
      key: 0,
      ref: "savebutton",
      id: "savebutton",
      class: "btn btn-dark btn-sm",
      onClick: _cache[8] || (_cache[8] = (...args) => $options.saveClick && $options.saveClick(...args))
    }, [_cache[17] || (_cache[17] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-save fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.save_button), 1)], 512)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), $options.updateMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("button", {
      key: 1,
      ref: "updatebutton",
      id: "updatebutton",
      class: "btn btn-dark btn-sm",
      onClick: _cache[9] || (_cache[9] = (...args) => $options.updateClick && $options.updateClick(...args))
    }, [_cache[18] || (_cache[18] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-save fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.update_button), 1)], 512)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", _hoisted_30, [_cache[19] || (_cache[19] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-close fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.cancel_button), 1)])]),
    _: 1
  }, 512), ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createBlock */.Wv)(runtime_core_esm_bundler/* Teleport */.Im, {
    to: "#connectiondialog"
  }, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_ConnectionForm, {
    ref: "connectionForm",
    labels: $props.labels,
    dataCategory: $props.dataCategory,
    onConnectSaved: $options.connectSaved,
    onConnectUpdated: $options.connectUpdated,
    onConnectDeleted: $options.connectDeleted
  }, null, 8, ["labels", "dataCategory", "onConnectSaved", "onConnectUpdated", "onConnectDeleted"])]))], 64);
}
;// ./src/components/EntryForm.vue?vue&type=template&id=4c73cd07

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.push.js
var es_array_push = __webpack_require__(4114);
// EXTERNAL MODULE: ./node_modules/uuid/dist/esm-browser/v4.js + 3 modules
var v4 = __webpack_require__(4963);
// EXTERNAL MODULE: ./node_modules/@vuelidate/core/dist/index.mjs
var dist = __webpack_require__(7760);
// EXTERNAL MODULE: ./node_modules/@vuelidate/validators/dist/index.mjs
var validators_dist = __webpack_require__(9428);
;// ./src/assets/js/app.libs.js
function validJSON(value) {
  try {
    if (value && value.trim().length > 0) {
      JSON.parse(value);
    }
  } catch (ex) {
    return false;
  }
  return true;
}
function validJSONArray(value) {
  try {
    if (value && value.trim().length > 0) {
      let json = JSON.parse(value);
      return Array.isArray(json);
    }
  } catch (ex) {
    return false;
  }
  return true;
}
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/DialogForm.vue?vue&type=template&id=29260377

const DialogFormvue_type_template_id_29260377_hoisted_1 = ["id"];
const DialogFormvue_type_template_id_29260377_hoisted_2 = {
  class: "modal-content portal-area fa-portal-area"
};
const DialogFormvue_type_template_id_29260377_hoisted_3 = {
  class: "modal-header"
};
const DialogFormvue_type_template_id_29260377_hoisted_4 = {
  class: "entry-dialog-layer"
};
const DialogFormvue_type_template_id_29260377_hoisted_5 = {
  class: "row-heighter modal-footer"
};
function DialogFormvue_type_template_id_29260377_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("div", (0,runtime_core_esm_bundler/* mergeProps */.v6)({
    id: $props.id,
    class: "modal fade pt-page pt-page-item",
    tabindex: "-1",
    role: "dialog"
  }, _ctx.$attrs), [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["modal-dialog", $props.sizing])
  }, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", DialogFormvue_type_template_id_29260377_hoisted_2, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", DialogFormvue_type_template_id_29260377_hoisted_3, [(0,runtime_core_esm_bundler/* renderSlot */.RG)(_ctx.$slots, "header"), _cache[0] || (_cache[0] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", {
    type: "button",
    class: "close",
    "data-dismiss": "modal"
  }, "×", -1))]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", DialogFormvue_type_template_id_29260377_hoisted_4, [(0,runtime_core_esm_bundler/* renderSlot */.RG)(_ctx.$slots, "default")]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", DialogFormvue_type_template_id_29260377_hoisted_5, [(0,runtime_core_esm_bundler/* renderSlot */.RG)(_ctx.$slots, "footer")])])], 2)], 16, DialogFormvue_type_template_id_29260377_hoisted_1);
}
;// ./src/components/DialogForm.vue?vue&type=template&id=29260377

;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/DialogForm.vue?vue&type=script&lang=js
/* harmony default export */ var DialogFormvue_type_script_lang_js = ({
  props: {
    id: {
      type: String,
      default: "modaldialog_layer"
    },
    sizing: {
      type: String,
      default: "modal-lg"
    }
  }
});
;// ./src/components/DialogForm.vue?vue&type=script&lang=js
 
;// ./src/components/DialogForm.vue




;
const DialogForm_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(DialogFormvue_type_script_lang_js, [['render',DialogFormvue_type_template_id_29260377_render]])

/* harmony default export */ var DialogForm = (DialogForm_exports_);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/ModelForm.vue?vue&type=template&id=74b9fabc

const ModelFormvue_type_template_id_74b9fabc_hoisted_1 = {
  class: "row row-height"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_2 = {
  class: "col-height col-md-10"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_3 = {
  class: "control-label"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_4 = ["id"];
const ModelFormvue_type_template_id_74b9fabc_hoisted_5 = {
  key: 0,
  class: "has-error"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_6 = {
  class: "row row-height"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_7 = {
  class: "col-height col-md-5"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_8 = {
  class: "control-label"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_9 = ["id"];
const ModelFormvue_type_template_id_74b9fabc_hoisted_10 = {
  key: 0,
  class: "has-error"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_11 = {
  class: "row row-height"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_12 = {
  class: "col-height col-md-12"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_13 = {
  class: "control-label"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_14 = ["id"];
const ModelFormvue_type_template_id_74b9fabc_hoisted_15 = {
  key: 0,
  class: "has-error"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_16 = {
  class: "row row-height"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_17 = {
  class: "col-height col-md-12"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_18 = {
  class: "control-label"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_19 = ["id"];
const ModelFormvue_type_template_id_74b9fabc_hoisted_20 = {
  key: 0,
  class: "has-error"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_21 = {
  class: "row row-height"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_22 = {
  class: "col-height col-md-12"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_23 = {
  class: "control-label"
};
const ModelFormvue_type_template_id_74b9fabc_hoisted_24 = ["id"];
const ModelFormvue_type_template_id_74b9fabc_hoisted_25 = {
  key: 0,
  class: "has-error"
};
function ModelFormvue_type_template_id_74b9fabc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_1, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_2, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ModelFormvue_type_template_id_74b9fabc_hoisted_3, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.modelname_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
      'has-error': $setup.v$.modelname.$error
    }])
  }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
    type: "text",
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.localData.modelname = $event),
    id: 'modelname_' + $setup.localData.modelid,
    class: "form-control input-md irequired alert-input model-name",
    maxlength: "150"
  }, null, 8, ModelFormvue_type_template_id_74b9fabc_hoisted_4), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.modelname]])], 2), $setup.v$.modelname.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ModelFormvue_type_template_id_74b9fabc_hoisted_5, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.modelname.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_6, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_7, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ModelFormvue_type_template_id_74b9fabc_hoisted_8, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.tablename_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
      'has-error': $setup.v$.tablename.$error
    }])
  }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
    type: "text",
    "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.localData.tablename = $event),
    id: 'tablename_' + $setup.localData.modelid,
    class: "form-control input-md irequired alert-input table-name",
    maxlength: "50"
  }, null, 8, ModelFormvue_type_template_id_74b9fabc_hoisted_9), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.tablename]])], 2), $setup.v$.tablename.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ModelFormvue_type_template_id_74b9fabc_hoisted_10, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.tablename.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_11, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_12, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ModelFormvue_type_template_id_74b9fabc_hoisted_13, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.tablefields_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
      'has-error': $setup.v$.tablefields.$error
    }])
  }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
    "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => $setup.localData.tablefields = $event),
    id: 'tablefields_' + $setup.localData.modelid,
    class: "form-control input-md irequired alert-input table-fields validate-json",
    rows: "15"
  }, null, 8, ModelFormvue_type_template_id_74b9fabc_hoisted_14), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.tablefields]])], 2), $setup.v$.tablefields.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ModelFormvue_type_template_id_74b9fabc_hoisted_15, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.tablefields.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_16, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_17, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ModelFormvue_type_template_id_74b9fabc_hoisted_18, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.tablesettings_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
      'has-error': $setup.v$.tablesettings.$error
    }])
  }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => $setup.localData.tablesettings = $event),
    id: 'tablesettings_' + $setup.localData.modelid,
    class: "form-control input-md irequired alert-input table-settings validate-json",
    rows: "5"
  }, null, 8, ModelFormvue_type_template_id_74b9fabc_hoisted_19), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.tablesettings]])], 2), $setup.v$.tablesettings.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ModelFormvue_type_template_id_74b9fabc_hoisted_20, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.tablesettings.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_21, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ModelFormvue_type_template_id_74b9fabc_hoisted_22, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ModelFormvue_type_template_id_74b9fabc_hoisted_23, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.submodels_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
    class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
      'has-error': $setup.v$.submodels.$error
    }])
  }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => $setup.localData.submodels = $event),
    id: 'submodels_' + $setup.localData.modelid,
    class: "form-control input-md irequired alert-input table-settings validate-json",
    rows: "12"
  }, null, 8, ModelFormvue_type_template_id_74b9fabc_hoisted_24), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.submodels]])], 2), $setup.v$.submodels.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ModelFormvue_type_template_id_74b9fabc_hoisted_25, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.submodels.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])])], 64);
}
;// ./src/components/ModelForm.vue?vue&type=template&id=74b9fabc

;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/ModelForm.vue?vue&type=script&lang=js





const ModelFormvue_type_script_lang_js_defaultData = {
  modelid: "",
  modelname: "",
  tablename: "",
  tablefields: "",
  tablesettings: "",
  submodels: ""
};
/* harmony default export */ var ModelFormvue_type_script_lang_js = ({
  props: {
    modes: Object,
    labels: Object,
    dataCategory: Object,
    dataModel: Object,
    index: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const mode = (0,reactivity_esm_bundler/* ref */.KR)({
      action: "new",
      ...props.modes
    });
    const localData = (0,reactivity_esm_bundler/* ref */.KR)(props.dataModel);
    const reqalert = (0,reactivity_esm_bundler/* ref */.KR)(props.labels.empty_alert);
    const requiredMessage = () => {
      return validators_dist/* helpers */._$.withMessage(reqalert, validators_dist/* helpers */._$.withParams({
        type: "required",
        index: props.index,
        modelid: props.dataModel.modelid
      }, value => !!value));
    };
    const validateRules = (0,runtime_core_esm_bundler/* computed */.EW)(() => {
      return {
        modelname: {
          required: requiredMessage()
        },
        tablename: {
          required: requiredMessage()
        },
        tablefields: {
          required: requiredMessage(),
          validFields: validators_dist/* helpers */._$.withMessage("Invalid JSON format setting", validators_dist/* helpers */._$.withParams({
            type: "required",
            index: props.index
          }, value => validJSON(value)))
        },
        tablesettings: {
          validSettings: validators_dist/* helpers */._$.withMessage("Invalid JSON format setting", validators_dist/* helpers */._$.withParams({
            type: "required",
            index: props.index
          }, value => validJSON(value)))
        },
        submodels: {
          validSubModels: validators_dist/* helpers */._$.withMessage("Invalid JSON array format setting", validators_dist/* helpers */._$.withParams({
            type: "required",
            index: props.index
          }, value => validJSONArray(value)))
        }
      };
    });
    const v$ = (0,dist/* useVuelidate */.fG)(validateRules, localData, {
      $lazy: true,
      $autoDirty: true,
      $scope: "entry"
    });
    return {
      mode,
      v$,
      localData,
      reqalert
    };
  },
  created() {
    (0,runtime_core_esm_bundler/* watch */.wB)(this.$props, newProps => {
      this.reqalert = newProps.labels.empty_alert;
    });
  },
  methods: {
    reset(newData, newMode) {
      if (newData) this.localData = {
        ...newData
      };
      if (newMode) this.mode = {
        ...newMode
      };
    },
    submit() {
      this.$emit('update:formData', this.localData);
    },
    async validateForm(focusing = true) {
      const valid = await this.v$.$validate();
      console.log("validate form: valid", valid);
      console.log("error:", this.v$.$errors);
      if (!valid) {
        if (focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if (this.v$.$errors && this.v$.$errors.length > 0) {
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if (el) el.focus(); //if using ref
        else jquery_default()("#" + input).trigger("focus"); //if using id
      }
    },
    resetRecord() {
      //reset to default data 
      this.reset(ModelFormvue_type_script_lang_js_defaultData, {
        action: "insert"
      });
      //reset validator
      this.v$.$reset();
    }
  }
});
;// ./src/components/ModelForm.vue?vue&type=script&lang=js
 
;// ./src/components/ModelForm.vue




;
const ModelForm_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(ModelFormvue_type_script_lang_js, [['render',ModelFormvue_type_template_id_74b9fabc_render]])

/* harmony default export */ var ModelForm = (ModelForm_exports_);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/ConnectionForm.vue?vue&type=template&id=2f4f964d

const ConnectionFormvue_type_template_id_2f4f964d_hoisted_1 = {
  key: 0,
  class: "modal-title"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_2 = {
  key: 1,
  class: "modal-title"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_3 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_4 = {
  class: "col-height col-md-7"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_5 = {
  for: "dialogconnectid"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_6 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_7 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_8 = {
  class: "col-height col-md-12"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_9 = {
  for: "connectname"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_10 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_11 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_12 = {
  class: "col-height col-md-7"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_13 = {
  for: "connecttype"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_14 = ["value"];
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_15 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_16 = {
  id: "apilayer"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_17 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_18 = {
  class: "col-height col-md-10"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_19 = {
  for: "connectapi"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_20 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_21 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_22 = {
  class: "col-height col-md-10"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_23 = {
  for: "connectsetting"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_24 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_25 = {
  id: "connectsettinginfo_label"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_26 = {
  class: "row row-height"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_27 = {
  class: "col-height col-md-10"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_28 = {
  for: "connectbody"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_29 = {
  key: 0,
  class: "has-error"
};
const ConnectionFormvue_type_template_id_2f4f964d_hoisted_30 = {
  id: "connectbodyinfo_label"
};
const _hoisted_31 = {
  id: "dblayer"
};
const _hoisted_32 = {
  class: "row row-height"
};
const _hoisted_33 = {
  class: "col-height col-md-4"
};
const _hoisted_34 = {
  for: "connectdialect"
};
const _hoisted_35 = ["value"];
const _hoisted_36 = {
  key: 0,
  class: "has-error"
};
const _hoisted_37 = {
  id: "providedlayer"
};
const _hoisted_38 = {
  id: "urllayer"
};
const _hoisted_39 = {
  class: "row row-height"
};
const _hoisted_40 = {
  class: "col-height col-md-12"
};
const _hoisted_41 = {
  for: "connecturl"
};
const _hoisted_42 = {
  key: 0,
  class: "has-error"
};
const _hoisted_43 = {
  id: "unurllayer"
};
const _hoisted_44 = {
  class: "row row-height"
};
const _hoisted_45 = {
  class: "col-height col-md-4"
};
const _hoisted_46 = {
  for: "connectuser"
};
const _hoisted_47 = {
  key: 0,
  class: "has-error"
};
const _hoisted_48 = {
  class: "col-height col-md-4"
};
const _hoisted_49 = {
  for: "connectpassword"
};
const _hoisted_50 = {
  key: 0,
  class: "has-error"
};
const _hoisted_51 = {
  class: "row row-height"
};
const _hoisted_52 = {
  class: "col-height col-md-4"
};
const _hoisted_53 = {
  for: "connectdatabase"
};
const _hoisted_54 = {
  key: 0,
  class: "has-error"
};
const _hoisted_55 = {
  class: "col-height col-md-4"
};
const _hoisted_56 = {
  for: "connecthost"
};
const _hoisted_57 = {
  key: 0,
  class: "has-error"
};
const _hoisted_58 = {
  class: "col-height col-md-4"
};
const _hoisted_59 = {
  for: "connectport"
};
const _hoisted_60 = {
  key: 0,
  class: "has-error"
};
const _hoisted_61 = {
  class: "btn btn-dark btn-sm",
  "data-dismiss": "modal"
};
function ConnectionFormvue_type_template_id_2f4f964d_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_InputNumber = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("InputNumber");
  const _component_DialogForm = (0,runtime_core_esm_bundler/* resolveComponent */.g2)("DialogForm");
  return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createBlock */.Wv)(_component_DialogForm, {
    ref: "dialogFormConnection",
    id: "modaldialog_layer_connection",
    sizing: "modal-xm"
  }, {
    header: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [$options.insertMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("h4", ConnectionFormvue_type_template_id_2f4f964d_hoisted_1, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.title_new_connection), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), $options.updateMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("h4", ConnectionFormvue_type_template_id_2f4f964d_hoisted_2, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.title_edit_connection), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]),
    default: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_3, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_4, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_5, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectid_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectid.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectid",
      type: "text",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.localData.connectid = $event),
      id: "dialogconnectid",
      class: "form-control input-md",
      maxlength: "50",
      readonly: ""
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectid]]), _cache[15] || (_cache[15] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectid.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_6, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectid.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_7, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_8, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_9, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectname_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectname.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectname",
      type: "text",
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.localData.connectname = $event),
      id: "connectname",
      class: "form-control input-md",
      maxlength: "150"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectname]]), _cache[16] || (_cache[16] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectname.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_10, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectname.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_11, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_12, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_13, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connecttype_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group", {
        'has-error': $setup.v$.connecttype.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("select", {
      ref: "connecttype",
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => $setup.localData.connecttype = $event),
      class: "form-control input-md"
    }, [((0,runtime_core_esm_bundler/* openBlock */.uX)(true), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, (0,runtime_core_esm_bundler/* renderList */.pI)($props.dataCategory.tconnecttype, (value, key) => {
      return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("option", {
        key: key,
        value: key
      }, (0,shared_esm_bundler/* toDisplayString */.v_)(value), 9, ConnectionFormvue_type_template_id_2f4f964d_hoisted_14);
    }), 128))], 512), [[runtime_dom_esm_bundler/* vModelSelect */.u1, $setup.localData.connecttype]]), _cache[17] || (_cache[17] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connecttype.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_15, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connecttype.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_16, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_17, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_18, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_19, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectapi_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connecttype.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectapi",
      type: "text",
      "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => $setup.localData.connectapi = $event),
      id: "connectapi",
      class: "form-control input-md",
      maxlength: "150"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectapi]]), _cache[18] || (_cache[18] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectapi.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_20, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectapi.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_21, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_22, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_23, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectsetting_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectsetting.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
      ref: "connectsetting",
      "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => $setup.localData.connectsetting = $event),
      id: "connectsetting",
      class: "form-control input-md validate-json",
      rows: "2"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectsetting]])], 2), $setup.v$.connectsetting.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_24, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectsetting.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_25, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectsettinginfo_label), 1)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_26, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", ConnectionFormvue_type_template_id_2f4f964d_hoisted_27, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_28, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectbody_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectbody.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("textarea", {
      ref: "connectbody",
      "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => $setup.localData.connectbody = $event),
      id: "connectbody",
      class: "form-control input-md validate-json",
      rows: "2"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectbody]])], 2), $setup.v$.connectbody.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", ConnectionFormvue_type_template_id_2f4f964d_hoisted_29, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectbody.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", ConnectionFormvue_type_template_id_2f4f964d_hoisted_30, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectbodyinfo_label), 1)])])], 512), [[runtime_dom_esm_bundler/* vShow */.aG, $setup.localData.connecttype == 'API']]), (0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_31, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_32, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_33, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_34, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectdialect_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectdialect.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("select", {
      ref: "connectdialect",
      "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => $setup.localData.connectdialect = $event),
      class: "form-control input-md"
    }, [((0,runtime_core_esm_bundler/* openBlock */.uX)(true), (0,runtime_core_esm_bundler/* createElementBlock */.CE)(runtime_core_esm_bundler/* Fragment */.FK, null, (0,runtime_core_esm_bundler/* renderList */.pI)($props.dataCategory.tdialects, (value, key) => {
      return (0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("option", {
        key: key,
        value: key
      }, (0,shared_esm_bundler/* toDisplayString */.v_)(value), 9, _hoisted_35);
    }), 128))], 512), [[runtime_dom_esm_bundler/* vModelSelect */.u1, $setup.localData.connectdialect]]), _cache[19] || (_cache[19] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectdialect.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_36, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectdialect.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_37, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_38, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_39, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_40, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_41, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connecturl_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connecturl.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connecturl",
      type: "text",
      "onUpdate:modelValue": _cache[7] || (_cache[7] = $event => $setup.localData.connecturl = $event),
      id: "connecturl",
      class: "form-control input-md",
      maxlength: "250"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connecturl]]), _cache[20] || (_cache[20] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connecturl.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_42, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connecturl.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])])], 512), [[runtime_dom_esm_bundler/* vShow */.aG, $options.dialectUsingURL]]), (0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_43, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_44, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_45, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_46, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectuser_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectuser.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectuser",
      type: "text",
      "onUpdate:modelValue": _cache[8] || (_cache[8] = $event => $setup.localData.connectuser = $event),
      id: "connectuser",
      class: "form-control input-md",
      maxlength: "200"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectuser]]), _cache[21] || (_cache[21] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectuser.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_47, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectuser.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_48, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_49, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectpassword_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectpassword.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectpassword",
      type: "password",
      "onUpdate:modelValue": _cache[9] || (_cache[9] = $event => $setup.localData.connectpassword = $event),
      id: "connectpassword",
      class: "form-control input-md",
      maxlength: "50"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectpassword]]), _cache[22] || (_cache[22] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectpassword.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_50, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectpassword.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_51, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_52, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_53, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectdatabase_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectdatabase.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connectdatabase",
      type: "text",
      "onUpdate:modelValue": _cache[10] || (_cache[10] = $event => $setup.localData.connectdatabase = $event),
      id: "connectdatabase",
      class: "form-control input-md",
      maxlength: "50"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connectdatabase]]), _cache[23] || (_cache[23] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectdatabase.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_54, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectdatabase.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_55, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_56, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connecthost_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connecthost.$error
      }])
    }, [(0,runtime_core_esm_bundler/* withDirectives */.bo)((0,runtime_core_esm_bundler/* createElementVNode */.Lk)("input", {
      ref: "connecthost",
      type: "text",
      "onUpdate:modelValue": _cache[11] || (_cache[11] = $event => $setup.localData.connecthost = $event),
      id: "connecthost",
      class: "form-control input-md",
      maxlength: "50"
    }, null, 512), [[runtime_dom_esm_bundler/* vModelText */.Jo, $setup.localData.connecthost]]), _cache[24] || (_cache[24] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connecthost.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_57, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connecthost.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)]), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", _hoisted_58, [(0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", _hoisted_59, (0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.connectport_label), 1), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("div", {
      class: (0,shared_esm_bundler/* normalizeClass */.C4)(["input-group has-validation", {
        'has-error': $setup.v$.connectport.$error
      }])
    }, [(0,runtime_core_esm_bundler/* createVNode */.bF)(_component_InputNumber, {
      ref: "connectport",
      modelValue: $setup.localData.connectport,
      "onUpdate:modelValue": _cache[12] || (_cache[12] = $event => $setup.localData.connectport = $event),
      id: "connectport",
      class: "form-control input-md"
    }, null, 8, ["modelValue"]), _cache[25] || (_cache[25] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("label", {
      class: "required"
    }, "*", -1))], 2), $setup.v$.connectport.$error ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("span", _hoisted_60, (0,shared_esm_bundler/* toDisplayString */.v_)($setup.v$.connectport.$errors[0].$message), 1)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true)])])], 512), [[runtime_dom_esm_bundler/* vShow */.aG, !$options.dialectUsingURL]])])], 512), [[runtime_dom_esm_bundler/* vShow */.aG, $setup.localData.connecttype == 'DB']])]),
    footer: (0,runtime_core_esm_bundler/* withCtx */.k6)(() => [$options.insertMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("button", {
      key: 0,
      ref: "savebutton",
      id: "savebuttonconnect",
      class: "btn btn-dark btn-sm",
      onClick: _cache[13] || (_cache[13] = (...args) => $options.saveClick && $options.saveClick(...args))
    }, [_cache[26] || (_cache[26] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-save fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.save_button), 1)], 512)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), $options.updateMode ? ((0,runtime_core_esm_bundler/* openBlock */.uX)(), (0,runtime_core_esm_bundler/* createElementBlock */.CE)("button", {
      key: 1,
      ref: "updatebutton",
      id: "updatebuttonconnect",
      class: "btn btn-dark btn-sm",
      onClick: _cache[14] || (_cache[14] = (...args) => $options.updateClick && $options.updateClick(...args))
    }, [_cache[27] || (_cache[27] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-save fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.update_button), 1)], 512)) : (0,runtime_core_esm_bundler/* createCommentVNode */.Q3)("", true), (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("button", _hoisted_61, [_cache[28] || (_cache[28] = (0,runtime_core_esm_bundler/* createElementVNode */.Lk)("em", {
      class: "fa fa-close fa-btn-icon"
    }, null, -1)), (0,runtime_core_esm_bundler/* createTextVNode */.eW)((0,shared_esm_bundler/* toDisplayString */.v_)($props.labels.cancel_button), 1)])]),
    _: 1
  }, 512);
}
;// ./src/components/ConnectionForm.vue?vue&type=template&id=2f4f964d

;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/ConnectionForm.vue?vue&type=script&lang=js












const ConnectionFormvue_type_script_lang_js_APP_URL = "/api/emte001";
const ConnectionFormvue_type_script_lang_js_defaultData = {
  connectid: "",
  connectname: "",
  connecttype: "",
  connectdialect: "",
  connecturl: "",
  connectuser: "",
  connectpassword: "",
  connectdatabase: "",
  connecthost: "",
  connectport: null,
  connectapi: "",
  connectsetting: "",
  connectbody: ""
};
/* harmony default export */ var ConnectionFormvue_type_script_lang_js = ({
  components: {
    DialogForm: DialogForm,
    InputNumber: will_control_umd.InputNumber
  },
  props: {
    modes: Object,
    labels: Object,
    dataCategory: Object
  },
  emits: ["connect-saved", "connect-updated", "connect-deleted"],
  setup(props) {
    const mode = (0,reactivity_esm_bundler/* ref */.KR)({
      action: "new",
      ...props.modes
    });
    const localData = (0,reactivity_esm_bundler/* ref */.KR)({
      ...ConnectionFormvue_type_script_lang_js_defaultData
    });
    const disabledKeyField = (0,reactivity_esm_bundler/* ref */.KR)(false);
    const reqalert = (0,reactivity_esm_bundler/* ref */.KR)(props.labels.empty_alert);
    const requiredMessage = () => {
      return validators_dist/* helpers */._$.withMessage(reqalert, validators_dist/* required */.mw);
    };
    const validateRules = (0,runtime_core_esm_bundler/* computed */.EW)(() => {
      return {
        connectid: {
          required: requiredMessage()
        },
        connectname: {
          required: requiredMessage()
        },
        connecttype: {
          required: requiredMessage()
        },
        connectdialect: {
          required: requiredMessage()
        },
        connecturl: {
          required: requiredMessage()
        },
        connectuser: {
          required: requiredMessage()
        },
        connectpassword: {
          required: requiredMessage()
        },
        connectdatabase: {
          required: requiredMessage()
        },
        connecthost: {
          required: requiredMessage()
        },
        connectport: {
          required: requiredMessage()
        },
        connectapi: {
          required: requiredMessage()
        },
        connectsetting: {
          required: requiredMessage()
        },
        connectbody: {
          required: requiredMessage()
        }
      };
    });
    const v$ = (0,dist/* useVuelidate */.fG)(validateRules, localData, {
      $lazy: true,
      $autoDirty: true,
      $scope: false
    });
    return {
      mode,
      v$,
      localData,
      disabledKeyField,
      reqalert
    };
  },
  created() {
    (0,runtime_core_esm_bundler/* watch */.wB)(this.$props, newProps => {
      this.reqalert = newProps.labels.empty_alert;
    });
  },
  computed: {
    insertMode() {
      return this.mode.action == "insert" || this.mode.action == "new";
    },
    updateMode() {
      return this.mode.action == "update" || this.mode.action == "edit";
    },
    dialectUsingURL() {
      let cat = this.$props.dataCategory.dialects[this.localData.connectdialect];
      return cat && cat.urlflag == "1";
    }
  },
  mounted() {
    this.$nextTick(function () {
      jquery_default()("#modaldialog_layer_connection").find(".modal-dialog").draggable();
    });
  },
  methods: {
    dialectProvided(dialect) {
      let cat = this.$props.dataCategory.dialects[dialect];
      //console.log("dialectProvided: dialect",dialect,":",cat);
      return cat && cat.providedflag == "1";
    },
    reset(newData, newMode) {
      if (newData) this.localData = {
        ...newData
      };
      if (newMode) this.mode = {
        ...newMode
      };
    },
    submit() {
      this.$emit('update:formData', this.localData);
    },
    async saveClick() {
      console.log("click: save");
      (0,will_app/* disableControls */.rv)(jquery_default()("#savebuttonconnect"));
      let valid = await this.validateForm();
      if (!valid) return;
      this.startSaveRecord();
    },
    async updateClick() {
      console.log("click: update");
      (0,will_app/* disableControls */.rv)(jquery_default()("#updatebuttonconnect"));
      let valid = await this.validateForm();
      if (!valid) return;
      this.startUpdateRecord();
    },
    async validateForm(focusing = true) {
      const valid = await this.v$.$validate();
      console.log("validate form: valid", valid);
      console.log("error:", this.v$.$errors);
      if (!valid) {
        if (focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if (this.v$.$errors && this.v$.$errors.length > 0) {
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if (el) el.focus(); //if using ref
        else jquery_default()("#" + input).trigger("focus"); //if using id
      }
    },
    showDialog(callback) {
      //$("#modaldialog_layer").modal("show");
      if (callback) jquery_default()(this.$refs.dialogFormConnection.$el).on("shown.bs.modal", callback);
      jquery_default()(this.$refs.dialogFormConnection.$el).modal("show");
    },
    hideDialog() {
      //$("#modaldialog_layer").modal("hide");
      jquery_default()(this.$refs.dialogFormConnection.$el).modal("hide");
    },
    resetRecord() {
      //reset to default data 
      this.reset(ConnectionFormvue_type_script_lang_js_defaultData, {
        action: "insert"
      });
      //reset validator
      this.v$.$reset();
      //enable key field
      this.disabledKeyField = false;
    },
    startInsertRecord() {
      this.resetRecord();
      this.localData.connectid = (0,v4/* default */.A)();
      this.localData.connecttype = "DB";
      this.showDialog(() => {
        this.$refs.connectname.focus();
      });
    },
    startSaveRecord() {
      (0,will_app/* confirmSave */.ex)(() => {
        this.saveRecord(this.localData);
      });
    },
    startUpdateRecord() {
      (0,will_app/* confirmUpdate */.cS)(() => {
        this.updateRecord(this.localData);
      });
    },
    startDeleteRecord(dataKeys) {
      (0,will_app/* confirmDelete */.QV)(Object.values(dataKeys), () => {
        this.deleteRecord(dataKeys);
      });
    },
    saveRecord(dataRecord) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataRecord);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + ConnectionFormvue_type_script_lang_js_APP_URL + "/connectinsert",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            //reset data for new record insert
            this.resetRecord();
            setTimeout(() => {
              this.$refs.connectname.focus();
            }, 100);
            this.$emit('connect-saved', dataRecord, data);
          });
        }
      });
    },
    updateRecord(dataRecord) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataRecord);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + ConnectionFormvue_type_script_lang_js_APP_URL + "/connectupdate",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            this.hideDialog();
            this.$emit('connect-updated', dataRecord, data);
          });
        }
      });
    },
    retrieveRecord(dataKeys) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataKeys);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + ConnectionFormvue_type_script_lang_js_APP_URL + "/connectretrieve",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("retrieveRecord: error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("retrieveRecord: success", data);
          if (data.body.dataset) {
            this.reset(data.body.dataset, {
              action: "edit"
            });
            this.v$.$reset();
            this.disabledKeyField = true;
            this.showDialog(() => {
              this.$refs.connectname.focus();
            });
          }
        }
      });
    },
    deleteRecord(dataKeys) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataKeys);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + ConnectionFormvue_type_script_lang_js_APP_URL + "/connectremove",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("deleteRecord: error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("deleteRecord: success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            this.$emit('connect-deleted', dataKeys, data);
          });
        }
      });
    }
  }
});
;// ./src/components/ConnectionForm.vue?vue&type=script&lang=js
 
;// ./src/components/ConnectionForm.vue




;
const ConnectionForm_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(ConnectionFormvue_type_script_lang_js, [['render',ConnectionFormvue_type_template_id_2f4f964d_render]])

/* harmony default export */ var ConnectionForm = (ConnectionForm_exports_);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/EntryForm.vue?vue&type=script&lang=js















const EntryFormvue_type_script_lang_js_APP_URL = "/api/emte001";
const EntryFormvue_type_script_lang_js_defaultData = {
  taskid: "",
  shareflag: "1",
  taskname: "",
  connectid: "",
  taskconfigs: "",
  models: []
};
/* harmony default export */ var EntryFormvue_type_script_lang_js = ({
  components: {
    DialogForm: DialogForm,
    ModelForm: ModelForm,
    ConnectionForm: ConnectionForm
  },
  props: {
    modes: Object,
    labels: Object,
    dataCategory: Object
  },
  emits: ["data-saved", "data-updated", "data-deleted"],
  setup(props) {
    const mode = (0,reactivity_esm_bundler/* ref */.KR)({
      action: "new",
      ...props.modes
    });
    const localData = (0,reactivity_esm_bundler/* ref */.KR)({
      ...EntryFormvue_type_script_lang_js_defaultData
    });
    const disabledKeyField = (0,reactivity_esm_bundler/* ref */.KR)(false);
    const reqalert = (0,reactivity_esm_bundler/* ref */.KR)(props.labels.empty_alert);
    const requiredMessage = () => {
      return validators_dist/* helpers */._$.withMessage(reqalert, validators_dist/* required */.mw);
    };
    const validateRules = (0,runtime_core_esm_bundler/* computed */.EW)(() => {
      return {
        taskid: {
          required: requiredMessage()
        },
        taskname: {
          required: requiredMessage()
        },
        taskconfigs: {
          validConfigs: validators_dist/* helpers */._$.withMessage("Invalid JSON format setting", value => validJSON(value))
        }
      };
    });
    const v$ = (0,dist/* useVuelidate */.fG)(validateRules, localData, {
      $lazy: true,
      $autoDirty: true,
      $scope: "entry"
    });
    return {
      mode,
      v$,
      localData,
      disabledKeyField,
      reqalert
    };
  },
  created() {
    (0,runtime_core_esm_bundler/* watch */.wB)(this.$props, newProps => {
      this.reqalert = newProps.labels.empty_alert;
    });
  },
  computed: {
    insertMode() {
      return this.mode.action == "insert" || this.mode.action == "new";
    },
    updateMode() {
      return this.mode.action == "update" || this.mode.action == "edit";
    }
  },
  mounted() {
    this.$nextTick(function () {
      jquery_default()("#modaldialog_layer").find(".modal-dialog").draggable();
    });
  },
  methods: {
    reset(newData, newMode) {
      if (newData) this.localData = {
        ...newData
      };
      if (newMode) this.mode = {
        ...newMode
      };
    },
    submit() {
      this.$emit('update:formData', this.localData);
    },
    async saveClick() {
      console.log("click: save");
      (0,will_app/* disableControls */.rv)(jquery_default()("#savebutton"));
      let valid = await this.validateForm();
      if (!valid) return;
      this.startSaveRecord();
    },
    async updateClick() {
      console.log("click: update");
      (0,will_app/* disableControls */.rv)(jquery_default()("#updatebutton"));
      let valid = await this.validateForm();
      if (!valid) return;
      this.startUpdateRecord();
    },
    async validateForm(focusing = true) {
      const valid = await this.v$.$validate();
      console.log("validate form: valid", valid);
      console.log("error:", this.v$.$errors);
      if (!valid) {
        if (focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if (this.v$.$errors && this.v$.$errors.length > 0) {
        let params = this.v$.$errors[0].$params;
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if (el) el.focus(); //if using ref
        else jquery_default()("#" + input).trigger("focus"); //if using id
        if (typeof params.index === 'number') {
          jquery_default()("#linker_" + params.modelid).trigger("click");
          setTimeout(() => {
            jquery_default()("#" + input + "_" + params.modelid).trigger("focus");
          }, 100);
        }
      }
    },
    showDialog(callback) {
      //$("#modaldialog_layer").modal("show");
      if (callback) jquery_default()(this.$refs.dialogForm.$el).on("shown.bs.modal", callback);
      jquery_default()(this.$refs.dialogForm.$el).modal("show");
    },
    hideDialog() {
      //$("#modaldialog_layer").modal("hide");
      jquery_default()(this.$refs.dialogForm.$el).modal("hide");
    },
    resetRecord() {
      //reset to default data 
      this.reset(EntryFormvue_type_script_lang_js_defaultData, {
        action: "insert"
      });
      //reset validator
      this.v$.$reset();
      //enable key field
      this.disabledKeyField = false;
    },
    startInsertRecord() {
      this.resetRecord();
      this.localData.taskid = (0,v4/* default */.A)();
      this.addNewModel();
      this.showDialog(() => {
        this.$refs.taskname.focus();
      });
    },
    startSaveRecord() {
      (0,will_app/* confirmSave */.ex)(() => {
        this.saveRecord(this.localData);
      });
    },
    startUpdateRecord() {
      (0,will_app/* confirmUpdate */.cS)(() => {
        this.updateRecord(this.localData);
      });
    },
    startDeleteRecord(dataKeys) {
      (0,will_app/* confirmDelete */.QV)(Object.values(dataKeys), () => {
        this.deleteRecord(dataKeys);
      });
    },
    saveRecord(dataRecord) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataRecord);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + EntryFormvue_type_script_lang_js_APP_URL + "/insert",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            //reset data for new record insert
            this.resetRecord();
            setTimeout(() => {
              this.$refs.taskname.focus();
            }, 100);
            this.$emit('data-saved', dataRecord, data);
          });
        }
      });
    },
    updateRecord(dataRecord) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataRecord);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + EntryFormvue_type_script_lang_js_APP_URL + "/update",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            this.hideDialog();
            this.$emit('data-updated', dataRecord, data);
          });
        }
      });
    },
    retrieveRecord(dataKeys) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataKeys);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + EntryFormvue_type_script_lang_js_APP_URL + "/retrieve",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("retrieveRecord: error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("retrieveRecord: success", data);
          if (data.body.dataset) {
            this.reset(data.body.dataset, {
              action: "edit"
            });
            this.v$.$reset();
            this.disabledKeyField = true;
            this.showDialog(() => {
              this.$refs.taskname.focus();
              //setTimeout(() => { console.log($("a.model-link:first").html()); $("a.model-link:first").trigger("click"); },1000);
            });
          }
        }
      });
    },
    deleteRecord(dataKeys) {
      let jsondata = {
        ajax: true
      };
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata, dataKeys);
      (0,will_app/* startWaiting */.eF)();
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + EntryFormvue_type_script_lang_js_APP_URL + "/remove",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("deleteRecord: error: status", status, "errorThrown", errorThrown);
          (0,will_app/* submitFailure */.pg)(transport, status, errorThrown);
        },
        success: data => {
          (0,will_app/* stopWaiting */.Sk)();
          console.log("deleteRecord: success", data);
          if ((0,will_app/* detectErrorResponse */.DA)(data)) return;
          (0,will_app/* successbox */.hM)(() => {
            this.$emit('data-deleted', dataKeys, data);
          });
        }
      });
    },
    addModelClick() {
      this.addNewModel();
    },
    addNewModel() {
      let model = {
        modelid: (0,v4/* default */.A)(),
        modelname: "NewModel",
        tablename: "",
        tablefields: "",
        tablesettings: ""
      };
      this.localData.models.push(model);
    },
    deleteModelClick(item) {
      console.log("deleteModelClick: item", item);
      this.confirmRemoveModel([item.modelname], () => {
        const index = this.localData.models.findIndex(it => it.modelid === item.modelid);
        if (index !== -1) {
          this.localData.models.splice(index, 1);
          jquery_default()("a.model-link:first").trigger("click");
        }
      });
    },
    confirmRemoveModel(params, okFn, cancelFn) {
      if (!(0,will_app/* confirmDialogBox */.A3)("QS0306", params, "Do you want to delete this model?", okFn, cancelFn)) return false;
      return true;
    },
    connectInsert() {
      this.$refs.connectionForm.startInsertRecord();
    },
    connectRetrieve() {
      if (this.localData.connectid && this.localData.connectid.trim().length > 0) {
        this.$refs.connectionForm.retrieveRecord({
          connectid: this.localData.connectid
        });
      }
    },
    connectSaved(data, response) {
      console.log("Connection: record saved");
      console.log("data", data, "response", response);
    },
    connectUpdated(data, response) {
      console.log("Connection: record updated");
      console.log("data", data, "response", response);
    },
    connectDeleted(data, response) {
      console.log("Connection: record deleted");
      console.log("data", data, "response", response);
    }
  }
});
;// ./src/components/EntryForm.vue?vue&type=script&lang=js
 
;// ./src/components/EntryForm.vue




;
const EntryForm_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(EntryFormvue_type_script_lang_js, [['render',EntryFormvue_type_template_id_4c73cd07_render]])

/* harmony default export */ var EntryForm = (EntryForm_exports_);
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/AppVmte001.vue?vue&type=script&lang=js








const buildVersion = "20250604-132317";
/* harmony default export */ var AppVmte001vue_type_script_lang_js = ({
  components: {
    PageHeader: will_control_umd.PageHeader,
    SearchForm: SearchForm,
    EntryForm: EntryForm
  },
  setup() {
    const dataChunk = {};
    const dataCategory = {
      tmigrateconnect: {},
      tconnecttype: {},
      tdialect: {},
      dialects: {},
      tdialects: {}
    };
    let labels = (0,reactivity_esm_bundler/* ref */.KR)((0,will_app/* getLabelModel */.aU)());
    let alreadyLoading = (0,reactivity_esm_bundler/* ref */.KR)(false);
    const multiLanguages = (0,reactivity_esm_bundler/* ref */.KR)((0,will_app/* getMultiLanguagesModel */.Hx)());
    return {
      buildVersion,
      multiLanguages,
      labels,
      dataCategory,
      dataChunk,
      alreadyLoading
    };
  },
  mounted() {
    console.log("App: mounted ...");
    this.$nextTick(async () => {
      //ensure ui completed then invoke startApplication 
      (0,will_app/* startApplication */.xL)("emte001", data => {
        this.multiLanguages = (0,will_app/* getMultiLanguagesModel */.Hx)();
        this.messagingHandler(data);
        this.loadDataCategories(!this.alreadyLoading, () => {
          this.$refs.pageHeader.changeLanguage((0,will_app/* getDefaultLanguage */.i5)());
        });
      });
    });
  },
  methods: {
    messagingHandler(data) {
      console.log("messagingHandler: data", data);
    },
    changeLanguage(lang) {
      (0,will_app/* setDefaultLanguage */.Qq)(lang);
      let labelModel = (0,will_app/* getLabelModel */.aU)(lang);
      this.labels = labelModel;
      this.resetDataCategories(lang);
    },
    loadDataCategories(loading, callback) {
      console.log("loadDataCategories: loading", loading);
      if (!loading) return;
      let jsondata = {};
      let formdata = (0,will_app/* serializeParameters */.L3)(jsondata);
      jquery_default().ajax({
        url: (0,will_app/* getApiUrl */.e9)() + "/api/emte001/categories",
        data: formdata.jsondata,
        headers: formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: will_app/* DEFAULT_CONTENT_TYPE */.Xh,
        error: function (transport, status, errorThrown) {
          console.error("loadDataCategories: error: status", status, "errorThrown", errorThrown);
        },
        success: data => {
          this.alreadyLoading = true;
          console.log("loadDataCategories: success", data);
          if (data.body?.entity) {
            this.dataChunk = data.body?.entity;
            console.log("data chunk", this.dataChunk);
            this.resetDataCategories();
            if (callback) callback();
          }
        }
      });
    },
    resetDataCategories() {
      this.dataCategory = this.dataChunk;
      let dialects = this.dataChunk.dialects || {};
      let tdialects = {};
      let tdialect = this.dataChunk.tdialect;
      if (tdialect) {
        for (let key in tdialect) {
          let cat = dialects[key];
          if (cat && cat.providedflag == "1") {
            tdialects[key] = tdialect[key];
          }
        }
      }
      this.dataCategory.tdialects = tdialects;
    },
    dataSelected(item, action) {
      //listen action from search form
      console.log("App: dataSelected", item, "action", action);
      if ("edit" == action) {
        this.$refs.entryForm.retrieveRecord({
          taskid: item.taskid
        });
      } else if ("delete" == action) {
        this.$refs.entryForm.startDeleteRecord({
          taskname: item.taskname,
          taskid: item.taskid
        });
      }
    },
    dataInsert(filters) {
      //listen action from search form
      console.log("App: record insert", filters);
      this.$refs.entryForm.startInsertRecord();
    },
    dataSaved(data, response) {
      //listen action from entry form when after saved
      console.log("App: record saved");
      console.log("data", data, "response", response);
      this.$refs.searchForm.search();
    },
    dataUpdated(data, response) {
      //listen action from entry form when after updated
      console.log("App: record updated");
      console.log("data", data, "response", response);
      this.$refs.searchForm.search();
    },
    dataDeleted(data, response) {
      //listen action from entry form when after deleted
      console.log("App: record deleted");
      console.log("data", data, "response", response);
      this.$refs.searchForm.search(true);
    }
  }
});
;// ./src/AppVmte001.vue?vue&type=script&lang=js
 
;// ./src/AppVmte001.vue




;
const AppVmte001_exports_ = /*#__PURE__*/(0,exportHelper/* default */.A)(AppVmte001vue_type_script_lang_js, [['render',render]])

/* harmony default export */ var AppVmte001 = (AppVmte001_exports_);
;// ./src/vmte001.js



















(0,will_app/* appInit */.yR)({
  program_message: program_message_namespaceObject,
  default_labels: default_label_namespaceObject,
  program_labels: program_label_namespaceObject
});
(0,will_app/* initAppConfig */.c1)(function (cfg) {
  console.log("init app config:", cfg);
});


console.info("Vue version", runtime_core_esm_bundler/* version */.rE);
(0,runtime_dom_esm_bundler/* createApp */.Ef)(AppVmte001).mount('#app');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			57: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkvmte001"] = self["webpackChunkvmte001"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [504], function() { return __webpack_require__(9933); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.7b54c32b.js.map