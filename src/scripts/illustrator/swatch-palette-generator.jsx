/**
 * @name Swatch Palette Generator
 * @description Extracts RGB and CMYK fill colors from selected vector paths and automatically registers them as document swatches.
 * @version 1.2.0
 * @author Lonewolf Fabrica
 * @target Illustrator
 */

#target illustrator

function extractSelectedSwatches() {
  if (app.documents.length === 0) {
    alert("Fabrica: Please open an Adobe Illustrator document.");
    return;
  }

  var doc = app.activeDocument;
  var sel = doc.selection;

  if (!sel || sel.length === 0) {
    alert("Fabrica: Select vector paths to generate swatches from.");
    return;
  }

  var createdCount = 0;
  for (var i = 0; i < sel.length; i++) {
    var item = sel[i];
    if (item.filled && item.fillColor) {
      try {
        var newSwatch = doc.swatches.add();
        newSwatch.color = item.fillColor;
        newSwatch.name = "Fabrica_Color_" + (i + 1);
        createdCount++;
      } catch (e) {
        // swatch color may already exist or be a pattern/gradient
      }
    }
  }

  alert("Fabrica: Created " + createdCount + " new swatches in Document Swatches panel.");
}

extractSelectedSwatches();
