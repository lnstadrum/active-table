import {InsertNewColumn} from '../insertRemoveStructure/insert/insertNewColumn';
import {CellDropdown} from '../../elements/dropdown/cellDropdown/cellDropdown';
import {TableRow, CellText, TableContent} from '../../types/tableContent';
import {InsertNewRow} from '../insertRemoveStructure/insert/insertNewRow';
import {FocusedCellUtils} from '../focusedElements/focusedCellUtils';
import {DataUtils} from '../insertRemoveStructure/shared/dataUtils';
import {ColumnTypesUtils} from '../columnType/columnTypesUtils';
import {CaretPosition} from '../focusedElements/caretPosition';
import {CellElementIndex} from '../elements/cellElementIndex';
import {CellElement} from '../../elements/cell/cellElement';
import {ColumnsDetailsT} from '../../types/columnDetails';
import {CellEvents} from '../../elements/cell/cellEvents';
import {HeaderText} from '../columnDetails/headerText';
import {FireEvents} from '../events/fireEvents';
import {EMPTY_STRING} from '../../consts/text';
import {ArrayUtils} from '../array/arrayUtils';
import {ActiveTable} from '../../activeTable';

export class InsertMatrix {
  // prettier-ignore
  private static removeDataThatIsNotEditableFromNewRows(columnsDetails: ColumnsDetailsT, dataForNewRows: TableContent,
      startColumnIndex: number) {
    const existingColumnsToCheck = columnsDetails.slice(startColumnIndex);
    existingColumnsToCheck.forEach((columnDetails, colIndex) => {
      if (!columnDetails.settings.isCellTextEditable) {
        dataForNewRows.forEach((dataRow) => {dataRow[colIndex] = EMPTY_STRING;});
      }
    });
    return dataForNewRows;
  }

  // if the data does not fill the 2D array, fill cells with empty strings
  private static createRowDataArrayWithEmptyCells(arrayLength: number, data: TableRow, dataStartIndex: number) {
    const newRowData = DataUtils.createEmptyStringDataArray(arrayLength) as TableRow;
    newRowData.splice(dataStartIndex, data.length, ...data);
    return newRowData;
  }

  // prettier-ignore
  private static createNewRows(at: ActiveTable, dataForNewRows: TableContent, startColumnIndex: number) {
    const processedDataForNewRows = InsertMatrix.removeDataThatIsNotEditableFromNewRows(at._columnsDetails,
      dataForNewRows, startColumnIndex);
    processedDataForNewRows.forEach((rowData: TableRow) => {
      const newRowData = InsertMatrix.createRowDataArrayWithEmptyCells(
        at.content[0]?.length || 0, rowData, startColumnIndex);
      InsertNewRow.insert(at, at.content.length, true, newRowData);
    });
  }

  private static changeColumnSettings(at: ActiveTable, columnIndex: number) {
    const {elements} = at._columnsDetails[columnIndex];
    FocusedCellUtils.set(at._focusedElements.cell, elements[0], 0, columnIndex);
    HeaderText.onAttemptChange(at, elements[0], columnIndex);
  }

  private static processNewColumn(at: ActiveTable) {
    const lastColumnIndex = at._columnsDetails.length - 1;
    CellEvents.setCellToDefaultIfNeeded(at, 0, lastColumnIndex, at._columnsDetails[lastColumnIndex].elements[0], false);
    InsertMatrix.changeColumnSettings(at, lastColumnIndex);
  }

  // prettier-ignore
  private static createNewColumns(at: ActiveTable, dataForNewColumnsByRow: TableContent, startRowIndex: number) {
    const dataForNewColumnsByColumn = ArrayUtils.transpose(dataForNewColumnsByRow);
    dataForNewColumnsByColumn.forEach((columnData: TableRow) => {
      const newColumnData = InsertMatrix.createRowDataArrayWithEmptyCells(
        at.content.length, columnData, startRowIndex);
      InsertNewColumn.insert(at, at.content[0].length, newColumnData);
      InsertMatrix.processNewColumn(at);
    });
  }

  // prettier-ignore
  private static overwriteCell(at: ActiveTable,
    rowElement: HTMLElement, rowIndex: number, columnIndex: number, newCellText: string) {
    const {_frameComponents: {displayIndexColumn}, _columnsDetails} = at;
    const elementIndex = CellElementIndex.getViaColumnIndex(columnIndex, !!displayIndexColumn);
    const cellElement = rowElement.children[elementIndex] as HTMLElement;
    const columnDetails = _columnsDetails[columnIndex];
    if ((rowIndex === 0 && !columnDetails.settings.isHeaderTextEditable)
      || rowIndex > 0 && !columnDetails.settings.isCellTextEditable) return;
    // this is to allow duplicate headers to be identified
    if (rowIndex === 0) CellElement.setNewText(at, cellElement, newCellText, false, false);
    CellEvents.updateCell(at, newCellText, rowIndex, columnIndex, { element: cellElement, updateTableEvent: false });
    ColumnTypesUtils.updateDataElements(at, rowIndex, columnIndex, cellElement);
    if (rowIndex === 0) InsertMatrix.changeColumnSettings(at, columnIndex);
  }

  // prettier-ignore
  private static overwriteRowData(at: ActiveTable,
      row: TableRow, rowIndex: number, columnIndex: number, rowElement: HTMLElement) {
    row.forEach((cellText: CellText, rowColIndex: number) => {
      const relativeColumnIndex = columnIndex + rowColIndex;
      InsertMatrix.overwriteCell(at, rowElement, rowIndex, relativeColumnIndex, cellText as string);
    });
  }

  // prettier-ignore
  private static setCaretToEndAndHighlightIfSelect(at: ActiveTable, cellElement: HTMLElement, columnIndex: number) {
    const {activeType, cellDropdown, settings: {defaultText}} = at._columnsDetails[columnIndex];
    CaretPosition.setToEndOfText(at, cellElement);
    if (activeType.cellDropdownProps) {
      CellDropdown.updateCellDropdown(cellElement, cellDropdown, at._tableDimensions.border, defaultText, true);
    }
  }

  // prettier-ignore
  private static overwriteExistingCells(
    at: ActiveTable, dataToOverwriteRows: TableContent, startRowIndex: number, startColumnIndex: number) {
  const dataForNewColumns: TableContent = [];
  dataToOverwriteRows.forEach((dataToOverwriteRow: TableRow, colIndex: number) => {
    const relativeRowIndex = startRowIndex + colIndex;
    const rowElement = at._tableBodyElementRef?.children[relativeRowIndex] as HTMLElement;
    const numberOfCellsToOverwrite = at.content[0].length - startColumnIndex;
    const overwriteData = dataToOverwriteRow.slice(0, numberOfCellsToOverwrite);
    InsertMatrix.overwriteRowData(at, overwriteData, relativeRowIndex, startColumnIndex, rowElement);
    const overflowData = dataToOverwriteRow.slice(numberOfCellsToOverwrite);
    dataForNewColumns.push(overflowData);
  });
  const focusedElement = at._focusedElements.cell.element as HTMLElement; // REF-15
  setTimeout(() => InsertMatrix.setCaretToEndAndHighlightIfSelect(at, focusedElement, startColumnIndex));
  return dataForNewColumns;
}

  // no new rows should be created if no columns that are to be overwritten/created allow text edit
  private static canNewRowsBeCreated(at: ActiveTable, matrix: TableContent, startColumnIndex: number) {
    return at._columnsDetails
      .slice(startColumnIndex, startColumnIndex + matrix[0].length)
      .find((columnDetails) => columnDetails.settings.isCellTextEditable);
  }

  private static insertColumnsInsideIfCantInsertRight(at: ActiveTable, matrix: TableContent, startColumnIndex: number) {
    const columnsToBeOverwritten = at._columnsDetails.slice(startColumnIndex);
    const indexOfNoRightInsertionColumn = columnsToBeOverwritten.findIndex((columnDetails) => {
      return columnDetails.settings.columnDropdown.isInsertRightAvailable === false;
    });
    // if can insert right for all proceeding, no need to augment matrix or table
    if (indexOfNoRightInsertionColumn === -1) return;
    if (indexOfNoRightInsertionColumn === 0) {
      // if the currently pasted on column does not allow right insertion, only overwrite the existing column's cells
      // this augments the matrix object to contain data for the first column
      matrix.forEach((row) => row.splice(1, row.length - 1));
    } else {
      // insert new columns before the column that has no right insertion and also overwrite that column's cells
      const numberOfColumnsToBeInserted = matrix[0].length - (indexOfNoRightInsertionColumn + 1);
      for (let i = 0; i < numberOfColumnsToBeInserted; i += 1) {
        // + i to set the columnDropdownCellOverlay on the correct index
        InsertNewColumn.insert(at, startColumnIndex + indexOfNoRightInsertionColumn + i);
      }
    }
  }

  private static getNewMatrixBasedOnColumns(matrix: TableContent, tableContent: TableContent, startColumnIndex: number) {
    const numberOfNewColumnsRequired = (matrix[0]?.length || 0) - (tableContent[0]?.length || 0) - startColumnIndex;
    if (numberOfNewColumnsRequired > 0) {
      // because imported CSV removes any existing rows after startRowIndex - use tableContent.length
      return new Array(tableContent.length).fill(new Array(numberOfNewColumnsRequired).fill(EMPTY_STRING));
    }
    return [];
  }

  // A matrix is a complete 2D array
  // prettier-ignore
  public static insert(at: ActiveTable,
      matrix: TableContent, startRowIndex: number, startColumnIndex: number, isFullTableData?: boolean) {
    const numberOfRowsToOverwrite = at.content.length - startRowIndex;
    // import ignores the isInsertRightAvailable rule
    if (!isFullTableData) InsertMatrix.insertColumnsInsideIfCantInsertRight(at, matrix, startColumnIndex);
    const dataToOverwriteRows = matrix.slice(0, numberOfRowsToOverwrite);
    // the reason why new columns are not created when the existing cells are overwritten is because the creation of new
    // columns allows new column data to be defined - which is gathered after traversing all dataToOverwriteRows
    const dataForNewColumnsByRow = isFullTableData
      ? InsertMatrix.getNewMatrixBasedOnColumns(matrix, at.content, startColumnIndex)
      : InsertMatrix.overwriteExistingCells(at, dataToOverwriteRows, startRowIndex, startColumnIndex);
    InsertMatrix.createNewColumns(at, dataForNewColumnsByRow, startRowIndex);
    if (!isFullTableData && !InsertMatrix.canNewRowsBeCreated(at, matrix, startColumnIndex)) return;
    const dataForNewRows = matrix.slice(numberOfRowsToOverwrite);
    InsertMatrix.createNewRows(at, dataForNewRows, startColumnIndex);
    setTimeout(() => FireEvents.onContentUpdate(at));
  }
}
