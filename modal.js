(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.tingle = factory();
    }
}(this, function() {
    var transitionEvent = whichTransitionEvent();
function Modal(options) {

        var defaults = {
            onClose: null,
            onOpen: null,
            beforeOpen: null,
            beforeClose: null,
            stickyFooter: false,
            footer: false,
            cssClass: [],
            closeLabel: 'Cerrar',
            closeMethods: ['overlay', 'button', 'escape']
        };

        // extends config
        this.opts = extend({}, defaults, options);

        // init modal
        this.init();
    }

    Modal.prototype.init = function() {
        if (this.modal) {
            return;
        }

        _build.call(this);
        _bindEvents.call(this);

        // insert modal in dom
        document.body.insertBefore(this.modal, document.body.firstChild);

        if (this.opts.footer) {
            this.addFooter();
        }
    };

    Modal.prototype.destroy = function() {
        if (this.modal === null) {
            return;
        }

        // unbind all events
        _unbindEvents.call(this);

        // remove modal from dom
        this.modal.parentNode.removeChild(this.modal);

        this.modal = null;
    };


    Modal.prototype.open = function() {

        var self = this;

        // before open callback
        if (typeof self.opts.beforeOpen === 'function') {
            self.opts.beforeOpen();
        }

        if (this.modal.style.removeProperty) {
            this.modal.style.removeProperty('display');
        } else {
            this.modal.style.removeAttribute('display');
        }

        // prevent double scroll
        this._scrollPosition = window.pageYOffset;
        
        //document.body.classList.add('tingle-enabled');
        document.body.className += ' tingle-enabled';
        
        document.body.style.top = -this._scrollPosition + 'px';

        // sticky footer
        this.setStickyFooter(this.opts.stickyFooter);

        // show modal
        //this.modal.classList.add('tingle-modal--visible');
        this.modal.className += ' tingle-modal--visible';

        if (transitionEvent) {
            this.modal.addEventListener(transitionEvent, function handler() {
                if (typeof self.opts.onOpen === 'function') {
                    self.opts.onOpen.call(self);
                }

                // detach event after transition end (so it doesn't fire multiple onOpen)
                self.modal.removeEventListener(transitionEvent, handler, false);

            }, false);
        } else {
            if (typeof self.opts.onOpen === 'function') {
                self.opts.onOpen.call(self);
            }
        }

        // check if modal is bigger than screen height
        this.checkOverflow();
    };

    Modal.prototype.isOpen = function() {
        //return !!this.modal.classList.contains("tingle-modal--visible");
    	return !!containsClass(this.modal,"tingle-modal--visible");
    	
    };

    Modal.prototype.close = function() {

        //  before close
        if (typeof this.opts.beforeClose === "function") {
            var close = this.opts.beforeClose.call(this);
            if (!close) return;
        }

        //document.body.classList.remove('tingle-enabled');
        removeClass(document.body,'tingle-enabled');
        
        window.scrollTo(0, this._scrollPosition);
        document.body.style.top = null;

        //this.modal.classList.remove('tingle-modal--visible');
        removeClass(this.modal,'tingle-modal--visible');
        //Using similar setup as onOpen
        //Reference to the Modal that's created
        var self = this;

        if (transitionEvent) {
            //Track when transition is happening then run onClose on complete
            this.modal.addEventListener(transitionEvent, function handler() {
                // detach event after transition end (so it doesn't fire multiple onClose)
                self.modal.removeEventListener(transitionEvent, handler, false);

                self.modal.style.display = 'none';

                // on close callback
                if (typeof self.opts.onClose === "function") {
                    self.opts.onClose.call(this);
                }

            }, false);
        } else {
            self.modal.style.display = 'none';
            // on close callback
            if (typeof self.opts.onClose === "function") {
                self.opts.onClose.call(this);
            }
        }
    };

    Modal.prototype.setContent = function(content) {
        // check type of content : String or Node
        if (typeof content === 'string') {
            this.modalBoxContent.innerHTML = content;
        } else {
            this.modalBoxContent.innerHTML = "";
            this.modalBoxContent.appendChild(content);
        }

        if (this.isOpen()) {
            // check if modal is bigger than screen height
            this.checkOverflow();
        }
    };

    Modal.prototype.getContent = function() {
        return this.modalBoxContent;
    };

    Modal.prototype.addFooter = function() {
        // add footer to modal
        _buildFooter.call(this);
    };

    Modal.prototype.setFooterContent = function(content) {
        // set footer content
        this.modalBoxFooter.innerHTML = content;
    };

    Modal.prototype.getFooterContent = function() {
        return this.modalBoxFooter;
    };

    Modal.prototype.setStickyFooter = function(isSticky) {
        // if the modal is smaller than the viewport height, we don't need sticky
        if (!this.isOverflow()) {
            isSticky = false;
        }

        if (isSticky) {
            if (this.modalBox.contains(this.modalBoxFooter)) {
                this.modalBox.removeChild(this.modalBoxFooter);
                this.modal.appendChild(this.modalBoxFooter);
                //this.modalBoxFooter.classList.add('tingle-modal-box__footer--sticky');
                this.modalBoxFooter.className += ' tingle-modal-box__footer--sticky';
                _recalculateFooterPosition.call(this);
                this.modalBoxContent.style['padding-bottom'] = this.modalBoxFooter.clientHeight + 20 + 'px';
            }
        } else if (this.modalBoxFooter) {
            if (!this.modalBox.contains(this.modalBoxFooter)) {
                this.modal.removeChild(this.modalBoxFooter);
                this.modalBox.appendChild(this.modalBoxFooter);
                this.modalBoxFooter.style.width = 'auto';
                this.modalBoxFooter.style.left = '';
                this.modalBoxContent.style['padding-bottom'] = '';
                removeClass(this.modalBoxFooter,'tingle-modal-box__footer--sticky');
                //this.modalBoxFooter.classList.remove('tingle-modal-box__footer--sticky');
            }
        }
    };


    Modal.prototype.addFooterBtn = function(label, cssClass, callback) {
        var btn = document.createElement("button");

        // set label
        btn.innerHTML = label;

        // bind callback
        btn.addEventListener('click', callback);

        if (typeof cssClass === 'string' && cssClass.length) {
            // add classes to btn
            cssClass.split(" ").forEach(function(item) {
                //btn.classList.add(item);
            	btn.className += ' ' + item;
            });
        }

        this.modalBoxFooter.appendChild(btn);

        return btn;
    };

    Modal.prototype.resize = function() {
        console.warn('Resize is deprecated and will be removed in version 1.0');
    };


    Modal.prototype.isOverflow = function() {
        var viewportHeight = window.innerHeight;
        var modalHeight = this.modalBox.clientHeight;

        return modalHeight >= viewportHeight;
    };

    Modal.prototype.checkOverflow = function() {
        // only if the modal is currently shown
        //if (this.modal.classList.contains('tingle-modal--visible')) {
    	if (containsClass(this.modal,'tingle-modal--visible')) {
            if (this.isOverflow()) {
                //this.modal.classList.add('tingle-modal--overflow');
            	this.modal.className += ' tingle-modal--overflow';
            } else {
                //this.modal.classList.remove('tingle-modal--overflow');
            	removeClass(this.modal,'tingle-modal--overflow');
            }

            // TODO: remove offset
            //_offset.call(this);
            if (!this.isOverflow() && this.opts.stickyFooter) {
                this.setStickyFooter(false);
            } else if (this.isOverflow() && this.opts.stickyFooter) {
                _recalculateFooterPosition.call(this);
                this.setStickyFooter(true);
            }
        }
    }

    function _recalculateFooterPosition() {
        if (!this.modalBoxFooter) {
            return;
        }
        this.modalBoxFooter.style.width = this.modalBox.clientWidth + 'px';
        this.modalBoxFooter.style.left = this.modalBox.offsetLeft + 'px';
    }

    function _build() {

        // wrapper
        this.modal = document.createElement('div');
        //this.modal.classList.add('tingle-modal');
        this.modal.className += ' tingle-modal'
        // remove cusor if no overlay close method
        if (this.opts.closeMethods.length === 0 || this.opts.closeMethods.indexOf('overlay') === -1) {
            //this.modal.classList.add('tingle-modal--noOverlayClose');
        	this.modal.className += ' tingle-modal--noOverlayClose';
            
        }

        this.modal.style.display = 'none';

        // custom class
        this.opts.cssClass.forEach(function(item) {
            if (typeof item === 'string') {
                //this.modal.classList.add(item);
            	this.modal.className += ' '+ item ;
            }
        }, this);

        // close btn
        if (this.opts.closeMethods.indexOf('button') !== -1) {
            this.modalCloseBtn = document.createElement('button');
            //this.modalCloseBtn.classList.add('tingle-modal__close');
            this.modalCloseBtn.className +=' tingle-modal__close';

            this.modalCloseBtnIcon = document.createElement('span');
            //this.modalCloseBtnIcon.classList.add('tingle-modal__closeIcon');
            this.modalCloseBtnIcon.className += ' tingle-modal__closeIcon';
            
            this.modalCloseBtnIcon.innerHTML = '×';

            this.modalCloseBtnLabel = document.createElement('span');
            //this.modalCloseBtnLabel.classList.add('tingle-modal__closeLabel');
            this.modalCloseBtnLabel.className += ' tingle-modal__closeLabel';
            
            this.modalCloseBtnLabel.innerHTML = this.opts.closeLabel;

            this.modalCloseBtn.appendChild(this.modalCloseBtnIcon);
            this.modalCloseBtn.appendChild(this.modalCloseBtnLabel);
        }

        // modal
        this.modalBox = document.createElement('div');
        //this.modalBox.classList.add('tingle-modal-box');
        this.modalBox.className += ' tingle-modal-box';

        // modal box content
        this.modalBoxContent = document.createElement('div');
        //this.modalBoxContent.classList.add('tingle-modal-box__content');
        this.modalBoxContent.className += ' tingle-modal-box__content';

        this.modalBox.appendChild(this.modalBoxContent);

        if (this.opts.closeMethods.indexOf('button') !== -1) {
            this.modal.appendChild(this.modalCloseBtn);
        }

        this.modal.appendChild(this.modalBox);

    }

    function _buildFooter() {
        this.modalBoxFooter = document.createElement('div');
        //this.modalBoxFooter.classList.add('tingle-modal-box__footer');
        this.modalBoxFooter.className += ' tingle-modal-box__footer';
        this.modalBox.appendChild(this.modalBoxFooter);
    }

    function _bindEvents() {

        this._events = {
            clickCloseBtn: this.close.bind(this),
            clickOverlay: _handleClickOutside.bind(this),
            resize: this.checkOverflow.bind(this),
            keyboardNav: _handleKeyboardNav.bind(this)
        };

        if (this.opts.closeMethods.indexOf('button') !== -1) {
            this.modalCloseBtn.addEventListener('click', this._events.clickCloseBtn);
        }

        this.modal.addEventListener('mousedown', this._events.clickOverlay);
        window.addEventListener('resize', this._events.resize);
        document.addEventListener("keydown", this._events.keyboardNav);
    }

    function _handleKeyboardNav(event) {
        // escape key
        if (this.opts.closeMethods.indexOf('escape') !== -1 && event.which === 27 && this.isOpen()) {
            this.close();
        }
    }

    function _handleClickOutside(event) {
        // if click is outside the modal
        if (this.opts.closeMethods.indexOf('overlay') !== -1 && !_findAncestor(event.target, 'tingle-modal') &&
        event.clientX < this.modal.clientWidth) {
            this.close();
        }
    }

    function _findAncestor(el, cls) {
        while ((el = el.parentElement) && !containsClass(el,cls));
        return el;
    }

    function _unbindEvents() {
        if (this.opts.closeMethods.indexOf('button') !== -1) {
            this.modalCloseBtn.removeEventListener('click', this._events.clickCloseBtn);
        }
        this.modal.removeEventListener('mousedown', this._events.clickOverlay);
        window.removeEventListener('resize', this._events.resize);
        document.removeEventListener("keydown", this._events.keyboardNav);
    }
 
    function extend() {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    }

    function whichTransitionEvent() {
        var t;
        var el = document.createElement('tingle-test-transition');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    return {
        modal: Modal
    };
}));

function containsClass(yourObj, yourClass) {
    if(!yourObj || typeof yourClass !== 'string') {
        return false;
    } else if(yourObj.className && yourObj.className.trim().split(/\s+/gi).indexOf(yourClass) > -1) {
        return true;
    } else {
        return false;
    }
}

function removeClass(ele,cls) {
	  if (containsClass(ele,cls)) {
	    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
	    ele.className=ele.className.replace(reg,' ');
	  }
	}