import React from 'react/addons';
import AddItemModal from '../components/add-item-modal';

var AddItemPage = React.createClass({
  render() {
    return (
      <div className="col-sm-8 col-offset-2 static-modal">
        <AddItemModal backdrop={false} animation={false}/>
      </div>
    )
  }
});

export default AddItemPage;
