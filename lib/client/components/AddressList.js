import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addressListActions} from './../actions';
import LinearProgress from 'material-ui/LinearProgress';
import DynaTable from './DynaTable';
import TextField from 'material-ui/TextField';
import {Scrollbars} from 'react-custom-scrollbars';
import styles from './styles';

class AddressList extends Component {
  constructor (props) {
    super(props);
    this.props.loadAddressList();
    this.state = {
      addressFilter: '',
      addressList: this.props.addressList
    };
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillReceiveProps (nextProps) {
    this.setState({
      addressList: nextProps.addressList
    });
  }

  prepTable (addressList) {
    if (addressList.loading) {
      return (<LinearProgress mode="indeterminate"/>);
    }
    const addrList = Object.keys(addressList.data).map((addressRegisterNo) => {
      return addressList.data[addressRegisterNo].data;
    });
    const definition = {
      columns: {
        'address': {
          alias: 'Адрес',
          order: 1,
          preProcessing: (value) => {
            return (<div style={{ cursor: 'pointer' }}>{value}</div>);
          }
        },
        'comment': {
          alias: 'Комментарий',
          order: 3,
          preProcessing: (value) => {
            return (<div style={{ cursor: 'pointer' }}>{value}</div>);
          }
        },
        'state': {
          alias: 'Статус',
          order: 2,
          preProcessing: (value) => {
            return (<div style={{ cursor: 'pointer' }}>{value}</div>);
          }
        },
      },
      onRowSelection: (selectedIndexes) => {
        if (selectedIndexes.length > 0) {
          // TODO херня, переделать
          this.context.router.push('/editor/' + addrList[selectedIndexes[0]].RegisterNo);
        }
      }
    };

    return (
      <DynaTable
        definition={definition}
        data={addrList}
      />);
  }

  dataFilter (value) {
    if (value === '') {
      this.setState({
        addressList: this.props.addressList
      });
    } else {
      const regex = new RegExp(value, 'gi');
      const addressList = Object.assign({}, this.props.addressList);
      const addressListData = {};
      Object.keys(addressList.data).forEach((addressRegisterNo) => {
        if (addressList.data[addressRegisterNo].data.address.match(regex)) {
          addressListData[addressRegisterNo] = addressList.data[addressRegisterNo];
        }
      });
      addressList.data = addressListData;
      this.setState({
        addressList
      });
    }
  }

  render () {
    if (this.props.children) {
      let addressInfo = this.props.addressList.data[this.props.params.registerNo] || { loading: true };
      return React.cloneElement(this.props.children, {
        addressInfo,
        changeAddress: this.props.changeAddress
      });
    }

    return (
      <div style={{ height: '100%' }}>
        <div style={{ paddingLeft: 10 }}>
          <h2 style={styles.headline}>Список адресов</h2>
          <TextField
            hintText="адрес"
            floatingLabelText="Поиск по адресу"
            floatingLabelFixed={true}
            onChange={(e) => {
              this.setState({
                addressFilter: e.target.value
              });
              this.dataFilter(e.target.value);
            }}
            defaultValue={this.props.addressFilter}
          />
        </div>
        <Scrollbars style={{ height: 'calc(100% - 130px)' }}>
          {this.prepTable(this.state.addressList)}
        </Scrollbars>
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
  changeAddress: addressListActions.changeAddress,
})(AddressList);
