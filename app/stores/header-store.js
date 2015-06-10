import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import ActionTypes from '../constants/header-constants';
import {EventEmitter} from 'events';

var HeaderStore = module.exports = _.assign({}, EventEmitter.prototype, {
  openAddItemModal: function() {
    var addItemButton = document.getElementsByClassName('add-item')[0];

    if (addItemButton) {
      addItemButton.click();
    }
  }
})

AppDispatcher.register(function(action) {
  console.log('HEADER_STORE: ', action.actionType);

  switch(action.actionType) {
    case ActionTypes.OPEN_MODAL:
      HeaderStore.openAddItemModal();
      break;

    default:
  }
});
