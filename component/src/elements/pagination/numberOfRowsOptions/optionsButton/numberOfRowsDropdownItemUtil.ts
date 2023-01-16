import {PageButtonContainerElement} from '../../pageButtons/pageButtonContainerElement';
import {NumberOfRowsOptionsButtonElement} from './numberOfRowsOptionsButtonElement';
import {PaginationUtils} from '../../../../utils/pagination/paginationUtils';
import {NumberOfRowsDropdownItem} from './numberOfRowsDropdownItem';
import {ActiveTable} from '../../../../activeTable';

export class NumberOfRowsDropdownItemUtil {
  private static updateRowsAndPaginationComponents(at: ActiveTable, optionsButton: HTMLElement, newNumberOfRows: string) {
    const {buttonContainer} = at.paginationInternal;
    PageButtonContainerElement.repopulateButtons(at, buttonContainer);
    NumberOfRowsOptionsButtonElement.updateButtonText(optionsButton, newNumberOfRows);
    PaginationUtils.displayRowsForDifferentButton(at, 1);
  }

  private static getNewNumberOfRows(at: ActiveTable, newNumberOfRows: string) {
    const {paginationInternal, contents, auxiliaryTableContentInternal} = at;
    if (paginationInternal.isAllRowsOptionSelected) {
      return auxiliaryTableContentInternal.indexColumnCountStartsAtHeader ? contents.length : contents.length - 1;
    }
    return Number(newNumberOfRows);
  }

  public static setNewNumberOfRows(at: ActiveTable, optionsButton: HTMLElement, newNumberOfRows: string) {
    at.paginationInternal.isAllRowsOptionSelected =
      newNumberOfRows.toLocaleLowerCase() === NumberOfRowsDropdownItem.ALL_ITEM_TEXT;
    at.paginationInternal.numberOfRows = NumberOfRowsDropdownItemUtil.getNewNumberOfRows(at, newNumberOfRows);
    NumberOfRowsDropdownItemUtil.updateRowsAndPaginationComponents(at, optionsButton, newNumberOfRows);
  }
}
