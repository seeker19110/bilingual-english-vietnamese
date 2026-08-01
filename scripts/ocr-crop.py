"""OCR một ảnh trang sách, cắt đôi trái/phải và phóng to trước khi nhận dạng.

Dùng khi mục lục trình bày 2 CỘT khiến OCR đọc lẫn thứ tự, hoặc khi ảnh nhỏ
làm chữ mờ. Cách dùng:

    python scripts/ocr-crop.py <đường_dẫn_ảnh> [hệ_số_phóng_to]

Ví dụ: python scripts/ocr-crop.py tai-lieu-sgk/SGK-KHTN/7/page_0005.png 3
"""

import io
import sys

import pytesseract
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

path = sys.argv[1]
scale = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0

img = Image.open(path)
w, h = img.size
print(f"=== {path} (gốc {w}x{h}, phóng to x{scale}) ===")

# Cắt đôi theo chiều dọc: nửa trái rồi nửa phải, giữ đúng thứ tự đọc của người
for name, box in (("TRÁI", (0, 0, w // 2, h)), ("PHẢI", (w // 2, 0, w, h))):
    part = img.crop(box)
    part = part.resize((int(part.width * scale), int(part.height * scale)), Image.LANCZOS)
    print(f"--- nửa {name} ---")
    print(pytesseract.image_to_string(part, lang="vie"))
