import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

class Test extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render () {
    return (
      <div>
        TEST!
        <FlatButton
          label="Домой"
          secondary={true}
          onClick={(() => {
            console.log('Переход на домой');
            this.context.router.push('/');
          }).bind(this)}
        />
      </div>
    );
  }
}

export default Test;
