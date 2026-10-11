import React, { useReducer, useState, useEffect, useMemo, useRef, useContext, createContext } from 'react';
import {
  Home, Wallet, PiggyBank, TrendingUp, ShieldCheck, Users, Download, Search, ChevronRight, ChevronLeft,
  RotateCcw, Trophy, Sparkles, Ban, Lightbulb, ArrowUpDown, GraduationCap, LayoutDashboard, Copy, Check,
  X, Lock, Flame, Star, Info, Target, Share2, Eye, Play, Zap, Smartphone, Monitor,
  BookOpen, Settings, Bell, HelpCircle, ArrowRight, Laptop, Plus, CheckCircle2, AlertTriangle,
  Smile, Gamepad2, Calendar, Edit3, DollarSign, Menu, PieChart, Volume2, VolumeX
} from 'lucide-react';
import { isSoundEnabled, toggleSound, playCorrectSound, playWrongSound } from './lib/audio';

/* ============================================================================
   1. DATA + i18n
   FinLeap Design System - Forest Green, Vibrant Mint, and Clean Slate.
   ========================================================================== */

const C = {
  burgundy: '#064E3B',    // FinLeap Forest Green
  forest: '#064E3B',
  forestDark: '#022C22',
  forestMed: '#065F46',
  red: '#10B981',         // Fresh Mint / Emerald Green
  mint: '#10B981',
  mintLight: '#ECFDF5',
  crimson: '#0D9488',     // Teal (Plan & Budget)
  dteal: '#059669',       // Deep Emerald (Save & Manage)
  teal: '#2563EB',        // Royal Blue (Understand Investing)
  purple: '#8B5CF6',      // Purple (Education & Goals)
  amber: '#F59E0B',       // Amber / Gold (Trophies & Points)
  pink: '#EC4899',        // Rose Pink (Entertainment)
  ink: '#0F172A',         // Slate 900
  blush: '#ECFDF5',       // Soft Mint Surface
  muted: '#64748B',       // Slate 500
  line: '#E2E8F0',        // Slate 200 Border
  good: '#059669',        // Success Green
  goodBg: '#D1FAE5',      // Success Green Soft
  bg: '#F8FAFC',          // Light Slate Canvas
};

// color = fills/borders, ink = accessible text on white, on = text on the fill
const PILLARS = [
  { id: 'budget', color: '#0D9488', ink: '#0D9488', on: '#FFFFFF', soft: '#CCFBF1', Icon: Wallet, badge: 'boss' },
  { id: 'save', color: '#059669', ink: '#059669', on: '#FFFFFF', soft: '#D1FAE5', Icon: PiggyBank, badge: 'net' },
  { id: 'invest', color: '#2563EB', ink: '#2563EB', on: '#FFFFFF', soft: '#DBEAFE', Icon: TrendingUp, badge: 'curious' },
  { id: 'safe', color: '#7C3AED', ink: '#7C3AED', on: '#FFFFFF', soft: '#EDE9FE', Icon: ShieldCheck, badge: 'spotter' },
];

const BADGES = [
  { id: 'boss', e: '👑' }, { id: 'net', e: '🛟' }, { id: 'curious', e: '🌱' },
  { id: 'spotter', e: '🕵️' }, { id: 'comeback', e: '💪' }, { id: 'streak', e: '🔥' },
];

const LEVELS = [0, 100, 250, 400, 550];

const BUCKETS = [
  { id: 'need', color: C.crimson, e: '🧱' },
  { id: 'want', color: '#9A5B00', e: '🎈' },
  { id: 'later', color: C.dteal, e: '⏳' },
];

/* Personas: wallet, sorter items, goals, the 4-week simulation and scam set all differ.
   item.ans = expected bucket; item.ctx = [contextId, bucket] pairs for "it depends" items.
   sim.weeks = 4 weeks x 2 choices, each { id, hi, lo } in rupees. */
const PERSONAS = {
  arjun: {
    id: 'arjun', e: '👦🏽', grade: 11, wallet: 1000, hard: false,
    items: [
      { id: 'bus', e: '🚌', cost: 250, ans: 'need' },
      { id: 'notes', e: '📒', cost: 150, ans: 'need' },
      { id: 'canteen', e: '🥟', cost: 300, ans: 'want' },
      { id: 'sneakers', e: '👟', cost: 1200, ans: 'later' },
      { id: 'fastfood', e: '🍔', cost: 250, ans: 'want' },
      { id: 'data', e: '📶', cost: 199, ctx: [['project', 'need'], ['reels', 'want']] },
    ],
    goals: [{ id: 'sneakers', e: '👟', cost: 1200 }, { id: 'bat', e: '🏏', cost: 800 }, { id: 'guide', e: '📘', cost: 400 }],
    sim: {
      jarWeekly: 100, goalWeekly: 25, shock: 300, due: 250,
      weeks: [
        [{ id: 'snack', hi: 90, lo: 30 }, { id: 'movie', hi: 120, lo: 0 }],
        [{ id: 'recharge', hi: 199, lo: 79 }, { id: 'juice', hi: 60, lo: 0 }],
        [{ id: 'gift', hi: 100, lo: 20 }, { id: 'snack2', hi: 90, lo: 30 }],
        [{ id: 'fastfood', hi: 150, lo: 0 }, { id: 'pens', hi: 80, lo: 20 }],
      ],
    },
    scams: ['prize', 'otp', 'qr', 'collect', 'kyc', 'screen', 'job', 'recharge'],
  },
  priya: {
    id: 'priya', e: '👧🏽', grade: 12, wallet: 1200, hard: true,
    items: [
      { id: 'guide', e: '📘', cost: 400, ans: 'need' },
      { id: 'mock', e: '📝', cost: 300, ans: 'need' },
      { id: 'classdata', e: '📶', cost: 239, ans: 'need' },
      { id: 'chai', e: '☕', cost: 120, ans: 'want' },
      { id: 'earphones', e: '🎧', cost: 499, ans: 'want' },
      { id: 'famgift', e: '🎁', cost: 200, ctx: [['close', 'need'], ['extra', 'want']] },
    ],
    goals: [{ id: 'guideset', e: '📚', cost: 600 }, { id: 'earphones', e: '🎧', cost: 499 }, { id: 'course', e: '🎓', cost: 1500 }],
    sim: {
      jarWeekly: 100, goalWeekly: 40, shock: 300, due: 300,
      weeks: [
        [{ id: 'data', hi: 299, lo: 199 }, { id: 'chai', hi: 80, lo: 30 }],
        [{ id: 'copies', hi: 100, lo: 30 }, { id: 'gift', hi: 150, lo: 30 }],
        [{ id: 'auto', hi: 120, lo: 40 }, { id: 'chai2', hi: 80, lo: 30 }],
        [{ id: 'festival', hi: 200, lo: 0 }, { id: 'qbank', hi: 150, lo: 0 }],
      ],
    },
    scams: ['prize', 'otp', 'qr', 'collect', 'scholar', 'kyc', 'screen', 'job', 'recharge', 'friend'],
  },
};

/* Scam simulator. All senders, codes and links are fictional. In the message text,
   [[double brackets]] mark the phrases highlighted as red flags (or good signs). */
const SCENARIOS = {
  prize: { ch: 'sms', ans: 'block', rule: 'pin', e: '🎁' },
  otp: { ch: 'sms', ans: 'genuine', rule: 'read', e: '🏦' },
  qr: { ch: 'wa', ans: 'block', rule: 'receive', e: '▦' },
  collect: { ch: 'upi', ans: 'block', rule: 'receive', e: '💸', amt: 5000 },
  scholar: { ch: 'wa', ans: 'block', rule: 'fee', e: '🎓' },
  kyc: { ch: 'sms', ans: 'block', rule: 'link', e: '⚠️' },
  screen: { ch: 'call', ans: 'block', rule: 'app', e: '🎧' },
  job: { ch: 'wa', ans: 'block', rule: 'fee', e: '💼' },
  recharge: { ch: 'sms', ans: 'genuine', rule: 'info', e: '📶' },
  friend: { ch: 'wa', ans: 'block', rule: 'verify', e: '👤' },
};

const QUIZ = [
  { id: 'time', opts: ['a', 'b', 'c'], ans: 'a' },
  { id: 'risk', opts: ['a', 'b', 'c'], ans: 'b' },
  { id: 'comp', opts: ['a', 'b', 'c'], ans: 'c' },
];

// Deterministic "bumpy ride": yearly swing in percentage points, scaled by the assumed rate.
const BUMPS = [10, -14, 8, 3, -9, 12, -4, 6, -11, 7];
const RATES = [{ id: 'low', r: 4 }, { id: 'med', r: 8 }, { id: 'high', r: 12 }];
const TOUGH_ORDER = [0, 2, 1]; // which basket falls on each run of the diversification game

// Top Student Confusion: [key, sample rows affected out of 60, stride used to spread them]
const CONFUSION = [['qr', 25, 7], ['buffer', 23, 11], ['time', 21, 13], ['wants', 17, 17], ['otp', 14, 19]];

const EN = {
  'app.tag': 'Learn by doing',
  'role.label': 'Choose role', 'role.student': 'Student Portal', 'role.admin': 'NGO Admin Dashboard', 'lang.label': 'Language',
  'view.label': 'Device view', 'view.mobile': 'Mobile', 'view.desktop': 'Desktop',
  'footer': 'For educational purposes only. Vanguard does not recommend specific investments or securities.',
  'privacy.chip': 'No personal data collected', 'privacy.title': 'Your privacy',
  'privacy.body': 'We never ask for your name, phone number, Aadhaar, email, address or any bank or UPI details. You only choose a character. Your progress stays on this device. The wallet is play money, not real money.',
  'c.next': 'Next', 'c.back': 'Back', 'c.start': "Let's go", 'c.tryAgain': 'Try again', 'c.home': 'Home', 'c.close': 'Close',
  'c.why': 'Why?', 'c.real': 'In real life', 'c.finish': 'Finish', 'c.play': 'play money', 'c.step': 'Step {a} of {b}',
  'c.nextPillar': 'Next: {name}', 'c.score': 'Score', 'c.best': 'Best {n}%', 'c.nav': 'Missions',
  'fb.good': 'Nice choice!', 'fb.smart': 'Smart move!', 'fb.rethink': "Let's look at it again", 'fb.comeback': 'Great comeback!',

  'wel.title': 'Money skills for real life',
  'wel.sub': 'Short games about bus passes, canteen snacks, recharges and UPI. No real money. Mistakes cost nothing.',
  'wel.1': 'Make choices', 'wel.2': 'See what happens', 'wel.3': 'Try again', 'wel.cta': 'Start',
  'per.title': 'Who are you playing as?', 'per.sub': 'Stories, wallet and goals adapt to your choice. You can switch any time.',
  'per.arjun.name': 'Arjun', 'per.arjun.desc': 'You take the RTC bus every day, love canteen snacks, and are saving up for sneakers.',
  'per.priya.name': 'Priya', 'per.priya.desc': 'You are preparing for entrance exams, need data for classes, and help out at home.',
  'per.grade': 'Grade {n}', 'per.wallet': '{amt} a month', 'per.easy': 'Beginner', 'per.hard': 'A bit tougher',
  'per.pick': 'Play as {name}', 'per.switch': 'Switch persona',

  'home.hi': 'Hi, {name}!', 'home.assignments': 'Assignments', 'home.pending': 'Pending', 'home.completed': 'Completed', 'home.wallet': 'Virtual Wallet', 'home.jar': 'Safety Jar: {amt}', 'home.level': 'Level {n}',
  'home.toNext': '{n} XP to the next level', 'home.max': 'Top level reached!',
  'home.streak': '{n}-day streak', 'home.overall': 'Overall progress', 'home.badges': 'Badges', 'home.pillars': 'Your 4 missions',
  'home.continue': 'Continue: {name}', 'home.allDone': 'All 4 done! Replay any mission to beat your best.',
  'home.earned': 'Earned', 'home.locked': 'Locked',
  'st.0': 'Not started', 'st.1': 'In progress', 'st.2': 'Completed',
  'lv.1': 'Starter', 'lv.2': 'Saver', 'lv.3': 'Planner', 'lv.4': 'Money Smart', 'lv.5': 'Money Master',
  'tab.home': 'Home', 'tab.budget': 'Budget', 'tab.save': 'Save', 'tab.invest': 'Invest', 'tab.safe': 'Safe',
  'pl.budget': 'Plan & Budget', 'pl.budget.sub': 'Needs, wants and goals',
  'pl.save': 'Save & Manage', 'pl.save.sub': 'Habits and surprises',
  'pl.invest': 'Understand Investing', 'pl.invest.sub': 'Time, risk and growth',
  'pl.safe': 'Stay Financially Safe', 'pl.safe.sub': 'Spot scams, protect your PIN',

  'bd.boss': 'Budget Boss', 'bd.boss.d': 'Sort needs and wants, then set a savings goal.',
  'bd.net': 'Safety Net Builder', 'bd.net.d': 'Get through the 4-week month and its surprise.',
  'bd.curious': 'Compound Curious', 'bd.curious.d': 'Explore how time grows money and finish the quiz.',
  'bd.spotter': 'Scam Spotter', 'bd.spotter.d': 'Check every message in the scam simulator.',
  'bd.comeback': 'Comeback Kid', 'bd.comeback.d': 'Get something right after trying again. That is how learning works!',
  'bd.streak': 'Streak Starter', 'bd.streak.d': 'Finish a mission today. Come back tomorrow to grow your streak.',
  'bd.got': 'You earned this!', 'bd.how': 'How to earn it',

  'sum.title': 'Mission complete!', 'sum.learned': 'What you learned', 'sum.badge': 'Badge: {name}',
  'sum.total': 'Total XP: {n}', 'sum.retryNote': 'Playing again never costs XP. Your best score is kept.', 'sum.all': 'See my badges',

  // Pillar 1
  'b.story.arjun': "It's the 1st. You get {amt} for the month. Bus pass, canteen, sneakers... it can't buy everything. Decide what to do.",
  'b.story.priya': 'You have {amt} this month. Exam guides, mock tests, data, a family function... every rupee needs a job. Choose carefully.',
  'b.sort.title': 'Need, want, or save for later?', 'b.sort.hint': 'Tap a button on each card, or drag the card onto a box.',
  'b.need': 'Need', 'b.want': 'Want', 'b.later': 'Save for later', 'b.left': 'Left', 'b.saved': 'Saved',
  'b.bar': 'Budget bar: needs {n}, wants {w}, saved {s}, left {l}',
  'b.guide': 'A starting rule: about half for needs, some for wants, save the rest. Adjust it to your life.',
  'b.over': 'Over by {amt}. Move one want to "Save for later".', 'b.placed': '{a} of {b} sorted',
  'b.ctx.q': 'First: what is it for?', 'b.whatif': 'What if I choose differently?',
  'b.toGoal': 'Next: set a goal', 'b.reset': 'Reset sort',
  'b.goal.title': 'Pick a goal', 'b.goal.weekly': 'I will save every week',
  'b.goal.result': '{n} weeks to reach your goal', 'b.goal.months': 'That is about {n} months. Save a bit more each week to get there sooner.',
  'b.goal.tip': 'A goal with a number and a date is much easier to reach.',
  'b.l1': 'Needs come first: travel, study, essentials.', 'b.l2': 'Wants are fine, after needs and within the wallet.',
  'b.l3': 'Big wants become goals. Save a little every week.',
  'it.bus': 'Monthly bus pass', 'it.bus.why': 'It gets you to college every day. Without it, classes are missed.',
  'it.bus.alt': 'Skip it, and daily tickets would cost more than the pass.',
  'it.notes': 'Exam notebooks & pens', 'it.notes.why': 'Study basics are needs. They help your exams directly.',
  'it.notes.alt': 'Skip them, and you are borrowing pens during exam week.',
  'it.canteen': 'Daily canteen snacks', 'it.canteen.why': 'Food is a need, but buying snacks every day is a want. Packed tiffin + one treat a week costs far less.',
  'it.canteen.alt': 'Call it a need, and ₹300 is gone before the month begins.',
  'it.sneakers': 'Branded sneakers', 'it.sneakers.why': 'A want that costs more than the whole wallet. That makes it a goal: save a little each week.',
  'it.sneakers.alt': 'Buy now, and you would have to borrow and skip the bus pass too.',
  'it.fastfood': 'Fast-food outing', 'it.fastfood.why': 'Fun with friends is a want. Enjoy it once needs are covered.',
  'it.fastfood.alt': 'Saving it for later frees ₹250 for your goal.',
  'it.data': 'Mobile data recharge', 'it.data.q.project': 'School project and online classes', 'it.data.q.reels': 'Mostly reels and games',
  'it.data.why.project': 'Used for study, data is a need.', 'it.data.why.reels': 'Used only for fun, data is a want. A smaller pack may be enough.',
  'it.data.alt': 'Same item, different purpose. Ask "what is it for?" before deciding.',
  'it.guide': 'Exam prep guide', 'it.guide.why': 'It supports your entrance exam directly. A clear need.',
  'it.guide.alt': 'Delay it, and you lose preparation time that money cannot buy back.',
  'it.mock': 'Mock-test series', 'it.mock.why': 'Practice tests are part of exam prep. A need this year.',
  'it.mock.alt': 'If money is tight, sharing or free tests meet the same need for less.',
  'it.classdata': 'Phone data for online classes', 'it.classdata.why': 'No data means missed classes. For study, it is a need.',
  'it.classdata.alt': 'A pack sized for classes costs less than an unlimited one.',
  'it.chai': 'Study-group chai & snacks', 'it.chai.why': 'Nice to have, not a must. A want.',
  'it.chai.alt': 'A flask from home keeps the group time and saves ₹120.',
  'it.earphones': 'New earphones', 'it.earphones.why': 'The old ones still work, so this is a want. It can wait.',
  'it.earphones.alt': 'Buy now, and there is not enough left for the mock tests.',
  'it.famgift': 'Family function gift', 'it.famgift.q.close': 'Close family, everyone is contributing', 'it.famgift.q.extra': 'An extra gift nobody expects',
  'it.famgift.why.close': 'A family duty you cannot skip. Plan for it like a need.', 'it.famgift.why.extra': 'A kind extra, but optional. A want.',
  'it.famgift.alt': 'Family duties are real costs. Knowing them early helps you plan.',
  'g.sneakers': 'Sneakers', 'g.bat': 'Cricket bat', 'g.guide': 'Exam guide', 'g.guideset': 'Exam guide set', 'g.earphones': 'Earphones', 'g.course': 'Crash-course fee',

  // Pillar 2
  's.story.arjun': 'New month: {amt} in the wallet. The bus pass ({due}) is due in Week 4, and {goal} a week goes to the sneaker fund. Then life happens.',
  's.story.priya': 'New month: {amt} in the wallet. The mock-test fee ({due}) is due in Week 4, and {goal} a week goes to the exam-guide fund. Then life happens.',
  's.jar.title': 'Pay yourself first?', 's.jar.desc': 'Move {amt} into a Safety Jar at the start of Weeks 1, 2 and 3, before spending anything.',
  's.jar.toggle': 'Fill my Safety Jar', 's.jar.on': 'On', 's.jar.off': 'Off',
  's.begin': 'Start Week 1', 's.week': 'Week {n}', 's.wallet': 'Wallet', 's.jar': 'Safety Jar', 's.goalFund': 'Goal fund',
  's.meter': 'Safety meter', 's.meter.0': 'No buffer', 's.meter.1': 'Building', 's.meter.2': 'Protected',
  's.pick': 'Pick one for each', 's.nextWeek': 'Next week', 's.endMonth': 'Finish the month', 's.cant': 'Not enough in wallet', 's.free': 'Free',
  's.auto': 'This week, automatically', 's.auto.jar': '{amt} into the Safety Jar', 's.auto.goal': '{amt} into the goal fund',
  's.auto.paid': '{name} paid: {amt}', 's.auto.jarHelp': '{name} paid, with help from the Safety Jar',
  's.auto.miss': '{name} missed: not enough money left', 's.auto.skip': '{name} skipped (your earlier trade-off)',
  's.due.arjun': 'Bus pass', 's.due.priya': 'Mock-test fee',
  's.shock.title': 'Surprise in Week 3!', 's.shock.arjun': 'Your bicycle broke down. Repair needed: {amt}.',
  's.shock.priya': 'Family emergency: {amt} needed for urgent travel and medicine.',
  's.paths': 'Two paths', 's.with': 'With a buffer', 's.with.d': 'Paid from the Safety Jar. Your plans and your goal stay on track.',
  's.without': 'Without a buffer', 's.without.d': 'Every rupee already had a job. The money must come from one of them:',
  's.yours': 'Your path', 's.choose': 'No Safety Jar. Choose how to pay:',
  'tr.skip.arjun': 'Skip the bus pass', 'tr.skip.arjun.c': 'No pass this month: long walks, and late for first period.',
  'tr.skip.priya': 'Skip the mock-test fee', 'tr.skip.priya.c': 'No mock tests this month: less practice before the exam.',
  'tr.borrow.arjun': 'Borrow from a friend', 'tr.borrow.arjun.c': 'You owe ₹300. Next month starts ₹300 smaller.',
  'tr.borrow.priya': 'Borrow from a friend', 'tr.borrow.priya.c': 'You owe ₹300. Next month starts ₹300 smaller.',
  'tr.goal.arjun': 'Take it from the sneaker fund', 'tr.goal.arjun.c': 'The sneaker fund is emptied. The goal moves weeks away.',
  'tr.goal.priya': 'Take it from the exam-guide fund', 'tr.goal.priya.c': 'The exam-guide fund is emptied. The guide is delayed.',
  's.replay': 'Replay with a different choice', 's.keep': 'Keep going',
  's.end.left': 'Left at month end', 's.end.debt': 'You owe {amt}', 's.end.thrifty': '{n} of 8 thrifty choices',
  's.end.ranOut': 'The wallet ran dry before the month ended. Small spends add up.',
  's.l1': 'Pay yourself first: save before you spend.', 's.l2': 'Small daily choices add up over a month.',
  's.l3': 'A buffer turns an emergency into a small bump.',
  'ch.snack': 'Canteen this week', 'ch.snack.hi': 'Samosa + cool drink daily', 'ch.snack.lo': 'Packed tiffin + one treat',
  'ch.movie': 'Sunday plan', 'ch.movie.hi': 'Movie with friends', 'ch.movie.lo': 'Cricket at the ground',
  'ch.recharge': 'Mobile recharge', 'ch.recharge.hi': 'Big data pack', 'ch.recharge.lo': 'Small pack + college Wi-Fi',
  'ch.juice': 'After-class hangout', 'ch.juice.hi': 'Juice shop with friends', 'ch.juice.lo': 'Water bottle from home',
  'ch.gift': "Friend's birthday", 'ch.gift.hi': 'Buy a gift', 'ch.gift.lo': 'Handmade card + small treat',
  'ch.snack2': 'Evening hunger', 'ch.snack2.hi': 'Bakery puff + cool drink', 'ch.snack2.lo': 'One small snack',
  'ch.fastfood': 'Weekend outing', 'ch.fastfood.hi': 'Burger place', 'ch.fastfood.lo': 'Eat at home, then meet friends',
  'ch.pens': 'Stationery', 'ch.pens.hi': 'Fancy pen set', 'ch.pens.lo': 'Basic pens',
  'ch.data': 'Data for classes', 'ch.data.hi': 'Unlimited pack', 'ch.data.lo': 'Class-size pack',
  'ch.chai': 'Study-group break', 'ch.chai.hi': 'Chai + snacks at the café', 'ch.chai.lo': 'Flask from home',
  'ch.copies': 'Notes', 'ch.copies.hi': 'Photocopy the full set', 'ch.copies.lo': 'Share copies with a friend',
  'ch.auto': 'Getting to coaching', 'ch.auto.hi': 'Auto every day', 'ch.auto.lo': 'Bus or shared ride',
  'ch.chai2': 'Late study night', 'ch.chai2.hi': 'Order snacks', 'ch.chai2.lo': 'Snacks from home',
  'ch.festival': 'Festival week', 'ch.festival.hi': 'New accessories', 'ch.festival.lo': 'Reuse what you have',
  'ch.qbank': 'Extra question bank', 'ch.qbank.hi': 'Buy your own', 'ch.qbank.lo': 'Library copy',

  // Pillar 3
  'i.story.arjun': 'Arjun wonders: if I save a little every month for years, does it just sit there, or could it grow? Play with the numbers and see.',
  'i.story.priya': 'Priya will start earning in a few years. What if she began setting a little aside now? Explore how time, growth and risk work together.',
  'i.disclaimer': 'Simulations are hypothetical educational assumptions, not guarantees or investment recommendations.',
  'i.sandbox': 'Growth sandbox', 'i.monthly': 'Monthly savings', 'i.years': 'Time', 'i.yearsN': '{n} years', 'i.year1': '1 year',
  'i.rate': 'Assumed growth per year (illustrative only)', 'i.low': 'Low 4%', 'i.med': 'Medium 8%', 'i.high': 'High 12%',
  'i.put': 'You put in', 'i.growth': 'Hypothetical growth', 'i.total': 'Hypothetical total',
  'i.lg.put': 'Money you put in', 'i.lg.growth': 'Growth (if we assume {r}%)',
  'i.lg.cash': 'Cash under the mattress (0% growth)', 'i.lg.comp': 'Compounding at the assumed rate',
  'i.lg.bumpy': 'Bumpy ride (one sample path)', 'i.lg.infl': 'What that cash could buy (if prices rise ~5% a year)',
  'i.infl': 'Show inflation (assume ~5%)', 'i.bumpy': 'Bumpy ride',
  'i.bumpy.note': 'Real growth is never a smooth line. Some years go up, some go down. A higher assumed growth means a bumpier ride.',
  'i.infl.note': 'If prices rise, the same cash buys less every year. After {y} years, {put} might buy only what {real} buys today.',
  'i.how': 'How is this calculated?', 'i.formula': 'Total = P × [ (1 + r/12)^n − 1 ] ÷ (r/12)',
  'i.formula.d': 'P = monthly savings, r = assumed yearly rate, n = number of months. Growth is added every month, so growth also earns growth. This is an assumption for learning, not a prediction.',
  'i.chart.alt': 'Chart: cash kept at home compared with hypothetical compounding over {y} years',
  'i.chart.sum': 'If {m} is saved each month for {y} years and we assume {r}% a year: {put} goes in, hypothetical growth is {growth}, total {total}. Kept as cash, it stays {put}.',
  'i.axis': 'Years', 'i.tip': 'Year {y}: put in {put}, hypothetical total {total}',
  'i.toDiv': 'Next: the basket game',
  'i.div.title': 'The basket game', 'i.div.desc': 'Split a pretend ₹1,000 across three baskets. Then a tough year hits one of them. Nobody knows which.',
  'i.basket': 'Basket {x}', 'i.div.left': 'Still to place: {amt}', 'i.div.all': 'All in A', 'i.div.even': 'Spread out',
  'i.div.run': 'Run a tough year', 'i.div.again': 'Run another tough year',
  'i.div.hit': 'Tough year: Basket {x} fell 40%. The others rose a little.',
  'i.div.you': 'Your split', 'i.div.one': 'All in Basket {x}', 'i.div.spread': 'Spread out',
  'i.div.fb.conc': 'Most of your money sat in one basket, so one year decides everything. Sometimes lucky, sometimes not.',
  'i.div.fb.spread': 'Your money was spread out, so one basket falling hurt less.',
  'i.div.real': 'Spreading across different things is called diversification. It cannot remove risk, but it softens a bad year.',
  'i.dec': 'Take ₹100 out of Basket {x}', 'i.inc': 'Add ₹100 to Basket {x}',
  'i.toQuiz': 'Next: quick quiz', 'i.quiz.title': 'Quick quiz: question {a} of 3',
  'i.stock.title': 'Stock Market Basics', 'i.stock.desc': 'A share is a tiny piece of ownership in a company. When the company grows, your share value (capital gain) can grow.', 'i.stock.terms': 'Terms to know', 'i.stock.nav': 'NAV is the price of one unit of an investment basket.', 'i.stock.div': 'Dividends are a share of profits paid to you.', 'i.stock.candle': 'Candlestick Chart', 'i.stock.candle.d': 'Shows Opening, Closing, High, and Low prices. Green means price went up; Red means it went down.', 'i.toStock': 'Next: Stock Market Basics',
  'q.time': 'Two friends save the same amount each month at the same assumed rate. Asha starts now. Ravi starts 5 years later. After 10 years, who is likely to have more?',
  'q.time.a': 'Asha, because her money had more time', 'q.time.b': 'Ravi, because he started fresh', 'q.time.c': 'Both the same',
  'q.time.why': 'Time is the biggest helper. Earlier money has more years for growth to build on growth.',
  'q.risk': 'A message says: "Double your money in 3 months. Guaranteed. No risk." What is the best thought?',
  'q.risk.a': 'Great, send money fast', 'q.risk.b': 'High return with zero risk does not exist. Red flag', 'q.risk.c': 'Ask a friend to join too',
  'q.risk.why': 'More possible growth always comes with more ups and downs. "Guaranteed" and "fast" together is a warning sign.',
  'q.comp': 'What does compounding mean?',
  'q.comp.a': 'Getting your money back', 'q.comp.b': 'Saving only once', 'q.comp.c': 'Growth earning more growth over time',
  'q.comp.why': 'With compounding you earn on what you put in and on the earlier growth too. That is why the curve bends upward.',
  'q.rethink': 'Not quite. Read the options once more.',
  'i.l1': 'Time matters most: starting early beats starting big.', 'i.l2': 'Growth is never smooth. More possible growth, more bumps.',
  'i.l3': 'Do not put everything in one basket.',

  // Pillar 4
  'f.story.arjun': 'Arjun just set up his first UPI app. His phone keeps buzzing. Some messages are real, some are traps. Decide what to do with each.',
  'f.story.priya': 'Priya pays fees and recharges by UPI. Scammers know students are busy and stressed. Check each message carefully.',
  'f.block': 'Block & Report', 'f.share': 'Share Details', 'f.genuine': "It's genuine, no action needed",
  'f.count': 'Message {a} of {b}', 'f.safety': 'Safety Score', 'f.firstTry': 'first-try accuracy',
  'f.ch.sms': 'SMS', 'f.ch.wa': 'Chat', 'f.ch.upi': 'UPI request', 'f.ch.call': 'Call + chat',
  'f.reveal': 'Show the red flags', 'f.revealGood': 'Show the good signs',
  'f.flags': 'Red flags are marked ⚑ in the message.', 'f.goodSigns': 'Good signs are marked ✓ in the message.',
  'f.pause': "Pause, let's learn", 'f.pause.sub': 'Good thing this is practice. Here is how this trick works:',
  'f.hook': 'Hook', 'f.hook.d': 'A prize, refund or scare grabs your attention.',
  'f.pressure': 'Pressure', 'f.pressure.d': '"Now", "2 hours", "last chance", so you do not stop to think.',
  'f.extract': 'Extraction', 'f.extract.d': 'Then they ask for a PIN, OTP, card details, a fee or an app install.',
  'f.genuineMiss': 'This one was real. Telling real from fake is a skill too. Look at the good signs.',
  'f.rule': 'Rule to remember', 'f.correct.scam': 'You spotted the scam!', 'f.correct.gen': 'Right, this one is genuine.',
  'f.sample': 'Practice message. Senders, codes and links are made up.',
  'f.upi.approve': 'Approve', 'f.upi.decline': 'Decline', 'f.upi.req': 'Collect request: {amt}',
  'f.l1': 'Your PIN and OTP are only for you. Nobody genuine ever asks.',
  'f.l2': 'To receive money you never scan a QR, approve a request or enter a PIN.',
  'f.l3': 'Urgent + reward + "pay first" = stop and check.',
  'r.pin': 'Your PIN/OTP is only for you.', 'r.receive': 'To receive money, you never scan a QR or enter a PIN.',
  'r.fee': 'Real scholarships and jobs never ask you to pay first.',
  'r.link': 'Never tap links in scary messages. Open the official app yourself.',
  'r.app': 'Never install an app because a caller tells you to.',
  'r.read': 'Read alerts fully. Never share the code, not even with "bank staff".',
  'r.info': 'A message that only informs asks nothing from you.', 'r.verify': 'Check by calling the number you already know.',
  'sc.prize.from': 'VM-PRIZE77',
  'sc.prize': 'Congratulations! You [[won ₹10,000]] in our lucky draw! [[Send your UPI PIN now]] to claim. Offer [[ends in 10 minutes]].',
  'sc.prize.why': 'You cannot win a draw you never entered, and nobody needs your PIN to give you money.',
  'sc.otp.from': 'AX-MYBANK',
  'sc.otp': 'OTP 000000 for payment of ₹250 at College Canteen. Valid for 5 minutes. [[Do not share with anyone]]. MyBank [[never calls to ask for an OTP]].',
  'sc.otp.why': 'A normal alert for a payment you started. Read it, use the code yourself, and never share it, not even with someone claiming to be bank staff.',
  'sc.qr.from': 'Refund Desk',
  'sc.qr': 'Your order refund of ₹2,000 is ready. [[Scan this QR]] and [[enter your UPI PIN to receive]] the money. ▦▦▦',
  'sc.qr.why': 'Scanning a QR and entering a PIN always sends money out. Receiving needs nothing from you.',
  'sc.collect.from': 'cashback-offer@fakepay',
  'sc.collect': '[[Approve to receive]] ₹5,000 cashback! [[Enter UPI PIN]] to confirm. Expires [[today]].',
  'sc.collect.why': 'Approving a collect request takes money from you. Money coming in never needs approval or a PIN.',
  'sc.scholar.from': 'Scholarship Cell',
  'sc.scholar': 'Your scholarship of ₹25,000 is approved! [[Pay ₹499 processing fee]] to UPI ID scholar-desk@fakepay [[within 24 hours]] or the seat goes to another student.',
  'sc.scholar.why': 'Real scholarships come through your college or official portals and never ask for a fee by UPI.',
  'sc.kyc.from': 'KY-ALERTS',
  'sc.kyc': 'Dear customer, your KYC has expired. [[Account will be blocked in 2 hours]]. [[Click http://kyc-update.example]] and [[enter your card details]] to continue.',
  'sc.kyc.why': 'Fear plus a deadline plus a link is classic phishing. Banks do not ask for card details through a link.',
  'sc.screen.from': 'Customer Care (unknown number)',
  'sc.screen': 'Hello, I am calling from customer care about your refund. Please [[install the "QuickHelp" screen-sharing app]] and [[tell me the code]] on your screen so I can process it.',
  'sc.screen.why': 'Screen sharing lets a stranger watch your PIN and OTPs as you type. No real support team needs it for a refund.',
  'sc.job.from': 'EasyJobs HR',
  'sc.job': '[[Earn ₹500 per day]] just by liking videos from home! Limited seats. [[Pay ₹1,000 registration]] to start today.',
  'sc.job.why': 'Real jobs pay you. They do not charge you to start. Easy money for no work is bait.',
  'sc.recharge.from': 'AD-MOBILE',
  'sc.recharge': 'Recharge of ₹199 successful. Validity 28 days, 1.5 GB/day. [[No action needed]]. Thank you.',
  'sc.recharge.why': 'It only confirms something you did. No link, no request, no pressure.',
  'sc.friend.from': 'Unknown number',
  'sc.friend': 'Hi, it is me, Kiran! [[New number]], my phone broke. I am stuck, [[please send ₹500 urgently]] to this UPI, will return tonight. [[Do not call, I am in class]].',
  'sc.friend.why': 'Scammers pretend to be friends on new numbers. "Do not call" is the clue. Call the number you already have.',

  // NGO dashboard
  'a.title': 'NGO Facilitator Dashboard', 'a.sample': 'Sample data',
  'a.demo': 'Demo view. In production this dashboard would be access-controlled and limited to authorised facilitators.',
  'a.filters': 'Filters', 'a.f.batch': 'School batch', 'a.f.all': 'All', 'a.school': 'Partner School {x}', 'a.f.lang': 'Language preference',
  'a.f.action': 'Action required only', 'a.f.search': 'Search by Student ID', 'a.f.clear': 'Clear filters',
  'a.k.cohort': 'Cohort size', 'a.k.cohort.s': 'of {n} target', 'a.k.active': 'Active students', 'a.k.active.s': 'active in the last 7 days',
  'a.k.done': 'Overall completion', 'a.k.done.s': 'of all missions finished', 'a.k.safety': 'Avg Safety Score', 'a.k.safety.s': 'first-try scam accuracy',
  'a.c.score': 'Average score by pillar', 'a.c.funnel': 'Pillar completion funnel', 'a.c.lang': 'Language split', 'a.c.trend': 'Weekly activity trend',
  'a.c.week': 'W{n}', 'a.c.started': 'Started', 'a.c.students': '{n} students',
  'a.c.score.sum': 'Average scores: {list}.', 'a.c.funnel.sum': '{a} students started; {b} have completed all four pillars.',
  'a.c.lang.sum': '{te}% prefer Telugu and {en}% prefer English.', 'a.c.trend.sum': 'Active students went from {a} in week 1 to {b} in week 8.',
  'a.conf.title': 'Top Student Confusion', 'a.conf.try': 'Try this',
  'cf.qr': '{n}% struggled with identifying fake UPI QR codes', 'cf.qr.a': 'Run a 10-minute QR-scam role-play.',
  'cf.buffer': '{n}% ran out of cash when the emergency hit (no buffer)', 'cf.buffer.a': 'Do a Safety Jar pledge: each student names one weekly amount.',
  'cf.time': '{n}% underestimated how time drives compounding', 'cf.time.a': 'Draw two savers on the board: one starts 5 years earlier.',
  'cf.wants': '{n}% marked daily snacks or outings as needs', 'cf.wants.a': 'Play a quick "need or want?" stand-up, sit-down game.',
  'cf.otp': '{n}% would share an OTP with "bank staff"', 'cf.otp.a': 'Practise one line aloud together: "I never share my OTP."',
  'a.t.title': 'Students', 'a.t.id': 'Student ID', 'a.t.persona': 'Persona', 'a.t.modules': 'Modules Completed', 'a.t.safety': 'Safety Score',
  'a.t.lang': 'Language', 'a.t.action': 'Action Required',
  'a.act.refresher': 'Safety refresher', 'a.act.inactive': 'Inactive 7+ days', 'a.act.ready': 'Ready for next level', 'a.act.none': 'On track',
  'a.you': 'You (demo)', 'a.you.note': 'Live from your student session', 'a.na': 'Not yet',
  'a.empty': 'No students match these filters. Try clearing one.', 'a.page': 'Page {a} of {b}', 'a.prev': 'Previous', 'a.next': 'Next',
  'a.sort': 'Sort by {col}', 'a.scaled': 'KPIs and charts are scaled from {n} matching sample records to the full cohort.',
  'a.export': 'Export CSV', 'a.export.ok': 'CSV download started.', 'a.export.alt': 'No download? Copy the CSV instead',
  'a.export.title': 'Copy the CSV', 'a.export.d': 'Anonymised columns only. Select all and copy, or use the button.', 'a.copy': 'Copy', 'a.copied': 'Copied',

  // FinLeap Brand & Landing
  'brand.tag': 'Learn • Plan • Grow',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.features': 'Features',
  'nav.login': 'Login',
  'hero.title1': 'Small steps today,',
  'hero.title2': 'big financial dreams',
  'hero.title3': 'tomorrow.',
  'hero.sub': 'FinLeap is your personal financial literacy companion — designed for Grade 11–12 students. Learn real-life money skills through interactive lessons, games and simulations.',
  'hero.watchVideo': 'Watch Video',
  'hero.card1.title': 'Plan & Budget',
  'hero.card1.sub': 'Make smart choices',
  'hero.card2.title': 'Save & Manage',
  'hero.card2.sub': 'Build your goals',
  'hero.card3.title': 'Understand Investing',
  'hero.card3.sub': 'Grow your money',
  'hero.card4.title': 'Stay Financially Safe',
  'hero.card4.sub': 'Spot risks, stay secure',

  // FinLeap Auth / Welcome
  'auth.journey': 'Your journey to financial confidence starts here.',
  'auth.simple': 'Simple',
  'auth.interactive': 'Interactive',
  'auth.safe': 'Safe',
  'auth.welcomeBack': 'Welcome Back!',
  'auth.welcomeSub': 'Login to continue your learning journey',
  'auth.studentTab': 'Student Portal',
  'auth.ngoTab': 'NGO Portal',
  'auth.loginId': 'Username / Login ID',
  'auth.password': 'Password',
  'auth.loginBtn': 'Login',
  'auth.noAccount': "Don't have an account? Sign Up",
  'auth.hasAccount': 'Already have an account? Login',
  'auth.demoBtn': 'Quick Demo as Deepa (Grade 11)',
  'auth.tagline': 'For a financially literate tomorrow 💚',

  // FinLeap Dashboard & Sidebar
  'dash.welcome': 'Welcome back, {name}!',
  'dash.welcomeSub': 'Keep learning, keep growing!',
  'dash.kpi.progress': 'Learning Progress',
  'dash.kpi.lessons': '6 of 12 lessons',
  'dash.kpi.points': 'Total Points',
  'dash.kpi.level': 'Level {n}',
  'dash.kpi.goals': 'Goals Achieved',
  'dash.kpi.activeGoals': 'Active goals',
  'dash.kpi.accuracy': 'Quiz Accuracy',
  'dash.kpi.lastQuiz': 'Last quiz',
  'dash.modules.title': 'Learning Modules',
  'dash.modules.sub': 'Pick a module to build your money confidence',
  'dash.modules.viewAll': 'View All',
  'dash.challenge.title': "Today's Challenge",
  'dash.challenge.desc': 'You have ₹600 for the week. Make a budget, set a savings goal and handle an unexpected expense.',
  'dash.challenge.btn': 'Start Challenge',
  'dash.challenge.hint': 'Earn points • See the outcome • Try again',
  'sidebar.home': 'Home',
  'sidebar.modules': 'Learning Modules',
  'sidebar.goals': 'My Goals',
  'sidebar.budget': 'Budget Planner',
  'sidebar.quizzes': 'Quizzes',
  'sidebar.simulator': 'Simulator',
  'sidebar.terms': 'Financial Terms',
  'sidebar.achievements': 'Achievements',
  'sidebar.settings': 'Settings',

  // Budget Planner
  'bp.title': 'Budget Planner',
  'bp.sub': 'Plan your money. Build better habits.',
  'bp.income': 'Monthly Income',
  'bp.allocate': 'Allocate Your Budget',
  'bp.food': 'Food',
  'bp.transport': 'Transport',
  'bp.education': 'Education',
  'bp.entertainment': 'Entertainment',
  'bp.savings': 'Savings',
  'bp.total': 'Total',
  'bp.tip': 'Great! You are saving 20% of your income. Keep it up!',
  'bp.saveBtn': 'Save',

  // Savings Goals
  'goals.title': 'Savings Goals',
  'goals.sub': 'Dream it. Save for it. Achieve it.',
  'goals.addBtn': 'Add Goal',
  'goals.due': 'Due: {date}',
  'goals.add500': '+ Add ₹500',
  'goals.motTitle': 'Small savings today, big dreams tomorrow!',
  'goals.motDesc': 'Saving just ₹50 a week builds the habit that makes college prep, a new laptop, or an emergency buffer possible without stress.',

  // Virtual Investing Simulator
  'sim.title': 'Virtual Investing Simulator',
  'sim.sub': 'Learn how your money can grow over time.',
  'sim.initial': 'Initial Investment',
  'sim.years': 'Time Period',
  'sim.yearsVal': '{n} years',
  'sim.startBtn': 'Start Simulation',
  'sim.growthTitle': 'Potential Growth (Hypothetical)',
  'sim.low': 'Low Risk',
  'sim.med': 'Medium Risk',
  'sim.high': 'High Risk',
  'sim.note': 'Note: This is a simulation for learning purposes only. It does not guarantee returns.',

  // Scam Awareness Quiz
  'sq.title': 'Scam Awareness Quiz',
  'sq.sub': 'Can you spot the red flags?',
  'sq.count': 'Question {a} of {b}',
  'sq.qSafe': 'Is this message safe?',
  'sq.optA': 'A. Yes, it looks genuine',
  'sq.optB': 'B. No, this is a scam',
  'sq.optC': "C. I'm not sure",
  'sq.correct': 'Correct!',
  'sq.wrong': 'Be careful!',
  'sq.remember': 'Remember:',
  'sq.next': 'Next',

  // Brand Footer
  'foot.today': 'Financial literacy today',
  'foot.tomorrow': 'Independence tomorrow',
  'foot.students': 'For Grade 11–12 Students',
  'foot.community': 'Especially from underserved communities',
};

const TE = {
  'app.tag': 'చేస్తూ నేర్చుకో',
  'role.label': 'పాత్ర ఎంచుకో', 'role.student': 'స్టూడెంట్ పోర్టల్', 'role.admin': 'NGO అడ్మిన్ డాష్‌బోర్డ్', 'lang.label': 'భాష',
  'view.label': 'డివైస్ వ్యూ', 'view.mobile': 'మొబైల్', 'view.desktop': 'డెస్క్‌టాప్',
  'footer': 'ఇది నేర్చుకోవడం కోసం మాత్రమే. Vanguard ఏ ప్రత్యేక పెట్టుబడులనూ, సెక్యూరిటీలనూ సిఫార్సు చేయదు.',
  'privacy.chip': 'వ్యక్తిగత వివరాలు తీసుకోము', 'privacy.title': 'నీ ప్రైవసీ',
  'privacy.body': 'నీ పేరు, ఫోన్ నంబర్, ఆధార్, ఈమెయిల్, అడ్రస్, బ్యాంక్ లేదా UPI వివరాలు మేము ఎప్పుడూ అడగము. నువ్వు ఒక పాత్రను మాత్రమే ఎంచుకుంటావు. నీ ప్రోగ్రెస్ ఈ ఫోన్‌లోనే ఉంటుంది. వాలెట్‌లో ఉన్నది ఆట డబ్బు, నిజం డబ్బు కాదు.',
  'c.next': 'తర్వాత', 'c.back': 'వెనక్కి', 'c.start': 'పద, మొదలుపెడదాం', 'c.tryAgain': 'మళ్ళీ ప్రయత్నించు', 'c.home': 'హోమ్', 'c.close': 'మూసేయ్',
  'c.why': 'ఎందుకు?', 'c.real': 'నిజ జీవితంలో', 'c.finish': 'పూర్తి చేయి', 'c.play': 'ఆట డబ్బు', 'c.step': 'స్టెప్ {a} / {b}',
  'c.nextPillar': 'తర్వాత: {name}', 'c.score': 'స్కోర్', 'c.best': 'బెస్ట్ {n}%', 'c.nav': 'మిషన్లు',
  'fb.good': 'మంచి నిర్ణయం!', 'fb.smart': 'తెలివైన ఆలోచన!', 'fb.rethink': 'ఇంకోసారి చూద్దాం', 'fb.comeback': 'సూపర్ కమ్‌బ్యాక్!',

  'wel.title': 'నిజ జీవితానికి పనికొచ్చే డబ్బు తెలివి',
  'wel.sub': 'బస్ పాస్, క్యాంటీన్, రీఛార్జ్, UPI మీద చిన్న చిన్న ఆటలు. నిజం డబ్బు లేదు. తప్పు చేసినా ఏ నష్టం లేదు.',
  'wel.1': 'నిర్ణయం తీసుకో', 'wel.2': 'ఏమవుతుందో చూడు', 'wel.3': 'మళ్ళీ ప్రయత్నించు', 'wel.cta': 'మొదలుపెట్టు',
  'per.title': 'ఎవరిలా ఆడతావు?', 'per.sub': 'దీన్ని బట్టి కథలు, వాలెట్ మారతాయి. ఎప్పుడైనా మార్చుకోవచ్చు.',
  'per.arjun.name': 'అర్జున్', 'per.arjun.desc': 'నువ్వు రోజూ బస్‌లో వెళ్తావు, క్యాంటీన్ స్నాక్స్ అంటే ఇష్టం, స్నీకర్స్ కోసం దాచుకుంటున్నావు.',
  'per.priya.name': 'ప్రియ', 'per.priya.desc': 'నువ్వు ఎంట్రన్స్ ఎగ్జామ్స్‌కి ప్రిపేర్ అవుతున్నావు, క్లాసులకి డేటా కావాలి.',
  'per.grade': '{n}వ తరగతి', 'per.wallet': 'నెలకు {amt}', 'per.easy': 'సులువు', 'per.hard': 'కొంచెం కష్టం',
  'per.pick': '{name}లా ఆడు', 'per.switch': 'పాత్ర మార్చు',

  'home.hi': 'హాయ్, {name}!', 'home.assignments': 'అసైన్‌మెంట్‌లు', 'home.pending': 'పెండింగ్', 'home.completed': 'పూర్తయింది', 'home.wallet': 'వర్చువల్ వాలెట్', 'home.jar': 'సేఫ్టీ జార్: {amt}', 'home.level': 'లెవెల్ {n}',
  'home.toNext': 'తర్వాతి లెవెల్‌కి ఇంకా {n} XP', 'home.max': 'టాప్ లెవెల్‌కి చేరావు!',
  'home.streak': '{n} రోజుల స్ట్రీక్', 'home.overall': 'మొత్తం ప్రోగ్రెస్', 'home.badges': 'బ్యాడ్జ్‌లు', 'home.pillars': 'నీ 4 మిషన్లు',
  'home.continue': 'కొనసాగించు: {name}', 'home.allDone': 'నాలుగూ పూర్తయ్యాయి! బెస్ట్ స్కోర్ పెంచుకోవడానికి ఏదైనా మళ్ళీ ఆడు.',
  'home.earned': 'వచ్చింది', 'home.locked': 'లాక్‌లో ఉంది',
  'st.0': 'ఇంకా మొదలుపెట్టలేదు', 'st.1': 'జరుగుతోంది', 'st.2': 'పూర్తయింది',
  'lv.1': 'స్టార్టర్', 'lv.2': 'పొదుపరి', 'lv.3': 'ప్లానర్', 'lv.4': 'మనీ స్మార్ట్', 'lv.5': 'మనీ మాస్టర్',
  'tab.home': 'హోమ్', 'tab.budget': 'బడ్జెట్', 'tab.save': 'పొదుపు', 'tab.invest': 'పెట్టుబడి', 'tab.safe': 'సేఫ్టీ',
  'pl.budget': 'ప్లాన్ & బడ్జెట్', 'pl.budget.sub': 'అవసరాలు, కోరికలు, లక్ష్యాలు',
  'pl.save': 'పొదుపు & నిర్వహణ', 'pl.save.sub': 'అలవాట్లు, అనుకోని ఖర్చులు',
  'pl.invest': 'పెట్టుబడి అంటే ఏంటి', 'pl.invest.sub': 'సమయం, రిస్క్, పెరుగుదల',
  'pl.safe': 'డబ్బు విషయంలో జాగ్రత్త', 'pl.safe.sub': 'మోసాలు గుర్తుపట్టు, PIN కాపాడుకో',

  'bd.boss': 'బడ్జెట్ బాస్', 'bd.boss.d': 'అవసరాలు, కోరికలు వేరు చేసి, ఒక పొదుపు లక్ష్యం పెట్టుకో.',
  'bd.net': 'సేఫ్టీ నెట్ బిల్డర్', 'bd.net.d': '4 వారాల నెలను, అందులోని అనుకోని ఖర్చును దాటు.',
  'bd.curious': 'కాంపౌండ్ క్యూరియస్', 'bd.curious.d': 'సమయంతో డబ్బు ఎలా పెరుగుతుందో చూసి, క్విజ్ పూర్తి చేయి.',
  'bd.spotter': 'స్కామ్ స్పాటర్', 'bd.spotter.d': 'స్కామ్ సిమ్యులేటర్‌లో ప్రతి మెసేజ్‌ని చెక్ చేయి.',
  'bd.comeback': 'కమ్‌బ్యాక్ కిడ్', 'bd.comeback.d': 'మళ్ళీ ప్రయత్నించి సరిగ్గా చేయి. నేర్చుకోవడం అంటే అదే!',
  'bd.streak': 'స్ట్రీక్ స్టార్టర్', 'bd.streak.d': 'ఈ రోజు ఒక మిషన్ పూర్తి చేయి. రేపు మళ్ళీ వస్తే స్ట్రీక్ పెరుగుతుంది.',
  'bd.got': 'ఇది నీకు వచ్చేసింది!', 'bd.how': 'ఎలా సంపాదించాలి',

  'sum.title': 'మిషన్ పూర్తయింది!', 'sum.learned': 'నువ్వు నేర్చుకున్నవి', 'sum.badge': 'బ్యాడ్జ్: {name}',
  'sum.total': 'మొత్తం XP: {n}', 'sum.retryNote': 'మళ్ళీ ఆడితే XP ఎప్పుడూ తగ్గదు. నీ బెస్ట్ స్కోర్ అలాగే ఉంటుంది.', 'sum.all': 'నా బ్యాడ్జ్‌లు చూడు',

  // Pillar 1
  'b.story.arjun': 'ఈ రోజు ఒకటో తారీఖు. ఈ నెలకి {amt} వచ్చాయి. బస్ పాస్, క్యాంటీన్, స్నీకర్స్... అన్నీ కొనలేవు. ఏది ముందో తేల్చు.',
  'b.story.priya': 'నీ దగ్గర ఈ నెల {amt} ఉన్నాయి. గైడ్‌లు, మాక్ టెస్ట్‌లు, డేటా... ప్రతి రూపాయికీ ఒక పని ఉండాలి. సరిగ్గా ఎంచుకో.',
  'b.sort.title': 'అవసరమా, కోరికా, తర్వాత చూద్దామా?', 'b.sort.hint': 'ప్రతి కార్డ్ మీద ఒక బటన్ నొక్కు, లేదా కార్డ్‌ని లాగి బాక్స్‌లో వేయి.',
  'b.need': 'అవసరం', 'b.want': 'కోరిక', 'b.later': 'తర్వాతకి దాచు', 'b.left': 'మిగిలింది', 'b.saved': 'దాచింది',
  'b.bar': 'బడ్జెట్ బార్: అవసరాలు {n}, కోరికలు {w}, దాచింది {s}, మిగిలింది {l}',
  'b.guide': 'మొదలుపెట్టడానికి ఒక సూత్రం: సగం అవసరాలకి, కొంత కోరికలకి, మిగతాది దాచుకో. నీ జీవితానికి తగ్గట్టు మార్చుకో.',
  'b.over': '{amt} ఎక్కువైంది. ఒక కోరికను "తర్వాతకి దాచు"లోకి మార్చు.', 'b.placed': '{b}లో {a} పూర్తయ్యాయి',
  'b.ctx.q': 'ముందు చెప్పు: ఇది దేనికోసం?', 'b.whatif': 'వేరేలా ఎంచుకుంటే?',
  'b.toGoal': 'తర్వాత: లక్ష్యం పెట్టుకో', 'b.reset': 'మళ్ళీ మొదటి నుంచి',
  'b.goal.title': 'ఒక లక్ష్యం ఎంచుకో', 'b.goal.weekly': 'ప్రతి వారం నేను దాచేది',
  'b.goal.result': 'నీ లక్ష్యానికి {n} వారాలు', 'b.goal.months': 'అంటే సుమారు {n} నెలలు. వారానికి ఇంకొంచెం దాస్తే త్వరగా చేరుకుంటావు.',
  'b.goal.tip': 'ఎంత కావాలో, ఎప్పటికి కావాలో తెలిస్తే లక్ష్యం చేరడం సులువు.',
  'b.l1': 'ముందు అవసరాలు: ప్రయాణం, చదువు, తప్పనిసరివి.', 'b.l2': 'కోరికలు తప్పు కాదు. అవసరాల తర్వాత, వాలెట్‌కి లోబడి.',
  'b.l3': 'పెద్ద కోరికలను లక్ష్యాలుగా మార్చు. ప్రతి వారం కొంచెం దాచు.',
  'it.bus': 'నెల బస్ పాస్', 'it.bus.why': 'రోజూ కాలేజీకి వెళ్ళాలంటే ఇది కావాలి. లేకపోతే క్లాసులు మిస్ అవుతాయి.',
  'it.bus.alt': 'పాస్ వద్దనుకుంటే, రోజూ టికెట్లకి ఇంకా ఎక్కువ ఖర్చవుతుంది.',
  'it.notes': 'ఎగ్జామ్ నోట్‌బుక్స్, పెన్నులు', 'it.notes.why': 'చదువుకి కావలసినవి అవసరాలే. పరీక్షలకి నేరుగా పనికొస్తాయి.',
  'it.notes.alt': 'ఇవి కొనకపోతే, పరీక్షల టైంలో పెన్ను అడుక్కోవాలి.',
  'it.canteen': 'రోజూ క్యాంటీన్ స్నాక్స్', 'it.canteen.why': 'తిండి అవసరమే, కానీ రోజూ బయట స్నాక్స్ కొనడం కోరిక. ఇంటి టిఫిన్ + వారానికి ఒక ట్రీట్ అయితే చాలా తక్కువ ఖర్చు.',
  'it.canteen.alt': 'దీన్ని అవసరం అనుకుంటే, నెల మొదలవకముందే ₹300 అయిపోతాయి.',
  'it.sneakers': 'బ్రాండెడ్ స్నీకర్స్', 'it.sneakers.why': 'ఇది కోరిక, పైగా మొత్తం వాలెట్ కంటే ఎక్కువ ఖరీదు. అందుకే ఇది ఒక లక్ష్యం: వారం వారం కొంచెం దాచు.',
  'it.sneakers.alt': 'ఇప్పుడే కొంటే అప్పు చేయాలి, బస్ పాస్ కూడా వదిలేయాలి.',
  'it.fastfood': 'ఫ్రెండ్స్‌తో ఫాస్ట్‌ఫుడ్', 'it.fastfood.why': 'ఫ్రెండ్స్‌తో సరదా ఒక కోరిక. అవసరాలు తీరాక ఎంజాయ్ చేయొచ్చు.',
  'it.fastfood.alt': 'దీన్ని వాయిదా వేస్తే నీ లక్ష్యానికి ₹250 మిగులుతాయి.',
  'it.data': 'మొబైల్ డేటా రీఛార్జ్', 'it.data.q.project': 'స్కూల్ ప్రాజెక్ట్, ఆన్‌లైన్ క్లాసులకి', 'it.data.q.reels': 'ఎక్కువగా రీల్స్, గేమ్స్‌కి',
  'it.data.why.project': 'చదువు కోసం అయితే డేటా అవసరం.', 'it.data.why.reels': 'సరదా కోసమే అయితే డేటా కోరిక. చిన్న ప్యాక్ సరిపోవచ్చు.',
  'it.data.alt': 'వస్తువు అదే, ఉపయోగం వేరు. నిర్ణయించే ముందు "ఇది దేనికోసం?" అని అడుగు.',
  'it.guide': 'ఎగ్జామ్ ప్రిప్ గైడ్', 'it.guide.why': 'ఎంట్రన్స్ ఎగ్జామ్‌కి నేరుగా పనికొస్తుంది. కచ్చితంగా అవసరం.',
  'it.guide.alt': 'ఆలస్యం చేస్తే ప్రిపరేషన్ టైం పోతుంది. దాన్ని డబ్బుతో తిరిగి కొనలేము.',
  'it.mock': 'మాక్ టెస్ట్ సిరీస్', 'it.mock.why': 'ప్రాక్టీస్ టెస్ట్‌లు ప్రిపరేషన్‌లో భాగం. ఈ ఏడాది ఇది అవసరం.',
  'it.mock.alt': 'డబ్బు తక్కువగా ఉంటే, షేర్ చేసుకోవడం లేదా ఫ్రీ టెస్ట్‌లతో అదే అవసరం తక్కువలో తీరుతుంది.',
  'it.classdata': 'ఆన్‌లైన్ క్లాసులకి ఫోన్ డేటా', 'it.classdata.why': 'డేటా లేకపోతే క్లాసులు మిస్ అవుతాయి. చదువు కోసం కాబట్టి అవసరం.',
  'it.classdata.alt': 'క్లాసులకి సరిపడే ప్యాక్, అన్‌లిమిటెడ్ ప్యాక్ కంటే చౌక.',
  'it.chai': 'స్టడీ గ్రూప్ చాయ్, స్నాక్స్', 'it.chai.why': 'ఉంటే బాగుంటుంది, కానీ తప్పనిసరి కాదు. ఇది కోరిక.',
  'it.chai.alt': 'ఇంటి నుంచి ఫ్లాస్క్ తెస్తే గ్రూప్ టైం అలాగే ఉంటుంది, ₹120 మిగులుతాయి.',
  'it.earphones': 'కొత్త ఇయర్‌ఫోన్స్', 'it.earphones.why': 'పాతవి ఇంకా పనిచేస్తున్నాయి, కాబట్టి ఇది కోరిక. ఆగొచ్చు.',
  'it.earphones.alt': 'ఇప్పుడే కొంటే మాక్ టెస్ట్‌లకి డబ్బు సరిపోదు.',
  'it.famgift': 'ఇంట్లో ఫంక్షన్ గిఫ్ట్', 'it.famgift.q.close': 'దగ్గరి బంధువులు, అందరూ ఇస్తున్నారు', 'it.famgift.q.extra': 'ఎవరూ అడగని అదనపు గిఫ్ట్',
  'it.famgift.why.close': 'ఇది తప్పించుకోలేని కుటుంబ బాధ్యత. అవసరంలాగే ప్లాన్ చేసుకో.', 'it.famgift.why.extra': 'మంచి మనసే, కానీ తప్పనిసరి కాదు. ఇది కోరిక.',
  'it.famgift.alt': 'కుటుంబ బాధ్యతలు నిజమైన ఖర్చులే. ముందే తెలిస్తే ప్లాన్ చేయడం సులువు.',
  'g.sneakers': 'స్నీకర్స్', 'g.bat': 'క్రికెట్ బ్యాట్', 'g.guide': 'ఎగ్జామ్ గైడ్', 'g.guideset': 'ఎగ్జామ్ గైడ్ సెట్', 'g.earphones': 'ఇయర్‌ఫోన్స్', 'g.course': 'క్రాష్ కోర్స్ ఫీజు',

  // Pillar 2
  's.story.arjun': 'కొత్త నెల: వాలెట్‌లో {amt}. 4వ వారంలో బస్ పాస్ ({due}) కట్టాలి, వారానికి {goal} స్నీకర్స్ ఫండ్‌కి వెళ్తాయి. ఆ తర్వాత... జీవితం సర్‌ప్రైజ్ ఇస్తుంది.',
  's.story.priya': 'కొత్త నెల: వాలెట్‌లో {amt}. 4వ వారంలో మాక్ టెస్ట్ ఫీజు ({due}) కట్టాలి, వారానికి {goal} గైడ్ ఫండ్‌కి వెళ్తాయి. ఆ తర్వాత... జీవితం సర్‌ప్రైజ్ ఇస్తుంది.',
  's.jar.title': 'ముందు నీకోసం దాచుకుంటావా?', 's.jar.desc': '1, 2, 3 వారాల మొదట్లో, ఏదీ ఖర్చు పెట్టకముందే, {amt} సేఫ్టీ జార్‌లో వేయి.',
  's.jar.toggle': 'నా సేఫ్టీ జార్ నింపు', 's.jar.on': 'ఆన్', 's.jar.off': 'ఆఫ్',
  's.begin': '1వ వారం మొదలుపెట్టు', 's.week': '{n}వ వారం', 's.wallet': 'వాలెట్', 's.jar': 'సేఫ్టీ జార్', 's.goalFund': 'లక్ష్యం ఫండ్',
  's.meter': 'సేఫ్టీ మీటర్', 's.meter.0': 'బఫర్ లేదు', 's.meter.1': 'పెరుగుతోంది', 's.meter.2': 'సురక్షితం',
  's.pick': 'ప్రతిదానికీ ఒకటి ఎంచుకో', 's.nextWeek': 'తర్వాతి వారం', 's.endMonth': 'నెల ముగించు', 's.cant': 'వాలెట్‌లో సరిపడా లేదు', 's.free': 'ఫ్రీ',
  's.auto': 'ఈ వారం ఆటోమేటిక్‌గా', 's.auto.jar': 'సేఫ్టీ జార్‌లోకి {amt}', 's.auto.goal': 'లక్ష్యం ఫండ్‌లోకి {amt}',
  's.auto.paid': '{name} కట్టావు: {amt}', 's.auto.jarHelp': '{name} కట్టావు, సేఫ్టీ జార్ సాయంతో',
  's.auto.miss': '{name} కట్టలేకపోయావు: డబ్బు సరిపోలేదు', 's.auto.skip': '{name} వదిలేశావు (ముందు నువ్వు ఎంచుకున్నదే)',
  's.due.arjun': 'బస్ పాస్', 's.due.priya': 'మాక్ టెస్ట్ ఫీజు',
  's.shock.title': '3వ వారంలో సర్‌ప్రైజ్!', 's.shock.arjun': 'నీ సైకిల్ పాడైంది. రిపేర్‌కి {amt} కావాలి.',
  's.shock.priya': 'ఇంట్లో ఎమర్జెన్సీ: అర్జెంట్ ప్రయాణానికి, మందులకి {amt} కావాలి.',
  's.paths': 'రెండు దారులు', 's.with': 'బఫర్ ఉంటే', 's.with.d': 'సేఫ్టీ జార్ నుంచి కట్టేశావు. నీ ప్లాన్లు, నీ లక్ష్యం అలాగే ఉన్నాయి.',
  's.without': 'బఫర్ లేకపోతే', 's.without.d': 'ప్రతి రూపాయికీ ముందే ఒక పని ఉంది. ఈ డబ్బు వాటిలో ఒకదాని నుంచి రావాలి:',
  's.yours': 'నీ దారి', 's.choose': 'సేఫ్టీ జార్ లేదు. ఎలా కడతావో ఎంచుకో:',
  'tr.skip.arjun': 'బస్ పాస్ వదిలేయ్', 'tr.skip.arjun.c': 'ఈ నెల పాస్ లేదు: చాలా దూరం నడక, మొదటి పీరియడ్‌కి లేటు.',
  'tr.skip.priya': 'మాక్ టెస్ట్ ఫీజు వదిలేయ్', 'tr.skip.priya.c': 'ఈ నెల మాక్ టెస్ట్‌లు లేవు: ఎగ్జామ్ ముందు ప్రాక్టీస్ తగ్గుతుంది.',
  'tr.borrow.arjun': 'ఫ్రెండ్ దగ్గర అప్పు తీసుకో', 'tr.borrow.arjun.c': 'నువ్వు ₹300 బాకీ. వచ్చే నెల ₹300 తక్కువతో మొదలవుతుంది.',
  'tr.borrow.priya': 'ఫ్రెండ్ దగ్గర అప్పు తీసుకో', 'tr.borrow.priya.c': 'నువ్వు ₹300 బాకీ. వచ్చే నెల ₹300 తక్కువతో మొదలవుతుంది.',
  'tr.goal.arjun': 'స్నీకర్స్ ఫండ్ నుంచి తీసుకో', 'tr.goal.arjun.c': 'స్నీకర్స్ ఫండ్ ఖాళీ అయింది. లక్ష్యం కొన్ని వారాలు వెనక్కి పోయింది.',
  'tr.goal.priya': 'గైడ్ ఫండ్ నుంచి తీసుకో', 'tr.goal.priya.c': 'గైడ్ ఫండ్ ఖాళీ అయింది. గైడ్ కొనడం ఆలస్యమవుతుంది.',
  's.replay': 'వేరే ఎంపికతో మళ్ళీ ఆడు', 's.keep': 'ముందుకు పద',
  's.end.left': 'నెల చివర మిగిలింది', 's.end.debt': 'నీ బాకీ {amt}', 's.end.thrifty': '8లో {n} పొదుపు ఎంపికలు',
  's.end.ranOut': 'నెల పూర్తవకముందే వాలెట్ ఖాళీ అయింది. చిన్న ఖర్చులే కలిసి పెద్దవవుతాయి.',
  's.l1': 'ముందు నీకోసం దాచుకో, ఆ తర్వాతే ఖర్చు పెట్టు.', 's.l2': 'రోజువారీ చిన్న ఎంపికలే నెల చివరికి పెద్ద తేడా.',
  's.l3': 'బఫర్ ఉంటే ఎమర్జెన్సీ కూడా చిన్న కుదుపే.',
  'ch.snack': 'ఈ వారం క్యాంటీన్', 'ch.snack.hi': 'రోజూ సమోసా + కూల్ డ్రింక్', 'ch.snack.lo': 'ఇంటి టిఫిన్ + ఒక ట్రీట్',
  'ch.movie': 'ఆదివారం ప్లాన్', 'ch.movie.hi': 'ఫ్రెండ్స్‌తో సినిమా', 'ch.movie.lo': 'గ్రౌండ్‌లో క్రికెట్',
  'ch.recharge': 'మొబైల్ రీఛార్జ్', 'ch.recharge.hi': 'పెద్ద డేటా ప్యాక్', 'ch.recharge.lo': 'చిన్న ప్యాక్ + కాలేజీ Wi-Fi',
  'ch.juice': 'క్లాస్ తర్వాత', 'ch.juice.hi': 'ఫ్రెండ్స్‌తో జ్యూస్ షాప్', 'ch.juice.lo': 'ఇంటి నుంచి వాటర్ బాటిల్',
  'ch.gift': 'ఫ్రెండ్ పుట్టినరోజు', 'ch.gift.hi': 'గిఫ్ట్ కొను', 'ch.gift.lo': 'చేత్తో చేసిన కార్డ్ + చిన్న ట్రీట్',
  'ch.snack2': 'సాయంత్రం ఆకలి', 'ch.snack2.hi': 'బేకరీ పఫ్ + కూల్ డ్రింక్', 'ch.snack2.lo': 'ఒక చిన్న స్నాక్',
  'ch.fastfood': 'వీకెండ్ ఔటింగ్', 'ch.fastfood.hi': 'బర్గర్ షాప్', 'ch.fastfood.lo': 'ఇంట్లో తిని, ఫ్రెండ్స్‌ని కలువు',
  'ch.pens': 'స్టేషనరీ', 'ch.pens.hi': 'ఫ్యాన్సీ పెన్ సెట్', 'ch.pens.lo': 'మామూలు పెన్నులు',
  'ch.data': 'క్లాసులకి డేటా', 'ch.data.hi': 'అన్‌లిమిటెడ్ ప్యాక్', 'ch.data.lo': 'క్లాసులకి సరిపడే ప్యాక్',
  'ch.chai': 'స్టడీ గ్రూప్ బ్రేక్', 'ch.chai.hi': 'కేఫ్‌లో చాయ్ + స్నాక్స్', 'ch.chai.lo': 'ఇంటి నుంచి ఫ్లాస్క్',
  'ch.copies': 'నోట్స్', 'ch.copies.hi': 'మొత్తం సెట్ జిరాక్స్', 'ch.copies.lo': 'ఫ్రెండ్‌తో షేర్ చేసుకో',
  'ch.auto': 'కోచింగ్‌కి వెళ్ళడం', 'ch.auto.hi': 'రోజూ ఆటో', 'ch.auto.lo': 'బస్ లేదా షేర్ రైడ్',
  'ch.chai2': 'రాత్రి చదువు', 'ch.chai2.hi': 'స్నాక్స్ ఆర్డర్ చేయి', 'ch.chai2.lo': 'ఇంట్లో ఉన్న స్నాక్స్',
  'ch.festival': 'పండగ వారం', 'ch.festival.hi': 'కొత్త యాక్సెసరీస్', 'ch.festival.lo': 'ఉన్నవే వాడు',
  'ch.qbank': 'అదనపు క్వశ్చన్ బ్యాంక్', 'ch.qbank.hi': 'సొంతంగా కొను', 'ch.qbank.lo': 'లైబ్రరీ కాపీ',

  // Pillar 3
  'i.story.arjun': 'నీకొక డౌట్: ప్రతి నెలా కొంచెం దాస్తే, ఆ డబ్బు అలాగే ఉంటుందా, లేక పెరుగుతుందా? అంకెలతో ఆడి చూడు.',
  'i.story.priya': 'నువ్వు కొన్నేళ్ళలో సంపాదించడం మొదలుపెడతావు. ఇప్పటి నుంచే కొంచెం పక్కన పెడితే? సమయం, పెరుగుదల, రిస్క్ కలిసి ఎలా పనిచేస్తాయో చూడు.',
  'i.disclaimer': 'ఈ సిమ్యులేషన్లు నేర్చుకోవడం కోసం వేసుకున్న ఊహాజనిత అంచనాలు మాత్రమే. ఇవి హామీలు కావు, పెట్టుబడి సిఫార్సులు కావు.',
  'i.sandbox': 'గ్రోత్ శాండ్‌బాక్స్', 'i.monthly': 'నెలకు దాచేది', 'i.years': 'సమయం', 'i.yearsN': '{n} ఏళ్ళు', 'i.year1': '1 ఏడాది',
  'i.rate': 'ఏడాదికి పెరుగుదల అంచనా (ఉదాహరణకి మాత్రమే)', 'i.low': 'తక్కువ 4%', 'i.med': 'మధ్యస్థం 8%', 'i.high': 'ఎక్కువ 12%',
  'i.put': 'నువ్వు వేసింది', 'i.growth': 'ఊహాజనిత పెరుగుదల', 'i.total': 'ఊహాజనిత మొత్తం',
  'i.lg.put': 'నువ్వు వేసిన డబ్బు', 'i.lg.growth': 'పెరుగుదల ({r}% అనుకుంటే)',
  'i.lg.cash': 'పరుపు కింద దాచిన క్యాష్ (0% పెరుగుదల)', 'i.lg.comp': 'అనుకున్న రేటుతో కాంపౌండింగ్',
  'i.lg.bumpy': 'ఎగుడుదిగుడు దారి (ఒక ఉదాహరణ)', 'i.lg.infl': 'ఆ క్యాష్‌తో కొనగలిగేది (ధరలు ఏటా ~5% పెరిగితే)',
  'i.infl': 'ధరల పెరుగుదల చూపించు (~5% అనుకుందాం)', 'i.bumpy': 'ఎగుడుదిగుడు దారి',
  'i.bumpy.note': 'నిజమైన పెరుగుదల ఎప్పుడూ నున్నటి గీతలా ఉండదు. కొన్నేళ్ళు పైకి, కొన్నేళ్ళు కిందికి. ఎక్కువ పెరుగుదల అనుకుంటే కుదుపులూ ఎక్కువే.',
  'i.infl.note': 'ధరలు పెరిగితే, అదే క్యాష్‌తో ఏటా తక్కువే కొనగలవు. {y} ఏళ్ళ తర్వాత {put}తో, ఈ రోజు {real}తో కొనగలిగేంత మాత్రమే రావచ్చు.',
  'i.how': 'ఇది ఎలా లెక్కిస్తారు?', 'i.formula': 'మొత్తం = P × [ (1 + r/12)^n − 1 ] ÷ (r/12)',
  'i.formula.d': 'P = నెలకు దాచేది, r = ఏడాదికి అనుకున్న రేటు, n = నెలల సంఖ్య. ప్రతి నెలా పెరుగుదల కలుస్తుంది, కాబట్టి పెరుగుదల మీద కూడా పెరుగుదల వస్తుంది. ఇది నేర్చుకోవడానికి వేసుకున్న అంచనా, జోస్యం కాదు.',
  'i.chart.alt': 'చార్ట్: {y} ఏళ్ళలో ఇంట్లో దాచిన క్యాష్‌కీ, ఊహాజనిత కాంపౌండింగ్‌కీ పోలిక',
  'i.chart.sum': 'నెలకు {m} చొప్పున {y} ఏళ్ళు దాచి, ఏటా {r}% అనుకుంటే: వేసింది {put}, ఊహాజనిత పెరుగుదల {growth}, మొత్తం {total}. క్యాష్‌గా ఉంచితే {put} మాత్రమే.',
  'i.axis': 'ఏళ్ళు', 'i.tip': '{y}వ ఏడాది: వేసింది {put}, ఊహాజనిత మొత్తం {total}',
  'i.toDiv': 'తర్వాత: బుట్టల ఆట',
  'i.div.title': 'బుట్టల ఆట', 'i.div.desc': 'ఊహాజనిత ₹1,000ని మూడు బుట్టల్లో పంచు. ఆ తర్వాత ఒక బుట్టకి కష్టమైన ఏడాది వస్తుంది. ఏ బుట్టకో ఎవరికీ తెలియదు.',
  'i.basket': 'బుట్ట {x}', 'i.div.left': 'ఇంకా పంచాల్సింది: {amt}', 'i.div.all': 'అంతా Aలో', 'i.div.even': 'అన్నిట్లో పంచు',
  'i.div.run': 'కష్టమైన ఏడాది నడిపించు', 'i.div.again': 'ఇంకో కష్టమైన ఏడాది నడిపించు',
  'i.div.hit': 'కష్టమైన ఏడాది: బుట్ట {x} 40% పడిపోయింది. మిగతావి కొంచెం పెరిగాయి.',
  'i.div.you': 'నీ పంపకం', 'i.div.one': 'అంతా బుట్ట {x}లో', 'i.div.spread': 'అన్నిట్లో పంచితే',
  'i.div.fb.conc': 'నీ డబ్బు ఎక్కువగా ఒకే బుట్టలో ఉంది, కాబట్టి ఒక్క ఏడాదే అంతా తేలుస్తుంది. ఒకసారి లక్కు, ఒకసారి కాదు.',
  'i.div.fb.spread': 'నీ డబ్బు పంచి ఉంది, కాబట్టి ఒక బుట్ట పడినా దెబ్బ తక్కువే.',
  'i.div.real': 'వేర్వేరు చోట్ల పంచడాన్ని డైవర్సిఫికేషన్ అంటారు. ఇది రిస్క్‌ని పూర్తిగా తీసేయదు, కానీ చెడ్డ ఏడాది దెబ్బను తగ్గిస్తుంది.',
  'i.dec': 'బుట్ట {x} నుంచి ₹100 తీయి', 'i.inc': 'బుట్ట {x}లో ₹100 వేయి',
  'i.toQuiz': 'తర్వాత: చిన్న క్విజ్', 'i.quiz.title': 'చిన్న క్విజ్: 3లో {a}వ ప్రశ్న',
  'i.stock.title': 'స్టాక్ మార్కెట్ బేసిక్స్', 'i.stock.desc': 'షేర్ అంటే కంపెనీలో ఒక చిన్న భాగం. కంపెనీ లాభపడితే నీ షేర్ విలువ పెరుగుతుంది.', 'i.stock.terms': 'తెలుసుకోవాల్సిన పదాలు', 'i.stock.nav': 'మ్యూచువల్ ఫండ్ యూనిట్ ధరే NAV.', 'i.stock.div': 'డివిడెండ్ అంటే కంపెనీ లాభాల్లో నీకు ఇచ్చే వాటా.', 'i.stock.candle': 'క్యాండిల్‌స్టిక్ చార్ట్', 'i.stock.candle.d': 'ఓపెన్, క్లోజ్, హై, లో ధరలను చూపుతుంది. ఆకుపచ్చ అంటే ధర పెరిగింది; ఎరుపు అంటే తగ్గింది.', 'i.toStock': 'తర్వాత: స్టాక్ మార్కెట్ బేసిక్స్',
  'q.time': 'ఇద్దరు ఫ్రెండ్స్ ప్రతి నెలా ఒకే మొత్తం, ఒకే అంచనా రేటుతో దాస్తున్నారు. ఆశ ఇప్పుడే మొదలుపెట్టింది. రవి 5 ఏళ్ళ తర్వాత మొదలుపెట్టాడు. 10 ఏళ్ళ తర్వాత ఎవరి దగ్గర ఎక్కువ ఉండే అవకాశం ఉంది?',
  'q.time.a': 'ఆశ దగ్గర, ఆమె డబ్బుకి ఎక్కువ సమయం దొరికింది', 'q.time.b': 'రవి దగ్గర, కొత్తగా మొదలుపెట్టాడు కాబట్టి', 'q.time.c': 'ఇద్దరికీ సమానం',
  'q.time.why': 'సమయమే అతి పెద్ద సాయం. ముందు వేసిన డబ్బుకి, పెరుగుదల మీద పెరుగుదల రావడానికి ఎక్కువ ఏళ్ళు దొరుకుతాయి.',
  'q.risk': 'ఒక మెసేజ్: "3 నెలల్లో డబ్బు రెట్టింపు. గ్యారంటీ. రిస్క్ లేదు." దీని గురించి ఏమనుకోవాలి?',
  'q.risk.a': 'భలే, వెంటనే డబ్బు పంపాలి', 'q.risk.b': 'రిస్క్ లేకుండా ఎక్కువ లాభం ఉండదు. ఇది రెడ్ ఫ్లాగ్', 'q.risk.c': 'ఫ్రెండ్‌ని కూడా చేరమనాలి',
  'q.risk.why': 'ఎక్కువ పెరుగుదల అవకాశం ఉన్నచోట ఎగుడుదిగుళ్ళూ ఎక్కువే. "గ్యారంటీ", "త్వరగా" రెండూ కలిసి వస్తే అది హెచ్చరిక.',
  'q.comp': 'కాంపౌండింగ్ అంటే ఏంటి?',
  'q.comp.a': 'నీ డబ్బు తిరిగి రావడం', 'q.comp.b': 'ఒక్కసారి మాత్రమే దాచడం', 'q.comp.c': 'పెరుగుదల మీద మళ్ళీ పెరుగుదల రావడం',
  'q.comp.why': 'కాంపౌండింగ్‌లో నువ్వు వేసిన దానిమీదే కాదు, ఇంతకుముందు వచ్చిన పెరుగుదల మీద కూడా వస్తుంది. అందుకే గీత పైకి వంగుతుంది.',
  'q.rethink': 'ఇది కాదు. ఆప్షన్లు ఇంకోసారి చదువు.',
  'i.l1': 'సమయమే ముఖ్యం: ఎక్కువతో మొదలుపెట్టడం కంటే ముందే మొదలుపెట్టడం మేలు.', 'i.l2': 'పెరుగుదల ఎప్పుడూ నున్నగా ఉండదు. అవకాశం ఎక్కువైతే కుదుపులూ ఎక్కువే.',
  'i.l3': 'అంతా ఒకే బుట్టలో పెట్టకు.',

  // Pillar 4
  'f.story.arjun': 'అర్జున్ ఇప్పుడే మొదటిసారి UPI యాప్ పెట్టుకున్నాడు. ఫోన్‌కి మెసేజ్‌లు వస్తూనే ఉన్నాయి. కొన్ని నిజం, కొన్ని ఉచ్చు. ప్రతిదానికీ ఏం చేయాలో నువ్వే చెప్పు.',
  'f.story.priya': 'ప్రియ ఫీజులు, రీఛార్జ్‌లు UPIతో కడుతుంది. స్టూడెంట్స్ బిజీగా, టెన్షన్‌లో ఉంటారని మోసగాళ్ళకి తెలుసు. ప్రతి మెసేజ్ జాగ్రత్తగా చూడు.',
  'f.block': 'బ్లాక్ చేసి రిపోర్ట్ చేయి', 'f.share': 'వివరాలు పంపు', 'f.genuine': 'ఇది నిజమైనదే, ఏమీ చేయక్కర్లేదు',
  'f.count': '{b}లో {a}వ మెసేజ్', 'f.safety': 'సేఫ్టీ స్కోర్', 'f.firstTry': 'మొదటి ప్రయత్నంలో సరైనవి',
  'f.ch.sms': 'SMS', 'f.ch.wa': 'చాట్', 'f.ch.upi': 'UPI రిక్వెస్ట్', 'f.ch.call': 'కాల్ + చాట్',
  'f.reveal': 'రెడ్ ఫ్లాగ్‌లు చూపించు', 'f.revealGood': 'మంచి గుర్తులు చూపించు',
  'f.flags': 'మెసేజ్‌లో రెడ్ ఫ్లాగ్‌లకు ⚑ గుర్తు ఉంది.', 'f.goodSigns': 'మెసేజ్‌లో మంచి గుర్తులకు ✓ గుర్తు ఉంది.',
  'f.pause': 'ఒక్క నిమిషం, నేర్చుకుందాం', 'f.pause.sub': 'ఇది ప్రాక్టీస్ కావడం మంచిదైంది. ఈ ట్రిక్ ఇలా పనిచేస్తుంది:',
  'f.hook': 'ఎర', 'f.hook.d': 'బహుమతి, రీఫండ్ లేదా భయంతో నీ దృష్టిని లాగుతారు.',
  'f.pressure': 'ఒత్తిడి', 'f.pressure.d': '"ఇప్పుడే", "2 గంటల్లో", "చివరి ఛాన్స్" అంటూ ఆలోచించే టైం ఇవ్వరు.',
  'f.extract': 'లాగేయడం', 'f.extract.d': 'ఆ తర్వాత PIN, OTP, కార్డ్ వివరాలు, ఫీజు లేదా యాప్ ఇన్‌స్టాల్ అడుగుతారు.',
  'f.genuineMiss': 'ఇది నిజమైన మెసేజే. నిజం ఏదో, నకిలీ ఏదో గుర్తుపట్టడం కూడా ఒక స్కిల్. మంచి గుర్తులు చూడు.',
  'f.rule': 'గుర్తుంచుకో', 'f.correct.scam': 'స్కామ్‌ని పట్టేశావు!', 'f.correct.gen': 'కరెక్ట్, ఇది నిజమైనదే.',
  'f.sample': 'ప్రాక్టీస్ మెసేజ్. పంపినవాళ్ళు, కోడ్‌లు, లింక్‌లు అన్నీ కల్పితం.',
  'f.upi.approve': 'అప్రూవ్', 'f.upi.decline': 'వద్దు', 'f.upi.req': 'కలెక్ట్ రిక్వెస్ట్: {amt}',
  'f.l1': 'నీ PIN, OTP నీకు మాత్రమే. నిజమైన వాళ్ళెవరూ అడగరు.',
  'f.l2': 'డబ్బు అందుకోవడానికి QR స్కాన్, అప్రూవ్, PIN ఏదీ అవసరం లేదు.',
  'f.l3': 'అర్జెంట్ + బహుమతి + "ముందు కట్టు" = ఆగు, చెక్ చేయి.',
  'r.pin': 'నీ PIN/OTP నీకు మాత్రమే.', 'r.receive': 'డబ్బు అందుకోవడానికి QR స్కాన్ చేయాల్సిన పని లేదు, PIN కొట్టాల్సిన పని లేదు.',
  'r.fee': 'నిజమైన స్కాలర్‌షిప్‌లు, ఉద్యోగాలు ముందుగా డబ్బు కట్టమని అడగవు.',
  'r.link': 'భయపెట్టే మెసేజ్‌లలో లింక్ నొక్కకు. అధికారిక యాప్‌ని నువ్వే తెరువు.',
  'r.app': 'ఫోన్ చేసినవాళ్ళు చెప్పారని ఏ యాప్ ఇన్‌స్టాల్ చేయకు.',
  'r.read': 'అలర్ట్ పూర్తిగా చదువు. కోడ్ ఎవరికీ చెప్పకు, "బ్యాంక్ స్టాఫ్" అన్నా సరే.',
  'r.info': 'సమాచారం మాత్రమే ఇచ్చే మెసేజ్ నిన్ను ఏమీ అడగదు.', 'r.verify': 'నీకు ముందే తెలిసిన నంబర్‌కి ఫోన్ చేసి నిర్ధారించుకో.',
  'sc.prize.from': 'VM-PRIZE77',
  'sc.prize': 'అభినందనలు! మా లక్కీ డ్రాలో మీరు [[₹10,000 గెలిచారు]]! క్లెయిమ్ చేయడానికి [[ఇప్పుడే మీ UPI PIN పంపండి]]. ఆఫర్ [[10 నిమిషాల్లో ముగుస్తుంది]].',
  'sc.prize.why': 'నువ్వు పాల్గొనని డ్రాలో గెలవలేవు. నీకు డబ్బు ఇవ్వడానికి ఎవరికీ నీ PIN అవసరం లేదు.',
  'sc.otp.from': 'AX-MYBANK',
  'sc.otp': 'College Canteenలో ₹250 పేమెంట్‌కి OTP 000000. 5 నిమిషాలు చెల్లుతుంది. [[ఎవరితోనూ షేర్ చేయకండి]]. MyBank [[OTP కోసం ఎప్పుడూ కాల్ చేయదు]].',
  'sc.otp.why': 'నువ్వే మొదలుపెట్టిన పేమెంట్‌కి వచ్చే మామూలు అలర్ట్ ఇది. చదువు, కోడ్ నువ్వే వాడు, ఎవరికీ చెప్పకు. బ్యాంక్ స్టాఫ్ అని చెప్పినా సరే.',
  'sc.qr.from': 'Refund Desk',
  'sc.qr': 'మీ ఆర్డర్ రీఫండ్ ₹2,000 రెడీగా ఉంది. డబ్బు [[అందుకోవడానికి మీ UPI PIN ఎంటర్ చేసి]], [[ఈ QR స్కాన్ చేయండి]]. ▦▦▦',
  'sc.qr.why': 'QR స్కాన్ చేసి PIN కొడితే డబ్బు ఎప్పుడూ నీ దగ్గర నుంచి బయటికే పోతుంది. అందుకోవడానికి నువ్వేమీ చేయక్కర్లేదు.',
  'sc.collect.from': 'cashback-offer@fakepay',
  'sc.collect': '₹5,000 క్యాష్‌బ్యాక్ [[అందుకోవడానికి అప్రూవ్ చేయండి]]! కన్ఫర్మ్ చేయడానికి [[UPI PIN ఎంటర్ చేయండి]]. [[ఈ రోజే]] ముగుస్తుంది.',
  'sc.collect.why': 'కలెక్ట్ రిక్వెస్ట్ అప్రూవ్ చేస్తే డబ్బు నీ దగ్గర నుంచి పోతుంది. వచ్చే డబ్బుకి అప్రూవల్ గానీ PIN గానీ అవసరం ఉండదు.',
  'sc.scholar.from': 'Scholarship Cell',
  'sc.scholar': 'మీ ₹25,000 స్కాలర్‌షిప్ మంజూరైంది! [[24 గంటల్లోపు]] scholar-desk@fakepay UPI IDకి [[₹499 ప్రాసెసింగ్ ఫీజు కట్టండి]], లేదంటే సీటు వేరే స్టూడెంట్‌కి వెళ్తుంది.',
  'sc.scholar.why': 'నిజమైన స్కాలర్‌షిప్‌లు కాలేజీ లేదా అధికారిక పోర్టల్ ద్వారా వస్తాయి. UPIలో ఫీజు ఎప్పుడూ అడగవు.',
  'sc.kyc.from': 'KY-ALERTS',
  'sc.kyc': 'ప్రియమైన కస్టమర్, మీ KYC గడువు ముగిసింది. [[2 గంటల్లో అకౌంట్ బ్లాక్ అవుతుంది]]. కొనసాగించడానికి [[http://kyc-update.example క్లిక్ చేసి]] [[మీ కార్డ్ వివరాలు ఎంటర్ చేయండి]].',
  'sc.kyc.why': 'భయం + డెడ్‌లైన్ + లింక్ = పక్కా ఫిషింగ్. బ్యాంకులు లింక్ ద్వారా కార్డ్ వివరాలు అడగవు.',
  'sc.screen.from': 'Customer Care (తెలియని నంబర్)',
  'sc.screen': 'హలో, మీ రీఫండ్ గురించి కస్టమర్ కేర్ నుంచి మాట్లాడుతున్నాను. దయచేసి [["QuickHelp" స్క్రీన్ షేరింగ్ యాప్ ఇన్‌స్టాల్ చేసి]], మీ స్క్రీన్ మీద వచ్చే [[కోడ్ నాకు చెప్పండి]], నేను ప్రాసెస్ చేస్తాను.',
  'sc.screen.why': 'స్క్రీన్ షేర్ చేస్తే, నువ్వు కొట్టే PIN, OTP అన్నీ తెలియని వ్యక్తికి కనిపిస్తాయి. రీఫండ్‌కి ఏ నిజమైన సపోర్ట్ టీమ్‌కీ ఇది అవసరం లేదు.',
  'sc.job.from': 'EasyJobs HR',
  'sc.job': 'ఇంట్లో కూర్చుని వీడియోలు లైక్ చేస్తే చాలు, [[రోజుకు ₹500 సంపాదించండి]]! సీట్లు తక్కువ. ఈ రోజే మొదలుపెట్టడానికి [[₹1,000 రిజిస్ట్రేషన్ కట్టండి]].',
  'sc.job.why': 'నిజమైన ఉద్యోగం నీకు డబ్బు ఇస్తుంది, మొదలుపెట్టడానికి నిన్ను అడగదు. పని లేకుండా సులువు డబ్బు అంటే అది ఎర.',
  'sc.recharge.from': 'AD-MOBILE',
  'sc.recharge': '₹199 రీఛార్జ్ విజయవంతమైంది. వ్యాలిడిటీ 28 రోజులు, రోజుకు 1.5 GB. [[మీరు ఏమీ చేయనవసరం లేదు]]. ధన్యవాదాలు.',
  'sc.recharge.why': 'నువ్వు చేసిన పనిని కన్ఫర్మ్ చేస్తోంది అంతే. లింక్ లేదు, అడగడం లేదు, ఒత్తిడి లేదు.',
  'sc.friend.from': 'తెలియని నంబర్',
  'sc.friend': 'హాయ్, నేనే కిరణ్‌ని! [[కొత్త నంబర్]], నా ఫోన్ పాడైంది. ఇరుక్కుపోయాను, ఈ UPIకి [[అర్జెంట్‌గా ₹500 పంపు]], రాత్రికి ఇచ్చేస్తా. [[కాల్ చేయకు, క్లాస్‌లో ఉన్నా]].',
  'sc.friend.why': 'మోసగాళ్ళు కొత్త నంబర్ల నుంచి ఫ్రెండ్స్‌లా నటిస్తారు. "కాల్ చేయకు" అనడమే క్లూ. నీ దగ్గర ముందే ఉన్న నంబర్‌కి కాల్ చేయి.',

  // NGO dashboard
  'a.title': 'NGO ఫెసిలిటేటర్ డాష్‌బోర్డ్', 'a.sample': 'నమూనా డేటా',
  'a.demo': 'ఇది డెమో వ్యూ. అసలు వాడకంలో ఈ డాష్‌బోర్డ్ అనుమతి ఉన్న ఫెసిలిటేటర్లకు మాత్రమే అందుబాటులో ఉంటుంది.',
  'a.filters': 'ఫిల్టర్లు', 'a.f.batch': 'స్కూల్ బ్యాచ్', 'a.f.all': 'అన్నీ', 'a.school': 'పార్ట్‌నర్ స్కూల్ {x}', 'a.f.lang': 'భాష ఎంపిక',
  'a.f.action': 'చర్య అవసరమైనవి మాత్రమే', 'a.f.search': 'స్టూడెంట్ IDతో వెతుకు', 'a.f.clear': 'ఫిల్టర్లు తీసేయ్',
  'a.k.cohort': 'బ్యాచ్ సైజు', 'a.k.cohort.s': 'లక్ష్యం {n}లో', 'a.k.active': 'యాక్టివ్ స్టూడెంట్స్', 'a.k.active.s': 'గత 7 రోజుల్లో యాక్టివ్',
  'a.k.done': 'మొత్తం పూర్తి శాతం', 'a.k.done.s': 'అన్ని మిషన్లలో పూర్తయినవి', 'a.k.safety': 'సగటు సేఫ్టీ స్కోర్', 'a.k.safety.s': 'మొదటి ప్రయత్నంలో స్కామ్ గుర్తింపు',
  'a.c.score': 'పిల్లర్ వారీగా సగటు స్కోర్', 'a.c.funnel': 'పిల్లర్ పూర్తి ఫన్నెల్', 'a.c.lang': 'భాషల వాటా', 'a.c.trend': 'వారం వారం యాక్టివిటీ',
  'a.c.week': 'వా{n}', 'a.c.started': 'మొదలుపెట్టినవారు', 'a.c.students': '{n} మంది స్టూడెంట్స్',
  'a.c.score.sum': 'సగటు స్కోర్లు: {list}.', 'a.c.funnel.sum': '{a} మంది మొదలుపెట్టారు; {b} మంది నాలుగు పిల్లర్లూ పూర్తి చేశారు.',
  'a.c.lang.sum': '{te}% మంది తెలుగు, {en}% మంది ఇంగ్లీష్ ఎంచుకున్నారు.', 'a.c.trend.sum': 'యాక్టివ్ స్టూడెంట్స్ 1వ వారంలో {a} నుంచి 8వ వారానికి {b}కి చేరారు.',
  'a.conf.title': 'స్టూడెంట్స్ ఎక్కువగా తడబడినవి', 'a.conf.try': 'ఇలా చేసి చూడండి',
  'cf.qr': '{n}% మంది నకిలీ UPI QR కోడ్‌లను గుర్తించడంలో ఇబ్బంది పడ్డారు', 'cf.qr.a': '10 నిమిషాల QR స్కామ్ రోల్-ప్లే చేయించండి.',
  'cf.buffer': '{n}% మందికి ఎమర్జెన్సీ వచ్చినప్పుడు డబ్బు అయిపోయింది (బఫర్ లేదు)', 'cf.buffer.a': 'సేఫ్టీ జార్ ప్రతిజ్ఞ: ప్రతి స్టూడెంట్ వారానికి ఒక మొత్తం చెప్పాలి.',
  'cf.time': '{n}% మంది కాంపౌండింగ్‌లో సమయం పాత్రను తక్కువగా అంచనా వేశారు', 'cf.time.a': 'బోర్డు మీద ఇద్దరు పొదుపరులను గీయండి: ఒకరు 5 ఏళ్ళు ముందు మొదలుపెడతారు.',
  'cf.wants': '{n}% మంది రోజువారీ స్నాక్స్, ఔటింగ్‌లను అవసరాలుగా గుర్తించారు', 'cf.wants.a': '"అవసరమా, కోరికా?" అంటూ నిలబడు-కూర్చో ఆట ఆడించండి.',
  'cf.otp': '{n}% మంది "బ్యాంక్ స్టాఫ్"కి OTP చెప్పేస్తామన్నారు', 'cf.otp.a': 'అందరూ కలిసి గట్టిగా ఒక మాట ప్రాక్టీస్ చేయండి: "నా OTP ఎవరికీ చెప్పను."',
  'a.t.title': 'స్టూడెంట్స్', 'a.t.id': 'స్టూడెంట్ ID', 'a.t.persona': 'పాత్ర', 'a.t.modules': 'పూర్తయిన మాడ్యూల్స్', 'a.t.safety': 'సేఫ్టీ స్కోర్',
  'a.t.lang': 'భాష', 'a.t.action': 'అవసరమైన చర్య',
  'a.act.refresher': 'సేఫ్టీ రిఫ్రెషర్', 'a.act.inactive': '7+ రోజులుగా రాలేదు', 'a.act.ready': 'తర్వాతి లెవెల్‌కి సిద్ధం', 'a.act.none': 'సరిగ్గా సాగుతోంది',
  'a.you': 'నువ్వు (డెమో)', 'a.you.note': 'నీ స్టూడెంట్ సెషన్ నుంచి లైవ్', 'a.na': 'ఇంకా లేదు',
  'a.empty': 'ఈ ఫిల్టర్లకు సరిపోయే స్టూడెంట్స్ లేరు. ఒక ఫిల్టర్ తీసేసి చూడండి.', 'a.page': 'పేజీ {a} / {b}', 'a.prev': 'ముందుది', 'a.next': 'తర్వాతది',
  'a.sort': '{col} ప్రకారం సార్ట్ చేయి', 'a.scaled': 'KPIలు, చార్ట్‌లు సరిపోలిన {n} నమూనా రికార్డుల నుంచి మొత్తం బ్యాచ్‌కి స్కేల్ చేసినవి.',
  'a.export': 'CSV ఎక్స్‌పోర్ట్', 'a.export.ok': 'CSV డౌన్‌లోడ్ మొదలైంది.', 'a.export.alt': 'డౌన్‌లోడ్ కాలేదా? CSVని కాపీ చేసుకో',
  'a.export.title': 'CSV కాపీ చేయి', 'a.export.d': 'పేరు లేని కాలమ్‌లు మాత్రమే. అంతా సెలెక్ట్ చేసి కాపీ చేయి, లేదా బటన్ వాడు.', 'a.copy': 'కాపీ', 'a.copied': 'కాపీ అయింది',

  // FinLeap Brand & Landing
  'brand.tag': 'నేర్చుకో • ప్లాన్ చేయి • ఎదగండి',
  'nav.home': 'హోమ్',
  'nav.about': 'గురించి',
  'nav.features': 'ఫీచర్లు',
  'nav.login': 'లాగిన్',
  'hero.title1': 'నేటి చిన్న అడుగులు,',
  'hero.title2': 'రేపటి పెద్ద ఆర్థిక కలలు',
  'hero.title3': 'సాకారం.',
  'hero.sub': 'FinLeap మీ వ్యక్తిగత ఆర్థిక అక్షరాస్యత నేస్తం — 11-12వ తరగతి విద్యార్థుల కోసం రూపొందించబడింది. సరదా ఆటలు, కథలు మరియు సిమ్యులేషన్ల ద్వారా నిజ జీవిత డబ్బు నైపుణ్యాలను నేర్చుకోండి.',
  'hero.watchVideo': 'వీడియో చూడండి',
  'hero.card1.title': 'ప్లాన్ & బడ్జెట్',
  'hero.card1.sub': 'తెలివైన నిర్ణయాలు తీసుకోండి',
  'hero.card2.title': 'పొదుపు & నిర్వహణ',
  'hero.card2.sub': 'లక్ష్యాలను నిర్మించుకోండి',
  'hero.card3.title': 'పెట్టుబడి అర్థం చేసుకోండి',
  'hero.card3.sub': 'డబ్బును వృద్ధి చేయండి',
  'hero.card4.title': 'ఆర్థికంగా సురక్షితంగా ఉండండి',
  'hero.card4.sub': 'రిస్క్‌లను గుర్తించి సురక్షితంగా ఉండండి',

  // FinLeap Auth / Welcome
  'auth.journey': 'మీ ఆర్థిక ఆత్మవిశ్వాస ప్రయాణం ఇక్కడే మొదలవుతుంది.',
  'auth.simple': 'సులభం',
  'auth.interactive': 'ఇంటరాక్టివ్',
  'auth.safe': 'సురక్షితం',
  'auth.welcomeBack': 'స్వాగతం!',
  'auth.welcomeSub': 'మీ అభ్యాస ప్రయాణాన్ని కొనసాగించడానికి లాగిన్ అవ్వండి',
  'auth.studentTab': 'స్టూడెంట్ పోర్టల్',
  'auth.ngoTab': 'NGO పోర్టల్',
  'auth.loginId': 'యూజర్‌నేమ్ / లాగిన్ ID',
  'auth.password': 'పాస్‌వర్డ్',
  'auth.loginBtn': 'లాగిన్',
  'auth.noAccount': 'ఖాతా లేదా? సైన్ అప్ చేయండి',
  'auth.hasAccount': 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి',
  'auth.demoBtn': 'దీపాగా త్వరిత డెమో (11వ తరగతి)',
  'auth.tagline': 'ఆర్థికంగా అక్షరాస్యులైన రేపటి కోసం 💚',

  // FinLeap Dashboard & Sidebar
  'dash.welcome': 'స్వాగతం, {name}!',
  'dash.welcomeSub': 'నేర్చుకుంటూ ఎదుగుతూ ఉండండి!',
  'dash.kpi.progress': 'నేర్చుకునే ప్రోగ్రెస్',
  'dash.kpi.lessons': '12లో 6 పాఠాలు',
  'dash.kpi.points': 'మొత్తం పాయింట్లు',
  'dash.kpi.level': 'లెవెల్ {n}',
  'dash.kpi.goals': 'సాధించిన లక్ష్యాలు',
  'dash.kpi.activeGoals': 'యాక్టివ్ లక్ష్యాలు',
  'dash.kpi.accuracy': 'క్విజ్ ఖచ్చితత్వం',
  'dash.kpi.lastQuiz': 'చివరి క్విజ్',
  'dash.modules.title': 'లెర్నింగ్ మాడ్యూల్స్',
  'dash.modules.sub': 'డబ్బుపై నమ్మకం పెంచుకోవడానికి ఒక మాడ్యూల్‌ని ఎంచుకోండి',
  'dash.modules.viewAll': 'అన్నీ చూడండి',
  'dash.challenge.title': 'నేటి ఛాలెంజ్',
  'dash.challenge.desc': 'ఈ వారానికి మీ వద్ద ₹600 ఉన్నాయి. బడ్జెట్ వేసి, పొదుపు లక్ష్యాన్ని నిర్ణయించి, అనుకోని ఖర్చును ఎదుర్కోండి.',
  'dash.challenge.btn': 'ఛాలెంజ్ ప్రారంభించండి',
  'dash.challenge.hint': 'పాయింట్లు సంపాదించండి • ఫలితాన్ని చూడండి • మళ్ళీ ప్రయత్నించండి',
  'sidebar.home': 'హోమ్',
  'sidebar.modules': 'లెర్నింగ్ మాడ్యూల్స్',
  'sidebar.goals': 'నా లక్ష్యాలు',
  'sidebar.budget': 'బడ్జెట్ ప్లానర్',
  'sidebar.quizzes': 'క్విజ్‌లు',
  'sidebar.simulator': 'సిమ్యులేటర్',
  'sidebar.terms': 'ఆర్థిక నిబంధనలు',
  'sidebar.achievements': 'విజయాలు',
  'sidebar.settings': 'సెట్టింగ్స్',

  // Budget Planner
  'bp.title': 'బడ్జెట్ ప్లానర్',
  'bp.sub': 'మీ డబ్బును ప్లాన్ చేసుకోండి. మంచి అలవాట్లను నిర్మించుకోండి.',
  'bp.income': 'నెలవారీ ఆదాయం',
  'bp.allocate': 'మీ బడ్జెట్‌ను కేటాయించండి',
  'bp.food': 'ఆహారం',
  'bp.transport': 'ప్రయాణం',
  'bp.education': 'విద్య',
  'bp.entertainment': 'వినోదం',
  'bp.savings': 'పొదుపు',
  'bp.total': 'మొత్తం',
  'bp.tip': 'అద్భుతం! మీరు మీ ఆదాయంలో 20% పొదుపు చేస్తున్నారు. ఇలాగే కొనసాగించండి!',
  'bp.saveBtn': 'సేవ్ చేయండి',

  // Savings Goals
  'goals.title': 'పొదుపు లక్ష్యాలు',
  'goals.sub': 'కల కనండి. పొదుపు చేయండి. సాధించండి.',
  'goals.addBtn': 'లక్ష్యం జోడించు',
  'goals.due': 'గడువు: {date}',
  'goals.add500': '+ ₹500 జోడించు',
  'goals.motTitle': 'నేటి చిన్న పొదుపు, రేపటి పెద్ద కలలు!',
  'goals.motDesc': 'వారానికి కేవలం ₹50 పొదుపు చేసినా కాలేజీ ఫీజులు, కొత్త ల్యాప్‌టాప్ లేదా ఎమర్జెన్సీ ఫండ్ ఒత్తిడి లేకుండా సమకూరుతాయి.',

  // Virtual Investing Simulator
  'sim.title': 'వర్చువల్ ఇన్వెస్టింగ్ సిమ్యులేటర్',
  'sim.sub': 'సమయంతో పాటు మీ డబ్బు ఎలా పెరుగుతుందో తెలుసుకోండి.',
  'sim.initial': 'ప్రారంభ పెట్టుబడి',
  'sim.years': 'సమయం (సంవత్సరాలు)',
  'sim.yearsVal': '{n} సంవత్సరాలు',
  'sim.startBtn': 'సిమ్యులేషన్ ప్రారంభించు',
  'sim.growthTitle': 'ఊహాజనిత పెరుగుదల',
  'sim.low': 'తక్కువ రిస్క్',
  'sim.med': 'మధ్యస్థ రిస్క్',
  'sim.high': 'అధిక రిస్క్',
  'sim.note': 'గమనిక: ఇది నేర్చుకోవడానికి మాత్రమే ఉద్దేశించిన సిమ్యులేషన్. రాబడికి హామీ ఇవ్వదు.',

  // Scam Awareness Quiz
  'sq.title': 'స్కామ్ అవేర్‌నెస్ క్విజ్',
  'sq.sub': 'మోసపు హెచ్చరికలను గుర్తించగలరా?',
  'sq.count': 'ప్రశ్న {a} / {b}',
  'sq.qSafe': 'ఈ మెసేజ్ సురక్షితమైనదేనా?',
  'sq.optA': 'A. అవును, నిజమైనదే అనిపిస్తోంది',
  'sq.optB': 'B. కాదు, ఇది మోసం',
  'sq.optC': 'C. నాకు కచ్చితంగా తెలియదు',
  'sq.correct': 'సరిగ్గా చెప్పారు!',
  'sq.wrong': 'జాగ్రత్తగా ఉండండి!',
  'sq.remember': 'గుర్తుంచుకోండి:',
  'sq.next': 'తర్వాత ప్రశ్న',

  // Brand Footer
  'foot.today': 'నేడు ఆర్థిక అక్షరాస్యత',
  'foot.tomorrow': 'రేపు ఆర్థిక స్వాతంత్ర్యం',
  'foot.students': '11–12వ తరగతి విద్యార్థుల కోసం',
  'foot.community': 'ముఖ్యంగా వెనుకబడిన వర్గాల కోసం',
};

const DICT = { en: EN, te: TE };
const LANGS = [{ value: 'en', label: 'English' }, { value: 'te', label: 'తెలుగు' }];

// t(key, vars): falls back to English, then to the key itself.
const makeT = (lang) => (key, vars) => {
  let str = (DICT[lang] && DICT[lang][key]) ?? DICT.en[key];
  if (str == null) { if (typeof globalThis !== 'undefined' && globalThis.__LF_MISSING) globalThis.__LF_MISSING.add(key); return key; }
  if (vars) for (const k in vars) str = str.split(`{${k}}`).join(String(vars[k]));
  return str;
};
const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ============================================================================
   2. STORE (useReducer)
   Only a persona choice and anonymous progress are kept. No personal data.
   ========================================================================== */

const STORAGE_KEY = 'lakshya-finlit-v1';
const today = () => new Date().toISOString().slice(0, 10);
const freshRun = () => ({
  prog: Object.fromEntries(PILLARS.map((p) => [p.id, { st: 0, best: 0, tries: 0 }])),
  wallet: null, jar: 0, safety: null,
});
const defaultGoals = [
  { id: 'laptop', name: 'New Laptop', current: 8000, target: 25000, due: 'Dec 2025', icon: 'laptop', color: '#8B5CF6' },
  { id: 'college', name: 'College Preparation', current: 3000, target: 10000, due: 'Jun 2026', icon: 'grad', color: '#10B981' },
  { id: 'emergency', name: 'Emergency Fund', current: 1500, target: 5000, due: 'Mar 2026', icon: 'shield', color: '#3B82F6' },
];

const baseState = () => ({
  lang: 'en', role: 'student', screen: 'landing', persona: 'arjun', userName: '', epoch: 0,
  xp: 240, xpKeys: { 'arjun:init': 1 }, badges: { boss: 1 }, streak: 1, lastDay: today(), runs: {}, attempts: [], viewMode: 'desktop',
  avatar: '👩🏽', accounts: {},
  goals: defaultGoals,
  budgetPlan: { income: 5000, food: 1500, transport: 1000, education: 1000, entertainment: 500, savings: 1000 },
  investSim: { initial: 5000, years: 10 },
  quizStep: 1,
});

function loadState(initial) {
  let s = baseState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.v === 1 && saved.state) {
      s = { ...s, ...saved.state };
      if (!s.goals || s.goals.length === 0) s.goals = defaultGoals;
      if (!s.budgetPlan) s.budgetPlan = { income: 5000, food: 1500, transport: 1000, education: 1000, entertainment: 500, savings: 1000 };
      if (!s.investSim) s.investSim = { initial: 5000, years: 10 };
      const now = today();
      if (s.lastDay !== now) {
        const gap = Math.round((Date.parse(now) - Date.parse(s.lastDay)) / 864e5);
        s.streak = gap === 1 ? s.streak + 1 : 1;
        s.lastDay = now;
      }
      if (s.userName) {
        s.screen = (s.role === 'admin') ? 'admin' : (s.screen === 'welcome' || s.screen === 'landing') ? 'home' : s.screen;
      } else {
        s.screen = 'landing';
      }
    }
  } catch (e) { /* storage unavailable: run in memory */ }
  s = { ...s, ...(initial || {}) };
  if (!s.persona) s.persona = 'arjun';
  if (s.persona && !s.runs[s.persona]) s.runs = { ...s.runs, [s.persona]: freshRun() };
  return s;
}

function saveState(s) {
  try {
    const { lang, persona, userName, avatar, epoch, xp, xpKeys, badges, streak, lastDay, runs, attempts, viewMode, role, accounts, goals, budgetPlan, investSim } = s;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, state: { lang, persona, userName, avatar, epoch, xp, xpKeys, badges, streak, lastDay, runs, attempts, viewMode, role, accounts, goals, budgetPlan, investSim } }));
  } catch (e) { /* ignore */ }
}

// XP is only ever added. Each award has a key so replays never double-count and never subtract.
const addXp = (s, n, key) => {
  const k = `${s.persona}:${key}`;
  return s.xpKeys[k] ? s : { ...s, xp: s.xp + n, xpKeys: { ...s.xpKeys, [k]: 1 } };
};

function reducer(s, a) {
  switch (a.type) {
    case 'lang': return { ...s, lang: a.v };
    case 'userName': return { ...s, userName: a.v };
    case 'avatar': return { ...s, avatar: a.v };
    case 'role': return { ...s, role: a.v };
    case 'viewMode': return { ...s, viewMode: a.v };
    case 'go': return { ...s, screen: a.v };
    case 'logout': return { ...s, persona: 'arjun', userName: '', avatar: null, screen: 'landing', role: 'student' };
    case 'setAccount': return { ...s, accounts: { ...s.accounts, [a.id]: a.account } };
    case 'approveNgo': 
      if (!s.accounts[a.id]) return s;
      return { ...s, accounts: { ...s.accounts, [a.id]: { ...s.accounts[a.id], status: 'approved' } } };
    case 'login': return { ...s, userName: a.userName, role: a.role, avatar: a.avatar || null, persona: a.persona || s.persona || 'arjun', screen: a.screen || 'home', epoch: s.epoch + 1 };
    case 'persona': // resets this persona's attempt state only; XP and badges stay
      return { ...s, persona: a.v, screen: 'home', epoch: s.epoch + 1, runs: { ...s.runs, [a.v]: freshRun() } };
    case 'xp': return addXp(s, a.n, a.key);
    case 'addGoal': return { ...s, goals: [...(s.goals || []), a.goal] };
    case 'depositGoal': return { ...s, goals: (s.goals || []).map(g => g.id === a.id ? { ...g, current: Math.min(g.target, g.current + a.amt) } : g) };
    case 'updateBudget': return { ...s, budgetPlan: { ...s.budgetPlan, ...a.v } };
    case 'updateInvestSim': return { ...s, investSim: { ...s.investSim, ...a.v } };
    case 'quizStep': return { ...s, quizStep: a.v };
    case 'begin': {
      const run = s.runs[s.persona];
      if (run.prog[a.id].st !== 0) return s;
      return { ...s, runs: { ...s.runs, [s.persona]: { ...run, prog: { ...run.prog, [a.id]: { ...run.prog[a.id], st: 1 } } } } };
    }
    case 'finish': {
      const run = s.runs[s.persona];
      const p = run.prog[a.id];
      const pillar = PILLARS.find((x) => x.id === a.id);
      const badges = { ...s.badges, [pillar.badge]: 1, streak: 1 };
      if (a.retried || p.tries > 0) badges.comeback = 1;
      const next = {
        ...run, ...(a.extra || {}),
        prog: { ...run.prog, [a.id]: { st: 2, best: Math.max(p.best, a.score), tries: p.tries + 1 } },
        safety: a.id === 'safe' ? Math.max(run.safety ?? 0, a.score) : run.safety,
      };
      return addXp({ ...s, badges, runs: { ...s.runs, [s.persona]: next } }, 50, `done:${a.id}`);
    }
    case 'attempt': // every scam answer is kept for analytics; it never touches XP
      return { ...s, attempts: [...s.attempts.slice(-199), a.v] };
    default: return s;
  }
}

const Ctx = createContext(null);
const useApp = () => useContext(Ctx);
const pctOf = (p) => (p.st === 2 ? 100 : p.st === 1 ? 50 : 0);
const levelOf = (xp) => { let i = 0; LEVELS.forEach((v, k) => { if (xp >= v) i = k; }); return i; };

function useScrollTop(dep) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try { window.scrollTo(0, 0); } catch (e) { /* not available */ }
  }, [dep]);
}

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
};

// Eases a number toward its target so charts animate on change (skipped for reduced motion).
function useTween(target, ms = 350) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') { cur.current = target; setV(target); return undefined; }
    const from = cur.current; const t0 = performance.now(); let raf;
    const tick = (now) => {
      const k = clamp((now - t0) / ms, 0, 1);
      cur.current = from + (target - from) * (1 - Math.pow(1 - k, 3));
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* ============================================================================
   3. UI PRIMITIVES
   ========================================================================== */

const STYLE = `
.lf{font-family:'Montserrat',system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Telugu','Nirmala UI',sans-serif;font-optical-sizing:auto;color:${C.ink};line-height:1.45;-webkit-text-size-adjust:100%}
.lf [hidden]{display:none!important}
.lf button{cursor:pointer;font-family:inherit}
.lf button:disabled{cursor:not-allowed}
.lf :focus-visible{outline:3px solid ${C.ink};outline-offset:2px;box-shadow:0 0 0 6px #fff}
.lf-ring circle{transition:stroke-dashoffset .6s ease}
.lf-bar{transition:width .5s ease,height .5s ease,flex-basis .5s ease}
.lf-pop{animation:lf-pop .25s ease-out}
.lf-confetti i{position:absolute;top:0;width:8px;height:12px;border-radius:2px;opacity:0;animation:lf-fall 1.5s ease-out forwards}
.lf input[type=range]{width:100%;height:44px;accent-color:${C.red}}
.lf input[type=checkbox]{width:22px;height:22px;accent-color:${C.burgundy}}
.lf mark{background:transparent;color:inherit}
@keyframes lf-pop{from{transform:scale(.97);opacity:0}to{transform:none;opacity:1}}
@keyframes lf-fall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(360px) rotate(540deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.lf *{animation:none!important;transition:none!important}.lf-confetti{display:none}}
`;

const Card = ({ className = '', style, children, ...p }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: C.line, ...style }} {...p}>{children}</div>
);

const Btn = ({ kind = 'primary', bg, fg, className = '', style, children, ...p }) => {
  const look = kind === 'primary' ? { background: bg || C.red, color: fg || '#fff', borderColor: 'transparent' }
    : kind === 'soft' ? { background: C.blush, color: C.burgundy, borderColor: 'transparent' }
      : { background: '#fff', color: C.ink, borderColor: '#CFC4C6' };
  return (
    <button type="button" className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-base font-semibold text-center leading-tight disabled:opacity-50 ${className}`}
      style={{ minHeight: 48, borderWidth: 2, borderStyle: 'solid', ...look, ...style }} {...p}>{children}</button>
  );
};

const Seg = ({ label, value, onChange, options, dark, full }) => (
  <div role="group" aria-label={label} className={`${full ? 'flex w-full' : 'inline-flex'} rounded-xl p-0.5 gap-0.5`}
    style={{ background: dark ? 'rgba(255,255,255,.16)' : '#EFE6E7' }}>
    {options.map((o) => {
      const on = o.value === value;
      return (
        <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(o.value)}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-3 text-sm font-semibold leading-tight"
          style={{ minHeight: 44, background: on ? '#fff' : 'transparent', color: on ? C.burgundy : dark ? '#fff' : C.ink, border: 0 }}>
          {o.icon}{o.label}
        </button>
      );
    })}
  </div>
);

const Ring = ({ pct, size = 56, stroke = 6, color = C.red, track = '#EADFE0', label, children }) => {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <span className="lf-ring relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}
      role={label ? 'img' : undefined} aria-label={label}>
      <svg width={size} height={size} className="absolute inset-0" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamp(pct, 0, 100) / 100)} />
      </svg>
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
};

const CONFETTI_COLORS = [C.red, C.amber, C.teal, C.crimson, C.dteal];
const Confetti = () => (
  <div className="lf-confetti pointer-events-none absolute inset-x-0 top-0" aria-hidden="true">
    {Array.from({ length: 24 }, (_, i) => (
      <i key={i} style={{ left: `${(i * 37 + 5) % 96}%`, background: CONFETTI_COLORS[i % 5], animationDelay: `${(i % 6) * 0.07}s` }} />
    ))}
  </div>
);

// Used everywhere: verdict (icon + colour + text) -> Why -> In real life -> next action.
const TONES = {
  good: { bg: C.goodBg, fg: C.good, Icon: Check },
  ok: { bg: '#E0F5F2', fg: '#0B6B62', Icon: Sparkles },
  learn: { bg: C.blush, fg: C.burgundy, Icon: Lightbulb },
};
const Feedback = ({ tone = 'good', title, why, real, realLabel, children }) => {
  const { t } = useApp(); const { bg, fg, Icon } = TONES[tone];
  return (
    <div role="status" aria-live="polite" className="lf-pop rounded-2xl p-3 mt-3" style={{ background: bg }}>
      <div className="flex items-center gap-2 font-bold" style={{ color: fg }}>
        <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, background: fg, color: '#fff' }}><Icon size={16} aria-hidden="true" /></span>
        {title}
      </div>
      {why && <p className="mt-2 text-sm"><b>{t('c.why')}</b> {why}</p>}
      {real && <p className="mt-1 text-sm"><b>{realLabel || t('c.real')}:</b> {real}</p>}
      {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
};

function SoundButton({ className = '' }) {
  const [enabled, setEnabled] = useState(isSoundEnabled());
  useEffect(() => {
    const handler = (e) => setEnabled(e.detail?.enabled ?? isSoundEnabled());
    if (typeof window !== 'undefined') {
      window.addEventListener('lf:sound-toggle', handler);
      return () => window.removeEventListener('lf:sound-toggle', handler);
    }
  }, []);
  return (
    <button
      type="button"
      onClick={() => setEnabled(toggleSound())}
      title={enabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
      aria-label={enabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
      className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
        enabled
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
      } ${className}`}
    >
      {enabled ? <Volume2 size={16} className="text-emerald-700" /> : <VolumeX size={16} className="text-slate-400" />}
      <span className="hidden sm:inline">{enabled ? 'Sound On' : 'Muted'}</span>
    </button>
  );
}

function Modal({ title, onClose, maxWidth = 480, children }) {
  const { t } = useApp(); const btn = useRef(null); const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (btn.current) btn.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: 'rgba(31,31,31,.6)' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="lf-pop bg-white rounded-2xl p-5 w-full max-h-[92vh] overflow-y-auto" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-lg font-bold flex-1">{title}</h2>
          <button ref={btn} type="button" aria-label={t('c.close')} onClick={onClose} className="rounded-full inline-flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, background: C.blush, color: C.burgundy, border: 0 }}><X size={20} aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Logo = ({ size = 36, white = false }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="17" fill={white ? 'rgba(255,255,255,0.2)' : '#064E3B'} />
    <path d="M10 24 C10 16, 16 11, 26 10 C26 18, 21 24, 13 24 Z" fill={white ? '#FFFFFF' : '#10B981'} />
    <path d="M12 24 C15 20, 20 15, 26 10" stroke={white ? '#10B981' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="26" cy="10" r="2.5" fill={white ? '#10B981' : '#34D399'} />
  </svg>
);

const FinLeapBrand = ({ dark = false }) => {
  const { t } = useApp() || {};
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={36} white={dark} />
      <div className="text-left">
        <div className={`font-extrabold text-lg leading-tight tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          FinLeap
        </div>
        <div className={`text-[10px] tracking-wider uppercase font-semibold ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {t ? t('brand.tag') : 'Learn • Plan • Grow'}
        </div>
      </div>
    </div>
  );
};

function FinLeapFooter() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <footer className="w-full bg-[#064E3B] text-white py-6 px-4 sm:px-8 mt-12 border-t border-emerald-900/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <FinLeapBrand dark />
        <div className="flex items-center gap-2 text-sm text-emerald-100 font-medium">
          <span>{t('foot.today')}</span>
          <ArrowRight size={16} className="text-emerald-400" />
          <span className="text-emerald-300 font-bold">{t('foot.tomorrow')}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-emerald-200/80 md:text-right">
          <div>
            <div>{t('foot.students')}</div>
            <div>{t('foot.community')}</div>
          </div>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700 transition">
            <Lock size={12} aria-hidden="true" />{t('privacy.chip')}<Info size={12} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-emerald-800/60 text-center text-[11px] text-emerald-300/70">
        <p>{t('footer')}</p>
      </div>
      {open && <Modal title={t('privacy.title')} onClose={() => setOpen(false)}><p className="text-sm">{t('privacy.body')}</p></Modal>}
    </footer>
  );
}

function Footer() {
  return <FinLeapFooter />;
}

function TopBar() {
  const { s, d, t } = useApp();
  return (
    <header className="sticky top-0 z-40 shadow-sm" style={{ background: '#064E3B', color: '#fff' }}>
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="button" onClick={() => d({ type: 'go', v: 'landing' })} className="flex items-center gap-2 mr-auto text-left border-0 bg-transparent cursor-pointer">
          <Logo size={32} white />
          <div>
            <div className="font-extrabold text-base leading-tight tracking-tight text-white">FinLeap</div>
            <div className="text-[10px] text-emerald-200 tracking-wider uppercase font-semibold">{t('brand.tag')}</div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => d({ type: 'role', v: s.role === 'admin' ? 'student' : 'admin' })}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800 border border-emerald-700/50">
            {s.role === 'admin' ? t('role.student') : t('role.admin')}
          </button>
          <Seg dark label={t('lang.label')} value={s.lang} onChange={(v) => d({ type: 'lang', v })} options={LANGS} />
        </div>
      </div>
    </header>
  );
}

function TabBar() {
  const { s, d, t, run } = useApp();
  const overall = Math.round(PILLARS.reduce((a, p) => a + pctOf(run.prog[p.id]), 0) / PILLARS.length);
  const tabs = [{ id: 'home', Icon: Home, color: C.burgundy, pct: overall }, ...PILLARS.map((p) => ({ id: p.id, Icon: p.Icon, color: p.color, pct: pctOf(run.prog[p.id]) }))];
  return (
    <nav aria-label={t('c.nav')} className="sticky bottom-0 z-30 bg-white grid grid-cols-5" style={{ borderTop: `1px solid ${C.line}` }}>
      {tabs.map((tb) => {
        const on = s.screen === tb.id;
        return (
          <button key={tb.id} type="button" aria-current={on ? 'page' : undefined} onClick={() => d({ type: 'go', v: tb.id })}
            className="flex flex-col items-center justify-center gap-0.5 px-0.5 py-1"
            style={{ minHeight: 62, border: 0, background: on ? C.blush : '#fff', color: on ? C.burgundy : C.muted, borderTop: `3px solid ${on ? tb.color : 'transparent'}` }}>
            <Ring pct={tb.pct} size={32} stroke={3} color={tb.color}><tb.Icon size={15} aria-hidden="true" /></Ring>
            <span className="text-xs font-semibold leading-tight">{t(`tab.${tb.id}`)}</span>
            <span className="sr-only">{tb.pct}%</span>
          </button>
        );
      })}
    </nav>
  );
}

// Shared frame for the four pillars: coloured header, step dots, story card and summary.
const PillarHead = ({ pillar, step, steps }) => {
  const { t } = useApp();
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: pillar.color, color: pillar.on }}>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, background: 'rgba(255,255,255,.25)' }}><pillar.Icon size={24} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight">{t(`pl.${pillar.id}`)}</h1>
          <p className="text-sm">{t('c.step', { a: Math.min(step + 1, steps), b: steps })}</p>
        </div>
      </div>
      <div className="flex gap-1 mt-3" aria-hidden="true">
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className="flex-1 rounded-full" style={{ height: 6, background: i <= step ? pillar.on : 'rgba(255,255,255,.35)', opacity: i <= step ? 1 : 0.7 }} />
        ))}
      </div>
    </div>
  );
};

const Story = ({ pillar, text, cta, onStart, children }) => {
  const { P } = useApp();
  return (
    <Card className="lf-pop" style={{ borderColor: pillar.color, borderWidth: 2 }}>
      <div className="flex gap-3 items-start">
        <span className="text-5xl leading-none" aria-hidden="true">{P.e}</span>
        <p className="text-base">{text}</p>
      </div>
      {children}
      <Btn className="w-full mt-4" bg={pillar.color} fg={pillar.on} onClick={onStart}>{cta}<ChevronRight size={18} aria-hidden="true" /></Btn>
    </Card>
  );
};

const Summary = ({ pillar, score, learned, onRetry, children }) => {
  const { s, d, t, run } = useApp();
  const badge = BADGES.find((b) => b.id === pillar.badge);
  const idx = PILLARS.indexOf(pillar);
  const next = [...PILLARS.slice(idx + 1), ...PILLARS.slice(0, idx)].find((p) => run.prog[p.id].st !== 2);
  return (
    <Card className="lf-pop relative text-center" style={{ borderColor: pillar.color, borderWidth: 2 }}>
      <Confetti />
      <div role="status" aria-live="polite">
        <h2 className="text-2xl font-bold">{t('sum.title')}</h2>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Ring pct={score} size={84} stroke={8} color={pillar.color} label={`${t('c.score')} ${score}%`}><b className="text-lg">{score}%</b></Ring>
          <div className="text-left">
            <div className="text-3xl" aria-hidden="true">{badge.e}</div>
            <div className="font-bold">{t('sum.badge', { name: t(`bd.${badge.id}`) })}</div>
            <div className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: C.burgundy }}><Zap size={14} aria-hidden="true" />{t('sum.total', { n: s.xp })}</div>
          </div>
        </div>
      </div>
      {children}
      <div className="text-left mt-4 rounded-xl p-3" style={{ background: pillar.soft }}>
        <h3 className="font-bold mb-1">{t('sum.learned')}</h3>
        <ol className="text-sm space-y-1">{learned.map((k, i) => <li key={k} className="flex gap-2"><b>{i + 1}.</b><span>{t(k)}</span></li>)}</ol>
      </div>
      <div className="grid gap-2 mt-4">
        <Btn onClick={() => d({ type: 'go', v: next ? next.id : 'home' })}>
          {next ? t('c.nextPillar', { name: t(`pl.${next.id}`) }) : t('sum.all')}<ChevronRight size={18} aria-hidden="true" />
        </Btn>
        <Btn kind="ghost" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" />{t('c.tryAgain')}</Btn>
      </div>
      <p className="text-xs mt-3" style={{ color: C.muted }}>{t('sum.retryNote')}</p>
    </Card>
  );
};

/* ============================================================================
   4. FINLEAP SCREENS & COMPONENTS
   ========================================================================== */

function LandingPage() {
  const { s, d, t } = useApp();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <FinLeapBrand />
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button type="button" onClick={() => d({ type: 'go', v: 'landing' })} className="text-emerald-700 hover:text-emerald-800 transition font-bold">{t('nav.home')}</button>
            <button type="button" onClick={() => setShowVideo(true)} className="hover:text-emerald-700 transition">{t('nav.about')}</button>
            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'modules' }); }} className="hover:text-emerald-700 transition">{t('nav.features')}</button>
            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'terms' }); }} className="hover:text-emerald-700 transition">Financial Terms</button>
          </nav>

          <div className="flex items-center gap-3">
            <Seg dark={false} label={t('lang.label')} value={s.lang} onChange={(v) => d({ type: 'lang', v })} options={LANGS} />
            <button type="button" onClick={() => d({ type: 'go', v: 'welcome' })}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition">
              {t('nav.login')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            {t('hero.title1')}<br />
            <span className="text-emerald-600">{t('hero.title2')}</span><br />
            {t('hero.title3')}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            {t('hero.sub')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => d({ type: 'go', v: 'persona' })}
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full shadow-lg shadow-emerald-700/20 transition flex items-center gap-2 text-base cursor-pointer">
              {t('wel.cta')} <ChevronRight size={18} />
            </button>

            <button type="button" onClick={() => setShowVideo(true)}
              className="px-7 py-3.5 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-full transition flex items-center gap-2 text-base bg-white shadow-sm cursor-pointer">
              <Play size={18} className="text-emerald-600 fill-emerald-600" /> {t('hero.watchVideo')}
            </button>
          </div>

          {/* 4 Feature Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'budget-planner' }); }}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left flex items-center gap-3 hover:border-teal-400 hover:shadow-md transition">
              <span className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Wallet size={22} />
              </span>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">{t('hero.card1.title')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('hero.card1.sub')}</div>
              </div>
            </button>

            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'goals' }); }}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left flex items-center gap-3 hover:border-emerald-400 hover:shadow-md transition">
              <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PiggyBank size={22} />
              </span>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">{t('hero.card2.title')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('hero.card2.sub')}</div>
              </div>
            </button>

            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'invest-sim' }); }}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left flex items-center gap-3 hover:border-blue-400 hover:shadow-md transition">
              <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp size={22} />
              </span>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">{t('hero.card3.title')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('hero.card3.sub')}</div>
              </div>
            </button>

            <button type="button" onClick={() => { if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'quiz' }); }}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left flex items-center gap-3 hover:border-purple-400 hover:shadow-md transition">
              <span className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </span>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">{t('hero.card4.title')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('hero.card4.sub')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Hero Visual Illustration */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-emerald-100/70 via-teal-50 to-emerald-200/50 rounded-full p-8 flex items-center justify-center shadow-inner">
            {/* Floating Badges */}
            <div className="absolute top-4 right-2 bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="text-amber-500">✨</span>
              <span className="text-xs font-bold text-slate-800">Better Choices • Brighter Future</span>
            </div>

            {/* Floating Rupee Coin */}
            <div className="absolute top-10 left-6 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md border-2 border-white">
              ₹
            </div>

            {/* Floating Pink Piggy */}
            <div className="absolute bottom-12 left-2 bg-pink-100 text-pink-600 p-3 rounded-2xl shadow-lg border border-pink-200 flex items-center justify-center">
              <PiggyBank size={28} />
            </div>

            {/* Floating Blue Shield */}
            <div className="absolute bottom-16 right-2 bg-indigo-100 text-indigo-600 p-3 rounded-2xl shadow-lg border border-indigo-200 flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>

            {/* Central Students Vector Graphics */}
            <svg viewBox="0 0 240 240" className="w-64 h-64 drop-shadow-md">
              <circle cx="120" cy="120" r="110" fill="#E6F4EA" />
              {/* Girl Student */}
              <circle cx="85" cy="85" r="28" fill="#F8C798" />
              <path d="M 60 75 Q 85 45 110 75 Q 115 105 105 120 L 65 120 Z" fill="#202124" />
              <circle cx="85" cy="90" r="23" fill="#F8C798" />
              <circle cx="78" cy="88" r="3" fill="#202124" />
              <circle cx="92" cy="88" r="3" fill="#202124" />
              <path d="M 80 98 Q 85 103 90 98" stroke="#202124" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 55 120 C 55 120, 65 170, 85 170 C 105 170, 115 120, 115 120" fill="#0D9488" />
              <rect x="70" y="140" width="30" height="24" rx="4" fill="#3B82F6" />
              
              {/* Boy Student */}
              <circle cx="155" cy="95" r="28" fill="#E8B282" />
              <path d="M 130 90 Q 155 60 180 80 Q 185 100 175 110 L 135 110 Z" fill="#374151" />
              <circle cx="155" cy="100" r="23" fill="#E8B282" />
              <circle cx="148" cy="98" r="3" fill="#202124" />
              <circle cx="162" cy="98" r="3" fill="#202124" />
              <path d="M 150 108 Q 155 113 160 108" stroke="#202124" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 125 130 C 125 130, 135 180, 155 180 C 175 180, 185 130, 185 130" fill="#1E3A8A" />
              <rect x="140" y="145" width="30" height="26" rx="4" fill="#10B981" />
            </svg>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {showVideo && (
        <Modal title="FinLeap Video Showcase & Quiz" maxWidth={680} onClose={() => setShowVideo(false)}>
          <div className="p-1 space-y-4 text-left">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-100">
              <video
                src="/finleap-video.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Watch the demonstration and test your financial knowledge</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take the video quiz directly inside the student portal to test your knowledge of budgeting, saving emergency buffers, and dodging digital scams.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">🎥 Full Walkthrough Demonstration</div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">🎯 Interactive Checkpoint Questions</div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">💡 Instant Explanations & Tips</div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">🏆 Earn Points & Track Mastery</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowVideo(false);
                  if (!s.userName) d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' });
                  d({ type: 'go', v: 'quiz' });
                }}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer text-center text-sm shadow-sm flex items-center justify-center gap-2">
                <span>Start Video Quiz Challenge</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      <FinLeapFooter />
    </div>
  );
}

function Welcome() {
  const { s, d, t } = useApp();
  const [role, setRole] = useState(s.role || 'student');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showPwd, setShowPwd] = useState(false);

  // Form State
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingId, setPendingId] = useState(null);

  // Student Fields
  const [name, setName] = useState(s.userName || 'Deepa');
  const [avatar, setAvatar] = useState(s.avatar || '👩🏽');
  const [grade, setGrade] = useState('11');
  const [diff, setDiff] = useState('arjun');

  // NGO Fields
  const [ngoName, setNgoName] = useState('');
  const [ngoRegId, setNgoRegId] = useState('');
  const [ngoType, setNgoType] = useState('trust');
  const [ngoDate, setNgoDate] = useState('');
  const [ngoContact, setNgoContact] = useState('');
  const [ngoEmail, setNgoEmail] = useState('');
  const [ngoPhone, setNgoPhone] = useState('');
  const [ngoAddress, setNgoAddress] = useState('');
  const [ngoState, setNgoState] = useState('');
  const [ngoWebsite, setNgoWebsite] = useState('');

  const onAction = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setPendingId(null);

    if (mode === 'login') {
      const idToUse = role === 'student' ? loginId.trim() : ngoEmail.trim();
      if (!idToUse || !password) { setErrorMsg('Please fill in all fields.'); return; }

      const acc = s.accounts[idToUse];
      if (!acc) {
        // Fallback demo login if matching common mock credentials or demo
        if (role === 'student' && (idToUse.toLowerCase() === 'deepa' || idToUse.toLowerCase() === 'student' || idToUse.toLowerCase() === 'arjun')) {
          d({ type: 'login', userName: idToUse === 'deepa' ? 'Deepa' : name, role: 'student', avatar: '👩🏽', persona: 'arjun', screen: 'home' });
          return;
        }
        setErrorMsg('Account not found. Please create an account or try Quick Demo.');
        return;
      }
      if (acc.password !== password) { setErrorMsg('Incorrect password.'); return; }
      if (acc.role !== role) { setErrorMsg('This account belongs to a different portal.'); return; }
      if (acc.role === 'admin' && acc.status === 'pending') {
        setErrorMsg('Your NGO account is pending verification.');
        setPendingId(idToUse);
        return;
      }
      d({ type: 'login', userName: acc.name, role: acc.role, avatar: acc.avatar, persona: acc.persona, screen: acc.role === 'admin' ? 'admin' : 'home' });
    } else {
      const idToUse = role === 'student' ? loginId.trim() : ngoEmail.trim();
      if (!idToUse) { setErrorMsg(role === 'student' ? 'Login ID is required.' : 'Official email address is required.'); return; }
      if (s.accounts[idToUse]) { setErrorMsg('An account with this ID/Email already exists.'); return; }
      if (password.length < 4) { setErrorMsg('Password must be at least 4 characters.'); return; }
      if (password !== confirmPwd) { setErrorMsg('Passwords do not match.'); return; }

      let account = null;
      if (role === 'student') {
        if (!name.trim()) { setErrorMsg('Full name is required.'); return; }
        account = { role: 'student', password, name: name.trim(), avatar, grade, persona: diff };
      } else {
        if (!ngoName.trim() || !ngoContact.trim()) { setErrorMsg('Official NGO name and Contact person are required.'); return; }
        account = {
          role: 'admin', status: 'pending', password, name: ngoContact.trim(),
          ngoName, ngoRegId, ngoType, ngoDate, ngoEmail: idToUse, ngoPhone, ngoAddress, ngoState, ngoWebsite,
        };
      }
      d({ type: 'setAccount', id: idToUse, account });
      setSuccessMsg(role === 'student' ? 'Account created successfully! Please login.' : 'NGO Registered! Account pending verification.');
      setMode('login');
      setPassword('');
      setConfirmPwd('');
    }
  };

  const isNgo = role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Green Brand Column */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#064E3B] to-[#022C22] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <FinLeapBrand dark />
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-8 leading-tight tracking-tight">
              {t('auth.journey')}
            </h2>
          </div>

          {/* Dotted Airplane Illustration */}
          <div className="my-6 py-2 flex justify-center">
            <svg width="220" height="110" viewBox="0 0 220 110" fill="none">
              <path d="M 15 95 C 45 95, 75 25, 130 65 C 160 85, 185 45, 195 35" stroke="#34D399" strokeWidth="2.5" strokeDasharray="5 5" />
              <polygon points="195,30 215,35 200,48" fill="#34D399" />
            </svg>
          </div>

          {/* 3 Pillars Badge */}
          <div className="grid grid-cols-3 gap-2 border-t border-emerald-800/60 pt-5 text-center">
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1">
                <Smile size={18} />
              </span>
              <span className="text-xs font-semibold text-emerald-100">{t('auth.simple')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1">
                <Gamepad2 size={18} />
              </span>
              <span className="text-xs font-semibold text-emerald-100">{t('auth.interactive')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300 mb-1">
                <ShieldCheck size={18} />
              </span>
              <span className="text-xs font-semibold text-emerald-100">{t('auth.safe')}</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button type="button" onClick={() => { setRole('student'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${role === 'student' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600'}`}>
                  {t('auth.studentTab')}
                </button>
                <button type="button" onClick={() => { setRole('admin'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${role === 'admin' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600'}`}>
                  {t('auth.ngoTab')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Seg dark={false} label={t('lang.label')} value={s.lang} onChange={(v) => d({ type: 'lang', v })} options={LANGS} />
                <button type="button" onClick={() => d({ type: 'go', v: 'landing' })}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                  <ChevronLeft size={14} /> {t('nav.home')}
                </button>
              </div>
            </div>

            <div className="text-left mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' ? t('auth.welcomeBack') : (isNgo ? 'Register an NGO' : 'Create Student Profile')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {mode === 'login' ? t('auth.welcomeSub') : 'Fill details below to create your account'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
                <span>{errorMsg}</span>
                {pendingId && (
                  <button type="button" onClick={() => { d({ type: 'approveNgo', id: pendingId }); setErrorMsg(''); setSuccessMsg('Account approved! You can now login.'); setPendingId(null); }}
                    className="ml-2 px-2 py-1 bg-rose-600 text-white rounded text-xs">Simulate Approval</button>
                )}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={onAction} className="space-y-3.5">
              {mode === 'login' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{isNgo ? 'Official Email Address' : t('auth.loginId')}</label>
                    <div className="relative">
                      <input type={isNgo ? 'email' : 'text'} required value={isNgo ? ngoEmail : loginId}
                        onChange={e => isNgo ? setNgoEmail(e.target.value) : setLoginId(e.target.value)}
                        placeholder={isNgo ? 'ngo@example.org' : 'Enter your Login ID'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('auth.password')}</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none transition pr-10" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {isNgo ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Official NGO Name</label>
                        <input type="text" required value={ngoName} onChange={e => setNgoName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Reg ID / Certificate No</label>
                          <input type="text" required value={ngoRegId} onChange={e => setNgoRegId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Registration Type</label>
                          <select value={ngoType} onChange={e => setNgoType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium">
                            <option value="trust">Trust</option>
                            <option value="society">Society</option>
                            <option value="section8">Section 8</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                          <input type="text" required value={ngoContact} onChange={e => setNgoContact(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                          <input type="email" required value={ngoEmail} onChange={e => setNgoEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                          <input type="password" required value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Login ID</label>
                          <input type="text" required value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="deepa_11"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Deepa Sharma"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                          <Seg full label="Gender" value={avatar} onChange={setAvatar} options={[{ value: '🧑🏽', label: 'Male' }, { value: '👩🏽', label: 'Female' }]} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium">
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                          <input type="password" required value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition text-sm cursor-pointer mt-2">
                {mode === 'login' ? t('auth.loginBtn') : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 text-center cursor-pointer">
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              </button>

              <button type="button" onClick={() => { d({ type: 'login', userName: 'Deepa', role: 'student', persona: 'arjun' }); d({ type: 'go', v: 'home' }); }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs border border-emerald-200 transition text-center cursor-pointer">
                {t('auth.demoBtn')}
              </button>
            </div>
          </div>

          {/* Bottom City Skyline Vector & Tagline */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <svg className="w-full h-10 text-slate-200 fill-current opacity-70 mb-2" viewBox="0 0 500 80">
              <rect x="20" y="30" width="30" height="50" />
              <polygon points="50,30 65,10 80,30" />
              <rect x="50" y="30" width="30" height="50" />
              <rect x="90" y="20" width="40" height="60" />
              <rect x="140" y="40" width="35" height="40" />
              <polygon points="175,40 195,15 215,40" />
              <rect x="175" y="40" width="40" height="40" />
              <rect x="230" y="25" width="45" height="55" />
              <circle cx="300" cy="40" r="15" />
              <rect x="290" y="40" width="20" height="40" />
              <rect x="330" y="20" width="50" height="60" />
              <rect x="390" y="35" width="40" height="45" />
              <rect x="440" y="15" width="45" height="65" />
            </svg>
            <p className="text-[11px] font-semibold text-slate-500">
              {t('auth.tagline')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonaPick() {
  const { d, t } = useApp();
  return (
    <div className="max-w-md mx-auto py-8 px-4 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">{t('per.title')}</h1>
      <p className="text-sm text-slate-600 mt-1 mb-6">{t('per.sub')}</p>
      <div className="grid gap-4">
        {Object.values(PERSONAS).map(p => (
          <button key={p.id} type="button" onClick={() => d({ type: 'persona', v: p.id })}
            className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-600 shadow-sm text-left flex items-center gap-4 transition cursor-pointer">
            <span className="text-4xl shrink-0">{p.e}</span>
            <div className="flex-1">
              <div className="font-bold text-lg text-slate-900">{t(`per.${p.id}.name`)}</div>
              <div className="text-xs text-slate-500">{t('per.grade', { n: p.grade })} · {t(p.hard ? 'per.hard' : 'per.easy')}</div>
              <div className="text-sm text-slate-600 mt-1">{t(`per.${p.id}.desc`)}</div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl shrink-0">
              {t('per.pick', { name: t(`per.${p.id}.name`) })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentSidebar() {
  const { s, d, t } = useApp();
  const navItems = [
    { id: 'home', labelKey: 'sidebar.home', Icon: Home },
    { id: 'modules', labelKey: 'sidebar.modules', Icon: BookOpen },
    { id: 'terms', labelKey: 'sidebar.terms', Icon: Lightbulb },
    { id: 'goals', labelKey: 'sidebar.goals', Icon: Target },
    { id: 'budget-planner', labelKey: 'sidebar.budget', Icon: Wallet },
    { id: 'quiz', labelKey: 'sidebar.quizzes', Icon: HelpCircle },
    { id: 'invest-sim', labelKey: 'sidebar.simulator', Icon: TrendingUp },
    { id: 'achievements', labelKey: 'sidebar.achievements', Icon: Trophy },
    { id: 'settings', labelKey: 'sidebar.settings', Icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#064E3B] text-white flex flex-col justify-between p-5 min-h-screen shrink-0 border-r border-emerald-900/40">
      <div>
        <div className="pb-6 border-b border-emerald-800/60">
          <FinLeapBrand dark />
        </div>

        <div className="mt-6 space-y-1">
          {navItems.map((item) => {
            const on = s.screen === item.id;
            return (
              <button key={item.id} type="button" onClick={() => d({ type: 'go', v: item.id })}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                  on ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
                }`}>
                <item.Icon size={18} className={on ? 'text-emerald-300' : 'text-emerald-200/70'} />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Badge at bottom */}
      <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-lg shrink-0">
            {s.avatar || '👩🏽'}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-xs truncate text-white">Hi, {s.userName || 'Deepa'}</div>
            <div className="text-[10px] text-emerald-200">Grade 11</div>
          </div>
        </div>
        <button type="button" onClick={() => d({ type: 'logout' })} title="Logout"
          className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800/60 transition cursor-pointer">
          <Lock size={16} />
        </button>
      </div>
    </aside>
  );
}

function StudentTopBar() {
  const { s, d, t, P } = useApp();
  const [showBell, setShowBell] = useState(false);
  const name = s.userName || (P ? t(`per.${P.id}.name`) : 'Deepa');

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('dash.welcome', { name })}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {t('dash.welcomeSub')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Switch Persona */}
        <button type="button" onClick={() => d({ type: 'go', v: 'persona' })}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
          {t('per.switch')}
        </button>

        {/* Sound Toggle */}
        <SoundButton />

        {/* Notification Bell */}
        <div className="relative">
          <button type="button" onClick={() => setShowBell(!showBell)}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative cursor-pointer">
            <Bell size={18} />
            <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {showBell && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Notifications</span>
                <span className="text-[10px] text-emerald-600 font-semibold">1 New</span>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900">
                  🎉 Welcome to FinLeap! Start with the Budget Planner mission.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeScreen() {
  const { s, d, t, P, run } = useApp();
  const [badge, setBadge] = useState(null);
  const lv = levelOf(s.xp);
  const overall = run ? Math.round(PILLARS.reduce((a, p) => a + pctOf(run.prog[p.id]), 0) / PILLARS.length) : 65;

  return (
    <div className="space-y-6">
      {/* Student Wallet & Persona Status Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0">
            {s.avatar || P?.e || '👩🏽'}
          </span>
          <div>
            <div className="font-bold text-sm text-slate-900">{t('home.hi', { name: s.userName || (P ? t(`per.${P.id}.name`) : 'Deepa') })}</div>
            <div className="text-xs text-slate-500">{t('per.grade', { n: P?.grade || 11 })} · {t(P?.hard ? 'per.hard' : 'per.easy')}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2">
            <Wallet size={16} className="text-emerald-700" />
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block">{t('home.wallet')}</span>
              <span className="text-sm font-extrabold text-emerald-950">{inr(run?.wallet ?? P?.wallet ?? 1000)}</span>
            </div>
          </div>
          <button type="button" onClick={() => d({ type: 'go', v: 'persona' })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
            {t('per.switch')}
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Learning Progress */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <Ring pct={overall} size={58} stroke={6} color="#10B981" track="#E2E8F0">
            <span className="text-xs font-extrabold text-slate-800">{overall}%</span>
          </Ring>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dash.kpi.progress')}</div>
            <div className="text-xl font-extrabold text-slate-900">{overall}%</div>
            <div className="text-xs text-emerald-600 font-semibold">{t('dash.kpi.lessons')}</div>
          </div>
        </div>

        {/* Card 2: Total Points */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star size={24} className="fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dash.kpi.points')}</div>
            <div className="text-xl font-extrabold text-slate-900">{s.xp} XP</div>
            <div className="text-xs text-amber-600 font-semibold">{t('dash.kpi.level', { n: lv + 1 })}</div>
          </div>
        </div>

        {/* Card 3: Goals Achieved */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dash.kpi.goals')}</div>
            <div className="text-xl font-extrabold text-slate-900">1 of 3</div>
            <div className="text-xs text-purple-600 font-semibold">{t('dash.kpi.activeGoals')}</div>
          </div>
        </div>

        {/* Card 4: Quiz Accuracy */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dash.kpi.accuracy')}</div>
            <div className="text-xl font-extrabold text-slate-900">85%</div>
            <div className="text-xs text-blue-600 font-semibold">{t('dash.kpi.lastQuiz')}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Learning Modules + Today's Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Learning Modules */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('dash.modules.title')}</h2>
              <p className="text-xs text-slate-500">{t('dash.modules.sub')}</p>
            </div>
            <button type="button" onClick={() => d({ type: 'go', v: 'modules' })}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer">
              {t('dash.modules.viewAll')} <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Module 1: Plan & Budget */}
            <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800">
                    {run?.prog?.budget?.st === 2 && <Check size={11} className="inline mr-0.5" />}
                    {t(`st.${run?.prog?.budget?.st ?? 0}`)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('pl.budget')}</h3>
                <p className="text-xs text-slate-600 mt-1">{t('pl.budget.sub')}</p>
              </div>
              <button type="button" onClick={() => d({ type: 'go', v: 'budget' })}
                className="mt-4 w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                {t('c.start')}
              </button>
            </div>

            {/* Module 2: Save & Manage */}
            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <PiggyBank size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                    {run?.prog?.save?.st === 2 && <Check size={11} className="inline mr-0.5" />}
                    {t(`st.${run?.prog?.save?.st ?? 0}`)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('pl.save')}</h3>
                <p className="text-xs text-slate-600 mt-1">{t('pl.save.sub')}</p>
              </div>
              <button type="button" onClick={() => d({ type: 'go', v: 'save' })}
                className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                {t('c.start')}
              </button>
            </div>

            {/* Module 3: Understand Investing */}
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800">
                    {run?.prog?.invest?.st === 2 && <Check size={11} className="inline mr-0.5" />}
                    {t(`st.${run?.prog?.invest?.st ?? 0}`)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('pl.invest')}</h3>
                <p className="text-xs text-slate-600 mt-1">{t('pl.invest.sub')}</p>
              </div>
              <button type="button" onClick={() => d({ type: 'go', v: 'invest' })}
                className="mt-4 w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                {t('c.start')}
              </button>
            </div>

            {/* Module 4: Stay Financially Safe */}
            <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800">
                    {run?.prog?.safe?.st === 2 && <Check size={11} className="inline mr-0.5" />}
                    {t(`st.${run?.prog?.safe?.st ?? 0}`)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('pl.safe')}</h3>
                <p className="text-xs text-slate-600 mt-1">{t('pl.safe.sub')}</p>
              </div>
              <button type="button" onClick={() => d({ type: 'go', v: 'safe' })}
                className="mt-4 w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                {t('c.start')}
              </button>
            </div>
          </div>

          {run && PILLARS.every((p) => run.prog[p.id].st === 2) && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-sm font-bold text-emerald-900">
              🎉 {t('home.allDone')}
            </div>
          )}
        </div>

        {/* Right Column: Today's Challenge */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-amber-500 mb-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-500">
                <Trophy size={20} />
              </span>
              <h2 className="font-bold text-base text-slate-900">{t('dash.challenge.title')}</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('dash.challenge.desc')}
            </p>
          </div>

          <div className="mt-6">
            <button type="button" onClick={() => d({ type: 'go', v: 'budget' })}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer">
              {t('dash.challenge.btn')}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
              {t('dash.challenge.hint')}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Banner: Understand Financial Terms */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-sm border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <GraduationCap size={14} />
            <span>Beginner Glossary</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Understand Financial Terms</h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            Master SIP, SWP, Mutual Funds, NAV, ROI, Stocks, Bonds, Dividends, Compounding, Diversification, Inflation & Asset Allocation with real-world ₹ examples.
          </p>
        </div>
        <button
          type="button"
          onClick={() => d({ type: 'go', v: 'terms' })}
          className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm shadow transition shrink-0 flex items-center gap-2 cursor-pointer">
          <span>Explore Financial Terms</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Badges and Progress Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            {t('home.badges')}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Keep learning to unlock all</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {BADGES.map((b) => {
            const got = !!s.badges[b.id];
            return (
              <button key={b.id} type="button" onClick={() => setBadge(b)}
                className={`rounded-2xl p-3 text-center border-2 transition cursor-pointer ${
                  got ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-slate-50/50'
                }`}>
                <span className={`block text-3xl mb-1 ${got ? '' : 'grayscale opacity-40'}`}>{b.e}</span>
                <span className="block text-xs font-bold text-slate-800 truncate">{t(`bd.${b.id}`)}</span>
                <span className={`text-[10px] font-semibold flex items-center justify-center gap-0.5 mt-1 ${got ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {got ? <Check size={11} /> : <Lock size={11} />}
                  {t(got ? 'home.earned' : 'home.locked')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {badge && (
        <Modal title={t(`bd.${badge.id}`)} onClose={() => setBadge(null)}>
          <div className="text-center text-6xl mb-2">{badge.e}</div>
          <p className="text-center font-bold" style={{ color: s.badges[badge.id] ? C.good : C.muted }}>
            {t(s.badges[badge.id] ? 'bd.got' : 'home.locked')}
          </p>
          <p className="text-sm mt-3 text-slate-600"><b>{t('bd.how')}:</b> {t(`bd.${badge.id}.d`)}</p>
        </Modal>
      )}
    </div>
  );
}

function BudgetPlannerScreen() {
  const { s, d, t } = useApp();
  const b = s.budgetPlan || { income: 5000, food: 1500, transport: 1000, education: 1000, entertainment: 500, savings: 1000 };
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeVal, setIncomeVal] = useState(b.income);

  const categories = [
    { id: 'food', label: t('bp.food'), val: b.food, color: '#F59E0B', icon: '🍔' },
    { id: 'transport', label: t('bp.transport'), val: b.transport, color: '#3B82F6', icon: '🚌' },
    { id: 'education', label: t('bp.education'), val: b.education, color: '#8B5CF6', icon: '📚' },
    { id: 'entertainment', label: t('bp.entertainment'), val: b.entertainment, color: '#EC4899', icon: '🎮' },
    { id: 'savings', label: t('bp.savings'), val: b.savings, color: '#10B981', icon: '💰' },
  ];

  const totalAllocated = categories.reduce((sum, c) => sum + c.val, 0);
  const savingsPct = Math.round((b.savings / (b.income || 1)) * 100);

  const handleSlider = (id, val) => {
    d({ type: 'updateBudget', v: { [id]: Number(val) } });
  };

  // SVG Donut slices
  let cumulativePct = 0;
  const slices = categories.map((c) => {
    const pct = c.val / (b.income || 1);
    const startAngle = cumulativePct * 360;
    cumulativePct += pct;
    const endAngle = cumulativePct * 360;
    return { ...c, pct: Math.round(pct * 100), startAngle, endAngle };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('bp.title')}</h1>
          <p className="text-sm text-slate-500">{t('bp.sub')}</p>
        </div>
        <button type="button" onClick={() => d({ type: 'go', v: 'home' })}
          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer">
          {t('bp.saveBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Monthly Income & Sliders */}
        <div className="lg:col-span-7 space-y-4">
          {/* Monthly Income Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('bp.income')}</div>
              {editingIncome ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-800">₹</span>
                  <input type="number" value={incomeVal} onChange={(e) => setIncomeVal(Number(e.target.value))}
                    className="w-32 px-2 py-1 border rounded-lg font-bold text-xl" />
                  <button type="button" onClick={() => { d({ type: 'updateBudget', v: { income: incomeVal } }); setEditingIncome(false); }}
                    className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-lg">{t('bp.saveBtn')}</button>
                </div>
              ) : (
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{inr(b.income)}</div>
              )}
            </div>
            <button type="button" onClick={() => setEditingIncome(!editingIncome)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <Edit3 size={18} />
            </button>
          </div>

          {/* Allocate Your Budget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-base text-slate-900 mb-4">{t('bp.allocate')}</h2>
            <div className="space-y-4">
              {categories.map((c) => {
                const pct = Math.round((c.val / (b.income || 1)) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{inr(c.val)}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${c.color}20`, color: c.color }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <input type="range" min="0" max={b.income} step="100" value={c.val}
                      onChange={(e) => handleSlider(c.id, e.target.value)}
                      style={{ accentColor: c.color }} className="w-full cursor-pointer h-2 bg-slate-100 rounded-lg" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Donut Chart & Advice */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
            {/* SVG Donut */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
                <circle cx="110" cy="110" r="70" fill="none" stroke="#F1F5F9" strokeWidth="26" />
                {slices.map((s, i) => {
                  const r = 70;
                  const c = 2 * Math.PI * r;
                  const dash = (s.val / (b.income || 1)) * c;
                  const offset = c - dash;
                  let rot = 0;
                  for (let j = 0; j < i; j++) rot += (slices[j].val / (b.income || 1)) * 360;
                  return (
                    <circle key={s.id} cx="110" cy="110" r={r} fill="none" stroke={s.color} strokeWidth="26"
                      strokeDasharray={`${dash} ${c - dash}`}
                      style={{ transformOrigin: '110px 110px', transform: `rotate(${rot}deg)` }} />
                  );
                })}
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-extrabold text-slate-900">{inr(b.income)}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('bp.total')}</div>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="w-full mt-4 space-y-2 border-t border-slate-100 pt-4">
              {slices.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-semibold text-slate-700">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{inr(s.val)}</span>
                    <span className="text-slate-400 w-8 text-right">{s.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Green Tip Box */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <div className="font-bold text-xs text-emerald-900">
                {savingsPct >= 20 ? t('bp.tip') : `Tip: Try to aim for at least 20% savings (₹${Math.round(b.income * 0.2)}).`}
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Balancing your needs first ensures you never need high-interest debt when an unexpected expense arises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsScreen() {
  const { s, d, t } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState(5000);
  const [goalDue, setGoalDue] = useState('Dec 2026');

  const goals = s.goals || defaultGoals;

  const handleDeposit = (id) => {
    d({ type: 'depositGoal', id, amt: 500 });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    d({
      type: 'addGoal',
      goal: { id: `g_${Date.now()}`, name: goalName.trim(), current: 0, target: Number(goalTarget), due: goalDue, icon: 'shield', color: '#10B981' }
    });
    setGoalName('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('goals.title')}</h1>
          <p className="text-sm text-slate-500">{t('goals.sub')}</p>
        </div>
        <button type="button" onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-2 cursor-pointer">
          <Plus size={16} /> {t('goals.addBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Goals List */}
        <div className="lg:col-span-8 space-y-4">
          {goals.map((g) => {
            const pct = Math.round((g.current / (g.target || 1)) * 100);
            return (
              <div key={g.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl" style={{ background: `${g.color || '#10B981'}15`, color: g.color || '#10B981' }}>
                      {g.icon === 'laptop' ? <Laptop size={22} /> : g.icon === 'grad' ? <GraduationCap size={22} /> : <ShieldCheck size={22} />}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{g.name}</h3>
                      <div className="text-xs text-slate-500 font-medium">{t('goals.due', { date: g.due })}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeposit(g.id)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer">
                    {t('goals.add500')}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{inr(g.current)} / {inr(g.target)}</span>
                    <span style={{ color: g.color || '#10B981' }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, background: g.color || '#10B981' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Motivation Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-200/80 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <PiggyBank size={48} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">{t('goals.motTitle')}</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-xs">
            {t('goals.motDesc')}
          </p>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add a New Savings Goal" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-3.5 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Goal Name</label>
              <input type="text" required value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g., Coding Course"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Amount (₹)</label>
                <input type="number" required value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input type="text" required value={goalDue} onChange={e => setGoalDue(e.target.value)} placeholder="Dec 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition mt-2">
              Create Goal
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function InvestingSimulatorScreen() {
  const { s, d, t } = useApp();
  const [initial, setInitial] = useState(s.investSim?.initial || 5000);
  const [years, setYears] = useState(s.investSim?.years || 10);

  // Return rates (hypothetical)
  const rLow = 0.06;
  const rMed = 0.11;
  const rHigh = 0.15;

  const lowVal = Math.round(initial * Math.pow(1 + rLow, years));
  const medVal = Math.round(initial * Math.pow(1 + rMed, years));
  const highVal = Math.round(initial * Math.pow(1 + rHigh, years));

  // Points for curves (6 points across years)
  const steps = 6;
  const ptsLow = Array.from({ length: steps + 1 }, (_, i) => {
    const y = (years / steps) * i;
    return Math.round(initial * Math.pow(1 + rLow, y));
  });
  const ptsMed = Array.from({ length: steps + 1 }, (_, i) => {
    const y = (years / steps) * i;
    return Math.round(initial * Math.pow(1 + rMed, y));
  });
  const ptsHigh = Array.from({ length: steps + 1 }, (_, i) => {
    const y = (years / steps) * i;
    return Math.round(initial * Math.pow(1 + rHigh, y));
  });

  const maxVal = Math.max(ptsHigh[steps], 40000);

  const getY = (val) => 180 - (val / maxVal) * 150;
  const getX = (i) => 40 + (i / steps) * 440;

  const pathLow = ptsLow.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const pathMed = ptsMed.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const pathHigh = ptsHigh.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('sim.title')}</h1>
        <p className="text-sm text-slate-500">{t('sim.sub')}</p>
      </div>

      {/* Simulator Controls Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>{t('sim.initial')}</span>
            <span className="text-emerald-700 font-extrabold text-sm">{inr(initial)}</span>
          </div>
          <input type="range" min="1000" max="25000" step="1000" value={initial} onChange={e => setInitial(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer" style={{ accentColor: '#059669' }} />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>{t('sim.years')}</span>
            <span className="text-emerald-700 font-extrabold text-sm">{t('sim.yearsVal', { n: years })}</span>
          </div>
          <input type="range" min="1" max="20" step="1" value={years} onChange={e => setYears(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer" style={{ accentColor: '#059669' }} />
        </div>

        <div className="md:col-span-3">
          <button type="button" onClick={() => d({ type: 'updateInvestSim', v: { initial, years } })}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer">
            {t('sim.startBtn')}
          </button>
        </div>
      </div>

      {/* Potential Growth Chart Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="font-bold text-base text-slate-900">{t('sim.growthTitle')}</h2>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-teal-600">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> {t('sim.low')}
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {t('sim.med')}
            </span>
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {t('sim.high')}
            </span>
          </div>
        </div>

        {/* SVG Multi-curve chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 500 220" className="w-full min-w-[450px] h-56">
            {/* Grid Lines */}
            <line x1="40" y1="30" x2="480" y2="30" stroke="#F1F5F9" strokeWidth="1" />
            <text x="35" y="34" fill="#94A3B8" fontSize="10" textAnchor="end">₹40k</text>

            <line x1="40" y1="80" x2="480" y2="80" stroke="#F1F5F9" strokeWidth="1" />
            <text x="35" y="84" fill="#94A3B8" fontSize="10" textAnchor="end">₹30k</text>

            <line x1="40" y1="130" x2="480" y2="130" stroke="#F1F5F9" strokeWidth="1" />
            <text x="35" y="134" fill="#94A3B8" fontSize="10" textAnchor="end">₹20k</text>

            <line x1="40" y1="180" x2="480" y2="180" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="35" y="184" fill="#94A3B8" fontSize="10" textAnchor="end">₹10k</text>

            {/* X-axis labels */}
            {Array.from({ length: steps + 1 }, (_, i) => (
              <text key={i} x={getX(i)} y="200" fill="#94A3B8" fontSize="10" textAnchor="middle">
                Year {Math.round((years / steps) * i)}
              </text>
            ))}

            {/* Curves */}
            <path d={pathLow} fill="none" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
            <path d={pathMed} fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <path d={pathHigh} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Comparative Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50">
            <div className="text-xs font-bold text-teal-800">{t('sim.low')} (~6%)</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{inr(lowVal)}</div>
            <div className="text-[10px] text-teal-700 font-medium mt-0.5">Safe, stable value preserve</div>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50">
            <div className="text-xs font-bold text-amber-800">{t('sim.med')} (~11%)</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{inr(medVal)}</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Balanced growth trajectory</div>
          </div>
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
            <div className="text-xs font-bold text-blue-800">{t('sim.high')} (~15%)</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{inr(highVal)}</div>
            <div className="text-[10px] text-blue-700 font-medium mt-0.5">High compounding with swings</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic pt-2">
          {t('sim.note')}
        </p>
      </div>
    </div>
  );
}

function ScamQuizScreen() {
  const { d, t } = useApp();
  const [activeModule, setActiveModule] = useState('budget');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const videoRef = useRef(null);

  const moduleData = {
    budget: {
      title: 'Chapter 1: Plan & Budget',
      video: '/module-budget.mp4',
      badge: 'Needs vs Wants & Allocation',
      questions: [
        {
          id: 1,
          tag: 'Plan & Budget',
          text: 'According to the FinLeap budgeting rules demonstrated in Chapter 1, what should you allocate first?',
          options: [
            { key: 'wants', label: 'Discretionary Wants & Entertainment' },
            { key: 'needs', label: 'Essential Needs (Food, Transport, Rent)' },
            { key: 'speculate', label: 'High-risk speculative investments' }
          ],
          correct: 'needs',
          why: 'Needs are essential life foundations that must be funded before discretionary wants and savings.',
          tip: 'The 50/30/20 guideline recommends fulfilling needs first to avoid high-interest borrowing.'
        },
        {
          id: 2,
          tag: 'Plan & Budget',
          text: 'What happens when your expenses exceed your total monthly income in the budget simulation?',
          options: [
            { key: 'debt', label: 'You enter a deficit and are forced into costly debt or trade-offs' },
            { key: 'bonus', label: 'You automatically receive free interest credits' },
            { key: 'ignore', label: 'Your bank balance stays positive automatically' }
          ],
          correct: 'debt',
          why: 'Living above your income means borrowing from tomorrow to pay for today, leading to debt traps.',
          tip: 'Track expenses daily to make adjustments before the month ends.'
        }
      ]
    },
    save: {
      title: 'Chapter 2: Save & Manage',
      video: '/module-save.mp4',
      badge: 'Emergency Shocks & Savings Jar',
      questions: [
        {
          id: 1,
          tag: 'Save & Manage',
          text: 'What is the primary benefit of maintaining an Emergency Savings Jar buffer during unexpected expense shocks?',
          options: [
            { key: 'buffer', label: 'It cushions emergencies so you do not have to borrow at high interest rates' },
            { key: 'spend', label: 'It allows you to spend freely without tracking transactions' },
            { key: 'lottery', label: 'It guarantees instant 100% returns' }
          ],
          correct: 'buffer',
          why: 'A buffer protects your daily living stability and shields your long-term goals when surprise repairs or medical bills strike.',
          tip: 'Aim for at least 1-3 months of essential expenses in your emergency reserve.'
        },
        {
          id: 2,
          tag: 'Save & Manage',
          text: 'In the 4-week living simulation, what is the best strategy when an unexpected expense occurs?',
          options: [
            { key: 'jar', label: 'Draw from your emergency savings buffer instead of missing essential payments' },
            { key: 'ignore', label: 'Ignore the expense and hope it disappears' },
            { key: 'wants', label: 'Spend even more on non-essentials to feel better' }
          ],
          correct: 'jar',
          why: 'Emergency buffers exist precisely for unforeseen events like clinic visits or urgent transit.',
          tip: 'Replenish your buffer in subsequent weeks as soon as cash flow allows.'
        }
      ]
    },
    invest: {
      title: 'Chapter 3: Understand Investing',
      video: '/module-invest.mp4',
      badge: 'Compound Growth & Diversification',
      questions: [
        {
          id: 1,
          tag: 'Understand Investing',
          text: 'When investing for long horizons, what minimizes the impact of bad market years?',
          options: [
            { key: 'one', label: 'Putting all savings into a single hot stock' },
            { key: 'diversify', label: 'Diversification across multiple asset baskets and holding patiently' },
            { key: 'panic', label: 'Selling everything whenever market swings occur' }
          ],
          correct: 'diversify',
          why: 'Diversification spreads risk so that down years in one sector are cushioned by resilience in others.',
          tip: 'Compound growth rewards consistency and patience over market timing.'
        },
        {
          id: 2,
          tag: 'Understand Investing',
          text: 'What is the main difference between simple interest savings and compound investment growth over 10+ years?',
          options: [
            { key: 'compound', label: 'Compound growth earns returns on previous returns, snowballing exponentially' },
            { key: 'same', label: 'Both grow at the exact same flat arithmetic rate' },
            { key: 'simple', label: 'Simple interest always outperforms compound growth' }
          ],
          correct: 'compound',
          why: 'Compounding multiplies your base because earnings generate their own earnings over extended time horizons.',
          tip: 'Start investing early—even modest monthly amounts grow tremendously over decades.'
        }
      ]
    },
    safe: {
      title: 'Chapter 4: Stay Financially Safe',
      video: '/module-safe.mp4',
      badge: 'Scam Detection & UPI Security',
      questions: [
        {
          id: 1,
          tag: 'Stay Financially Safe',
          text: 'A buyer sends you a QR code claiming: "Scan this and enter your UPI PIN to receive payment." What should you do?',
          options: [
            { key: 'scan', label: 'Scan and enter your PIN immediately' },
            { key: 'block', label: 'Decline and block: entering a PIN ALWAYS sends money, never receives money' },
            { key: 'half', label: 'Enter half the PIN code to test' }
          ],
          correct: 'block',
          why: 'Entering your UPI PIN authorizes an outgoing transfer from your account. You NEVER need a PIN to receive payments.',
          tip: 'Remember: PIN = Pay out. Never enter your PIN to receive money.'
        },
        {
          id: 2,
          tag: 'Stay Financially Safe',
          text: 'You receive an urgent SMS: "Your bank account will be blocked within 2 hours. Click here to update KYC." What should you do?',
          options: [
            { key: 'scam', label: 'Recognize the urgency tactic and contact your bank official branch or app directly' },
            { key: 'click', label: 'Click the link immediately and submit your password and Aadhaar' },
            { key: 'forward', label: 'Forward the message to your friends' }
          ],
          correct: 'scam',
          why: 'Artificial urgency is a classic phishing trick. Legitimate financial institutions never freeze accounts via unverified SMS links.',
          tip: 'Always check the official banking app or customer care number directly.'
        }
      ]
    }
  };

  const currentMod = moduleData[activeModule] || moduleData.budget;
  const questions = currentMod.questions;
  const curr = questions[qIndex] || questions[0];

  const handleSelect = (key) => {
    if (answered) return;
    setSelected(key);
    setAnswered(true);
    if (key === curr.correct) {
      playCorrectSound();
      setScore(s => s + 1);
    } else {
      playWrongSound();
    }
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setQIndex(0); // restart loop or review
    }
  };

  const changeChapter = (modKey) => {
    setActiveModule(modKey);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
  };

  const isCorrect = selected === curr.correct;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chapter Videos & Interactive Checkpoints</h1>
          <p className="text-xs sm:text-sm text-slate-500">Watch the chapter video for each financial module and answer the checkpoint questions</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SoundButton />
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Score: {score}
          </span>
          <button type="button" onClick={() => d({ type: 'go', v: 'home' })} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { key: 'budget', label: '1. Plan & Budget', color: 'teal', icon: Wallet },
          { key: 'save', label: '2. Save & Manage', color: 'emerald', icon: PiggyBank },
          { key: 'invest', label: '3. Investing', color: 'blue', icon: TrendingUp },
          { key: 'safe', label: '4. Digital Safety', color: 'purple', icon: ShieldCheck }
        ].map(ch => {
          const on = activeModule === ch.key;
          const Icon = ch.icon;
          return (
            <button
              key={ch.key}
              type="button"
              onClick={() => changeChapter(ch.key)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                on
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              <Icon size={18} className={on ? 'text-emerald-300' : 'text-slate-500'} />
              <div className="min-w-0">
                <div className="font-bold text-xs truncate leading-tight">{ch.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Video Player Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Play size={18} className="text-emerald-600 fill-emerald-600" />
            <span>{currentMod.title}</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold self-start sm:self-auto">
            {currentMod.badge}
          </span>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-100 aspect-video">
          <video
            key={currentMod.video}
            ref={videoRef}
            src={currentMod.video}
            controls
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>💡 Watch the video walkthrough then test your knowledge with the question below.</span>
          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
              }
            }}
            className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer">
            <RotateCcw size={13} /> Replay Chapter Video
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
              {curr.tag}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Checkpoint {qIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {curr.text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="grid gap-2.5">
            {curr.options.map((opt) => {
              const isSelected = selected === opt.key;
              const isOptCorrect = opt.key === curr.correct;
              let styleClass = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

              if (answered) {
                if (isSelected) {
                  styleClass = isCorrect ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-rose-600 bg-rose-50 text-rose-900 font-bold';
                } else if (isOptCorrect) {
                  styleClass = 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-semibold';
                } else {
                  styleClass = 'border-slate-200 opacity-60 bg-slate-50 text-slate-500';
                }
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  className={`p-4 rounded-2xl border text-left text-sm font-medium flex items-center justify-between transition cursor-pointer ${styleClass}`}>
                  <span>{opt.label}</span>
                  {answered && isSelected && (
                    isCorrect ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" /> : <X size={18} className="text-rose-600 shrink-0 ml-2" />
                  )}
                  {answered && !isSelected && isOptCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {answered && (
          <div className={`p-4 rounded-2xl border space-y-2 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? <CheckCircle2 size={18} className="text-emerald-700" /> : <AlertTriangle size={18} className="text-amber-700" />}
              <span>{isCorrect ? 'Correct Answer!' : 'Not quite right'}</span>
            </div>
            <p className="text-xs leading-relaxed">{curr.why}</p>
            <div className="pt-2 border-t border-current/15 text-[11px] font-medium">
              <b>Key Takeaway:</b> {curr.tip}
            </div>
          </div>
        )}

        {answered && (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2">
            <span>{qIndex < questions.length - 1 ? 'Next Checkpoint' : 'Restart Chapter Questions'}</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function LearningModulesHub() {
  const { d } = useApp();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const modules = [
    {
      id: 'budget',
      num: '1',
      title: 'Plan & Budget',
      video: '/module-budget.mp4',
      Icon: Wallet,
      color: 'teal',
      desc: 'Learn the golden rule of needs versus wants, monthly spending plans, trade-offs, and setting realistic targets.'
    },
    {
      id: 'save',
      num: '2',
      title: 'Save & Manage',
      video: '/module-save.mp4',
      Icon: PiggyBank,
      color: 'emerald',
      desc: 'Simulate 4 weeks of living expenses, handling unexpected emergency shocks with a safety jar buffer.'
    },
    {
      id: 'invest',
      num: '3',
      title: 'Understand Investing',
      video: '/module-invest.mp4',
      Icon: TrendingUp,
      color: 'blue',
      desc: 'Explore time horizons, compound growth calculations, diversification across baskets, and navigating bad years.'
    },
    {
      id: 'safe',
      num: '4',
      title: 'Stay Financially Safe',
      video: '/module-safe.mp4',
      Icon: ShieldCheck,
      color: 'purple',
      desc: 'Spot fraudulent lottery messages, malicious QR codes, UPI collect requests, and protect your digital footprint.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Learning Modules & Video Lessons</h1>
          <p className="text-sm text-slate-500">Master essential money skills with video tutorials and interactive simulations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => d({ type: 'go', v: 'terms' })}
            className="px-3.5 py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer">
            <Lightbulb size={14} className="text-emerald-700" />
            <span>Financial Terms</span>
          </button>
          <button
            type="button"
            onClick={() => d({ type: 'go', v: 'quiz' })}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer">
            <Play size={14} className="fill-white" />
            <span>Take Video Quiz</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => {
          const Icon = m.Icon;
          return (
            <div key={m.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-12 h-12 rounded-2xl bg-${m.color}-50 text-${m.color}-700 flex items-center justify-center`}>
                    <Icon size={24} />
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(m)}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer">
                    <Play size={12} className="fill-emerald-800" />
                    <span>Watch Lesson</span>
                  </button>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{m.num}. {m.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => d({ type: 'go', v: m.id })}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition cursor-pointer text-center">
                  Start Interactive Sim
                </button>
                <button
                  type="button"
                  onClick={() => d({ type: 'go', v: 'quiz' })}
                  className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer">
                  Quiz Checkpoint
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Understand Financial Terms Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-800/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <GraduationCap size={14} />
            <span>Beginner Glossary</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Understand Financial Terms</h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Demystify SIP, SWP, Mutual Funds, NAV, ROI, Stocks, Bonds, Dividends, Compounding, Diversification, Inflation & Asset Allocation with real-world ₹ examples.
          </p>
        </div>
        <button
          type="button"
          onClick={() => d({ type: 'go', v: 'terms' })}
          className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold rounded-2xl text-xs sm:text-sm shadow transition shrink-0 flex items-center gap-2 cursor-pointer">
          <span>Explore 12 Financial Terms</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Video Modal for Module Lesson */}
      {selectedVideo && (
        <Modal title={`${selectedVideo.title} - Video Lesson`} maxWidth={680} onClose={() => setSelectedVideo(null)}>
          <div className="p-1 space-y-4 text-left">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-100">
              <video
                src={selectedVideo.video}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedVideo.desc}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const modId = selectedVideo.id;
                  setSelectedVideo(null);
                  d({ type: 'go', v: modId });
                }}
                className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition cursor-pointer text-center">
                Launch {selectedVideo.title} Simulation
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedVideo(null);
                  d({ type: 'go', v: 'quiz' });
                }}
                className="py-3 px-4 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer">
                Take Quiz
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================================
   UNDERSTAND FINANCIAL TERMS - 12 ESSENTIAL CONCEPTS FOR BEGINNERS
   ========================================================================== */

const FINANCIAL_TERMS = [
  {
    id: 'sip',
    name: 'SIP',
    fullForm: 'Systematic Investment Plan',
    category: 'funds',
    categoryLabel: 'Funds & Plans',
    badgeColor: 'emerald',
    icon: Calendar,
    shortDesc: 'A disciplined method where you invest a fixed amount of money at regular intervals (like every month) into an investment fund instead of investing all at once.',
    detailDesc: 'A Systematic Investment Plan (SIP) allows beginners to start small without timing the market. By investing fixed sums periodically across all market conditions, you automatically buy more units when market prices drop and fewer units when prices rise—a key principle known as "Rupee Cost Averaging". Over years, this turns disciplined pocket savings into substantial long-term wealth.',
    example: {
      headline: '₹1,000 Monthly Savings Habit',
      scenario: 'Anusha decides to invest ₹1,000 on the 5th of every month from her part-time tutoring earnings.',
      breakdown: [
        'Month 1 (Market Dip): NAV is ₹20 ➔ She automatically receives 50 fund units.',
        'Month 2 (Market Rise): NAV is ₹25 ➔ She automatically receives 40 fund units.',
        'Total Invested: ₹2,000 across 2 months ➔ Total Units: 90 units (Average price per unit: ₹22.22).',
        'Year 1 Total: ₹12,000 invested smoothly without needing any large lump sum.'
      ],
      lesson: 'She smoothed out price swings and avoided the anxiety of guessing market highs and lows.'
    },
    benefit: {
      title: 'Rupee Cost Averaging & Discipline',
      desc: 'Builds an automatic wealth-building habit starting from as little as ₹500/month, removing the urge to gamble or time the market.'
    },
    risk: {
      title: 'Market Linked Volatility',
      desc: 'Returns are linked to market performance and fluctuate over time. Continuing an SIP during tough market downturns is required, and returns are never guaranteed.'
    },
    keyRule: 'Consistency beats market timing. Keep your SIP active even when markets dip so you accumulate units at lower prices.'
  },
  {
    id: 'swp',
    name: 'SWP',
    fullForm: 'Systematic Withdrawal Plan',
    category: 'funds',
    categoryLabel: 'Funds & Plans',
    badgeColor: 'teal',
    icon: RotateCcw,
    shortDesc: 'A scheduled facility that allows you to withdraw a fixed predetermined amount from your accumulated investments at regular intervals.',
    detailDesc: 'A Systematic Withdrawal Plan (SWP) is the exact reverse of an SIP. Instead of adding money each month, you instruct the fund to deposit a predetermined sum into your bank account on a fixed date. The remaining balance stays invested and continues participating in market returns, making it popular for monthly living expenses or college stipends.',
    example: {
      headline: '₹5,000 Regular Monthly Cash Flow',
      scenario: 'Ramesh has an accumulated education fund of ₹3,00,000. He schedules an SWP of ₹5,000 on the 1st of every month to pay his semester book expenses.',
      breakdown: [
        'Total Accumulated Fund: ₹3,00,000 in a balanced hybrid mutual fund.',
        'Monthly Payout: ₹5,000 is automatically credited to his savings bank account on the 1st.',
        'Remaining Balance: ₹2,95,000 stays invested and continues to potentially grow.'
      ],
      lesson: 'Provides steady, predictable cash flow without selling off the entire investment at once.'
    },
    benefit: {
      title: 'Steady Cash Flow & Tax Efficiency',
      desc: 'Provides predictable monthly cash in your bank account while letting the untouched capital remain invested.'
    },
    risk: {
      title: 'Capital Depletion Risk',
      desc: 'If your monthly withdrawal rate is higher than the growth rate of your fund, your total invested balance will gradually shrink.'
    },
    keyRule: 'Keep withdrawal rates modest (typically 4% to 6% per year) so your accumulated capital outlives your expenses.'
  },
  {
    id: 'mutual_funds',
    name: 'Mutual Funds',
    fullForm: 'Pooled Investment Vehicle',
    category: 'funds',
    categoryLabel: 'Funds & Plans',
    badgeColor: 'blue',
    icon: Users,
    shortDesc: 'A trust that pools money from thousands of everyday investors to buy a professionally managed basket of stocks, bonds, or money market assets.',
    detailDesc: 'Instead of having to research and buy dozens of individual company shares yourself, a mutual fund collects small sums from thousands of individuals. A certified professional Fund Manager invests this pooled money across a diversified portfolio of companies and debt securities. When you invest, you receive "units" representing your proportional ownership of that total basket.',
    example: {
      headline: '₹500 for a 50-Company Basket',
      scenario: 'Kabir has only ₹500 to invest. Buying single shares of 50 top Indian companies individually would cost over ₹1,50,000.',
      breakdown: [
        'Pooled Investment: Kabir invests his ₹500 into an index mutual fund scheme.',
        'Instant Ownership: He gets fund units representing a fractional slice of all 50 top companies.',
        'Risk Absorption: If 2 companies have a rough quarter, the gains from the other 48 cushion the portfolio.'
      ],
      lesson: 'Instant diversification and expert management accessible even with small pocket budgets.'
    },
    benefit: {
      title: 'Instant Diversification & Expertise',
      desc: 'Spread your money across dozens of companies with professional portfolio management starting from ₹500.'
    },
    risk: {
      title: 'Market Risk & Management Fees',
      desc: 'Mutual funds are subject to market risks and NAV fluctuations. Fund houses also charge an annual Expense Ratio fee for management.'
    },
    keyRule: 'Select mutual funds matching your goal horizon: equity funds for 5+ years, debt/liquid funds for short-term safety.'
  },
  {
    id: 'nav',
    name: 'NAV',
    fullForm: 'Net Asset Value',
    category: 'funds',
    categoryLabel: 'Funds & Plans',
    badgeColor: 'cyan',
    icon: Target,
    shortDesc: 'The unit price of a mutual fund scheme, calculated daily by dividing the net market value of all assets by total outstanding units.',
    detailDesc: 'Net Asset Value (NAV) represents the current market price per unit of a mutual fund scheme. At the end of every trading day, the fund calculates the total value of all stocks, bonds, and cash it holds, subtracts any expenses or liabilities, and divides by the total number of units held by all investors: NAV = (Total Assets - Liabilities) ÷ Units.',
    example: {
      headline: 'Calculating NAV with a ₹2,000 Investment',
      scenario: 'A mutual fund holds ₹10,00,000 in net assets and has issued 50,000 units to investors.',
      breakdown: [
        'NAV Calculation: ₹10,00,000 ÷ 50,000 units = ₹20 per unit.',
        'Your Investment: You invest ₹2,000 into the fund on that day.',
        'Units Credited: ₹2,000 ÷ ₹20 = exactly 100 units credited to your folio.',
        'Future Value: If NAV rises to ₹25 next year, your 100 units are worth 100 × ₹25 = ₹2,500.'
      ],
      lesson: 'NAV acts as the daily official price tag per unit for buying and selling.'
    },
    benefit: {
      title: 'Transparent Daily Valuation',
      desc: 'Provides a clean, regulated valuation published every business evening so you always know what your holdings are worth.'
    },
    risk: {
      title: 'Common NAV Myth',
      desc: 'A lower NAV (e.g. ₹15) does NOT mean a fund is "cheaper" or better than one with a ₹150 NAV. Growth depends purely on percentage gain of the underlying assets.'
    },
    keyRule: 'Never pick a fund simply because its NAV is low. Always check the portfolio quality and long-term track record.'
  },
  {
    id: 'roi',
    name: 'ROI',
    fullForm: 'Return on Investment',
    category: 'growth',
    categoryLabel: 'Growth & Metrics',
    badgeColor: 'emerald',
    icon: TrendingUp,
    shortDesc: 'A performance percentage metric measuring how much profit or loss you earned relative to the original amount invested.',
    detailDesc: 'Return on Investment (ROI) evaluates the efficiency or profitability of an investment. It is calculated using the formula: ROI (%) = [(Ending Value - Initial Cost) ÷ Initial Cost] × 100. It allows you to directly compare gains across completely different avenues, such as fixed deposits, government bonds, or business projects.',
    example: {
      headline: 'Evaluating ROI on a ₹10,000 Investment',
      scenario: 'Priya invests ₹10,000 into a government bond certificate. Two years later, her total proceeds equal ₹11,400.',
      breakdown: [
        'Initial Cost: ₹10,000.',
        'Ending Value: ₹11,400 (Net Gain: ₹1,400).',
        'Formula: (₹1,400 ÷ ₹10,000) × 100 = 14% total ROI.',
        'Annualized Rate: Roughly 6.77% per year compounded over the 2-year period.'
      ],
      lesson: 'ROI provides a universal percentage snapshot to compare financial efficiency.'
    },
    benefit: {
      title: 'Universal Comparison Metric',
      desc: 'Simple to calculate and universally understood across all financial products, savings avenues, and personal ventures.'
    },
    risk: {
      title: 'Ignores Holding Period & Risk Taken',
      desc: 'A 20% ROI over 5 years is very different from a 20% ROI in 1 year. ROI alone also does not reveal how much market risk was taken.'
    },
    keyRule: 'Always evaluate ROI alongside the time horizon (annualized return) and the volatility taken to generate that return.'
  },
  {
    id: 'stocks',
    name: 'Stocks',
    fullForm: 'Equities / Corporate Shares',
    category: 'basics',
    categoryLabel: 'Investing Basics',
    badgeColor: 'purple',
    icon: TrendingUp,
    shortDesc: 'Units of partial ownership in a publicly listed company, giving you a fractional claim on its business assets and profits.',
    detailDesc: 'When a company like Tata Motors, Infosys, or Reliance lists on a stock exchange (NSE/BSE), buying a share makes you an actual fractional owner (shareholder). If the company creates innovative products, grows sales, and increases its profits, the value of each share typically increases, creating capital gains. You may also receive a share of profits via dividends.',
    example: {
      headline: 'Buying 5 Shares for ₹2,000',
      scenario: 'Neha buys 5 shares of a clean solar energy firm at ₹400 per share, spending a total of ₹2,000.',
      breakdown: [
        'Initial Purchase: 5 shares × ₹400 = ₹2,000.',
        'Scenario A (Growth): The firm wins major solar power contracts. Share price rises to ₹520. Her 5 shares are now worth ₹2,600 (+₹600 profit).',
        'Scenario B (Downturn): Raw material shortages hit the industry. Share price drops to ₹350. Her 5 shares are worth ₹1,750 (-₹250 paper loss).'
      ],
      lesson: 'Stock prices fluctuate daily based on company performance, industry trends, and market sentiments.'
    },
    benefit: {
      title: 'High Long-Term Growth Potential',
      desc: 'Equities have historically generated returns beating inflation and bank savings over extended 7–10+ year time horizons.'
    },
    risk: {
      title: 'Price Volatility & Capital Loss',
      desc: 'Stock prices can drop sharply during economic recessions or poor corporate earnings. No returns or capital protection are guaranteed.'
    },
    keyRule: 'Invest in businesses you understand with sustainable competitive advantages, and think like a long-term business partner.'
  },
  {
    id: 'bonds',
    name: 'Bonds',
    fullForm: 'Fixed Income Debt Securities',
    category: 'basics',
    categoryLabel: 'Investing Basics',
    badgeColor: 'amber',
    icon: ShieldCheck,
    shortDesc: 'A fixed-income loan you make to a government or corporation in exchange for regular periodic interest payments and principal return.',
    detailDesc: 'When the Government of India or large corporations need capital to build railways, highways, or green energy plants, they issue bonds. When you buy a bond, you are acting as a lender. The issuer promises to pay you a predetermined interest rate (called the Coupon) at scheduled intervals, and return your original principal on the specified Maturity Date.',
    example: {
      headline: '₹10,000 Sovereign Bond with 7% Coupon',
      scenario: 'Vikram invests ₹10,000 into a 5-year Government of India Sovereign Bond carrying a 7% annual coupon.',
      breakdown: [
        'Initial Investment: ₹10,000 face value.',
        'Annual Payout: 7% of ₹10,000 = ₹700 paid every year into his bank account.',
        'Over 5 Years: He collects 5 × ₹700 = ₹3,500 in predictable interest payouts.',
        'Year 5 Maturity: The government repays his original ₹10,000 principal in full.'
      ],
      lesson: 'Bonds offer predictable income and act as a stabilizing anchor in an investment portfolio.'
    },
    benefit: {
      title: 'Predictable Income & Capital Stability',
      desc: 'Provides steady, scheduled interest cash flows and anchors your portfolio against wild stock market swings.'
    },
    risk: {
      title: 'Interest Rate & Credit Risk',
      desc: 'Existing bond prices fall when market interest rates rise. Corporate bonds also carry default risk if the issuing company struggles financially.'
    },
    keyRule: 'Sovereign government bonds carry minimal default risk; corporate bonds pay higher interest but carry higher default risk.'
  },
  {
    id: 'dividends',
    name: 'Dividends',
    fullForm: 'Corporate Profit Share Distribution',
    category: 'basics',
    categoryLabel: 'Investing Basics',
    badgeColor: 'emerald',
    icon: Sparkles,
    shortDesc: 'A portion of a company’s net profits paid out directly to shareholders in cash as a reward for holding their stock.',
    detailDesc: 'When a mature, profitable corporation generates surplus cash after covering all business expenses and future expansion plans, its Board of Directors may vote to share a portion of those profits directly with shareholders. Dividends are declared per share (e.g., ₹15 per share) and deposited directly into your linked bank account without you needing to sell any of your shares.',
    example: {
      headline: '₹1,500 Direct Bank Credit',
      scenario: 'Sunita owns 100 shares of a consumer goods company. The company declares a dividend of ₹15 per share.',
      breakdown: [
        'Shareholding: 100 shares in Sunita’s demat account.',
        'Dividend Declared: ₹15 per share.',
        'Bank Credit: 100 × ₹15 = ₹1,500 credited directly into Sunita’s bank account.',
        'Portfolio Status: She keeps all 100 shares intact to continue participating in future business growth.'
      ],
      lesson: 'Earn tangible passive cash income without having to sell any underlying shares.'
    },
    benefit: {
      title: 'Tangible Passive Cash Flow',
      desc: 'Generates real periodic cash income into your bank account while letting your capital stay invested in the business.'
    },
    risk: {
      title: 'Never Guaranteed or Legally Binding',
      desc: 'Companies are never obligated to pay dividends. If profits shrink or cash is needed for debt, dividends can be reduced or eliminated.'
    },
    keyRule: 'Look for companies with consistent dividend track records and healthy cash reserves rather than chase unusually high yields.'
  },
  {
    id: 'compounding',
    name: 'Compounding',
    fullForm: 'Compound Growth / Returns on Returns',
    category: 'growth',
    categoryLabel: 'Growth & Metrics',
    badgeColor: 'blue',
    icon: Zap,
    shortDesc: 'The snowball process where the returns you earn on your money begin earning their own returns over time, accelerating growth.',
    detailDesc: 'Compound interest has been called the 8th wonder of the world. With simple interest, you only earn returns on your initial principal. With compounding, all your earned returns are reinvested back into the base. Over decades, this creates an exponential curve where your returns far surpass your original contributions.',
    example: {
      headline: '₹5,000 Snowball over 20 Years',
      scenario: 'Arun invests ₹5,000 in a balanced asset averaging a hypothetical 10% annual return, letting it compound without withdrawals.',
      breakdown: [
        'Year 1: ₹5,000 + 10% (₹500) = ₹5,500.',
        'Year 2: 10% is calculated on ₹5,500 = ₹550 gain ➔ ₹6,050 total.',
        'Year 10: The balance grows to ₹12,968 (gains alone are ₹7,968).',
        'Year 20: The balance snowballs to ₹33,637 (gains are ₹28,637—nearly 6x the initial principal!).'
      ],
      lesson: 'Time is the secret multiplier in compounding. The longer money stays invested, the steeper the snowball accelerates.'
    },
    benefit: {
      title: 'Exponential Wealth Multiplier',
      desc: 'Allows small savings invested early in life to grow exponentially larger than big amounts invested late in life.'
    },
    risk: {
      title: 'Works Against You on Debt',
      desc: 'Compounding works in reverse on unpaid credit card dues or high-interest loans, causing debt to balloon dangerously fast.'
    },
    keyRule: 'Start as early as possible. In compounding, time in the market is vastly more powerful than timing the market.'
  },
  {
    id: 'diversification',
    name: 'Diversification',
    fullForm: 'Risk Mitigation Strategy',
    category: 'strategy',
    categoryLabel: 'Risk & Strategy',
    badgeColor: 'teal',
    icon: ShieldCheck,
    shortDesc: 'Spreading your investments across multiple asset classes, sectors, and companies to avoid catastrophic single-point failures.',
    detailDesc: 'Diversification embodies the timeless wisdom: "Do not put all your eggs in one basket." If you put all your savings into a single company, an unexpected scandal or bankruptcy could wipe you out. By spreading capital across technology, banking, healthcare, government bonds, and gold, poor performance in one sector is cushioned by stability or gains in others.',
    example: {
      headline: '₹20,000 Portfolio with Sector Buffers',
      scenario: 'Dev has ₹20,000. Instead of putting it all into one trendy EV startup, he diversifies across 4 sectors.',
      breakdown: [
        'Allocation: ₹5,000 in Tech, ₹5,000 in Healthcare, ₹5,000 in Banking, ₹5,000 in Government Bonds.',
        'Year 1 Event: Tech stocks plunge -20% (-₹1,000 loss).',
        'Cushioning: Healthcare rises +15% (+₹750), Banking rises +10% (+₹500), Bonds pay +7% (+₹350).',
        'Overall Portfolio: +₹600 net profit despite a major tech collapse.'
      ],
      lesson: 'Dev avoided devastating financial loss and achieved steady net growth.'
    },
    benefit: {
      title: 'Smooths Volatility & Protects Capital',
      desc: 'Eliminates company-specific risk so no single corporate failure can derail your financial future.'
    },
    risk: {
      title: 'Does Not Protect Against Systemic Crashes',
      desc: 'During broad macroeconomic crises, all equity sectors can drop simultaneously. Over-diversification can also dilute superior returns.'
    },
    keyRule: 'Diversify across non-correlated assets (e.g., equities + bonds + gold) that do not always move in lockstep.'
  },
  {
    id: 'inflation',
    name: 'Inflation',
    fullForm: 'Loss of Purchasing Power Over Time',
    category: 'strategy',
    categoryLabel: 'Risk & Strategy',
    badgeColor: 'amber',
    icon: Flame,
    shortDesc: 'The steady upward rise in the general price of goods and services over time, eroding the purchasing power of idle cash.',
    detailDesc: 'Inflation means your money buys less tomorrow than it did today. If inflation is 6% per year, a basket of groceries that costs ₹100 today will cost ₹106 next year. If you keep your money as physical cash inside a drawer or in a 2.5% savings account, your real wealth is silently shrinking every single year because your savings cannot keep up with rising costs.',
    example: {
      headline: 'The ₹100 Grocery Basket Dilemma',
      scenario: 'A student keeps ₹10,000 as physical cash in an almirah for 5 years while inflation averages 6% annually.',
      breakdown: [
        'Day 1: ₹10,000 buys 100 movie tickets at ₹100 each.',
        'After 5 Years: Due to inflation, ticket prices rise to ₹134 each.',
        'Purchasing Power: His ₹10,000 cash can now buy only 74 tickets instead of 100!',
        'Invisible Loss: He lost 26% of real purchasing power even though he still holds ten ₹1,000 notes.'
      ],
      lesson: 'Cash feels safe, but inflation silently taxes idle money.'
    },
    benefit: {
      title: 'Economic Indicator of Growth',
      desc: 'Moderate inflation (around 4% in India) signals healthy consumer demand, higher wages, and business expansion.'
    },
    risk: {
      title: 'Silent Wealth Destroyer',
      desc: 'Any investment earning less than the inflation rate is mathematically losing purchasing power each year.'
    },
    keyRule: 'Invest in productive growth assets (like equities and mutual funds) for long-term goals to stay comfortably ahead of inflation.'
  },
  {
    id: 'asset_allocation',
    name: 'Asset Allocation',
    fullForm: 'Portfolio Distribution Framework',
    category: 'strategy',
    categoryLabel: 'Risk & Strategy',
    badgeColor: 'purple',
    icon: PieChart,
    shortDesc: 'Distributing your investment money across different asset buckets (Equity, Debt, Gold, Cash) based on your goals and risk tolerance.',
    detailDesc: 'Asset Allocation is the foundational blueprint of successful investing. Research shows that over 90% of portfolio performance variation comes from your asset allocation mix—not individual stock picking. By balancing Growth assets (Stocks for capital appreciation) with Defensive assets (Bonds for stability, Gold for hedge, and Cash for liquidity), you achieve a smoother financial journey.',
    example: {
      headline: '₹50,000 College Fund Allocation',
      scenario: 'Sneha has ₹50,000 saved for college expenses coming up in 4 years. She allocates across 4 buckets.',
      breakdown: [
        '50% Equity Funds (₹25,000): For inflation-beating capital growth.',
        '35% Debt Bonds (₹17,500): For steady coupon returns and capital safety.',
        '10% Sovereign Gold (₹5,000): For inflation and geopolitical hedge.',
        '5% Liquid Cash (₹2,500): For immediate emergency buffer.'
      ],
      lesson: 'When equities wobble, debt and gold stabilize the portfolio, giving peace of mind.'
    },
    benefit: {
      title: 'Optimizes Risk vs Return',
      desc: 'Custom-tailored to your unique time horizon and risk tolerance, preventing panic selling during market drops.'
    },
    risk: {
      title: 'Requires Periodic Rebalancing',
      desc: 'Over time, strong-performing assets will grow faster and distort your target allocation, requiring annual rebalancing.'
    },
    keyRule: 'Match your allocation to your timeline: short-term goals need high debt/cash; long-term goals (7+ yrs) thrive on equity.'
  }
];

function TermIllustration({ id, size = 'sm' }) {
  const isLg = size === 'lg';
  const h = isLg ? 160 : 110;
  const viewBox = isLg ? '0 0 400 160' : '0 0 280 110';

  switch (id) {
    case 'sip':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-sip" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="100%" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-sip)" />
          {/* Calendar on left */}
          <g transform={isLg ? 'translate(40, 30)' : 'translate(25, 18)'}>
            <rect x="0" y="0" width="60" height="65" rx="10" fill="#FFFFFF" stroke="#059669" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
            <path d="M 0 16 L 60 16" stroke="#059669" strokeWidth="2" />
            <rect x="0" y="0" width="60" height="16" rx="10" fill="#059669" />
            <circle cx="15" cy="8" r="2.5" fill="#FFFFFF" />
            <circle cx="45" cy="8" r="2.5" fill="#FFFFFF" />
            <text x="30" y="44" textAnchor="middle" fill="#064E3B" fontSize="20" fontWeight="900" fontFamily="sans-serif">05</text>
            <text x="30" y="58" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="700" fontFamily="sans-serif">MONTHLY</text>
          </g>
          {/* Curved trajectory path with coins */}
          <path d={isLg ? 'M 115 65 Q 180 20 230 80' : 'M 95 50 Q 145 15 185 62'} fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="5 5" />
          {/* 3 coins jumping along trajectory */}
          <g transform={isLg ? 'translate(145, 30)' : 'translate(120, 22)'}>
            <circle cx="0" cy="0" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">₹</text>
          </g>
          <g transform={isLg ? 'translate(185, 45)' : 'translate(150, 34)'}>
            <circle cx="0" cy="0" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">₹</text>
          </g>
          {/* Plant Sprout Pot */}
          <g transform={isLg ? 'translate(250, 45)' : 'translate(195, 32)'}>
            <path d="M 10 40 L 40 40 L 35 65 L 15 65 Z" fill="#92400E" />
            <rect x="8" y="36" width="34" height="6" rx="2" fill="#78350F" />
            {/* Sprout Stem */}
            <path d="M 25 36 Q 25 15 28 6" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Leaves */}
            <path d="M 27 18 Q 42 12 40 2 Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
            <path d="M 25 24 Q 10 18 12 8 Z" fill="#34D399" stroke="#047857" strokeWidth="1.5" />
            <circle cx="38" cy="4" r="2" fill="#FDE047" />
            <circle cx="10" cy="10" r="1.5" fill="#FDE047" />
          </g>
          {/* Badge */}
          <g transform={isLg ? 'translate(310, 25)' : 'translate(215, 14)'}>
            <rect width="60" height="20" rx="10" fill="#064E3B" />
            <text x="30" y="14" textAnchor="middle" fill="#ECFDF5" fontSize="9" fontWeight="bold">+₹500/mo</text>
          </g>
        </svg>
      );

    case 'swp':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-swp" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#CCFBF1" />
            </linearGradient>
            <linearGradient id="g-tank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-swp)" />
          {/* Reservoir Tank */}
          <g transform={isLg ? 'translate(50, 25)' : 'translate(30, 15)'}>
            <rect x="0" y="0" width="70" height="80" rx="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
            {/* Fluid */}
            <rect x="4" y="24" width="62" height="52" rx="8" fill="url(#g-tank)" opacity="0.85" />
            <line x1="8" y1="38" x2="22" y2="38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="52" x2="18" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="64" x2="22" y2="64" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <text x="35" y="16" textAnchor="middle" fill="#0F766E" fontSize="9" fontWeight="bold">FUND</text>
            <text x="44" y="55" fill="#FFFFFF" fontSize="12" fontWeight="900">₹</text>
          </g>
          {/* Tap / Valve */}
          <g transform={isLg ? 'translate(125, 60)' : 'translate(104, 45)'}>
            <rect x="0" y="0" width="28" height="12" rx="3" fill="#64748B" />
            <path d="M 14 0 L 14 -12 M 6 -12 L 22 -12" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 28 6 L 40 6 L 40 22" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          </g>
          {/* Coin Flowing Out */}
          <g transform={isLg ? 'translate(175, 75)' : 'translate(152, 58)'}>
            <circle cx="0" cy="0" r="11" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">₹</text>
          </g>
          {/* Wallet / Bank Account Card */}
          <g transform={isLg ? 'translate(225, 45)' : 'translate(185, 30)'}>
            <rect x="0" y="0" width="65" height="46" rx="8" fill="#1E293B" stroke="#0F766E" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
            <rect x="0" y="10" width="65" height="10" fill="#334155" />
            <circle cx="50" cy="32" r="5" fill="#10B981" />
            <rect x="8" y="28" width="24" height="6" rx="2" fill="#94A3B8" />
          </g>
          {/* Badge */}
          <g transform={isLg ? 'translate(285, 20)' : 'translate(185, 12)'}>
            <rect width="80" height="20" rx="10" fill="#0D9488" />
            <text x="40" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">₹5k Payout</text>
          </g>
        </svg>
      );

    case 'mutual_funds':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-mf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-mf)" />
          {/* 3 Investor Avatars pooling in */}
          <g transform={isLg ? 'translate(45, 40)' : 'translate(25, 25)'}>
            <circle cx="16" cy="14" r="10" fill="#3B82F6" />
            <path d="M 4 36 C 4 28, 28 28, 28 36 Z" fill="#1D4ED8" />
            <circle cx="45" cy="10" r="10" fill="#10B981" />
            <path d="M 33 32 C 33 24, 57 24, 57 32 Z" fill="#047857" />
            <circle cx="30" cy="45" r="9" fill="#8B5CF6" />
            <path d="M 19 64 C 19 56, 41 56, 41 64 Z" fill="#6D28D9" />
          </g>
          {/* Golden pooling arrows */}
          <path d={isLg ? 'M 115 65 L 155 65' : 'M 85 45 L 125 45'} stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 4" />
          {/* Central Pooled Treasure Vault Basket */}
          <g transform={isLg ? 'translate(170, 30)' : 'translate(135, 20)'}>
            <rect x="0" y="14" width="60" height="48" rx="8" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2.5" />
            <path d="M 10 14 C 10 0, 50 0, 50 14" fill="none" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="30" cy="38" r="8" fill="#FBBF24" />
            <text x="30" y="42" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">₹</text>
          </g>
          {/* Diversified branches to 3 assets */}
          <g transform={isLg ? 'translate(250, 25)' : 'translate(205, 18)'}>
            <line x1="0" y1="35" x2="25" y2="12" stroke="#2563EB" strokeWidth="2" />
            <line x1="0" y1="35" x2="28" y2="35" stroke="#2563EB" strokeWidth="2" />
            <line x1="0" y1="35" x2="25" y2="58" stroke="#2563EB" strokeWidth="2" />
            {/* Asset 1: Company Stock */}
            <circle cx="42" cy="10" r="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
            <text x="42" y="14" textAnchor="middle" fill="#1E40AF" fontSize="9" fontWeight="bold">EQ</text>
            {/* Asset 2: Bond */}
            <circle cx="45" cy="35" r="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="45" y="39" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="bold">BD</text>
            {/* Asset 3: Gold */}
            <circle cx="42" cy="60" r="10" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
            <text x="42" y="64" textAnchor="middle" fill="#065F46" fontSize="9" fontWeight="bold">GD</text>
          </g>
        </svg>
      );

    case 'nav':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-nav" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#CFFAFE" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-nav)" />
          {/* Balance Scale */}
          <g transform={isLg ? 'translate(80, 30)' : 'translate(45, 20)'}>
            {/* Fulcrum and Base */}
            <path d="M 55 70 L 45 78 L 65 78 Z" fill="#0E7490" />
            <line x1="55" y1="20" x2="55" y2="70" stroke="#0E7490" strokeWidth="4" />
            <circle cx="55" cy="20" r="4.5" fill="#155E75" />
            {/* Beam */}
            <line x1="10" y1="20" x2="100" y2="20" stroke="#0891B2" strokeWidth="3.5" />
            {/* Left Pan (Assets) */}
            <line x1="10" y1="20" x2="0" y2="44" stroke="#64748B" strokeWidth="1.5" />
            <line x1="10" y1="20" x2="20" y2="44" stroke="#64748B" strokeWidth="1.5" />
            <path d="M -5 44 Q 10 52 25 44 Z" fill="#0891B2" />
            {/* Left Gold bars / assets */}
            <rect x="0" y="34" width="20" height="9" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <text x="10" y="30" textAnchor="middle" fill="#0E7490" fontSize="7" fontWeight="bold">ASSETS</text>
            {/* Right Pan (Units) */}
            <line x1="100" y1="20" x2="90" y2="44" stroke="#64748B" strokeWidth="1.5" />
            <line x1="100" y1="20" x2="110" y2="44" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 85 44 Q 100 52 115 44 Z" fill="#0891B2" />
            {/* Right stacked unit coins */}
            <circle cx="100" cy="38" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            <text x="100" y="30" textAnchor="middle" fill="#0E7490" fontSize="7" fontWeight="bold">UNITS</text>
          </g>
          {/* Calculator Tag */}
          <g transform={isLg ? 'translate(230, 35)' : 'translate(170, 22)'}>
            <rect x="0" y="0" width="85" height="58" rx="10" fill="#FFFFFF" stroke="#0891B2" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
            <rect x="8" y="8" width="69" height="18" rx="4" fill="#E0F2FE" />
            <text x="42" y="21" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="900">₹20.00</text>
            <text x="42" y="38" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">PER UNIT</text>
            <text x="42" y="49" textAnchor="middle" fill="#0891B2" fontSize="7" fontWeight="extrabold">NAV PRICE</text>
          </g>
        </svg>
      );

    case 'roi':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-roi" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0FDF4" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-roi)" />
          {/* Base Bar Chart */}
          <g transform={isLg ? 'translate(50, 25)' : 'translate(30, 16)'}>
            {/* Axis */}
            <line x1="0" y1="80" x2="120" y2="80" stroke="#94A3B8" strokeWidth="2" />
            {/* Bar 1: Cost */}
            <rect x="15" y="40" width="30" height="40" rx="4" fill="#3B82F6" />
            <text x="30" y="92" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">Cost</text>
            <text x="30" y="34" textAnchor="middle" fill="#1D4ED8" fontSize="9" fontWeight="bold">₹10k</text>
            {/* Bar 2: Value (Cost + Gain) */}
            <rect x="65" y="40" width="30" height="40" fill="#3B82F6" />
            <rect x="65" y="15" width="30" height="25" rx="4" fill="#10B981" />
            <text x="80" y="92" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">Value</text>
            <text x="80" y="10" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="extrabold">₹11.4k</text>
          </g>
          {/* Magnifying Glass focusing on Gain */}
          <g transform={isLg ? 'translate(190, 25)' : 'translate(145, 18)'}>
            <circle cx="35" cy="35" r="28" fill="#FFFFFF" stroke="#059669" strokeWidth="3" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.08))" />
            <line x1="56" y1="56" x2="78" y2="78" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
            <text x="35" y="32" textAnchor="middle" fill="#047857" fontSize="13" fontWeight="900">+14%</text>
            <text x="35" y="46" textAnchor="middle" fill="#10B981" fontSize="9" fontWeight="bold">ROI</text>
          </g>
          {/* Upward Arrow */}
          <g transform={isLg ? 'translate(290, 45)' : 'translate(225, 30)'}>
            <circle cx="15" cy="15" r="14" fill="#059669" />
            <path d="M 10 18 L 15 10 L 20 18 M 15 10 L 15 22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );

    case 'stocks':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-stocks" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-stocks)" />
          {/* Company Building */}
          <g transform={isLg ? 'translate(45, 25)' : 'translate(25, 15)'}>
            <rect x="0" y="15" width="55" height="65" rx="6" fill="#FFFFFF" stroke="#6D28D9" strokeWidth="2" />
            <rect x="18" y="0" width="18" height="15" fill="#6D28D9" />
            {/* Windows */}
            <rect x="8" y="24" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="23" y="24" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="37" y="24" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="8" y="38" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="23" y="38" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="37" y="38" width="10" height="9" rx="2" fill="#DDD6FE" />
            <rect x="20" y="58" width="15" height="22" fill="#6D28D9" />
          </g>
          {/* Candlestick Charts Moving Up */}
          <g transform={isLg ? 'translate(130, 25)' : 'translate(100, 15)'}>
            {/* Candle 1 (Green) */}
            <line x1="15" y1="35" x2="15" y2="65" stroke="#10B981" strokeWidth="2" />
            <rect x="9" y="40" width="12" height="18" rx="2" fill="#10B981" />
            {/* Candle 2 (Small Red Dip) */}
            <line x1="38" y1="38" x2="38" y2="60" stroke="#EF4444" strokeWidth="2" />
            <rect x="32" y="42" width="12" height="12" rx="2" fill="#EF4444" />
            {/* Candle 3 (Strong Green Surge) */}
            <line x1="61" y1="12" x2="61" y2="52" stroke="#10B981" strokeWidth="2" />
            <rect x="55" y="18" width="12" height="24" rx="2" fill="#10B981" />
            {/* Upward Line */}
            <path d="M 5 50 Q 38 48 70 18" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Certificate Badge */}
          <g transform={isLg ? 'translate(245, 30)' : 'translate(185, 20)'}>
            <rect x="0" y="0" width="75" height="52" rx="8" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
            <text x="37" y="18" textAnchor="middle" fill="#6D28D9" fontSize="9" fontWeight="900">SHARE</text>
            <text x="37" y="32" textAnchor="middle" fill="#4B5563" fontSize="8" fontWeight="bold">Part Owner</text>
            <circle cx="37" cy="42" r="5" fill="#F59E0B" />
          </g>
        </svg>
      );

    case 'bonds':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-bonds" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-bonds)" />
          {/* Parchment Certificate */}
          <g transform={isLg ? 'translate(50, 20)' : 'translate(30, 12)'}>
            <rect x="0" y="0" width="115" height="78" rx="8" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
            <rect x="5" y="5" width="105" height="68" rx="4" fill="none" stroke="#FDE68A" strokeWidth="1.5" />
            <text x="57" y="24" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="900">GOVT BOND</text>
            <line x1="20" y1="32" x2="95" y2="32" stroke="#E5E7EB" strokeWidth="2" />
            <text x="57" y="44" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="bold">Principal: ₹10,000</text>
            <text x="57" y="56" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="extrabold">Fixed: 7.0% p.a.</text>
            {/* Wax Seal */}
            <circle cx="95" cy="62" r="9" fill="#DC2626" />
            <circle cx="95" cy="62" r="6" fill="#EF4444" />
            <text x="95" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">★</text>
          </g>
          {/* Scheduled Coupon Stack */}
          <g transform={isLg ? 'translate(200, 30)' : 'translate(165, 20)'}>
            <rect x="0" y="0" width="90" height="22" rx="6" fill="#F59E0B" />
            <text x="45" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">₹700 / Year</text>
            <rect x="5" y="28" width="80" height="20" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="45" y="42" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="bold">5-Yr Maturity</text>
          </g>
        </svg>
      );

    case 'dividends':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-div" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEFCE8" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-div)" />
          {/* Money Tree */}
          <g transform={isLg ? 'translate(60, 20)' : 'translate(35, 12)'}>
            {/* Trunk */}
            <path d="M 40 45 L 40 80 M 35 80 L 45 80" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
            {/* Foliage */}
            <circle cx="40" cy="30" r="28" fill="#10B981" opacity="0.9" />
            <circle cx="25" cy="35" r="18" fill="#059669" />
            <circle cx="55" cy="35" r="18" fill="#047857" />
            <circle cx="40" cy="18" r="16" fill="#34D399" />
            {/* Gold coins on tree branches */}
            <circle cx="30" cy="22" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="50" cy="24" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="40" cy="36" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          </g>
          {/* Coins Falling Like Fruit */}
          <g transform={isLg ? 'translate(150, 40)' : 'translate(125, 28)'}>
            <circle cx="0" cy="0" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">₹</text>
            <circle cx="20" cy="18" r="9" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
            <text x="20" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">₹</text>
          </g>
          {/* Harvest Basket */}
          <g transform={isLg ? 'translate(210, 35)' : 'translate(175, 22)'}>
            <path d="M 5 25 L 55 25 L 48 55 L 12 55 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
            <line x1="8" y1="35" x2="52" y2="35" stroke="#FDE68A" strokeWidth="2" />
            <line x1="12" y1="45" x2="48" y2="45" stroke="#FDE68A" strokeWidth="2" />
            <text x="30" y="16" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="bold">+₹1,500</text>
            <rect x="0" y="60" width="60" height="16" rx="4" fill="#047857" />
            <text x="30" y="72" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">PROFIT SHARE</text>
          </g>
        </svg>
      );

    case 'compounding':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-comp" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0F9FF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-comp)" />
          {/* Downhill Exponential Slope Curve */}
          <path d={isLg ? 'M 30 30 Q 180 35 340 130' : 'M 20 22 Q 130 26 250 95'} fill="none" stroke="#0284C7" strokeWidth="3" />
          {/* Stage 1: Small Snowball */}
          <g transform={isLg ? 'translate(50, 25)' : 'translate(35, 18)'}>
            <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#0369A1" fontSize="8" fontWeight="bold">Yr 1</text>
            <text x="0" y="18" textAnchor="middle" fill="#475569" fontSize="7">₹5k</text>
          </g>
          {/* Stage 2: Medium Snowball */}
          <g transform={isLg ? 'translate(160, 50)' : 'translate(120, 36)'}>
            <circle cx="0" cy="0" r="14" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
            <text x="0" y="-18" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="bold">Yr 10</text>
            <text x="0" y="24" textAnchor="middle" fill="#475569" fontSize="8">₹12.9k</text>
          </g>
          {/* Stage 3: Giant Glowing Snowball */}
          <g transform={isLg ? 'translate(290, 85)' : 'translate(210, 60)'}>
            <circle cx="0" cy="0" r="24" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" filter="drop-shadow(0 4px 8px rgba(2,132,199,0.25))" />
            <text x="0" y="-28" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="900">Yr 20</text>
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="extrabold">₹33.6k</text>
            {/* Sparkles */}
            <circle cx="26" cy="-16" r="3" fill="#FDE047" />
            <circle cx="-26" cy="16" r="2.5" fill="#FDE047" />
          </g>
          {/* Tag */}
          <g transform={isLg ? 'translate(120, 10)' : 'translate(85, 8)'}>
            <rect width="90" height="18" rx="9" fill="#0369A1" />
            <text x="45" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Interest on Interest</text>
          </g>
        </svg>
      );

    case 'diversification':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-divs" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="100%" stopColor="#FFE4E6" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-divs)" />
          {/* Cloud & Lightning above */}
          <g transform={isLg ? 'translate(50, 20)' : 'translate(30, 14)'}>
            <ellipse cx="25" cy="14" rx="20" ry="10" fill="#94A3B8" />
            <ellipse cx="38" cy="12" rx="14" ry="10" fill="#64748B" />
            <path d="M 28 24 L 22 34 L 28 34 L 24 44" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Sturdy Multi-Colored Umbrella Shield */}
          <g transform={isLg ? 'translate(140, 25)' : 'translate(100, 18)'}>
            <path d="M 0 35 Q 40 -8 80 35 Z" fill="#E11D48" stroke="#BE123C" strokeWidth="2" />
            <path d="M 20 35 Q 40 -8 60 35 Z" fill="#F43F5E" />
            <line x1="40" y1="20" x2="40" y2="60" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M 40 60 C 40 68, 30 68, 30 62" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* 4 Distinct Safe Baskets below */}
          <g transform={isLg ? 'translate(240, 35)' : 'translate(170, 25)'}>
            {/* Basket 1: Stocks */}
            <circle cx="10" cy="15" r="9" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
            <text x="10" y="18" textAnchor="middle" fill="#1E40AF" fontSize="8" fontWeight="bold">EQ</text>
            {/* Basket 2: Bonds */}
            <circle cx="35" cy="15" r="9" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="35" y="18" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="bold">BD</text>
            {/* Basket 3: Gold */}
            <circle cx="60" cy="15" r="9" fill="#FCE7F3" stroke="#DB2777" strokeWidth="1.5" />
            <text x="60" y="18" textAnchor="middle" fill="#9D174D" fontSize="8" fontWeight="bold">GD</text>
            {/* Basket 4: Cash */}
            <circle cx="85" cy="15" r="9" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
            <text x="85" y="18" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="bold">CS</text>
            <rect x="0" y="32" width="95" height="16" rx="4" fill="#0F766E" />
            <text x="47" y="43" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">4 BASKETS</text>
          </g>
        </svg>
      );

    case 'inflation':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-inf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-inf)" />
          {/* Ground Purchasing Power scale / diminishing rupee */}
          <g transform={isLg ? 'translate(45, 50)' : 'translate(25, 36)'}>
            <circle cx="20" cy="20" r="18" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" opacity="0.6" />
            <text x="20" y="26" textAnchor="middle" fill="#9A3412" fontSize="18" fontWeight="bold">₹</text>
            <text x="20" y="48" textAnchor="middle" fill="#C2410C" fontSize="8" fontWeight="bold">Idle Cash Shrinks</text>
          </g>
          {/* Rising Hot Air Balloon */}
          <g transform={isLg ? 'translate(150, 15)' : 'translate(105, 10)'}>
            {/* Balloon Dome */}
            <path d="M 15 45 C -15 10, 65 10, 35 45 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
            <path d="M 20 45 C 5 20, 45 20, 30 45 Z" fill="#FDBA74" />
            <text x="25" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">%</text>
            {/* Ropes and Basket */}
            <line x1="20" y1="45" x2="22" y2="54" stroke="#78350F" strokeWidth="1.5" />
            <line x1="30" y1="45" x2="28" y2="54" stroke="#78350F" strokeWidth="1.5" />
            <rect x="18" y="54" width="14" height="12" rx="2" fill="#78350F" />
          </g>
          {/* Price Tags Escalator */}
          <g transform={isLg ? 'translate(250, 25)' : 'translate(180, 16)'}>
            <rect x="0" y="0" width="70" height="20" rx="6" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
            <text x="35" y="14" textAnchor="middle" fill="#B91C1C" fontSize="9" fontWeight="bold">Yr 1: ₹100</text>
            <rect x="10" y="26" width="70" height="20" rx="6" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
            <text x="45" y="40" textAnchor="middle" fill="#B91C1C" fontSize="9" fontWeight="bold">Yr 5: ₹134</text>
            <path d="M 60 52 L 72 52 L 72 48 M 72 52 L 67 47" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'asset_allocation':
      return (
        <svg viewBox={viewBox} className="w-full object-contain rounded-xl" style={{ height: h }}>
          <defs>
            <linearGradient id="g-aa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FAF5FF" />
              <stop offset="100%" stopColor="#F3E8FF" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="16" fill="url(#g-aa)" />
          {/* Balanced Donut Pie Chart on Left */}
          <g transform={isLg ? 'translate(75, 45)' : 'translate(50, 32)'}>
            {/* Donut Segments */}
            {/* Top Right: Equity 50% */}
            <path d="M 0 0 L 0 -36 A 36 36 0 0 1 36 0 A 36 36 0 0 1 0 36 Z" fill="#10B981" />
            {/* Bottom Left: Bonds 35% */}
            <path d="M 0 0 L 0 36 A 36 36 0 0 1 -34 -10 Z" fill="#3B82F6" />
            {/* Top Left: Gold 10% */}
            <path d="M 0 0 L -34 -10 A 36 36 0 0 1 -18 -31 Z" fill="#F59E0B" />
            {/* Cash 5% */}
            <path d="M 0 0 L -18 -31 A 36 36 0 0 1 0 -36 Z" fill="#06B6D4" />
            {/* Center Hole */}
            <circle cx="0" cy="0" r="16" fill="#FAF5FF" />
            <circle cx="0" cy="0" r="5" fill="#7C3AED" />
          </g>
          {/* Allocation Legend */}
          <g transform={isLg ? 'translate(180, 20)' : 'translate(130, 14)'}>
            <circle cx="6" cy="10" r="5" fill="#10B981" />
            <text x="18" y="14" fill="#0F172A" fontSize="9" fontWeight="bold">50% Equity (Growth)</text>
            <circle cx="6" cy="28" r="5" fill="#3B82F6" />
            <text x="18" y="32" fill="#0F172A" fontSize="9" fontWeight="bold">35% Bonds (Safety)</text>
            <circle cx="6" cy="46" r="5" fill="#F59E0B" />
            <text x="18" y="50" fill="#0F172A" fontSize="9" fontWeight="bold">10% Gold (Hedge)</text>
            <circle cx="6" cy="64" r="5" fill="#06B6D4" />
            <text x="18" y="68" fill="#0F172A" fontSize="9" fontWeight="bold">5% Cash (Buffer)</text>
          </g>
        </svg>
      );

    default:
      return null;
  }
}

function FinancialTermsScreen() {
  const { d } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [learnedTerms, setLearnedTerms] = useState(new Set());

  const categories = [
    { id: 'all', label: 'All Terms', count: FINANCIAL_TERMS.length },
    { id: 'basics', label: 'Investing Basics', count: FINANCIAL_TERMS.filter((t) => t.category === 'basics').length },
    { id: 'funds', label: 'Funds & Plans', count: FINANCIAL_TERMS.filter((t) => t.category === 'funds').length },
    { id: 'growth', label: 'Growth & Metrics', count: FINANCIAL_TERMS.filter((t) => t.category === 'growth').length },
    { id: 'strategy', label: 'Risk & Strategy', count: FINANCIAL_TERMS.filter((t) => t.category === 'strategy').length },
  ];

  const filteredTerms = useMemo(() => {
    return FINANCIAL_TERMS.filter((term) => {
      const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return matchesCategory;
      const matchesSearch =
        term.name.toLowerCase().includes(q) ||
        term.fullForm.toLowerCase().includes(q) ||
        term.shortDesc.toLowerCase().includes(q) ||
        term.detailDesc.toLowerCase().includes(q) ||
        term.categoryLabel.toLowerCase().includes(q) ||
        term.example.scenario.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const toggleLearned = (id, e) => {
    if (e) e.stopPropagation();
    try { playCorrectSound(); } catch (err) {}
    setLearnedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenTerm = (term) => {
    try { playCorrectSound(); } catch (err) {}
    setSelectedTerm(term);
  };

  const handleNextTerm = () => {
    if (!selectedTerm) return;
    const currentIndex = FINANCIAL_TERMS.findIndex((t) => t.id === selectedTerm.id);
    const nextIndex = (currentIndex + 1) % FINANCIAL_TERMS.length;
    setSelectedTerm(FINANCIAL_TERMS[nextIndex]);
  };

  const handlePrevTerm = () => {
    if (!selectedTerm) return;
    const currentIndex = FINANCIAL_TERMS.findIndex((t) => t.id === selectedTerm.id);
    const prevIndex = (currentIndex - 1 + FINANCIAL_TERMS.length) % FINANCIAL_TERMS.length;
    setSelectedTerm(FINANCIAL_TERMS[prevIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <GraduationCap size={15} />
            <span>FinLeap Beginner's Financial Dictionary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Understand Financial Terms
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Demystify essential investing jargon in plain language. Every concept is broken down with a real-world Indian Rupee (₹) example, balanced benefit & risk analysis, and unique visual illustrations.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-800 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 w-fit">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span>Educational Guide: Returns shown in examples are illustrative. Investments fluctuate and are not guaranteed.</span>
          </div>
        </div>

        {/* Learning Progress Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Concepts Learned</span>
            <div className="text-xl font-extrabold text-emerald-900">
              {learnedTerms.size} of {FINANCIAL_TERMS.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block">Click card star to track</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-sm border-2 border-emerald-300">
            {Math.round((learnedTerms.size / FINANCIAL_TERMS.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search financial terms (e.g., SIP, SWP, Mutual Funds, NAV, ROI, Stocks, Inflation...)"
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-800 font-medium placeholder-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              title="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Showing {filteredTerms.length} of {FINANCIAL_TERMS.length} financial terms</span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="text-emerald-700 hover:underline font-bold cursor-pointer">
              Reset search & filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of 12 Financial Term Cards */}
      {filteredTerms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTerms.map((term) => {
            const isLearned = learnedTerms.has(term.id);
            return (
              <div
                key={term.id}
                onClick={() => handleOpenTerm(term)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group">
                <div>
                  {/* Card Illustration Header */}
                  <div className="p-3 bg-slate-50/50 border-b border-slate-100 relative">
                    <TermIllustration id={term.id} size="sm" />
                    {/* Category Tag on Illustration */}
                    <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 text-[10px] font-extrabold shadow-xs border border-slate-200/70">
                      {term.categoryLabel}
                    </span>
                    {/* Bookmark / Learned Star Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleLearned(term.id, e)}
                      title={isLearned ? 'Marked as Learned' : 'Click to mark as Learned'}
                      className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
                        isLearned
                          ? 'bg-amber-400 text-white'
                          : 'bg-white/90 text-slate-400 hover:text-amber-500 border border-slate-200/80'
                      }`}>
                      <Star size={14} className={isLearned ? 'fill-white' : ''} />
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition">
                          {term.name}
                        </h2>
                        {isLearned && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Learned
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-0.5">
                        {term.fullForm}
                      </div>
                    </div>

                    {/* Simple Beginner Explanation */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {term.shortDesc}
                    </p>

                    {/* Real-World Rupee Example Callout Box */}
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                      <div className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                        <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">₹</span>
                        <span>Example: {term.example.headline}</span>
                      </div>
                      <p className="text-emerald-900/90 text-[11px] leading-relaxed line-clamp-2">
                        {term.example.scenario}
                      </p>
                    </div>

                    {/* Key Benefit or Risk Tag */}
                    <div className="pt-1">
                      {term.category === 'strategy' && term.id === 'inflation' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200">
                          <AlertTriangle size={13} className="text-amber-700 shrink-0" />
                          <span className="truncate">Key Risk: {term.risk.title}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                          <span className="truncate">Key Benefit: {term.benefit.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-900">
                  <span>Deep Dive & Visual Guide</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No matching financial terms found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any financial terms matching "{searchTerm}". Try checking your spelling or explore another category.
          </p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
            className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition cursor-pointer">
            View All 12 Terms
          </button>
        </div>
      )}

      {/* Detailed Modal Popup for Selected Financial Term */}
      {selectedTerm && (
        <Modal
          title={`${selectedTerm.name} — ${selectedTerm.fullForm}`}
          maxWidth={680}
          onClose={() => setSelectedTerm(null)}>
          <div className="space-y-5 text-left p-1">
            {/* Modal Header Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                  {selectedTerm.categoryLabel}
                </span>
                <span className="text-xs text-slate-500 font-medium">2 min beginner read</span>
              </div>
              <button
                type="button"
                onClick={() => toggleLearned(selectedTerm.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  learnedTerms.has(selectedTerm.id)
                    ? 'bg-amber-400 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                <Star size={13} className={learnedTerms.has(selectedTerm.id) ? 'fill-white' : ''} />
                <span>{learnedTerms.has(selectedTerm.id) ? 'Marked as Learned' : 'Mark as Learned'}</span>
              </button>
            </div>

            {/* Large Bespoke Illustration */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 shadow-inner flex items-center justify-center">
              <TermIllustration id={selectedTerm.id} size="lg" />
            </div>

            {/* Section 1: Plain English Beginner Breakdown */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Lightbulb size={16} className="text-emerald-700" />
                <span>What is {selectedTerm.name}?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedTerm.detailDesc}
              </p>
            </div>

            {/* Section 2: Real-World Indian Rupee (₹) Example */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-black text-xs text-emerald-950">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-extrabold">₹</span>
                <span>Real-World Scenario: {selectedTerm.example.headline}</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                {selectedTerm.example.scenario}
              </p>
              <div className="space-y-1.5 pt-1">
                {selectedTerm.example.breakdown.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-900 font-medium bg-white/70 p-2 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-700 shrink-0">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1 text-xs text-emerald-950 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>Key Takeaway: {selectedTerm.example.lesson}</span>
              </div>
            </div>

            {/* Section 3: Two Column Benefit vs Risk Assessment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Benefit Card */}
              <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>Key Benefit</span>
                </div>
                <div className="text-xs font-bold text-slate-800">{selectedTerm.benefit.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedTerm.benefit.desc}
                </p>
              </div>

              {/* Risk & Caution Card */}
              <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                  <AlertTriangle size={15} className="text-amber-700" />
                  <span>Key Risk & Caution</span>
                </div>
                <div className="text-xs font-bold text-slate-800">{selectedTerm.risk.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedTerm.risk.desc}
                </p>
              </div>
            </div>

            {/* Section 4: Golden Rule Memory Hook */}
            <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 text-xs flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div>
                <span className="font-black text-slate-900 block">The Golden Rule to Remember:</span>
                <span className="text-slate-600 leading-relaxed">{selectedTerm.keyRule}</span>
              </div>
            </div>

            {/* Section 5: Educational Disclaimer */}
            <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed text-center font-medium">
              FinLeap Educational Notice: Investment values fluctuate based on market movements. Past examples or illustrations do not guarantee future returns. Always assess your risk tolerance before investing real money.
            </div>

            {/* Modal Bottom Controls: Previous / Next Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={handlePrevTerm}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer">
                <ChevronLeft size={15} />
                <span>Previous Term</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTerm(null)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Done Reading
              </button>

              <button
                type="button"
                onClick={handleNextTerm}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer">
                <span>Next Term</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AchievementsScreen() {
  const { s, t } = useApp();
  const lv = levelOf(s.xp);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Achievements & Badges</h1>
        <p className="text-sm text-slate-500">Track your milestones and financial literacy progression</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl font-bold">
            ★
          </span>
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">Level {lv + 1} - {t(`lv.${lv + 1}`)}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{s.xp} Total XP accumulated</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
            {s.streak || 1} Day Streak 🔥
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {BADGES.map((b) => {
          const got = !!s.badges[b.id];
          return (
            <div key={b.id} className={`p-5 rounded-3xl border-2 transition text-center ${got ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 bg-white'}`}>
              <div className={`text-4xl mb-2 ${got ? '' : 'grayscale opacity-30'}`}>{b.e}</div>
              <h3 className="font-bold text-sm text-slate-900">{t(`bd.${b.id}`)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{t(`bd.${b.id}.d`)}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold mt-3 px-2.5 py-1 rounded-full ${got ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {got ? <Check size={12} /> : <Lock size={12} />} {t(got ? 'home.earned' : 'home.locked')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const { s, d, t } = useApp();
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile, language, and preferences</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
          <input type="text" value={s.userName || 'Deepa'} onChange={e => d({ type: 'userName', v: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl font-bold text-sm" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Gender Avatar</label>
          <Seg full label="Avatar" value={s.avatar || '👩🏽'} onChange={v => d({ type: 'avatar', v })}
            options={[{ value: '🧑🏽', label: 'Male' }, { value: '👩🏽', label: 'Female' }]} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
          <Seg full label={t('lang.label')} value={s.lang} onChange={v => d({ type: 'lang', v })} options={LANGS} />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <div className="text-xs font-bold text-slate-800">Quiz Sound Effects</div>
            <div className="text-[11px] text-slate-500">Audio feedback for correct and wrong answers</div>
          </div>
          <SoundButton />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button type="button" onClick={() => d({ type: 'persona', v: s.persona === 'arjun' ? 'priya' : 'arjun' })}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer">
            {t('per.switch')}
          </button>
          <button type="button" onClick={() => d({ type: 'logout' })}
            className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-100 transition cursor-pointer">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------- Pillar 1: Plan & Budget ---------- */

function BudgetGame() {
  const { t, P, d } = useApp(); const pillar = PILLARS[0];
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState({}); // item -> bucket
  const [first, setFirst] = useState({}); // item -> was the first placement right?
  const [came, setCame] = useState({}); // item -> got it right after a rethink
  const [ctx, setCtx] = useState({}); // "it depends" item -> chosen context index
  const [open, setOpen] = useState(null);
  const [drag, setDrag] = useState(null);
  const [retried, setRetried] = useState(false);
  const [goal, setGoal] = useState(P.goals[0].id);
  const [weekly, setWeekly] = useState(50);
  const [score, setScore] = useState(0);
  useScrollTop(step);

  const ansOf = (it) => (it.ctx ? (ctx[it.id] != null ? it.ctx[ctx[it.id]][1] : null) : it.ans);
  const verdict = (it, b) => { const a = ansOf(it); return b === a ? 'good' : a === 'want' && b === 'later' ? 'ok' : 'learn'; };
  const assign = (it, b) => {
    setOpen(it.id);
    if (!ansOf(it)) return; // "it depends" items need their context first
    d({ type: 'begin', id: 'budget' });
    const good = verdict(it, b) !== 'learn';
    if (good) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    if (!(it.id in first)) {
      setFirst((f) => ({ ...f, [it.id]: good }));
      if (good) d({ type: 'xp', n: 5, key: `b:${it.id}:first` });
    } else if (good && !first[it.id]) { setCame((c) => ({ ...c, [it.id]: 1 })); setRetried(true); }
    if (good) d({ type: 'xp', n: 10, key: `b:${it.id}` });
    setPlace((p) => ({ ...p, [it.id]: b }));
  };
  const pickCtx = (it, i) => {
    setCtx((c) => ({ ...c, [it.id]: i })); setOpen(it.id);
    setPlace((p) => { const n = { ...p }; delete n[it.id]; return n; });
  };
  const reset = () => { setPlace({}); setFirst({}); setCame({}); setCtx({}); setOpen(null); setRetried(true); setStep(1); };

  const sum = (b) => P.items.reduce((a, it) => a + (place[it.id] === b ? it.cost : 0), 0);
  const needs = sum('need'); const wants = sum('want'); const later = sum('later');
  const left = P.wallet - needs - wants; const over = left < 0;
  const saved = clamp(Math.min(later, left), 0, P.wallet); const free = Math.max(0, left - saved);
  const placed = Object.keys(place).length; const all = placed === P.items.length;
  const total = Math.max(P.wallet, needs + wants);
  const segs = [['need', needs, C.crimson], ['want', wants, '#9A5B00'], ['saved', saved, C.dteal], ['left', free, '#D8CDCF']];
  const g = P.goals.find((x) => x.id === goal); const weeks = Math.ceil(g.cost / weekly);

  const finish = () => {
    const sc = Math.round((100 * Object.values(first).filter(Boolean).length) / P.items.length);
    setScore(sc); d({ type: 'finish', id: 'budget', score: sc, retried }); setStep(3);
  };

  return (
    <section>
      <PillarHead pillar={pillar} step={step} steps={4} />
      {step === 0 && <Story pillar={pillar} text={t(`b.story.${P.id}`, { amt: inr(P.wallet) })} cta={t('c.start')} onStart={() => setStep(1)} />}

      {step === 1 && (
        <div>
          <h2 className="font-bold text-lg leading-tight">{t('b.sort.title')}</h2>
          <p className="text-sm mb-2" style={{ color: C.muted }}>{t('b.sort.hint')}</p>
          <Card className="sticky z-20" style={{ top: 'calc(var(--lf-top, 112px) + 6px)', padding: 12 }}>
            <div className="flex rounded-full overflow-hidden" style={{ height: 16, background: '#EFE6E7', gap: 2 }} role="img"
              aria-label={t('b.bar', { n: inr(needs), w: inr(wants), s: inr(saved), l: inr(free) })}>
              {segs.map(([k, v, col]) => v > 0 && <div key={k} className="lf-bar h-full" style={{ width: `${(v / total) * 100}%`, background: col }} />)}
            </div>
            <div className="grid grid-cols-4 gap-1 mt-2 text-center">
              {segs.map(([k, v, col]) => {
                const zone = k === 'saved' ? 'later' : k === 'left' ? null : k;
                return (
                  <div key={k} className="rounded-lg px-1 py-1" style={{ border: `2px ${zone ? 'dashed' : 'solid'} ${zone && drag ? col : C.line}` }}
                    onDragOver={zone ? (e) => e.preventDefault() : undefined}
                    onDrop={zone ? (e) => { e.preventDefault(); const it = P.items.find((x) => x.id === drag); if (it) assign(it, zone); setDrag(null); } : undefined}>
                    <div className="text-xs font-semibold leading-tight flex items-center justify-center gap-1">
                      <span className="inline-block rounded-sm shrink-0" style={{ width: 8, height: 8, background: col }} aria-hidden="true" />{t(`b.${k}`)}
                    </div>
                    <div className="text-sm font-bold">{inr(v)}</div>
                  </div>
                );
              })}
            </div>
            <p role="status" aria-live="polite" className="text-sm font-semibold mt-2" style={{ color: over ? C.crimson : C.muted }}>
              {over ? `⚠ ${t('b.over', { amt: inr(-left) })}` : t('b.placed', { a: placed, b: P.items.length })}
            </p>
          </Card>

          <ul className="grid gap-3 mt-3">
            {P.items.map((it) => {
              const b = place[it.id]; const bucket = BUCKETS.find((x) => x.id === b);
              const cid = it.ctx && ctx[it.id] != null ? it.ctx[ctx[it.id]][0] : null;
              const v = b ? verdict(it, b) : null;
              return (
                <li key={it.id} draggable onDragStart={(e) => { setDrag(it.id); try { e.dataTransfer.setData('text/plain', it.id); } catch (err) { /* ignore */ } }}
                  onDragEnd={() => setDrag(null)} className="bg-white rounded-2xl shadow-sm p-3" style={{ border: `2px solid ${bucket ? bucket.color : C.line}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">{it.e}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-snug">{t(`it.${it.id}`)}</div>
                      <div className="font-bold" style={{ color: C.burgundy }}>{inr(it.cost)}</div>
                    </div>
                  </div>
                  {it.ctx && (
                    <fieldset className="mt-2">
                      <legend className="text-sm font-semibold mb-1">{t('b.ctx.q')}</legend>
                      <div className="grid gap-2">
                        {it.ctx.map(([id], i) => (
                          <Btn key={id} kind={ctx[it.id] === i ? 'soft' : 'ghost'} aria-pressed={ctx[it.id] === i} className="text-sm justify-start text-left"
                            style={{ minHeight: 44 }} onClick={() => pickCtx(it, i)}>{ctx[it.id] === i && <Check size={16} aria-hidden="true" />}{t(`it.${it.id}.q.${id}`)}</Btn>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {(!it.ctx || cid) && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {BUCKETS.map((k) => (
                        <button key={k.id} type="button" aria-pressed={b === k.id} onClick={() => assign(it, k.id)}
                          className="rounded-xl text-sm font-semibold px-1 py-1 leading-tight"
                          style={{ minHeight: 48, background: b === k.id ? k.color : '#fff', color: b === k.id ? '#fff' : k.color, border: `2px solid ${k.color}` }}>
                          <span aria-hidden="true">{k.e} </span>{t(`b.${k.id}`)}
                        </button>
                      ))}
                    </div>
                  )}
                  {open === it.id && b && (
                    <Feedback tone={v} title={v === 'learn' ? t('fb.rethink') : came[it.id] ? t('fb.comeback') : t(v === 'ok' ? 'fb.smart' : 'fb.good')}
                      why={t(cid ? `it.${it.id}.why.${cid}` : `it.${it.id}.why`)} real={t(`it.${it.id}.alt`)} realLabel={t('b.whatif')} />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-sm mt-3 rounded-xl p-3" style={{ background: pillar.soft }}>💡 {t('b.guide')}</p>
          <div className="grid gap-2 mt-3">
            <Btn bg={pillar.color} disabled={!all || over} onClick={() => setStep(2)}>{t('b.toGoal')}<ChevronRight size={18} aria-hidden="true" /></Btn>
            <Btn kind="ghost" onClick={reset}><RotateCcw size={18} aria-hidden="true" />{t('b.reset')}</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="lf-pop">
          <h2 className="font-bold text-lg inline-flex items-center gap-2"><Target size={20} aria-hidden="true" style={{ color: pillar.ink }} />{t('b.goal.title')}</h2>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {P.goals.map((x) => (
              <button key={x.id} type="button" aria-pressed={goal === x.id} onClick={() => setGoal(x.id)} className="rounded-xl p-2 text-center"
                style={{ minHeight: 96, background: goal === x.id ? pillar.soft : '#fff', border: `2px solid ${goal === x.id ? pillar.color : C.line}` }}>
                <span className="block text-3xl" aria-hidden="true">{x.e}</span>
                <span className="block text-xs font-semibold leading-tight">{t(`g.${x.id}`)}</span>
                <span className="block text-sm font-bold">{inr(x.cost)}</span>
              </button>
            ))}
          </div>
          <label className="block mt-4 font-semibold" htmlFor="lf-weekly">{t('b.goal.weekly')}: <span className="text-xl" style={{ color: pillar.ink }}>{inr(weekly)}</span></label>
          <input id="lf-weekly" type="range" min={25} max={300} step={25} value={weekly} onChange={(e) => setWeekly(+e.target.value)} />
          <div role="status" aria-live="polite" className="rounded-xl p-3 text-center" style={{ background: pillar.soft }}>
            <div className="text-2xl font-bold" style={{ color: pillar.ink }}>{g.e} {t('b.goal.result', { n: weeks })}</div>
            <p className="text-sm">{t('b.goal.months', { n: Math.max(1, Math.round(weeks / 4.3)) })}</p>
          </div>
          <p className="text-sm mt-2" style={{ color: C.muted }}>💡 {t('b.goal.tip')}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Btn kind="ghost" onClick={() => setStep(1)}><ChevronLeft size={18} aria-hidden="true" />{t('c.back')}</Btn>
            <Btn bg={pillar.color} onClick={finish}>{t('c.finish')}</Btn>
          </div>
        </Card>
      )}

      {step === 3 && <Summary pillar={pillar} score={score} learned={['b.l1', 'b.l2', 'b.l3']} onRetry={reset} />}
    </section>
  );
}

/* ---------- Pillar 2: Save & Manage ---------- */

const WEEK_STEP = [1, 2, 4, 5]; // step 0 = setup, 3 = the surprise, 6 = summary

// Pure replay of the month from the student's choices, so any change recalculates everything.
function runSim(P, jarOn, picks, trade, step) {
  const sim = P.sim;
  let w = P.wallet; let jar = 0; let fund = 0; let debt = 0; let ranOut = false; let due = null; let thrifty = 0;
  const pay = (x) => { if (w >= x) w -= x; else { w = 0; ranOut = true; } };
  for (let k = 0; k < 4; k++) {
    if (step < (k === 2 ? 3 : WEEK_STEP[k])) break; // week 3's transfers land just before the surprise
    const g = Math.min(sim.goalWeekly, w); w -= g; fund += g;
    if (jarOn && k < 3) { const m = Math.min(sim.jarWeekly, w); w -= m; jar += m; }
    if (k === 2) {
      if (jarOn) { const m = Math.min(jar, sim.shock); jar -= m; if (m < sim.shock) pay(sim.shock - m); }
      else if (trade === 'borrow') debt = sim.shock;
      else if (trade === 'goal') { const m = Math.min(fund, sim.shock); fund -= m; pay(sim.shock - m); }
      else if (trade === 'skip') pay(sim.shock);
    }
    if (k === 3) {
      if (trade === 'skip') due = 'skip';
      else if (w >= sim.due) { w -= sim.due; due = 'paid'; }
      else if (w + jar >= sim.due) { jar -= sim.due - w; w = 0; due = 'jarHelp'; }
      else due = 'miss';
    }
    if (step >= WEEK_STEP[k]) sim.weeks[k].forEach((c, i) => { const p = picks[`${k}-${i}`]; if (p) { pay(c[p]); if (p === 'lo') thrifty += 1; } });
  }
  return { w, jar, fund, debt, ranOut, due, thrifty };
}

const TRADES = ['skip', 'borrow', 'goal'];

function SaveGame() {
  const { t, P, d } = useApp(); const pillar = PILLARS[1]; const sim = P.sim;
  const [step, setStep] = useState(0);
  const [jarOn, setJarOn] = useState(true);
  const [picks, setPicks] = useState({});
  const [trade, setTrade] = useState(null);
  const [retried, setRetried] = useState(false);
  const [score, setScore] = useState(0);
  useScrollTop(step);

  const st = runSim(P, jarOn, picks, trade, step);
  const target = sim.goalWeekly * 4;
  const k = WEEK_STEP.indexOf(step);
  const dueName = t(`s.due.${P.id}`);
  const meter = jarOn ? (step >= 3 ? 100 : clamp((st.jar / sim.shock) * 100, 0, 100)) : 0;
  const meterKey = !jarOn ? 's.meter.0' : meter >= 100 ? 's.meter.2' : 's.meter.1';

  const start = () => { d({ type: 'begin', id: 'save' }); if (jarOn) d({ type: 'xp', n: 20, key: 's:jar' }); setStep(1); };
  const pick = (i, v) => { setPicks((p) => ({ ...p, [`${k}-${i}`]: v })); if (v === 'lo') d({ type: 'xp', n: 5, key: `s:${k}-${i}` }); };
  const replay = () => { setPicks({}); setTrade(null); setRetried(true); setStep(0); };
  const finish = () => {
    const end = runSim(P, jarOn, picks, trade, 5);
    const onTrack = end.fund >= target && (end.due === 'paid' || end.due === 'jarHelp') && !end.debt;
    const sc = Math.round((jarOn ? 40 : 0) + (end.thrifty / 8) * 40 + (onTrack ? 20 : 0));
    setScore(sc); d({ type: 'finish', id: 'save', score: sc, retried, extra: { wallet: end.w, jar: end.jar } }); setStep(6);
  };

  const pathCard = (id, mine, onPick) => {
    const Tag = onPick ? 'button' : 'div';
    return (
      <Tag key={id} type={onPick ? 'button' : undefined} onClick={onPick} aria-pressed={onPick ? mine : undefined} className="block w-full text-left rounded-xl p-3"
        style={{ background: mine ? C.blush : '#fff', border: `2px solid ${mine ? C.burgundy : C.line}`, minHeight: 48 }}>
        <span className="flex items-center gap-2 font-semibold">{mine && <Check size={16} aria-hidden="true" />}{t(`tr.${id}.${P.id}`)}
          {mine && <span className="ml-auto text-xs rounded-full px-2 py-0.5 text-white shrink-0" style={{ background: C.burgundy }}>{t('s.yours')}</span>}</span>
        <span className="block text-sm mt-1" style={{ color: C.muted }}>→ {t(`tr.${id}.${P.id}.c`)}</span>
      </Tag>
    );
  };

  return (
    <section>
      <PillarHead pillar={pillar} step={step} steps={7} />

      {step === 0 && (
        <Story pillar={pillar} text={t(`s.story.${P.id}`, { amt: inr(P.wallet), due: inr(sim.due), goal: inr(sim.goalWeekly) })} cta={t('s.begin')} onStart={start}>
          <div className="mt-4 rounded-xl p-3" style={{ background: pillar.soft }}>
            <h2 className="font-bold">🫙 {t('s.jar.title')}</h2>
            <p className="text-sm">{t('s.jar.desc', { amt: inr(sim.jarWeekly) })}</p>
            <button type="button" role="switch" aria-checked={jarOn} onClick={() => setJarOn((v) => !v)}
              className="mt-2 w-full flex items-center justify-between gap-3 rounded-xl px-3 bg-white font-semibold" style={{ minHeight: 52, border: `2px solid ${pillar.color}` }}>
              <span>{t('s.jar.toggle')}</span>
              <span className="inline-flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: jarOn ? C.good : C.muted }}>{t(jarOn ? 's.jar.on' : 's.jar.off')}</span>
                <span className="relative inline-block rounded-full" style={{ width: 48, height: 28, background: jarOn ? pillar.color : '#B9AEB0' }} aria-hidden="true">
                  <span className="lf-bar absolute bg-white rounded-full" style={{ width: 22, height: 22, top: 3, left: jarOn ? 23 : 3 }} />
                </span>
              </span>
            </button>
          </div>
        </Story>
      )}

      {step >= 1 && step <= 5 && (
        <Card className="mb-3">
          <div className="grid grid-cols-3 gap-2 text-center items-center" role="status" aria-live="polite">
            <div><div className="text-xs font-semibold">👛 {t('s.wallet')}</div><div className="text-2xl font-bold">{inr(st.w)}</div></div>
            <div><div className="text-xs font-semibold">🫙 {t('s.jar')}</div><div className="text-2xl font-bold" style={{ color: pillar.ink }}>{inr(st.jar)}</div></div>
            <div className="flex flex-col items-center">
              <Ring pct={(st.fund / target) * 100} size={48} stroke={5} color={pillar.color} label={`${t('s.goalFund')} ${inr(st.fund)}`}><span aria-hidden="true">🎯</span></Ring>
              <div className="text-xs font-semibold mt-0.5">{t('s.goalFund')} {inr(st.fund)}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs font-semibold"><span>{t('s.meter')}</span><span>{meter >= 100 ? '🛡️' : meter > 0 ? '🧱' : '⚠'} {t(meterKey)}</span></div>
            <div className="rounded-full overflow-hidden mt-1" style={{ height: 10, background: '#E3DADB' }} aria-hidden="true">
              <div className="lf-bar h-full rounded-full" style={{ width: `${meter}%`, background: pillar.color }} />
            </div>
          </div>
        </Card>
      )}

      {k >= 0 && (
        <div className="lf-pop" key={step}>
          <h2 className="text-xl font-bold">{t('s.week', { n: k + 1 })}</h2>
          <div className="text-sm rounded-xl p-3 mt-1" style={{ background: pillar.soft }}>
            <b>{t('s.auto')}:</b>
            <ul className="mt-1">
              <li>🎯 {t('s.auto.goal', { amt: inr(sim.goalWeekly) })}</li>
              {jarOn && k < 3 && <li>🫙 {t('s.auto.jar', { amt: inr(sim.jarWeekly) })}</li>}
              {k === 3 && <li>{st.due === 'paid' || st.due === 'jarHelp' ? '✅' : '⚠'} {t(`s.auto.${st.due}`, { name: dueName, amt: inr(sim.due) })}</li>}
            </ul>
          </div>
          <p className="font-semibold mt-3">{t('s.pick')}</p>
          {sim.weeks[k].map((c, i) => {
            const cur = picks[`${k}-${i}`];
            return (
              <fieldset key={c.id} className="bg-white rounded-2xl shadow-sm p-3 mt-2" style={{ border: `1px solid ${C.line}` }}>
                <legend className="font-bold px-1">{t(`ch.${c.id}`)}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {['hi', 'lo'].map((o) => {
                    const cant = o === 'hi' && cur !== 'hi' && c.hi > st.w + (cur ? c[cur] : 0);
                    return (
                      <button key={o} type="button" aria-pressed={cur === o} disabled={cant} onClick={() => pick(i, o)}
                        className="rounded-xl p-2 text-left text-sm font-semibold leading-tight disabled:opacity-50"
                        style={{ minHeight: 72, background: cur === o ? pillar.soft : '#fff', border: `2px solid ${cur === o ? pillar.color : '#CFC4C6'}` }}>
                        <span className="flex items-start gap-1">{cur === o && <Check size={16} aria-hidden="true" className="shrink-0" />}<span>{t(`ch.${c.id}.${o}`)}</span></span>
                        <span className="block text-base font-bold mt-1" style={{ color: pillar.ink }}>{c[o] ? inr(c[o]) : t('s.free')}</span>
                        {cant && <span className="block text-xs">{t('s.cant')}</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
          <Btn className="w-full mt-4" bg={pillar.color} disabled={sim.weeks[k].some((c, i) => !picks[`${k}-${i}`])} onClick={() => (step === 5 ? finish() : setStep(step + 1))}>
            {t(step === 5 ? 's.endMonth' : 's.nextWeek')}<ChevronRight size={18} aria-hidden="true" />
          </Btn>
        </div>
      )}

      {step === 3 && (
        <div className="lf-pop">
          <div className="rounded-2xl p-4 text-white" style={{ background: C.burgundy }} role="status" aria-live="polite">
            <h2 className="text-xl font-bold">⚡ {t('s.shock.title')}</h2>
            <p className="mt-1">{t(`s.shock.${P.id}`, { amt: inr(sim.shock) })}</p>
          </div>
          <h3 className="font-bold text-lg mt-4">{t('s.paths')}</h3>
          <div className="rounded-2xl p-3 mt-2" style={{ background: C.goodBg, border: `2px solid ${jarOn ? C.good : 'transparent'}` }}>
            <div className="flex items-center gap-2 font-bold" style={{ color: C.good }}><ShieldCheck size={20} aria-hidden="true" />{t('s.with')}
              {jarOn && <span className="ml-auto text-xs rounded-full px-2 py-0.5 text-white" style={{ background: C.good }}>{t('s.yours')}</span>}</div>
            <p className="text-sm mt-1">🫙 → {t('s.with.d')}</p>
          </div>
          <div className="rounded-2xl p-3 mt-2 bg-white" style={{ border: `2px solid ${jarOn ? C.line : C.burgundy}` }}>
            <div className="font-bold">⚠ {t('s.without')}</div>
            <p className="text-sm mt-1 mb-2">{t(jarOn ? 's.without.d' : 's.choose')}</p>
            <div className="grid gap-2">
              {TRADES.map((id) => pathCard(id, !jarOn && trade === id, jarOn ? undefined : () => setTrade(id)))}
            </div>
          </div>
          <div className="grid gap-2 mt-4">
            <Btn bg={pillar.color} disabled={!jarOn && !trade} onClick={() => setStep(4)}>{t('s.keep')}<ChevronRight size={18} aria-hidden="true" /></Btn>
            <Btn kind="ghost" onClick={replay}><RotateCcw size={18} aria-hidden="true" />{t('s.replay')}</Btn>
          </div>
        </div>
      )}

      {step === 6 && (() => {
        const end = runSim(P, jarOn, picks, trade, 5);
        return (
          <Summary pillar={pillar} score={score} learned={['s.l1', 's.l2', 's.l3']} onRetry={replay}>
            <div className="grid grid-cols-2 gap-2 mt-4 text-left">
              <div className="rounded-xl p-3" style={{ background: pillar.soft }}>
                <div className="text-xs font-semibold">{t('s.end.left')}</div>
                <div className="text-2xl font-bold">{inr(end.w + end.jar)}</div>
                {end.debt > 0 && <div className="text-xs font-semibold" style={{ color: C.crimson }}>⚠ {t('s.end.debt', { amt: inr(end.debt) })}</div>}
              </div>
              <div className="rounded-xl p-3" style={{ background: pillar.soft }}>
                <div className="text-xs font-semibold">{t('s.goalFund')}</div>
                <div className="text-2xl font-bold">{inr(end.fund)}</div>
                <div className="text-xs font-semibold">{t('s.end.thrifty', { n: end.thrifty })}</div>
              </div>
            </div>
            <div className="text-sm text-left mt-2 rounded-xl p-3" style={{ background: jarOn ? C.goodBg : C.blush }}>
              <b>{t(jarOn ? 's.with' : 's.without')}:</b> {jarOn ? t('s.with.d') : t(`tr.${trade}.${P.id}.c`)}
              {end.ranOut && <span className="block mt-1">{t('s.end.ranOut')}</span>}
            </div>
            <div className="mt-2"><Btn kind="soft" className="w-full" onClick={replay}><RotateCcw size={18} aria-hidden="true" />{t('s.replay')}</Btn></div>
          </Summary>
        );
      })()}
    </section>
  );
}

/* ---------- Pillar 3: Understand Investing ---------- */

const compact = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${Math.round(v)}`);

// Month-by-month series: put = contributions, bal = compounding, bumpy = uneven sample path, real = cash after inflation.
function growthSeries(m, years, r) {
  const n = Math.max(1, Math.round(years * 12)); const pts = [{ put: 0, bal: 0, bumpy: 0, real: 0 }];
  let bal = 0; let bumpy = 0;
  for (let i = 1; i <= n; i++) {
    bal = bal * (1 + r / 1200) + m;
    const ry = r + (BUMPS[Math.floor((i - 1) / 12) % BUMPS.length] * r) / 8;
    bumpy = bumpy * (1 + ry / 1200) + m;
    pts.push({ put: m * i, bal, bumpy, real: (m * i) / Math.pow(1.05, i / 12) });
  }
  return pts;
}

function GrowthChart({ pts, years, infl, bumpy, label, pillar }) {
  const { t } = useApp(); const [hover, setHover] = useState(null);
  const W = 340; const H = 210; const L = 44; const R = 12; const T = 12; const B = 28;
  const n = pts.length - 1;
  const max = Math.max(...pts.map((p) => Math.max(p.bal, bumpy ? p.bumpy : 0)), 1);
  const X = (i) => L + ((W - L - R) * i) / n; const Y = (v) => H - B - ((H - T - B) * v) / max;
  const path = (key, from = 0) => pts.slice(from).map((p, i) => `${i ? 'L' : 'M'}${X(i + from).toFixed(1)},${Y(p[key]).toFixed(1)}`).join('');
  const back = (key) => pts.map((p, i) => `L${X(i).toFixed(1)},${Y(p[key]).toFixed(1)}`).reverse().join('');
  const xt = years <= 5 ? Array.from({ length: years + 1 }, (_, i) => i) : [0, 2, 4, 6, 8, 10].filter((v) => v <= years);
  const hp = hover != null ? pts[Math.min(n, hover * 12)] : null;
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect(); if (!box.width) return;
    const x = ((e.clientX - box.left) / box.width) * W;
    setHover(clamp(Math.round(((x - L) / (W - L - R)) * years), 0, years));
  };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={label} style={{ touchAction: 'pan-y' }}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={Y(max * f)} y2={Y(max * f)} stroke="#E3DADB" strokeWidth="1" />
            <text x={L - 6} y={Y(max * f) + 4} textAnchor="end" fontSize="10" fill={C.muted}>{compact(max * f)}</text>
          </g>
        ))}
        {xt.map((v) => <text key={v} x={X(Math.min(n, v * 12))} y={H - 10} textAnchor="middle" fontSize="10" fill={C.muted}>{v}</text>)}
        <text x={W - R} y={H - 1} textAnchor="end" fontSize="9" fill={C.muted}>{t('i.axis')}</text>
        <path d={`${path('put')}L${X(n)},${Y(0)}L${X(0)},${Y(0)}Z`} fill="#CBD5D4" />
        <path d={`${path('bal')}${back('put')}Z`} fill={pillar.color} opacity="0.55" />
        <path d={path('put')} fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="5 4" />
        <path d={path('bal')} fill="none" stroke={C.dteal} strokeWidth="2.5" strokeLinejoin="round" />
        {infl && <path d={path('real')} fill="none" stroke={C.crimson} strokeWidth="2" strokeDasharray="2 3" />}
        {bumpy && <path d={path('bumpy')} fill="none" stroke={C.burgundy} strokeWidth="2" strokeLinejoin="round" strokeDasharray="8 3 2 3" />}
        {hp && (
          <g pointerEvents="none">
            <line x1={X(hover * 12 > n ? n : hover * 12)} x2={X(hover * 12 > n ? n : hover * 12)} y1={T} y2={H - B} stroke={C.ink} strokeWidth="1" />
            <circle cx={X(Math.min(n, hover * 12))} cy={Y(hp.bal)} r="5" fill={C.dteal} stroke="#fff" strokeWidth="2" />
            <circle cx={X(Math.min(n, hover * 12))} cy={Y(hp.put)} r="5" fill={C.ink} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      <p className="text-xs font-semibold text-center" style={{ minHeight: 18 }} aria-hidden="true">
        {hp ? t('i.tip', { y: hover, put: inr(hp.put), total: inr(hp.bal) }) : ' '}
      </p>
    </div>
  );
}

const LegendRow = ({ children, dash, color, box }) => (
  <li className="flex items-center gap-2">
    <svg width="28" height="12" aria-hidden="true" className="shrink-0">
      {box ? <rect x="2" y="1" width="24" height="10" rx="2" fill={color} opacity={box} /> : <line x1="1" x2="27" y1="6" y2="6" stroke={color} strokeWidth="2.5" strokeDasharray={dash} />}
    </svg>
    <span>{children}</span>
  </li>
);

function InvestGame() {
  const { t, P, d } = useApp(); const pillar = PILLARS[2];
  const [step, setStep] = useState(0);
  const [m, setM] = useState(P.hard ? 400 : 300); const [y, setY] = useState(5); const [rate, setRate] = useState(8);
  const [infl, setInfl] = useState(false); const [bumpy, setBumpy] = useState(false);
  const [alloc, setAlloc] = useState([400, 300, 300]); const [runs, setRuns] = useState(0);
  const [qi, setQi] = useState(0); const [ans, setAns] = useState(null); const [firstTry, setFirstTry] = useState({});
  const [retried, setRetried] = useState(false); const [score, setScore] = useState(0);
  useScrollTop(step);

  const tm = useTween(m); const ty = useTween(y); const tr = useTween(rate);
  const pts = useMemo(() => growthSeries(tm, ty, tr), [tm, ty, tr]);
  const end = useMemo(() => { const s = growthSeries(m, y, rate); return s[s.length - 1]; }, [m, y, rate]);
  const yrs = y === 1 ? t('i.year1') : t('i.yearsN', { n: y });

  const placedAmt = alloc[0] + alloc[1] + alloc[2]; const leftAmt = 1000 - placedAmt;
  const hit = runs > 0 ? TOUGH_ORDER[(runs - 1) % 3] : null;
  const after = (a) => Math.round(a.reduce((sum, v, i) => sum + v * (i === hit ? 0.6 : 1.06), 0));
  const bump = (i, dv) => setAlloc((a) => { const n = [...a]; n[i] = clamp(n[i] + dv, 0, 1000); return n[0] + n[1] + n[2] > 1000 ? a : n; });
  const outcomes = hit == null ? [] : [
    ['i.div.you', {}, after(alloc)],
    ['i.div.one', { x: 'ABC'[hit] }, after([0, 1, 2].map((i) => (i === hit ? 1000 : 0)))],
    ['i.div.spread', {}, after([334, 333, 333])],
  ];

  const q = QUIZ[qi]; const right = ans === q.ans;
  const answer = (o) => {
    setAns(o);
    if (!(q.id in firstTry)) setFirstTry((f) => ({ ...f, [q.id]: o === q.ans }));
    if (o === q.ans) {
      playCorrectSound();
      d({ type: 'xp', n: 10, key: `i:q:${q.id}` });
      if (!(q.id in firstTry)) d({ type: 'xp', n: 5, key: `i:q:${q.id}:first` });
      else setRetried(true);
    } else {
      playWrongSound();
    }
  };
  const nextQ = () => {
    if (qi < QUIZ.length - 1) { setQi(qi + 1); setAns(null); return; }
    const sc = Math.round((100 * Object.values(firstTry).filter(Boolean).length) / QUIZ.length);
    setScore(sc); d({ type: 'finish', id: 'invest', score: sc, retried }); setStep(5);
  };
  const restart = () => { setQi(0); setAns(null); setFirstTry({}); setRuns(0); setRetried(true); setStep(1); };
  const toggle = (on, set, label) => (
    <label className="flex items-center gap-2 rounded-xl px-3 bg-white text-sm font-semibold" style={{ minHeight: 44, border: `2px solid ${on ? pillar.color : C.line}` }}>
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />{label}
    </label>
  );

  return (
    <section>
      <PillarHead pillar={pillar} step={step} steps={5} />
      {step === 0 && <Story pillar={pillar} text={t(`i.story.${P.id}`)} cta={t('c.start')} onStart={() => { d({ type: 'begin', id: 'invest' }); setStep(1); }} />}

      {step === 1 && (
        <div className="lf-pop">
          <Card>
            <h2 className="font-bold text-lg">{t('i.sandbox')}</h2>
            <label className="block mt-2 font-semibold" htmlFor="lf-m">{t('i.monthly')}: <span className="text-2xl" style={{ color: pillar.ink }}>{inr(m)}</span></label>
            <input id="lf-m" type="range" min={100} max={1000} step={50} value={m} onChange={(e) => setM(+e.target.value)} />
            <label className="block font-semibold" htmlFor="lf-y">{t('i.years')}: <span className="text-2xl" style={{ color: pillar.ink }}>{yrs}</span></label>
            <input id="lf-y" type="range" min={1} max={10} step={1} value={y} onChange={(e) => setY(+e.target.value)} />
            <p className="font-semibold mb-1">{t('i.rate')}</p>
            <Seg full label={t('i.rate')} value={rate} onChange={setRate} options={RATES.map((x) => ({ value: x.r, label: t(`i.${x.id}`) }))} />
          </Card>

          <Card className="mt-3">
            <div className="grid grid-cols-3 gap-2 text-center" role="status" aria-live="polite">
              <div><div className="text-xs font-semibold leading-tight">{t('i.put')}</div><div className="text-lg font-bold">{inr(end.put)}</div></div>
              <div><div className="text-xs font-semibold leading-tight">{t('i.growth')}</div><div className="text-lg font-bold" style={{ color: pillar.ink }}>+{inr(end.bal - end.put)}</div></div>
              <div><div className="text-xs font-semibold leading-tight">{t('i.total')}</div><div className="text-lg font-bold">{inr(end.bal)}</div></div>
            </div>
            <div className="flex rounded-full overflow-hidden mt-2" style={{ height: 14, gap: 2 }} aria-hidden="true">
              <div className="lf-bar h-full" style={{ width: `${(end.put / end.bal) * 100}%`, background: '#9FB0AE' }} />
              <div className="lf-bar h-full flex-1" style={{ background: pillar.color }} />
            </div>
            <GrowthChart pts={pts} years={y} infl={infl} bumpy={bumpy} pillar={pillar} label={t('i.chart.alt', { y })} />
            <ul className="text-xs grid gap-1">
              <LegendRow box="1" color="#CBD5D4">{t('i.lg.put')}</LegendRow>
              <LegendRow box="0.55" color={pillar.color}>{t('i.lg.growth', { r: rate })}</LegendRow>
              <LegendRow dash="5 4" color={C.ink}>{t('i.lg.cash')}</LegendRow>
              <LegendRow color={C.dteal}>{t('i.lg.comp')}</LegendRow>
              {infl && <LegendRow dash="2 3" color={C.crimson}>{t('i.lg.infl')}</LegendRow>}
              {bumpy && <LegendRow dash="8 3 2 3" color={C.burgundy}>{t('i.lg.bumpy')}</LegendRow>}
            </ul>
            <p className="text-sm mt-2">{t('i.chart.sum', { m: inr(m), y, r: rate, put: inr(end.put), growth: inr(end.bal - end.put), total: inr(end.bal) })}</p>
            <p className="text-xs font-semibold mt-2 rounded-lg p-2" style={{ background: C.blush, color: C.burgundy }}>ⓘ {t('i.disclaimer')}</p>
            <div className="grid gap-2 mt-3">
              {toggle(bumpy, setBumpy, t('i.bumpy'))}
              {bumpy && <p className="text-sm" role="status">{t('i.bumpy.note')}</p>}
              {toggle(infl, setInfl, t('i.infl'))}
              {infl && <p className="text-sm" role="status">{t('i.infl.note', { y, put: inr(end.put), real: inr(end.real) })}</p>}
            </div>
            <details className="mt-3 rounded-xl p-3" style={{ background: pillar.soft }}>
              <summary className="font-semibold" style={{ minHeight: 28, cursor: 'pointer' }}>{t('i.how')}</summary>
              <p className="font-mono text-sm mt-2">{t('i.formula')}</p>
              <p className="text-sm mt-1">{t('i.formula.d')}</p>
            </details>
          </Card>
          <Btn className="w-full mt-3" bg={pillar.color} fg={pillar.on} onClick={() => { d({ type: 'xp', n: 10, key: 'i:sandbox' }); setStep(2); }}>{t('i.toDiv')}<ChevronRight size={18} aria-hidden="true" /></Btn>
        </div>
      )}

      {step === 2 && (
        <Card className="lf-pop">
          <h2 className="font-bold text-lg">🧺 {t('i.div.title')}</h2>
          <p className="text-sm">{t('i.div.desc')}</p>
          <div className="grid gap-2 mt-3">
            {alloc.map((v, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl p-2" style={{ border: `2px solid ${hit === i ? C.crimson : C.line}` }}>
                <span className="font-bold flex-1">🧺 {t('i.basket', { x: 'ABC'[i] })}{hit === i && <span className="text-xs font-bold" style={{ color: C.crimson }}> ▼ 40%</span>}</span>
                <Btn kind="ghost" style={{ minHeight: 44, width: 44, padding: 0 }} aria-label={t('i.dec', { x: 'ABC'[i] })} disabled={v < 100} onClick={() => bump(i, -100)}>−</Btn>
                <span className="font-bold text-center" style={{ width: 64 }}>{inr(v)}</span>
                <Btn kind="ghost" style={{ minHeight: 44, width: 44, padding: 0 }} aria-label={t('i.inc', { x: 'ABC'[i] })} disabled={leftAmt < 100} onClick={() => bump(i, 100)}>+</Btn>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Btn kind="soft" className="flex-1 text-sm" style={{ minHeight: 44 }} onClick={() => setAlloc([1000, 0, 0])}>{t('i.div.all')}</Btn>
            <Btn kind="soft" className="flex-1 text-sm" style={{ minHeight: 44 }} onClick={() => setAlloc([400, 300, 300])}>{t('i.div.even')}</Btn>
          </div>
          {leftAmt > 0 && <p className="text-sm font-semibold mt-2" role="status">{t('i.div.left', { amt: inr(leftAmt) })}</p>}
          <Btn className="w-full mt-3" bg={C.burgundy} disabled={leftAmt !== 0} onClick={() => { setRuns(runs + 1); d({ type: 'xp', n: 10, key: 'i:div' }); }}>
            <Zap size={18} aria-hidden="true" />{t(runs ? 'i.div.again' : 'i.div.run')}
          </Btn>
          {hit != null && (
            <div key={runs} className="lf-pop mt-3" role="status" aria-live="polite">
              <p className="font-semibold">{t('i.div.hit', { x: 'ABC'[hit] })}</p>
              <ul className="grid gap-2 mt-2">
                {outcomes.map(([key, vars, val], i) => (
                  <li key={key}>
                    <div className="flex justify-between text-sm font-semibold"><span>{t(key, vars)}</span><span>{inr(val)} ({val >= 1000 ? '+' : '−'}{inr(Math.abs(val - 1000))})</span></div>
                    <div className="rounded-full overflow-hidden" style={{ height: 12, background: '#EFE6E7' }} aria-hidden="true">
                      <div className="lf-bar h-full" style={{ width: `${val / 11}%`, background: i === 0 ? pillar.color : '#9FB0AE', borderRadius: '0 4px 4px 0' }} />
                    </div>
                  </li>
                ))}
              </ul>
              <Feedback tone={Math.max(...alloc) >= 800 ? 'learn' : 'ok'} title={t(Math.max(...alloc) >= 800 ? 'fb.rethink' : 'fb.smart')}
                why={t(Math.max(...alloc) >= 800 ? 'i.div.fb.conc' : 'i.div.fb.spread')} real={t('i.div.real')} />
              <p className="text-xs font-semibold mt-2" style={{ color: C.muted }}>ⓘ {t('i.disclaimer')}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Btn kind="ghost" onClick={() => setStep(1)}><ChevronLeft size={18} aria-hidden="true" />{t('c.back')}</Btn>
            <Btn kind="soft" onClick={() => setStep(3)}>{t('i.toStock')}</Btn>
            <Btn bg={pillar.color} fg={pillar.on} onClick={() => setStep(4)}>{t('i.toQuiz')}</Btn>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="lf-pop relative">
          <h2 className="font-bold text-lg inline-flex items-center gap-2">📈 {t('i.stock.title')}</h2>
          <p className="text-sm mt-2">{t('i.stock.desc')}</p>
          
          <div className="mt-4 p-3 rounded-xl bg-white border" style={{ borderColor: C.line }}>
            <h3 className="font-bold mb-2">{t('i.stock.terms')}</h3>
            <ul className="text-sm space-y-2">
              <li><span className="font-bold text-[#C2185B]">NAV:</span> {t('i.stock.nav')}</li>
              <li><span className="font-bold text-[#0E8F6B]">Dividend:</span> {t('i.stock.div')}</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-bold">{t('i.stock.candle')}</h3>
            <p className="text-sm mb-3">{t('i.stock.candle.d')}</p>
            <div className="flex justify-center items-center gap-8 p-4 rounded-xl" style={{ background: pillar.soft }}>
              {/* Fake Candlestick Green */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-gray-500 mb-1">High</span>
                <div className="relative flex flex-col items-center" style={{ height: 80, width: 24 }}>
                  <div className="w-0.5 bg-black h-full absolute"></div>
                  <div className="w-full bg-[#14613A] border-2 border-black absolute" style={{ top: '20%', height: '50%', zIndex: 10 }}></div>
                </div>
                <span className="text-[10px] font-mono text-gray-500 mt-1">Low</span>
              </div>
              
              {/* Fake Candlestick Red */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-gray-500 mb-1">High</span>
                <div className="relative flex flex-col items-center" style={{ height: 80, width: 24 }}>
                  <div className="w-0.5 bg-black h-full absolute"></div>
                  <div className="w-full bg-[#C2185B] border-2 border-black absolute" style={{ top: '30%', height: '60%', zIndex: 10 }}></div>
                </div>
                <span className="text-[10px] font-mono text-gray-500 mt-1">Low</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Btn kind="ghost" onClick={() => setStep(2)}><ChevronLeft size={18} aria-hidden="true" />{t('c.back')}</Btn>
            <Btn bg={pillar.color} fg={pillar.on} onClick={() => setStep(4)}>{t('i.toQuiz')}</Btn>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="lf-pop relative" key={qi}>
          {right && <Confetti />}
          <h2 className="font-bold text-sm" style={{ color: pillar.ink }}>{t('i.quiz.title', { a: qi + 1 })}</h2>
          <p className="font-semibold text-base mt-1">{t(`q.${q.id}`)}</p>
          <div className="grid gap-2 mt-3">
            {q.opts.map((o) => (
              <Btn key={o} kind="ghost" className="justify-start text-left" aria-pressed={ans === o} disabled={right && ans !== o} onClick={() => answer(o)}
                style={ans === o ? { background: right ? C.goodBg : C.blush, borderColor: right ? C.good : C.burgundy } : undefined}>
                {ans === o && (right ? <Check size={18} aria-hidden="true" className="shrink-0" /> : <Lightbulb size={18} aria-hidden="true" className="shrink-0" />)}{t(`q.${q.id}.${o}`)}
              </Btn>
            ))}
          </div>
          {ans && (right
            ? <Feedback tone="good" title={t(firstTry[q.id] ? 'fb.good' : 'fb.comeback')} why={t(`q.${q.id}.why`)}><Btn bg={pillar.color} fg={pillar.on} onClick={nextQ}>{t(qi < 2 ? 'c.next' : 'c.finish')}<ChevronRight size={18} aria-hidden="true" /></Btn></Feedback>
            : <Feedback tone="learn" title={t('fb.rethink')} why={t('q.rethink')}><Btn kind="ghost" onClick={() => setAns(null)}><RotateCcw size={18} aria-hidden="true" />{t('c.tryAgain')}</Btn></Feedback>)}
        </Card>
      )}

      {step === 5 && (
        <Summary pillar={pillar} score={score} learned={['i.l1', 'i.l2', 'i.l3']} onRetry={restart}>
          <p className="text-xs font-semibold mt-3 rounded-lg p-2" style={{ background: C.blush, color: C.burgundy }}>ⓘ {t('i.disclaimer')}</p>
        </Summary>
      )}
    </section>
  );
}

/* ---------- Pillar 4: Stay Financially Safe ---------- */

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Renders message text; [[phrases]] become highlighted flags when `show` is on.
const Marked = ({ text, show, good }) => text.split(/\[\[|\]\]/).map((part, i) => (
  i % 2 && show
    ? <mark key={i} className="font-bold rounded px-0.5" style={{ background: good ? '#BFE8D0' : '#FFD9A8', textDecoration: 'underline', textDecorationStyle: good ? 'solid' : 'wavy' }}>{good ? '✓' : '⚑'} {part}</mark>
    : <React.Fragment key={i}>{part}</React.Fragment>
));

function SafeGame() {
  const { t, P, d } = useApp(); const pillar = PILLARS[3];
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState(() => shuffle(P.scams));
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [firstTry, setFirstTry] = useState({});
  const [retried, setRetried] = useState(false);
  const [score, setScore] = useState(0);
  useScrollTop(step);

  const id = order[idx]; const sc = SCENARIOS[id]; const isScam = sc.ans === 'block';
  const right = choice === sc.ans; const wrong = choice && !right;
  const hits = Object.values(firstTry).filter(Boolean).length; const seen = Object.keys(firstTry).length;
  const live = seen ? Math.round((100 * hits) / seen) : 100;

  const choose = (c) => {
    const ok = c === sc.ans; const first = !(id in firstTry);
    d({ type: 'attempt', v: { id, choice: c, ok, first } });
    if (first) setFirstTry((f) => ({ ...f, [id]: ok }));
    if (ok) {
      playCorrectSound();
      d({ type: 'xp', n: 10, key: `f:${id}` });
      if (first) d({ type: 'xp', n: 5, key: `f:${id}:first` });
      else setRetried(true);
    } else {
      playWrongSound();
    }
    setChoice(c); setReveal(!ok);
  };
  const next = () => {
    if (idx < order.length - 1) { setIdx(idx + 1); setChoice(null); setReveal(false); return; }
    const s = Math.round((100 * hits) / order.length);
    setScore(s); d({ type: 'finish', id: 'safe', score: s, retried }); setStep(2);
  };
  const restart = () => { setOrder(shuffle(P.scams)); setIdx(0); setChoice(null); setReveal(false); setFirstTry({}); setRetried(true); setStep(1); };
  const ACTIONS = [['block', Ban, C.burgundy], ['share', Share2, C.ink], ['genuine', Check, C.dteal]];

  return (
    <section>
      <PillarHead pillar={pillar} step={step} steps={3} />
      {step === 0 && <Story pillar={pillar} text={t(`f.story.${P.id}`)} cta={t('c.start')} onStart={() => { d({ type: 'begin', id: 'safe' }); setStep(1); }} />}

      {step === 1 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-bold">{t('f.count', { a: idx + 1, b: order.length })}</span>
            <span className="text-sm font-semibold inline-flex items-center gap-1"><ShieldCheck size={16} aria-hidden="true" />{t('f.safety')}: {live}%</span>
          </div>
          <div className="flex gap-1 mb-3" aria-hidden="true">
            {order.map((o, i) => <span key={o} className="flex-1 rounded-full" style={{ height: 6, background: i < idx ? C.ink : i === idx ? pillar.color : '#E3DADB' }} />)}
          </div>

          <div key={id} className="lf-pop relative rounded-3xl p-2" style={{ background: C.ink }}>
            {right && <Confetti />}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#ECE5DD' }}>
              <div className="flex items-center gap-2 px-3 py-2 text-white" style={{ background: sc.ch === 'sms' ? '#3A4A5C' : C.dteal }}>
                <span className="inline-flex items-center justify-center rounded-full bg-white text-lg shrink-0" style={{ width: 36, height: 36 }} aria-hidden="true">{sc.e}</span>
                <span className="min-w-0 flex-1"><span className="block font-bold text-sm leading-tight break-all">{t(`sc.${id}.from`)}</span><span className="block text-xs">{t(`f.ch.${sc.ch}`)}</span></span>
              </div>
              <div className="p-3" style={{ minHeight: 150 }}>
                <div className="bg-white rounded-2xl p-3 shadow-sm text-base" style={{ borderTopLeftRadius: 4, maxWidth: '92%' }}>
                  {sc.ch === 'upi' && <div className="font-bold mb-1">💸 {t('f.upi.req', { amt: inr(sc.amt) })}</div>}
                  <p><Marked text={t(`sc.${id}`)} show={reveal} good={!isScam} /></p>
                  {sc.ch === 'upi' && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm font-bold text-center" aria-hidden="true">
                      <span className="rounded-lg py-1" style={{ border: `2px solid ${C.muted}` }}>{t('f.upi.decline')}</span>
                      <span className="rounded-lg py-1 text-white" style={{ background: C.dteal }}>{t('f.upi.approve')}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: C.muted }}>{t('f.sample')}</p>
              </div>
            </div>
          </div>

          {!choice && (
            <div className="grid gap-2 mt-3">
              {ACTIONS.map(([a, Icon, col]) => (
                <Btn key={a} kind="ghost" className="justify-start text-left" style={{ borderColor: col, color: col, minHeight: 52 }} onClick={() => choose(a)}><Icon size={20} aria-hidden="true" className="shrink-0" />{t(`f.${a}`)}</Btn>
              ))}
            </div>
          )}

          {right && (
            <Feedback tone="good" title={firstTry[id] ? t(isScam ? 'f.correct.scam' : 'f.correct.gen') : t('fb.comeback')} why={t(`sc.${id}.why`)} real={t(`r.${sc.rule}`)} realLabel={t('f.rule')}>
              <Btn kind="ghost" aria-pressed={reveal} onClick={() => setReveal(!reveal)}><Eye size={18} aria-hidden="true" />{t(isScam ? 'f.reveal' : 'f.revealGood')}</Btn>
              <Btn bg={C.burgundy} onClick={next}>{t(idx < order.length - 1 ? 'c.next' : 'c.finish')}<ChevronRight size={18} aria-hidden="true" /></Btn>
              {reveal && <p className="text-sm w-full">{t(isScam ? 'f.flags' : 'f.goodSigns')}</p>}
            </Feedback>
          )}

          {wrong && (
            <div role="status" aria-live="polite" className="lf-pop rounded-2xl p-4 mt-3" style={{ background: C.blush }}>
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: C.burgundy }}><Lightbulb size={22} aria-hidden="true" />{t('f.pause')}</h2>
              {isScam ? (
                <>
                  <p className="text-sm mt-1">{t('f.pause.sub')}</p>
                  <ol className="grid gap-2 mt-2">
                    {['hook', 'pressure', 'extract'].map((k, i) => (
                      <li key={k} className="flex gap-2 bg-white rounded-xl p-2 text-sm">
                        <span className="inline-flex items-center justify-center rounded-full font-bold text-white shrink-0" style={{ width: 26, height: 26, background: C.burgundy }}>{i + 1}</span>
                        <span><b>{t(`f.${k}`)}:</b> {t(`f.${k}.d`)}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : <p className="text-sm mt-1">{t('f.genuineMiss')}</p>}
              <p className="text-sm mt-2"><b>{t('c.why')}</b> {t(`sc.${id}.why`)}</p>
              <p className="text-sm mt-1">{t(isScam ? 'f.flags' : 'f.goodSigns')}</p>
              <p className="font-bold mt-2 rounded-xl p-2 bg-white" style={{ color: C.burgundy }}>🔑 {t('f.rule')}: {t(`r.${sc.rule}`)}</p>
              <Btn className="w-full mt-3" onClick={() => { setChoice(null); setReveal(false); }}><RotateCcw size={18} aria-hidden="true" />{t('c.tryAgain')}</Btn>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <Summary pillar={pillar} score={score} learned={['f.l1', 'f.l2', 'f.l3']} onRetry={restart}>
          <p className="text-sm font-semibold mt-3">{t('f.safety')}: {score}% ({t('f.firstTry')})</p>
        </Summary>
      )}
    </section>
  );
}

/* ============================================================================
   5. NGO ADMIN SCREENS (sample data only)
   ========================================================================== */

const SAMPLE_SIZE = 60; const TARGET = 1500; const SCALE = 24; // each sample record stands for 24 students

function mulberry32(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const actionFor = (r) => (r.safety != null && r.safety < 60 ? 'refresher' : r.inactive >= 7 ? 'inactive' : r.modules === 4 && r.safety >= 80 ? 'ready' : null);

// Seeded once at load, so numbers never change between renders. IDs are anonymous codes.
const SAMPLE = (() => {
  const rnd = mulberry32(20260412); const rows = []; const stay = [0.93, 0.86, 0.82, 0.8]; const tilt = [8, 0, -7, -3];
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const batch = i % 6; const persona = rnd() < 0.5 ? 'arjun' : 'priya'; const lang = rnd() < 0.6 ? 'te' : 'en';
    const skill = 48 + rnd() * 42; const scores = [null, null, null, null]; let modules = 0;
    for (let k = 0; k < 4; k++) { if (rnd() > stay[k]) break; modules = k + 1; scores[k] = Math.round(clamp(skill + (rnd() - 0.5) * 30 + tilt[k], 20, 100)); }
    const row = {
      id: `HYD-B${batch + 1}-${String(((i * 37 + 412) % 900) + 100).padStart(4, '0')}`, batch, persona, lang, modules, scores, safety: scores[3],
      weeks: Array.from({ length: 8 }, (_, w) => rnd() < 0.3 + w * 0.07),
      conf: Object.fromEntries(CONFUSION.map(([key, count, stride], j) => [key, (i * stride + j * 5) % SAMPLE_SIZE < count])),
    };
    row.inactive = row.weeks[7] ? Math.floor(rnd() * 7) : 7 + Math.floor(rnd() * 11); // days since last activity, consistent with week 8
    row.action = actionFor(row); rows.push(row);
  }
  return rows;
})();

const ACTION_LOOK = {
  refresher: { bg: C.blush, fg: C.burgundy, Icon: ShieldCheck },
  inactive: { bg: '#FEF5D6', fg: '#6B4F00', Icon: Info },
  ready: { bg: C.goodBg, fg: C.good, Icon: Star },
};
const COLS = [
  ['id', (r) => r.id], ['persona', (r) => r.persona], ['modules', (r) => r.modules],
  ['safety', (r) => (r.safety == null ? -1 : r.safety)], ['lang', (r) => r.lang], ['action', (r) => r.action || ''],
];
const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
const num = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n));

const ChartCard = ({ title, summary, children }) => (
  <Card>
    <h3 className="font-bold">{title}</h3>
    <div role="img" aria-label={`${title}. ${summary}`} className="mt-3">{children}</div>
    <p className="text-sm mt-3" style={{ color: C.muted }}>{summary}</p>
  </Card>
);

const HBar = ({ label, value, max, color, text }) => (
  <div>
    <div className="flex justify-between gap-2 text-sm"><span className="font-semibold">{label}</span><span>{text}</span></div>
    <div className="rounded overflow-hidden mt-0.5" style={{ height: 14, background: '#F1EAEB' }} title={`${label}: ${text}`}>
      <div className="lf-bar h-full" style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color, borderRadius: '0 4px 4px 0' }} />
    </div>
  </div>
);

function TrendChart({ data, t }) {
  const W = 320; const H = 150; const L = 38; const R = 34; const T = 14; const B = 24;
  const max = Math.max(...data, 1); const X = (i) => L + ((W - L - R) * i) / (data.length - 1); const Y = (v) => H - B - ((H - T - B) * v) / max;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 220 }} aria-hidden="true">
      {[0, 0.5, 1].map((f) => (
        <g key={f}><line x1={L} x2={W - R} y1={Y(max * f)} y2={Y(max * f)} stroke="#E3DADB" strokeWidth="1" />
          <text x={L - 6} y={Y(max * f) + 4} textAnchor="end" fontSize="10" fill={C.muted}>{num(max * f)}</text></g>
      ))}
      <path d={data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('')} fill="none" stroke={C.burgundy} strokeWidth="2" strokeLinejoin="round" />
      {data.map((v, i) => (
        <g key={i}>
          <circle cx={X(i)} cy={Y(v)} r="4" fill={C.burgundy} stroke="#fff" strokeWidth="2"><title>{`${t('a.c.week', { n: i + 1 })}: ${num(v)}`}</title></circle>
          <text x={X(i)} y={H - 8} textAnchor="middle" fontSize="10" fill={C.muted}>{t('a.c.week', { n: i + 1 })}</text>
        </g>
      ))}
      <text x={X(data.length - 1) + 7} y={Y(data[data.length - 1]) + 4} fontSize="11" fontWeight="700" fill={C.ink}>{num(data[data.length - 1])}</text>
    </svg>
  );
}

function Admin() {
  const { s, d, t, run } = useApp();
  const [f, setF] = useState({ batch: 'all', lang: 'all', action: false, q: '' });
  const [sort, setSort] = useState({ key: 'id', dir: 1 });
  const [page, setPage] = useState(0);
  const [csv, setCsv] = useState(null); const [note, setNote] = useState(false); const [copied, setCopied] = useState(false);
  const area = useRef(null);
  const filter = (patch) => { setF((x) => ({ ...x, ...patch })); setPage(0); };
  const query = f.q.trim().toLowerCase();

  const rows = useMemo(() => SAMPLE.filter((r) => (f.batch === 'all' || r.batch === +f.batch) && (f.lang === 'all' || r.lang === f.lang)
    && (!f.action || r.action) && r.id.toLowerCase().includes(query)), [f.batch, f.lang, f.action, query]);

  // Live row mirroring the current student session, so the two roles feel connected.
  const you = useMemo(() => {
    if (!run) return null;
    const scores = PILLARS.map((p) => (run.prog[p.id].st === 2 ? run.prog[p.id].best : null));
    const r = { id: 'YOU-DEMO', you: true, batch: -1, persona: s.persona, lang: s.lang, scores, modules: scores.filter((v) => v != null).length, safety: run.safety, inactive: 0 };
    return { ...r, action: actionFor(r) };
  }, [run, s.persona, s.lang]);

  const table = useMemo(() => {
    const get = COLS.find((c) => c[0] === sort.key)[1];
    const sorted = [...rows].sort((a, b) => { const x = get(a); const y = get(b); return (x < y ? -1 : x > y ? 1 : a.id < b.id ? -1 : 1) * sort.dir; });
    const showYou = you && (!query || 'you-demo'.includes(query) || t('a.you').toLowerCase().includes(query)) && (!f.action || you.action);
    return showYou ? [you, ...sorted] : sorted;
  }, [rows, sort, you, query, f.action, t]);

  const n = rows.length; const pages = Math.max(1, Math.ceil(table.length / 10)); const pg = Math.min(page, pages - 1);
  const safeties = rows.filter((r) => r.safety != null).map((r) => r.safety);
  const kpis = [
    ['cohort', num(n * SCALE), t('a.k.cohort.s', { n: num(TARGET) }), Users],
    ['active', num(rows.filter((r) => r.inactive < 7).length * SCALE), t('a.k.active.s'), Flame],
    ['done', `${Math.round((mean(rows.map((r) => r.modules)) / 4) * 100)}%`, t('a.k.done.s'), Target],
    ['safety', safeties.length ? `${Math.round(mean(safeties))}%` : '–', t('a.k.safety.s'), ShieldCheck],
  ];
  const avg = PILLARS.map((p, k) => Math.round(mean(rows.filter((r) => r.scores[k] != null).map((r) => r.scores[k]))));
  const funnel = [rows.filter((r) => r.modules > 0 || r.inactive < 7).length, ...PILLARS.map((p, k) => rows.filter((r) => r.modules > k).length)].map((v) => v * SCALE);
  const te = rows.filter((r) => r.lang === 'te').length; const tePct = n ? Math.round((te / n) * 100) : 0;
  const trend = Array.from({ length: 8 }, (_, w) => rows.filter((r) => r.weeks[w]).length * SCALE);
  const conf = CONFUSION.map(([key]) => ({ key, pct: n ? Math.round((rows.filter((r) => r.conf[key]).length / n) * 100) : 0 })).sort((a, b) => b.pct - a.pct);
  const langName = (l) => (l === 'te' ? 'తెలుగు' : 'English');

  const buildCsv = () => {
    const head = ['student_id', 'school_batch', 'persona', 'modules_completed', 'safety_score', 'language', 'action_required'];
    const body = table.map((r) => [r.id, r.you ? 'demo' : `Partner School ${'ABCDEF'[r.batch]}`, r.persona, `${r.modules}/4`, r.safety ?? '', r.lang.toUpperCase(), r.action || 'none']);
    return [head, ...body].map((line) => line.join(',')).join('\n');
  };
  const exportCsv = () => {
    const text = buildCsv(); setNote(true);
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'lakshya-finlit-students.csv';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setCsv(text); } // downloads blocked: show a copyable dialog instead
  };
  const copyCsv = () => {
    try { area.current.select(); } catch (e) { /* ignore */ }
    try { navigator.clipboard.writeText(csv).then(() => setCopied(true), () => { try { setCopied(document.execCommand('copy')); } catch (err) { /* ignore */ } }); }
    catch (e) { try { setCopied(document.execCommand('copy')); } catch (err) { /* ignore */ } }
  };

  const field = 'w-full rounded-xl px-3 bg-white text-base';
  const fieldStyle = { minHeight: 48, border: '2px solid #CFC4C6' };
  return (
    <div className="mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold" style={{ color: C.burgundy }}>{t('a.title')}</h1>
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.amber, color: C.ink }}>{t('a.sample')}</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => d({ type: 'role', v: 'student' })}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer">
            {t('role.student')}
          </button>
          <Btn kind="ghost" onClick={() => d({ type: 'logout' })}>Log Out</Btn>
        </div>
      </div>
      <p className="text-sm mt-1 flex items-start gap-1" style={{ color: C.muted }}><Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0" />{t('a.demo')}</p>

      <Card className="mt-4">
        <h2 className="sr-only">{t('a.filters')}</h2>
        <div className="grid gap-3 items-end grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-semibold">{t('a.f.batch')}
            <select className={`${field} mt-1`} style={fieldStyle} value={f.batch} onChange={(e) => filter({ batch: e.target.value })}>
              <option value="all">{t('a.f.all')}</option>
              {'ABCDEF'.split('').map((x, i) => <option key={x} value={i}>{t('a.school', { x })}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">{t('a.f.lang')}
            <select className={`${field} mt-1`} style={fieldStyle} value={f.lang} onChange={(e) => filter({ lang: e.target.value })}>
              <option value="all">{t('a.f.all')}</option><option value="en">English</option><option value="te">తెలుగు</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">{t('a.f.search')}
            <span className="relative block mt-1">
              <Search size={18} aria-hidden="true" className="absolute" style={{ left: 12, top: 15, color: C.muted }} />
              <input type="search" className={field} style={{ ...fieldStyle, paddingLeft: 38 }} placeholder="HYD-B2-0412" value={f.q} onChange={(e) => filter({ q: e.target.value })} />
            </span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex-1 flex items-center gap-2 rounded-xl px-3 text-sm font-semibold bg-white" style={fieldStyle}>
              <input type="checkbox" checked={f.action} onChange={(e) => filter({ action: e.target.checked })} />{t('a.f.action')}
            </label>
            <Btn kind="ghost" className="text-sm" onClick={() => filter({ batch: 'all', lang: 'all', action: false, q: '' })}><X size={16} aria-hidden="true" />{t('a.f.clear')}</Btn>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 mt-3 grid-cols-2 lg:grid-cols-4">
        {kpis.map(([key, value, sub, Icon]) => (
          <Card key={key}>
            <div className="text-sm font-semibold flex items-center gap-1" style={{ color: C.muted }}><Icon size={16} aria-hidden="true" />{t(`a.k.${key}`)}</div>
            <div className="text-3xl font-bold mt-1">{value}</div>
            <div className="text-xs" style={{ color: C.muted }}>{sub}</div>
            {key === 'cohort' && (
              <div className="rounded-full overflow-hidden mt-2" style={{ height: 6, background: '#F1EAEB' }} aria-hidden="true">
                <div className="lf-bar h-full rounded-full" style={{ width: `${clamp(((n * SCALE) / TARGET) * 100, 0, 100)}%`, background: C.burgundy }} />
              </div>
            )}
          </Card>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: C.muted }}>{t('a.scaled', { n })}</p>

      {n === 0 ? <Card className="mt-3 text-center"><p className="font-semibold py-6">🔍 {t('a.empty')}</p></Card> : (
        <>
          <div className="grid gap-3 mt-3 grid-cols-1 md:grid-cols-2">
            <ChartCard title={t('a.c.score')} summary={t('a.c.score.sum', { list: PILLARS.map((p, k) => `${t(`pl.${p.id}`)} ${avg[k]}%`).join(', ') })}>
              <div className="grid grid-cols-4 gap-3 items-end" style={{ height: 150 }}>
                {PILLARS.map((p, k) => (
                  <div key={p.id} className="h-full flex flex-col justify-end items-center" title={`${t(`pl.${p.id}`)}: ${avg[k]}%`}>
                    <span className="text-sm font-bold">{avg[k]}%</span>
                    <div className="lf-bar w-full" style={{ height: `${avg[k] * 0.8}%`, maxWidth: 28, background: p.color, borderRadius: '4px 4px 0 0' }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3 pt-1 text-center text-xs font-semibold leading-tight" style={{ borderTop: `1px solid ${C.line}` }}>
                {PILLARS.map((p, k) => <span key={p.id}>{k + 1}. {t(`tab.${p.id}`)}</span>)}
              </div>
            </ChartCard>
            <ChartCard title={t('a.c.funnel')} summary={t('a.c.funnel.sum', { a: num(funnel[0]), b: num(funnel[4]) })}>
              <div className="grid gap-2">
                <HBar label={t('a.c.started')} value={funnel[0]} max={funnel[0]} color={C.burgundy} text={num(funnel[0])} />
                {PILLARS.map((p, k) => <HBar key={p.id} label={`${k + 1}. ${t(`pl.${p.id}`)}`} value={funnel[k + 1]} max={funnel[0]} color={p.color} text={num(funnel[k + 1])} />)}
              </div>
            </ChartCard>
            <ChartCard title={t('a.c.lang')} summary={t('a.c.lang.sum', { te: tePct, en: 100 - tePct })}>
              <div className="flex rounded overflow-hidden" style={{ height: 28, gap: 2 }}>
                {tePct > 0 && <div className="lf-bar h-full" style={{ width: `${tePct}%`, background: C.burgundy }} title={`తెలుగు: ${tePct}%`} />}
                {tePct < 100 && <div className="lf-bar h-full flex-1" style={{ background: '#9FB0AE' }} title={`English: ${100 - tePct}%`} />}
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm font-semibold">
                <li className="flex items-center gap-2"><span className="inline-block rounded-sm" style={{ width: 12, height: 12, background: C.burgundy }} aria-hidden="true" />తెలుగు {tePct}% · {num(te * SCALE)}</li>
                <li className="flex items-center gap-2"><span className="inline-block rounded-sm" style={{ width: 12, height: 12, background: '#9FB0AE' }} aria-hidden="true" />English {100 - tePct}% · {num((n - te) * SCALE)}</li>
              </ul>
            </ChartCard>
            <ChartCard title={t('a.c.trend')} summary={t('a.c.trend.sum', { a: num(trend[0]), b: num(trend[7]) })}><TrendChart data={trend} t={t} /></ChartCard>
          </div>

          <Card className="mt-3">
            <h2 className="font-bold text-lg flex items-center gap-2"><Lightbulb size={20} aria-hidden="true" style={{ color: C.burgundy }} />{t('a.conf.title')}</h2>
            <ol className="grid gap-3 mt-3 grid-cols-1 md:grid-cols-2">
              {conf.map((c, i) => (
                <li key={c.key} className="rounded-xl p-3" style={{ background: '#FBF7F6', border: `1px solid ${C.line}` }}>
                  <div className="flex gap-2 font-semibold"><span className="inline-flex items-center justify-center rounded-full text-white text-sm shrink-0" style={{ width: 26, height: 26, background: C.burgundy }}>{i + 1}</span><span>{t(`cf.${c.key}`, { n: c.pct })}</span></div>
                  <div className="rounded overflow-hidden mt-2" style={{ height: 10, background: '#EFE6E7' }} aria-hidden="true"><div className="lf-bar h-full" style={{ width: `${c.pct}%`, background: C.red, borderRadius: '0 4px 4px 0' }} /></div>
                  <p className="text-sm mt-2"><b>{t('a.conf.try')}:</b> {t(`cf.${c.key}.a`)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}

      <Card className="mt-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <h2 className="font-bold text-lg">{t('a.t.title')} <span className="text-sm font-semibold" style={{ color: C.muted }}>({t('a.c.students', { n: table.length })})</span></h2>
          <Btn bg={C.burgundy} className="text-sm" onClick={exportCsv}><Download size={18} aria-hidden="true" />{t('a.export')}</Btn>
        </div>
        {note && (
          <p role="status" className="text-sm mt-2 flex flex-wrap items-center gap-2">{t('a.export.ok')}
            <button type="button" className="underline font-semibold" style={{ minHeight: 44, background: 'transparent', border: 0, color: C.burgundy }} onClick={() => { setCopied(false); setCsv(buildCsv()); }}>{t('a.export.alt')}</button>
          </p>
        )}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm text-left" style={{ minWidth: 680, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.burgundy}` }}>
                {COLS.map(([key]) => (
                  <th key={key} scope="col" aria-sort={sort.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'} className="p-0">
                    <button type="button" aria-label={t('a.sort', { col: t(`a.t.${key}`) })} onClick={() => { setSort((x) => ({ key, dir: x.key === key ? -x.dir : 1 })); setPage(0); }}
                      className="w-full flex items-center gap-1 px-2 font-bold text-left" style={{ minHeight: 44, background: 'transparent', border: 0, color: C.ink }}>
                      {t(`a.t.${key}`)}<ArrowUpDown size={14} aria-hidden="true" style={{ opacity: sort.key === key ? 1 : 0.4 }} />{sort.key === key && <span aria-hidden="true">{sort.dir > 0 ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.slice(pg * 10, pg * 10 + 10).map((r) => {
                const look = ACTION_LOOK[r.action];
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.line}`, background: r.you ? C.blush : 'transparent' }}>
                    <td className="px-2 py-2 font-semibold whitespace-nowrap">{r.you ? <span>⭐ {t('a.you')}<span className="block text-xs font-normal" style={{ color: C.muted }}>{t('a.you.note')}</span></span> : r.id}</td>
                    <td className="px-2 py-2">{PERSONAS[r.persona].e} {t(`per.${r.persona}.name`)}</td>
                    <td className="px-2 py-2">
                      <span className="font-semibold">{r.modules}/4</span>
                      <span className="flex mt-1" style={{ gap: 2, width: 72 }} aria-hidden="true">
                        {PILLARS.map((p, k) => <span key={p.id} className="flex-1 rounded-sm" style={{ height: 6, background: r.scores[k] != null ? p.color : '#E3DADB' }} />)}
                      </span>
                    </td>
                    <td className="px-2 py-2">{r.safety == null ? <span style={{ color: C.muted }}>{t('a.na')}</span> : <b>{r.safety}%</b>}</td>
                    <td className="px-2 py-2">{langName(r.lang)}</td>
                    <td className="px-2 py-2">
                      {look ? <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold" style={{ background: look.bg, color: look.fg }}><look.Icon size={12} aria-hidden="true" />{t(`a.act.${r.action}`)}</span>
                        : <span style={{ color: C.muted }}>{t('a.act.none')}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {table.length === 0 && <p className="text-center font-semibold py-6">🔍 {t('a.empty')}</p>}
        <div className="flex items-center justify-between gap-2 mt-3">
          <Btn kind="ghost" className="text-sm" disabled={pg === 0} onClick={() => setPage(pg - 1)}><ChevronLeft size={16} aria-hidden="true" />{t('a.prev')}</Btn>
          <span className="text-sm font-semibold" role="status">{t('a.page', { a: pg + 1, b: pages })}</span>
          <Btn kind="ghost" className="text-sm" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>{t('a.next')}<ChevronRight size={16} aria-hidden="true" /></Btn>
        </div>
      </Card>
      <Footer />

      {csv != null && (
        <Modal title={t('a.export.title')} onClose={() => setCsv(null)}>
          <p className="text-sm">{t('a.export.d')}</p>
          <textarea ref={area} readOnly value={csv} aria-label={t('a.export.title')} className="w-full mt-2 rounded-xl p-2 text-xs font-mono" style={{ height: 180, border: '2px solid #CFC4C6' }} onFocus={(e) => e.target.select()} />
          <Btn className="w-full mt-2" bg={C.burgundy} onClick={copyCsv}>{copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}{t(copied ? 'a.copied' : 'a.copy')}</Btn>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================================
   6. APP
   ========================================================================== */

export default function App({ initial }) {
  const [s, d] = useReducer(reducer, initial, loadState);
  const root = useRef(null);
  const t = useMemo(() => makeT(s.lang), [s.lang]);
  const P = s.persona ? PERSONAS[s.persona] : null;
  const run = P ? s.runs[s.persona] : null;
  const inGame = !!P && s.screen !== 'welcome' && s.screen !== 'persona' && s.screen !== 'landing';

  useEffect(() => { saveState(s); }, [s]);
  useScrollTop(`${s.screen}|${s.role}`);
  useEffect(() => { // expose the sticky header height so sticky panels can sit just below it
    const el = root.current; if (!el) return undefined;
    const set = () => { const h = el.querySelector('header'); if (h) el.style.setProperty('--lf-top', `${h.offsetHeight}px`); };
    set(); window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, [s.lang]);

  const screens = [
    ['home', HomeScreen],
    ['budget-planner', BudgetPlannerScreen],
    ['goals', GoalsScreen],
    ['invest-sim', InvestingSimulatorScreen],
    ['quiz', ScamQuizScreen],
    ['modules', LearningModulesHub],
    ['terms', FinancialTermsScreen],
    ['budget', BudgetGame],
    ['save', SaveGame],
    ['invest', InvestGame],
    ['safe', SafeGame],
    ['achievements', AchievementsScreen],
    ['settings', SettingsScreen],
  ];

  if (typeof window !== 'undefined') {
    window.__LF_DISPATCH = d;
  }

  return (
    <Ctx.Provider value={{ s, d, t, P, run }}>
      <div ref={root} className="lf min-h-screen bg-slate-50 font-sans text-slate-900" lang={s.lang}>
        <style>{STYLE}</style>
        <div hidden={s.role !== 'admin'}>
          <TopBar />
          <Admin />
        </div>
        <div hidden={s.role !== 'student'}>
          {s.screen === 'landing' && <LandingPage />}
          {s.screen === 'welcome' && <Welcome />}
          {s.screen === 'persona' && (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
              <TopBar />
              <main className="flex-1 p-4"><PersonaPick /></main>
              <Footer />
            </div>
          )}
          {inGame && (
            <div className="min-h-screen flex flex-col bg-slate-100/70">
              <div className="flex-1 flex w-full">
                {/* Desktop Sidebar (FinLeap Deep Forest Green) */}
                <div className="hidden md:flex shrink-0">
                  <StudentSidebar />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  <StudentTopBar />
                  <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {P && (
                      <div key={`${s.persona}-${s.epoch}`}>
                        {screens.map(([id, Screen]) => (
                          <div key={id} hidden={s.screen !== id}>
                            <Screen />
                          </div>
                        ))}
                      </div>
                    )}
                    <Footer />
                  </main>

                  {/* Mobile TabBar */}
                  <div className="md:hidden sticky bottom-0 z-30">
                    <TabBar />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}

// Named exports are used only by scripts/smoke.mjs.
export { DICT, PERSONAS, SCENARIOS, QUIZ };
