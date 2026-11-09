/*
===========================================================
Enhanced Artboard Corner L-Marks v2 – Illustrator Script
Author: ChatGPT
Description:
Creates L-shaped marks on all or selected corners of all artboards.
Features:
- Custom size, stroke thickness, and offset
- Select corners (TL, TR, BL, BR)
- Color choice: Black or White
- Snaps to artboard edges automatically
Units: millimeters
===========================================================
*/

(function () {
    if (app.documents.length === 0) { alert("Open a document first."); return; }
    var doc = app.activeDocument;
    var MM_TO_PT = 2.83465;

    // ---------- Dialog ----------
    var dlg = new Window("dialog", "Enhanced Corner L-Marks v2");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.margins = 15;

    // Size input
    var g1 = dlg.add("group");
    g1.add("statictext", undefined, "L size (mm):");
    var sizeInput = g1.add("edittext", undefined, "30");
    sizeInput.characters = 5;

    // Stroke thickness
    var g2 = dlg.add("group");
    g2.add("statictext", undefined, "Stroke thickness (mm):");
    var thicknessInput = g2.add("edittext", undefined, "0.5");
    thicknessInput.characters = 5;

    // Offset
    var g3 = dlg.add("group");
    g3.add("statictext", undefined, "Offset from edge (mm):");
    var offsetInput = g3.add("edittext", undefined, "0");
    offsetInput.characters = 5;

    // Corners selection
    var g4 = dlg.add("group");
    g4.orientation = "column";
    g4.alignChildren = ["left", "top"];
    g4.add("statictext", undefined, "Select corners to add marks:");
    var tlChk = g4.add("checkbox", undefined, "Top-Left");
    tlChk.value = true;
    var trChk = g4.add("checkbox", undefined, "Top-Right");
    trChk.value = true;
    var blChk = g4.add("checkbox", undefined, "Bottom-Left");
    blChk.value = true;
    var brChk = g4.add("checkbox", undefined, "Bottom-Right");
    brChk.value = true;

    // Color selection
    var g5 = dlg.add("group");
    g5.add("statictext", undefined, "L color:");
    var colorDropdown = g5.add("dropdownlist", undefined, ["Black", "White"]);
    colorDropdown.selection = 0;

    // Buttons
    var btns = dlg.add("group");
    btns.add("button", undefined, "Create Marks", { name: "ok" });
    btns.add("button", undefined, "Cancel", { name: "cancel" });

    if (dlg.show() !== 1) { alert("Operation cancelled."); return; }

    // ---------- Parse inputs ----------
    var lSize = parseFloat(sizeInput.text) * MM_TO_PT;
    var strokeW = parseFloat(thicknessInput.text) * MM_TO_PT;
    var offset = parseFloat(offsetInput.text) * MM_TO_PT;

    if (isNaN(lSize) || lSize <= 0 || isNaN(strokeW) || strokeW <= 0 || isNaN(offset) || offset < 0) {
        alert("Invalid input. Please check size, stroke, or offset.");
        return;
    }

    var useWhite = colorDropdown.selection.text === "White";

    // ---------- Function to draw L ----------
    function drawL(x, y, horizontalDir, verticalDir) {
        var grp = doc.groupItems.add();

        // Horizontal line
        var hLine = grp.pathItems.add();
        hLine.setEntirePath([[x, y], [x + horizontalDir * lSize, y]]);
        hLine.stroked = true;
        hLine.strokeWidth = strokeW;
        hLine.filled = false;
        if (useWhite) hLine.strokeColor = makeRGBColor(255,255,255); 
        else hLine.strokeColor = makeRGBColor(0,0,0);

        // Vertical line
        var vLine = grp.pathItems.add();
        vLine.setEntirePath([[x, y], [x, y + verticalDir * lSize]]);
        vLine.stroked = true;
        vLine.strokeWidth = strokeW;
        vLine.filled = false;
        if (useWhite) vLine.strokeColor = makeRGBColor(255,255,255); 
        else vLine.strokeColor = makeRGBColor(0,0,0);
    }

    // ---------- Helper: RGB color ----------
    function makeRGBColor(r,g,b){
        var c = new RGBColor();
        c.red = r;
        c.green = g;
        c.blue = b;
        return c;
    }

    // ---------- Iterate through all artboards ----------
    for (var a = 0; a < doc.artboards.length; a++) {
        var ab = doc.artboards[a];
        var abBounds = ab.artboardRect; // [left, top, right, bottom]
        var left = abBounds[0] + offset;
        var top = abBounds[1] - offset;
        var right = abBounds[2] - offset;
        var bottom = abBounds[3] + offset;

        // Snap to artboard edges automatically
        if (tlChk.value) drawL(left, top, 1, -1);
        if (trChk.value) drawL(right, top, -1, -1);
        if (blChk.value) drawL(left, bottom, 1, 1);
        if (brChk.value) drawL(right, bottom, -1, 1);
    }

    alert("✅ L-shaped marks created on all artboards with chosen color and snapping.");

})();
