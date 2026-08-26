# docs(load-test): leo thang k6 100→500→2.000 VU trên production — phát hiện quan trọng, đính chính giữa chừng — PR #662 (2026-08-24/25, đã MERGE)

Tiếp nối 2 lần đo k6 100 VU đã ghi (PR #653/#655), chủ dự án tự leo thang 500 VU rồi 2.000 VU
trên production thật (`www.donghanhcungban.org`), theo đúng lộ trình thận trọng ghi trong
`k6-baseline.js`. Đây là chuỗi phát hiện — có một kết luận bị **đính chính giữa chừng**, ghi rõ
cả sai lẫn đúng vì đúng tinh thần CLAUDE.md mục 5 (không giấu chỗ đã đoán sai).

**500 VU: sạch tuyệt đối.** `checks_succeeded 100%`, p95 = 125ms (còn THẤP hơn cả lần 100 VU vì tỷ
lệ `429` tăng kéo trung bình xuống), 0 lỗi 500. `/api/health` giữ ổn định qua thông lượng tăng
44,8 → 226,3 req/s — không có dấu hiệu nghẽn.

**2.000 VU (2 lần độc lập, qua Cloudflare): p95 ~1,3–1,4s, 0 lỗi thật.** Lần đầu trùng giờ với một
lượt deploy hợp lệ (PR #654 của phiên khác merge — mỗi push lên `main` tự kích deploy toàn bộ,
không lọc theo file đổi) nên nghi ngờ CPU bị deploy chiếm dụng; **lần đo lại sau khi deploy xong
cho kết quả gần như y hệt (p95 1,32s)** — loại trừ giả thuyết deploy, khẳng định đây là hành vi
tái lập ở mức 2.000 VU/1 IP. `checks_succeeded` vẫn ~100%, `http_req_failed` báo cao (~50%) nhưng
đây là nhiễu đã biết: `/api/app-settings` giới hạn 30 req/phút/IP, một IP duy nhất bắn 2.000 VU
chạm giới hạn đó gần như ngay lập tức — không phải server yếu.

**🔴 Giả thuyết SAI lúc giữa chừng — đã tự đính chính bằng thực nghiệm:** dòng log
`read tcp 103.118.29.58:...->172.67.205.155:443: read: connection reset by peer` (IP
`172.67.205.155` thuộc dải Cloudflare) khiến nghi ngờ **Cloudflare đang chặn/làm chậm** request
từ chính VPS. Đã kiểm chứng bằng thực nghiệm dứt khoát: tạm trỏ `/etc/hosts` domain về `127.0.0.1`
để **bỏ qua hẳn Cloudflare, đánh thẳng vào Nginx trên VPS** (giữ nguyên SNI/Host nên chứng chỉ
Let's Encrypt vẫn khớp), chạy lại đúng 2.000 VU.

**Kết quả ĐẢO NGƯỢC hoàn toàn giả thuyết:** bỏ Cloudflare ra, hệ thống **TỆ HƠN HẲN**, không phải
tốt hơn — p95 nhảy lên **5,62s** (so với 1,3s qua Cloudflare), xuất hiện **lỗi thật lần đầu tiên**
(`checks_failed` 1,25%, 1.372/109.542 request — trước giờ luôn ~0%), thông lượng giảm (400 req/s
so với 629 req/s), và log tràn ngập `EOF`/`connection reset by peer` ngay ở `127.0.0.1→127.0.0.1`
— tức chính Nginx/OS trên VPS từ chối kết nối khi phải tự xử lý 2.000 lượt bắt tay TLS thô cùng
lúc mà không có CDN gộp bớt kết nối phía trước.

**Kết luận đúng, sau khi kiểm chứng thực nghiệm (không phải suy đoán):** Cloudflare **không chặn
mà đang giúp** — nó gộp (pool) nhiều kết nối client thành ít kết nối hơn về origin, giảm tải bắt
tay TLS trực tiếp cho Nginx. Con số đáng tin để ghi nhận là **kết quả ĐO QUA CLOUDFLARE** (p95
~1,3s, 0 lỗi ở 2.000 VU) — đây là đường đi thật của mọi người dùng thật, không ai bỏ qua CDN cả.
Vì bài test vẫn dồn tải từ **1 IP duy nhất** (không đại diện traffic thật phân tán nhiều IP thật),
khả năng cao trần thật của hệ thống với người dùng thật đa dạng IP còn tốt hơn số đo này.

**Việc tay đã làm xong, không để lại rác:** đã gỡ dòng `/etc/hosts` ghi đè, xác nhận bằng
`cat /etc/hosts` sạch — hệ thống trở lại đường đi bình thường qua Cloudflare.

**Quyết định dừng leo thang ở đây:** thử nghiệm 1-IP không còn cho tín hiệu đáng tin ở các mức
cao hơn (bị giới hạn IP che khuất, đã ghi trong comment `k6-baseline.js`). Muốn đo tiếp cần nguồn
tải nhiều IP thật (k6 Cloud, nhiều máy, hoặc test có đăng nhập nhiều tài khoản) — ngoài phạm vi
hiện tại.

**Phát hiện phụ đáng ghi nhớ:** trong lúc điều tra, phát hiện `deploy.yml` tự kích deploy toàn bộ
(`npm ci` + build + reload PM2) trên **mọi** push lên `main`, không lọc theo phạm vi thay đổi —
đã có `concurrency: group: deploy-vps, cancel-in-progress: false` chống chồng lệnh, nhưng khi
nhiều phiên AI khác nhau merge PR liên tiếp trong thời gian ngắn (quan sát được PR #654 của một
phiên khác merge xen giữa chuỗi PR #652/#653/#655 của phiên này), mỗi lượt vẫn tốn tài nguyên CPU
thật (3 vCPU) dù thay đổi chỉ là tài liệu. Chưa phải vấn đề cấp bách (deploy tự xếp hàng, tự hoàn
tất, không gây lỗi) nhưng đáng cân nhắc thêm điều kiện lọc path nếu tần suất merge tăng.
