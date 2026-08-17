// apps/english/src/data/stemCurriculum.ts — Kho dữ liệu học tập chuẩn hóa cho các môn STEM (V2-12)
// Bám sát khung mạch kiến thức GDPT 2018 (Toán, Vật lý, Hóa học, Sinh học)

export interface StemChapter {
  id: string
  title: string
  description: string
  keyFormulas: Array<{ name: string; formula: string; note?: string }>
  sampleProblems: Array<{
    id: string
    title: string
    prompt: string
    difficulty: 'basic' | 'intermediate' | 'advanced'
    solutionSteps: Array<{ title: string; detail: string; formula?: string }>
  }>
}

export interface StemGradeCurriculum {
  grade: 'grade_10' | 'grade_11' | 'grade_12' | 'university'
  gradeLabel: string
  chapters: StemChapter[]
}

export const STEM_CURRICULUM: Record<string, StemGradeCurriculum[]> = {
  mathematics: [
    {
      grade: 'grade_12',
      gradeLabel: 'Lớp 12 (Thi THPTQG)',
      chapters: [
        {
          id: 'm12_c1',
          title: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
          description:
            'Tính đơn điệu, cực trị, giá trị lớn nhất - nhỏ nhất, đường tiệm cận và khảo sát hàm số.',
          keyFormulas: [
            {
              name: 'Điều kiện đơn điệu',
              formula: "f'(x) ≥ 0, ∀x ∈ K ⇒ f(x) đồng biến trên K",
              note: 'Dấu bằng xảy ra tại hữu hạn điểm',
            },
            {
              name: 'Cực trị bậc 3',
              formula: "y = ax^3 + bx^2 + cx + d ⇒ y' = 3ax^2 + 2bx + c = 0",
              note: 'Có 2 cực trị ⇔ b^2 - 3ac > 0',
            },
            { name: 'Tiệm cận ngang', formula: 'lim (x → ±∞) f(x) = y0 ⇒ y = y0 là TCN' },
            { name: 'Tiệm cận đứng', formula: 'lim (x → x0) f(x) = ±∞ ⇒ x = x0 là TCĐ' },
          ],
          sampleProblems: [
            {
              id: 'm12_p1',
              title: 'Tìm cực trị của hàm số bậc ba',
              prompt: 'Tìm tất cả các giá trị cực trị của hàm số y = x^3 - 3x^2 + 2.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Tập xác định & Đạo hàm',
                  detail: 'Tập xác định D = R.',
                  formula: "y' = 3x^2 - 6x = 3x(x - 2)",
                },
                {
                  title: 'Bước 2: Tìm nghiệm đạo hàm',
                  detail: "y' = 0 ⇔ 3x(x - 2) = 0",
                  formula: 'x = 0 hoặc x = 2',
                },
                {
                  title: 'Bước 3: Lập bảng biến thiên',
                  detail: "y' > 0 trên (-∞; 0) và (2; +∞); y' < 0 trên (0; 2).",
                },
                {
                  title: 'Bước 4: Kết luận',
                  detail:
                    'Hàm số đạt cực đại tại x = 0, y_CĐ = 2; đạt cực tiểu tại x = 2, y_CT = -2.',
                },
              ],
            },
          ],
        },
        {
          id: 'm12_c2',
          title: 'Chương 2: Nguyên hàm, Tích phân và Ứng dụng',
          description:
            'Định nghĩa nguyên hàm, các phương pháp tính tích phân, ứng dụng tính diện tích và thể tích.',
          keyFormulas: [
            { name: 'Tích phân từng phần', formula: '∫ u dv = u*v - ∫ v du' },
            { name: 'Diện tích hình phẳng', formula: 'S = ∫ |f(x) - g(x)| dx từ a đến b' },
            { name: 'Thể tích khối tròn xoay', formula: 'V = π * ∫ [f(x)]^2 dx từ a đến b' },
          ],
          sampleProblems: [
            {
              id: 'm12_p2',
              title: 'Tính tích phân từng phần',
              prompt: 'Tính tích phân I = ∫ (2x + 1) * e^x dx từ 0 đến 1.',
              difficulty: 'intermediate',
              solutionSteps: [
                {
                  title: 'Bước 1: Đặt u và dv',
                  detail: 'Đặt u = 2x + 1 ⇒ du = 2 dx\nĐặt dv = e^x dx ⇒ v = e^x',
                },
                {
                  title: 'Bước 2: Áp dụng công thức',
                  detail: 'I = (2x + 1)*e^x |[0..1] - ∫ 2*e^x dx |[0..1]',
                  formula: 'I = (3e - 1) - 2(e - 1) = e + 1',
                },
                { title: 'Bước 3: Kết luận', detail: 'Giá trị tích phân I = e + 1.' },
              ],
            },
          ],
        },
        {
          id: 'm12_c3',
          title: 'Chương 3: Phương pháp tọa độ trong không gian Oxyz',
          description:
            'Hệ trục tọa độ, phương trình mặt phẳng, phương trình đường thẳng và phương trình mặt cầu.',
          keyFormulas: [
            {
              name: 'Mặt cầu tâm I(a,b,c) bán kính R',
              formula: '(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2',
            },
            {
              name: 'Khoảng cách từ điểm M0 đến mặt phẳng (P)',
              formula: 'd(M0, (P)) = |A*x0 + B*y0 + C*z0 + D| / √(A^2 + B^2 + C^2)',
            },
          ],
          sampleProblems: [
            {
              id: 'm12_p3',
              title: 'Viết phương trình mặt phẳng đi qua 1 điểm và vuông góc đường thẳng',
              prompt:
                'Trong không gian Oxyz, viết phương trình mặt phẳng (P) đi qua điểm A(1, -2, 3) và nhận vectơ n = (2, -1, 4) làm vectơ pháp tuyến.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Dạng phương trình mặt phẳng',
                  detail: 'Mặt phẳng đi qua A(x0, y0, z0) có VTPT n = (A, B, C) có dạng:',
                  formula: 'A(x - x0) + B(y - y0) + C(z - z0) = 0',
                },
                {
                  title: 'Bước 2: Thay số tọa độ',
                  detail: 'Thay A(1, -2, 3) và n = (2, -1, 4):',
                  formula: '2(x - 1) - 1(y + 2) + 4(z - 3) = 0 ⇔ 2x - y + 4z - 16 = 0',
                },
                {
                  title: 'Bước 3: Kết luận',
                  detail: 'Phương trình mặt phẳng (P) là: 2x - y + 4z - 16 = 0.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      grade: 'grade_11',
      gradeLabel: 'Lớp 11',
      chapters: [
        {
          id: 'm11_c1',
          title: 'Hàm số lượng giác và Phương trình lượng giác',
          description:
            'Công thức biến đổi lượng giác, hàm số sin, cos, tan, cot và các phương trình lượng giác cơ bản.',
          keyFormulas: [
            { name: 'sin(x) = sin(α)', formula: 'x = α + k2π hoặc x = π - α + k2π (k ∈ Z)' },
            { name: 'cos(x) = cos(α)', formula: 'x = ±α + k2π (k ∈ Z)' },
          ],
          sampleProblems: [
            {
              id: 'm11_p1',
              title: 'Giải phương trình lượng giác bậc 2',
              prompt: 'Giải phương trình: 2*cos^2(x) + 3*sin(x) - 3 = 0.',
              difficulty: 'intermediate',
              solutionSteps: [
                {
                  title: 'Bước 1: Đưa về cùng một hàm sin',
                  detail: 'Sử dụng cos^2(x) = 1 - sin^2(x):',
                  formula: '2(1 - sin^2(x)) + 3*sin(x) - 3 = 0 ⇔ -2*sin^2(x) + 3*sin(x) - 1 = 0',
                },
                {
                  title: 'Bước 2: Giải nghiệm sin(x)',
                  detail: 'Giải phương trình bậc 2 theo sin(x):',
                  formula: 'sin(x) = 1 hoặc sin(x) = 1/2',
                },
                {
                  title: 'Bước 3: Kết luận họ nghiệm',
                  detail:
                    '• sin(x) = 1 ⇔ x = π/2 + k2π\n• sin(x) = 1/2 ⇔ x = π/6 + k2π hoặc x = 5π/6 + k2π (k ∈ Z).',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  physics: [
    {
      grade: 'grade_12',
      gradeLabel: 'Lớp 12 (Thi THPTQG)',
      chapters: [
        {
          id: 'p12_c1',
          title: 'Chương 1: Dao động cơ học',
          description:
            'Dao động điều hòa, con lắc lò xo, con lắc đơn, dao động tắt dần, cưỡng bức và cộng hưởng.',
          keyFormulas: [
            { name: 'Phương trình dao động', formula: 'x = A*cos(ωt + φ)' },
            { name: 'Vận tốc & Gia tốc', formula: 'v = -ω*A*sin(ωt + φ), a = -ω^2*x' },
            { name: 'Chu kỳ con lắc lò xo', formula: 'T = 2π * √(m / k)' },
            { name: 'Chu kỳ con lắc đơn', formula: 'T = 2π * √(l / g)' },
          ],
          sampleProblems: [
            {
              id: 'p12_p1',
              title: 'Xác định chu kỳ và vận tốc cực đại của con lắc lò xo',
              prompt:
                'Một con lắc lò xo có k = 50 N/m, m = 200g. Kéo vật lệch khỏi VTCB 4 cm rồi buông nhẹ. Tính chu kỳ T và vận tốc cực đại.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Đổi đơn vị & Tần số góc',
                  detail: 'm = 200g = 0.2 kg; A = 4 cm = 0.04 m.',
                  formula: 'ω = √(k / m) = √(50 / 0.2) = √250 ≈ 15.81 (rad/s)',
                },
                {
                  title: 'Bước 2: Chu kỳ dao động',
                  detail: 'Áp dụng công thức chu kỳ:',
                  formula: 'T = 2π / ω = 2π / 15.81 ≈ 0.397 (s)',
                },
                {
                  title: 'Bước 3: Vận tốc cực đại',
                  detail: 'Vận tốc cực đại qua VTCB:',
                  formula: 'v_max = ω*A = 15.81 * 0.04 = 0.632 (m/s) = 63.2 (cm/s)',
                },
              ],
            },
          ],
        },
        {
          id: 'p12_c2',
          title: 'Chương 2: Sóng cơ và Sóng âm',
          description:
            'Sự truyền sóng, giao thoa sóng, sóng dừng và các đặc trưng vật lý/sinh lý của âm.',
          keyFormulas: [
            { name: 'Bước sóng', formula: 'λ = v * T = v / f' },
            { name: 'Điều kiện cực đại giao thoa', formula: 'd2 - d1 = k*λ (k ∈ Z)' },
            { name: 'Mức cường độ âm', formula: 'L (dB) = 10 * lg(I / I0) với I0 = 10^-12 W/m^2' },
          ],
          sampleProblems: [
            {
              id: 'p12_p2',
              title: 'Tính bước sóng và khoảng cách giữa 2 cực đại giao thoa',
              prompt:
                'Hai nguồn kết hợp cùng pha phát sóng có tần số f = 50 Hz. Vận tốc truyền sóng v = 2 m/s. Tính bước sóng và khoảng vân giao thoa trên đoạn nối 2 nguồn.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Tính bước sóng',
                  detail: 'Áp dụng công thức bước sóng:',
                  formula: 'λ = v / f = 2 / 50 = 0.04 (m) = 4 (cm)',
                },
                {
                  title: 'Bước 2: Khoảng cách giữa 2 cực đại liên tiếp',
                  detail: 'Trên đoạn nối hai nguồn kết hợp, hai cực đại liên tiếp cách nhau λ/2:',
                  formula: 'd = λ / 2 = 4 / 2 = 2 (cm)',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  chemistry: [
    {
      grade: 'grade_12',
      gradeLabel: 'Lớp 12 (Thi THPTQG)',
      chapters: [
        {
          id: 'c12_c1',
          title: 'Chương 1: Ester - Lipid',
          description:
            'Cấu tạo, danh pháp, tính chất vật lý & hóa học (phản ứng thủy phân, xà phòng hóa), chất béo và ứng dụng.',
          keyFormulas: [
            { name: 'Este no, đơn chức, mạch hở', formula: 'CnH2nO2 (n ≥ 2)' },
            { name: 'Phản ứng xà phòng hóa', formula: "RCOOR' + NaOH → RCOONa + R'OH" },
            {
              name: 'Thủy phân chất béo (Triglyceride)',
              formula: '(RCOO)3C3H5 + 3NaOH → 3RCOONa + C3H5(OH)3 (Glycerol)',
            },
          ],
          sampleProblems: [
            {
              id: 'c12_p1',
              title: 'Tính khối lượng muối trong phản ứng xà phòng hóa este',
              prompt:
                'Xà phòng hóa hoàn toàn 8.8g Etyl Axetat (CH3COOC2H5) bằng dung dịch NaOH vừa đủ. Cô cạn dung dịch sau phản ứng thu được m gam muối khan. Tính m.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Tính số mol este',
                  detail: 'M(CH3COOC2H5) = 12*4 + 8 + 32 = 88 g/mol.',
                  formula: 'n_este = 8.8 / 88 = 0.1 (mol)',
                },
                {
                  title: 'Bước 2: Phương trình hóa học',
                  detail: 'CH3COOC2H5 + NaOH → CH3COONa + C2H5OH',
                  formula: 'n_muối(CH3COONa) = n_este = 0.1 (mol)',
                },
                {
                  title: 'Bước 3: Tính khối lượng muối',
                  detail: 'M(CH3COONa) = 15 + 12 + 32 + 23 = 82 g/mol.',
                  formula: 'm = 0.1 * 82 = 8.2 (gam)',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  biology: [
    {
      grade: 'grade_12',
      gradeLabel: 'Lớp 12 (Thi THPTQG)',
      chapters: [
        {
          id: 'b12_c1',
          title: 'Chương 1: Cơ chế di truyền và biến dị',
          description:
            'Cấu trúc và nhân đôi DNA, phiên mã, dịch mã, điều hòa hoạt động của gen và đột biến gen.',
          keyFormulas: [
            { name: 'Chiều dài phân tử DNA', formula: 'L = (N / 2) * 3.4 Å (1 Å = 10^-4 μm)' },
            { name: 'Tổng số liên kết hydro', formula: 'H = 2A + 3G = 2T + 3X' },
            { name: 'Số bộ ba mã hóa (Codon)', formula: 'Số codon = N_mRNA / 3' },
          ],
          sampleProblems: [
            {
              id: 'b12_p1',
              title: 'Tính số liên kết Hydro và chiều dài của gen',
              prompt:
                'Một gen có 3000 nucleotide, trong đó có 600 nucleotide loại A. Tính chiều dài gen và tổng số liên kết hydro của gen đó.',
              difficulty: 'basic',
              solutionSteps: [
                {
                  title: 'Bước 1: Tính chiều dài gen',
                  detail: 'Gen gồm 2 mạch đơn:',
                  formula: 'L = (N / 2) * 3.4 = (3000 / 2) * 3.4 = 5100 (Å) = 510 (nm)',
                },
                {
                  title: 'Bước 2: Xác định số nucleotide từng loại',
                  detail:
                    'Theo nguyên tắc bổ sung:\nA = T = 600\nG = X = (N / 2) - A = 1500 - 600 = 900',
                  formula: 'A = 600, G = 900',
                },
                {
                  title: 'Bước 3: Tính số liên kết hydro',
                  detail: 'Áp dụng công thức H = 2A + 3G:',
                  formula: 'H = 2*600 + 3*900 = 1200 + 2700 = 3900 (liên kết)',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
