#!/usr/bin/env python3
"""
Import content directory into Supabase (nodes + content tables).

Usage:
  pip install supabase
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=your_anon_key python import.py
"""

import json
import os
from pathlib import Path
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
CONTENT_DIR  = Path(__file__).parent / "content"

# content_type derived from filename stem
VALID_TYPES = {"concept", "guide", "playbook", "case", "failure"}

def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    for folder in sorted(CONTENT_DIR.iterdir()):
        if not folder.is_dir():
            continue

        node_file = folder / "node.json"
        if not node_file.exists():
            print(f"[skip] {folder.name} — no node.json")
            continue

        node = json.loads(node_file.read_text())

        # Upsert node (idempotent on slug)
        result = sb.table("nodes").upsert(node, on_conflict="slug").execute()
        node_id = result.data[0]["id"]
        print(f"[node] {node['name']} → {node_id}")

        # Import HTML content files
        for html_file in sorted(folder.glob("*.html")):
            content_type = html_file.stem  # concept / guide / playbook / case / failure
            if content_type not in VALID_TYPES:
                print(f"  [skip] {html_file.name} — unknown type")
                continue

            body = html_file.read_text()
            sb.table("content").upsert({
                "node_id":      node_id,
                "content_type": content_type,
                "title":        f"{node['name']} — {content_type}",
                "body":         body,
                "source":       "manual",
            }, on_conflict="node_id,content_type").execute()
            print(f"  [content] {content_type}")

    print("Done.")

if __name__ == "__main__":
    main()
