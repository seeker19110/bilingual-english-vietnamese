// scripts/gen-lessons.mjs
// Sinh bài học hội thoại song ngữ Anh-Việt bằng Claude API.
// Chạy: ANTHROPIC_API_KEY=sk-... node scripts/gen-lessons.mjs
// Tùy chọn:
//   --from 101   bắt đầu từ bài số 101 (mặc định tiếp theo bài cuối cùng)
//   --count 10   số bài cần sinh (mặc định 10)
//   --turns 50   số lượt thoại mỗi bài (mặc định 50)

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LESSONS_FILE = path.join(ROOT, 'src/data/lessons.json')

// ── Đọc tham số dòng lệnh ────────────────────────────────────────────────────
const args = process.argv.slice(2)
function getArg(name, def) {
  const i = args.indexOf(name)
  return i !== -1 ? parseInt(args[i + 1]) : def
}

const TURNS_PER_LESSON = getArg('--turns', 50)
const BATCH = 3  // sinh 3 bài 1 lần gọi API

// ── Đọc file hiện tại ────────────────────────────────────────────────────────
let existing = []
if (fs.existsSync(LESSONS_FILE)) {
  existing = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'))
}
const lastId = existing.length > 0 ? existing[existing.length - 1].id : 0

const startFrom = getArg('--from', lastId + 1)
const totalCount = getArg('--count', 10)

// ── 1000 chủ đề bài học ──────────────────────────────────────────────────────
// Được tổ chức từ dễ → khó, giao tiếp hàng ngày → chuyên ngành
const ALL_TOPICS = [
  // === NHÓM 1: Giao tiếp cơ bản (bài 1-100, đã có) ===
  // === NHÓM 2: Cuộc sống hàng ngày nâng cao (101-200) ===
  { id: 101, title: "Đặt lịch hẹn qua điện thoại", situation: "Minh gọi điện đặt lịch hẹn với bác sĩ.", speakerAName: { vi: "Minh", en: "Minh" }, speakerBName: { vi: "Lễ tân", en: "Receptionist" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 102, title: "Thuê xe máy", situation: "Hoa muốn thuê xe máy đi thăm quan thành phố.", speakerAName: { vi: "Hoa", en: "Hoa" }, speakerBName: { vi: "Người cho thuê", en: "Rental owner" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 103, title: "Gọi thợ sửa điện nước", situation: "Anh Tuấn gọi thợ đến sửa vòi nước bị hỏng.", speakerAName: { vi: "Anh Tuấn", en: "Tuan" }, speakerBName: { vi: "Thợ sửa", en: "Repairman" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 104, title: "Mua vé tàu hỏa", situation: "Lan mua vé tàu từ Hà Nội đi Đà Nẵng.", speakerAName: { vi: "Lan", en: "Lan" }, speakerBName: { vi: "Nhân viên bán vé", en: "Ticket agent" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 105, title: "Nhờ hàng xóm trông nhà", situation: "Chị Mai nhờ hàng xóm trông nhà khi đi du lịch.", speakerAName: { vi: "Chị Mai", en: "Mai" }, speakerBName: { vi: "Chị Hằng", en: "Hang" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 106, title: "Đổi tiền ngoại tệ", situation: "Khách du lịch đổi đô la sang tiền Việt tại ngân hàng.", speakerAName: { vi: "David", en: "David" }, speakerBName: { vi: "Nhân viên ngân hàng", en: "Bank teller" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 107, title: "Mua sắm ở chợ truyền thống", situation: "Sarah mua rau và thịt ở chợ Bến Thành.", speakerAName: { vi: "Sarah", en: "Sarah" }, speakerBName: { vi: "Người bán hàng", en: "Vendor" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 108, title: "Xin giấy phép lái xe", situation: "Anh Hùng đến trung tâm đăng kiểm để đổi bằng lái.", speakerAName: { vi: "Anh Hùng", en: "Hung" }, speakerBName: { vi: "Nhân viên", en: "Officer" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 109, title: "Đăng ký thẻ thư viện", situation: "Sinh viên Phương đăng ký mượn sách ở thư viện.", speakerAName: { vi: "Phương", en: "Phuong" }, speakerBName: { vi: "Thủ thư", en: "Librarian" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 110, title: "Khiếu nại sản phẩm lỗi", situation: "Khách hàng mang laptop lỗi đến cửa hàng đổi trả.", speakerAName: { vi: "Anh Bình", en: "Binh" }, speakerBName: { vi: "Nhân viên dịch vụ", en: "Service staff" }, speakerAGender: "male", speakerBGender: "female" },
  // 111-120
  { id: 111, title: "Hỏi về khóa học tiếng Anh", situation: "Thúy hỏi về các khóa học tại trung tâm ngoại ngữ.", speakerAName: { vi: "Thúy", en: "Thuy" }, speakerBName: { vi: "Tư vấn viên", en: "Consultant" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 112, title: "Thuê phòng trọ", situation: "Sinh viên Khoa xem phòng trọ và hỏi về giá cả.", speakerAName: { vi: "Khoa", en: "Khoa" }, speakerBName: { vi: "Chủ nhà", en: "Landlord" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 113, title: "Mở tài khoản ngân hàng", situation: "Hà mở tài khoản ngân hàng lần đầu.", speakerAName: { vi: "Hà", en: "Ha" }, speakerBName: { vi: "Nhân viên ngân hàng", en: "Bank officer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 114, title: "Đặt tiệc sinh nhật", situation: "Anh Đức đặt bàn tiệc sinh nhật cho vợ tại nhà hàng.", speakerAName: { vi: "Anh Đức", en: "Duc" }, speakerBName: { vi: "Quản lý nhà hàng", en: "Restaurant manager" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 115, title: "Nói chuyện về thói quen ăn uống", situation: "Hai người bạn thảo luận về chế độ ăn lành mạnh.", speakerAName: { vi: "Linh", en: "Linh" }, speakerBName: { vi: "Trang", en: "Trang" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 116, title: "Xin nghỉ phép", situation: "Nhân viên Hải xin sếp cho nghỉ phép một tuần.", speakerAName: { vi: "Hải", en: "Hai" }, speakerBName: { vi: "Sếp", en: "Manager" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 117, title: "Hỏi đường đi bộ", situation: "Khách nước ngoài hỏi đường đến bảo tàng Hồ Chí Minh.", speakerAName: { vi: "Tom", en: "Tom" }, speakerBName: { vi: "Người dân địa phương", en: "Local resident" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 118, title: "Gửi và nhận bưu kiện", situation: "Chị Nga gửi quà cho người thân ở nước ngoài.", speakerAName: { vi: "Chị Nga", en: "Nga" }, speakerBName: { vi: "Nhân viên bưu điện", en: "Post office staff" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 119, title: "Mua bảo hiểm xe máy", situation: "Anh Minh mua bảo hiểm cho xe máy mới.", speakerAName: { vi: "Anh Minh", en: "Minh" }, speakerBName: { vi: "Nhân viên bảo hiểm", en: "Insurance agent" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 120, title: "Thảo luận về du lịch ba lô", situation: "Hai du khách trao đổi kinh nghiệm du lịch tiết kiệm.", speakerAName: { vi: "Nam", en: "Nam" }, speakerBName: { vi: "Emma", en: "Emma" }, speakerAGender: "male", speakerBGender: "female" },
  // 121-150: Gia đình & Quan hệ xã hội
  { id: 121, title: "Bàn về kế hoạch hôn nhân", situation: "Cặp đôi thảo luận về kế hoạch đám cưới.", speakerAName: { vi: "Minh", en: "Minh" }, speakerBName: { vi: "Lan", en: "Lan" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 122, title: "Dạy con làm bài tập", situation: "Bố giúp con học bài tập về nhà môn Toán.", speakerAName: { vi: "Bố", en: "Dad" }, speakerBName: { vi: "Con", en: "Child" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 123, title: "Nói chuyện với bố mẹ về nghề nghiệp", situation: "Sinh viên thảo luận với bố mẹ về định hướng nghề nghiệp.", speakerAName: { vi: "Mẹ", en: "Mom" }, speakerBName: { vi: "Con gái", en: "Daughter" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 124, title: "Hòa giải mâu thuẫn gia đình", situation: "Hai anh em giải quyết xích mích về tài sản cha mẹ để lại.", speakerAName: { vi: "Anh Hai", en: "Older brother" }, speakerBName: { vi: "Em Trai", en: "Younger brother" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 125, title: "Thăm hỏi người ốm", situation: "Bạn bè đến thăm người bạn đang nằm viện.", speakerAName: { vi: "Hoa", en: "Hoa" }, speakerBName: { vi: "Trang", en: "Trang" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 126, title: "Chuẩn bị tiệc Tết", situation: "Cả gia đình bàn về kế hoạch đón Tết Nguyên Đán.", speakerAName: { vi: "Mẹ", en: "Mom" }, speakerBName: { vi: "Con trai", en: "Son" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 127, title: "Chia sẻ về áp lực cuộc sống", situation: "Hai người bạn thân nói chuyện về stress trong công việc.", speakerAName: { vi: "Khoa", en: "Khoa" }, speakerBName: { vi: "Tuấn", en: "Tuan" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 128, title: "Xin lỗi vì lỡ hẹn", situation: "Nam xin lỗi bạn gái vì đã quên ngày kỷ niệm.", speakerAName: { vi: "Nam", en: "Nam" }, speakerBName: { vi: "Linh", en: "Linh" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 129, title: "Bàn về nuôi thú cưng", situation: "Vợ chồng thảo luận về việc nuôi chó hay mèo.", speakerAName: { vi: "Chồng", en: "Husband" }, speakerBName: { vi: "Vợ", en: "Wife" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 130, title: "Tư vấn bạn bè về tình yêu", situation: "Hoa giúp bạn thân xử lý tình huống tình cảm khó khăn.", speakerAName: { vi: "Hoa", en: "Hoa" }, speakerBName: { vi: "Thảo", en: "Thao" }, speakerAGender: "female", speakerBGender: "female" },
  // 131-160: Sức khỏe & Y tế
  { id: 131, title: "Khám sức khỏe định kỳ", situation: "Chị Lan đến khám sức khỏe tổng quát hàng năm.", speakerAName: { vi: "Bác sĩ", en: "Doctor" }, speakerBName: { vi: "Bệnh nhân Lan", en: "Patient Lan" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 132, title: "Hỏi bác sĩ về thuốc", situation: "Bệnh nhân hỏi về tác dụng phụ của thuốc được kê.", speakerAName: { vi: "Anh Hùng", en: "Hung" }, speakerBName: { vi: "Bác sĩ", en: "Doctor" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 133, title: "Tư vấn dinh dưỡng", situation: "Chuyên gia dinh dưỡng tư vấn cho bệnh nhân tiểu đường.", speakerAName: { vi: "Bác sĩ dinh dưỡng", en: "Nutritionist" }, speakerBName: { vi: "Bệnh nhân", en: "Patient" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 134, title: "Đặt lịch phẫu thuật", situation: "Bệnh nhân thảo luận với bác sĩ về ca mổ sắp tới.", speakerAName: { vi: "Bác sĩ phẫu thuật", en: "Surgeon" }, speakerBName: { vi: "Bệnh nhân", en: "Patient" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 135, title: "Tư vấn sức khỏe tâm thần", situation: "Người trẻ lần đầu gặp nhà tâm lý học.", speakerAName: { vi: "Nhà tâm lý", en: "Therapist" }, speakerBName: { vi: "Phương", en: "Phuong" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 136, title: "Mua thuốc tại hiệu thuốc", situation: "Khách hàng hỏi dược sĩ về thuốc trị cảm cúm.", speakerAName: { vi: "Khách hàng", en: "Customer" }, speakerBName: { vi: "Dược sĩ", en: "Pharmacist" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 137, title: "Tập thể dục với huấn luyện viên", situation: "Huấn luyện viên gym hướng dẫn học viên mới.", speakerAName: { vi: "Huấn luyện viên", en: "Trainer" }, speakerBName: { vi: "Học viên", en: "Student" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 138, title: "Hỏi về bảo hiểm y tế", situation: "Nhân viên mới hỏi về chế độ bảo hiểm y tế công ty.", speakerAName: { vi: "Nhân viên mới", en: "New employee" }, speakerBName: { vi: "Nhân sự", en: "HR staff" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 139, title: "Khám nha khoa", situation: "Bệnh nhân đến khám và nhổ răng khôn.", speakerAName: { vi: "Nha sĩ", en: "Dentist" }, speakerBName: { vi: "Bệnh nhân", en: "Patient" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 140, title: "Nói về yoga và thiền", situation: "Hướng dẫn viên yoga giải thích về lợi ích của thiền.", speakerAName: { vi: "Huấn luyện viên", en: "Yoga instructor" }, speakerBName: { vi: "Học viên", en: "Student" }, speakerAGender: "female", speakerBGender: "male" },
  // 141-170: Giáo dục & Học thuật
  { id: 141, title: "Thi vào đại học", situation: "Học sinh hỏi giáo viên về kỳ thi đại học.", speakerAName: { vi: "Học sinh Nam", en: "Student Nam" }, speakerBName: { vi: "Giáo viên", en: "Teacher" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 142, title: "Xin học bổng nước ngoài", situation: "Sinh viên hỏi cố vấn về cách xin học bổng Fulbright.", speakerAName: { vi: "Sinh viên Thảo", en: "Student Thao" }, speakerBName: { vi: "Cố vấn học thuật", en: "Academic advisor" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 143, title: "Thuyết trình nhóm", situation: "Nhóm sinh viên chuẩn bị bài thuyết trình.", speakerAName: { vi: "Nhóm trưởng Minh", en: "Leader Minh" }, speakerBName: { vi: "Thành viên Hà", en: "Member Ha" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 144, title: "Viết luận văn tốt nghiệp", situation: "Sinh viên thảo luận với giáo sư hướng dẫn luận văn.", speakerAName: { vi: "Sinh viên", en: "Student" }, speakerBName: { vi: "Giáo sư", en: "Professor" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 145, title: "Đăng ký môn học đại học", situation: "Sinh viên năm nhất hỏi giáo vụ về đăng ký môn học.", speakerAName: { vi: "Sinh viên", en: "Student" }, speakerBName: { vi: "Phòng giáo vụ", en: "Registrar" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 146, title: "Thảo luận về phương pháp học", situation: "Hai bạn sinh viên chia sẻ cách học hiệu quả.", speakerAName: { vi: "Huy", en: "Huy" }, speakerBName: { vi: "Linh", en: "Linh" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 147, title: "Phỏng vấn thực tập", situation: "Sinh viên phỏng vấn thực tập tại công ty công nghệ.", speakerAName: { vi: "Sinh viên Khoa", en: "Student Khoa" }, speakerBName: { vi: "Nhà tuyển dụng", en: "Recruiter" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 148, title: "Hỏi về chương trình trao đổi", situation: "Sinh viên hỏi về chương trình trao đổi quốc tế.", speakerAName: { vi: "Sinh viên Vân", en: "Student Van" }, speakerBName: { vi: "Văn phòng quốc tế", en: "International office" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 149, title: "Học trực tuyến với giáo viên nước ngoài", situation: "Học viên học tiếng Anh trực tuyến với giáo viên người Mỹ.", speakerAName: { vi: "Học viên Mai", en: "Student Mai" }, speakerBName: { vi: "Giáo viên Michael", en: "Teacher Michael" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 150, title: "Thảo luận về sách hay", situation: "Hai người bạn cùng nhóm đọc sách chia sẻ cảm nhận.", speakerAName: { vi: "Thành", en: "Thanh" }, speakerBName: { vi: "Nga", en: "Nga" }, speakerAGender: "male", speakerBGender: "female" },
  // 151-200: Du lịch & Ngoại ngữ
  { id: 151, title: "Check in khách sạn 5 sao", situation: "Khách quốc tế check in tại khách sạn sang trọng.", speakerAName: { vi: "Khách hàng", en: "Guest" }, speakerBName: { vi: "Lễ tân", en: "Receptionist" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 152, title: "Thuê hướng dẫn viên du lịch", situation: "Nhóm du khách thuê hướng dẫn viên thăm Hội An.", speakerAName: { vi: "Hướng dẫn viên Linh", en: "Tour guide Linh" }, speakerBName: { vi: "Khách John", en: "Tourist John" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 153, title: "Đặt tour du lịch", situation: "Khách hàng đặt tour Phú Quốc 4 ngày 3 đêm.", speakerAName: { vi: "Khách hàng", en: "Customer" }, speakerBName: { vi: "Nhân viên du lịch", en: "Travel agent" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 154, title: "Hỏi về visa du lịch", situation: "Người Việt hỏi đại sứ quán về thủ tục xin visa Schengen.", speakerAName: { vi: "Chị Lan", en: "Lan" }, speakerBName: { vi: "Nhân viên đại sứ quán", en: "Embassy officer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 155, title: "Phàn nàn về phòng khách sạn", situation: "Khách phàn nàn với lễ tân về điều hòa bị hỏng.", speakerAName: { vi: "Khách hàng", en: "Guest" }, speakerBName: { vi: "Lễ tân", en: "Receptionist" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 156, title: "Mua đồ lưu niệm", situation: "Khách nước ngoài mua đồ thủ công mỹ nghệ ở Hà Nội.", speakerAName: { vi: "Sarah", en: "Sarah" }, speakerBName: { vi: "Người bán hàng", en: "Seller" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 157, title: "Đi cáp treo Fansipan", situation: "Khách du lịch hỏi nhân viên về tuyến cáp treo Fansipan.", speakerAName: { vi: "Khách du lịch", en: "Tourist" }, speakerBName: { vi: "Nhân viên", en: "Staff" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 158, title: "Kể về chuyến đi đáng nhớ", situation: "Hai đồng nghiệp chia sẻ kỷ niệm chuyến du lịch.", speakerAName: { vi: "Hoa", en: "Hoa" }, speakerBName: { vi: "Tú", en: "Tu" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 159, title: "Xử lý hành lý thất lạc", situation: "Hành khách báo cáo vali bị thất lạc tại sân bay.", speakerAName: { vi: "Hành khách", en: "Passenger" }, speakerBName: { vi: "Nhân viên hàng không", en: "Airline staff" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 160, title: "Nói về văn hóa khác biệt", situation: "Người Việt và người nước ngoài trao đổi về văn hóa.", speakerAName: { vi: "Minh", en: "Minh" }, speakerBName: { vi: "Emma", en: "Emma" }, speakerAGender: "male", speakerBGender: "female" },
  // 161-200: Công việc văn phòng
  { id: 161, title: "Họp nhóm dự án", situation: "Trưởng nhóm dẫn dắt cuộc họp về tiến độ dự án.", speakerAName: { vi: "Trưởng nhóm Hùng", en: "Team lead Hung" }, speakerBName: { vi: "Thành viên Thảo", en: "Member Thao" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 162, title: "Viết email chuyên nghiệp", situation: "Nhân viên nhờ đồng nghiệp kiểm tra email gửi khách hàng.", speakerAName: { vi: "Hà", en: "Ha" }, speakerBName: { vi: "Đồng nghiệp Tom", en: "Colleague Tom" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 163, title: "Đàm phán hợp đồng", situation: "Đại diện hai công ty đàm phán điều khoản hợp đồng.", speakerAName: { vi: "Giám đốc Minh", en: "Director Minh" }, speakerBName: { vi: "Đối tác David", en: "Partner David" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 164, title: "Báo cáo kết quả kinh doanh", situation: "Nhân viên báo cáo doanh số quý với giám đốc.", speakerAName: { vi: "Nhân viên Phương", en: "Staff Phuong" }, speakerBName: { vi: "Giám đốc", en: "Director" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 165, title: "Phỏng vấn ứng viên", situation: "HR phỏng vấn ứng viên vị trí Marketing Manager.", speakerAName: { vi: "HR Lan", en: "HR Lan" }, speakerBName: { vi: "Ứng viên", en: "Applicant" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 166, title: "Giải quyết xung đột với khách hàng", situation: "Nhân viên CSKH xử lý khiếu nại của khách hàng khó tính.", speakerAName: { vi: "CSKH Hoa", en: "CS Hoa" }, speakerBName: { vi: "Khách hàng", en: "Customer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 167, title: "Trình bày ý tưởng mới", situation: "Nhân viên trình bày đề xuất chiến lược marketing mới.", speakerAName: { vi: "Nhân viên Tuấn", en: "Staff Tuan" }, speakerBName: { vi: "Sếp", en: "Boss" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 168, title: "Phân công công việc nhóm", situation: "Trưởng nhóm phân công nhiệm vụ cho dự án mới.", speakerAName: { vi: "Trưởng nhóm", en: "Team leader" }, speakerBName: { vi: "Thành viên", en: "Team member" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 169, title: "Đề xuất tăng lương", situation: "Nhân viên đề xuất tăng lương sau 2 năm làm việc.", speakerAName: { vi: "Nhân viên Hải", en: "Employee Hai" }, speakerBName: { vi: "Trưởng phòng", en: "Department head" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 170, title: "Onboarding nhân viên mới", situation: "Nhân viên kỳ cựu hướng dẫn nhân viên mới nhập việc.", speakerAName: { vi: "Nhân viên cũ Nga", en: "Senior staff Nga" }, speakerBName: { vi: "Nhân viên mới", en: "New hire" }, speakerAGender: "female", speakerBGender: "male" },
  // 171-200: Công nghệ & Kỹ thuật số
  { id: 171, title: "Hỏi về điện thoại mới", situation: "Khách hàng hỏi nhân viên bán hàng về smartphone mới nhất.", speakerAName: { vi: "Khách hàng", en: "Customer" }, speakerBName: { vi: "Nhân viên", en: "Sales staff" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 172, title: "Cài đặt và sử dụng app", situation: "Người dùng nhờ bạn hướng dẫn cài đặt ứng dụng ngân hàng.", speakerAName: { vi: "Người dùng", en: "User" }, speakerBName: { vi: "Bạn hỗ trợ", en: "Tech friend" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 173, title: "Gọi hỗ trợ kỹ thuật", situation: "Người dùng gọi hotline hỗ trợ khi máy tính bị lỗi.", speakerAName: { vi: "Người dùng", en: "User" }, speakerBName: { vi: "Kỹ thuật viên", en: "Tech support" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 174, title: "Mua sắm online", situation: "Người dùng hỏi về đơn hàng bị trễ trên Shopee.", speakerAName: { vi: "Người mua", en: "Buyer" }, speakerBName: { vi: "CSKH online", en: "Online support" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 175, title: "Bảo mật tài khoản", situation: "Người dùng báo cáo tài khoản mạng xã hội bị hack.", speakerAName: { vi: "Người dùng", en: "User" }, speakerBName: { vi: "Hỗ trợ kỹ thuật", en: "Support team" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 176, title: "Thiết kế website", situation: "Khách hàng trao đổi yêu cầu thiết kế website với lập trình viên.", speakerAName: { vi: "Khách hàng", en: "Client" }, speakerBName: { vi: "Lập trình viên", en: "Developer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 177, title: "Sử dụng AI trong công việc", situation: "Đồng nghiệp chia sẻ cách dùng AI để tăng năng suất.", speakerAName: { vi: "Nhân viên Hà", en: "Staff Ha" }, speakerBName: { vi: "Đồng nghiệp Minh", en: "Colleague Minh" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 178, title: "Nói về mạng xã hội", situation: "Hai bạn trẻ thảo luận về ảnh hưởng của TikTok.", speakerAName: { vi: "Lan", en: "Lan" }, speakerBName: { vi: "Huy", en: "Huy" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 179, title: "Học lập trình cơ bản", situation: "Người mới bắt đầu hỏi về lộ trình học lập trình.", speakerAName: { vi: "Người học", en: "Learner" }, speakerBName: { vi: "Lập trình viên kinh nghiệm", en: "Experienced developer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 180, title: "Livestream bán hàng", situation: "Người bán hàng online học cách livestream hiệu quả.", speakerAName: { vi: "Người bán", en: "Seller" }, speakerBName: { vi: "Chuyên gia", en: "Expert" }, speakerAGender: "female", speakerBGender: "male" },
  // 181-200: Tài chính cá nhân
  { id: 181, title: "Lập kế hoạch tiết kiệm", situation: "Vợ chồng trẻ bàn về kế hoạch tiết kiệm mua nhà.", speakerAName: { vi: "Chồng Minh", en: "Husband Minh" }, speakerBName: { vi: "Vợ Lan", en: "Wife Lan" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 182, title: "Hỏi về đầu tư chứng khoán", situation: "Người mới hỏi chuyên gia về cách đầu tư chứng khoán an toàn.", speakerAName: { vi: "Người đầu tư mới", en: "New investor" }, speakerBName: { vi: "Chuyên gia tài chính", en: "Financial advisor" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 183, title: "Vay tiền ngân hàng", situation: "Chị Mai hỏi về thủ tục vay mua nhà.", speakerAName: { vi: "Chị Mai", en: "Mai" }, speakerBName: { vi: "Nhân viên ngân hàng", en: "Bank officer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 184, title: "Khai thuế thu nhập", situation: "Nhân viên hỏi kế toán về cách khai thuế cá nhân.", speakerAName: { vi: "Nhân viên", en: "Employee" }, speakerBName: { vi: "Kế toán", en: "Accountant" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 185, title: "Bàn về tiết kiệm hưu trí", situation: "Cặp vợ chồng trung niên bàn về quỹ hưu trí.", speakerAName: { vi: "Chồng", en: "Husband" }, speakerBName: { vi: "Vợ", en: "Wife" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 186, title: "Mua bảo hiểm nhân thọ", situation: "Đại lý bảo hiểm tư vấn sản phẩm bảo hiểm nhân thọ.", speakerAName: { vi: "Đại lý bảo hiểm", en: "Insurance agent" }, speakerBName: { vi: "Khách hàng", en: "Customer" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 187, title: "Quản lý chi tiêu tháng", situation: "Sinh viên học cách quản lý chi tiêu với ngân sách hạn chế.", speakerAName: { vi: "Sinh viên Hoa", en: "Student Hoa" }, speakerBName: { vi: "Mentor tài chính", en: "Finance mentor" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 188, title: "Đầu tư bất động sản", situation: "Nhà đầu tư hỏi môi giới về dự án căn hộ mới.", speakerAName: { vi: "Nhà đầu tư", en: "Investor" }, speakerBName: { vi: "Môi giới", en: "Broker" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 189, title: "Thanh toán quốc tế", situation: "Freelancer hỏi về cách nhận tiền từ khách hàng nước ngoài.", speakerAName: { vi: "Freelancer Minh", en: "Freelancer Minh" }, speakerBName: { vi: "Ngân hàng", en: "Bank" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 190, title: "Chia tiền thuê nhà", situation: "Các bạn cùng phòng bàn về cách chia tiền thuê và sinh hoạt.", speakerAName: { vi: "Nam", en: "Nam" }, speakerBName: { vi: "Tuấn", en: "Tuan" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 191, title: "Mua xe ô tô trả góp", situation: "Khách hàng hỏi về chương trình mua xe trả góp.", speakerAName: { vi: "Khách hàng", en: "Customer" }, speakerBName: { vi: "Nhân viên showroom", en: "Showroom staff" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 192, title: "Nói về khởi nghiệp", situation: "Bạn bè trao đổi về ý tưởng khởi nghiệp.", speakerAName: { vi: "Hùng", en: "Hung" }, speakerBName: { vi: "Linh", en: "Linh" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 193, title: "Xử lý thẻ tín dụng bị mất", situation: "Chủ thẻ báo mất thẻ và khóa tài khoản.", speakerAName: { vi: "Chủ thẻ", en: "Cardholder" }, speakerBName: { vi: "Ngân hàng", en: "Bank" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 194, title: "Bàn về freelance và thu nhập thụ động", situation: "Hai người bạn thảo luận về các nguồn thu nhập thụ động.", speakerAName: { vi: "Tú", en: "Tu" }, speakerBName: { vi: "Hà", en: "Ha" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 195, title: "Thuê văn phòng cho startup", situation: "CEO startup hỏi về chi phí thuê văn phòng coworking.", speakerAName: { vi: "CEO startup", en: "Startup CEO" }, speakerBName: { vi: "Quản lý coworking", en: "Coworking manager" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 196, title: "Lập kế hoạch kinh doanh", situation: "Người khởi nghiệp trình bày business plan với nhà đầu tư.", speakerAName: { vi: "Người khởi nghiệp", en: "Entrepreneur" }, speakerBName: { vi: "Nhà đầu tư", en: "Investor" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 197, title: "Mua hàng qua livestream", situation: "Người xem hỏi người bán về sản phẩm trong livestream.", speakerAName: { vi: "Người xem", en: "Viewer" }, speakerBName: { vi: "Người bán hàng online", en: "Online seller" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 198, title: "Xin việc qua LinkedIn", situation: "Ứng viên hỏi nhà tuyển dụng về vị trí trên LinkedIn.", speakerAName: { vi: "Ứng viên", en: "Candidate" }, speakerBName: { vi: "HR", en: "HR manager" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 199, title: "Tổ chức sự kiện công ty", situation: "Nhân viên lên kế hoạch cho buổi team building.", speakerAName: { vi: "Nhân viên tổ chức", en: "Event organizer" }, speakerBName: { vi: "Đồng nghiệp", en: "Colleague" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 200, title: "Đàm phán giá dịch vụ", situation: "Freelancer thương lượng giá với khách hàng tiềm năng.", speakerAName: { vi: "Freelancer", en: "Freelancer" }, speakerBName: { vi: "Khách hàng", en: "Client" }, speakerAGender: "female", speakerBGender: "male" },
  // 201-300: Ngành nghề chuyên môn
  { id: 201, title: "Tư vấn pháp lý", situation: "Khách hàng hỏi luật sư về tranh chấp đất đai.", speakerAName: { vi: "Khách hàng", en: "Client" }, speakerBName: { vi: "Luật sư", en: "Lawyer" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 202, title: "Khám phụ khoa", situation: "Bác sĩ phụ khoa tư vấn bệnh nhân về sức khỏe sinh sản.", speakerAName: { vi: "Bác sĩ", en: "Doctor" }, speakerBName: { vi: "Bệnh nhân", en: "Patient" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 203, title: "Lên kế hoạch xây nhà", situation: "Chủ nhà thảo luận với kiến trúc sư về thiết kế.", speakerAName: { vi: "Chủ nhà", en: "Homeowner" }, speakerBName: { vi: "Kiến trúc sư", en: "Architect" }, speakerAGender: "male", speakerBGender: "male" },
  { id: 204, title: "Tư vấn marketing", situation: "Chuyên gia marketing tư vấn chiến lược cho doanh nghiệp nhỏ.", speakerAName: { vi: "Chuyên gia marketing", en: "Marketing expert" }, speakerBName: { vi: "Chủ doanh nghiệp", en: "Business owner" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 205, title: "Phỏng vấn nhà báo", situation: "Phóng viên phỏng vấn chuyên gia về biến đổi khí hậu.", speakerAName: { vi: "Phóng viên", en: "Reporter" }, speakerBName: { vi: "Chuyên gia", en: "Expert" }, speakerAGender: "female", speakerBGender: "male" },
  { id: 206, title: "Tư vấn thiết kế nội thất", situation: "Nhà thiết kế tư vấn cho khách hàng về phong cách nội thất.", speakerAName: { vi: "Nhà thiết kế", en: "Interior designer" }, speakerBName: { vi: "Khách hàng", en: "Client" }, speakerAGender: "female", speakerBGender: "female" },
  { id: 207, title: "Hội thảo khoa học", situation: "Nhà nghiên cứu trình bày kết quả nghiên cứu tại hội thảo.", speakerAName: { vi: "Nhà nghiên cứu", en: "Researcher" }, speakerBName: { vi: "Đồng nghiệp", en: "Colleague" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 208, title: "Cố vấn nghề nghiệp", situation: "Mentor chia sẻ kinh nghiệm phát triển sự nghiệp.", speakerAName: { vi: "Mentor", en: "Mentor" }, speakerBName: { vi: "Người được hướng dẫn", en: "Mentee" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 209, title: "Hội chẩn y khoa", situation: "Các bác sĩ thảo luận về phương án điều trị bệnh nhân.", speakerAName: { vi: "Bác sĩ Minh", en: "Dr. Minh" }, speakerBName: { vi: "Bác sĩ Lan", en: "Dr. Lan" }, speakerAGender: "male", speakerBGender: "female" },
  { id: 210, title: "Tư vấn xuất khẩu", situation: "Chuyên gia tư vấn doanh nghiệp về thủ tục xuất khẩu hàng hóa.", speakerAName: { vi: "Chuyên gia xuất khẩu", en: "Export consultant" }, speakerBName: { vi: "Doanh nghiệp", en: "Business owner" }, speakerAGender: "male", speakerBGender: "female" },
]

// Tạo thêm topics từ 211-1000 theo nhóm chủ đề
const TOPIC_GROUPS = [
  // Nhà hàng & Ẩm thực
  { prefix: "Nhà bếp & Nấu ăn", topics: ["Học nấu phở bò", "Làm bánh mì Việt Nam", "Nấu cơm tấm Sài Gòn", "Học làm nem cuốn", "Pha cà phê phin", "Học nấu bún bò Huế", "Tráng bánh cuốn", "Học làm bánh xèo", "Nấu lẩu thái", "Học làm chả giò"] },
  { prefix: "Nhà hàng & Cafe", topics: ["Gọi đồ uống đặc biệt", "Hỏi về thực đơn chay", "Đặt bàn nhà hàng Nhật", "Tìm nhà hàng hải sản", "Uống trà chiều", "Thử món fusion", "Gọi combo set meal", "Hỏi về dị ứng thực phẩm", "Đặt tiệc công ty", "Hỏi cách nấu món lạ"] },
  // Thể thao & Giải trí
  { prefix: "Thể thao", topics: ["Đăng ký lớp bơi lội", "Tập bóng đá cuối tuần", "Học đánh cầu lông", "Tham gia câu lạc bộ chạy bộ", "Học kỹ thuật bóng rổ", "Đăng ký giải marathon", "Học võ taekwondo", "Tập tennis với bạn bè", "Đi leo núi cuối tuần", "Học yoga trực tuyến"] },
  { prefix: "Giải trí & Văn hóa", topics: ["Mua vé xem phim", "Đi xem ca nhạc", "Thăm triển lãm nghệ thuật", "Đọc sách tại café", "Chơi board game", "Xem kịch sân khấu", "Tham gia câu lạc bộ ảnh", "Học vẽ tranh", "Chơi trò chơi điện tử", "Đi karaoke với bạn bè"] },
  // Mua sắm & Thời trang
  { prefix: "Thời trang", topics: ["Mua quần áo thời trang", "Tư vấn phối đồ", "Mua giày sneaker", "Tìm áo dài truyền thống", "Mua đồ công sở", "Tư vấn túi xách", "Mua đồ thể thao", "Tìm quần áo cưới", "Mua phụ kiện thời trang", "Tìm đồ vintage"] },
  // Môi trường & Thiên nhiên
  { prefix: "Môi trường", topics: ["Bảo vệ môi trường biển", "Phân loại rác tái chế", "Trồng cây xanh tại nhà", "Tiết kiệm điện nước", "Sử dụng túi vải", "Chăm sóc vườn rau", "Bảo vệ động vật hoang dã", "Sử dụng xe đạp", "Làm phân compost", "Nói về biến đổi khí hậu"] },
  // Nghề nghiệp chuyên môn
  { prefix: "Kỹ thuật & Công nghệ", topics: ["Phát triển ứng dụng mobile", "Thiết kế UX/UI", "Phân tích dữ liệu", "Quản lý dự án IT", "An ninh mạng", "Điện toán đám mây", "Trí tuệ nhân tạo", "Blockchain", "Phát triển web", "DevOps và CI/CD"] },
  { prefix: "Y tế & Sức khỏe nâng cao", topics: ["Điều trị ung thư", "Phục hồi chức năng", "Chăm sóc sức khỏe người cao tuổi", "Y học cổ truyền", "Sức khỏe tâm thần", "Dinh dưỡng thể thao", "Y tế từ xa", "Phẫu thuật thẩm mỹ", "Điều trị vô sinh", "Chăm sóc sơ sinh"] },
  { prefix: "Giáo dục & Đào tạo", topics: ["Dạy học trực tuyến", "Phương pháp Montessori", "Giáo dục STEM", "Học bổng nước ngoài", "Đào tạo kỹ năng mềm", "Coaching nghề nghiệp", "E-learning", "Giáo dục đặc biệt", "Học tiếng Hàn", "Học tiếng Nhật"] },
  { prefix: "Kinh doanh & Quản lý", topics: ["Quản lý nhân sự", "Chiến lược kinh doanh", "Marketing kỹ thuật số", "Quản lý chuỗi cung ứng", "Dịch vụ khách hàng", "Phân tích tài chính", "Quản lý rủi ro", "Phát triển thương hiệu", "Thương mại điện tử", "Quản lý dự án"] },
  // Chủ đề xã hội
  { prefix: "Xã hội & Cộng đồng", topics: ["Tình nguyện viên", "Bảo vệ quyền phụ nữ", "Hỗ trợ người khuyết tật", "Xây dựng cộng đồng", "Chăm sóc người cao tuổi", "Giúp đỡ trẻ em", "Hoạt động thiện nguyện", "Phòng chống tệ nạn", "An toàn giao thông", "Phòng chống dịch bệnh"] },
  // Cuộc sống thành thị
  { prefix: "Cuộc sống đô thị", topics: ["Giao thông công cộng", "Sinh sống ở chung cư", "Tìm nhà ở thành phố lớn", "Ô nhiễm không khí đô thị", "Trung tâm mua sắm", "Sống trong khu phố cũ", "Di chuyển bằng Grab/Gojek", "Tìm chỗ đỗ xe", "Mất điện đột ngột", "Sự cố thang máy"] },
  // Tình huống khẩn cấp
  { prefix: "Tình huống khẩn cấp", topics: ["Gọi cấp cứu 115", "Báo cháy cho lính cứu hỏa", "Khai báo sự cố tai nạn", "Xử lý đuối nước", "Sơ cứu vết thương", "Báo cáo trộm cắp", "Tìm người thân lạc", "Cứu hộ thiên tai", "Hỗ trợ người bị nạn giao thông", "Liên hệ đại sứ quán khi gặp nạn"] },
]

// Sinh thêm topics cho đủ 1000
const extraTopics = []
let currentId = 211

for (const group of TOPIC_GROUPS) {
  for (const topic of group.topics) {
    if (currentId > 1000) break
    extraTopics.push({
      id: currentId++,
      title: `${topic}`,
      situation: `Hội thoại về chủ đề: ${topic} (nhóm ${group.prefix})`,
      speakerAGender: currentId % 2 === 0 ? 'female' : 'male',
      speakerBGender: currentId % 2 === 0 ? 'male' : 'female',
    })
  }
  if (currentId > 1000) break
}

// Thêm chủ đề cho đến 1000
while (currentId <= 1000) {
  extraTopics.push({
    id: currentId,
    title: `Chủ đề giao tiếp ${currentId}`,
    situation: `Hội thoại thực hành giao tiếp tiếng Anh chủ đề số ${currentId}`,
    speakerAGender: currentId % 2 === 0 ? 'female' : 'male',
    speakerBGender: currentId % 2 === 0 ? 'male' : 'female',
  })
  currentId++
}

const ALL_TOPICS_FULL = [...ALL_TOPICS, ...extraTopics]

// ── Lấy chủ đề cần sinh ────────────────────────────────────────────────────
const topicsToGen = ALL_TOPICS_FULL.filter(t => t.id >= startFrom && t.id < startFrom + totalCount)
if (topicsToGen.length === 0) {
  console.log(`⚠️  Không có chủ đề nào trong khoảng id ${startFrom} - ${startFrom + totalCount - 1}`)
  process.exit(0)
}

console.log(`🚀 Sinh ${topicsToGen.length} bài học (id ${topicsToGen[0].id} - ${topicsToGen[topicsToGen.length - 1].id}), ${TURNS_PER_LESSON} lượt/bài`)

// ── Gọi API Claude để sinh hội thoại ──────────────────────────────────────
const client = new Anthropic()

async function generateLesson(topic) {
  const prompt = `Tạo bài học hội thoại tiếng Anh - tiếng Việt cho ứng dụng luyện tiếng Anh.

Chủ đề: "${topic.title}"
Tình huống: ${topic.situation}
Người nói A: ${topic.speakerAName?.vi ?? 'Người A'} (${topic.speakerAGender})
Người nói B: ${topic.speakerBName?.vi ?? 'Người B'} (${topic.speakerBGender})
Số lượt thoại: ${TURNS_PER_LESSON} lượt (xen kẽ A và B, bắt đầu bằng A)

Yêu cầu:
- Mỗi câu tiếng Anh: tự nhiên, đúng ngữ pháp, phù hợp ngữ cảnh Việt Nam
- Tiếng Việt: dịch sát nghĩa và tự nhiên
- Hội thoại phải có mạch chuyện liền mạch, thực tế
- Câu không quá dài (tối đa 20 từ/câu)

Trả về JSON theo đúng format sau (không có markdown):
{
  "id": ${topic.id},
  "title": "${topic.title}",
  "situation": "${topic.situation}",
  "speakerAGender": "${topic.speakerAGender}",
  "speakerBGender": "${topic.speakerBGender}",
  "speakerAName": {"vi": "${topic.speakerAName?.vi ?? 'Người A'}", "en": "${topic.speakerAName?.en ?? 'Person A'}"},
  "speakerBName": {"vi": "${topic.speakerBName?.vi ?? 'Người B'}", "en": "${topic.speakerBName?.en ?? 'Person B'}"},
  "turns": [
    {"speaker": "A", "en": "...", "vi": "..."},
    {"speaker": "B", "en": "...", "vi": "..."}
  ]
}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  return JSON.parse(text)
}

// ── Sinh từng bài và lưu vào lessons.json ─────────────────────────────────
async function main() {
  const results = []

  for (let i = 0; i < topicsToGen.length; i++) {
    const topic = topicsToGen[i]
    console.log(`  [${i + 1}/${topicsToGen.length}] Đang sinh bài ${topic.id}: "${topic.title}"…`)
    try {
      const lesson = await generateLesson(topic)
      results.push(lesson)
      console.log(`    ✅ ${lesson.turns.length} lượt`)
    } catch (err) {
      console.error(`    ❌ Lỗi bài ${topic.id}:`, err.message)
    }
    // Nghỉ 500ms để tránh rate limit
    if (i < topicsToGen.length - 1) await new Promise(r => setTimeout(r, 500))
  }

  // Gộp với bài hiện có, sắp xếp theo id
  const merged = [...existing]
  for (const lesson of results) {
    const idx = merged.findIndex(l => l.id === lesson.id)
    if (idx !== -1) merged[idx] = lesson
    else merged.push(lesson)
  }
  merged.sort((a, b) => a.id - b.id)

  fs.writeFileSync(LESSONS_FILE, JSON.stringify(merged, null, 2))
  console.log(`\n✅ Đã lưu ${merged.length} bài học vào src/data/lessons.json`)
  console.log(`\n🔧 Chạy tiếp: node scripts/split-lessons.mjs`)
}

main().catch(console.error)
