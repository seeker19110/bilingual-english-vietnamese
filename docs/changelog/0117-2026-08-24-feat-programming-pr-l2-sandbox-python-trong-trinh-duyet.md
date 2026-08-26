# feat(programming): PR-L2 — sandbox Python trong trình duyệt (2026-08-24, cùng PR #659)

- **Pyodide TỰ HOST** (gói npm `pyodide`, plugin vite `pyodideSelfHostPlugin` copy 8 file lõi
  vào `dist/pyodide/` + serve ở dev) — KHÔNG dùng CDN ngoài (đúng tinh thần tự chủ hạ tầng;
  CDN cũng bị chặn trong môi trường CI). Chạy trong **Web Worker module** (`workers/
pyodideWorker.ts`), nạp lười ~13MB chỉ khi bấm Chạy lần đầu; bundle chính KHÔNG đổi.
- **`lib/pythonRunner.ts`**: timeout cứng 10s (terminate worker — cách duy nhất ngắt vòng lặp
  vô hạn WASM; đếm giờ SAU khi môi trường nạp xong qua message `ready`), stdout stream, nút
  Dừng; `input()` đọc từ ô "Dữ liệu nhập" điền sẵn (patch builtins.input, hết dòng báo EOF
  tiếng Việt); traceback rút gọn từ `<exec>` cho dễ đọc.
- **Trang `/lap-trinh/chay-thu`**: editor CodeMirror 6 (chunk lazy, nền tối cố định + bảng màu
  syntax đạt AA trên mọi theme), 10 bài mẫu P1 (`subject-programming/samplesP1.ts`, khớp 1-1
  unit P1, bối cảnh VN: tiền điện EVN, chia tiền ăn, máy bán nước…), console kết quả +
  khung lỗi. Nút vào từ trang tổng quan môn.
- **Kiểm chứng THẬT**: e2e chức năng `programming-playground.spec.ts` 3/3 xanh (chạy Python
  thật trong Chromium, offline — in lời chào · input() tính đúng 480000/4=120.000đ · code lỗi
  hiện NameError); a11y 30/30 xanh (3 trang lập trình × 5 theme × A/AA+AAA — đã sửa: nút
  accent-500 dùng `text-black` theo khuôn StudyTabs, syntax màu GitHub-Dark). Bài học sửa lỗi:
  Vite dev KHÔNG hỗ trợ classic worker → worker module + dynamic import `pyodide.mjs`.
- Cổng: typecheck · lint 0 cảnh báo · format · test 5190/5190 · build · size 15.63/16 kB.
- **Tiếp theo:** PR-L3 (engine bài học 8 bước: Predict/Parsons/Make chấm test-case + tiến độ DB).
