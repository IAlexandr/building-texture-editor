import React from 'react';
import {createClass, PropTypes} from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';

var valBy = function (ns, obj) {
  var levels = ns.split('.');
  var first = levels.shift();
  if (typeof obj[first] === 'undefined') {
    return undefined;
  }
  if (levels.length) {
    return valBy(levels.join('.'), obj[first]);
  }
  return obj[first];
};

/*
 * TABLE DEFINITION
 * */
// tableDefinition = {
//   columns: {
//     'properties.keyName': {
//       order: 1,
//       alias: 'Наименование',
//       preProcessing: (value) => {
//         return value || 'нет данных';
//       }
//     },
//     showExpression: (obj) => {
//       return obj.isValid;
//     },
//     buttons: [
//       {
//         label: 'Отобразить на карте',
//         onClick: (request) => {
//           console.log('Отображение на карте requestId', request._id);
//         },
//         showExpression: (request) => {
//
//         }
//       },
//     ],
//     onRowSelection: (selectedIndexes) => {
//       if (selectedIndexes.length > 0) {
//         console.log('Отображение на карте', selectedIndexes, requests[selectedIndexes[0]]);
//       } else {
//         console.log('Убрано с карты');
//       }
//     },
//   }
// };

export default createClass({
  propTypes: {
    definition: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired
  },

  tableHeader () {
    const { definition } = this.props;
    const columnsDefinition = definition.columns;
    let buttonTableHeaderColumn;
    if (definition.buttons && definition.buttons.length > 0) {
      buttonTableHeaderColumn = <TableHeaderColumn />;
    }
    const headerColumns = Object.keys(columnsDefinition).sort((a, b) => {
      if (columnsDefinition[a].order > columnsDefinition[b].order) {
        return 1;
      }
      if (columnsDefinition[a].order < columnsDefinition[b].order) {
        return -1;
      }
      return 0;
    }).map((key) => {
      return (
        <TableHeaderColumn key={key}>
          {columnsDefinition[key].alias}
        </TableHeaderColumn>
      );
    });
    return (
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}
        enableSelectAll={false}
      >
        <TableRow>
          {buttonTableHeaderColumn}
          {headerColumns}
        </TableRow>
      </TableHeader>
    );
  },

  tableBody () {
    const { definition } = this.props;
    const columnsDefinition = definition.columns;

    function prepButton (prms) {
      return (
        <FlatButton
          key={prms.key}
          icon={prms.icon}
          style={prms.style}
          label={prms.label}
          href={prms.href}
          onClick={prms.onClick}
        />
      );
    }

    function hrefButton (obj, buttonDefinition, i) {
      const href = buttonDefinition.prepHref(obj);

      return prepButton({
        key: i,
        label: href,
        href: href,
        style: buttonDefinition.style,
      });
    }

    const showExpression = definition.showExpression || function () {
        return true
      };
    const keys = Object.keys(columnsDefinition).sort((a, b) => {
      if (columnsDefinition[a].order > columnsDefinition[b].order) {
        return 1;
      }
      if (columnsDefinition[a].order < columnsDefinition[b].order) {
        return -1;
      }
      return 0;
    });
    const tableRows = [];
    this.props.data.forEach((obj, i) => {
      let buttonRowColumn;
      if (definition.buttons && definition.buttons.length > 0) {
        const buttons = [];
        definition.buttons.forEach((buttonDefinition, i) => {
          if (buttonDefinition.hasOwnProperty('showExpression')) {
            if (buttonDefinition.showExpression(obj)) {
              if (buttonDefinition.hasOwnProperty('prepHref')) {
                buttons.push(hrefButton(obj, buttonDefinition, i));
              } else {
                buttons.push(prepButton({
                  key: i,
                  label: buttonDefinition.label,
                  icon: buttonDefinition.icon,
                  style: buttonDefinition.style,
                  href: buttonDefinition.href,
                  onClick: () => {
                    buttonDefinition.onClick(obj)
                  }
                }));
              }
            }
          } else {
            if (buttonDefinition.hasOwnProperty('prepHref')) {
              buttons.push(hrefButton(obj, buttonDefinition, i));
            } else {
              buttons.push(prepButton({
                key: i,
                label: buttonDefinition.label,
                icon: buttonDefinition.icon,
                style: buttonDefinition.style,
                href: buttonDefinition.href,
                onClick: () => {
                  buttonDefinition.onClick(obj)
                }
              }));
            }
          }
        });
        buttonRowColumn = (
          <TableRowColumn>
            {buttons}
          </TableRowColumn>
        );
      }
      const tableRowColumns = keys.map((key) => {
        var value = valBy(key, obj);
        if (columnsDefinition[key].hasOwnProperty('preProcessing')) {
          value = columnsDefinition[key].preProcessing(value);
        }
        let title = '';
        if (typeof value === 'string' || typeof value === 'number') {
          title = value;
        }
        return (
          <TableRowColumn title={title} style={{ whiteSpace: 'pre-wrap' }} key={key}>
            {value}
          </TableRowColumn>
        );
      });
      if (showExpression(obj)) {
        tableRows.push(
          <TableRow key={i}>
            {buttonRowColumn}
            {tableRowColumns}
          </TableRow>
        );
      }
    });

    return (
      <TableBody
        displayRowCheckbox={false}
        deselectOnClickaway={true}
        showRowHover={true}
        stripedRows={false}
      >
        {tableRows}
      </TableBody>
    );
  },

  render () {
    return (
      <Table
        height={'100%'}
        multiSelectable={false}
        onRowSelection={this.props.definition.onRowSelection}
      >
        {this.tableHeader()}
        {this.tableBody()}
      </Table>
    );
  }
});

