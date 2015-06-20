import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import SidebarConstants from '../constants/sidebar-constants';
import {EventEmitter} from 'events';

const CHANGE_EVENT = 'change';

let _openState = {side: ''};

var SidebarStore = module.exports = _.assign({}, EventEmitter.prototype, {

  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  openState() {
    return _openState;
  }
});

var internals = SidebarStore.internals = {
      // We have to reach out to the top level DOM node so that the sidebars react
    show(side) {
      var canvasWrap = document.getElementsByClassName('row-offcanvas')[0];

      if (_.contains(canvasWrap.className.split(' '), 'active')) {
        canvasWrap.className = 'row-offcanvas';

        _openState.side = '';
      } else {
        canvasWrap.className = `row-offcanvas row-offcanvas-${side} active`;
        _openState.side = side;
      }

      // Return value for testability
      return canvasWrap.className;
    }
}

SidebarStore.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case SidebarConstants.SHOW:
      internals.showSide(action.side);
      SidebarStore.emitChange();
      break;
    default:
      break;
  }
});
