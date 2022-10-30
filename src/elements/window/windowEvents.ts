import {CategoryCellEvents} from '../cell/cellsWithTextDiv/categoryCell/categoryCellEvents';
import {DateCellInputElement} from '../cell/cellsWithTextDiv/dateCell/dateCellInputElement';
import {DateCellInputEvents} from '../cell/cellsWithTextDiv/dateCell/dateCellInputEvents';
import {MovableColumnSizerEvents} from '../columnSizer/movableColumnSizerEvents';
import {CellWithTextEvents} from '../cell/cellsWithTextDiv/cellWithTextEvents';
import {ColumnDropdown} from '../dropdown/columnDropdown/columnDropdown';
import {EditableTableComponent} from '../../editable-table-component';
import {ColumnSizerEvents} from '../columnSizer/columnSizerEvents';
import {USER_SET_COLUMN_TYPE} from '../../enums/columnType';
import {KEYBOARD_KEY} from '../../consts/keyboardKeys';
import {CellDetails} from '../../types/focusedCell';
import {Dropdown} from '../dropdown/dropdown';

export class WindowEvents {
  public static onKeyDown(this: EditableTableComponent, event: KeyboardEvent) {
    const {rowIndex, columnIndex} = this.focusedElements.cell as CellDetails;
    if (this.columnsDetails[columnIndex]?.userSetColumnType === USER_SET_COLUMN_TYPE.Category) {
      CategoryCellEvents.keyDownText(this, rowIndex, columnIndex, event);
    }
  }

  public static onKeyUp(this: EditableTableComponent, event: KeyboardEvent) {
    if (event.key === KEYBOARD_KEY.ESCAPE) {
      DateCellInputEvents.escapeKeyInput(this);
    }
  }

  // prettier-ignore
  public static onMouseDown(this: EditableTableComponent, event: MouseEvent) {
    // window event.target can only identify the parent element in shadow dom, not elements
    // inside it, hence if the user clicks inside the element, the elements inside will
    // handle the click event instead (full table overlay element for column dropdown)
    // and table element for the other closable elements  
    if ((event.target as HTMLElement).tagName === EditableTableComponent.ELEMENT_TAG) return;
    const {overlayElementsState: { columnDropdown }, focusedElements } = this
    // if the user clicks outside of the shadow dom and a dropdown is open, close it
    if (Dropdown.isDisplayed(columnDropdown)) {
      ColumnDropdown.processTextAndHide(this);
    // cell blur will not activate when the dropdown has been clicked and will not close if its scrollbar or padding are
    // clicked, hence once that happens, we close the dropdown programmatically as follows
    } else if (focusedElements.categoryDropdown) {
      CellWithTextEvents.programmaticBlur(this);
    } else if (this.overlayElementsState.datePickerCell) {
      DateCellInputElement.toggle(this.overlayElementsState.datePickerCell, false);
      delete this.overlayElementsState.datePickerCell;
    }
  }

  public static onMouseUp(this: EditableTableComponent) {
    if (this.tableElementEventState.columnSizer.selected) ColumnSizerEvents.windowOnMouseUp(this);
  }

  public static onMouseMove(this: EditableTableComponent, event: MouseEvent) {
    if (this.tableElementEventState.columnSizer.selected) MovableColumnSizerEvents.attemptMove(this, event.movementX);
  }
}
