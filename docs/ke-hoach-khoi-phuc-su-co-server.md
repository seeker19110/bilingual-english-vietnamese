# Kế hoạch khôi phục hoạt động server sau sự cố (Incident Recovery Plan)

> File này trả lời câu hỏi **"server sập/gặp sự cố thì làm gì, theo thứ tự nào"** — khác với:
>
> - `docs/DEPLOY.md` — deploy code mới + fix nhanh vài lỗi phổ biến (502, port bận...).
> - `docs/rollback-runbook.md` — rollback **cấu hình** khi 1 PR/thay đổi cụ thể gây lỗi.
>
> File này là **quy trình ứng phó sự cố tổng thể**: phát hiện → phân loại mức độ → xử lý theo
> từng kịch bản cụ thể → xác minh khôi phục xong → viết báo cáo sau sự cố (post-mortem).
> Đọc 1 lần để biết tổng thể; khi có sự cố thật, nhảy thẳng vào **Phần 3 (kịch bản)** khớp
> triệu chứng đang gặp.

---

## 0. Thông tin cần có sẵn (điền trước, đừng tìm lúc đang sập)

| Mục                     | Giá trị                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| VPS IP                  | `160.30.172.203`                                                                                 |
| Domain                  | `en-vi.donghanhcungban.com`                                                                      |
| Thư mục app             | `/var/www/english-tutor`                                                                         |
| PM2 process             | `english-tutor` (port **3001** — port 3000 là app khác "xboss")                                  |
| Health check            | `curl https://en-vi.donghanhcungban.com/api/health`                                              |
| Database                | PostgreSQL tự host, db `english_tutor`, user `tutor_app`                                         |
| Backup DB               | `/var/backups/english_tutor_YYYYMMDD.sql.gz` (cron 3h sáng, giữ 7 bản)                           |
| Audio storage           | `STORAGE_DRIVER` — `local` (`uploads/` trên VPS) hoặc `r2` (Cloudflare R2) — kiểm tra `.env` VPS |
| Nhà cung cấp VPS/domain | _(điền: tên nhà cung cấp, cách đăng nhập control panel để restart VPS nếu SSH không vào được)_   |
| Người liên hệ khẩn      | _(điền: SĐT/email người quản trị dự phòng nếu không phải chỉ 1 người)_                           |

> ⚠️ **Việc cần làm ngay (không thuộc phần code):** điền 2 dòng cuối bảng trên — kế hoạch này vô
> dụng nếu không vào được VPS lúc sập và chỉ có 1 người biết cách xử lý.

---

## 1. Nguyên tắc chung khi có sự cố

1. **Bình tĩnh, đừng sửa tay trực tiếp trên VPS nếu tránh được.** Mọi thay đổi nên đi qua
   `git commit` + push + để `scripts/deploy.sh` tự chạy — sửa tay trên VPS sẽ **mất khi deploy
   lần sau** (`deploy.sh` chạy `git reset --hard origin/main`) và không ai biết bạn đã đổi gì.
   Ngoại lệ: sự cố khẩn cấp cần app sống lại **ngay** (xem Phần 3) — sửa tay để cứu hỏa trước,
   ghi lại đã làm gì, rồi đưa thay đổi đó vào commit thật ngay sau khi ổn định.
2. **Không xoá dữ liệu khi chưa chắc chắn.** Ưu tiên đổi cấu hình / rollback code trước; chỉ xoá
   (database, file backup cũ...) sau khi xác nhận hệ thống ổn định vài ngày.
3. **Luôn xác minh bằng lệnh thật**, không đoán — mọi bước dưới đây đều có lệnh copy-paste được.
4. **Ghi lại thời gian + việc đã làm** (kể cả trong lúc rối) — cần cho báo cáo post-mortem (Phần 5)
   và để người khác tiếp tục nếu bạn phải dừng giữa chừng.

---

## 2. Bước đầu tiên khi phát hiện sự cố — chẩn đoán nhanh (< 2 phút)

```bash
# 1. App còn phản hồi không?
curl -i https://en-vi.donghanhcungban.com/api/health

# 2. SSH vào VPS được không?
ssh root@160.30.172.203

# --- Nếu SSH được, chạy tiếp trên VPS: ---

# 3. PM2 process còn sống không?
pm2 status

# 4. Log lỗi gần nhất
pm2 logs english-tutor --lines 50 --nostream

# 5. Database còn sống không?
sudo -u postgres psql -c "SELECT 1;"

# 6. Còn đủ ổ đĩa / RAM không? (nguyên nhân sập âm thầm hay gặp nhất)
df -h /
free -h

# 7. Nginx còn chạy không?
sudo systemctl status nginx
```

Dựa vào kết quả, đi tới đúng kịch bản ở **Phần 3**:

| Triệu chứng                                                                               | → Kịch bản                                         |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `curl health` timeout/refused, SSH **không** vào được                                     | 3.1 VPS không phản hồi                             |
| SSH vào được, `pm2 status` báo `errored`/`stopped`/restart liên tục                       | 3.2 App (PM2) crash                                |
| `df -h /` báo `100%` hoặc gần đầy                                                         | 3.3 Hết dung lượng ổ đĩa                           |
| `psql -c "SELECT 1"` lỗi, hoặc log báo `ECONNREFUSED`/`too many connections` tới Postgres | 3.4 Database lỗi/không kết nối được                |
| App chạy, health OK, nhưng **dữ liệu sai/thiếu** (mất bài học, mất lịch sử...)            | 3.5 Mất/hỏng dữ liệu — cần restore backup          |
| Trình duyệt báo cảnh báo SSL / chứng chỉ hết hạn                                          | 3.6 SSL hết hạn                                    |
| Site load được nhưng cực chậm, hoặc log có traffic bất thường tăng vọt                    | 3.7 Quá tải / nghi bị tấn công (DDoS)              |
| Nghi có truy cập trái phép (log lạ, file lạ, tài khoản lạ)                                | 3.8 Nghi bị xâm nhập bảo mật                       |
| Deploy mới nhất gây lỗi (biết rõ do PR nào)                                               | → dùng `docs/rollback-runbook.md` thay vì file này |

---

## 3. Kịch bản xử lý chi tiết

### 3.1 VPS không phản hồi (SSH không vào được)

**Nguyên nhân thường gặp:** VPS bị treo/reboot ngoài ý muốn, nhà cung cấp bảo trì, hết RAM/CPU
khiến kernel không phản hồi SSH.

**Xử lý:**

1. Vào **control panel của nhà cung cấp VPS** (không qua SSH) — kiểm tra trạng thái máy (đang
   chạy/đã tắt), xem có cảnh báo (quá tải, vi phạm chính sách...) không.
2. Nếu máy hiện "đang chạy" nhưng SSH vẫn không vào: dùng chức năng **console/VNC** của nhà cung
   cấp (không cần SSH) để xem màn hình thật — thường thấy kernel panic hoặc log OOM-killer.
3. Nếu máy "đã tắt"/"treo": **restart VPS** qua control panel.
4. Sau khi VPS lên lại: SSH vào, chạy chẩn đoán Phần 2 lại từ đầu — PM2 thường **tự khởi động
   lại** app nếu đã chạy `pm2 startup` + `pm2 save` trước đó (kiểm tra: `pm2 status`; nếu app
   không tự lên, chạy `pm2 resurrect` hoặc `cd /var/www/english-tutor && pm2 start
ecosystem.config.cjs`).
5. Nếu nguyên nhân là **hết RAM** (kiểm tra `dmesg | grep -i "out of memory"` sau khi vào lại
   được) → xem thêm mục 3.7 (quá tải).

### 3.2 App (PM2) crash / restart liên tục

**Triệu chứng:** `pm2 status` báo `errored` hoặc `↺` (restart count) tăng liên tục.

```bash
pm2 logs english-tutor --lines 100 --nostream   # đọc lỗi thật gây crash
```

**Xử lý theo nguyên nhân log cho thấy:**

- **Thiếu biến môi trường / `.env` sai** (log kiểu `undefined is not a function` liên quan
  `process.env.X`, hoặc lỗi kết nối DB ngay khi start) → kiểm tra `.env` còn đủ key theo
  `.env.example` không (`diff <(grep -oP '^[A-Z_]+(?==)' .env.example) <(grep -oP '^[A-Z_]+(?==)' .env)`).
- **Lỗi do code mới deploy** (crash xuất hiện đúng lúc deploy gần nhất) → xem
  `docs/rollback-runbook.md` (rollback bằng `git revert` + push, KHÔNG sửa tay).
- **`exec_mode` PM2 lệch cấu hình** (đổi cluster↔fork gần đây) — dấu hiệu: crash im lặng, log
  gần như trống ngay sau start → xem ghi chú trong `ecosystem.config.cjs` + GĐ1 của
  `docs/rollback-runbook.md`.
- **Không rõ nguyên nhân, cần app sống lại ngay:**
  ```bash
  cd /var/www/english-tutor
  pm2 delete english-tutor
  pm2 start ecosystem.config.cjs
  pm2 logs english-tutor --lines 30   # xem có lên ổn không
  ```
- Nếu vẫn lỗi → build lại sạch từ đầu (loại trừ `node_modules`/`dist` hỏng):
  ```bash
  cd /var/www/english-tutor
  rm -rf dist dist-server node_modules
  npm ci
  npm run build
  pm2 restart english-tutor
  ```

**Xác minh xong:** `curl https://en-vi.donghanhcungban.com/api/health` trả `{"status":"ok",...}`
và thử đăng nhập + 1 luồng thật (tra từ điển hoặc gửi 1 tin nhắn chat) trên trình duyệt thật.

### 3.3 Hết dung lượng ổ đĩa

**Triệu chứng:** `df -h /` gần/đúng 100%; app crash khi ghi log/file; DB ghi lỗi
`No space left on device`.

```bash
# Tìm thư mục chiếm nhiều dung lượng nhất
du -sh /var/www/english-tutor/* | sort -rh | head -10
du -sh /var/backups/* 2>/dev/null | sort -rh | head -10
du -sh /root/.pm2/logs/* 2>/dev/null | sort -rh | head -10
```

**Dọn theo thứ tự ưu tiên (an toàn → rủi ro tăng dần):**

1. Log PM2 cũ (an toàn, tự sinh lại): `pm2 flush` (xoá log hiện tại) — vốn đã có
   `pm2-logrotate` (giới hạn 10MB/file, giữ 7 bản) nên nếu vẫn đầy → kiểm tra
   `pm2 conf pm2-logrotate` xem có bị tắt/đổi cấu hình không.
2. Backup Postgres **quá hạn giữ** (script `verify-pg-backup.sh`/cron đã tự xoá bản >7 ngày —
   nếu chưa chạy, xoá tay bản cũ nhất, **giữ lại ít nhất 1-2 bản gần nhất**):
   ```bash
   ls -lt /var/backups/english_tutor_*.sql.gz
   ```
3. `node_modules`/`dist` cũ không dùng (an toàn, build lại được):
   ```bash
   cd /var/www/english-tutor && rm -rf dist dist-server node_modules && npm ci && npm run build
   ```
4. **Không xoá** `uploads/` (audio cache, nếu `STORAGE_DRIVER=local`) hay dữ liệu Postgres thật —
   đây là dữ liệu người dùng, không tái tạo được.
5. Nếu dọn xong vẫn gần đầy lâu dài → cân nhắc: chuyển `STORAGE_DRIVER` sang `r2` (Cloudflare R2,
   xem `.env.example`) để audio không chiếm ổ VPS, hoặc nâng dung lượng VPS.

### 3.4 Database (PostgreSQL) lỗi / không kết nối được

**Triệu chứng:** log app báo `ECONNREFUSED`/`too many clients already`/timeout tới Postgres.

```bash
# Postgres còn chạy không?
sudo systemctl status postgresql

# Chưa chạy → khởi động lại
sudo systemctl restart postgresql
sudo systemctl status postgresql   # xác nhận "active (running)"

# Nếu báo "too many clients already" — xem có kết nối rò rỉ (không đóng) không:
sudo -u postgres psql -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

- **Postgres không tự khởi động lại được** → đọc log lỗi thật:
  `sudo journalctl -u postgresql -n 100 --no-pager`. Nguyên nhân thường gặp: hết ổ đĩa (→ 3.3),
  file cấu hình `postgresql.conf`/`pg_hba.conf` bị sửa sai gần đây, hoặc dữ liệu (`PGDATA`) hỏng.
- **`too many clients`** → app có thể đang leak connection pool (`pg.Pool` trong
  `api/_lib/pgPool.ts`) — restart app trước (`pm2 restart english-tutor`) để giải phóng kết nối
  cũ, sau đó điều tra code nếu lặp lại thường xuyên (không phải sự cố tạm thời).
- **Dữ liệu nghi hỏng (không chỉ là không kết nối được)** → **DỪNG, không tự sửa tay trong DB**,
  chuyển sang mục 3.5 (restore từ backup) — sửa tay khi đang hoảng dễ làm mất thêm dữ liệu.

### 3.5 Mất/hỏng dữ liệu — khôi phục từ backup Postgres

**Dùng khi:** dữ liệu bị xoá/sửa sai (do bug, thao tác nhầm, hoặc DB hỏng không sửa được).

⚠️ **Đây là thao tác không thể hoàn tác dễ dàng — xác nhận với người dùng/đội trước khi restore
đè lên database đang chạy**, trừ khi database đã hỏng hoàn toàn và không còn lựa chọn khác.

```bash
# 1. Xem các bản backup có sẵn (mới nhất trước)
ls -lt /var/backups/english_tutor_*.sql.gz

# 2. LUÔN backup trạng thái HIỆN TẠI trước khi ghi đè (dù đang lỗi — có thể vẫn cứu được ít dữ liệu)
sudo -u postgres pg_dump english_tutor | gzip > /var/backups/before-restore-$(date +%Y%m%d-%H%M).sql.gz

# 3. Test khôi phục vào DB TẠM trước (không đụng DB thật) — dùng script có sẵn:
bash /var/www/english-tutor/scripts/verify-pg-backup.sh /var/backups/english_tutor_<ngày-cần>.sql.gz

# 4. Nếu bước 3 OK (backup không hỏng) — mới restore đè lên DB thật:
pm2 stop english-tutor   # dừng app trong lúc restore, tránh ghi đè song song
sudo -u postgres dropdb english_tutor
sudo -u postgres createdb english_tutor -O tutor_app
gunzip -c /var/backups/english_tutor_<ngày-cần>.sql.gz | sudo -u postgres psql english_tutor

# 5. Chạy lại migration nếu backup cũ hơn schema hiện tại (bản backup có thể thiếu bảng/cột mới)
cd /var/www/english-tutor && npm run migrate:pg

# 6. Khởi động lại app + xác minh
pm2 start english-tutor
curl http://localhost:3001/api/health
```

**Lưu ý quan trọng:**

- Backup chạy **hàng ngày 3h sáng**, giữ 7 bản → dữ liệu mất **tối đa gần 24h** kể từ lần backup
  gần nhất (không phải real-time). Nếu cần khôi phục sát thời điểm sự cố hơn, không có cách nào
  khác ngoài backup gần nhất — đây là giới hạn đã biết (RPO ~24h), cân nhắc backup thường xuyên
  hơn nếu dữ liệu quan trọng tăng lên (xem "Cải tiến nên cân nhắc" ở Phần 6).
- Nếu `STORAGE_DRIVER=local`, **audio cache trong `uploads/` KHÔNG nằm trong backup Postgres** —
  mất file audio không mất dữ liệu học tập (audio sẽ tự tạo lại qua TTS lần gọi kế tiếp, chỉ tốn
  lại chi phí API TTS), nên không cấp bách bằng mất dữ liệu Postgres.

### 3.6 SSL (Let's Encrypt) hết hạn

```bash
sudo certbot certificates          # xem ngày hết hạn thật
sudo certbot renew --dry-run       # test renew có chạy được không (không đổi cert thật)
sudo certbot renew                 # renew thật nếu dry-run OK
sudo systemctl reload nginx        # áp cert mới vào Nginx
```

Nếu `certbot renew` lỗi (thường do domain không trỏ đúng IP nữa, hoặc port 80 bị chặn) → kiểm
tra DNS (`dig en-vi.donghanhcungban.com`) và `sudo ufw status` (port 80 phải mở cho HTTP-01
challenge).

### 3.7 Quá tải / nghi bị tấn công (DDoS, traffic spike bất thường)

```bash
# Xem kết nối đang mở nhiều nhất từ IP nào
ss -ant | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Log Nginx — request nhiều nhất từ IP nào trong vài phút gần đây
sudo tail -n 5000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
```

- **Chi phí AI tăng bất thường do spam** (không phải lỗi hạ tầng) → dùng **"Cầu dao khẩn cấp AI"**
  ở trang `/admin-settings` (đã có sẵn, hiệu lực ~30s, không cần deploy) — xem
  `docs/rollback-runbook.md` mục GĐ3.
- **Traffic quá tải hạ tầng thật** → cân nhắc bật Cloudflare (CDN + chống DDoS miễn phí, xem
  `docs/cloudflare-setup.md`) nếu chưa bật; nếu đã bật Cloudflare, kiểm tra "Under Attack Mode"
  trong Cloudflare Dashboard.
- Tạm thời chặn IP cụ thể (chỉ khi xác định rõ IP tấn công, tránh chặn nhầm người dùng thật):
  ```bash
  sudo ufw deny from <IP>
  ```

### 3.8 Nghi bị xâm nhập bảo mật

**Dấu hiệu:** file lạ trong `/var/www/english-tutor`, tài khoản Postgres lạ, log SSH có đăng nhập
từ IP không quen, `crontab` có dòng lạ.

**Xử lý (ưu tiên ngăn chặn trước, điều tra sau):**

1. **Đổi ngay mọi secret** có khả năng đã lộ: mật khẩu Postgres (`tutor_app`), `JWT_SECRET`/khoá
   ký token trong `.env`, API key AI (Claude/Groq/OpenAI/Google TTS) — thu hồi key cũ ở nhà cung
   cấp, tạo key mới, cập nhật `.env`, `pm2 restart english-tutor --update-env`.
2. Đổi mật khẩu SSH/khoá SSH của VPS; kiểm tra `~/.ssh/authorized_keys` có khoá lạ không.
3. Kiểm tra `crontab -l` (cả user thường và `sudo -u postgres crontab -l`) — xoá dòng lạ không
   phải do mình thêm.
4. **KHÔNG vội xoá bằng chứng** (log, file lạ) trước khi chụp lại/copy ra chỗ khác — cần cho điều
   tra nguyên nhân sau này.
5. Nếu nghi database bị đọc trộm dữ liệu người dùng (email, mật khẩu hash...) → cân nhắc **thông
   báo cho người dùng** theo tinh thần minh bạch, dù dự án nhỏ — mật khẩu đã hash nên rủi ro thấp
   hơn, nhưng vẫn nên khuyến khích đổi mật khẩu nếu xác nhận có rò rỉ thật.
6. Sau khi chặn xong, restore lại từ **backup Postgres trước thời điểm nghi bị xâm nhập** (mục 3.5)
   nếu nghi dữ liệu đã bị chỉnh sửa.

---

## 4. Sau khi khôi phục xong — checklist xác minh

Không coi là "xong" cho tới khi đủ:

- [ ] `curl https://en-vi.donghanhcungban.com/api/health` → `{"status":"ok",...}`
- [ ] Đăng nhập được bằng tài khoản thật trên trình duyệt
- [ ] Thử ít nhất 1 luồng chính mỗi loại còn hoạt động (chat AI, tra từ điển, ghi âm luyện nói)
- [ ] `pm2 status` báo `online`, không còn restart loop (`↺` không tăng thêm sau vài phút)
- [ ] `df -h /` còn đủ dung lượng trống (không sát 100%)
- [ ] Nếu vừa restore DB: kiểm tra vài bản ghi gần nhất còn đúng không (không chỉ chạy được, mà
      dữ liệu đúng)
- [ ] Nếu vừa đổi secret (mục 3.8): xác nhận `.env` VPS đã cập nhật VÀ đã `pm2 restart
--update-env` (PM2 không tự đọc lại `.env` khi chỉ sửa file)

---

## 5. Sau sự cố — báo cáo ngắn (post-mortem)

Không cần quy trình nặng nề (dự án nhỏ), nhưng **luôn ghi lại tối thiểu** vào `PROGRESS.md` mục
"nợ kỹ thuật"/lịch sử, hoặc issue riêng nếu cần theo dõi tiếp:

```
Sự cố: [mô tả ngắn]
Thời gian: [bắt đầu] → [khôi phục xong], tổng downtime: [X phút]
Nguyên nhân gốc: [vì sao xảy ra — không chỉ triệu chứng]
Đã làm gì để khôi phục: [tóm tắt các bước đã chạy thật]
Có mất dữ liệu không: [có/không, nếu có thì phạm vi]
Cách ngăn tái diễn: [đổi code/cấu hình/quy trình gì để không lặp lại]
```

---

## 6. Cải tiến nên cân nhắc (chưa làm — không tự ý làm, cần người dùng quyết định trước)

Ghi lại để không quên, KHÔNG tự triển khai nếu chưa được xác nhận (theo CLAUDE.md — thay đổi lớn
phải hỏi trước):

1. **Uptime monitoring tự động** (vd. UptimeRobot/Better Uptime miễn phí) gọi `/api/health` mỗi
   vài phút + báo qua email/Telegram khi sập — hiện tại **chưa có gì tự động phát hiện sự cố**,
   phải có người chủ động kiểm tra hoặc chờ người dùng báo app lỗi.
2. **Sentry** đã code xong (client + server, no-op tới khi có DSN) nhưng **chưa điền
   `SENTRY_DSN`/`VITE_SENTRY_DSN`** trên VPS — xem `PROGRESS.md` mục nợ kỹ thuật. Bật sẽ giúp
   phát hiện lỗi runtime (không chỉ sập hẳn) sớm hơn.
3. **Backup Postgres mới chạy 1 lần/ngày** (RPO ~24h) — nếu dữ liệu người dùng tăng giá trị, có
   thể cân nhắc tăng tần suất (vd. mỗi 6h) hoặc bật WAL archiving để giảm mất dữ liệu tối đa.
4. **1 VPS duy nhất, không có standby/failover** — nếu VPS hỏng phần cứng vĩnh viễn, khôi phục
   nghĩa là dựng VPS mới hoàn toàn từ đầu (theo `docs/deploy-vps-ubuntu.md`) + restore backup
   Postgres mới nhất — chấp nhận được ở quy mô hiện tại, nhưng cần biết rõ đây là đánh đổi đã chọn
   (chi phí thấp, đổi lại downtime dài hơn nếu hỏng phần cứng).
5. **Người biết quy trình khôi phục hiện chỉ có 1 người** — nên điền đủ bảng ở Phần 0 (đặc biệt
   cách đăng nhập control panel nhà cung cấp VPS) để người khác có thể xử lý nếu cần.
