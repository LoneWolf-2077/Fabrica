/**
 * @name Drill Holes
 * @description automatically generates holes for CNC to drill
 * @version 1.0.0
 * @author LoneWolf
 */
#target illustrator

(function createBatchDrillDotsAllAround() {
    try {
        if (app.documents.length === 0) {
            alert("Please open a document first.");
            return;
        }

        var doc = app.activeDocument;
        if (!doc.selection || doc.selection.length === 0) {
            alert("Please select one or more objects or groups first.");
            return;
        }

        // Collect all valid selected items that have bounds
        var selectedItems = [];
        for (var s = 0; s < doc.selection.length; s++) {
            var item = doc.selection[s];
            try {
                var testBounds = item.visibleBounds;
                if (testBounds) {
                    selectedItems.push(item);
                }
            } catch (e) {
                // Skip items without bounds
            }
        }

        if (selectedItems.length === 0) {
            alert("None of the selected items have valid bounds.");
            return;
        }

        // Build Dialog UI
        var dialog = new Window("dialog", "Batch Drill Dots Generator");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];

        // Alignment Panel
        var alignPanel = dialog.add("panel", undefined, "Alignment Edge (per object)");
        alignPanel.orientation = "column";
        alignPanel.alignChildren = ["left", "top"];

        var radTop = alignPanel.add("radiobutton", undefined, "Top");
        var radBottom = alignPanel.add("radiobutton", undefined, "Bottom");
        var radTopBottom = alignPanel.add("radiobutton", undefined, "Top & Bottom");
        var radLeft = alignPanel.add("radiobutton", undefined, "Left");
        var radRight = alignPanel.add("radiobutton", undefined, "Right");
        var radLeftRight = alignPanel.add("radiobutton", undefined, "Left & Right");
        var radAllAround = alignPanel.add("radiobutton", undefined, "All Around (Top, Bottom, Left, Right)");
        var radCenter = alignPanel.add("radiobutton", undefined, "Center");

        radTop.value = true; // Default

        // Parameters Panel
        var paramPanel = dialog.add("panel", undefined, "Dot Specifications & Options");
        paramPanel.orientation = "column";
        paramPanel.alignChildren = ["right", "top"];

        function addInputRow(parent, labelText, defaultValue) {
            var group = parent.add("group");
            group.orientation = "row";
            group.add("statictext", undefined, labelText);
            var input = group.add("edittext", undefined, defaultValue);
            input.characters = 8;
            return input;
        }

        var inputDotSize = addInputRow(paramPanel, "Dot Diameter (mm):", "5");
        var inputMargin = addInputRow(paramPanel, "Edge Margin (mm):", "10");
        var inputCount = addInputRow(paramPanel, "Number of Dots (per side):", "2");

        // Separate Layer Checkbox Group
        var optionGroup = paramPanel.add("group");
        optionGroup.orientation = "row";
        optionGroup.alignment = ["left", "top"];
        var chkSeparateLayer = optionGroup.add("checkbox", undefined, " Put dots on a separate 'Drill Dots' layer");
        chkSeparateLayer.value = false;

        // Action Buttons
        var btnGroup = dialog.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignment = "center";
        btnGroup.add("button", undefined, "Cancel", { name: "cancel" });
        btnGroup.add("button", undefined, "Create Dots", { name: "ok" });

        if (dialog.show() !== 1) return;

        // Parse values and convert mm to points (1 mm = 2.83464567 pt)
        var mmToPt = 2.83464567;
        var dotDiameter = parseFloat(inputDotSize.text) * mmToPt;
        var margin = parseFloat(inputMargin.text) * mmToPt;
        var dotCount = parseInt(inputCount.text, 10);

        if (isNaN(dotDiameter) || isNaN(margin) || isNaN(dotCount) || dotCount < 1) {
            alert("Invalid inputs. Please enter valid numeric values.");
            return;
        }

        var radius = dotDiameter / 2;

        // Black stroke color, no fill
        var strokeColor = new RGBColor();
        strokeColor.red = 0;
        strokeColor.green = 0;
        strokeColor.blue = 0;

        // Setup separate layer if requested
        var separateLayer = null;
        if (chkSeparateLayer.value) {
            separateLayer = doc.layers.add();
            separateLayer.name = "Drill Dots";
        }

        // Helper function to draw a single horizontal row of dots at a given Y coordinate
        function drawHorizontalRow(targetGroup, selLeft, selRight, yCoord, count, diameter, radiusVal) {
            var width = selRight - selLeft;
            for (var j = 0; j < count; j++) {
                var x = 0;
                if (count === 1) {
                    x = selLeft + (width / 2);
                } else {
                    var startX = selLeft + margin;
                    var endX = selRight - margin;
                    var stepX = (endX - startX) / (count - 1);
                    x = startX + (j * stepX);
                }

                var circle = targetGroup.pathItems.ellipse(yCoord + radiusVal, x - radiusVal, diameter, diameter);
                circle.filled = false;
                circle.stroked = true;
                circle.strokeColor = strokeColor;
                circle.strokeWidth = 1;
            }
        }

        // Helper function to draw a single vertical column of dots at a given X coordinate
        function drawVerticalColumn(targetGroup, selTop, selBottom, xCoord, count, diameter, radiusVal) {
            var height = selTop - selBottom;
            for (var j = 0; j < count; j++) {
                var y = 0;
                if (count === 1) {
                    y = selTop - (height / 2);
                } else {
                    var startY = selTop - margin;
                    var endY = selBottom + margin;
                    var stepY = (startY - endY) / (count - 1);
                    y = startY - (j * stepY);
                }

                var circle = targetGroup.pathItems.ellipse(y + radiusVal, xCoord - radiusVal, diameter, diameter);
                circle.filled = false;
                circle.stroked = true;
                circle.strokeColor = strokeColor;
                circle.strokeWidth = 1;
            }
        }

        // Loop through every selected item and generate dots
        for (var i = 0; i < selectedItems.length; i++) {
            var sel = selectedItems[i];
            var bounds = sel.visibleBounds; // [left, top, right, bottom]
            var selLeft = bounds[0];
            var selTop = bounds[1];
            var selRight = bounds[2];
            var selBottom = bounds[3];
            var width = selRight - selLeft;
            var height = selTop - selBottom;

            // Determine container safely
            var targetContainer;
            if (separateLayer) {
                targetContainer = separateLayer;
            } else {
                try {
                    targetContainer = sel.layer;
                } catch (e2) {
                    targetContainer = doc.activeLayer;
                }
            }

            var dotsGroup = targetContainer.groupItems.add();
            dotsGroup.name = "Dots Set " + (i + 1);

            if (radAllAround.value) {
                // All Four Sides Simultaneously
                var topY = selTop - margin;
                var bottomY = selBottom + margin;
                var leftX = selLeft + margin;
                var rightX = selRight - margin;

                drawHorizontalRow(dotsGroup, selLeft, selRight, topY, dotCount, dotDiameter, radius);
                drawHorizontalRow(dotsGroup, selLeft, selRight, bottomY, dotCount, dotDiameter, radius);
                drawVerticalColumn(dotsGroup, selTop, selBottom, leftX, dotCount, dotDiameter, radius);
                drawVerticalColumn(dotsGroup, selTop, selBottom, rightX, dotCount, dotDiameter, radius);
            }
            else if (radTopBottom.value) {
                // Top & Bottom simultaneously
                var topY = selTop - margin;
                var bottomY = selBottom + margin;
                drawHorizontalRow(dotsGroup, selLeft, selRight, topY, dotCount, dotDiameter, radius);
                drawHorizontalRow(dotsGroup, selLeft, selRight, bottomY, dotCount, dotDiameter, radius);
            } 
            else if (radLeftRight.value) {
                // Left & Right simultaneously
                var leftX = selLeft + margin;
                var rightX = selRight - margin;
                drawVerticalColumn(dotsGroup, selTop, selBottom, leftX, dotCount, dotDiameter, radius);
                drawVerticalColumn(dotsGroup, selTop, selBottom, rightX, dotCount, dotDiameter, radius);
            }
            else if (radTop.value) {
                drawHorizontalRow(dotsGroup, selLeft, selRight, selTop - margin, dotCount, dotDiameter, radius);
            } 
            else if (radBottom.value) {
                drawHorizontalRow(dotsGroup, selLeft, selRight, selBottom + margin, dotCount, dotDiameter, radius);
            } 
            else if (radCenter.value) {
                drawHorizontalRow(dotsGroup, selLeft, selRight, selTop - (height / 2), dotCount, dotDiameter, radius);
            } 
            else if (radLeft.value) {
                drawVerticalColumn(dotsGroup, selTop, selBottom, selLeft + margin, dotCount, dotDiameter, radius);
            } 
            else if (radRight.value) {
                drawVerticalColumn(dotsGroup, selTop, selBottom, selRight - margin, dotCount, dotDiameter, radius);
            }
        }

        app.redraw();
    } catch (err) {
        alert("An error occurred: " + err.message + " (Line " + err.line + ")");
    }
})();
