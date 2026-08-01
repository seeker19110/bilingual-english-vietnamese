import sys
import io
import glob
import pytesseract

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

folder = sys.argv[1]
start_idx = int(sys.argv[2]) if len(sys.argv) > 2 else 0
end_idx = int(sys.argv[3]) if len(sys.argv) > 3 else 6

files = sorted(glob.glob(folder.rstrip('/\\') + '/page_*.png'))
print('total images:', len(files))
for f in files[start_idx:end_idx]:
    txt = pytesseract.image_to_string(f, lang='vie')
    print(f'=== {f} ===')
    print(txt)
