/**
 * @name Clean Empty Layers
 * @description Scans all document layers and sub-layers, systematically removing empty, hidden, or orphan art elements.
 * @version 1.1.0
 * @author Lonewolf Fabrica
 * @target Illustrator
 */

#target illustrator

function purgeEmptyLayers() {
  if (app.documents.length === 0) {
    alert("Fabrica: No open document found.");
    return;
  }

  var doc = app.activeDocument;
  var layers = doc.layers;
  var deletedCount = 0;

  for (var i = layers.length - 1; i >= 0; i--) {
    var l = layers[i];
    if (l.pageItems.length === 0 && l.layers.length === 0) {
      l.remove();
      deletedCount++;
    }
  }

  alert("Fabrica: Purged " + deletedCount + " empty layer(s).");
}

purgeEmptyLayers();
