#!/usr/bin/env python3
"""
@name Fabrica Zero-Dependency Dev Server
@description Lightweight local development web server featuring automatic MIME mapping, CORS permissive headers, and zero-cache development headers.
@version v1.2.0
@author Lonewolf Developer Tools
"""

import sys
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

class FabricaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin testing and bypass stale asset caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        mime = super().guess_type(path)
        if path.endswith('.mjs') or path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return mime

print("--------------------------------------------------")
print(f"  FABRICA PYTHON DEV SERVER running at http://localhost:{PORT}")
print("  Press Ctrl+C to terminate.")
print("--------------------------------------------------")

with socketserver.TCPServer(("", PORT), FabricaRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server cleanly...")
