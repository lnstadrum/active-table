import {OverwriteCellsViaCSVOnPaste} from '../../../utils/paste/CSV/overwriteCellsViaCSVOnPaste';
import {UserKeyEventsStateUtils} from '../../../utils/userEventsState/userEventsStateUtils';
import {DateCellInputElement} from '../cellsWithTextDiv/dateCell/dateCellInputElement';
import {FocusedCellUtils} from '../../../utils/focusedElements/focusedCellUtils';
import {CaretPosition} from '../../../utils/focusedElements/caretPosition';
import {CaretDisplayFix} from '../../../utils/browser/caretDisplayFix';
import {CellDropdown} from '../../dropdown/cellDropdown/cellDropdown';
import {HeaderText} from '../../../utils/columnDetails/headerText';
import {KEYBOARD_EVENT} from '../../../consts/keyboardEvents';
import {PasteUtils} from '../../../utils/paste/pasteUtils';
import {KEYBOARD_KEY} from '../../../consts/keyboardKeys';
import {UNDO_INPUT_TYPE} from '../../../consts/domEvents';
import {ActiveTable} from '../../../activeTable';
import {CellElement} from '../cellElement';
import {CellEvents} from '../cellEvents';

export class DataCellEvents {
  public static keyDownCell(this: ActiveTable, event: KeyboardEvent) {
    // REF-7
    if (event.key === KEYBOARD_KEY.TAB) {
      UserKeyEventsStateUtils.temporarilyIndicateEvent(this._userKeyEventsState, KEYBOARD_KEY.TAB);
    }
  }

  // using this instead of keydown because when this is fired the new cell text is available
  // prettier-ignore
  private static inputCell(this: ActiveTable, rowIndex: number, columnIndex: number, event: Event) {
    const inputEvent = event as InputEvent;
    // can be cell element for data cell, text element for cell dropdown and date cells, or even input element from date
    // picker which is not processed here as its textContent property value is empty and date value needs to be processed
    const textContainerElement = inputEvent.target as HTMLElement;
    if (DateCellInputElement.isInputElement(textContainerElement)) return;
    const text = CellElement.getText(textContainerElement);
    // sanitizePastedTextContent causes inputType to no longer be insertFromPaste, hence using this instead
    if (!this._userKeyEventsState[KEYBOARD_EVENT.PASTE]) {
      const isUndo = inputEvent.inputType === UNDO_INPUT_TYPE;
      CellElement.setNewText(this, textContainerElement, text, false, isUndo, false);
      const columnDetails = this._columnsDetails[columnIndex];
      if (columnDetails.activeType.cellDropdownProps && rowIndex > 0) {
        CellDropdown.updateCellDropdown(textContainerElement,
          columnDetails.cellDropdown, this._tableDimensions.border, columnDetails.settings.defaultText, true);
      }
      CellEvents.updateCell(this, text, rowIndex, columnIndex, {processText: false});
    }
  }

  // prettier-ignore
  private static pasteCell(this: ActiveTable, rowIndex: number, columnIndex: number, event: ClipboardEvent) {
    UserKeyEventsStateUtils.temporarilyIndicateEvent(this._userKeyEventsState, KEYBOARD_EVENT.PASTE);
    PasteUtils.sanitizePastedTextContent(event);
    const clipboardText = PasteUtils.extractClipboardText(event);
    if (OverwriteCellsViaCSVOnPaste.isCSVData(clipboardText)) {
      OverwriteCellsViaCSVOnPaste.overwrite(this, clipboardText, event, rowIndex, columnIndex);
    } else {
      const targetElement = event.target as HTMLElement;
      const {cellDropdown, settings: {defaultText}, activeType} = this._columnsDetails[columnIndex];
      const {calendar, cellDropdownProps} = activeType;
      // if the user has deleted all text in calendar/select/label cell - targetElement can be the <br> tag
      const containerElement = calendar || cellDropdownProps
        ? (targetElement.parentElement as HTMLElement) : targetElement;
      setTimeout(() => {
        if (cellDropdownProps) CellDropdown.updateCellDropdown(
          containerElement, cellDropdown, this._tableDimensions.border, defaultText, true);
        CellEvents.updateCell(this, CellElement.getText(containerElement), rowIndex, columnIndex, {processText: false});
      });
    }
  }

  // prettier-ignore
  // textContainerElement can be cell element for data cell, text element for select/label and date cells
  public static blur(at: ActiveTable, rowIndex: number, columnIndex: number, textContainerElement: HTMLElement) {
    if (CaretDisplayFix.isIssueBrowser()) CaretDisplayFix.removeContentEditable(textContainerElement);
    CellEvents.setCellToDefaultIfNeeded(at, rowIndex, columnIndex, textContainerElement);
    FocusedCellUtils.purge(at._focusedElements.cell);
  }

  private static blurCell(this: ActiveTable, rowIndex: number, columnIndex: number, event: Event) {
    if (rowIndex === 0 && !this._defaultColumnsSettings.columnDropdown?.displaySettings?.openMethod?.cellClick) {
      HeaderText.onAttemptChange(this, event.target as HTMLElement, columnIndex);
    }
    DataCellEvents.blur(this, rowIndex, columnIndex, event.target as HTMLElement);
  }

  // textContainerElement can be cell element for data cell, text element for select/label and date cells
  public static prepareText(at: ActiveTable, rowIndex: number, columnIndex: number, textContainerElement: HTMLElement) {
    const openViaCellClick = at._defaultColumnsSettings.columnDropdown?.displaySettings?.openMethod?.cellClick;
    if (CaretDisplayFix.isIssueBrowser() && (rowIndex > 0 || !openViaCellClick)) {
      // THIS HAS TO BE CALLED IN A FOCUS EVENT!!!!!!!!!!!!!!!!!
      CaretDisplayFix.setContentEditable(textContainerElement);
    }
    // placed here and not in timeout because we need cells with a default value to be recorded before modification
    CellEvents.removeTextIfDefault(at, rowIndex, columnIndex, textContainerElement);
  }

  private static focusCell(this: ActiveTable, rowIndex: number, columnIndex: number, event: FocusEvent) {
    const cellElement = event.target as HTMLElement;
    DataCellEvents.prepareText(this, rowIndex, columnIndex, cellElement);
    const {_userKeyEventsState, _focusedElements} = this;
    // REF-7
    if (_userKeyEventsState[KEYBOARD_KEY.TAB]) CaretPosition.setToEndOfText(this, cellElement);
    FocusedCellUtils.set(_focusedElements.cell, cellElement, rowIndex, columnIndex);
  }

  public static setEvents(at: ActiveTable, cellElement: HTMLElement, rowIndex: number, columnIndex: number) {
    cellElement.onfocus = DataCellEvents.focusCell.bind(at, rowIndex, columnIndex);
    cellElement.onblur = DataCellEvents.blurCell.bind(at, rowIndex, columnIndex);
    // these are used in date cells and overwritten when converted from
    cellElement.onmouseenter = () => {};
    cellElement.onmouseleave = () => {};
    // this is used by select/label element and overwritten when converted from
    cellElement.onmousedown = () => {};
    cellElement.oninput = DataCellEvents.inputCell.bind(at, rowIndex, columnIndex);
    cellElement.onpaste = DataCellEvents.pasteCell.bind(at, rowIndex, columnIndex);
    cellElement.onkeydown = DataCellEvents.keyDownCell.bind(at);
  }
}
