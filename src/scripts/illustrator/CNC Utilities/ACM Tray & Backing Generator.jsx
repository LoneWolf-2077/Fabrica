#target illustrator

function generateDibondTray() {
    if (app.documents.length === 0) {
        app.documents.add();
    }

    var doc = app.activeDocument;

    // --- GUI DIALOG ---
    var dlg = new Window("dialog", "Dibond Tray Generator (ACM Fold Layout)");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];

    // Main Face Panel
    var faceGroup = dlg.add("panel", undefined, "Face Dimensions (mm)");
    faceGroup.orientation = "row";
    faceGroup.add("statictext", undefined, "Width:");
    var inputFaceW = faceGroup.add("edittext", undefined, "600");
    inputFaceW.characters = 6;
    faceGroup.add("statictext", undefined, "Height:");
    var inputFaceH = faceGroup.add("edittext", undefined, "400");
    inputFaceH.characters = 6;

    // Returns / Flanges Panel
    var foldGroup = dlg.add("panel", undefined, "Tray Returns / Folds (mm)");
    foldGroup.orientation = "row";
    foldGroup.add("statictext", undefined, "Return Depth:");
    var inputReturn = foldGroup.add("edittext", undefined, "40");
    inputReturn.characters = 6;
    
    foldGroup.add("statictext", undefined, "Glue Flange:");
    var inputFlange = foldGroup.add("edittext", undefined, "20");
    inputFlange.characters = 6;

    // Backing Panel / Acrylic Insert Options
    var backingGroup = dlg.add("panel", undefined, "Backing Sheet / Acrylic Insert");
    backingGroup.orientation = "column";
    backingGroup.alignChildren = ["left", "top"];

    var backingCheck = backingGroup.add("checkbox", undefined, "Generate Backing Sheet (Opal / Backplate)");
    backingCheck.value = true;

    var backingRow = backingGroup.add("group");
    backingRow.add("statictext", undefined, "Undersize Clearance (mm):");
    var inputBackingOffset = backingRow.add("edittext", undefined, "2");
    inputBackingOffset.characters = 4;
    backingRow.add("statictext", undefined, "(Subtracted per side for easy fit)");

    // Engrave / Fold Lines Style
    var styleGroup = dlg.add("panel", undefined, "V-Groove / Fold Line Options");
    styleGroup.orientation = "column";
    styleGroup.alignChildren = ["left", "top"];

    var groupCheck = styleGroup.add("checkbox", undefined, "Group Engrave/Fold Lines with Cut Contour");
    groupCheck.value = false;

    var colorRow = styleGroup.add("group");
    colorRow.add("statictext", undefined, "Engrave Line Preset:");
    var colorCombo = colorRow.add("dropdownlist", undefined, ["Magenta (Cut/Engrave)", "Cyan", "Red", "Custom RGB"]);
    colorCombo.selection = 0;

    var rgbRow = styleGroup.add("group");
    rgbRow.add("statictext", undefined, "Custom RGB (R,G,B):");
    var inputR = rgbRow.add("edittext", undefined, "255"); inputR.characters = 3;
    var inputG = rgbRow.add("edittext", undefined, "0"); inputG.characters = 3;
    var inputB = rgbRow.add("edittext", undefined, "255"); inputB.characters = 3;

    // Buttons
    var btnGroup = dlg.add("group");
    btnGroup.alignment = "right";
    var btnCancel = btnGroup.add("button", undefined, "Cancel", {name: "cancel"});
    var btnOk = btnGroup.add("button", undefined, "Generate Tray", {name: "ok"});

    if (dlg.show() !== 1) return; // Exit on cancel

    // --- CONVERT MM TO POINTS ---
    var mmToPoints = 2.83464567;
    var faceW = parseFloat(inputFaceW.text) * mmToPoints;
    var faceH = parseFloat(inputFaceH.text) * mmToPoints;
    var retD = parseFloat(inputReturn.text) * mmToPoints;
    var flangeW = parseFloat(inputFlange.text) * mmToPoints;
    var backingOffset = parseFloat(inputBackingOffset.text) * mmToPoints;

    if (isNaN(faceW) || isNaN(faceH) || isNaN(retD) || isNaN(flangeW)) {
        alert("Please enter valid numerical values.");
        return;
    }

    // --- COLOR CONFIGURATION ---
    var engraveColor = new RGBColor();
    switch (colorCombo.selection.index) {
        case 0: // Magenta
            engraveColor.red = 255; engraveColor.green = 0; engraveColor.blue = 255;
            break;
        case 1: // Cyan
            engraveColor.red = 0; engraveColor.green = 255; engraveColor.blue = 255;
            break;
        case 2: // Red
            engraveColor.red = 255; engraveColor.green = 0; engraveColor.blue = 0;
            break;
        case 3: // Custom
            engraveColor.red = parseInt(inputR.text) || 0;
            engraveColor.green = parseInt(inputG.text) || 0;
            engraveColor.blue = parseInt(inputB.text) || 0;
            break;
    }

    var cutColor = new RGBColor();
    cutColor.red = 0; cutColor.green = 0; cutColor.blue = 0; // Black Cut Line

    var backingColor = new RGBColor();
    backingColor.red = 0; backingColor.green = 150; backingColor.blue = 255; // Blue Cut Line for Backing

    // --- SETUP LAYERS ---
    var cutLayer = getOrCreateLayer(doc, "Thru Cut");
    var engraveLayer = getOrCreateLayer(doc, "V-Groove Fold Lines");

    // Center layout on view
    var centerX = doc.width / 2;
    var centerY = doc.height / 2;

    var leftX = centerX - (faceW / 2);
    var rightX = centerX + (faceW / 2);
    var bottomY = centerY - (faceH / 2);
    var topY = centerY + (faceH / 2);

    // Track items for grouping
    var engraveItems = [];
    var cutItems = [];

    // --- 1. GENERATE CONTINUOUS V-GROOVE GRID (#) ---
    engraveItems.push(createLine(engraveLayer, leftX, topY + retD, leftX, bottomY - retD, engraveColor));
    engraveItems.push(createLine(engraveLayer, rightX, topY + retD, rightX, bottomY - retD, engraveColor));
    engraveItems.push(createLine(engraveLayer, leftX - retD - flangeW, topY, rightX + retD + flangeW, topY, engraveColor));
    engraveItems.push(createLine(engraveLayer, leftX - retD - flangeW, bottomY, rightX + retD + flangeW, bottomY, engraveColor));

    // --- 2. GENERATE THRU CUT CONTOUR (ACM TRAY FLAT PATTERN) ---
    var path = cutLayer.pathItems.add();
    path.stroked = true;
    path.strokeWidth = 1;
    path.strokeColor = cutColor;
    path.filled = false;

    var points = [
        // Top Return Flap
        [leftX, topY + retD],
        [rightX, topY + retD],
        
        // Top-Right Notch & Corner Glue Tab
        [rightX, topY], 
        [rightX + retD, topY],
        [rightX + retD + flangeW, topY - (flangeW / 2)],
        [rightX + retD + flangeW, bottomY + (flangeW / 2)],
        [rightX + retD, bottomY],
        [rightX, bottomY],
        
        // Bottom Return Flap
        [rightX, bottomY - retD],
        [leftX, bottomY - retD],
        
        // Bottom-Left Notch & Corner Glue Tab
        [leftX, bottomY],
        [leftX - retD, bottomY],
        [leftX - retD - flangeW, bottomY + (flangeW / 2)],
        [leftX - retD - flangeW, topY - (flangeW / 2)],
        [leftX - retD, topY],
        [leftX, topY]
    ];

    path.setEntirePath(points);
    path.closed = true;
    cutItems.push(path);

    // --- 3. GENERATE BACKING SHEET (OPTIONAL) ---
    if (backingCheck.value && !isNaN(backingOffset)) {
        var backingLayer = getOrCreateLayer(doc, "Backing Sheet");
        
        // Calculate undersized rectangle placement (offset to the right of the tray layout)
        var backingW = faceW - (backingOffset * 2);
        var backingH = faceH - (backingOffset * 2);

        // Position it nicely alongside the tray flat pattern
        var backingCenterX = rightX + retD + flangeW + (backingW / 2) + (50 * mmToPoints); // 50mm spacing gap
        var backingCenterY = centerY;

        var bLeft = backingCenterX - (backingW / 2);
        var bRight = backingCenterX + (backingW / 2);
        var bTop = backingCenterY + (backingH / 2);
        var bBottom = backingCenterY - (backingH / 2);

        var backingPath = backingLayer.pathItems.add();
        backingPath.stroked = true;
        backingPath.strokeWidth = 1;
        backingPath.strokeColor = backingColor;
        backingPath.filled = false;

        var backingPoints = [
            [bLeft, bTop],
            [bRight, bTop],
            [bRight, bBottom],
            [bLeft, bBottom]
        ];

        backingPath.setEntirePath(backingPoints);
        backingPath.closed = true;
    }

    // --- 4. OPTIONAL GROUPING ---
    if (groupCheck.value) {
        var mainGroup = cutLayer.groupItems.add();
        for (var i = 0; i < cutItems.length; i++) {
            cutItems[i].moveToBeginning(mainGroup);
        }
        for (var j = 0; j < engraveItems.length; j++) {
            engraveItems[j].moveToBeginning(mainGroup);
        }
    }

    app.redraw();
}

// Helper: Draw a stroke line
function createLine(layer, x1, y1, x2, y2, color) {
    var line = layer.pathItems.add();
    line.stroked = true;
    line.strokeWidth = 1;
    line.strokeColor = color;
    line.filled = false;
    line.setEntirePath([[x1, y1], [x2, y2]]);
    return line;
}

// Helper: Create layer if it doesn't exist
function getOrCreateLayer(doc, layerName) {
    try {
        return doc.layers.getByName(layerName);
    } catch (e) {
        var newLayer = doc.layers.add();
        newLayer.name = layerName;
        return newLayer;
    }
}

// Execute Script
generateDibondTray();