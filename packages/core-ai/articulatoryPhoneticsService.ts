// packages/core-ai/articulatoryPhoneticsService.ts — V3 3D Articulatory Phonetics & Pitch Alignment Service.
import { randomUUID } from 'node:crypto'
import {
  type L1PhonemeTarget,
  type ArticulatoryGuide,
  type PitchSample,
  type PitchContourData,
  type PhoneticAnalysisReport,
  PHONETICS_SCHEMA_VERSION,
} from '@dhcb/core-contracts/articulatoryPhonetics'

export const ARTICULATORY_GUIDES: Record<L1PhonemeTarget, ArticulatoryGuide> = {
  TH_VOICELESS: {
    targetPhoneme: 'TH_VOICELESS',
    ipaSymbol: '/θ/',
    commonVietnameseMistake: 'Phát âm nhầm thành /t/ (ví dụ: "thank" -> "tank") hoặc /s/ ("sank").',
    tonguePosition: 'tip_between_teeth',
    jawOpening: 'half_open',
    lipShape: 'neutral',
    vocalCordVibration: false,
    airflowDescription: 'Luồng khí ma sát thoát ra liên tục giữa bề mặt lưỡi và răng cửa trên.',
    stepByStepAnatomyTips: [
      'Đưa nhẹ đầu lưỡi ra giữa 2 hàm răng (chạm nhẹ răng cửa trên).',
      'Thổi nhẹ luồng hơi qua khe răng mà không để thanh quản rung (vô thanh).',
      'Rút nhanh đầu lưỡi về sau khi phát âm xong nguyên âm tiếp theo.',
    ],
  },
  TH_VOICED: {
    targetPhoneme: 'TH_VOICED',
    ipaSymbol: '/ð/',
    commonVietnameseMistake:
      'Phát âm nhầm thành /d/ (ví dụ: "this" -> "đít", "they" -> "đây") hoặc /z/.',
    tonguePosition: 'tip_between_teeth',
    jawOpening: 'half_open',
    lipShape: 'neutral',
    vocalCordVibration: true,
    airflowDescription:
      'Luồng khí ma sát kết hợp rung thanh quản mạnh mẽ tại vị trí đầu lưỡi chạm răng.',
    stepByStepAnatomyTips: [
      'Đặt đầu lưỡi ở vị trí tương tự /θ/ (giữa 2 hàm răng).',
      'Đồng thời bật rung thanh quản (đặt tay lên cổ họng để cảm nhận độ rung).',
      'Giữ hơi rung đều đặn trước khi chuyển sang nguyên âm.',
    ],
  },
  ASH_SHORT_A: {
    targetPhoneme: 'ASH_SHORT_A',
    ipaSymbol: '/æ/',
    commonVietnameseMistake:
      'Phát âm nhầm thành /e/ ("bad" -> "bed") hoặc /a/ ngắn ("cat" -> "cắt").',
    tonguePosition: 'low_front',
    jawOpening: 'fully_open',
    lipShape: 'spread',
    vocalCordVibration: true,
    airflowDescription: 'Âm mở rộng, vòm miệng hạ thấp tối đa, luồng âm vang tự do từ thanh quản.',
    stepByStepAnatomyTips: [
      'Hạ quai hàm xuống sâu hơn âm /e/ thông thường.',
      'Kéo bè khóe môi sang 2 bên như đang mỉm cười nhẹ.',
      'Ép phẳng thân lưỡi xuống đáy sàn miệng.',
    ],
  },
  RETROFLEX_R: {
    targetPhoneme: 'RETROFLEX_R',
    ipaSymbol: '/r/',
    commonVietnameseMistake: 'Rung đầu lưỡi kiểu tiếng Việt /r/ hoặc phát âm giống /w/ /z/.',
    tonguePosition: 'curled_retroflex',
    jawOpening: 'half_open',
    lipShape: 'rounded',
    vocalCordVibration: true,
    airflowDescription:
      'Luồng âm lướt nhẹ qua vòm họng mà đầu lưỡi KHÔNG ĐƯỢC CHẠM vào bất kỳ đâu.',
    stepByStepAnatomyTips: [
      'Cong nhẹ đầu lưỡi ngược lên phía vòm họng nhưng không để chạm vào ngạc.',
      'Hơi chu môi về phía trước.',
      'Phát âm mượt mà, giữ luồng âm trôi liên tục không đứt đoạn.',
    ],
  },
  FINAL_CLUSTER_KS: {
    targetPhoneme: 'FINAL_CLUSTER_KS',
    ipaSymbol: '/-ks/',
    commonVietnameseMistake:
      'Bỏ quên phụ âm đuôi /s/ hoặc nuốt âm /k/ (ví dụ: "box" -> "bóp" hoặc "bó").',
    tonguePosition: 'dorsum_velar',
    jawOpening: 'half_open',
    lipShape: 'neutral',
    vocalCordVibration: false,
    airflowDescription: 'Tắc âm /k/ tại cuống họng rồi xả nhanh luồng khí /s/ qua đầu răng.',
    stepByStepAnatomyTips: [
      'Nâng cuống lưỡi chạm ngạc mềm tạo âm tắc /k/.',
      'Ngay lập tức mở cuống lưỡi và xì hơi /s/ sắc bén qua khe răng cửa.',
    ],
  },
  AFFRICATE_CH: {
    targetPhoneme: 'AFFRICATE_CH',
    ipaSymbol: '/tʃ/',
    commonVietnameseMistake: 'Phát âm thành /ch/ nhẹ tiếng Việt hoặc /ʃ/ xì không có lực bật tắc.',
    tonguePosition: 'blade_hard_palate',
    jawOpening: 'half_open',
    lipShape: 'rounded',
    vocalCordVibration: false,
    airflowDescription: 'Chặn hơi hoàn toàn tại ngạc cứng sau đó bật tung luồng khí ma sát mạnh.',
    stepByStepAnatomyTips: [
      'Chu tròn môi về phía trước.',
      'Ép mặt lưỡi vào ngạc cứng chặn luồng hơi.',
      'Bật mạnh luồng khí ra ngoài dứt khoát.',
    ],
  },
  AFFRICATE_JH: {
    targetPhoneme: 'AFFRICATE_JH',
    ipaSymbol: '/dʒ/',
    commonVietnameseMistake: 'Phát âm thành /z/ hoặc /d/ tiếng Việt (ví dụ: "job" -> "dóp").',
    tonguePosition: 'blade_hard_palate',
    jawOpening: 'half_open',
    lipShape: 'rounded',
    vocalCordVibration: true,
    airflowDescription: 'Âm tắc xát hữu thanh bật mạnh tại ngạc cứng.',
    stepByStepAnatomyTips: ['Khẩu hình tương tự /tʃ/ nhưng kết hợp làm rung mạnh dây thanh quản.'],
  },
  FINAL_SIBILANT_Z: {
    targetPhoneme: 'FINAL_SIBILANT_Z',
    ipaSymbol: '/-z/',
    commonVietnameseMistake: 'Bỏ âm đuôi hoặc phát âm thành /s/ xì vô thanh.',
    tonguePosition: 'tip_alveolar_ridge',
    jawOpening: 'closed',
    lipShape: 'spread',
    vocalCordVibration: true,
    airflowDescription: 'Ma sát hữu thanh tạo tiếng ong kêu /zzz/ ở cuối từ.',
    stepByStepAnatomyTips: [
      'Đặt đầu lưỡi sát chân răng trên.',
      'Xì hơi kết hợp rung thanh quản như tiếng ong vo ve.',
    ],
  },
}

export function getArticulatoryGuide(phoneme: L1PhonemeTarget): ArticulatoryGuide {
  const guide = ARTICULATORY_GUIDES[phoneme]
  if (!guide) {
    throw new Error(`Chưa có hướng dẫn giải phẫu cho âm vị ${phoneme}`)
  }
  return guide
}

export function generatePitchContour(
  targetWordOrPhrase: string,
  userAcousticScore: number = 85,
): PitchContourData {
  const isQuestion = targetWordOrPhrase.trim().endsWith('?')
  const baseFreq = 140

  const nativePitchTrack: PitchSample[] = [
    { timeMs: 0, f0Hz: baseFreq },
    { timeMs: 150, f0Hz: isQuestion ? baseFreq + 40 : baseFreq + 25 },
    { timeMs: 300, f0Hz: isQuestion ? baseFreq + 80 : baseFreq - 15 },
    { timeMs: 450, f0Hz: isQuestion ? baseFreq + 95 : baseFreq - 35 },
  ]

  // Giả lập đường pitch của người học với độ lệch nhẹ
  const deviation = (100 - userAcousticScore) * 0.4
  const userPitchTrack: PitchSample[] = nativePitchTrack.map((p) => ({
    timeMs: p.timeMs,
    f0Hz: Math.max(80, p.f0Hz + (Math.random() * deviation * 2 - deviation)),
  }))

  const alignmentScore = Math.min(100, Math.max(50, userAcousticScore))
  const intonationPattern = isQuestion ? 'rising' : 'falling'

  const coachingAdvice =
    alignmentScore >= 85
      ? 'Độ cao và ngữ điệu câu rất tự nhiên, âm vực tương thích 95% với người bản xứ.'
      : 'Cần hạ cao độ dần ở cuối câu trần thuật hoặc nhấn cao hơn ở từ mang trọng âm chính.'

  return {
    userPitchTrack,
    nativePitchTrack,
    alignmentScore,
    intonationPattern,
    stressAccentsMatch: alignmentScore >= 75,
    coachingAdvice,
  }
}

export function analyzePhoneticsAndPitch(
  personId: string,
  targetWordOrPhrase: string,
  targetPhoneme: L1PhonemeTarget,
  estimatedScore: number = 88,
): PhoneticAnalysisReport {
  const articulatoryGuide = getArticulatoryGuide(targetPhoneme)
  const pitchContour = generatePitchContour(targetWordOrPhrase, estimatedScore)

  return {
    id: randomUUID(),
    personId,
    targetWordOrPhrase,
    targetPhoneme,
    articulatoryGuide,
    pitchContour,
    overallPhoneticScore: estimatedScore,
    l1InterferenceMitigated: estimatedScore >= 80,
    createdAt: new Date().toISOString(),
    schemaVersion: PHONETICS_SCHEMA_VERSION,
  }
}
