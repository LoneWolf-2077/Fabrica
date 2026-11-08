/*
    RANGE-BASED ARTBOARD RENAMER (Enhanced)
    Part of the "Designer's Mind" Framework
    
    Features:
    - Renames a specific range of artboards (e.g., 1-5, 6-10)
    - Custom starting number (start at 1 or continue from any number)
    - Number position: prefix or suffix
    - Add custom prefix/suffix to the number itself
*/

function main() {
    var doc = app.activeDocument;
    if (!doc) return;

    var win = new Window("dialog", "Range Artboard Renamer");
    win.alignChildren = "fill";

    // --- RANGE SETTINGS ---
    var rangePnl = win.add("panel", undefined, "Renaming Rules");
    rangePnl.alignChildren = "right";

    function addInput(parent, label, defaultVal) {
        var grp = parent.add("group");
        grp.add("statictext", undefined, label);
        var input = grp.add("edittext", undefined, defaultVal);
        input.characters = 15;
        return input;
    }

    var startInput = addInput(rangePnl, "Start Artboard #:", "1");
    var endInput = addInput(rangePnl, "End Artboard #:", "5");
    var nameInput = addInput(rangePnl, "New Base Name:", "Name");

    // --- NUMBER SETTINGS ---
    var numPnl = win.add("panel", undefined, "Number Settings");
    numPnl.alignChildren = "left";

    // Number starts at
    var numStartGrp = numPnl.add("group");
    numStartGrp.alignment = "right";
    numStartGrp.add("statictext", undefined, "Number Starts At:");
    var numStartInput = numStartGrp.add("edittext", undefined, "1");
    numStartInput.characters = 15;

    // Number Position (Prefix or Suffix)
    var posGrp = numPnl.add("group");
    posGrp.alignment = "right";
    posGrp.add("statictext", undefined, "Number Position:");
    var posDropdown = posGrp.add("dropdownlist", undefined, ["Suffix (Name 1)", "Prefix (1 Name)"]);
    posDropdown.characters = 15;
    posDropdown.selection = 0;

    // Number Prefix
    var numPrefixGrp = numPnl.add("group");
    numPrefixGrp.alignment = "right";
    numPrefixGrp.add("statictext", undefined, "Number Prefix:");
    var numPrefixInput = numPrefixGrp.add("edittext", undefined, "");
    numPrefixInput.characters = 15;
    numPrefixGrp.add("statictext", undefined, "(e.g., # or v)");

    // Number Suffix
    var numSuffixGrp = numPnl.add("group");
    numSuffixGrp.alignment = "right";
    numSuffixGrp.add("statictext", undefined, "Number Suffix:");
    var numSuffixInput = numSuffixGrp.add("edittext", undefined, "");
    numSuffixInput.characters = 15;
    numSuffixGrp.add("statictext", undefined, "(e.g., . or -)");

    // --- SEPARATOR SETTINGS ---
    var sepPnl = win.add("panel", undefined, "Separator");
    sepPnl.alignChildren = "right";
    
    var sepGrp = sepPnl.add("group");
    sepGrp.add("statictext", undefined, "Separator:");
    var sepInput = sepGrp.add("edittext", undefined, " ");
    sepInput.characters = 15;
    sepGrp.add("statictext", undefined, "(between name & number)");

    // --- PREVIEW ---
    var prevPnl = win.add("panel", undefined, "Preview");
    prevPnl.alignChildren = "fill";
    var previewText = prevPnl.add("statictext", undefined, "Name");
    previewText.graphics.foregroundColor = previewText.graphics.newPen(
        previewText.graphics.PenType.SOLID_COLOR, [0.2, 0.8, 0.4], 1
    );

    // Update preview function
    function updatePreview() {
        var baseName = nameInput.text || "Name";
        var numStart = parseInt(numStartInput.text) || 1;
        var numPrefix = numPrefixInput.text || "";
        var numSuffix = numSuffixInput.text || "";
        var separator = sepInput.text;
        var isPrefix = posDropdown.selection && posDropdown.selection.index === 1;
        
        var formattedNum = numPrefix + numStart + numSuffix;
        
        if (isPrefix) {
            previewText.text = formattedNum + separator + baseName;
        } else {
            previewText.text = baseName + separator + formattedNum;
        }
    }

    // Add onChange listeners for live preview
    nameInput.onChanging = updatePreview;
    numStartInput.onChanging = updatePreview;
    numPrefixInput.onChanging = updatePreview;
    numSuffixInput.onChanging = updatePreview;
    sepInput.onChanging = updatePreview;
    posDropdown.onChange = updatePreview;

    // --- BUTTONS ---
    var btnGrp = win.add("group");
    btnGrp.alignment = "center";
    var cancelBtn = btnGrp.add("button", undefined, "Cancel");
    var okBtn = btnGrp.add("button", undefined, "Rename Range");

    cancelBtn.onClick = function() {
        win.close();
    };

    okBtn.onClick = function() {
        var start = parseInt(startInput.text) - 1; // Convert to 0-based index
        var end = parseInt(endInput.text) - 1;
        var baseName = nameInput.text;
        var numStart = parseInt(numStartInput.text);
        var isPrefix = posDropdown.selection.index === 1;
        var numPrefix = numPrefixInput.text;
        var numSuffix = numSuffixInput.text;
        var separator = sepInput.text;

        // Validation
        if (isNaN(start) || isNaN(end) || start < 0 || end >= doc.artboards.length) {
            alert("Invalid range. Please check your artboard numbers.\nTotal artboards: " + doc.artboards.length);
            return;
        }

        if (start > end) {
            alert("Start artboard must be less than or equal to end artboard.");
            return;
        }

        if (isNaN(numStart)) {
            alert("Invalid starting number. Please enter a valid number.");
            return;
        }

        // Rename artboards
        var counter = numStart;
        for (var i = start; i <= end; i++) {
            var formattedNum = numPrefix + counter + numSuffix;
            
            if (isPrefix) {
                // Number as prefix: "1 Name"
                doc.artboards[i].name = formattedNum + separator + baseName;
            } else {
                // Number as suffix: "Name 1"
                doc.artboards[i].name = baseName + separator + formattedNum;
            }
            counter++;
        }

        alert("Successfully renamed artboards " + (start + 1) + " through " + (end + 1) + "!\n\nStarting number: " + numStart + "\nEnding number: " + (counter - 1));
        win.close();
    };

    win.show();
}

main();