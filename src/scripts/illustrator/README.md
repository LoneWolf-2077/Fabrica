# Adobe Illustrator Scripts Directory
This directory (`src/scripts/illustrator/`) is automatically scanned by Fabrica.

## How to add your own scripts:
1. Drop any Adobe Illustrator script (`.jsx` or `.js`) into this folder (`/src/scripts/illustrator/`).
2. Optional: Add a metadata comment header at the top of your script:
```javascript
/**
 * @name Your Script Title
 * @description What your script does in Adobe Illustrator
 * @version 1.0.0
 * @author Your Name
 */
```
3. Fabrica will automatically detect the script, parse its metadata (or infer title and version from the filename), calculate file size, provide live code inspection, and offer direct 1-click downloads!
