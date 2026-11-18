#!/usr/bin/env python3
"""בונה את data/index.json מכל קבצי data/stories/*.json, ומעדכן את גרסת ה-Service Worker.
הרצה: python3 build.py"""
import json, glob, os, re, time
WPM = 120
ORDER = ["היסטוריה","כלכלה","ספורט","יזמים","חברות","פילוסופיה","טכנולוגיה ו-AI","ביטקוין וקריפטו"]
stories = []
for f in sorted(glob.glob("data/stories/*.json")):
    s = json.load(open(f, encoding="utf-8"))
    chs = []
    for c in s["chapters"]:
        b = c.get("body")
        chs.append({"title": c["title"], "min": max(1, round(len(b.split())/WPM)) if b else 0, "ready": bool(b)})
    imgs = [s["cover"]] + [i["file"] for i in s.get("images", [])] + re.findall(r"\[img:([^|\]]+)", " ".join(c.get("body") or "" for c in s["chapters"]))
    stories.append({k: s.get(k) for k in ("id","topic","title","subtitle","why","takeaways","cover","weekly")} | {
        "chapters": chs, "min": sum(c["min"] for c in chs), "added": s.get("added") or int(os.path.getmtime(f)),
        "assets": sorted(set(i for i in imgs if os.path.exists(i)))})
stories.sort(key=lambda s: -s["added"])
json.dump({"topics": ORDER, "stories": stories, "built": int(time.time())}, open("data/index.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
sw = open("sw.js", encoding="utf-8").read()
sw = re.sub(r'const CACHE = "boker-[^"]*";', f'const CACHE = "boker-{int(time.time())}";', sw)
open("sw.js","w",encoding="utf-8").write(sw)
print(f"{len(stories)} stories, {sum(s['min'] for s in stories)} minutes total")
