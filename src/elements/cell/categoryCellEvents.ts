import {CategoryDropdownItem} from '../dropdown/categoryDropdown/categoryDropdownItem';
import {CategoryDropdown} from '../dropdown/categoryDropdown/categoryDropdown';
import {FocusedCellUtils} from '../../utils/focusedElements/focusedCellUtils';
import {CaretPosition} from '../../utils/focusedElements/caretPosition';
import {EditableTableComponent} from '../../editable-table-component';
import {CategoryCellElement} from './categoryCellElement';
import {KEYBOARD_KEY} from '../../consts/keyboardKeys';
import {Browser} from '../../utils/browser/browser';
import {CellDetails} from '../../types/focusedCell';
import {DataCellEvents} from './dataCellEvents';
import {CellElement} from './cellElement';

export class CategoryCellEvents {
  // prettier-ignore
  private static keyDownText(this: EditableTableComponent, rowIndex: number, columnIndex: number, event: KeyboardEvent) {
    const {categories: {dropdown: {activeItems}}, elements} = this.columnsDetails[columnIndex];
    if (event.key === KEYBOARD_KEY.ESCAPE || event.key === KEYBOARD_KEY.TAB) {
      CategoryCellEvents.programmaticBlur(this);
    } else if (event.key === KEYBOARD_KEY.ENTER) {
      event.preventDefault();
      CategoryDropdownItem.focusOrBlurNextColumnCell(elements, rowIndex);
    } else if (event.key === KEYBOARD_KEY.ARROW_UP) {
      event.preventDefault();
      CategoryDropdownItem.setSiblingItemOnCell(this, activeItems, 'previousSibling');
    } else if (event.key === KEYBOARD_KEY.ARROW_DOWN) {
      event.preventDefault();
      CategoryDropdownItem.setSiblingItemOnCell(this, activeItems, 'nextSibling');
    }
  }

  private static focusText(this: EditableTableComponent, rowIndex: number, columnIndex: number, event: FocusEvent) {
    const textElement = event.target as HTMLElement;
    const cellElement = textElement.parentElement as HTMLElement;
    DataCellEvents.prepareText(this, rowIndex, columnIndex, textElement);
    CategoryDropdown.display(this, columnIndex, cellElement);
    FocusedCellUtils.set(this.focusedElements.cell, cellElement, rowIndex, columnIndex, this.defaultCellValue);
    if (this.cellKeyPressState[KEYBOARD_KEY.TAB]) {
      // contrary to this being called on mouseDownOnCell - this does not retrigger focus event
      CaretPosition.setToEndOfText(this, textElement);
    }
  }

  // prettier-ignore
  public static blurring(etc: EditableTableComponent, rowIndex: number, columnIndex: number, textElement: HTMLElement) {
    const {dropdown: {element, categoryToItem}} = etc.columnsDetails[columnIndex].categories;
    CategoryDropdown.hide(element);
    if (!categoryToItem[textElement.textContent as string]) {
      CategoryCellElement.finaliseEditedText(etc, textElement, columnIndex);
    }
    DataCellEvents.blur(etc, rowIndex, columnIndex, textElement);
  }

  private static blurText(this: EditableTableComponent, rowIndex: number, columnIndex: number, event: Event) {
    if (!this.focusedElements.categoryDropdown) {
      CategoryCellEvents.blurring(this, rowIndex, columnIndex, event.target as HTMLElement);
    }
  }

  public static programmaticBlur(etc: EditableTableComponent) {
    const {rowIndex, columnIndex, element} = etc.focusedElements.cell as CellDetails;
    const textElement = element.children[0] as HTMLElement;
    textElement.blur();
    // the above will not trigger the CategoryCellEvents.blur functionality if dropdown has been focused, but will blur
    // the element in the dom, the following will trigger the required programmatic functionality
    if (etc.focusedElements.categoryDropdown) {
      CategoryCellEvents.blurring(etc, rowIndex, columnIndex, textElement);
      delete etc.focusedElements.categoryDropdown;
    }
  }

  private static mouseDownCell(this: EditableTableComponent, event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    // this is also triggered by text, but we only want when cell to focus
    if (targetElement.classList.contains(CellElement.CELL_CLASS)) {
      const cellElement = event.target as HTMLElement;
      const textElement = cellElement.children[0] as HTMLElement;
      // needed to set cursor at the end
      event.preventDefault();
      // text blur will not activate when the dropdown has been clicked and will not close if its scrollbar, padding
      // or delete cateogory buttons are clicked, hence once that happens and the user clicks on another category
      // cell, the dropdown is closed programmatically as follows
      if (this.focusedElements.categoryDropdown) {
        CategoryCellEvents.programmaticBlur(this);
      }
      // Firefox does not fire the focus event for CaretPosition.setToEndOfText
      if (Browser.IS_FIREFOX) textElement.focus();
      // in non firefox browsers this also focuses
      CaretPosition.setToEndOfText(this, textElement);
    }
  }

  // inherently using data cell events and overwriting the following
  public static setEvents(etc: EditableTableComponent, cellElement: HTMLElement, rowIndex: number, columnIndex: number) {
    cellElement.onmousedown = CategoryCellEvents.mouseDownCell.bind(etc);
    // onblur/onfocus do not work for firefox, hence using textElement and keeping it consistent across browsers
    cellElement.onblur = () => {};
    cellElement.onfocus = () => {};
    const textElement = cellElement.children[0] as HTMLElement;
    textElement.onblur = CategoryCellEvents.blurText.bind(etc, rowIndex, columnIndex);
    textElement.onfocus = CategoryCellEvents.focusText.bind(etc, rowIndex, columnIndex);
    textElement.onkeydown = CategoryCellEvents.keyDownText.bind(etc, rowIndex, columnIndex);
  }
}
