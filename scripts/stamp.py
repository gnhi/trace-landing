#!/usr/bin/env python3
"""
Đánh dấu phiên bản cho CSS và JS.

Vì sao cần: assets được đặt cache 7 ngày trong public/_headers, mà tên tệp thì
không đổi. Sửa nội dung CSS xong deploy, trình duyệt nào đã tải bản cũ vẫn giữ
bản cũ tới hết 7 ngày. Đã có lần sơ đồ kiến trúc hiện đen sì đúng vì lý do này:
CSS cũ thiếu class .pane nên SVG mặc định tô màu đen.

Cách chạy: python3 scripts/stamp.py rồi npx wrangler deploy.
Script tính mã băm nội dung từng tệp rồi gắn vào đường dẫn dạng ?v=<8 ký tự>.
Nội dung không đổi thì mã băm không đổi, nên cache vẫn dùng lại được.
"""

import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

ASSETS = {
    "assets/css/style.css": PUBLIC / "assets/css/style.css",
    "assets/js/main.js": PUBLIC / "assets/js/main.js",
}


def short_hash(path: pathlib.Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()[:8]


def main() -> int:
    missing = [k for k, p in ASSETS.items() if not p.exists()]
    if missing:
        print("Không tìm thấy:", ", ".join(missing))
        return 1

    hashes = {rel: short_hash(p) for rel, p in ASSETS.items()}
    for rel, h in hashes.items():
        print("  %-22s v=%s" % (rel, h))

    total = 0
    for page in sorted(PUBLIC.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        before = text
        for rel, h in hashes.items():
            # khớp cả dạng tương đối và dạng bắt đầu bằng dấu gạch chéo,
            # và cả trường hợp đã có ?v= từ lần chạy trước
            pattern = re.compile(r'(["\'])(/?' + re.escape(rel) + r')(\?v=[0-9a-f]+)?\1')
            text = pattern.sub(lambda m: '%s%s?v=%s%s' % (m.group(1), m.group(2), h, m.group(1)), text)
        if text != before:
            page.write_text(text, encoding="utf-8")
            total += 1
            print("  cập nhật %s" % page.name)

    print("Đã đánh phiên bản cho %d trang." % total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
