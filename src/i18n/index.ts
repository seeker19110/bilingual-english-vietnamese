// Tất cả chuỗi văn bản giao diện — thêm key mới ở đây khi cần
export const t = {
  vi: {
    // Layout / Header
    appName: 'Gia sư AI',
    home: 'Trang chủ',
    logout: 'Đăng xuất',
    chat: 'Chat',
    speak: 'Nói',
    write: 'Viết',
    resetsAt: 'Làm mới lúc',

    // Home
    greeting: (name: string) => `Xin chào, ${name}`,
    dirLabelA: '🇻🇳 Người Việt học tiếng Anh',
    dirLabelB: '🌍 Người nước ngoài học tiếng Việt',
    toggleDirTitleA: 'Chuyển sang dạy tiếng Việt cho người nước ngoài',
    toggleDirTitleB: 'Chuyển sang dạy tiếng Anh cho người Việt',
    streakDays: 'ngày liên tiếp',
    planFree: 'Gói Miễn phí',
    planPro: 'Gói Pro',
    unlimited: 'Không giới hạn lượt dùng',
    tip: '💡 Mẹo:',
    tipBody: (phrases: string, speaking: string) =>
      `Bắt đầu với ${phrases} để nắm vốn câu giao tiếp thực tế. Rồi luyện với ${speaking} để rèn phản xạ và phát âm.`,
    tipPhrases: 'Các câu thông dụng',
    tipSpeaking: 'Luyện nói',

    // Mode cards — Direction A
    chatTitleA: 'Chat với gia sư',
    chatDescA:
      'Trò chuyện tiếng Anh theo tình huống. AI sửa lỗi và giải thích bằng tiếng Việt ngay lập tức.',
    speakTitleA: 'Luyện nói song ngữ',
    speakDescA: 'Nói → AI nghe → trả lời bằng giọng tiếng Anh → sửa lỗi bằng giọng tiếng Việt.',
    writeTitleA: 'Luyện viết & chấm điểm',
    writeDescA: 'Nộp bài viết, AI chấm theo tiêu chí IELTS, chỉ lỗi và ước lượng band.',
    phrasesTitleA: 'Các câu thông dụng',
    phrasesDescA:
      "300+ chủ thể (I'm, We are, Could you…), mỗi chủ thể nhiều câu thực tế, có phát âm.",
    dictTitleA: 'Từ điển',
    dictDescA: 'Tra 10.000 từ tiếng Anh thông dụng: loại từ, nghĩa tiếng Việt, ví dụ minh họa.',
    lessonsTitleA: 'Các bài hội thoại mẫu thông dụng',
    lessonsDescA:
      'Hội thoại mẫu theo chủ đề đời sống hằng ngày, mỗi bài 40 đoạn song ngữ có phát âm.',
    tagPopular: 'Phổ biến',
    tagKeyFeature: 'Tính năng chính',
    tagUnlimited: 'Không giới hạn',

    // Mode cards — Direction B
    chatTitleB: 'Chat với gia sư',
    chatDescB:
      'Luyện hội thoại tiếng Việt theo tình huống. AI sửa lỗi và giải thích bằng tiếng Anh.',
    speakTitleB: 'Luyện nói song ngữ',
    speakDescB: 'Nói → AI nghe → trả lời bằng giọng tiếng Việt → sửa lỗi bằng giọng tiếng Anh.',
    writeTitleB: 'Luyện viết & chấm điểm',
    writeDescB: 'Nộp bài viết tiếng Việt, AI chấm và chỉ lỗi bằng tiếng Anh.',
    phrasesTitleB: 'Các câu thông dụng',
    phrasesDescB: '300+ chủ thể câu tiếng Anh/Việt thông dụng, mỗi chủ thể có nhiều ví dụ thực tế.',
    dictTitleB: 'Từ điển',
    dictDescB: 'Tra 10.000 từ tiếng Việt–Anh thông dụng với loại từ và ví dụ.',
    lessonsTitleB: 'Bài học',
    lessonsDescB: 'Hội thoại mẫu tiếng Việt hàng ngày, 40 đoạn song ngữ mỗi bài.',

    // Login
    loginBrand: 'Gia sư tiếng Anh AI',
    loginTagline: 'Luyện nói · Viết · Nhận xét bằng tiếng Việt',
    loginTabLogin: 'Đăng nhập',
    loginTabRegister: 'Đăng ký',
    namePlaceholder: 'Tên của bạn',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Mật khẩu',
    loginSubmit: 'Đăng nhập',
    registerSubmit: 'Tạo tài khoản miễn phí',
    loginProcessing: 'Đang xử lý…',
    loginOr: 'hoặc',
    googleSignIn: 'Đăng nhập bằng Google',
    loginPrivacy: 'Dữ liệu lưu trên máy bạn · Hoàn toàn riêng tư',
    featChat: 'Chat với gia sư AI',
    featSpeak: 'Luyện nói song ngữ',
    featScore: 'Chấm bài IELTS tức thì',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    langToggleLabel: 'Chọn ngôn ngữ giao diện',
    errNameRequired: 'Vui lòng nhập tên.',
    errEmailInvalid: 'Email đã được dùng hoặc không hợp lệ. Hãy thử email khác.',
    errBadCredentials: 'Email hoặc mật khẩu không đúng.',
    errConnection: 'Lỗi kết nối. Vui lòng thử lại.',
    errGoogle: 'Không kết nối được Google. Vui lòng thử lại.',

    // Chat page
    chooseSituation: 'Chọn tình huống luyện tập',
    aiPartner: 'AI sẽ đóng vai đối tác hội thoại',
    situation: 'Tình huống',
    level: 'Trình độ',
    startChat: 'Bắt đầu trò chuyện',
    limitReached: 'Hết lượt Chat hôm nay',
    limitDesc: 'Giới hạn miễn phí: {max} lượt/ngày. Nâng cấp Pro để không giới hạn.',
    upgrade: 'Nâng cấp Pro',
    backHome: 'Về trang chủ',
    typeMessage: 'Nhập tin nhắn…',
    newChat: 'Chat mới',
    thinking: 'Đang suy nghĩ…',
    corrected: '✏️ Sửa:',
    feedback: '💬 Giải thích:',
    you: 'Bạn',

    // Writing page
    writeTitle: 'Luyện viết & chấm điểm',
    writeSub: 'AI chấm theo tiêu chí IELTS Writing Task 2',
    promptLabel: 'Đề bài / chủ đề',
    promptPlaceholder: 'Ví dụ: Some people think technology makes life better. Discuss.',
    essayLabel: 'Bài viết của bạn',
    essayPlaceholder: 'Viết bài tiếng Anh của bạn ở đây…',
    wordCount: (n: number) => `${n} từ`,
    submitWrite: 'Nộp bài & chấm điểm',
    submitting: 'Đang chấm bài…',
    limitReachedWrite: 'Hết lượt chấm bài hôm nay',
    limitDescWrite: 'Giới hạn miễn phí: {max} lượt/ngày.',
    feedbackTitle: 'Nhận xét từ AI',

    // Speaking page
    speakTitle: 'Luyện nói song ngữ',
    speakSub: 'Nói → AI nghe → phản hồi giọng Anh + giải thích giọng Việt',

    // Dictionary
    dictPageTitle: 'Từ điển Anh–Việt',
    dictPageSub: '10.000 từ thông dụng, tra ngay',
    searchPlaceholder: 'Tìm từ tiếng Anh…',

    // Lessons
    lessonsPageTitle: 'Bài học hội thoại',
    lessonsPageSub: 'Mỗi bài 40 đoạn hội thoại song ngữ',

    // Phrases
    phrasesPageTitle: 'Các câu thông dụng',
    phrasesPageSub: '1000 chủ thể, mỗi chủ thể 100 câu thực tế',
    phrasesSearch: 'Tìm chủ thể…',
    phrasesSearchPlaceholder: 'Gõ tiếng Anh hoặc tiếng Việt…',
    phrasesAll: 'Tất cả',
    phrasesSubjects: 'chủ thể',
    phrasesSentences: 'câu',
    phrasesBack: 'Quay lại',
    phrasesNoResult: 'Không tìm thấy kết quả phù hợp.',
    phrasesLoadMore: 'Tải thêm',

    // Parts of speech
    posPageTitle: 'Từ loại',
    posPageSub: 'Danh từ, động từ, tính từ và nhiều hơn nữa',
  },

  en: {
    // Layout / Header
    appName: 'AI Tutor',
    home: 'Home',
    logout: 'Log out',
    chat: 'Chat',
    speak: 'Speak',
    write: 'Write',
    resetsAt: 'Resets at',

    // Home
    greeting: (name: string) => `Hello, ${name}`,
    dirLabelA: '🇻🇳 Vietnamese learning English',
    dirLabelB: '🌍 Foreigners learning Vietnamese',
    toggleDirTitleA: 'Switch to teaching Vietnamese for foreigners',
    toggleDirTitleB: 'Switch to teaching English for Vietnamese speakers',
    streakDays: 'day streak',
    planFree: 'Free Plan',
    planPro: 'Pro Plan',
    unlimited: 'Unlimited usage',
    tip: '💡 Tip:',
    tipBody: (phrases: string, speaking: string) =>
      `Start with ${phrases} to build practical vocabulary. Then move to ${speaking} to train your reflexes and pronunciation.`,
    tipPhrases: 'Common Sentences',
    tipSpeaking: 'Speaking',

    // Mode cards — Direction A
    chatTitleA: 'Chat with tutor',
    chatDescA:
      'Practice English conversation by situation. AI corrects and explains in Vietnamese instantly.',
    speakTitleA: 'Bilingual speaking',
    speakDescA: 'Speak → AI listens → replies in English voice → corrects in Vietnamese voice.',
    writeTitleA: 'Writing & scoring',
    writeDescA: 'Submit your essay, AI grades it by IELTS criteria and estimates your band.',
    phrasesTitleA: 'Common Sentences',
    phrasesDescA:
      "300+ subjects (I'm, We are, Could you…), each with real-life sentences and audio.",
    dictTitleA: 'Dictionary',
    dictDescA: 'Look up 10,000 common English words: part of speech, Vietnamese meaning, examples.',
    lessonsTitleA: 'Lessons',
    lessonsDescA: 'Sample dialogues on everyday topics, 40 bilingual exchanges per lesson.',
    tagPopular: 'Popular',
    tagKeyFeature: 'Key feature',
    tagUnlimited: 'Unlimited',

    // Mode cards — Direction B
    chatTitleB: 'Chat with tutor',
    chatDescB:
      'Practice Vietnamese conversation by situation. AI corrects and explains in English.',
    speakTitleB: 'Bilingual speaking',
    speakDescB: 'Speak → AI listens → replies in Vietnamese voice → corrects in English voice.',
    writeTitleB: 'Writing & scoring',
    writeDescB: 'Submit your Vietnamese writing, AI grades it and points out errors in English.',
    phrasesTitleB: 'Common Sentences',
    phrasesDescB: '300+ subjects with real-life English/Vietnamese sentences and audio.',
    dictTitleB: 'Dictionary',
    dictDescB: 'Look up 10,000 common Vietnamese–English words with part of speech and examples.',
    lessonsTitleB: 'Common sample dialogues',
    lessonsDescB: 'Everyday Vietnamese dialogues, 40 bilingual exchanges per lesson.',

    // Login
    loginBrand: 'AI Language Tutor',
    loginTagline: 'Speak · Write · Instant feedback',
    loginTabLogin: 'Log in',
    loginTabRegister: 'Sign up',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    loginSubmit: 'Log in',
    registerSubmit: 'Create free account',
    loginProcessing: 'Processing…',
    loginOr: 'or',
    googleSignIn: 'Continue with Google',
    loginPrivacy: 'Your data stays on your device · Fully private',
    featChat: 'Chat with AI tutor',
    featSpeak: 'Bilingual speaking',
    featScore: 'Instant IELTS scoring',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    langToggleLabel: 'Choose interface language',
    errNameRequired: 'Please enter your name.',
    errEmailInvalid: 'Email is already used or invalid. Please try another one.',
    errBadCredentials: 'Incorrect email or password.',
    errConnection: 'Connection error. Please try again.',
    errGoogle: "Couldn't connect to Google. Please try again.",

    // Chat page
    chooseSituation: 'Choose a practice situation',
    aiPartner: 'AI will role-play a conversation partner',
    situation: 'Situation',
    level: 'Level',
    startChat: 'Start conversation',
    limitReached: 'Daily Chat limit reached',
    limitDesc: 'Free limit: {max} sessions/day. Upgrade to Pro for unlimited access.',
    upgrade: 'Upgrade to Pro',
    backHome: 'Back to home',
    typeMessage: 'Type a message…',
    newChat: 'New chat',
    thinking: 'Thinking…',
    corrected: '✏️ Corrected:',
    feedback: '💬 Feedback:',
    you: 'You',

    // Writing page
    writeTitle: 'Writing & scoring',
    writeSub: 'AI grades by IELTS Writing Task 2 criteria',
    promptLabel: 'Essay prompt / topic',
    promptPlaceholder: 'e.g. Some people think technology makes life better. Discuss.',
    essayLabel: 'Your essay',
    essayPlaceholder: 'Write your English essay here…',
    wordCount: (n: number) => `${n} words`,
    submitWrite: 'Submit & score',
    submitting: 'Scoring…',
    limitReachedWrite: 'Daily writing limit reached',
    limitDescWrite: 'Free limit: {max} sessions/day.',
    feedbackTitle: 'AI feedback',

    // Speaking page
    speakTitle: 'Bilingual speaking',
    speakSub: 'Speak → AI listens → English voice reply + Vietnamese explanation',

    // Dictionary
    dictPageTitle: 'English–Vietnamese Dictionary',
    dictPageSub: '10,000 common words, search instantly',
    searchPlaceholder: 'Search English words…',

    // Lessons
    lessonsPageTitle: 'Conversation lessons',
    lessonsPageSub: '40 bilingual exchanges per lesson',

    // Phrases
    phrasesPageTitle: 'Common Sentences',
    phrasesPageSub: '1000 subjects, 100 real-life sentences each',
    phrasesSearch: 'Search subjects…',
    phrasesSearchPlaceholder: 'Search in English or Vietnamese…',
    phrasesAll: 'All',
    phrasesSubjects: 'subjects',
    phrasesSentences: 'sentences',
    phrasesBack: 'Back',
    phrasesNoResult: 'No results found.',
    phrasesLoadMore: 'Load more',

    // Parts of speech
    posPageTitle: 'Parts of Speech',
    posPageSub: 'Nouns, verbs, adjectives and more',
  },
}

export type Translations = typeof t.vi
