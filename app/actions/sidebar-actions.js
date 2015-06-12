import AppDispatcher from '../dispatchers/app-dispatcher';
import SidebarConstants from '../constants/sidebar-constants';

let SidebarActions = {
  show(side) {
    AppDispatcher.dispatch({
      actionType: SidebarConstants.SHOW,
      side
    })
  }
};

export default SidebarActions;
