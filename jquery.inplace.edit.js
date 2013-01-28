/*
 *  Project: jquery.inplace.edit
 *  Description: inplace edit
 *  Author: Felipe Prenholato
 *  License: BSD or same as jQuery
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "inplaceEdit",
        defaults = {
            css_main_container_class: "inplaceEdit",
            css_value_container_class: "inplaceValue",
            css_input_container_class: "inplaceInput",
            css_input_classes: "",
            fade: false
        };

    // The actual plugin constructor
    function Plugin( element, options ) {

        this.$el = $(element);

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).


            // set value so we can use it from there instead el.text().
            // this.value is always updated with value get from input.
            this.value = this.$el.text();

            // element get opts.css_main_container_class
            this.$el.addClass(this.options.css_main_container_class);
            this.html = $(this._get_func('getHTML').apply(this, [this.$el, this.options]));
            this.html.filter("." + this.options.css_input_container_class).hide();
            this.$el.html(this.html)
                .bind('click.' + pluginName, $.proxy(this._get_func('onClick'), this));
            return this;
        },

        _get_func: function(fname) {
            // wraper to run custom methods provided by user in this.options[methodName] instead ours
            return ((this.options[fname]) ? this.options[fname] : this[fname]);
                // .apply(this, Array.prototype.slice.call( arguments, 1 ));
        },

        getHTML: function($el, opts) {
            /*
             * Returns HTML that will be used in place of initial value.
             *
             * Params:
             *     @el: element, same as this.$el.
             *     @opts: plugin options, same as this.options.
             *
             *     this is plugin instance.
             * Returns:
             *     Plain text HTML
             *
             * Tip: if you have coded html already in element, return $(el).html() here.
             *
             * You should follow a standard here. We will have two containers,
             * one will keep value, other will keep input.
             *
             * To get value we will do $("." + opts.css_main_container_class + " ." + opts.css_value_container_class).
             * To get input we will do $("." + opts.css_main_container_class + " ." + opts.css_input_container_class).
             *
             * Use opts.css_value_container_class and opts.css_input_container_class to define containers for value and input.
             * Use this.value to get current value instead $el.text()
             * Use opts.css_input_classes to get input to be used on classes, so you can set some css of your framework
             */
            return "<span class='" + opts.css_value_container_class + "'>" + this.value + "</span>" +
                   "<span class='" + opts.css_input_container_class + "'><input type='text' class='" +  opts.css_input_classes + "' /></span>";
        },

        onClick: function(e) {
            // do the onClick job in TD.
            // this here is Plugin, this.$el is element where plugin is attached, normally TD.
            // set it to self so you can use in showInput callback.
            var self = this,
                $valueContainer = $("." + self.options.css_value_container_class, self.$el),
                $inputContainer = $("." + self.options.css_input_container_class, self.$el);
            if ($inputContainer.is(":hidden")) {
                // apply showInput and send a callback to bind keydown and focusout events.
                // in callback this is $inputContainer
                self._get_func('showInput').apply(self, [$valueContainer, $inputContainer,
                    function(){
                        var $input = $inputContainer.find('input');
                        $input.val(self.value).focus()
                            .bind('keydown.' + pluginName, $.proxy(self._get_func('onKeyDown'), $input, self))
                            .bind('focusout.' + pluginName, $.proxy(self._get_func('onFocusOut'), $input, self))
                            // trigger inputLoad so users can load, e.g., masks to inputs
                            // remember to use e.target instead this.
                            .trigger('inputLoad.' + pluginName, [self]);
                    }]);
            }
        },

        onKeyDown: function(self, e) {
            // handle keydown ESC, TAB or ENTER keypress on input
            // receives this as input, event and self as plugin.
            key = e.keyCode ? e.keyCode : e.which;
            if (key == 13 || key == 9) { // enter or tab, update value
                e.preventDefault();
                e.stopPropagation();
                self._get_func('update').apply(self, [
                    $(this),
                    $("." + self.options.css_input_container_class, self.$el),
                    $("." + self.options.css_value_container_class, self.$el)
                ]);
                return false;
            } else if (key == 27) { // esc, revert value
                e.preventDefault();
                e.stopPropagation();
                self._get_func('dismiss').apply(self, [
                    $("." + self.options.css_value_container_class, self.$el),
                    $("." + self.options.css_input_container_class, self.$el)
                ]);
                return false;
            }
        },

        onFocusOut: function(self, e) {
            // handle lost of focus by element closing it.
            // receives this as input, event and self as plugin.
            self._get_func('dismiss').apply(self, [
                $("." + self.options.css_value_container_class, self.$el),
                $("." + self.options.css_input_container_class, self.$el)
            ]);
        },

        onValidation: function() {
            // Return true or false if data is valid, by default we always
            // assume that data is valid
            return true;
        },

        onBeforeUpdate: function() {
            return;
        },

        onUpdate: function() {
            // In this method you can update your server, return true if it
            // updated, else, return false. By default we think that you always
            // updated
            return true;
        },

        onAfterUpdate: function() {
            return;
        },

        onUpdateError: function() {
            return;
        },

        update: function($input, $inputContainer, $valueContainer) {
            // Called when changes will be updated (ENTER or TAB).
            // this is the plugin, we receive $input, $inputContainer, $valueContainer
            // If you wanna customize update, you can use methods onBeforeUpdate,
            // onUpdate and onAfterUpdate.
            // onValidation validate data, should return true or false.
            // onUpdate should return true or false also, true means that update runs ok, false that has errors.
            // finally, onUpdateError is called if some error in update happens.
            var that = this;
            var valid = false,
                updated = false;
            valid = this._get_func('onValidation').apply(this, [$input, $inputContainer, $valueContainer]);
            if (valid === true) {
                // if valid
                this.value = $input.val();
                $valueContainer.text(this.value);
                this._get_func('onBeforeUpdate').apply(this, [$input, $inputContainer, $valueContainer]);
                updated = this._get_func('onUpdate').apply(this, [$input, $inputContainer, $valueContainer]);
                if (updated) {
                    // if updated
                    this._get_func('onAfterUpdate').apply(this, [$input, $inputContainer, $valueContainer]);
                    if ($inputContainer.is(":visible")) {
                        // if input is visible (cuz some update methods can hide it...) hide input and unbind plugin events
                        $input.trigger("inputUpdate." + pluginName, [this, $input, $inputContainer, $valueContainer]);
                        this._get_func('hideInput').apply(this, [$valueContainer, $inputContainer,
                            function() {
                                $input.val('')
                                    .unbind('keydown.' + pluginName)
                                    .unbind('focusout.' + pluginName);
                                // if people wanna do something after inputUnload
                                $input.trigger('inputUnload.' + pluginName, [that, $input, $inputContainer, $valueContainer]);
                            }]);
                        }
                } else {
                    this._get_func('onUpdateError').apply(this, [$input, $inputContainer, $valueContainer]);
                }
            }
        },

        dismiss: function($valueContainer, $inputContainer) {
            // called when changes will be dismissed (ESC or focusout event)
            // 'this' is the plugin, we receive $valueContainer and $inputContainer
            var that = this;
            if ($inputContainer.is(":visible")) {
                this._get_func('hideInput').apply(this, [$valueContainer, $inputContainer,
                    function(){
                        $input = $inputContainer.find('input');
                        $input.val('') // reset input
                            .unbind('keydown.' + pluginName)
                            .unbind('focusout.' + pluginName);
                            // trigger inputLoad so users can unload some stuff
                            // remember to use e.target instead this.
                        $input.trigger('inputUnload.' + pluginName, [that, $input, $inputContainer, $valueContainer]);
                    }]);
            }
        },

        showInput: function($valueContainer, $inputContainer, callback) {
            /* Hide value container and show input container
             * Receive two containers as jquery objets
             * Returns nothing
             */
            if (!this.options.fade) {
                $valueContainer.hide(0, function() { $inputContainer.show(0, callback); });
            } else {
                $valueContainer.fadeOut(function() { $inputContainer.fadeIn(callback); });
            }
        },

        hideInput: function($valueContainer, $inputContainer, callback) {
            // hide input container and show value container
            if (!this.options.fade) {
                $inputContainer.hide(0, function() { $valueContainer.show(0, callback); });
            } else {
                $inputContainer.fadeOut(function() { $valueContainer.fadeIn(callback); });
            }
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options, args) {

        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, (args) ? Array.prototype.slice.call( args, 1 ) : args );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;

        }

    };

})( jQuery, window, document );
