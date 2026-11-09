/*
========================================
Add Inside Border (with Stroke Prompt)
Author: ChatGPT
Description:
Prompts user for stroke width (in points),
then adds black inside-aligned borders to all artboards.
========================================
*/

if (app.documents.length === 0) {
    alert("Please open a document first.");
} else {
    var doc = app.activeDocument;

    // Ask user for stroke width in points
    var strokeInput = prompt("Enter border stroke width (in points):", "0.5");

    if (strokeInput !== null) {
        var borderStroke = parseFloat(strokeInput);

        if (isNaN(borderStroke) || borderStroke <= 0) {
            alert("Please enter a valid positive number.");
        } else {
            for (var i = 0; i < doc.artboards.length; i++) {
                var ab = doc.artboards[i];
                var rect = ab.artboardRect; // [left, top, right, bottom]

                var left = rect[0];
                var top = rect[1];
                var right = rect[2];
                var bottom = rect[3];

                // Draw border rectangle
                var border = doc.pathItems.rectangle(top, left, right - left, top - bottom);
                border.stroked = true;
                border.strokeWidth = borderStroke;
                border.strokeColor = makeRGB(0, 0, 0);
                border.filled = false;

                // Simulate "Align Stroke to Inside"
                border.left += borderStroke / 2;
                border.top -= borderStroke / 2;
                border.width -= borderStroke;
                border.height -= borderStroke;
            }

            alert("✅ Inside borders added successfully!");
        }
    } else {
        alert("Operation cancelled.");
    }
}

// Helper: Create RGB color
function makeRGB(r, g, b) {
    var c = new RGBColor();
    c.red = r;
    c.green = g;
    c.blue = b;
    return c;
}
