/**
 * @classdesc
 *  Actions class for dispatching events within the knowledge map scope;
 * @author    yyang@github
 * @version   private
 * @private
 * @property {Function} register       Registeres an action.
 * @property {Function} unregister     Unregister action.
 * @property {Boolean}  enabled        Status of action dispacher.
 * @property {Function} clickHandler   Handler for click events.
 * @property {Function} mouseoverHandler
 *                                     Handler for mouseover events.
 */

/**
 * Action object definition
 * @typedef action
 * @type {Object}
 * @property {String}   __name         Name of action, should be in sync with
 *                                     data-cmd or data-mouseover tag in HTML.
 * @property {Function} click          Function for dispatched click event.
 *                                     Triggered when click on Element with 
 *                                     data-cmd tag.
 *  @param {MouseEvent} evt            Single argument, pass in MouseEvent.
 * @property {Function} dblclick       Function for dispatched dblckick event.
 *                                     Triggered when double click on Element
 *                                     with data-cmd tag.
 *  @param {MouseEvent} evt            Single argument, pass in MouseEvent.
 * @property {Function} mouseover      Function for dispatched mouseover event.
 *                                     Triggered when mouseover Element with 
 *                                     data-mouseover tag.
 *  @param {MouseEvent} evt            Single argument, pass in MouseEvent.
 * @property {Function} timedMouseover Function for dispatched mouseover event
 *                                     with delay. Triggered when mouseover 
 *                                     Element with data-mouseover tag for
 *                                     certain amount of time.
 *  @param {MouseEvent} evt            Single argument, pass in MouseEvent.
 * @property {Number}   timedDelay     Latency for timedMouseover Event.
 * @property {Function} resize         Fired when browser resize event was 
 *                                     triggered. Different browsers may have
 *                                     different behaviours.
 * @property {Function} timedResize    Debounced resize event, fired at the end 
 *                                     of window resizing.
 */

(function() {

'use strict';

var actionsEnabled = false, actions = {};
var actionTimedNode, actionMouseoverTimeout, actionResizeTimeout;

function Actions() {}

$define(Actions, {
  /**
   * @param {action} Action            Action object to be registered.
   */
  $register: function(Action) {
    if (!Action['source'])
      Action['source'] = 'native';
    if (Action['__name'] instanceof Array)
      Action['__name'].forEach(function(name) {
        actions[name] = Action;
      });
    else
      actions[Action['__name']] = Action;
    //console.log(Action['__name'], 'registered');
  },
  /**
   * @param {action|string} Action     Action object or __name of action to be
   *                                   removed.
   */
  $unregister: function() {
    if (typeof arguments[0] === 'string') 
       deleteAction(actions[arguments[0]]);
    else if (arguments[0] instanceof Array) {
      arguments[0].forEach(function(name) {
        delete actions[name];
      });
      return null;
    }
    else if (typeof arguments[0] === 'object')
      deleteAction(arguments[0]);

    function deleteAction(Action) {
      if (Action['__name'] instanceof Array)
        Action['__name'].forEach(function(name) {
          delete actions[name];
        });
      else
        delete actions[Action['__name']];
    }
  },
  get enabled() {
    return actionsEnabled;
  },
  set enabled(enable) {
    if (enable === actionsEnabled)
      return false;
    if (enable) {
      ['mouseup', 'mousedown', 'click', 'dblclick'].forEach(function(eventType) {
        document.addEventListener(eventType, Actions.clickHandler, false);
      });
      document.addEventListener('mouseover', Actions.mouseoverHandler, false);
      window.addEventListener('resize', Actions.resizeHandler, false);
    } else {
      ['mouseup', 'mousedown', 'click', 'dblclick'].forEach(function(eventType) {
        document.removeEventListener(eventType, Actions.clickHandler);
      });
      document.removeEventListener('mouseover', Actions.mouseoverHandler);
      window.removeEventListener('resize', Actions.resizeHandler);
    }
    actionsEnabled = enable;
  },
  clickHandler: function(evt) {
    // Clear Selection
    if(document.selection && document.selection.empty) {
      document.selection.empty();
    } else if(window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
    }
    // Event dispatching
    var target = evt.target;
    for (var node = target.$findAncestorWithAttribute('data-cmd'); node;
          node = node.$findAncestorWithAttribute('data-cmd', true)) {
      var action = node.$getData('cmd');
      if (!actions.hasOwnProperty(action))
        continue;
      var Action = actions[action];
      var eventType = evt.type;
      if (Action[eventType]) {
        Action[eventType](evt);
        return false;
      }
    }
  },
  mouseoverHandler: function(evt) {
    var node = evt.target.$findAncestorWithAttribute('data-mouseover');
    if (!node) {
      if (actionMouseoverTimeout) {
        window.clearTimeout(actionMouseoverTimeout);
        actionMouseoverTimeout = null;
      }
      return false;
    }
    var action = node.$getData('mouseover');
    if (node && actions.hasOwnProperty(action)) {
      var Action = actions[action];
      if (Action['timedMouseover']) {
        if (actionTimedNode === node && actionMouseoverTimeout)
          return false;
        if (actionMouseoverTimeout)
          window.clearTimeout(actionMouseoverTimeout);
        actionMouseoverTimeout = window.setTimeout(function() {
          Action['timedMouseover'](evt);
        }, Action['timedDelay'] || 1000);
        actionTimedNode = node;
      } else {
        if (actionMouseoverTimeout) {
          window.clearTimeout(actionMouseoverTimeout);
          actionMouseoverTimeout = null;
        }
      }
      if (Action['mouseover']) {
        Action['mouseover'](evt);
      }
    }
  },
  resizeHandler: function(evt) {
    if (actionResizeTimeout)
      window.clearTimeout(actionResizeTimeout);
    actionResizeTimeout = window.setTimeout(function() {
      Actions.fire('timedResize', evt);
    }, 300);
    Actions.fire('resize', evt);
  },
  fire: function(eventType, data) {
    for (var action in actions) {
      var Action = actions[action];
      if (Action[eventType])
        Action[eventType](data);
    }
  }
});

$define(window, {
  'Actions': Actions
});

})();