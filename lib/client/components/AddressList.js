import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addressListActions} from './../actions';
import LinearProgress from 'material-ui/LinearProgress';
import DynaTable from './DynaTable';
import TextField from 'material-ui/TextField';
import {Scrollbars} from 'react-custom-scrollbars';

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 0,
    marginBottom: 12,
    fontWeight: 400,
  },
};

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
          this.context.router.push('/editor/' + addressList.data[selectedIndexes[0]].RegisterNo);
        }
      }
    };

    return (<DynaTable
      definition={definition}
      data={addressList.data}
    />);
  }

  dataFilter (value) {
    if (value === '') {
      this.setState({
        addressList: this.props.addressList
      });
    } else {
      const regex = new RegExp(value, 'gi');
      const addressList = Object.assign({}, this.state.addressList);
      addressList.data = this.props.addressList.data.filter((addressItem)=> {
        return addressItem.address.match(regex);
      });
      this.setState({
        addressList
      });
    }
  }

  render () {
    if (this.props.children) {
      return React.cloneElement(this.props.children, {});
    }

    return (
      <div style={{ height: '100%' }}>
        <div style={{paddingLeft: 10}}>
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
})(AddressList);
