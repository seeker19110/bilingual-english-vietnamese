// lessons/p6u97.ts — Chang "principal-s2: He tac tu & MCP", unit p6-u97 "Tool-use an toan &
// MCP" (docs/specs/2026-08-31-dot-4-p5-tam-truong.md muc principal-s2).
//
// Ca 2 bai deu language: 'javascript', noi tiep truc tiep bang tool + dispatch cua p6-u96.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U97_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u97-l1',
    unitId: 'p6-u97',
    language: 'javascript',
    title: 'Tool-use an toan — allowlist va kiem tham so truoc khi chay',
    hook: 'Mot AI agent duoc noi mang co the bi du go "goi tool xoaHetDuLieu" — neu code cua ban chi biet tra bang roi goi, no se lam theo. Ca tu de: KHONG bao gio chay tool truoc khi kiem hai thu — ten tool co nam trong danh sach duoc phep khong, va tham so co hop le khong.',
    theory:
      'Bai truoc dispatch tool theo ten ma chua kiem gi ca. O doi that, "ten tool" va "tham so" thuong den tu MOT AI khac (hoac tu nguoi dung go tay) — du lieu KHONG DANG TIN, phai kiem truoc khi chay.\n\nHai lop kiem, theo DUNG THU TU (kiem cai re/nhanh truoc):\n1. ALLOWLIST (danh sach cho phep) — chi nhung ten tool nam trong mot danh sach CO SAN moi duoc chay. Khac voi bang tool (co gi dispatch nay) o cho allowlist la RANH GIOI BAO MAT ro rang, thuong nho hon hoac bang bang tool day du (co the co tool "noi bo" khong cho AI tu goi).\n2. VALIDATE THAM SO — du ten tool hop le, tham so cung phai dung dinh dang. Vi du tool can MOT SO thi phai kiem chuoi dua vao co doi duoc sang so khong: Number(chuoi) roi kiem Number.isNaN(ket_qua) — chuoi khong phai so (vd "abc") se cho NaN.\n\nCa hai lop deu phai TU CHOI RO RANG khi that bai (khong chay tool, khong nem loi mo ho) — day la nen tang de bai sau (MCP) xay tren: mot "may chu tool" dang tin cay luon TU CHOI truoc, chay SAU.',
    workedExample: {
      code: `// Allowlist: chi cho phep goi cac tool trong danh sach nay
const allowlist = ["cong10", "nhan2"];
const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};

function goiToolAnToan(ten, thamSoChuoi) {
  if (!allowlist.includes(ten)) {           // (a) chan tool ngoai allowlist
    return "Tu choi: tool " + ten + " khong trong allowlist";
  }
  const thamSo = Number(thamSoChuoi);
  if (Number.isNaN(thamSo)) {               // (b) chan tham so khong phai so
    return "Tu choi: tham so khong hop le";
  }
  return "Ket qua: " + tools[ten](thamSo);  // (c) hop le -> chay that
}

console.log(goiToolAnToan("cong10", "5"));
console.log(goiToolAnToan("xoaHetDuLieu", "1"));
console.log(goiToolAnToan("nhan2", "abc"));`,
      stdinLines: [],
    },
    predict: {
      code: `console.log(Number.isNaN(Number("abc")));`,
      question: 'Number("abc") doi mot chuoi khong phai so sang so. Dong nay in ra gi?',
      choices: ['true', 'false', 'NaN', 'undefined'],
      answerIndex: 0,
      explain:
        'Number("abc") cho ra NaN (Not a Number). Number.isNaN(NaN) la true. Day chinh la cach kiem tham so hop le: doi sang so roi hoi "co phai NaN khong", chu khong so sanh truc tiep voi "NaN" (chuoi).',
    },
    parsons: {
      prompt: 'Xep dung thu tu kiem: allowlist truoc, tham so sau, chay that sau cung.',
      lines: [
        'if (!allowlist.includes(ten)) {',
        '    console.log("Tu choi: tool " + ten + " khong trong allowlist");',
        '} else {',
        '    const thamSo = Number(thamSoChuoi);',
        '    if (Number.isNaN(thamSo)) {',
        '        console.log("Tu choi: tham so khong hop le");',
        '    } else {',
        '        console.log("Ket qua: " + tools[ten](thamSo));',
        '    }',
        '}',
      ],
    },
    make: {
      prompt:
        'Viet ham goi tool AN TOAN voi allowlist chi gom "cong10" va "nhan2".\n\nChuong trinh doc 2 dong input():\n- Dong 1: ten tool.\n- Dong 2: tham so (chuoi — co the KHONG phai so).\n\nKiem theo dung thu tu:\n(a) Neu ten tool KHONG nam trong allowlist ["cong10", "nhan2"], in dung 1 dong:\nTu choi: tool <ten> khong trong allowlist\n(b) Neu ten hop le nhung tham so doi sang so bi NaN (dung Number(...) roi Number.isNaN(...)), in dung 1 dong:\nTu choi: tham so khong hop le\n(c) Neu ca hai deu hop le, chay tool va in dung 1 dong:\nKet qua: <ket qua>',
      starterCode: `const allowlist = ["cong10", "nhan2"];
const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const ten = input("");
const thamSoChuoi = input("");
// (a) ten khong trong allowlist -> "Tu choi: tool <ten> khong trong allowlist"
// (b) tham so khong phai so (Number.isNaN) -> "Tu choi: tham so khong hop le"
// (c) hop le ca hai -> "Ket qua: <ket qua>"
`,
      testCases: [
        {
          stdinLines: ['cong10', '5'],
          expected: 'Ket qua: 15',
          match: 'contains',
          hidden: false,
          label: 'Tool hop le, tham so hop le -> chay that',
        },
        {
          stdinLines: ['xyz', '5'],
          expected: 'Tu choi: tool xyz khong trong allowlist',
          match: 'contains',
          hidden: false,
          label: 'Tool ngoai allowlist bi tu choi ngay, khong xet tham so',
        },
        {
          stdinLines: ['nhan2', 'abc'],
          expected: 'Tu choi: tham so khong hop le',
          match: 'contains',
          hidden: true,
          label: 'Ca an: tool hop le nhung tham so khong doi duoc sang so',
        },
      ],
      hints: [
        'allowlist.includes(ten) tra ve true/false — dung dau ! de kiem "khong nam trong".',
        'Doi tham so bang Number(thamSoChuoi) roi kiem Number.isNaN(...) — "5" doi thanh 5 (khong NaN), "abc" doi thanh NaN.',
        'Kiem allowlist TRUOC, tham so SAU: dung if / else if / else long nhau dung thu tu (a) -> (b) -> (c).',
      ],
      sampleSolution: `const allowlist = ["cong10", "nhan2"];
const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const ten = input("");
const thamSoChuoi = input("");
if (!allowlist.includes(ten)) {
  console.log("Tu choi: tool " + ten + " khong trong allowlist");
} else {
  const thamSo = Number(thamSoChuoi);
  if (Number.isNaN(thamSo)) {
    console.log("Tu choi: tham so khong hop le");
  } else {
    console.log("Ket qua: " + tools[ten](thamSo));
  }
}`,
    },
    homework:
      'Tim 2 vi du that ngoai doi noi "allowlist" (danh sach cho phep) dang duoc dung de bao ve mot he thong (vd: ngan hang chi cho rut tien tu ATM/chi nhanh cua chinh no, wifi cong ty chi cho thiet bi da dang ky). Voi moi vi du, tra loi: neu KHONG co allowlist, dieu gi te nhat co the xay ra?',
    srsCards: [
      {
        hoi: 'Vi sao chi co bang tool (dispatch) la chua du an toan cho mot agent that?',
        dap: 'Ten tool va tham so thuong den tu du lieu KHONG DANG TIN (AI khac, nguoi dung go tay). Khong kiem truoc, agent co the bi du goi tool nguy hiem hoac chay voi tham so sai dinh dang.',
      },
      {
        hoi: 'Hai lop kiem an toan truoc khi chay mot tool la gi, theo dung thu tu?',
        dap: 'Allowlist truoc (ten tool co nam trong danh sach duoc phep khong) roi moi validate tham so (dung dinh dang, vd Number.isNaN de kiem so hop le) — kiem re/nhanh truoc, chi chay that khi ca hai deu qua.',
      },
      {
        hoi: 'Cach kiem mot chuoi co doi duoc sang so hop le khong trong JavaScript?',
        dap: 'Number(chuoi) roi kiem Number.isNaN(ket_qua) — chuoi khong phai so (vd "abc") se cho NaN, Number.isNaN(NaN) la true.',
      },
    ],
  },
  {
    id: 'p6-u97-l2',
    unitId: 'p6-u97',
    language: 'javascript',
    title: 'MCP la gi — hop dong liet ke tool va goi tool',
    hook: 'Moi cong ty AI tung tu bia ra cach rieng de noi AI voi tool: dinh dang khac nhau, ten ham khac nhau, khong ai doc duoc cua ai. MCP (Model Context Protocol) giai quyet dung MOT van de: chuan hoa hai viec — "liet ke may co tool gi" va "goi mot tool theo ten" — de MOI AI noi duoc voi MOI may chu tool, khong can biet truoc no viet bang gi.',
    theory:
      'MCP (Model Context Protocol) KHONG phai mot thu vien hay mot AI — no la mot HOP DONG (giao thuc): mot bo luat chung ve cach AI va "may chu tool" (MCP server) noi chuyen voi nhau. Ban khong can dung server that de hieu no — chi can thay day chinh la BANG TOOL cua bai p6-u96, nhung duoc CHUAN HOA de dung chung.\n\nMot MCP server, boc gon lai, chi can tra loi duoc HAI cau hoi:\n1. LIET KE (list tools) — "may co nhung tool nao?" Tra ve mot danh sach, moi tool co TEN + MO TA (de AI biet no dung de lam gi ma khong can doc code).\n2. GOI (call tool) — "hay chay tool ten X" — AI goi dung TEN, server tim tool do va thuc thi.\n\nVi sao chuan hoa quan trong: truoc MCP, moi AI (Claude, GPT, Gemini...) muon dung mot tool moi (vd "doc file Google Drive") thi phai viet rieng mot lop tich hop cho AI do. Co MCP, ai lam mot MCP server cho Google Drive MOT LAN, MOI AI ho tro MCP deu dung duoc ngay — giong nhu USB chuan hoa cach cam thiet bi vao may tinh, khong can moi hang lam moi rieng.\n\nBai nay mo phong dung 2 hanh vi cot loi do BANG MOT OBJECT JS co dinh (khong dung server that, khong can mang) — de nam chac PHAN GOC RE truoc khi dung cong cu that ngoai doi.',
    workedExample: {
      code: `// "May chu" MCP toi gian: chi la MOT OBJECT mo ta cac tool no co
const server = {
  tools: [
    { name: "congTien", mota: "Cong hai khoan tien lai" },
    { name: "tru", mota: "Tru hai so tien" },
  ],
};

// (1) Liet ke: AI hoi "may co tool gi?" -> doc danh sach nay
for (const tool of server.tools) {
  console.log(tool.name + ": " + tool.mota);
}

// (2) Goi theo ten: AI noi "goi tool congTien" -> tim trong danh sach
const timThay = server.tools.some((t) => t.name === "congTien");
console.log(timThay ? "Da goi: congTien" : "Loi: khong co tool congTien");`,
      stdinLines: [],
    },
    predict: {
      code: `const server = { tools: [{ name: "a", mota: "x" }, { name: "b", mota: "y" }] };
console.log(server.tools.some((t) => t.name === "b"));`,
      question:
        'server.tools.some(...) kiem "co PHAN TU nao khop dieu kien khong". Dong nay in ra gi?',
      choices: ['true', 'false', 'b', 'undefined'],
      answerIndex: 0,
      explain:
        'server.tools co phan tu { name: "b", mota: "y" } khop dieu kien t.name === "b", nen .some(...) tra ve true. Day chinh la cach mot MCP server "tim xem co tool nay khong" truoc khi goi.',
    },
    parsons: {
      prompt:
        'Xep dung xu ly lenh MCP toi gian: "list" thi liet ke het, "call <ten>" thi tim va bao ket qua.',
      lines: [
        'const lenh = input("");',
        'if (lenh === "list") {',
        '    for (const tool of server.tools) {',
        '        console.log(tool.name + ": " + tool.mota);',
        '    }',
        '} else if (lenh.startsWith("call ")) {',
        '    const ten = lenh.slice(5);',
        '    const timThay = server.tools.some((t) => t.name === ten);',
        '    console.log(timThay ? "Da goi: " + ten : "Loi: khong co tool " + ten);',
        '}',
      ],
    },
    make: {
      prompt:
        'Mo phong hai hanh vi cot loi cua MCP tren mot "server" mo ta san (bien server trong starterCode).\n\nChuong trinh doc 1 dong input() la mot LENH:\n- Neu lenh la "list": in tung dong "<ten>: <mo ta>" cho MOI tool, theo DUNG thu tu khai bao trong server.tools.\n- Neu lenh bat dau bang "call " (co dau cach): lay phan sau "call " lam ten tool. Neu ten do CO trong server.tools, in dung 1 dong "Da goi: <ten>"; neu KHONG co, in dung 1 dong "Loi: khong co tool <ten>".',
      starterCode: `const server = {
  tools: [
    { name: "congTien", mota: "Cong hai khoan tien lai" },
    { name: "tru", mota: "Tru hai so tien" },
  ],
};
const lenh = input("");
// lenh === "list" -> in tung dong "<ten>: <mo ta>" theo dung thu tu server.tools
// lenh bat dau "call " -> lay ten sau "call ", kiem co trong server.tools khong
//   co -> "Da goi: <ten>" ; khong co -> "Loi: khong co tool <ten>"
`,
      testCases: [
        {
          stdinLines: ['list'],
          expected: 'congTien: Cong hai khoan tien lai\ntru: Tru hai so tien',
          match: 'contains',
          hidden: false,
          label: 'Lenh "list" in du 2 tool dung thu tu khai bao',
        },
        {
          stdinLines: ['call congTien'],
          expected: 'Da goi: congTien',
          match: 'contains',
          hidden: false,
          label: 'Goi dung ten tool co san',
        },
        {
          stdinLines: ['call xyz'],
          expected: 'Loi: khong co tool xyz',
          match: 'contains',
          hidden: true,
          label: 'Ca an: goi ten khong co trong server.tools',
        },
      ],
      hints: [
        'Duyet server.tools bang "for (const tool of server.tools)" — moi phan tu co tool.name va tool.mota.',
        'lenh.startsWith("call ") kiem lenh co bat dau bang "call " (co dau cach) khong; lenh.slice(5) lay phan con lai sau 5 ky tu dau ("call " co 5 ky tu).',
        'Dung server.tools.some((t) => t.name === ten) de kiem ten co ton tai trong danh sach khong, roi in dung thong bao tuong ung.',
      ],
      sampleSolution: `const server = {
  tools: [
    { name: "congTien", mota: "Cong hai khoan tien lai" },
    { name: "tru", mota: "Tru hai so tien" },
  ],
};
const lenh = input("");
if (lenh === "list") {
  for (const tool of server.tools) {
    console.log(tool.name + ": " + tool.mota);
  }
} else if (lenh.startsWith("call ")) {
  const ten = lenh.slice(5);
  const timThay = server.tools.some((t) => t.name === ten);
  console.log(timThay ? "Da goi: " + ten : "Loi: khong co tool " + ten);
}`,
    },
    homework:
      'Tim hieu (doc them, khong can code) mot MCP server that dang duoc noi toi trong cong dong (vd server cho file he thong, cho trinh duyet, cho co so du lieu). No cung tra loi hai cau hoi "co tool gi" va "goi the nao" giong bai nay — hay liet ke 3 tool no co the co va mo ta ngan cho tung tool, theo dung khuon "<ten>: <mo ta>" da luyen o bai nay.',
    srsCards: [
      {
        hoi: 'MCP (Model Context Protocol) la gi, noi mot cau?',
        dap: 'Mot hop dong (giao thuc) chuan hoa cach AI va "may chu tool" noi chuyen: bat ky AI ho tro MCP nao cung goi duoc bat ky MCP server nao theo cung mot cach, khong can biet truoc no viet bang gi.',
      },
      {
        hoi: 'MCP server phai tra loi duoc DUNG hai cau hoi nao?',
        dap: 'Liet ke (list tools) — may co nhung tool nao, moi tool co ten + mo ta. Goi (call tool) — chay mot tool theo dung ten duoc yeu cau.',
      },
      {
        hoi: 'Vi sao chuan hoa (nhu MCP) quan trong hon la moi AI tu viet lop tich hop rieng?',
        dap: 'Khong chuan hoa: mot tool moi phai duoc tich hop rieng cho TUNG AI. Chuan hoa: mot MCP server viet MOT LAN, MOI AI ho tro MCP dung duoc ngay — giong USB chuan hoa cach cam thiet bi, khong can moi hang lam rieng.',
      },
    ],
  },
]
