// learningPaths/pathStages.ts — CHẶNG RIÊNG CỦA LỘ TRÌNH (đợt 4, giai đoạn P5 "Tầm trưởng").
//
// Vì sao tồn tại: 4 chặng `principal-s1…s4` chỉ có nghĩa TRONG lộ trình "Kỹ Sư Trưởng AI" —
// chúng không phải hướng chuyên sâu thứ 15 (đặc tả cha cấm), nên không nằm trong
// `PROGRAMMING_SPECIALIZATIONS`. Nhưng UI chặng (tên, can-do, modules, dự án) muốn dùng chung
// khuôn sẵn có, nên chúng khai đúng kiểu `SpecStage` và được tra qua `resolveStage()` —
// hàm thử sổ hướng chuyên sâu trước, rồi mới tới sổ chặng lộ trình này.
//
// Đặc tả: docs/specs/2026-08-31-dot-4-p5-tam-truong.md. Dữ liệu là hằng biên dịch, không I/O.
import type { SpecStage } from '../specializations/types.js'
import { getSpecStage } from '../specializations/registry.js'

/** 4 chặng P5 "Tầm trưởng" của lộ trình principal-ai, theo thứ tự học. */
export const PATH_STAGES: SpecStage[] = [
  {
    id: 'principal-s1',
    tier: 's1',
    name: 'Vận hành AI hiệu quả',
    canDo:
      'Giao việc cho AI bằng đặc tả 6 ô, đo chất lượng đầu ra bằng bộ eval tự thiết kế, và quản được ngân sách token/chi phí của cả hệ.',
    duration: '4–6 tuần',
    modules: [
      {
        id: 'principal-s1-m1',
        title: 'Đặc tả giao việc cho AI',
        topics: [
          '6 ô bắt buộc của một đặc tả: phạm vi có mục "KHÔNG làm", điểm chạm, hợp đồng vào-ra, tiêu chí chấp nhận, bất biến, quy ước',
          'Tiêu chí chấp nhận ĐO ĐƯỢC vs mơ hồ — "có số, có cách đo"',
          'Vì sao đặc tả tồi thì AI (hay người) làm sai ngay lượt đầu',
        ],
      },
      {
        id: 'principal-s1-m2',
        title: 'Eval & ngân sách chi phí',
        topics: [
          'Bộ ca vàng (golden set) và hai thước lõi: recall, precision',
          'Ước lượng chi phí token theo bảng giá; cache prompt và điểm hoà vốn',
          'Đếm/giới hạn lượt gọi AI — chi phí là ràng buộc thiết kế, không phải chuyện của kế toán',
        ],
      },
    ],
    project: {
      name: 'Bộ đặc tả + eval cho một tính năng AI',
      brief:
        'Chọn MỘT tính năng AI (thật hoặc giả định), viết đặc tả đủ 6 ô và bộ eval có ca vàng đo recall/precision cho nó.',
      requirements: [
        'Đặc tả đủ 6 ô, mục "KHÔNG làm" có ít nhất 3 dòng thật',
        'Mọi tiêu chí chấp nhận có con số hoặc cách đo rõ',
        'Bộ eval ≥ 10 ca vàng, chạy được và in recall/precision',
        'Có ngân sách chi phí/tháng kèm cách tính',
      ],
    },
  },
  {
    id: 'principal-s2',
    tier: 's2',
    name: 'Hệ tác tử & MCP',
    canDo:
      'Tự cài vòng lặp agent (nghĩ → gọi tool → đọc kết quả → lặp) bằng code thuần, validate tham số tool an toàn, và giải thích được MCP chuẩn hoá hợp đồng gì.',
    duration: '4–6 tuần',
    modules: [
      {
        id: 'principal-s2-m1',
        title: 'Vòng lặp agent tối giản',
        topics: [
          'Bảng tool + dispatch theo tên; tool lạ phải trả lỗi rõ, không đoán bừa',
          'Vòng lặp nhiều bước: điều kiện dừng (số bước tối đa, tool "xong")',
          'Log từng bước — agent không log là agent không gỡ lỗi được',
        ],
      },
      {
        id: 'principal-s2-m2',
        title: 'Tool-use an toàn & MCP',
        topics: [
          'Validate tham số trước khi chạy; allowlist tool thay vì tin lời gọi',
          'MCP: hợp đồng "liệt kê tool + gọi tool theo tên" chuẩn hoá giữa model và công cụ',
          'Ranh giới tin cậy: dữ liệu ngoài đi qua tool là dữ liệu KHÔNG TIN được',
        ],
      },
    ],
    project: {
      name: 'Agent giải một việc thật có log từng bước',
      brief:
        'Một agent nhỏ tự cài (không framework) giải một việc tra cứu + tính toán nhiều bước, in log từng bước đọc lại được.',
      requirements: [
        'Vòng lặp có điều kiện dừng rõ (max bước + tool kết thúc)',
        'Mọi tham số tool được validate trước khi chạy',
        'Log ghi đủ: bước thứ mấy, tool nào, tham số gì, kết quả gì',
        'Tool lạ hoặc tham số sai → lỗi có thông điệp rõ, agent không sập',
      ],
    },
  },
  {
    id: 'principal-s3',
    tier: 's3',
    name: 'Quyết định kiến trúc AI bằng ADR',
    canDo:
      'Ra quyết định build-vs-buy, RAG-vs-fine-tune, chọn model theo chi phí × chất lượng — bằng con số, và ghi lại bằng ADR đúng khuôn để người sau hiểu vì sao.',
    duration: '4–6 tuần',
    modules: [
      {
        id: 'principal-s3-m1',
        title: 'ADR — ghi lại quyết định',
        topics: [
          'Khuôn 5 phần: bối cảnh → lựa chọn đã cân → quyết định → đánh đổi → hệ quả',
          'ADR tồi vs ADR tốt: "chọn X vì X tốt" không phải là lý do',
          'Quyết định không ghi lại thì 6 tháng sau chính bạn cũng không nhớ vì sao',
        ],
      },
      {
        id: 'principal-s3-m2',
        title: 'Đánh đổi định lượng',
        topics: [
          'Build vs buy: điểm hoà vốn theo lượng dùng/tháng',
          'RAG vs fine-tune: chọn theo tần suất đổi dữ liệu và chi phí cập nhật',
          'Chọn model: loại phương án bị áp đảo (đắt hơn VÀ kém hơn), giữ đường biên hiệu quả',
        ],
      },
    ],
    project: {
      name: 'Hai ADR có đánh đổi định lượng',
      brief:
        'Viết 2 ADR thật cho hệ AI của bạn (từ P3–P4): mỗi ADR đủ 5 phần và phần đánh đổi có con số.',
      requirements: [
        'Mỗi ADR đủ 5 phần theo khuôn',
        'Ít nhất 2 lựa chọn được cân nhắc thật trong mỗi ADR',
        'Phần đánh đổi có bảng số (chi phí, độ trễ, công sức…) chứ không chỉ tính từ',
        'Hệ quả ghi cả mặt XẤU của phương án đã chọn',
      ],
    },
  },
  {
    id: 'principal-s4',
    tier: 's4',
    name: 'Dẫn dắt & trách nhiệm',
    canDo:
      'Review công việc AI của người khác theo checklist có cấu trúc, viết post-mortem không đổ lỗi, và phát hiện sự cố AI âm thầm trước khi nó thành khủng hoảng.',
    duration: '4–6 tuần',
    modules: [
      {
        id: 'principal-s4-m1',
        title: 'Review công việc AI',
        topics: [
          'Checklist 5 điểm: đúng yêu cầu? ca biên? bịa API? bảo mật? test?',
          'Đọc diff theo rủi ro: bảo mật > đúng đắn > hiệu năng > phong cách',
          'Nói thẳng rủi ro kèm đề xuất — im lặng cho qua là vi phạm',
        ],
      },
      {
        id: 'principal-s4-m2',
        title: 'Post-mortem & vận hành có trách nhiệm',
        topics: [
          'Post-mortem không đổ lỗi: dòng thời gian → nguyên nhân gốc (5 whys) → hành động có chủ',
          'Sự cố AI khác sự cố thường: hỏng âm thầm, theo xác suất — phải có ngưỡng cảnh báo',
          'Trách nhiệm với người dùng thật: dữ liệu, chi phí, kỳ vọng',
        ],
      },
    ],
    project: {
      name: 'Một bản review + một post-mortem theo khuôn',
      brief:
        'Review MỘT PR (của người khác hoặc AI sinh) theo checklist 5 điểm, và viết post-mortem cho MỘT sự cố thật bạn từng gặp.',
      requirements: [
        'Bản review đủ 5 mục checklist, mỗi mục có kết luận rõ',
        'Phát hiện xếp theo thứ tự rủi ro, mỗi phát hiện kèm đề xuất sửa',
        'Post-mortem đủ: dòng thời gian, 5 whys tới nguyên nhân gốc, hành động có người nhận và hạn',
        'Không câu nào đổ lỗi cá nhân — chỉ nói về hệ thống và quy trình',
      ],
    },
  },
]

const pathStageMap = new Map<string, SpecStage>(PATH_STAGES.map((s) => [s.id, s]))

/** Tra chặng RIÊNG của lộ trình theo id ('principal-s1'). undefined nếu id lạ — không đoán bừa. */
export function getPathStage(stageId: string): SpecStage | undefined {
  return pathStageMap.get(stageId.trim().toLowerCase())
}

/**
 * Tra một chặng theo id, bất kể nó sống ở tầng nào: hướng chuyên sâu trước (nguồn chính),
 * rồi tới chặng riêng của lộ trình. Mọi chỗ cần "chặng của lộ trình là gì" dùng hàm này.
 */
export function resolveStage(stageId: string): SpecStage | undefined {
  return getSpecStage(stageId) ?? getPathStage(stageId)
}
