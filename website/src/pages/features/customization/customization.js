import ActiveTableBrowser from '../../../components/table/activeTableBrowser';
import './customization.css';
import React from 'react';

function Panel({children}) {
  return (
    <div className="customization-panel">
      <div className="customization-panel-table">{children}</div>
    </div>
  );
}

function BottomPanel() {
  return (
    <div id="customization-bottom">
      <Panel>
        <ActiveTableBrowser
          tableStyle={{width: '100%', borderRadius: '8px', border: 'unset'}}
          cellStyle={{borderRight: 'unset', color: 'white'}}
          pagination={{
            styles: {
              pageButtons: {
                buttons: {
                  default: {
                    color: 'grey',
                    stroke: 'grey',
                    backgroundColor: 'none',
                    border: 'none',
                    marginTop: '3px',
                    borderRadius: '5px',
                  },
                },
                activeButton: {default: {backgroundColor: '#2e3c60', border: 'none', color: 'white'}},
                actionButtons: {default: {border: 'none'}},
                disabledButtons: {default: {backgroundColor: 'white'}},
                firstVisibleButtonOverride: {},
                lastVisibleButtonOverride: {},
              },
            },
            rowsPerPageSelect: false,
            displayNumberOfVisibleRows: false,
            positions: {pageButtons: {position: 'bottom-center'}},
            rowsPerPage: 4,
          }}
          stripedRows={{odd: {backgroundColor: '#2e3c60'}, even: {backgroundColor: '#242b4a'}}}
          columnResizerColors={{hover: '#205be3', click: '#1245b8'}}
          headerIconStyle={{
            filterColor:
              'brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(6%) hue-rotate(76deg) brightness(100%) contrast(104%)',
          }}
          headerStyles={{default: {backgroundColor: '#08183a'}, hoverColors: {backgroundColor: '#0a1e47'}}}
          displayAddNewRow={false}
          displayAddNewColumn={false}
          content={[
            ['Planet', 'Diameter', 'Mass', 'Moons'],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Saturn', 120536, 568, 82],
            ['Neptune', 49528, 102, 14],
            ['Mercury', 4879, 0.33, 0],
            ['Venus', 12104, 4.87, 0],
            ['Uranus', 51118, 86.8, 27],
            ['Pluto', 2376, 0.013, 5],
            ['Moon', 3475, 0.073, 0],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Saturn', 120536, 568, 82],
            ['Neptune', 49528, 102, 14],
            ['Mercury', 4879, 0.33, 0],
          ]}
        ></ActiveTableBrowser>
      </Panel>
      <Panel>
        <ActiveTableBrowser
          tableStyle={{width: '100%', borderRadius: '8px', border: 'unset'}}
          cellStyle={{borderRight: 'unset', color: 'white'}}
          pagination={{
            styles: {
              pageButtons: {
                buttons: {
                  default: {
                    color: 'grey',
                    stroke: 'grey',
                    border: '1px solid #dedede',
                    marginRight: '5px',
                    marginTop: '5px',
                    height: '25px',
                    minWidth: '25px',
                    borderRadius: '20px',
                  },
                },
                activeButton: {
                  default: {
                    marginTop: '2px',
                    backgroundColor: '#434343',
                    color: 'white',
                    border: '1px solid #434343',
                    height: '31px',
                    minWidth: '31px',
                  },
                },
                disabledButtons: {default: {backgroundColor: 'white'}},
                firstVisibleButtonOverride: {},
                lastVisibleButtonOverride: {},
              },
            },
            displayFirstLast: false,
            rowsPerPageSelect: false,
            displayNumberOfVisibleRows: false,
            positions: {pageButtons: {position: 'bottom-center'}},
            rowsPerPage: 4,
          }}
          stripedRows={{odd: {backgroundColor: '#4f4f4f'}, even: {backgroundColor: '#373737'}}}
          headerIconStyle={{
            filterColor:
              'brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(6%) hue-rotate(76deg) brightness(100%) contrast(104%)',
          }}
          headerStyles={{default: {backgroundColor: '#2d2d2d'}, hoverColors: {backgroundColor: '#353535'}}}
          columnResizerColors={{click: '#727272'}}
          displayAddNewRow={false}
          displayAddNewColumn={false}
          content={[
            ['Planet', 'Diameter', 'Mass', 'Moons'],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Saturn', 120536, 568, 82],
            ['Neptune', 49528, 102, 14],
            ['Mercury', 4879, 0.33, 0],
            ['Venus', 12104, 4.87, 0],
            ['Uranus', 51118, 86.8, 27],
            ['Pluto', 2376, 0.013, 5],
            ['Moon', 3475, 0.073, 0],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Saturn', 120536, 568, 82],
            ['Neptune', 49528, 102, 14],
            ['Mercury', 4879, 0.33, 0],
          ]}
        ></ActiveTableBrowser>
      </Panel>
    </div>
  );
}

function TopPanel() {
  return (
    <div id="customization-top">
      <Panel>
        <ActiveTableBrowser
          tableStyle={{width: '100%'}}
          headerStyles={{
            default: {backgroundColor: '#5686b7', color: 'white'},
            hoverColors: {backgroundColor: '#4978a8'},
          }}
          cellStyle={{borderBottom: 'unset'}}
          headerIconStyle={{
            filterColor:
              'brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(6%) hue-rotate(76deg) brightness(100%) contrast(104%)',
          }}
          stripedRows={{odd: {backgroundColor: ''}, even: {backgroundColor: '#edf7ff'}}}
          columnResizerColors={{hover: '#66b3ff', click: '#4aa5ff'}}
          displayAddNewColumn={false}
          content={[
            ['Planet', 'Diameter', 'Mass', 'Moons'],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Neptune', 49528, 102, 14],
          ]}
        ></ActiveTableBrowser>
      </Panel>
      <Panel>
        <ActiveTableBrowser
          tableStyle={{borderRadius: '5px', width: '100%'}}
          headerStyles={{
            default: {backgroundColor: '#52555b', color: 'white'},
            hoverColors: {backgroundColor: '#484b50'},
          }}
          headerIconStyle={{
            filterColor:
              'brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(6%) hue-rotate(76deg) brightness(100%) contrast(104%)',
          }}
          stripedRows={{odd: {backgroundColor: ''}, even: {backgroundColor: '#ebebeb7a'}}}
          columnResizerColors={{click: '#727272'}}
          content={[
            ['Planet', 'Diameter', 'Mass', 'Moons'],
            ['Earth', 12756, 5.97, 1],
            ['Mars', 6792, 0.642, 2],
            ['Jupiter', 142984, 1898, 79],
            ['Neptune', 49528, 102, 14],
          ]}
        ></ActiveTableBrowser>
      </Panel>
    </div>
  );
}

export default function Customization() {
  return (
    <div id="customization">
      <div className="feature-sub-header">Your table, your style</div>
      <TopPanel></TopPanel>
      <BottomPanel></BottomPanel>
    </div>
  );
}
