/**
 * @name Batch Artboard Exporter
 * @description Exports all active document artboards as clean, production-ready SVG vectors with custom coordinate precision.
 * @version 1.3.0
 * @author Lonewolf Fabrica
 * @target Illustrator
 */

#target illustrator

function batchExportArtboardsAsSVG() {
  if (app.documents.length === 0) {
    alert("Fabrica: Please open an Adobe Illustrator document before running this script.");
    return;
  }

  var doc = app.activeDocument;
  var artboards = doc.artboards;
  var count = artboards.length;

  var destFolder = Folder.selectDialog("Fabrica: Select Destination Folder for SVG Artboards");
  if (!destFolder) return;

  var baseName = doc.name.replace(/\.[^\.]+$/, "");
  var options = new ExportOptionsSVG();
  options.embedRasterImages = false;
  options.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;
  options.coordinatePrecision = 3;
  options.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES;

  var exportedCount = 0;

  for (var i = 0; i < count; i++) {
    artboards.setActiveArtboardIndex(i);
    var abName = artboards[i].name || ("Artboard_" + (i + 1));
    var safeName = abName.toLowerCase().replace(/[^a-z0-9-_]/g, "_");
    var targetFile = new File(destFolder.fsName + "/" + baseName + "_" + safeName + ".svg");

    doc.exportFile(targetFile, ExportType.SVG, options);
    exportedCount++;
  }

  alert("Fabrica: Successfully exported " + exportedCount + " artboards to:\\n" + destFolder.fsName);
}

try {
  batchExportArtboardsAsSVG();
} catch (err) {
  alert("Fabrica Script Error: " + err.message);
}
