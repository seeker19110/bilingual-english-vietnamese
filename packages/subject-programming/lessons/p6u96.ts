// lessons/p6u96.ts — Chặng "principal-s2: He tac tu & MCP", unit p6-u96 "Vong lap agent toi
// gian" (docs/specs/2026-08-31-dot-4-p5-tam-truong.md muc principal-s2).
//
// Ca 2 bai deu language: 'javascript' vi mo phong agent goi tool hop tu nhien voi object JS
// (bang ten -> ham). Chay qua wrapJavaScript()/node:vm nhu moi bai JS khac (jsPrelude.ts).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U96_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u96-l1',
    unitId: 'p6-u96',
    language: 'javascript',
    title: 'Vong lap agent toi gian — bang tool va dispatch theo ten',
    hook: 'ChatGPT tra loi duoc "hom nay Ha Noi bao nhieu do" khong phai vi no biet thoi tiet — no GOI MOT TOOL (ham lay du lieu thoi tiet) roi doc ket qua. Ban dau tien cua moi agent: mot BANG TOOL anh xa ten -> ham, va mot ham dispatch tra bang theo dung ten duoc goi.',
    theory:
      'AGENT (tac tu) o muc don gian nhat khong co gi huyen bi: no la mot CHUONG TRINH co the goi TOOL (ham) theo TEN, thay vi chi chay mot duong logic cung.\n\nHai manh ghep can co:\n1. BANG TOOL — mot object JS anh xa TEN CHUOI sang HAM: { congTien: (x) => x + 10, ... }. Moi tool la mot ham binh thuong, chi khac la no duoc goi GIAN TIEP qua ten.\n2. DISPATCH — ham nhan vao ten + tham so, TRA BANG de tim ham tuong ung roi goi no. tools[ten] tra ve ham neu co, hoac undefined neu ten khong ton tai trong bang.\n\nDiem mau chot de agent AN TOAN: KHONG bao gio gia dinh tool luon ton tai. Ten tool co the sai chinh ta, bi AI "bia" ra, hoac chua duoc dang ky — dispatch phai KIEM tools[ten] === undefined truoc, tra ve LOI RO RANG thay vi de chuong trinh sap (goi undefined nhu ham se nem TypeError kho hieu).\n\nDay chinh la buoc dau cua vong lap agent day du (nghi -> goi tool -> doc ket qua -> lap, hoc o bai sau): moi lan "nghi xong mot buoc", agent can MOT LAN dispatch nhu the nay.',
    workedExample: {
      code: `// Bang tool: ten -> ham xu ly
const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};

// Dispatch: tra bang theo ten, tra loi ro neu khong co
function goiTool(ten, thamSo) {
  const ham = tools[ten];
  if (ham === undefined) {          // ten khong co trong bang
    return "Loi: khong co tool " + ten;
  }
  return "Ket qua: " + ham(thamSo); // co trong bang -> goi ham
}

console.log(goiTool("cong10", 5));  // 5 + 10 = 15
console.log(goiTool("xyz", 5));     // "xyz" khong co trong bang`,
      stdinLines: [],
    },
    predict: {
      code: `const tools = { nhan2: (x) => x * 2 };
const ham = tools["nhan2"];
console.log(ham(7));`,
      question: 'Doan code tra bang tools theo ten "nhan2" roi goi ham do voi 7. In ra gi?',
      choices: ['14', '7', 'undefined', 'NaN'],
      answerIndex: 0,
      explain:
        'tools["nhan2"] tra ve ham (x) => x * 2, goi voi 7 ra 14. Day chinh la co che dispatch: KHONG goi thang nhan2(7) trong code, ma tra bang qua chuoi ten roi moi goi.',
    },
    parsons: {
      prompt:
        'Xep dung ham dispatch: dinh nghia bang tool -> tra bang theo ten -> kiem khong co -> goi ham.',
      lines: [
        'const tools = { cong10: (x) => x + 10, nhan2: (x) => x * 2 };',
        'function goiTool(ten, thamSo) {',
        '    const ham = tools[ten];',
        '    if (ham === undefined) {',
        '        return "Loi: khong co tool " + ten;',
        '    }',
        '    return "Ket qua: " + ham(thamSo);',
        '}',
      ],
    },
    make: {
      prompt:
        'Viet ham dispatch goi tool theo ten, co san bang tool "cong10" (cong 10 vao tham so) va "nhan2" (nhan doi tham so).\n\nChuong trinh doc 2 dong input():\n- Dong 1: ten tool (chuoi).\n- Dong 2: tham so (mot so).\n\nNeu ten tool KHONG co trong bang, in dung 1 dong:\nLoi: khong co tool <ten>\n\nNeu co, in dung 1 dong:\nKet qua: <ket qua sau khi ap dung tool>',
      starterCode: `const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const ten = input("");
const thamSo = Number(input(""));
// Tra bang tools theo ten:
// - khong co -> in "Loi: khong co tool <ten>"
// - co -> in "Ket qua: <ket qua>"
`,
      testCases: [
        {
          stdinLines: ['cong10', '5'],
          expected: 'Ket qua: 15',
          match: 'contains',
          hidden: false,
          label: 'cong10 voi tham so 5 -> 15',
        },
        {
          stdinLines: ['nhan2', '8'],
          expected: 'Ket qua: 16',
          match: 'contains',
          hidden: false,
          label: 'nhan2 voi tham so 8 -> 16',
        },
        {
          stdinLines: ['xyz', '3'],
          expected: 'Loi: khong co tool xyz',
          match: 'contains',
          hidden: true,
          label: 'Ca an: ten tool khong co trong bang -> loi ro rang',
        },
      ],
      hints: [
        'Bang tool da co san o starterCode — dung tools[ten] de tra, dung tu viet if/else so sanh tung ten.',
        'tools[ten] tra ve undefined khi ten khong ton tai trong object — kiem === undefined truoc khi goi ham.',
        'console.log("Loi: khong co tool " + ten) hoac console.log("Ket qua: " + tools[ten](thamSo)) — nho Number(input("")) de tham so la so, khong phai chuoi.',
      ],
      sampleSolution: `const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const ten = input("");
const thamSo = Number(input(""));
const ham = tools[ten];
if (ham === undefined) {
  console.log("Loi: khong co tool " + ten);
} else {
  console.log("Ket qua: " + ham(thamSo));
}`,
    },
    homework:
      'Nghi ra 3 tool that su huu ich cho mot "tro ly hoc tap" (vd: tra tu dien, tinh diem trung binh, doi don vi). Voi moi tool, viet ten + mot cau mo ta no lam gi + no can may tham so. Day chinh la nhung gi ban se can khi lam viec voi MCP (bai sau) — moi tool that deu bat dau tu mot mo ta ro rang nhu the nay.',
    srsCards: [
      {
        hoi: 'Bang tool cua agent la gi?',
        dap: 'Mot object JS anh xa TEN CHUOI sang HAM xu ly (vd { cong10: (x) => x + 10 }). Agent goi tool GIAN TIEP qua ten, khong goi thang ten ham trong code.',
      },
      {
        hoi: 'Vi sao dispatch phai kiem tools[ten] === undefined truoc khi goi?',
        dap: 'Ten tool co the sai hoac chua dang ky. Goi thang mot gia tri undefined nhu ham se nem loi kho hieu; kiem truoc cho phep tra ve thong bao loi RO RANG ("khong co tool <ten>") thay vi sap chuong trinh.',
      },
      {
        hoi: 'Dispatch theo ten khac goi ham truc tiep o diem nao?',
        dap: 'Goi truc tiep: ten ham co dinh trong code luc viet (nhan2(7)). Dispatch: ten la MOT CHUOI DU LIEU (co the tu input, tu AI), tra bang luc CHAY roi moi goi — cho phep them/bot tool ma khong sua logic goi.',
      },
    ],
  },
  {
    id: 'p6-u96-l2',
    unitId: 'p6-u96',
    language: 'javascript',
    title: 'Vong lap agent nhieu buoc — dieu kien dung',
    hook: 'Mot agent that khong dung sau MOT lan goi tool — no lap: goi tool, doc ket qua, quyet dinh buoc tiep theo, cho toi khi xong VIEC hoac het gioi han an toan. Thieu dieu kien dung ro rang, agent co the lap vo han va dot tien API that.',
    theory:
      'VONG LAP AGENT day du: nghi -> goi tool -> doc ket qua -> lap. Bai truoc da cai xong "goi tool"; bai nay cai phan VONG LAP + DIEU KIEN DUNG.\n\nMot vong lap agent AN TOAN can HAI dieu kien dung, khong duoc thieu cai nao:\n1. Dung "tu nhien" — gap mot tool dac biet bao "xong" (hoac ket qua cho thay viec da hoan thanh). Day la duong dung binh thuong.\n2. Dung "an toan" — chay het so buoc toi da cho phep, du chua gap "xong". Day la LUOI CHAN chong lap vo han khi logic sai hoac AI cu "nghi" mai khong quyet dinh xong.\n\nMoi buoc trong vong lap nen duoc GHI LOG (so thu tu buoc, tool nao, ket qua gi) — day la thu duy nhat giup nguoi debug hieu agent da lam gi khi no chay sai. Vong lap khong log gi ca la mot hop den khong ai sua duoc.\n\nKhi mot buoc GAP LOI (tool khong ton tai) trong luc dang chay nhieu buoc, cach an toan la DUNG NGAY chu khong chay tiep cac buoc con lai — vi buoc sau co the phu thuoc vao ket qua buoc truoc, chay tiep tren du lieu sai la lam moi thu te hon.',
    workedExample: {
      code: `// Vong lap agent nhieu buoc, dung khi gap "xong" hoac het danh sach
const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};

function chayAgent(danhSachTool) {
  let giaTri = 0; // bat dau tu 0
  for (let i = 0; i < danhSachTool.length; i++) {
    const ten = danhSachTool[i];
    const buoc = i + 1;
    if (ten === "xong") {           // dieu kien dung tu nhien
      console.log("Buoc " + buoc + ": xong -> dung");
      return;
    }
    const ham = tools[ten];
    if (ham === undefined) {        // gap loi -> dung ngay, khong chay tiep
      console.log("Buoc " + buoc + ": loi " + ten);
      return;
    }
    giaTri = ham(giaTri);
    console.log("Buoc " + buoc + ": " + ten + " -> " + giaTri);
  }
}

chayAgent(["cong10", "nhan2", "xong", "cong10"]);`,
      stdinLines: [],
    },
    predict: {
      code: `let giaTri = 0;
giaTri = giaTri + 10;
giaTri = giaTri * 2;
console.log(giaTri);`,
      question: 'Bat dau tu 0, cong 10 roi nhan 2 — in ra gi?',
      choices: ['20', '10', '40', '30'],
      answerIndex: 0,
      explain:
        '(0 + 10) * 2 = 20. Day dung cong thuc ap dung tuan tu tung tool len giaTri nhu vong lap agent lam.',
    },
    parsons: {
      prompt:
        'Xep dung vong lap nhieu buoc: duyet tung ten -> gap "xong" thi dung -> khong thi ap dung tool va log.',
      lines: [
        'for (let i = 0; i < danhSachTool.length; i++) {',
        '    const ten = danhSachTool[i];',
        '    const buoc = i + 1;',
        '    if (ten === "xong") {',
        '        console.log("Buoc " + buoc + ": xong -> dung");',
        '        return;',
        '    }',
        '    giaTri = tools[ten](giaTri);',
        '    console.log("Buoc " + buoc + ": " + ten + " -> " + giaTri);',
        '}',
      ],
    },
    make: {
      prompt:
        'Mo phong agent chay nhieu buoc voi bang tool "cong10"/"nhan2" nhu bai truoc.\n\nChuong trinh doc 1 dong input(): danh sach ten tool cach nhau dau phay, vi du "cong10,nhan2,xong,cong10".\n\nChay lan luot tu gia tri 0. Voi MOI buoc, in dung 1 dong:\nBuoc <so thu tu tu 1>: <ten tool> -> <gia tri sau khi ap dung>\n\nKhi gap tool "xong": in dung 1 dong "Buoc <so>: xong -> dung" ROI DUNG NGAY (khong chay tiep cac tool con lai trong danh sach).\n\nKhi gap ten tool LA (khong co trong bang): in dung 1 dong "Buoc <so>: loi <ten>" ROI DUNG NGAY.\n\nNeu het danh sach ma chua gap "xong" hay loi thi vong lap tu ket thuc binh thuong.',
      starterCode: `const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const danhSach = input("").split(",");
let giaTri = 0;
// Duyet tung ten trong danhSach:
// - "xong" -> in "Buoc N: xong -> dung" roi dung han
// - ten la -> in "Buoc N: loi <ten>" roi dung han
// - ten hop le -> cap nhat giaTri, in "Buoc N: <ten> -> <giaTri>"
`,
      testCases: [
        {
          stdinLines: ['cong10,nhan2,xong,cong10'],
          expected: 'Buoc 1: cong10 -> 10\nBuoc 2: nhan2 -> 20\nBuoc 3: xong -> dung',
          match: 'contains',
          hidden: false,
          label: 'Dung dung luc "xong", khong chay them tool thu 4',
        },
        {
          stdinLines: ['nhan2,cong10'],
          expected: 'Buoc 1: nhan2 -> 0\nBuoc 2: cong10 -> 10',
          match: 'contains',
          hidden: false,
          label: 'Het danh sach ma khong gap "xong" thi tu ket thuc',
        },
        {
          stdinLines: ['cong10,xyz,nhan2'],
          expected: 'Buoc 1: cong10 -> 10\nBuoc 2: loi xyz',
          match: 'contains',
          hidden: true,
          label: 'Ca an: gap tool la thi bao loi va dung ngay, khong chay buoc 3',
        },
      ],
      hints: [
        'Dung vong for voi bien dem i tu 0, buoc hien thi la i + 1 (so thu tu tu 1, khong phai tu 0).',
        'Kiem "xong" TRUOC khi tra bang tools — day la ten dac biet, khong phai ten tool that.',
        'Kiem tools[ten] === undefined de bat ten la; dung "return" (hoac "break" neu ham khong bao boc trong function rieng) de dung han vong lap ngay khi gap "xong" hoac loi.',
      ],
      sampleSolution: `const tools = {
  cong10: (x) => x + 10,
  nhan2: (x) => x * 2,
};
const danhSach = input("").split(",");
let giaTri = 0;
for (let i = 0; i < danhSach.length; i++) {
  const ten = danhSach[i];
  const buoc = i + 1;
  if (ten === "xong") {
    console.log("Buoc " + buoc + ": xong -> dung");
    break;
  }
  const ham = tools[ten];
  if (ham === undefined) {
    console.log("Buoc " + buoc + ": loi " + ten);
    break;
  }
  giaTri = ham(giaTri);
  console.log("Buoc " + buoc + ": " + ten + " -> " + giaTri);
}`,
    },
    homework:
      'Vong lap bai nay dung khi het danh sach — trong doi that agent khong co "danh sach san", no phai TU QUYET DINH buoc tiep theo dua tren ket qua buoc truoc. Hay viet 3-4 cau: neu ban them mot GIOI HAN SO BUOC TOI DA (vi du toi da 5 buoc) vao dung logic hien tai, ban se sua dieu kien vong lap for o dau, va vi sao gioi han nay can thiet du agent "co ve" luon dung dung luc?',
    srsCards: [
      {
        hoi: 'Vong lap agent day du gom 4 buoc nao?',
        dap: 'Nghi -> goi tool -> doc ket qua -> lap. Lap lai tu dau cho toi khi dat dieu kien dung.',
      },
      {
        hoi: 'Vi sao vong lap agent can HAI dieu kien dung, khong chi mot?',
        dap: 'Dung "tu nhien" (gap tin hieu hoan thanh nhu tool "xong") xu ly ca binh thuong; dung "an toan" (gioi han so buoc toi da) la luoi chan chong lap vo han khi logic sai hoac agent khong bao gio quyet dinh xong.',
      },
      {
        hoi: 'Khi mot buoc trong vong lap agent gap loi (vd tool khong ton tai), nen lam gi?',
        dap: 'Dung ngay, khong chay tiep cac buoc con lai — vi cac buoc sau thuong phu thuoc ket qua buoc truoc, chay tiep tren du lieu sai chi lam tinh trang te hon. Ghi log ro buoc nao loi de nguoi debug hieu duoc.',
      },
    ],
  },
]
