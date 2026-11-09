#target illustrator

/*
    Unified Prepress Suite (Step & Repeat + Arrange)
    Adobe Illustrator ExtendScript (.jsx)

    Updates:
    - Step & Repeat now supports auto-calculating Columns or Rows when one is set to 0.
*/

(function () {
    if (app.documents.length === 0) {
        alert("Please open an Illustrator document before running Unified Prepress Suite.");
        return;
    }

    var MM_TO_PT = 2.834645;
    var doc = app.activeDocument;

    function mmToPt(value, x10) {
        return value * (x10 ? 10 : 1) * MM_TO_PT;
    }

    function parseNumber(editText, label, allowZero) {
        var s = String(editText.text).replace(/^\s+|\s+$/g, "").replace(",", ".");
        if (s === "") throw new Error(label + " is required.");
        var n = Number(s);
        if (!isFinite(n)) throw new Error(label + " must be a valid number.");
        if (allowZero) {
            if (n < 0) throw new Error(label + " cannot be negative.");
        } else {
            if (n <= 0) throw new Error(label + " must be greater than zero.");
        }
        return n;
    }

    function parseInteger(editText, label, minValue) {
        var s = String(editText.text).replace(/^\s+|\s+$/g, "");
        if (s === "" && minValue === 0) return 0;
        if (!/^\d+$/.test(s)) throw new Error(label + " must be a whole number.");
        var n = parseInt(s, 10);
        if (n < minValue) throw new Error(label + " must be at least " + minValue + ".");
        return n;
    }

    function isUsable(item) {
        if (!item) return false;
        try {
            if (item.hidden || item.locked) return false;
        } catch (e) {}
        return true;
    }

    function getBounds(item) {
        var b = item.visibleBounds; // [left, top, right, bottom]
        return {
            left: b[0],
            top: b[1],
            right: b[2],
            bottom: b[3],
            width: b[2] - b[0],
            height: b[1] - b[3],
            centerX: (b[0] + b[2]) / 2,
            centerY: (b[1] + b[3]) / 2
        };
    }

    function getSelectionItems() {
        var sel = doc.selection;
        if (!sel || sel.length === 0) return [];
        var items = [];
        for (var i = 0; i < sel.length; i++) {
            if (isUsable(sel[i])) items.push(sel[i]);
        }
        return items;
    }

    function selectItems(items) {
        try { doc.selection = null; } catch (e) {}
        for (var i = 0; i < items.length; i++) {
            try { items[i].selected = true; } catch (e2) {}
        }
    }

    function duplicateAndMove(item, dx, dy) {
        var dup = item.duplicate();
        dup.translate(dx, dy);
        return dup;
    }

    function runStepRepeat(opts) {
        var selected = getSelectionItems();
        if (selected.length === 0) {
            alert("Please select an object to step and repeat.");
            return;
        }
        if (selected.length !== 1) {
            alert("Please select one object or one grouped artwork item to step and repeat.");
            return;
        }

        var cols = opts.columns;
        var rows = opts.rows;
        var copiesToCreate = opts.copies;
        var totalItemsNeeded = copiesToCreate + 1;

        // Auto-calculate columns or rows if one of them is 0
        if (cols === 0 && rows === 0) {
            throw new Error("Please specify either Columns or Rows (or both) greater than zero.");
        } else if (cols === 0) {
            cols = Math.ceil(totalItemsNeeded / rows);
        } else if (rows === 0) {
            rows = Math.ceil(totalItemsNeeded / cols);
        }

        var capacity = cols * rows;
        if (copiesToCreate > capacity - 1) {
            throw new Error("The selected grid has room for only " + (capacity - 1) +
                " copies plus the original. Increase Columns/Rows or reduce Copies.");
        }

        var gapX = mmToPt(opts.gapX, opts.x10);
        var gapY = mmToPt(opts.gapY, opts.x10);
        var flowUp = opts.flow === "up";
        var source = selected[0];
        var sourceBounds = getBounds(source);
        var stepX = sourceBounds.width + gapX;
        var stepY = sourceBounds.height + gapY;
        var created = [source];

        // Validate geometry before any changes.
        if (!isFinite(stepX) || !isFinite(stepY) || stepX <= 0 || stepY <= 0) {
            throw new Error("The selected artwork has invalid dimensions.");
        }

        var copiesMade = 0;
        for (var r = 0; r < rows && copiesMade < copiesToCreate; r++) {
            for (var c = 0; c < cols && copiesMade < copiesToCreate; c++) {
                if (r === 0 && c === 0) continue;
                var dx = c * stepX;
                var dy = (flowUp ? 1 : -1) * r * stepY;
                created.push(duplicateAndMove(source, dx, dy));
                copiesMade++;
            }
        }

        if (opts.groupResult && created.length > 1) {
            var group = doc.activeLayer.groupItems.add();
            for (var i = 0; i < created.length; i++) {
                try { created[i].move(group, ElementPlacement.PLACEATEND); } catch (moveErr) {}
            }
            selectItems([group]);
        } else {
            selectItems(created);
        }
    }

    function sortByPosition(items) {
        var records = [];
        for (var i = 0; i < items.length; i++) {
            records.push({ item: items[i], bounds: getBounds(items[i]), index: i });
        }
        var heights = [];
        for (var h = 0; h < records.length; h++) heights.push(records[h].bounds.height);
        heights.sort(function (a, b) { return a - b; });
        var median = heights[Math.floor(heights.length / 2)] || 1;
        var tolerance = Math.max(2, median * 0.25);

        records.sort(function (a, b) {
            var dy = b.bounds.top - a.bounds.top;
            if (Math.abs(dy) > tolerance) return dy;
            return a.bounds.left - b.bounds.left;
        });
        var sorted = [];
        for (var j = 0; j < records.length; j++) sorted.push(records[j].item);
        return sorted;
    }

    function runArrange(opts) {
        var items = getSelectionItems();
        if (items.length < 2) {
            alert("Please select multiple items to arrange.");
            return;
        }

        if (opts.sortMode === "position") {
            items = sortByPosition(items);
        }
        var bounds = [];
        for (var i = 0; i < items.length; i++) bounds.push(getBounds(items[i]));

        var gap = mmToPt(opts.gap, opts.x10);
        var mode = opts.mode;
        var columns = mode === "row" ? items.length : (mode === "column" ? 1 : opts.maxColumns);
        if (columns > items.length) columns = items.length;

        var rows = Math.ceil(items.length / columns);
        var rowMaxHeights = [];
        var colMaxWidths = [];

        var idx, r, c;
        for (r = 0; r < rows; r++) {
            rowMaxHeights[r] = 0;
        }
        for (c = 0; c < columns; c++) {
            colMaxWidths[c] = 0;
        }

        for (idx = 0; idx < items.length; idx++) {
            r = Math.floor(idx / columns);
            c = idx % columns;
            if (bounds[idx].height > rowMaxHeights[r]) rowMaxHeights[r] = bounds[idx].height;
            if (bounds[idx].width > colMaxWidths[c]) colMaxWidths[c] = bounds[idx].width;
        }

        var anchor = opts.anchor;
        var currentTop = bounds[0].top;
        var currentLeft = bounds[0].left;

        var rowY = [];
        rowY[0] = currentTop;
        for (r = 1; r < rows; r++) {
            rowY[r] = rowY[r - 1] - rowMaxHeights[r - 1] - gap;
        }

        var colX = [];
        colX[0] = currentLeft;
        for (c = 1; c < columns; c++) {
            colX[c] = colX[c - 1] + colMaxWidths[c - 1] + gap;
        }

        for (idx = 0; idx < items.length; idx++) {
            r = Math.floor(idx / columns);
            c = idx % columns;
            var b = bounds[idx];
            var targetLeft, targetTop;

            if (mode === "column") {
                targetLeft = currentLeft;
                if (anchor === "center") targetLeft += (colMaxWidths[0] - b.width) / 2;
                else if (anchor === "right" || anchor === "bottom") targetLeft += colMaxWidths[0] - b.width;
                targetTop = rowY[r];
            } else {
                targetLeft = colX[c];
                targetTop = rowY[r];
                if (anchor === "center") targetTop -= (rowMaxHeights[r] - b.height) / 2;
                else if (anchor === "bottom") targetTop -= rowMaxHeights[r] - b.height;
            }

            items[idx].translate(targetLeft - b.left, targetTop - b.top);
        }

        selectItems(items);
    }

    // ---------------- UI ----------------
    var win = new Window("dialog", "Unified Prepress Suite");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    var header = win.add("group");
    header.orientation = "row";
    header.alignChildren = ["left", "center"];
    var title = header.add("statictext", undefined, "UNIFIED PREPRESS SUITE");
    title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 14);
    header.add("statictext", undefined, "Independent Step & Repeat and Arrange tools");

    var globalPanel = win.add("panel", undefined, "Global Settings");
    globalPanel.orientation = "row";
    globalPanel.alignChildren = ["left", "center"];
    globalPanel.margins = 10;
    var x10Check = globalPanel.add("checkbox", undefined, "Large Canvas (x10)");
    x10Check.value = false;
    globalPanel.add("statictext", undefined, "All gaps multiplied by 10");

    var tabs = win.add("tabbedpanel");
    tabs.alignChildren = ["fill", "fill"];
    tabs.preferredSize = [500, 410];

    var repeatTab = tabs.add("tab", undefined, "Step & Repeat");
    repeatTab.orientation = "column";
    repeatTab.alignChildren = ["fill", "top"];
    repeatTab.margins = 12;
    repeatTab.spacing = 10;

    var gridPanel = repeatTab.add("panel", undefined, "Grid Dimensions (Enter 0 in Columns or Rows to auto-calculate)");
    gridPanel.orientation = "column";
    gridPanel.alignChildren = ["fill", "top"];
    gridPanel.margins = 10;
    var dims = gridPanel.add("group");
    dims.orientation = "row";
    dims.add("statictext", undefined, "Columns:");
    var columnsInput = dims.add("edittext", undefined, "4");
    columnsInput.characters = 6;
    dims.add("statictext", undefined, "Rows:");
    var rowsInput = dims.add("edittext", undefined, "0");
    rowsInput.characters = 6;

    var copiesRow = gridPanel.add("group");
    copiesRow.orientation = "row";
    copiesRow.add("statictext", undefined, "Copies to create (excluding original):");
    var copiesInput = copiesRow.add("edittext", undefined, "10");
    copiesInput.characters = 6;

    var gapPanel = repeatTab.add("panel", undefined, "Spacing");
    gapPanel.orientation = "column";
    gapPanel.alignChildren = ["fill", "top"];
    gapPanel.margins = 10;
    var gapXRow = gapPanel.add("group");
    gapXRow.add("statictext", undefined, "Horizontal gap:");
    var gapXInput = gapXRow.add("edittext", undefined, "5");
    gapXInput.characters = 7;
    gapXRow.add("statictext", undefined, "mm");
    var gapYRow = gapPanel.add("group");
    gapYRow.add("statictext", undefined, "Vertical gap:");
    var gapYInput = gapYRow.add("edittext", undefined, "5");
    gapYInput.characters = 7;
    gapYRow.add("statictext", undefined, "mm");

    var flowPanel = repeatTab.add("panel", undefined, "Flow Direction");
    flowPanel.orientation = "row";
    flowPanel.alignChildren = ["left", "center"];
    var flowDropdown = flowPanel.add("dropdownlist", undefined, ["Right & Down", "Right & Up"]);
    flowDropdown.selection = 0;
    var groupCheck = repeatTab.add("checkbox", undefined, "Group resulting grid");
    groupCheck.value = false;
    var repeatButton = repeatTab.add("button", undefined, "Run Step & Repeat");

    var arrangeTab = tabs.add("tab", undefined, "Arrange");
    arrangeTab.orientation = "column";
    arrangeTab.alignChildren = ["fill", "top"];
    arrangeTab.margins = 12;
    arrangeTab.spacing = 10;

    var modePanel = arrangeTab.add("panel", undefined, "Layout Mode");
    modePanel.orientation = "column";
    modePanel.alignChildren = ["fill", "top"];
    modePanel.margins = 10;
    var modeDropdown = modePanel.add("dropdownlist", undefined, ["Grid Arrangement", "Horizontal Row", "Vertical Column"]);
    modeDropdown.selection = 0;
    var columnsRow = modePanel.add("group");
    columnsRow.add("statictext", undefined, "Max columns:");
    var maxColumnsInput = columnsRow.add("edittext", undefined, "3");
    maxColumnsInput.characters = 6;

    var arrangeGapPanel = arrangeTab.add("panel", undefined, "Spacing & Alignment");
    arrangeGapPanel.orientation = "column";
    arrangeGapPanel.alignChildren = ["fill", "top"];
    arrangeGapPanel.margins = 10;
    var arrangeGapRow = arrangeGapPanel.add("group");
    arrangeGapRow.add("statictext", undefined, "Fixed gap:");
    var arrangeGapInput = arrangeGapRow.add("edittext", undefined, "5");
    arrangeGapInput.characters = 7;
    arrangeGapRow.add("statictext", undefined, "mm");
    var anchorRow = arrangeGapPanel.add("group");
    anchorRow.add("statictext", undefined, "Alignment anchor:");
    var anchorDropdown = anchorRow.add("dropdownlist", undefined, ["Top", "Center", "Bottom", "Left", "Right"]);
    anchorDropdown.selection = 0;

    var sortPanel = arrangeTab.add("panel", undefined, "Sorting Order");
    sortPanel.orientation = "row";
    sortPanel.alignChildren = ["left", "center"];
    sortPanel.add("statictext", undefined, "Sequence:");
    var sortDropdown = sortPanel.add("dropdownlist", undefined, ["Position (left-to-right, top-to-bottom)", "Current stacking order"]);
    sortDropdown.selection = 0;
    var arrangeButton = arrangeTab.add("button", undefined, "Run Arrange");

    function updateArrangeControls() {
        var mode = modeDropdown.selection ? modeDropdown.selection.index : 0;
        columnsRow.visible = (mode === 0);
        var horizontal = mode !== 2;
        anchorDropdown.removeAll();
        if (horizontal) {
            anchorDropdown.add("item", "Top");
            anchorDropdown.add("item", "Center");
            anchorDropdown.add("item", "Bottom");
            anchorDropdown.selection = 0;
        } else {
            anchorDropdown.add("item", "Left");
            anchorDropdown.add("item", "Center");
            anchorDropdown.add("item", "Right");
            anchorDropdown.selection = 0;
        }
        win.layout.layout(true);
    }
    modeDropdown.onChange = updateArrangeControls;
    updateArrangeControls();

    var buttons = win.add("group");
    buttons.orientation = "row";
    buttons.alignment = ["right", "center"];
    var cancelButton = buttons.add("button", undefined, "Cancel", { name: "cancel" });

    function runRepeatFromUI() {
        try {
            var repeatOpts = {
                columns: parseInteger(columnsInput, "Columns", 0),
                rows: parseInteger(rowsInput, "Rows", 0),
                copies: parseInteger(copiesInput, "Copies to create", 0),
                gapX: parseNumber(gapXInput, "Horizontal gap", true),
                gapY: parseNumber(gapYInput, "Vertical gap", true),
                flow: flowDropdown.selection.index === 1 ? "up" : "down",
                groupResult: groupCheck.value,
                x10: x10Check.value
            };
            runStepRepeat(repeatOpts);
        } catch (err) {
            alert("Step & Repeat could not complete the operation:\n" + err.message);
        }
    }

    function runArrangeFromUI() {
        try {
            var modeIndex = modeDropdown.selection.index;
            var mode = modeIndex === 1 ? "row" : (modeIndex === 2 ? "column" : "grid");
            var anchorLabel = anchorDropdown.selection ? anchorDropdown.selection.text.toLowerCase() : "top";
            var arrangeOpts = {
                mode: mode,
                maxColumns: mode === "row" ? 999999 : (mode === "column" ? 1 : parseInteger(maxColumnsInput, "Max columns", 1)),
                gap: parseNumber(arrangeGapInput, "Fixed gap", true),
                anchor: anchorLabel,
                sortMode: sortDropdown.selection.index === 0 ? "position" : "zorder",
                x10: x10Check.value
            };
            runArrange(arrangeOpts);
        } catch (err) {
            alert("Arrange could not complete the operation:\n" + err.message);
        }
    }

    repeatButton.onClick = runRepeatFromUI;
    arrangeButton.onClick = runArrangeFromUI;

    cancelButton.onClick = function () {
        win.close();
    };

    tabs.selection = 0;
    win.center();
    win.show();
}());