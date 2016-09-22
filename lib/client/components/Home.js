import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

class Home extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render () {
    if (this.props.children) {
      return React.cloneElement(this.props.children, {});
    }
    return (
      <div>
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

export default Home;
