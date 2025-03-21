import TableContainer, {extractChildTableElement} from '@site/src/components/table/tableContainer';
import LiveTableData from './liveTableData';
import React from 'react';

function ResultText(props) {
  return (
    <div>
      Method results:
      <LiveTableData data={props.resultText}></LiveTableData>
    </div>
  );
}

function click(table, resultText, setResultText, propertyName, displayResults, argument) {
  const activeTableReference = extractChildTableElement(table);
  const content = activeTableReference[propertyName](argument);
  if (displayResults ?? true) {
    let newResultTextArr = [...resultText];
    if (newResultTextArr.length === 1 && newResultTextArr[0] === '') newResultTextArr = [];
    if (newResultTextArr.length > 3) newResultTextArr.pop();
    newResultTextArr.unshift(JSON.parse(JSON.stringify(content)));
    setResultText(newResultTextArr);
  }
}

export default function TableContainerMethods({children, propertyName, displayResults, argument}) {
  const tableContainerRef = React.useRef(null);
  const [resultText, setResultText] = React.useState(['']);

  return (
    <div>
      <div ref={tableContainerRef}>
        <TableContainer>{children}</TableContainer>
      </div>
      <div className="documentation-example-container">
        <button
          className="documentation-method-button"
          onClick={() =>
            click(tableContainerRef.current.children[0], resultText, setResultText, propertyName, displayResults, argument)
          }
        >
          Call Method
        </button>
        {(displayResults ?? true) && <ResultText resultText={resultText} />}
      </div>
    </div>
  );
}
