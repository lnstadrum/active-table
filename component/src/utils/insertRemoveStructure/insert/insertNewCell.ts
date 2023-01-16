import {ColumnDropdownCellOverlay} from '../../../elements/dropdown/columnDropdown/cellOverlay/columnDropdownCellOverlay';
import {HeaderIconCellElement} from '../../../elements/cell/cellsWithTextDiv/headerIconCell/headerIconCellElement';
import {InsertRemoveColumnSizer} from '../../../elements/columnSizer/utils/insertRemoveColumnSizer';
import {ColumnGroupElement} from '../../../elements/table/addNewElements/column/columnGroupElement';
import {DateCellElement} from '../../../elements/cell/cellsWithTextDiv/dateCell/dateCellElement';
import {StaticTableWidthUtils} from '../../tableDimensions/staticTable/staticTableWidthUtils';
import {CheckboxCellElement} from '../../../elements/cell/checkboxCell/checkboxCellElement';
import {UpdateIndexColumnWidth} from '../../../elements/indexColumn/updateIndexColumnWidth';
import {SelectCell} from '../../../elements/cell/cellsWithTextDiv/selectCell/selectCell';
import {ColumnSettingsBorderUtils} from '../../columnSettings/columnSettingsBorderUtils';
import {SelectDropdown} from '../../../elements/dropdown/selectDropdown/selectDropdown';
import {ColumnDetailsInitial, ColumnDetailsT} from '../../../types/columnDetails';
import {ProcessedDataTextStyle} from '../../columnType/processedDataTextStyle';
import {CellDividerElement} from '../../../elements/cell/cellDividerElement';
import {CellTypeTotalsUtils} from '../../columnType/cellTypeTotalsUtils';
import {CellElementIndex} from '../../elements/cellElementIndex';
import {ColumnDetails} from '../../columnDetails/columnDetails';
import {CellElement} from '../../../elements/cell/cellElement';
import {CellText} from '../../../types/tableContents';
import {ActiveTable} from '../../../activeTable';
import {DataUtils} from '../shared/dataUtils';

export class InsertNewCell {
  // prettier-ignore
  private static insertElementsToRow(rowElement: HTMLElement, newCellElement: HTMLElement, columnIndex: number,
      displayIndexColumn: boolean) {
    // if child is undefined, the element is added at the end
    const childIndex = CellElementIndex.getViaColumnIndex(columnIndex, displayIndexColumn);
    rowElement.insertBefore(newCellElement, rowElement.children[childIndex]);
    const newCellDividerElement = CellDividerElement.create();
    rowElement.insertBefore(newCellDividerElement, rowElement.children[childIndex + 1]);
  }

  // please note that this is run twice in firefox due to the render function being triggered twice
  // prettier-ignore
  private static updateColumnDetailsAndSizers(
      at: ActiveTable, rowIndex: number, columnIndex: number, text: CellText, isNewText: boolean) {
    const columnDetails = at.columnsDetails[columnIndex];
    if (!columnDetails) return; // because column maximum kicks in during second render function trigger in firefox
    if (rowIndex === 0) {
      const columnDropdownCellOverlay = ColumnDropdownCellOverlay.add(at, columnIndex);
      ColumnDetails.updateWithNoSizer(columnDetails as ColumnDetailsInitial, columnDropdownCellOverlay); // REF-13
      InsertRemoveColumnSizer.insert(at, columnIndex); // REF-13
      if (isNewText) {
        InsertRemoveColumnSizer.cleanUpCustomColumnSizers(at, columnIndex);
        UpdateIndexColumnWidth.wrapTextWhenNarrowColumnsBreached(at); // REF-19
      }
    } else {
      CellTypeTotalsUtils.incrementCellType(columnDetails, text); // CAUTION-2
    }
  }

  // prettier-ignore
  private static insert(at: ActiveTable, rowElement: HTMLElement, newCellElement: HTMLElement,
      processedCellText: CellText, isNewText: boolean, rowIndex: number, columnIndex: number) {
    const {auxiliaryTableContentInternal: {displayIndexColumn}, contents, columnsDetails} = at;
    const columnDetails = columnsDetails[columnIndex];
    columnDetails.elements.splice(rowIndex, 0, newCellElement); // cannot be in timeout for max rows
    columnDetails.processedStyle.splice(rowIndex, 0, ProcessedDataTextStyle.getDefaultProcessedTextStyle());
    InsertNewCell.insertElementsToRow(rowElement, newCellElement, columnIndex, !!displayIndexColumn);
    // cannot place in a timeout as at.contents length is used to get last row index
    contents[rowIndex].splice(columnIndex, isNewText ? 0 : 1, processedCellText);
  }

  private static convertCell(at: ActiveTable, rowIndex: number, columnIndex: number, newCellElement: HTMLElement) {
    const columnDetails = at.columnsDetails[columnIndex];
    if (rowIndex === 0 && at.areIconsDisplayedInHeaders) {
      HeaderIconCellElement.setHeaderIconStructure(at, newCellElement, columnIndex);
    }
    if (!columnDetails.activeType) return;
    if (columnDetails.activeType.selectProps) {
      if (rowIndex === 0) {
        SelectDropdown.setUpDropdown(at, columnIndex);
      } else {
        SelectCell.convertCell(at, columnIndex, newCellElement);
        SelectCell.finaliseEditedText(at, newCellElement.children[0] as HTMLElement, columnIndex, true);
      }
    } else if (rowIndex > 0) {
      if (columnDetails.activeType.checkbox) {
        CheckboxCellElement.setCellCheckboxStructure(at, newCellElement, columnIndex, rowIndex);
      }
      if (columnDetails.activeType.calendar) {
        DateCellElement.setCellDateStructure(at, newCellElement, columnIndex);
      }
    }
  }

  // REF-13
  // prettier-ignore
  private static insertInitialColumnDetails(at: ActiveTable, cellText: CellText, columnIndex: number) {
    const {columnsDetails, customColumnsSettingsInternal, selectDropdownContainer, defaultColumnsSettings} = at;
    const selectDropdown = SelectDropdown.createAndAppend(selectDropdownContainer as HTMLElement);
    const columnDetails = ColumnDetails.createInitial(defaultColumnsSettings,
      selectDropdown, customColumnsSettingsInternal[cellText]);
    columnsDetails.splice(columnIndex, 0, columnDetails as ColumnDetailsT);
  }

  // isNewText indicates whether rowData is already in the contents state or if it needs to be added
  // prettier-ignore
  public static insertToRow(at: ActiveTable,
      rowElement: HTMLElement, rowIndex: number, columnIndex: number, cellText: CellText, isNewText: boolean) {
    if (rowIndex === 0) InsertNewCell.insertInitialColumnDetails(at, cellText, columnIndex); // REF-13
    const processedCellText = DataUtils.processCellText(at, rowIndex, columnIndex, cellText);
    const newCellElement = CellElement.createCellElement(at, processedCellText, columnIndex, rowIndex === 0);
    InsertNewCell.insert(at, rowElement, newCellElement, processedCellText, isNewText, rowIndex, columnIndex);
    InsertNewCell.convertCell(at, rowIndex, columnIndex, newCellElement); // need text set before conversion (checkbox)
    if (rowIndex === 0) {
      if (at.auxiliaryTableContentInternal.displayAddColumnCell) ColumnGroupElement.update(at);
      if (isNewText) StaticTableWidthUtils.changeWidthsBasedOnColumnInsertRemove(at, true); // REF-11
      ColumnSettingsBorderUtils.updateSiblingColumns(at, columnIndex);
    } else {
      ProcessedDataTextStyle.setCellStyle(at, rowIndex, columnIndex); // custom style will be applied in cellEvents
    }
    setTimeout(() => InsertNewCell.updateColumnDetailsAndSizers(at, rowIndex, columnIndex, processedCellText, isNewText));
  }
}
