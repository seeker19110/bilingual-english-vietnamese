import sys
import io
import os
import fitz
import pytesseract

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

pdf_path = sys.argv[1]
start = int(sys.argv[2])
end = int(sys.argv[3])
out_dir = sys.argv[4] if len(sys.argv) > 4 else None

doc = fitz.open(pdf_path)
print('total pages:', doc.page_count)
for i in range(start, min(end, doc.page_count)):
    pix = doc[i].get_pixmap(dpi=250)
    img_path = None
    if out_dir:
        img_path = os.path.join(out_dir, f'p{i}.png')
        pix.save(img_path)
    else:
        img_path = os.path.join(os.environ.get('TEMP', '.'), f'_ocr_tmp.png')
        pix.save(img_path)
    txt = pytesseract.image_to_string(img_path, lang='vie')
    print(f'=== page {i} ===')
    print(txt)
