import { describe, it, expect } from 'vitest'
import {
  pluralize,
  thirdPerson,
  gerund,
  pastRegular,
  comparativeForms,
  computeForms,
  countSyllables,
  formValues,
} from './wordForms'

describe('pluralize — số nhiều danh từ', () => {
  it('quy tắc thường +s', () => {
    expect(pluralize('book')).toBe('books')
    expect(pluralize('cat')).toBe('cats')
  })
  it('đuôi s/x/ch/sh/z → +es', () => {
    expect(pluralize('bus')).toBe('buses')
    expect(pluralize('box')).toBe('boxes')
    expect(pluralize('watch')).toBe('watches')
    expect(pluralize('dish')).toBe('dishes')
  })
  it('phụ âm + y → ies, nguyên âm + y → +s', () => {
    expect(pluralize('city')).toBe('cities')
    expect(pluralize('baby')).toBe('babies')
    expect(pluralize('boy')).toBe('boys')
    expect(pluralize('day')).toBe('days')
  })
  it('bất quy tắc tra bảng', () => {
    expect(pluralize('child')).toBe('children')
    expect(pluralize('man')).toBe('men')
    expect(pluralize('foot')).toBe('feet')
    expect(pluralize('mouse')).toBe('mice')
    expect(pluralize('leaf')).toBe('leaves')
    expect(pluralize('potato')).toBe('potatoes')
    expect(pluralize('analysis')).toBe('analyses')
    expect(pluralize('quiz')).toBe('quizzes')
  })
  it('bất quy tắc Hy Lạp / Latin bổ sung (rà 2026-07-16)', () => {
    expect(pluralize('axis')).toBe('axes')
    expect(pluralize('oasis')).toBe('oases')
    expect(pluralize('emphasis')).toBe('emphases')
    expect(pluralize('alumnus')).toBe('alumni')
    expect(pluralize('genus')).toBe('genera')
  })
  it('danh từ bất biến', () => {
    expect(pluralize('sheep')).toBe('sheep')
    expect(pluralize('fish')).toBe('fish')
    // "corps" TUYỆT ĐỐI không thành "corpses" (nghĩa khác hẳn: xác chết)
    expect(pluralize('corps')).toBe('corps')
    expect(pluralize('headquarters')).toBe('headquarters')
    expect(pluralize('offspring')).toBe('offspring')
  })
  it('từ ghép đuôi -man/-woman/-f/-fe', () => {
    expect(pluralize('housewife')).toBe('housewives')
    expect(pluralize('bookshelf')).toBe('bookshelves')
    expect(pluralize('policeman')).toBe('policemen')
    expect(pluralize('businesswoman')).toBe('businesswomen')
    expect(pluralize('yourself')).toBe('yourselves')
  })
  it('KHÔNG đổi nhầm từ đuôi -man/-fe không phải hình vị', () => {
    expect(pluralize('human')).toBe('humans')
    expect(pluralize('german')).toBe('germans')
    expect(pluralize('safe')).toBe('safes')
    expect(pluralize('giraffe')).toBe('giraffes')
    expect(pluralize('belief')).toBe('beliefs')
  })
})

describe('thirdPerson — ngôi 3 số ít', () => {
  it('quy tắc', () => {
    expect(thirdPerson('play')).toBe('plays')
    expect(thirdPerson('try')).toBe('tries')
    expect(thirdPerson('watch')).toBe('watches')
    expect(thirdPerson('kiss')).toBe('kisses')
  })
  it('bất quy tắc be/have/do/go', () => {
    expect(thirdPerson('be')).toBe('is')
    expect(thirdPerson('have')).toBe('has')
    expect(thirdPerson('do')).toBe('does')
    expect(thirdPerson('go')).toBe('goes')
  })
})

describe('gerund — dạng V-ing', () => {
  it('bỏ e câm', () => {
    expect(gerund('make')).toBe('making')
    expect(gerund('write')).toBe('writing')
    expect(gerund('take')).toBe('taking')
  })
  it('-ie → -ying', () => {
    expect(gerund('die')).toBe('dying')
    expect(gerund('lie')).toBe('lying')
    expect(gerund('tie')).toBe('tying')
  })
  it('giữ -ee/-oe', () => {
    expect(gerund('see')).toBe('seeing')
    expect(gerund('agree')).toBe('agreeing')
  })
  it('gấp đôi phụ âm CVC 1 âm tiết', () => {
    expect(gerund('run')).toBe('running')
    expect(gerund('stop')).toBe('stopping')
    expect(gerund('sit')).toBe('sitting')
  })
  it('KHÔNG gấp đôi khi cuối là w/x/y hoặc đa âm tiết không trọng âm cuối', () => {
    expect(gerund('fix')).toBe('fixing')
    expect(gerund('play')).toBe('playing')
    expect(gerund('open')).toBe('opening')
    expect(gerund('visit')).toBe('visiting')
    expect(gerund('travel')).toBe('traveling') // Anh-Mỹ
  })
  it('gấp đôi khi đa âm tiết trọng âm cuối (bảng ngoại lệ)', () => {
    expect(gerund('begin')).toBe('beginning')
    expect(gerund('prefer')).toBe('preferring')
    expect(gerund('forget')).toBe('forgetting')
  })
})

describe('pastRegular — quá khứ có quy tắc', () => {
  it('thêm d/ed', () => {
    expect(pastRegular('like')).toBe('liked')
    expect(pastRegular('walk')).toBe('walked')
  })
  it('phụ âm + y → ied; nguyên âm + y → +ed', () => {
    expect(pastRegular('try')).toBe('tried')
    expect(pastRegular('play')).toBe('played')
  })
  it('gấp đôi phụ âm CVC 1 âm tiết', () => {
    expect(pastRegular('stop')).toBe('stopped')
    expect(pastRegular('plan')).toBe('planned')
  })
})

describe('comparativeForms — so sánh hơn/nhất', () => {
  it('1 âm tiết', () => {
    expect(comparativeForms('big')).toEqual({ comparative: 'bigger', superlative: 'biggest' })
    expect(comparativeForms('nice')).toEqual({ comparative: 'nicer', superlative: 'nicest' })
    expect(comparativeForms('dry')).toEqual({ comparative: 'drier', superlative: 'driest' })
  })
  it('2 âm tiết đuôi -y', () => {
    expect(comparativeForms('happy')).toEqual({ comparative: 'happier', superlative: 'happiest' })
    expect(comparativeForms('easy')).toEqual({ comparative: 'easier', superlative: 'easiest' })
  })
  it('đa âm tiết → null (dùng more/most)', () => {
    expect(comparativeForms('beautiful')).toBeNull()
    expect(comparativeForms('expensive')).toBeNull()
  })
  it('tính từ phân từ đuôi -ied → null (không có "frieder")', () => {
    expect(comparativeForms('fried')).toBeNull()
    expect(comparativeForms('dried')).toBeNull()
    // nhưng "red" (không phải phân từ) vẫn có dạng -er bình thường
    expect(comparativeForms('red')).toEqual({ comparative: 'redder', superlative: 'reddest' })
  })
  it('bất quy tắc', () => {
    expect(comparativeForms('good')).toEqual({ comparative: 'better', superlative: 'best' })
    expect(comparativeForms('bad')).toEqual({ comparative: 'worse', superlative: 'worst' })
  })
})

describe('countSyllables', () => {
  it('đếm cụm nguyên âm', () => {
    expect(countSyllables('run')).toBe(1)
    expect(countSyllables('happy')).toBe(2)
    expect(countSyllables('beautiful')).toBe(3)
    expect(countSyllables('big')).toBe(1)
  })
})

describe('computeForms — tổng hợp theo loại từ', () => {
  it('động từ bất quy tắc: đủ 4 dạng + cờ irregular', () => {
    expect(computeForms('go', 'v')).toEqual({
      v3s: 'goes',
      ving: 'going',
      past: 'went',
      pastPart: 'gone',
      irregular: true,
    })
  })
  it('động từ quy tắc: pastPart trùng past nên bỏ', () => {
    expect(computeForms('play', 'v')).toEqual({
      v3s: 'plays',
      ving: 'playing',
      past: 'played',
    })
  })
  it('danh từ đếm được', () => {
    expect(computeForms('book', 'n')).toEqual({ plural: 'books' })
    expect(computeForms('child', 'n')).toEqual({ plural: 'children', irregular: true })
  })
  it('danh từ không đếm được → uncountable, KHÔNG có plural', () => {
    expect(computeForms('advice', 'n')).toEqual({ uncountable: true })
    expect(computeForms('information', 'n')).toEqual({ uncountable: true })
    expect(computeForms('furniture', 'n')).toEqual({ uncountable: true })
  })
  it('danh từ chỉ-có-số-nhiều → undefined (không bịa +es)', () => {
    expect(computeForms('jeans', 'n')).toBeUndefined()
    expect(computeForms('scissors', 'n')).toBeUndefined()
    expect(computeForms('pajamas', 'n')).toBeUndefined()
    // bổ sung rà 2026-07-16 — số ít không có entry / danh từ cặp
    expect(computeForms('sunglasses', 'n')).toBeUndefined()
    expect(computeForms('amenities', 'n')).toBeUndefined()
  })
  it('danh từ riêng / ký hiệu → undefined (không bịa "jesuses"/"gpses")', () => {
    expect(computeForms('jesus', 'n')).toBeUndefined()
    expect(computeForms('gps', 'n')).toBeUndefined()
    expect(computeForms('les', 'n')).toBeUndefined()
  })
  it('bệnh / môn chơi → uncountable (không bịa "diabeteses"/"tennises")', () => {
    expect(computeForms('diabetes', 'n')).toEqual({ uncountable: true })
    expect(computeForms('tennis', 'n')).toEqual({ uncountable: true })
    expect(computeForms('chess', 'n')).toEqual({ uncountable: true })
  })
  it('trạng từ thường KHÔNG chia so sánh (dùng more/most)', () => {
    expect(computeForms('strictly', 'adv')).toBeUndefined()
    expect(computeForms('quickly', 'adv')).toBeUndefined()
    expect(computeForms('quite', 'adv')).toBeUndefined()
  })
  it('trạng từ bất quy tắc VẪN có dạng', () => {
    expect(computeForms('well', 'adv')).toEqual({
      comparative: 'better',
      superlative: 'best',
      irregular: true,
    })
  })
  it('modal → undefined (không chia)', () => {
    expect(computeForms('can', 'v')).toBeUndefined()
    expect(computeForms('must', 'v')).toBeUndefined()
  })
  it('giới từ/liên từ → undefined', () => {
    expect(computeForms('of', 'prep')).toBeUndefined()
    expect(computeForms('and', 'conj')).toBeUndefined()
  })
  it('cụm nhiều từ / ký tự lạ → undefined', () => {
    expect(computeForms('a.m.', 'adv')).toBeUndefined()
    expect(computeForms('take off', 'v')).toBeUndefined()
  })
  it('tính từ ngắn có so sánh, dài thì không', () => {
    expect(computeForms('big', 'adj')).toEqual({
      comparative: 'bigger',
      superlative: 'biggest',
    })
    expect(computeForms('beautiful', 'adj')).toBeUndefined()
    expect(computeForms('good', 'adj')).toEqual({
      comparative: 'better',
      superlative: 'best',
      irregular: true,
    })
  })
})

describe('formValues — liệt kê chuỗi dạng biến thể', () => {
  it('gộp mọi field chuỗi', () => {
    const f = computeForms('go', 'v')!
    expect(formValues(f).sort()).toEqual(['goes', 'going', 'gone', 'went'])
  })
})
