// apps/dhcb/src/pages/index.ts — Unified export for all domain & subject pages

// ── 1. Core Platform & Shared Pages
export { default as Home } from './core/Home.js'
export { default as Profile } from './core/Profile.js'
export { default as Dashboard } from './core/Dashboard.js'
export { default as History } from './core/History.js'
export { default as Login } from './core/Login.js'
export { default as ResetPassword } from './core/ResetPassword.js'
export { default as Onboarding } from './core/Onboarding.js'
export { default as Friends } from './core/Friends.js'
export { default as AddFriend } from './core/AddFriend.js'
export { default as Quests } from './core/Quests.js'
export { default as MistakeBank } from './core/MistakeBank.js'
export { default as AdminDashboard } from './core/AdminDashboard.js'
export { default as About } from './core/About.js'
export { default as Landing } from './core/Landing.js'
export { default as LandingEn } from './core/LandingEn.js'

// ── 2. AI Companion & Decision Studio
export { default as Companion } from './companion/Companion.js'
export { default as ActionCanvas } from './companion/ActionCanvas.js'
export { default as AvatarDemo } from './companion/AvatarDemo.js'

// ── 3. Multi-Subject Learning & STEM Studio
export { default as Subjects } from './learning/Subjects.js'
export { default as SubjectDetail } from './learning/SubjectDetail.js'
export { default as Practice } from './learning/Practice.js'
export { default as AppliedKnowledge } from './learning/AppliedKnowledge.js'

// ── 4. Life Synthesis Domains (Career, Work, Startup, Life)
export { default as Career } from './domains/career/Career.js'
export { default as CareerInterview } from './domains/career/CareerInterview.js'
export { default as Work } from './domains/work/Work.js'
export { default as WorkKanban } from './domains/work/WorkKanban.js'
export { default as Startup } from './domains/startup/Startup.js'
export { default as StartupCanvas } from './domains/startup/StartupCanvas.js'
export { default as Life } from './domains/life/Life.js'
export { default as LifeGraph } from './domains/life/LifeGraph.js'
export { default as LifeWheel } from './domains/life/LifeWheel.js'

// ── 5. English Subject Module (Chuyên Biệt Môn Tiếng Anh)
export { default as EnglishHome } from './subjects/english/EnglishHome.js'
export { default as CefrLevelPage } from './subjects/english/CefrLevelPage.js'
export { default as Dictionary } from './subjects/english/Dictionary.js'
export { default as WordDetail } from './subjects/english/WordDetail.js'
export { default as Lessons, InlinePronounce } from './subjects/english/Lessons.js'
export { default as Learn } from './subjects/english/Learn.js'
export { default as Listening } from './subjects/english/Listening.js'
export { default as Speaking } from './subjects/english/Speaking.js'
export { default as Writing } from './subjects/english/Writing.js'
export { default as Stories } from './subjects/english/Stories.js'
export { default as StoryReader } from './subjects/english/StoryReader.js'
export { default as CommonPhrases } from './subjects/english/CommonPhrases.js'
export { default as Placement } from './subjects/english/Placement.js'
export { default as Challenge } from './subjects/english/Challenge.js'
export { default as EnglishSettings } from './subjects/english/EnglishSettings.js'
export { default as Chat } from './subjects/english/Chat.js'
export { default as ChatPage } from './subjects/english/ChatPage.js'
