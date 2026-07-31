// scripts/gen-lessons.mjs
// Sinh 1000 bài hội thoại song ngữ Anh-Việt bằng Claude API.
// Chạy từng bước:
//   1. Đặt API key:  export ANTHROPIC_API_KEY=sk-ant-...
//   2. Sinh bài học: node scripts/gen-lessons.mjs
//   3. Tạo chunks:   node scripts/split-lessons.mjs
//
// Tùy chọn:
//   --from  101   bắt đầu từ id bài này (mặc định: bài đầu chưa có nội dung AI)
//   --to    200   kết thúc ở id bài này (mặc định: 1000)
//   --batch 5     số bài sinh song song (mặc định: 3, tăng nếu rate limit cho phép)
//   --model claude-sonnet-4-6  (mặc định: claude-sonnet-4-6 cho chất lượng cao)
//
// Script tự lưu sau mỗi bài → có thể Ctrl+C và chạy lại, không mất bài đã sinh.

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LESSONS_FILE = path.join(ROOT, 'apps/english/src/data/lessons.json')

// ── Đọc tham số ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function arg(name, def) {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : def
}

const FROM = parseInt(arg('--from', '101'))
const TO = parseInt(arg('--to', '1000'))
const BATCH = parseInt(arg('--batch', '2'))
const MODEL = arg('--model', 'claude-opus-4-8')
const TURNS = 50

// ── Đọc bài hiện có ──────────────────────────────────────────────────────────
let lessons = fs.existsSync(LESSONS_FILE) ? JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8')) : []

// Phát hiện bài đã có nội dung AI (phân biệt với template bằng marker)
const aiDoneIds = new Set(lessons.filter((l) => l._aiGenerated === true).map((l) => l.id))

console.log(`📚 Đang đọc lessons.json: ${lessons.length} bài`)
console.log(`✅ Đã có AI content: ${aiDoneIds.size} bài`)
console.log(`🎯 Sẽ sinh bài ${FROM}-${TO} (bỏ qua bài đã có AI content)`)
console.log(`🤖 Model: ${MODEL} | Batch: ${BATCH} song song`)
console.log()

// ── 1000 chủ đề ──────────────────────────────────────────────────────────────
const TOPICS = {
  101: {
    title: 'Đặt lịch hẹn qua điện thoại',
    situation: 'Minh gọi điện đặt lịch hẹn với bác sĩ.',
    aName: 'Minh',
    bName: 'Lễ tân phòng khám',
    aG: 'male',
    bG: 'female',
  },
  102: {
    title: 'Thuê xe máy',
    situation: 'Hoa muốn thuê xe máy đi thăm quan thành phố.',
    aName: 'Hoa',
    bName: 'Chủ tiệm cho thuê xe',
    aG: 'female',
    bG: 'male',
  },
  103: {
    title: 'Gọi thợ sửa điện nước',
    situation: 'Anh Tuấn gọi thợ đến sửa vòi nước bị hỏng.',
    aName: 'Anh Tuấn',
    bName: 'Thợ sửa chữa',
    aG: 'male',
    bG: 'male',
  },
  104: {
    title: 'Mua vé tàu hỏa',
    situation: 'Lan mua vé tàu từ Hà Nội đi Đà Nẵng.',
    aName: 'Lan',
    bName: 'Nhân viên bán vé',
    aG: 'female',
    bG: 'female',
  },
  105: {
    title: 'Nhờ hàng xóm trông nhà',
    situation: 'Chị Mai nhờ hàng xóm trông nhà khi đi du lịch.',
    aName: 'Chị Mai',
    bName: 'Chị Hằng',
    aG: 'female',
    bG: 'female',
  },
  106: {
    title: 'Đổi tiền ngoại tệ',
    situation: 'Khách du lịch đổi đô la sang tiền Việt tại ngân hàng.',
    aName: 'David',
    bName: 'Nhân viên ngân hàng',
    aG: 'male',
    bG: 'female',
  },
  107: {
    title: 'Mua sắm ở chợ truyền thống',
    situation: 'Sarah mua rau và thịt tươi ở chợ Bến Thành.',
    aName: 'Sarah',
    bName: 'Người bán hàng',
    aG: 'female',
    bG: 'female',
  },
  108: {
    title: 'Xin giấy phép lái xe',
    situation: 'Anh Hùng đến trung tâm đăng kiểm để làm bằng lái.',
    aName: 'Anh Hùng',
    bName: 'Nhân viên trung tâm',
    aG: 'male',
    bG: 'male',
  },
  109: {
    title: 'Đăng ký thẻ thư viện',
    situation: 'Sinh viên Phương đăng ký thẻ mượn sách ở thư viện trường.',
    aName: 'Phương',
    bName: 'Thủ thư',
    aG: 'female',
    bG: 'female',
  },
  110: {
    title: 'Khiếu nại sản phẩm lỗi',
    situation: 'Khách hàng mang laptop bị lỗi đến cửa hàng để đổi trả.',
    aName: 'Anh Bình',
    bName: 'Nhân viên bảo hành',
    aG: 'male',
    bG: 'female',
  },
  111: {
    title: 'Hỏi về khóa học tiếng Anh',
    situation: 'Thúy hỏi về các khóa học tại trung tâm ngoại ngữ.',
    aName: 'Thúy',
    bName: 'Tư vấn viên',
    aG: 'female',
    bG: 'female',
  },
  112: {
    title: 'Thuê phòng trọ',
    situation: 'Sinh viên Khoa xem phòng trọ và hỏi về giá và điều kiện.',
    aName: 'Khoa',
    bName: 'Chủ nhà trọ',
    aG: 'male',
    bG: 'male',
  },
  113: {
    title: 'Mở tài khoản ngân hàng',
    situation: 'Hà mở tài khoản ngân hàng lần đầu tiên.',
    aName: 'Hà',
    bName: 'Nhân viên ngân hàng',
    aG: 'female',
    bG: 'male',
  },
  114: {
    title: 'Đặt tiệc sinh nhật',
    situation: 'Anh Đức đặt bàn tiệc sinh nhật cho vợ tại nhà hàng sang.',
    aName: 'Anh Đức',
    bName: 'Quản lý nhà hàng',
    aG: 'male',
    bG: 'female',
  },
  115: {
    title: 'Thói quen ăn uống lành mạnh',
    situation: 'Hai người bạn thảo luận về chế độ ăn uống khoa học.',
    aName: 'Linh',
    bName: 'Trang',
    aG: 'female',
    bG: 'female',
  },
  116: {
    title: 'Xin nghỉ phép',
    situation: 'Nhân viên Hải xin trưởng phòng cho nghỉ phép một tuần.',
    aName: 'Hải',
    bName: 'Trưởng phòng',
    aG: 'male',
    bG: 'male',
  },
  117: {
    title: 'Hỏi đường đến bảo tàng',
    situation: 'Khách nước ngoài hỏi đường đến Bảo tàng Hồ Chí Minh.',
    aName: 'Tom',
    bName: 'Người dân địa phương',
    aG: 'male',
    bG: 'female',
  },
  118: {
    title: 'Gửi bưu kiện nước ngoài',
    situation: 'Chị Nga gửi quà tặng cho người thân đang ở nước ngoài.',
    aName: 'Chị Nga',
    bName: 'Nhân viên bưu điện',
    aG: 'female',
    bG: 'male',
  },
  119: {
    title: 'Mua bảo hiểm xe máy',
    situation: 'Anh Minh mua bảo hiểm bắt buộc cho xe máy mới mua.',
    aName: 'Anh Minh',
    bName: 'Nhân viên bảo hiểm',
    aG: 'male',
    bG: 'female',
  },
  120: {
    title: 'Du lịch ba lô tiết kiệm',
    situation: 'Hai du khách trao đổi kinh nghiệm đi phượt tiết kiệm.',
    aName: 'Nam',
    bName: 'Emma',
    aG: 'male',
    bG: 'female',
  },
  121: {
    title: 'Kế hoạch đám cưới',
    situation: 'Cặp đôi thảo luận với nhau về kế hoạch tổ chức đám cưới.',
    aName: 'Minh',
    bName: 'Lan',
    aG: 'male',
    bG: 'female',
  },
  122: {
    title: 'Giúp con học bài',
    situation: 'Bố ngồi giúp con giải bài tập môn Toán lớp 5.',
    aName: 'Bố',
    bName: 'Con trai',
    aG: 'male',
    bG: 'male',
  },
  123: {
    title: 'Chọn nghề nghiệp tương lai',
    situation: 'Sinh viên năm cuối trao đổi với mẹ về định hướng nghề nghiệp.',
    aName: 'Mẹ',
    bName: 'Con gái',
    aG: 'female',
    bG: 'female',
  },
  124: {
    title: 'Giải quyết mâu thuẫn anh em',
    situation: 'Hai anh em giải quyết bất đồng về tài sản thừa kế.',
    aName: 'Anh Hai',
    bName: 'Em Trai',
    aG: 'male',
    bG: 'male',
  },
  125: {
    title: 'Thăm bạn bị ốm nằm viện',
    situation: 'Nhóm bạn thân đến thăm người bạn đang điều trị tại bệnh viện.',
    aName: 'Hoa',
    bName: 'Trang',
    aG: 'female',
    bG: 'female',
  },
  126: {
    title: 'Chuẩn bị đón Tết Nguyên Đán',
    situation: 'Cả gia đình ngồi bàn về kế hoạch mua sắm và chuẩn bị Tết.',
    aName: 'Mẹ',
    bName: 'Con trai',
    aG: 'female',
    bG: 'male',
  },
  127: {
    title: 'Chia sẻ về áp lực công việc',
    situation: 'Hai người bạn thân nói chuyện về stress và áp lực nghề nghiệp.',
    aName: 'Khoa',
    bName: 'Tuấn',
    aG: 'male',
    bG: 'male',
  },
  128: {
    title: 'Xin lỗi vì quên ngày kỷ niệm',
    situation: 'Nam xin lỗi bạn gái vì đã quên mất ngày kỷ niệm 1 năm yêu.',
    aName: 'Nam',
    bName: 'Linh',
    aG: 'male',
    bG: 'female',
  },
  129: {
    title: 'Bàn về nuôi chó hay mèo',
    situation: 'Vợ chồng tranh luận nhẹ về việc nên nuôi chó hay mèo.',
    aName: 'Chồng',
    bName: 'Vợ',
    aG: 'male',
    bG: 'female',
  },
  130: {
    title: 'Tư vấn chuyện tình cảm cho bạn',
    situation: 'Hoa giúp người bạn thân xử lý tình huống khó khăn trong tình yêu.',
    aName: 'Hoa',
    bName: 'Thảo',
    aG: 'female',
    bG: 'female',
  },
  131: {
    title: 'Khám sức khỏe tổng quát',
    situation: 'Chị Lan đến khám sức khỏe định kỳ hàng năm.',
    aName: 'Bác sĩ',
    bName: 'Bệnh nhân Lan',
    aG: 'male',
    bG: 'female',
  },
  132: {
    title: 'Hỏi bác sĩ về tác dụng phụ thuốc',
    situation: 'Bệnh nhân hỏi về tác dụng phụ của thuốc vừa được kê.',
    aName: 'Anh Hùng',
    bName: 'Bác sĩ',
    aG: 'male',
    bG: 'female',
  },
  133: {
    title: 'Tư vấn dinh dưỡng cho người tiểu đường',
    situation: 'Chuyên gia dinh dưỡng tư vấn chế độ ăn cho bệnh nhân tiểu đường.',
    aName: 'Chuyên gia dinh dưỡng',
    bName: 'Bệnh nhân',
    aG: 'female',
    bG: 'male',
  },
  134: {
    title: 'Chuẩn bị tâm lý trước phẫu thuật',
    situation: 'Bệnh nhân hỏi bác sĩ về ca phẫu thuật sắp tới.',
    aName: 'Bác sĩ phẫu thuật',
    bName: 'Bệnh nhân',
    aG: 'male',
    bG: 'female',
  },
  135: {
    title: 'Gặp nhà tâm lý lần đầu',
    situation: 'Người trẻ lần đầu tới gặp nhà tâm lý học để tư vấn.',
    aName: 'Nhà tâm lý học',
    bName: 'Phương',
    aG: 'female',
    bG: 'female',
  },
  136: {
    title: 'Hỏi dược sĩ về thuốc cảm cúm',
    situation: 'Khách hàng hỏi dược sĩ về thuốc phù hợp cho triệu chứng cảm cúm.',
    aName: 'Khách hàng',
    bName: 'Dược sĩ',
    aG: 'female',
    bG: 'female',
  },
  137: {
    title: 'Buổi tập gym đầu tiên',
    situation: 'Huấn luyện viên hướng dẫn học viên mới tập luyện tại gym.',
    aName: 'Huấn luyện viên',
    bName: 'Học viên mới',
    aG: 'male',
    bG: 'female',
  },
  138: {
    title: 'Hỏi HR về bảo hiểm y tế công ty',
    situation: 'Nhân viên mới hỏi phòng nhân sự về quyền lợi bảo hiểm y tế.',
    aName: 'Nhân viên mới',
    bName: 'Nhân sự HR',
    aG: 'female',
    bG: 'female',
  },
  139: {
    title: 'Nhổ răng khôn tại nha khoa',
    situation: 'Bệnh nhân đến nha khoa để nhổ chiếc răng khôn gây đau.',
    aName: 'Nha sĩ',
    bName: 'Bệnh nhân',
    aG: 'male',
    bG: 'female',
  },
  140: {
    title: 'Lớp yoga và lợi ích thiền định',
    situation: 'Giáo viên yoga giải thích về lợi ích của thiền định cho học viên.',
    aName: 'Giáo viên yoga',
    bName: 'Học viên',
    aG: 'female',
    bG: 'male',
  },
  141: {
    title: 'Chuẩn bị thi đại học',
    situation: 'Học sinh cuối cấp hỏi giáo viên về chiến lược ôn thi đại học.',
    aName: 'Học sinh Nam',
    bName: 'Giáo viên',
    aG: 'male',
    bG: 'female',
  },
  142: {
    title: 'Xin học bổng Fulbright',
    situation: 'Sinh viên hỏi cố vấn cách xin học bổng Fulbright đi Mỹ.',
    aName: 'Sinh viên Thảo',
    bName: 'Cố vấn học thuật',
    aG: 'female',
    bG: 'male',
  },
  143: {
    title: 'Chuẩn bị bài thuyết trình nhóm',
    situation: 'Nhóm sinh viên họp chuẩn bị bài thuyết trình cuối kỳ.',
    aName: 'Nhóm trưởng Minh',
    bName: 'Thành viên Hà',
    aG: 'male',
    bG: 'female',
  },
  144: {
    title: 'Gặp giáo sư hướng dẫn luận văn',
    situation: 'Sinh viên thảo luận tiến độ luận văn với giáo sư hướng dẫn.',
    aName: 'Sinh viên',
    bName: 'Giáo sư',
    aG: 'female',
    bG: 'male',
  },
  145: {
    title: 'Đăng ký môn học đại học',
    situation: 'Sinh viên năm nhất hỏi giáo vụ về cách đăng ký môn học.',
    aName: 'Sinh viên',
    bName: 'Nhân viên giáo vụ',
    aG: 'female',
    bG: 'female',
  },
  146: {
    title: 'Bí quyết học hiệu quả',
    situation: 'Hai bạn sinh viên chia sẻ phương pháp học tập hiệu quả.',
    aName: 'Huy',
    bName: 'Linh',
    aG: 'male',
    bG: 'female',
  },
  147: {
    title: 'Phỏng vấn thực tập IT',
    situation: 'Sinh viên CNTT phỏng vấn xin thực tập tại công ty công nghệ.',
    aName: 'Sinh viên Khoa',
    bName: 'Nhà tuyển dụng',
    aG: 'male',
    bG: 'female',
  },
  148: {
    title: 'Hỏi về chương trình trao đổi sinh viên',
    situation: 'Sinh viên hỏi văn phòng quốc tế về chương trình trao đổi.',
    aName: 'Sinh viên Vân',
    bName: 'Nhân viên văn phòng quốc tế',
    aG: 'female',
    bG: 'female',
  },
  149: {
    title: 'Học tiếng Anh 1-1 với giáo viên nước ngoài',
    situation: 'Học viên học tiếng Anh online với giáo viên người Mỹ.',
    aName: 'Học viên Mai',
    bName: 'Giáo viên Michael',
    aG: 'female',
    bG: 'male',
  },
  150: {
    title: 'Nhóm đọc sách: thảo luận tác phẩm',
    situation: 'Hai thành viên nhóm đọc sách chia sẻ cảm nhận sau khi đọc.',
    aName: 'Thành',
    bName: 'Nga',
    aG: 'male',
    bG: 'female',
  },
  151: {
    title: 'Check-in khách sạn 5 sao',
    situation: 'Khách quốc tế check-in tại khách sạn sang trọng ở Hà Nội.',
    aName: 'Khách hàng',
    bName: 'Lễ tân khách sạn',
    aG: 'male',
    bG: 'female',
  },
  152: {
    title: 'Thuê hướng dẫn viên du lịch Hội An',
    situation: 'Nhóm du khách thuê hướng dẫn viên thăm phố cổ Hội An.',
    aName: 'Hướng dẫn viên Linh',
    bName: 'Khách John',
    aG: 'female',
    bG: 'male',
  },
  153: {
    title: 'Đặt tour Phú Quốc',
    situation: 'Khách hàng đặt tour nghỉ dưỡng Phú Quốc 4 ngày 3 đêm.',
    aName: 'Khách hàng',
    bName: 'Nhân viên công ty du lịch',
    aG: 'female',
    bG: 'female',
  },
  154: {
    title: 'Xin visa du lịch Châu Âu',
    situation: 'Người Việt hỏi đại sứ quán về thủ tục xin visa Schengen.',
    aName: 'Chị Lan',
    bName: 'Nhân viên đại sứ quán',
    aG: 'female',
    bG: 'male',
  },
  155: {
    title: 'Phàn nàn về phòng khách sạn',
    situation: 'Khách phàn nàn với lễ tân về điều hòa không khí bị hỏng.',
    aName: 'Khách hàng',
    bName: 'Lễ tân khách sạn',
    aG: 'male',
    bG: 'female',
  },
  156: {
    title: 'Mua đồ thủ công mỹ nghệ Hà Nội',
    situation: 'Khách nước ngoài mua đồ thủ công mỹ nghệ ở phố cổ Hà Nội.',
    aName: 'Sarah',
    bName: 'Người bán hàng',
    aG: 'female',
    bG: 'female',
  },
  157: {
    title: 'Trải nghiệm cáp treo Fansipan',
    situation: 'Du khách hỏi nhân viên về tuyến cáp treo lên đỉnh Fansipan.',
    aName: 'Du khách',
    bName: 'Nhân viên khu du lịch',
    aG: 'female',
    bG: 'male',
  },
  158: {
    title: 'Chia sẻ kỷ niệm du lịch đáng nhớ',
    situation: 'Hai đồng nghiệp kể cho nhau nghe về chuyến đi du lịch ấn tượng nhất.',
    aName: 'Hoa',
    bName: 'Tú',
    aG: 'female',
    bG: 'male',
  },
  159: {
    title: 'Xử lý hành lý bị thất lạc',
    situation: 'Hành khách báo cáo vali bị thất lạc với nhân viên hàng không.',
    aName: 'Hành khách',
    bName: 'Nhân viên hàng không',
    aG: 'male',
    bG: 'female',
  },
  160: {
    title: 'Khám phá sự khác biệt văn hóa',
    situation: 'Người Việt và người nước ngoài trao đổi về sự khác biệt văn hóa.',
    aName: 'Minh',
    bName: 'Emma',
    aG: 'male',
    bG: 'female',
  },
  161: {
    title: 'Họp tiến độ dự án',
    situation: 'Trưởng nhóm dẫn dắt cuộc họp hàng tuần về tiến độ dự án.',
    aName: 'Trưởng nhóm Hùng',
    bName: 'Thành viên Thảo',
    aG: 'male',
    bG: 'female',
  },
  162: {
    title: 'Viết email chuyên nghiệp cho khách hàng',
    situation: 'Nhân viên nhờ đồng nghiệp người nước ngoài kiểm tra email.',
    aName: 'Hà',
    bName: 'Đồng nghiệp Tom',
    aG: 'female',
    bG: 'male',
  },
  163: {
    title: 'Đàm phán điều khoản hợp đồng',
    situation: 'Đại diện hai công ty ngồi đàm phán chi tiết hợp đồng hợp tác.',
    aName: 'Giám đốc Minh',
    bName: 'Đối tác David',
    aG: 'male',
    bG: 'male',
  },
  164: {
    title: 'Báo cáo doanh số quý với sếp',
    situation: 'Nhân viên kinh doanh báo cáo kết quả quý vừa rồi với giám đốc.',
    aName: 'Nhân viên Phương',
    bName: 'Giám đốc',
    aG: 'female',
    bG: 'male',
  },
  165: {
    title: 'Phỏng vấn tuyển Marketing Manager',
    situation: 'HR phỏng vấn ứng viên cho vị trí Trưởng phòng Marketing.',
    aName: 'HR Lan',
    bName: 'Ứng viên',
    aG: 'female',
    bG: 'male',
  },
  166: {
    title: 'Xử lý khiếu nại khách hàng khó tính',
    situation: 'Nhân viên CSKH xử lý tình huống phàn nàn từ khách hàng.',
    aName: 'CSKH Hoa',
    bName: 'Khách hàng',
    aG: 'female',
    bG: 'male',
  },
  167: {
    title: 'Trình bày chiến lược marketing mới',
    situation: 'Nhân viên đề xuất chiến lược marketing sáng tạo với sếp.',
    aName: 'Nhân viên Tuấn',
    bName: 'Giám đốc marketing',
    aG: 'male',
    bG: 'female',
  },
  168: {
    title: 'Phân công nhiệm vụ dự án mới',
    situation: 'Trưởng nhóm họp để phân công công việc cho dự án vừa được nhận.',
    aName: 'Trưởng nhóm',
    bName: 'Thành viên',
    aG: 'female',
    bG: 'male',
  },
  169: {
    title: 'Đề xuất tăng lương',
    situation: 'Nhân viên gặp sếp để đề xuất tăng lương sau 2 năm cống hiến.',
    aName: 'Nhân viên Hải',
    bName: 'Trưởng phòng',
    aG: 'male',
    bG: 'female',
  },
  170: {
    title: 'Hướng dẫn nhân viên mới nhập việc',
    situation: 'Nhân viên kỳ cựu hướng dẫn nhân viên mới làm quen với công việc.',
    aName: 'Nhân viên cũ Nga',
    bName: 'Nhân viên mới',
    aG: 'female',
    bG: 'male',
  },
  171: {
    title: 'Tư vấn mua smartphone mới',
    situation: 'Khách hàng hỏi nhân viên về các mẫu smartphone mới nhất.',
    aName: 'Khách hàng',
    bName: 'Nhân viên bán hàng',
    aG: 'male',
    bG: 'female',
  },
  172: {
    title: 'Hướng dẫn cài app ngân hàng',
    situation: 'Người dùng nhờ bạn bè hướng dẫn cài đặt ứng dụng ngân hàng mobile.',
    aName: 'Người dùng',
    bName: 'Bạn hỗ trợ kỹ thuật',
    aG: 'female',
    bG: 'male',
  },
  173: {
    title: 'Gọi hotline kỹ thuật khi máy tính lỗi',
    situation: 'Người dùng gọi hotline kỹ thuật khi máy tính bị treo không mở được.',
    aName: 'Người dùng',
    bName: 'Kỹ thuật viên hỗ trợ',
    aG: 'female',
    bG: 'male',
  },
  174: {
    title: 'Khiếu nại đơn hàng online bị trễ',
    situation: 'Người mua hỏi CSKH về đơn hàng đặt trên Shopee bị trễ một tuần.',
    aName: 'Người mua',
    bName: 'CSKH online',
    aG: 'female',
    bG: 'female',
  },
  175: {
    title: 'Khôi phục tài khoản mạng xã hội bị hack',
    situation: 'Người dùng báo cáo tài khoản Facebook bị hack và xin hỗ trợ.',
    aName: 'Người dùng',
    bName: 'Hỗ trợ kỹ thuật',
    aG: 'male',
    bG: 'female',
  },
  176: {
    title: 'Đặt hàng thiết kế website',
    situation: 'Khách hàng trao đổi yêu cầu thiết kế website bán hàng với lập trình viên.',
    aName: 'Khách hàng',
    bName: 'Lập trình viên freelance',
    aG: 'female',
    bG: 'male',
  },
  177: {
    title: 'Ứng dụng AI trong công việc văn phòng',
    situation: 'Hai đồng nghiệp chia sẻ cách dùng AI để làm việc hiệu quả hơn.',
    aName: 'Nhân viên Hà',
    bName: 'Đồng nghiệp Minh',
    aG: 'female',
    bG: 'male',
  },
  178: {
    title: 'Ảnh hưởng của TikTok đến giới trẻ',
    situation: 'Hai bạn trẻ thảo luận về tác động tích cực và tiêu cực của TikTok.',
    aName: 'Lan',
    bName: 'Huy',
    aG: 'female',
    bG: 'male',
  },
  179: {
    title: 'Lộ trình học lập trình cho người mới',
    situation: 'Người mới bắt đầu hỏi lập trình viên kinh nghiệm về cách bắt đầu.',
    aName: 'Người học',
    bName: 'Lập trình viên kinh nghiệm',
    aG: 'female',
    bG: 'male',
  },
  180: {
    title: 'Bí quyết livestream bán hàng hiệu quả',
    situation: 'Người bán hàng online học cách làm livestream thu hút khách mua.',
    aName: 'Người bán',
    bName: 'Chuyên gia thương mại điện tử',
    aG: 'female',
    bG: 'male',
  },
}

// Hàm tạo topic động cho id chưa có trong TOPICS
function makeTopic(id) {
  if (TOPICS[id]) return TOPICS[id]
  const list = [
    'Học nấu phở bò',
    'Làm bánh mì Việt Nam',
    'Pha cà phê phin truyền thống',
    'Học làm nem cuốn',
    'Nấu bún bò Huế',
    'Đăng ký lớp bơi lội',
    'Tập bóng đá cuối tuần',
    'Học đánh cầu lông',
    'Tham gia câu lạc bộ chạy bộ',
    'Đăng ký giải marathon 5km',
    'Mua vé xem phim rạp',
    'Đi xem concert nhạc',
    'Thăm triển lãm nghệ thuật',
    'Chơi board game cùng nhóm bạn',
    'Xem kịch sân khấu lần đầu',
    'Tư vấn phối đồ thời trang',
    'Mua giày sneaker giới hạn',
    'Tìm áo dài truyền thống may đo',
    'Mua đồ công sở thanh lịch',
    'Chọn quà tặng sinh nhật',
    'Bảo vệ môi trường biển',
    'Phân loại rác tái chế tại nhà',
    'Trồng rau sạch tại nhà',
    'Tiết kiệm điện và nước',
    'Chăm sóc vườn cây cảnh',
    'Phát triển ứng dụng mobile',
    'Thiết kế giao diện người dùng UX/UI',
    'Phân tích dữ liệu kinh doanh',
    'An ninh mạng và bảo mật thông tin',
    'Điện toán đám mây AWS',
    'Điều trị đau lưng mãn tính',
    'Phục hồi chức năng sau tai nạn',
    'Chăm sóc người cao tuổi tại nhà',
    'Y học cổ truyền và châm cứu',
    'Tư vấn sức khỏe sinh sản',
    'Dạy học trực tuyến hiệu quả',
    'Phương pháp giáo dục Montessori',
    'Chương trình học STEM cho trẻ em',
    'Đào tạo kỹ năng mềm nhân viên',
    'Coaching phát triển sự nghiệp',
    'Quản lý đội nhóm hiệu quả',
    'Xây dựng chiến lược kinh doanh',
    'Digital marketing và SEO',
    'Quản lý chuỗi cung ứng',
    'Phân tích báo cáo tài chính',
    'Di chuyển bằng xe buýt điện',
    'Mua nhà chung cư lần đầu',
    'Sống xanh trong đô thị',
    'Giảm ô nhiễm không khí đô thị',
    'Tìm bãi đỗ xe thông minh',
    'Gọi cấp cứu y tế 115',
    'Báo cháy cho đội cứu hỏa',
    'Sơ cứu người bị tai nạn giao thông',
    'Báo cáo trộm cắp với công an',
    'Liên hệ đại sứ quán khi gặp nạn',
    'Đặt phòng Airbnb qua ứng dụng',
    'Phàn nàn về phòng cho thuê ồn ào',
    'Tìm căn hộ dịch vụ ngắn hạn',
    'Thỏa thuận gia hạn hợp đồng thuê nhà',
    'Mua xe ô tô điện mới',
    'Đăng ký học tiếng Hàn Quốc cơ bản',
    'Ôn luyện IELTS Speaking',
    'Thực hành Writing Task 2',
    'Luyện thi TOEFL iBT',
    'Nói về phim yêu thích bằng tiếng Anh',
    'Bàn về âm nhạc truyền thống Việt Nam',
    'Thảo luận về thể thao điện tử esports',
    'Chia sẻ niềm đam mê nhiếp ảnh',
    'Kết bạn với người nước ngoài tại Việt Nam',
    'Giới thiệu văn hóa Việt Nam cho bạn bè quốc tế',
    'Mua đặc sản Tết về quê',
    'Chọn hoa tươi tặng dịp 8/3',
    'Đặt bánh kem sinh nhật tùy chỉnh',
    'Mua phụ kiện trang trí nhà dịp Tết',
    'Tham quan triển lãm xe hơi',
    'Hỏi thông tin xe điện VinFast',
    'Sửa xe ô tô tại gara uy tín',
    'Đổi lốp xe và kiểm tra phanh',
    'Mua vé máy bay giá rẻ dịp lễ',
    'Đổi vé máy bay khi thay đổi lịch',
    'Hỏi quy định hành lý máy bay',
    'Thuê xe tự lái du lịch',
    'Trải nghiệm xe đạp đô thị',
    'Học cách pha cocktail cơ bản',
    'Tìm hiểu về rượu vang Đà Lạt',
    'Thưởng thức cà phê đặc sản Buôn Mê Thuột',
    'Tham gia lễ hội cà phê',
    'Tìm hiểu lịch sử Hà Nội',
    'Thăm Văn Miếu Quốc Tử Giám',
    'Khám phá di sản văn hóa Huế',
    'Học về phong tục cưới hỏi Việt Nam',
    'Tham gia lễ hội Trung Thu',
    'Thỏa thuận với nhà thầu xây dựng',
    'Kiểm tra tiến độ công trình',
    'Chọn vật liệu xây nhà chất lượng',
    'Thiết kế phòng ngủ hiện đại',
    'Lắp đặt hệ thống điện thông minh',
    'Thảo luận về năng lượng mặt trời',
    'Học về xe đạp điện tiết kiệm',
    'Chăm sóc thú cưng bị ốm',
    'Tiêm phòng cho chó mèo',
    'Tìm thú cưng bị lạc',
    'Học làm vườn rau hữu cơ',
    'Nuôi cá koi trong hồ',
    'Đặt lịch xét nghiệm máu',
    'Nhận kết quả xét nghiệm từ bác sĩ',
    'Hỏi về lịch tiêm vaccine COVID',
    'Học chơi đàn guitar từ đầu',
    'Tham gia ban nhạc acoustic',
    'Học hát karaoke chuẩn chỉnh',
    'Mua đàn piano điện',
    'Thực tập tại bệnh viện',
    'Thực tập tại công ty luật',
    'Thực tập tại startup',
    'Phát triển kỹ năng leadership',
    'Lập kế hoạch 5 năm sự nghiệp',
    'Đọc sách tự phát triển bản thân',
    'Thảo luận bình đẳng giới nơi làm việc',
    'Bảo vệ quyền lợi người tiêu dùng',
    'Giúp đỡ người vô gia cư',
    'Tìm hiểu Phật giáo Việt Nam',
    'Nói về truyền thống thờ cúng tổ tiên',
    'Mua đồ nội thất Scandinavian',
    'Trang trí nhà dịp Noel',
    'Chọn màu sơn tường hợp phong thủy',
    'Xem bóng đá cùng nhóm bạn',
    'Phân tích chiến thuật đội tuyển Việt Nam',
    'Đặt cược dự đoán bóng đá (hợp pháp)',
    'Tham gia nhóm đọc sách thiếu nhi',
    'Thảo luận tiểu thuyết lịch sử Việt Nam',
    'Bàn về truyện ngắn đoạt giải',
    'Học múa hip hop từ YouTube',
    'Tham gia lớp Zumba buổi sáng',
    'Luyện tập Taekwondo',
    'Đặt vé visa điện tử vào Việt Nam',
    'Làm thủ tục visa tại cửa khẩu',
    'Tìm nhà sách Phương Nam',
    'Mua sách giáo khoa đầu năm học',
    'Đặt sách hiếm qua mạng',
    'Cắt tóc và tư vấn kiểu tóc',
    'Nhuộm tóc ombre tại salon',
    'Làm nail nghệ thuật',
    'Chọn tour Tây Bắc mùa lúa chín',
    'Đặt tour miền Tây khám phá sông nước',
    'Hỏi về tour Côn Đảo lặn ngắm san hô',
    'Tư vấn pháp lý tranh chấp đất đai',
    'Làm hợp đồng mua bán nhà đất',
    'Chuyển nhượng quyền sử dụng đất',
    'Tập aerobic giảm mỡ bụng',
    'Mua dụng cụ tập yoga tại nhà',
    'Hỏi về ứng dụng theo dõi sức khỏe',
    'Lập kế hoạch kinh doanh nhỏ',
    'Tư vấn mở quán cà phê',
    'Đăng ký kinh doanh hộ cá thể',
    'Xin vốn vay khởi nghiệp',
    'Hỏi về giấy phép kinh doanh F&B',
    'Tuyển dụng nhân viên bán hàng part-time',
    'Phỏng vấn thực tập sinh marketing',
    'Đặt lịch photoshoot chân dung',
    'Thuê nhiếp ảnh gia chụp đám cưới',
    'Hỏi về dịch vụ in ảnh canvas',
    'Thiết kế logo và nhận diện thương hiệu',
    'Đặt in standee và banner quảng cáo',
    'Hỏi về dịch vụ quảng cáo Google Ads',
    'Chạy Facebook Ads lần đầu',
    'Hỏi về influencer marketing',
    'Quản lý fanpage doanh nghiệp',
    'Tạo content cho Instagram',
    'Viết caption hấp dẫn',
    'Lên kế hoạch content marketing',
    'Hỏi về email marketing',
    'Tư vấn SEO cho website',
    'Chăm sóc da mặt tại spa',
    'Massage thư giãn cuối tuần',
    'Tư vấn chọn mỹ phẩm phù hợp',
    'Học trang điểm cơ bản',
    'Hỏi về phẫu thuật thẩm mỹ',
    'Học nấu lẩu Thái cay',
    'Làm bánh crepe tại nhà',
    'Pha chế bubble tea',
    'Học làm sushi cơ bản',
    'Nấu mì Ý carbonara',
    'Thuê xưởng sản xuất nhỏ',
    'Hỏi về dịch vụ logistics giao hàng',
    'Đặt container xuất khẩu',
    'Hỏi về thủ tục hải quan',
    'Tư vấn import hàng từ Trung Quốc',
    'Đăng ký sàn thương mại điện tử',
    'Hỏi về chính sách hoàn tiền Lazada',
    'Tư vấn dropshipping',
    'Mở gian hàng trên Shopee Mall',
    'Xử lý đánh giá 1 sao',
    'Phát triển app mobile đặt đồ ăn',
    'Xây dựng hệ thống quản lý kho',
    'Lập trình website bán vé sự kiện',
    'Tư vấn chuyển đổi số doanh nghiệp',
    'Hỏi về phần mềm kế toán',
    'Khai thuế VAT hàng tháng',
    'Lập báo cáo thuế thu nhập doanh nghiệp',
    'Kiểm toán nội bộ cuối năm',
    'Hỏi về ưu đãi thuế cho startup',
    'Xin hoàn thuế thu nhập cá nhân',
  ]
  const namePool = [
    ['Lan', 'Nam'],
    ['Hoa', 'Minh'],
    ['Thảo', 'Tuấn'],
    ['Linh', 'Khoa'],
    ['Sarah', 'Tom'],
    ['Mai', 'Hùng'],
    ['Phương', 'Đức'],
    ['Emma', 'David'],
  ]
  const gPool = [
    ['female', 'male'],
    ['male', 'female'],
    ['female', 'female'],
    ['male', 'male'],
  ]
  const t = list[(id - 181) % list.length]
  const [aName, bName] = namePool[id % namePool.length]
  const [aG, bG] = gPool[id % gPool.length]
  return { title: t, situation: `Tình huống giao tiếp thực tế: ${t}.`, aName, bName, aG, bG }
}

// ── Client ────────────────────────────────────────────────────────────────────
const client = new Anthropic()

// ── Sinh 1 bài ───────────────────────────────────────────────────────────────
// Mỗi chủ đề có cấu trúc hội thoại riêng để tránh lặp
const CONVERSATION_STRUCTURES = [
  'Mở đầu bằng câu hỏi → khám phá vấn đề → giải quyết → kết thúc tích cực',
  'Mở đầu bằng lời chào → trình bày nhu cầu → thảo luận phương án → đồng ý → chia tay',
  'Mở đầu bằng sự cố/vấn đề → phân tích nguyên nhân → đề xuất giải pháp → kế hoạch hành động',
  'Mở đầu bằng gặp gỡ → chia sẻ kinh nghiệm → trao đổi ý kiến → học được điều mới → hẹn gặp lại',
  'Mở đầu bằng yêu cầu thông tin → hỏi đáp chi tiết → so sánh lựa chọn → quyết định → xác nhận',
  'Mở đầu bằng tình huống khẩn cấp → xử lý nhanh → bình tĩnh lại → giải quyết từng bước → tổng kết',
  'Mở đầu bằng hiểu lầm nhỏ → làm rõ → thông cảm → hợp tác → kết quả tốt',
  'Mở đầu bằng đề xuất ý tưởng → phản hồi → cải thiện ý tưởng → lập kế hoạch → cam kết thực hiện',
]

// Từ vựng đặc trưng theo nhóm chủ đề (để đảm bảo mỗi bài có từ vựng riêng)
const VOCAB_SEEDS = {
  medical: [
    'diagnosis',
    'prescription',
    'symptom',
    'treatment',
    'appointment',
    'insurance',
    'specialist',
    'dosage',
    'recovery',
    'checkup',
  ],
  business: [
    'proposal',
    'deadline',
    'budget',
    'stakeholder',
    'milestone',
    'KPI',
    'revenue',
    'negotiation',
    'contract',
    'presentation',
  ],
  travel: [
    'itinerary',
    'accommodation',
    'luggage',
    'departure',
    'destination',
    'reservation',
    'currency',
    'passport',
    'transit',
    'layover',
  ],
  education: [
    'curriculum',
    'assignment',
    'scholarship',
    'graduation',
    'internship',
    'semester',
    'thesis',
    'tuition',
    'enrollment',
    'campus',
  ],
  food: [
    'ingredient',
    'portion',
    'seasoning',
    'appetizer',
    'recipe',
    'cuisine',
    'reservation',
    'menu',
    'dietary',
    'takeaway',
  ],
  tech: [
    'software',
    'debugging',
    'deployment',
    'interface',
    'algorithm',
    'bandwidth',
    'encryption',
    'database',
    'startup',
    'prototype',
  ],
  finance: [
    'investment',
    'portfolio',
    'interest rate',
    'dividend',
    'loan',
    'budget',
    'savings',
    'expenditure',
    'revenue',
    'tax',
  ],
  social: [
    'community',
    'volunteer',
    'campaign',
    'awareness',
    'initiative',
    'support',
    'advocacy',
    'empowerment',
    'inclusion',
    'diversity',
  ],
}

function getVocabSeed(title) {
  const t = title.toLowerCase()
  if (
    t.includes('bác sĩ') ||
    t.includes('sức khỏe') ||
    t.includes('bệnh') ||
    t.includes('thuốc') ||
    t.includes('khám')
  )
    return VOCAB_SEEDS.medical
  if (
    t.includes('kinh doanh') ||
    t.includes('công ty') ||
    t.includes('hợp đồng') ||
    t.includes('doanh số') ||
    t.includes('marketing')
  )
    return VOCAB_SEEDS.business
  if (
    t.includes('du lịch') ||
    t.includes('khách sạn') ||
    t.includes('máy bay') ||
    t.includes('tour') ||
    t.includes('visa')
  )
    return VOCAB_SEEDS.travel
  if (
    t.includes('học') ||
    t.includes('trường') ||
    t.includes('sinh viên') ||
    t.includes('giáo viên') ||
    t.includes('luận văn')
  )
    return VOCAB_SEEDS.education
  if (
    t.includes('ăn') ||
    t.includes('nấu') ||
    t.includes('nhà hàng') ||
    t.includes('món') ||
    t.includes('cafe')
  )
    return VOCAB_SEEDS.food
  if (
    t.includes('app') ||
    t.includes('công nghệ') ||
    t.includes('lập trình') ||
    t.includes('website') ||
    t.includes('ai')
  )
    return VOCAB_SEEDS.tech
  if (
    t.includes('tiền') ||
    t.includes('đầu tư') ||
    t.includes('vay') ||
    t.includes('thuế') ||
    t.includes('ngân hàng')
  )
    return VOCAB_SEEDS.finance
  return null
}

async function generateLesson(id) {
  const meta = makeTopic(id)
  const structure = CONVERSATION_STRUCTURES[id % CONVERSATION_STRUCTURES.length]
  const vocabSeed = getVocabSeed(meta.title)
  const vocabHint = vocabSeed
    ? `\n- Ưu tiên dùng các từ/cụm này (ít nhất 8-10 từ): ${vocabSeed.slice(0, 8).join(', ')}`
    : ''

  const prompt = `Bạn là chuyên gia biên soạn tài liệu học tiếng Anh giao tiếp cho người Việt. Hãy viết một bài hội thoại song ngữ Anh-Việt CHẤT LƯỢNG CAO cho ứng dụng luyện nói.

═══════════════════════════════════════════════
THÔNG TIN BÀI HỌC
═══════════════════════════════════════════════
Chủ đề    : "${meta.title}"
Tình huống: ${meta.situation}
Nhân vật A: ${meta.aName} (${meta.aG === 'female' ? 'nữ' : 'nam'}) — người mở đầu hội thoại
Nhân vật B: ${meta.bName} (${meta.bG === 'female' ? 'nữ' : 'nam'})
Số lượt   : ${TURNS} lượt (xen kẽ A-B, bắt đầu bằng A)

CẤU TRÚC HỘI THOẠI: ${structure}
${vocabSeed ? `\nTỪ VỰNG CỐT LÕI cần xuất hiện tự nhiên trong hội thoại (ít nhất 10 từ): ${vocabSeed.join(', ')}` : ''}

═══════════════════════════════════════════════
TIÊU CHUẨN CHẤT LƯỢNG CAO (BẮT BUỘC)
═══════════════════════════════════════════════

1. TÍNH TỰ NHIÊN — như người thật nói, không phải sách giáo khoa:
   • Dùng contractions: I'm, you've, we'll, isn't it, don't, that's, I'd
   • Phản hồi cảm xúc: "Oh really?", "Wow, that's great!", "I see.", "That makes sense.", "Fair enough."
   • Câu ngắn tự nhiên: "Sure.", "Of course!", "Got it.", "No problem.", "Sounds good."
   • Xen kẽ câu ngắn (3-6 từ) và dài (15-20 từ) — tránh đều đều một nhịp

2. NGÔN NGỮ PHONG PHÚ — không lặp lại cấu trúc:
   • Câu hỏi: đa dạng Yes/No, Wh-, Tag questions ("isn't it?", "right?"), Indirect ("Could you tell me...?")
   • Lối diễn đạt lịch sự, thân mật, hoặc chuyên nghiệp tùy ngữ cảnh
   • Thành ngữ/idiom phù hợp: "at the end of the day", "in a nutshell", "as soon as possible"
   • Cách hỏi thêm thông tin tự nhiên: "By the way...", "Out of curiosity...", "Just to clarify..."

3. TÍNH THỰC TẾ VỀ VĂN HÓA VIỆT NAM:
   • Địa danh, thương hiệu, thói quen tiêu dùng thực tế ở Việt Nam
   • Giá cả, điều kiện sống, môi trường làm việc phù hợp thực tế Việt Nam 2024-2025
   • Tránh ví dụ hoàn toàn Tây phương không liên quan đến người Việt

4. TIẾN TRIỂN CÓ CHIỀU SÂU — 50 lượt phải khai thác đầy đủ chủ đề:
   • 10 lượt đầu: mở đầu, giới thiệu vấn đề/nhu cầu
   • 15 lượt giữa: đào sâu chi tiết, hỏi thêm thông tin, thảo luận phương án
   • 15 lượt tiếp: xử lý tình huống cụ thể, so sánh/đánh giá, quyết định
   • 10 lượt cuối: xác nhận kết quả, cảm ơn, kế hoạch tiếp theo, tạm biệt tự nhiên
   • KHÔNG kết thúc đột ngột ở lượt 30-35; phải đủ 50 lượt

5. BẢN DỊCH TIẾNG VIỆT — không dịch máy, phải chính xác và tự nhiên:
   • Giữ nghĩa tương đương, không dịch từng từ
   • Dùng cách nói tiếng Việt đời thường (không văn chương)
   • Giữ cảm xúc và sắc thái của câu gốc tiếng Anh

6. KHÔNG ĐƯỢC LÀM:
   • KHÔNG mở đầu bằng "Hello!" hoặc "Hi, how can I help you today?"
   • KHÔNG lặp cùng cấu trúc câu quá 2 lần liên tiếp
   • KHÔNG dùng tiếng Anh quá học thuật/cứng nhắc
   • KHÔNG bỏ qua chủ đề — mọi lượt đều phải liên quan đến "${meta.title}"

═══════════════════════════════════════════════
ĐỊNH DẠNG OUTPUT
═══════════════════════════════════════════════
Trả về JSON THUẦN (không có markdown, không có text ngoài JSON, không có \`\`\`):

{
  "id": ${id},
  "title": "${meta.title}",
  "situation": "${meta.situation}",
  "speakerAGender": "${meta.aG}",
  "speakerBGender": "${meta.bG}",
  "speakerAName": {"vi": "${meta.aName}", "en": "${meta.aName}"},
  "speakerBName": {"vi": "${meta.bName}", "en": "${meta.bName}"},
  "_aiGenerated": true,
  "turns": [
    {"speaker": "A", "en": "...", "vi": "..."},
    {"speaker": "B", "en": "...", "vi": "..."}
  ]
}

Hội thoại phải có đúng ${TURNS} lượt (${TURNS / 2} của A + ${TURNS / 2} của B).`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  // Trích JSON nếu có markdown bọc ngoài
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Không tìm thấy JSON trong response')
  return JSON.parse(match[0])
}

// ── Lưu progress ngay lập tức ─────────────────────────────────────────────────
function saveLessons(lessonMap) {
  const sorted = Array.from(lessonMap.values()).sort((a, b) => a.id - b.id)
  fs.writeFileSync(LESSONS_FILE, JSON.stringify(sorted, null, 2))
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Xây dựng map từ lessons hiện có
  const lessonMap = new Map(lessons.map((l) => [l.id, l]))

  // Danh sách id cần sinh
  const toGen = []
  for (let id = FROM; id <= TO; id++) {
    if (!aiDoneIds.has(id)) toGen.push(id)
  }

  if (toGen.length === 0) {
    console.log('✅ Tất cả bài trong khoảng này đã có AI content!')
    return
  }

  console.log(`📝 Cần sinh: ${toGen.length} bài\n`)

  let done = 0
  const errors = []

  // Xử lý theo batch (song song)
  for (let i = 0; i < toGen.length; i += BATCH) {
    const batch = toGen.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map((id) => generateLesson(id)))

    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      const id = batch[j]
      if (r.status === 'fulfilled') {
        lessonMap.set(id, r.value)
        done++
        process.stdout.write(
          `  ✅ [${done}/${toGen.length}] Bài ${id}: "${makeTopic(id).title}" (${r.value.turns?.length ?? 0} lượt)\n`,
        )
      } else {
        errors.push(id)
        process.stdout.write(`  ❌ [${done}/${toGen.length}] Bài ${id}: ${r.reason?.message}\n`)
      }
    }

    // Lưu sau mỗi batch (có thể Ctrl+C và chạy lại)
    saveLessons(lessonMap)

    // Nghỉ giữa các batch (Opus 4.8 chậm hơn, cần nghỉ lâu hơn tránh rate limit)
    if (i + BATCH < toGen.length) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  console.log(`\n🎉 Hoàn thành! Đã sinh: ${done} bài | Lỗi: ${errors.length} bài`)
  if (errors.length > 0) {
    console.log(`⚠️  Bài lỗi: ${errors.join(', ')}`)
    console.log(
      `   Chạy lại: node scripts/gen-lessons.mjs --from ${Math.min(...errors)} --to ${Math.max(...errors)}`,
    )
  }

  console.log(`\n🔧 Bước tiếp theo: node scripts/split-lessons.mjs`)
}

main().catch((err) => {
  console.error('💥 Lỗi nghiêm trọng:', err.message)
  process.exit(1)
})
