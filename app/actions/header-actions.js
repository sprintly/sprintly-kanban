import _ from 'lodash';
import AppDispatcher from '../dispatchers/app-dispatcher';
import HeaderConstants from '../constants/header-constants';

let HeaderActions = {
  openAddModal() {
    AppDispatcher.dispatch({
      actionType: HeaderConstants.OPEN_MODAL
    })
  }
}

export default HeaderActions;
