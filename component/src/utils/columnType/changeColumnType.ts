import {HeaderIconCellElement} from '../../elements/cell/cellsWithTextDiv/headerIconCell/headerIconCellElement';
import {DateCellElement} from '../../elements/cell/cellsWithTextDiv/dateCell/dateCellElement';
import {CheckboxCellElement} from '../../elements/cell/checkboxCell/checkboxCellElement';
import {SelectCell} from '../../elements/cell/cellsWithTextDiv/selectCell/selectCell';
import {CellDropdown} from '../../elements/dropdown/cellDropdown/cellDropdown';
import {DataCellElement} from '../../elements/cell/dataCell/dataCellElement';
import {ColumnTypeInternal} from '../../types/columnTypeInternal';
import {ProcessedDataTextStyle} from './processedDataTextStyle';
import {CellElement} from '../../elements/cell/cellElement';
import {CellEvents} from '../../elements/cell/cellEvents';
import {ColumnDetailsT} from '../../types/columnDetails';
import {FireEvents} from '../events/fireEvents';
import {ActiveTable} from '../../activeTable';

export class ChangeColumnType {
  private static setInvalidCellToDefault(at: ActiveTable, rowIndex: number, columnIndex: number) {
    const relativeRowIndex = rowIndex + 1;
    const cellElement = at._columnsDetails[columnIndex].elements[relativeRowIndex];
    return CellEvents.setCellToDefaultIfNeeded(at, relativeRowIndex, columnIndex, cellElement, false);
  }

  private static setInvalidCellsToDefault(at: ActiveTable, columnIndex: number) {
    let updateTableEvent = false;
    at.content.slice(1).forEach((_, rowIndex) => {
      const isUpdated = ChangeColumnType.setInvalidCellToDefault(at, rowIndex, columnIndex);
      if (isUpdated && !updateTableEvent) updateTableEvent = true;
    });
    if (updateTableEvent) setTimeout(() => FireEvents.onContentUpdate(at));
  }

  private static setNew(at: ActiveTable, newType: string, columnIndex: number) {
    const columnDetails = at._columnsDetails[columnIndex];
    columnDetails.activeType = columnDetails.settings.types.find((type) => type.name === newType) as ColumnTypeInternal;
    return columnDetails.activeType;
  }

  public static setNewStructureBasedOnType(at: ActiveTable, columnIndex: number, newType: ColumnTypeInternal) {
    delete at._columnsDetails[columnIndex].cellDropdown.labelDetails;
    if (newType.cellDropdownProps) {
      CellDropdown.setUpDropdown(at, columnIndex);
      SelectCell.convertColumn(at, columnIndex, newType);
    } else if (newType.calendar) {
      DateCellElement.setColumnDateStructure(at, columnIndex);
    } else if (newType.checkbox) {
      CheckboxCellElement.setColumnCheckboxStructure(at, columnIndex);
    } else {
      DataCellElement.setColumnDataStructure(at, columnIndex);
    }
  }

  // this is required as switching to another type makes it difficult to overwrite text element (as there isn't one) for
  // checkboxes when validation fails
  private static resetCheckboxElements(columnDetails: ColumnDetailsT) {
    columnDetails.elements.slice(1).forEach((element) => {
      element.innerText = CellElement.getText(element);
    });
  }

  private static resetAndChangeFunc(at: ActiveTable, newTypeName: string, columnIndex: number) {
    const columnDetails = at._columnsDetails[columnIndex];
    if (columnDetails.activeType.checkbox) ChangeColumnType.resetCheckboxElements(columnDetails);
    const newType = ChangeColumnType.setNew(at, newTypeName, columnIndex);
    if (newType.textValidation.func && newType.textValidation.setTextToDefaultOnFail) {
      ChangeColumnType.setInvalidCellsToDefault(at, columnIndex);
    }
    ChangeColumnType.setNewStructureBasedOnType(at, columnIndex, newType);
    if (at.displayHeaderIcons) HeaderIconCellElement.changeHeaderIcon(at._columnsDetails[columnIndex]);
    setTimeout(() => FireEvents.onColumnsUpdate(at));
  }

  // prettier-ignore
  public static change(this: ActiveTable, newTypeName: string, columnIndex: number) {
    const previousType = this._columnsDetails[columnIndex].activeType;
    if (newTypeName !== previousType.name) {
      ProcessedDataTextStyle.resetDataCellsStyle(this, columnIndex,
        ChangeColumnType.resetAndChangeFunc.bind(this, this, newTypeName, columnIndex));
    }
  }
}
