import React, { Component } from 'react';
import {connect} from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import {addressListActions} from './../actions';

class AddressList extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render () {
    if (this.props.children) {
      return React.cloneElement(this.props.children, {});
    }
    return (
      <div>
        <h3>Список адресов</h3>
        Поиск по адресу:
        <FlatButton
          label="Редактрирование текстуры"
          secondary={true}
          onClick={(() => {
            console.log('Редактрирование текстуры');
            this.context.router.push('/editor/123123');
          }).bind(this)}
        />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    addressList: state.addressList,
  };
}

export default connect(mapStateToProps, {
  loadAddressList: addressListActions.loadAddressList,
})(AddressList);
