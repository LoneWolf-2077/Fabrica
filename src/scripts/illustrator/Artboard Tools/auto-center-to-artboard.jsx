/**
 * @name Auto-Center to Active Artboard
 * @description Automatically positions the currently selected artwork or entire layer to the exact center coordinates of the active artboard.
 * @version 1.0.0
 * @author Lonewolf Fabrica
 * @target Illustrator
 */

#target illustrator

function centerSelectionToArtboard() {
  if (app.documents.length === 0) {
    alert("Fabrica: Open an Adobe Illustrator document first.");
    return;
  }

  var doc = app.activeDocument;
  var sel = doc.selection;

  if (!sel || sel.length === 0) {
    alert("Fabrica: Please select the artwork you want to center.");
    return;
  }

  var abIndex = doc.artboards.getActiveArtboardIndex();
  var abRect = doc.artboards[abIndex].artboardRect;
  // abRect is [left, top, right, bottom]
  var abLeft = abRect[0];
  var abTop = abRect[1];
  var abRight = abRect[2];
  var abBottom = abRect[3];

  var abCenterX = (abLeft + abRight) / 2;
  var abCenterY = (abTop + abBottom) / 2;

  // Compute selection bounds
  var selLeft = sel[0].left;
  var selTop = sel[0].top;
  var selRight = sel[0].left + sel[0].width;
  var selBottom = sel[0].top - sel[0].height;

  for (var i = 1; i < sel.length; i++) {
    var item = sel[i];
    if (item.left < selLeft) selLeft = item.left;
    if (item.top > selTop) selTop = item.top;
    if (item.left + item.width > selRight) selRight = item.left + item.width;
    if (item.top - item.height < selBottom) selBottom = item.top - item.height;
  }

  var selCenterX = (selLeft + selRight) / 2;
  var selCenterY = (selTop + selBottom) / 2;

  var deltaX = abCenterX - selCenterX;
  var deltaY = abCenterY - selCenterY;

  for (var j = 0; j < sel.length; j++) {
    sel[j].translate(deltaX, deltaY);
  }
}

centerSelectionToArtboard();
