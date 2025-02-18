import {DropdownCellOverlayStyles, DropdownDisplaySettings} from '../../../../types/dropdownDisplaySettings';
import {RowDropdownCellOverlayEvents} from './rowDropdownCellOverlayEvents';
import {ExtractElements} from '../../../../utils/elements/extractElements';
import {DropdownCellOverlay} from '../../cellOverlay/dropdownCellOverlay';
import {ActiveTable} from '../../../../activeTable';

export class RowDropdownCellOverlay {
  private static readonly ROW_DROPDOWN_CELL_OVERLAY_CLASS = 'row-dropdown-cell-overlay';

  private static setDefault(rowDropdownCellOverlay: HTMLElement, overlayStyles?: DropdownCellOverlayStyles) {
    rowDropdownCellOverlay.style.backgroundColor = overlayStyles?.default?.backgroundColor || '';
  }

  public static resetDefaultColor(displaySettings: DropdownDisplaySettings, rowDropdownCellOverlay: HTMLElement) {
    const overlayStyles = displaySettings.overlayStyles;
    if (overlayStyles?.hover?.backgroundColor) {
      RowDropdownCellOverlay.setDefault(rowDropdownCellOverlay, overlayStyles);
    }
  }

  public static setHoverColor(displaySettings: DropdownDisplaySettings, rowDropdownCellOverlay: HTMLElement) {
    const hoverBackgroundColor = displaySettings.overlayStyles?.hover?.backgroundColor;
    if (hoverBackgroundColor) rowDropdownCellOverlay.style.backgroundColor = hoverBackgroundColor;
  }

  public static hide(at: ActiveTable, rowIndex: number) {
    const currentIndexCell = at._hoveredElements.leftMostCell;
    setTimeout(() => {
      if (currentIndexCell !== at._hoveredElements.leftMostCell) {
        const overlayElement = at._rowDropdownCellOverlays[rowIndex].element;
        overlayElement.style.width = DropdownCellOverlay.HIDDEN_PX;
      }
    });
  }

  public static display(at: ActiveTable, rowIndex: number) {
    const firstColumn = at._columnsDetails[0];
    const rowDropdownCellOverlay = at._rowDropdownCellOverlays[rowIndex].element;
    rowDropdownCellOverlay.style.width = DropdownCellOverlay.VISIBLE_PX;
    const firstColElement = firstColumn.elements[rowIndex];
    const {displayIndexColumn} = at._frameComponents;
    const leftMostElement = (displayIndexColumn ? firstColElement.previousSibling : firstColElement) as HTMLElement;
    const onePercentWidth = leftMostElement.offsetHeight / 100;
    rowDropdownCellOverlay.style.height = `${onePercentWidth * 60}px`;
    rowDropdownCellOverlay.style.top = `${onePercentWidth * 20}px`;
    const left = displayIndexColumn ? firstColumn.elements[0].offsetWidth : 0;
    rowDropdownCellOverlay.style.left = `-${leftMostElement.offsetWidth + left}px`;
  }

  private static create(overlayStyles?: DropdownCellOverlayStyles) {
    const rowDropdownCellOverlay = document.createElement('div');
    rowDropdownCellOverlay.classList.add(RowDropdownCellOverlay.ROW_DROPDOWN_CELL_OVERLAY_CLASS);
    rowDropdownCellOverlay.classList.add(DropdownCellOverlay.DROPDOWN_CELL_OVERLAY_CLASS);
    rowDropdownCellOverlay.style.width = DropdownCellOverlay.HIDDEN_PX;
    RowDropdownCellOverlay.setDefault(rowDropdownCellOverlay, overlayStyles);
    return rowDropdownCellOverlay;
  }

  private static getCellDividerElement(leftMostCell: HTMLElement, displayIndexColumn: boolean) {
    let cellDividerElement = leftMostCell.nextSibling as HTMLElement;
    // index column does not have a cell divider so using the first data column divider instead
    if (displayIndexColumn) cellDividerElement = cellDividerElement.nextSibling as HTMLElement;
    return cellDividerElement;
  }

  public static add(at: ActiveTable, rowIndex: number, leftMostCell: HTMLElement) {
    const rowDropdownCellOverlay = RowDropdownCellOverlay.create(at.rowDropdown.displaySettings.overlayStyles);
    const {displayIndexColumn} = at._frameComponents;
    const cellDividerElement = RowDropdownCellOverlay.getCellDividerElement(leftMostCell, !!displayIndexColumn);
    cellDividerElement.appendChild(rowDropdownCellOverlay);
    at._rowDropdownCellOverlays.splice(rowIndex, 0, {
      element: rowDropdownCellOverlay,
      // these events are stubs and will be replaced by real ones in RowDropdownCellOverlayEvents.addCellEvents
      enter: () => {},
      leave: () => {},
    });
  }

  public static resetOverlays(at: ActiveTable) {
    if (!at.rowDropdown.displaySettings.openMethod?.overlayClick) return;
    at._rowDropdownCellOverlays.splice(0, at._rowDropdownCellOverlays.length);
    const rows = ExtractElements.textRowsArrFromTBody(at._tableBodyElementRef as HTMLElement, at.content);
    rows.forEach((rowElement, rowIndex) => {
      const leftMostCell = rowElement.children[0] as HTMLElement;
      RowDropdownCellOverlay.add(at, rowIndex, leftMostCell);
      RowDropdownCellOverlayEvents.setOverlayEvents(at, rowIndex, leftMostCell);
    });
  }
}
