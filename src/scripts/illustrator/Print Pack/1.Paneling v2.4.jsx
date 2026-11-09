/*
===========================================================
Auto Panel Maker (v2.7)
Author: ChatGPT
Fix: Proper support for Illustrator Large Canvas Mode
===========================================================
*/

(function () {

    var MM_TO_PT = 2.83465;
    var MAX_PT = 16383; // Illustrator artboard limit (normal mode)

    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var rect = ab.artboardRect;
    var abWidthPt = rect[2] - rect[0];
    var abHeightPt = rect[1] - rect[3];
    var abWidthMM = abWidthPt / MM_TO_PT;
    var abHeightMM = abHeightPt / MM_TO_PT;

    // ---------- Dialog ----------
    var dlg = new Window("dialog", "Auto Panel Maker (v2.7)");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];

    dlg.add("statictext", undefined, "Artwork width: " + abWidthMM.toFixed(1) + " mm");

    var largeGrp = dlg.add("group");
    var largeCanvasChk = largeGrp.add("checkbox", undefined, "Enable Large Canvas Mode (×10 scaling)");
    largeCanvasChk.value = false;

    var g1 = dlg.add("group");
    g1.add("statictext", undefined, "Material width (mm):");
    var materialInput = g1.add("edittext", undefined, "1350");
    materialInput.characters = 6;

    var g2 = dlg.add("group");
    g2.add("statictext", undefined, "Overlap (mm):");
    var overlapInput = g2.add("edittext", undefined, "10");
    overlapInput.characters = 6;

    dlg.add("panel", undefined, "Mode");

    var autoGrp = dlg.add("group");
    var autoBtn = autoGrp.add("radiobutton", undefined, "Auto calculate panels");
    autoBtn.value = true;

    var manualGrp = dlg.add("group");
    var manualBtn = manualGrp.add("radiobutton", undefined, "Manual panel width (mm):");
    var manualInput = manualGrp.add("edittext", undefined, "");
    manualInput.characters = 6;
    manualInput.enabled = false;

    autoBtn.onClick = function () { manualInput.enabled = false; };
    manualBtn.onClick = function () { manualInput.enabled = true; };

    var btns = dlg.add("group");
    var ok = btns.add("button", undefined, "Create Panels", { name: "ok" });
    btns.add("button", undefined, "Cancel", { name: "cancel" });

    if (dlg.show() !== 1) {
        alert("Operation cancelled.");
        return;
    }

    // ---------- Values ----------
    var material = parseFloat(materialInput.text);
    var overlap = parseFloat(overlapInput.text);
    var useAuto = autoBtn.value;
    var manualW = parseFloat(manualInput.text);
    var largeMode = largeCanvasChk.value;

    if (isNaN(material) || material <= 0) { alert("Invalid material width."); return; }
    if (isNaN(overlap) || overlap < 0) { alert("Invalid overlap value."); return; }
    if (!useAuto && (isNaN(manualW) || manualW <= 0)) { alert("Invalid manual width."); return; }

    // ---------- Scaling ----------
    var scaleFactor = largeMode ? 10 : 1;

    if (largeMode) {
        abWidthMM *= scaleFactor;
        alert("Large Canvas Mode enabled.\nArtwork width adjusted ×10.\nTrue artwork width: " + abWidthMM.toFixed(1) + " mm");
    }

    // ---------- Calculations ----------
    var panelWmm = useAuto ? material : manualW;
    var effWmm = panelWmm - overlap;
    var totalPanels = Math.ceil((abWidthMM - overlap) / effWmm);
    var panelWpt = panelWmm * MM_TO_PT / scaleFactor; // scale for coordinate system
    var overlapPt = overlap * MM_TO_PT / scaleFactor;

    var startX = rect[0];
    var topY = rect[1];
    var heightPt = abHeightPt;

    var currentX = startX;
    var created = 0;

    for (var i = 0; i < totalPanels; i++) {
        var left = currentX;
        var right = left + panelWpt;
        var bottom = topY - heightPt;

        var newRect = [left, topY, right, bottom];
        try {
            doc.artboards.add(newRect);
            doc.artboards[doc.artboards.length - 1].name = "Panel_" + (i + 1);
            created++;
            currentX += (panelWpt - overlapPt);
        } catch (e) {
            alert("⚠️ Could not add panel " + (i + 1) + " — Illustrator limit reached.");
            break;
        }
    }

    alert("✅ Created " + created + " panels.\nEach: " + panelWmm.toFixed(1) + " mm wide\nOverlap: " + overlap + " mm");

})();
