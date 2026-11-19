#!/usr/bin/env python3
"""Exchange Companion: static app + anonymous session recorder.

Same pattern as the SortMate CHI pilot recorder. Serves ./public/ and appends
every posted session snapshot as one JSON line, to data/<session>.jsonl and
data/all.jsonl. A session may post several snapshots (progress, page closed,
completed); the analysis keeps the last one per session id. Standard library
only.

    python3 server.py                 # http://0.0.0.0:8000
    python3 server.py --port 8080

data/ lives outside public/, so recordings are never web-accessible.
No client IP is stored.
"""
import argparse
import json
import os
import re
import sys
import time
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
SERVE_DIR = os.path.join(HERE, "public")
DATA_DIR = os.environ.get("EC_DATA_DIR", os.path.join(HERE, "data"))
MAX_BODY = 2_000_000


def safe_name(s):
    s = re.sub(r"[^A-Za-z0-9_.-]", "_", str(s if s is not None else "anon"))
    return s[:80] or "anon"


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, obj):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if urlparse(self.path).path == "/api/health":
            return self._json(200, {"ok": True, "time": time.time()})
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/log":
            return self._json(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0 or length > MAX_BODY:
                return self._json(400, {"error": "bad content length"})
            rec = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(rec, dict):
                raise ValueError("payload must be a JSON object")
        except Exception as e:
            return self._json(400, {"error": "bad json: %s" % e})
        rec["_server_time"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
        os.makedirs(DATA_DIR, exist_ok=True)
        line = json.dumps(rec, ensure_ascii=False)
        try:
            for fn in (os.path.join(DATA_DIR, safe_name(rec.get("id")) + ".jsonl"),
                       os.path.join(DATA_DIR, "all.jsonl")):
                with open(fn, "a", encoding="utf-8") as f:
                    f.write(line + "\n")
        except OSError as e:
            return self._json(500, {"error": "could not write: %s" % e})
        return self._json(200, {"ok": True})

    def log_message(self, fmt, *args):
        # no client address in the logs either
        sys.stderr.write("%s\n" % (fmt % args))


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


def main():
    ap = argparse.ArgumentParser(description="Exchange Companion server")
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=8000)
    a = ap.parse_args()
    httpd = ThreadingHTTPServer((a.host, a.port), partial(Handler, directory=SERVE_DIR))
    print("Exchange Companion on http://%s:%d  (data: %s)" % (a.host, a.port, DATA_DIR))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
