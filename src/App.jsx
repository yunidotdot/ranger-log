import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  Crown,
  Database,
  Download,
  Dumbbell,
  Droplets,
  Flame,
  Heart,
  Lock,
  Map,
  Plus,
  Save,
  ScrollText,
  Shield,
  Star,
  Swords,
  Trash2,
  Trophy,
  Upload,
  Utensils,
  Weight,
} from "lucide-react";

const STORAGE_KEY = "ranger-log-save-v3";

const TEMPLATE_SAVE = {
  profile: {
    name: "The Ranger",
    className: "Endurance Specialist",
    path: "Path of the Iron Will",
    age: null,
    height: "",
    startWeight: null,
    currentWeight: null,
    goalWeight: null,
    importedXp: 0,
    importedLabel: "No imported snapshot yet",
  },
  meta: {
    currentDay: 1,
    lastUpdated: null,
    nextWorkout: "Day A",
  },
  manualUnlocks: {
    firstEntry: false,
    trailBlazer: false,
    firstWeighIn: false,
    firstWorkout: false,
    firstPlank: false,
    switchedTo2x15: false,
    firstProteinGoal: false,
    aboveTheFloor: false,
    overdrive: false,
    firstMealPrep: false,
    firstWaterGoal: false,
    monsoon: false,
    stepSeeker: false,
    weekendScout: false,
    firstCleanWeekend: false,
    airFryerBatch: false,
    standardizedPortions: false,
    pushupTestPassed: false,
  },
  presets: [],
  days: [],
  importedNotes: "",
  promise: {
    title: "Final Promise",
    subtitle: "Legendary · Hidden · Final",
    flavor: "A final promise, locked until the journey is complete.",
    made: "",
    by: "The Ranger",
    for: "",
    locked: true,
  },
};

const levels = [
  [1, "🌱 Wanderer", 0, 0],
  [2, "🏹 Recruit Ranger", 500, 500],
  [3, "🌲 Initiated Ranger", 700, 1200],
  [4, "🦌 Seasoned Tracker", 1300, 2500],
  [5, "🗺️ Pathfinder", 1800, 4300],
  [6, "🌿 Woodsman", 2200, 6500],
  [7, "🏕️ Trail Runner", 2500, 9000],
  [8, "🦅 Scout Ranger", 3000, 12000],
  [9, "⚔️ Tested Ranger", 3500, 15500],
  [10, "🛡️ Iron Ranger", 4000, 19500],
  [11, "🌙 Night Stalker", 4500, 24000],
  [12, "🗡️ Blade of the Forest", 5000, 29000],
  [13, "🌲 Forest Guardian", 5500, 34500],
  [14, "🏔️ Highland Scout", 6000, 40500],
  [15, "⚡ Storm Ranger", 6500, 47000],
  [16, "🌊 Tide Walker", 7000, 54000],
  [17, "🦁 Apex Stalker", 7500, 61500],
  [18, "🌟 Elite Ranger", 8000, 69500],
  [19, "🔥 Firebrand", 8500, 78000],
  [20, "💎 Diamond Ranger", 9000, 87000],
  [21, "🌌 Void Walker", 9500, 96500],
  [22, "⚔️ Warbringer", 10000, 106500],
  [23, "🏹 Deadeye", 10000, 116500],
  [24, "🛡️ Ironclad", 10500, 127000],
  [25, "👑 Ranger Lord", 11000, 138000],
  [26, "🌿 Ancient One", 11000, 149000],
  [27, "🦅 Skywarden", 11500, 160500],
  [28, "⚡ Stormcaller", 12000, 172500],
  [29, "🌋 Earthshaker", 12500, 185000],
  [30, "🌟 Legendary Ranger", 13000, 198000],
  [31, "💫 Myth", 13000, 211000],
  [32, "🔮 Arcane Ranger", 13500, 224500],
  [33, "🌌 Star Ranger", 14000, 238500],
  [34, "👁️ The Watchful", 14000, 252500],
  [35, "⚔️ Champion", 14500, 267000],
  [36, "🏆 The Unbroken", 15000, 282000],
  [37, "🌟 Paragon", 15000, 297000],
  [38, "💎 The Ascendant", 15500, 312500],
  [39, "👑 The Eternal", 16000, 328500],
  [40, "🏹 THE RANGER'S OATH", 16500, 345000],
];

const workouts = {
  "Day A": [
    ["Dumbbell Curl", "2×15 · 15 lb"],
    ["Overhead Press", "2×15 · 15 lb"],
    ["Bent-Over Row", "2×15 · 15 lb"],
    ["Lateral Raise", "2×15 · 5 lb"],
  ],
  "Day B": [
    ["Goblet Squat", "2×10 · 30 lb"],
    ["Dumbbell Deadlift", "2×10 · 22 lb"],
    ["Plank", "2×30 sec"],
  ],
};

const tabs = [
  ["character", "⚔️ Character", Swords],
  ["quick", "📝 Quick Log", Plus],
  ["quests", "📜 Quests", ScrollText],
  ["achievements", "🏆 Achievements", Trophy],
  ["levels", "📈 Levels", Activity],
  ["titles", "👑 Titles", Crown],
  ["data", "💾 Data", Database],
  ["promise", "🤍 Promise", Heart],
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeIsoDate(input, fallback = todayKey()) {
  const d = new Date(`${input} 12:00:00`);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) return "No snapshot imported";
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function normalizeSave(save) {
  return {
    ...TEMPLATE_SAVE,
    ...save,
    profile: { ...TEMPLATE_SAVE.profile, ...(save?.profile || {}) },
    meta: { ...TEMPLATE_SAVE.meta, ...(save?.meta || {}) },
    manualUnlocks: { ...TEMPLATE_SAVE.manualUnlocks, ...(save?.manualUnlocks || {}) },
    presets: save?.presets || TEMPLATE_SAVE.presets,
    days: save?.days || [],
    promise: { ...TEMPLATE_SAVE.promise, ...(save?.promise || {}) },
  };
}

function readSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return TEMPLATE_SAVE;
    return normalizeSave(JSON.parse(raw));
  } catch {
    return TEMPLATE_SAVE;
  }
}

function writeSave(save) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function sortedDays(save) {
  return [...(save.days || [])].sort((a, b) => a.date.localeCompare(b.date));
}

function nextWorkout(save) {
  const completed = sortedDays(save).filter((d) => d.workoutComplete).at(-1);
  if (!completed && save.meta?.nextWorkout) return save.meta.nextWorkout;
  return completed?.workoutDay === "Day A" ? "Day B" : "Day A";
}

function blankDay(date, save) {
  return {
    date,
    weight: null,
    calories: 0,
    protein: 0,
    water: 0,
    steps: 0,
    activeMinutes: 0,
    caloriesBurned: 0,
    workoutDay: nextWorkout(save),
    workoutComplete: false,
    notes: [],
    foods: [],
  };
}

function getDay(save, date = todayKey()) {
  return save.days.find((d) => d.date === date) || blankDay(date, save);
}

function dayXp(day) {
  if (day.snapshot) return { hold: false, target: false, protein: false, water: false, workout: false, logged: true, perfect: false, total: 0 };
  const hold = (day.calories || 0) >= 1800;
  const target = (day.calories || 0) >= 2000 && (day.calories || 0) <= 2400;
  const protein = (day.protein || 0) >= 150;
  const water = (day.water || 0) >= 80;
  const workout = !!day.workoutComplete;
  const logged = !!day.date && ((day.foods?.length || 0) > 0 || (day.notes?.length || 0) > 0 || day.weight || day.water || day.steps || day.workoutComplete);
  const base = (hold ? 25 : 0) + (target ? 50 : 0) + (protein ? 75 : 0) + (water ? 50 : 0) + (workout ? 125 : 0) + (logged ? 25 : 0);
  const perfect = hold && target && protein && water && workout && logged;
  return { hold, target, protein, water, workout, logged, perfect, total: base + (perfect ? 75 : 0) };
}

function getTotalXp(save) {
  return (save.profile.importedXp || 0) + save.days.filter((d) => !d.snapshot).reduce((sum, day) => sum + dayXp(day).total, 0);
}

function getLevel(totalXp) {
  let current = levels[0];
  for (const level of levels) if (totalXp >= level[3]) current = level;
  const next = levels.find((level) => level[0] === current[0] + 1) || current;
  const xpIntoLevel = totalXp - current[3];
  const xpNeeded = next[3] - current[3] || 1;
  return { current, next, xpIntoLevel, xpNeeded, pct: Math.min(100, (xpIntoLevel / xpNeeded) * 100) };
}

function clampPct(value, max) {
  return Math.max(0, Math.min(100, ((value || 0) / max) * 100));
}

function lowestWeight(save) {
  const logged = save.days.map((d) => d.weight).filter(Boolean);
  const all = [save.profile.currentWeight, ...logged].filter(Boolean);
  return all.length ? Math.min(...all) : null;
}

function currentWeight(save, today) {
  return today.weight || sortedDays(save).map((d) => d.weight).filter(Boolean).at(-1) || save.profile.currentWeight || null;
}

function longestLoggedStreak(days) {
  const logged = [...days].filter((d) => dayXp(d).logged).sort((a, b) => a.date.localeCompare(b.date)).map((d) => d.date);
  if (!logged.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < logged.length; i++) {
    const prev = new Date(`${logged[i - 1]}T12:00:00`);
    const curr = new Date(`${logged[i]}T12:00:00`);
    const diff = Math.round((curr - prev) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

function deriveAchievements(save) {
  const days = save.days || [];
  const m = save.manualUnlocks || {};
  const loggedDays = days.filter((d) => dayXp(d).logged);
  const loggedCount = loggedDays.length;
  const perfectCount = days.filter((d) => dayXp(d).perfect).length;
  const waterCount = days.filter((d) => (d.water || 0) >= 80).length;
  const proteinCount = days.filter((d) => (d.protein || 0) >= 150).length;
  const workoutCount = days.filter((d) => d.workoutComplete).length;
  const maxStreak = longestLoggedStreak(days);
  const low = lowestWeight(save);
  const hasWeight = low !== null;
  const start = save.profile.startWeight;
  const poundsLost = start !== null && hasWeight ? start - low : 0;
  const totalWater = days.reduce((sum, d) => sum + (Number(d.water) || 0), 0);
  const totalProtein = days.reduce((sum, d) => sum + (Number(d.protein) || 0), 0);
  const totalSteps = days.reduce((sum, d) => sum + (Number(d.steps) || 0), 0);
  const totalBurned = days.reduce((sum, d) => sum + (Number(d.caloriesBurned) || 0), 0);
  const overdrive = days.some((d) => (d.protein || 0) >= 200);
  const titanProtein = days.some((d) => (d.protein || 0) >= 225);
  const monsoon = days.some((d) => (d.water || 0) >= 100);
  const floodGate = days.some((d) => (d.water || 0) >= 120);
  const stepSeeker = days.some((d) => (d.steps || 0) >= 5000);
  const roadRanger = days.some((d) => (d.steps || 0) >= 10000);
  const stepChampion = days.some((d) => (d.steps || 0) >= 15000);
  const longMarch = days.some((d) => (d.steps || 0) >= 20000);
  const floorDays = days.filter((d) => (d.calories || 0) >= 1800).length;
  const targetDays = days.filter((d) => (d.calories || 0) >= 2000 && (d.calories || 0) <= 2400).length;
  const noWorkoutButLogged = days.some((d) => dayXp(d).logged && !d.workoutComplete && (d.steps || 0) >= 5000);
  const importUsed = !!save.importedNotes || (save.profile.importedXp || 0) > 0;
  const presetsUsed = (save.presets || []).length > 0;
  const presetCount = (save.presets || []).length;
  const quickLogs = days.filter((d) => (d.notes || []).length > 0).length;
  const notesText = days.flatMap((d) => d.notes || []).join(" ").toLowerCase();
  const bikeMentioned = notesText.includes("bike") || notesText.includes("cycling") || notesText.includes("biked");
  const walkMentioned = notesText.includes("walk") || notesText.includes("walking");
  const lateNightLogged = /late night|4am|5am|night owl|stayed up/i.test(notesText);
  const airFryerMentioned = notesText.includes("air fryer") || m.airFryerBatch;
  const mealPrepMentioned = notesText.includes("meal prep") || m.firstMealPrep;
  const buffaloMentioned = notesText.includes("buffalo");
  const cleanWeekend = m.weekendScout || m.firstCleanWeekend;

  return [
    {
      name: "Consistency",
      items: [
        ["📜 First Entry", "Day 1 logged", m.firstEntry || loggedCount >= 1],
        ["🔥 Kindling Page", "3 days logged", loggedCount >= 3],
        ["⚔️ Trail Blazer", "7 days logged", m.trailBlazer || loggedCount >= 7],
        ["🗓️ Fortnight March", "14 days logged", loggedCount >= 14],
        ["🌙 Month of Moons", "30 days logged", loggedCount >= 30],
        ["🧭 Six-Week Scout", "45 days logged", loggedCount >= 45],
        ["🌿 Season's End", "60 days logged", loggedCount >= 60],
        ["🌳 Ancient Grove", "90 days logged", loggedCount >= 90],
        ["🏕️ Long Camper", "120 days logged", loggedCount >= 120],
        ["🦅 Eagle's Watch", "180 days logged", loggedCount >= 180],
        ["📚 Half-Year Archive", "200 days logged", loggedCount >= 200],
        ["🏛️ Ranger Archive", "250 days logged", loggedCount >= 250],
        ["👑 The Chronicler", "365 days logged", loggedCount >= 365],
      ],
    },
    {
      name: "Streaks",
      items: [
        ["🔥 Kindling", "3-day streak", maxStreak >= 3],
        ["🔥🔥 Burning", "7-day streak", maxStreak >= 7],
        ["⚡ Lightning Rod", "14-day streak", maxStreak >= 14],
        ["🌋 Unstoppable", "30-day streak", maxStreak >= 30],
        ["☀️ Eternal Flame", "60-day streak", maxStreak >= 60],
        ["🌌 Starlit March", "90-day streak", maxStreak >= 90],
        ["🛡️ Iron Will", "5 perfect days", perfectCount >= 5],
        ["💎 Diamond Discipline", "10 perfect days", perfectCount >= 10],
        ["🌟 Legendary", "30 perfect days", perfectCount >= 30],
        ["👑 Perfect Oath", "60 perfect days", perfectCount >= 60],
        ["🕊️ Untouched Flame", "90 perfect days", perfectCount >= 90],
      ],
    },
    {
      name: "Weight Milestones",
      items: [
        ["🏹 First Blood", "First weigh-in", m.firstWeighIn],
        ["🌲 Into the Woods", "Reach 250 lbs", hasWeight && low <= 250],
        ["⚡ Danger Zone", "Push past 247 lbs", hasWeight && low < 247],
        ["🦅 Highland Ranger", "Reach 240 lbs", hasWeight && low <= 240],
        ["🗻 Above the Clouds", "Reach 230 lbs", hasWeight && low <= 230],
        ["🏔️ Summit Seeker", "Reach 220 lbs", hasWeight && low <= 220],
        ["🌊 Breaking Wave", "Reach 210 lbs", hasWeight && low <= 210],
        ["🌟 Ranger Elite", "Reach 200 lbs", hasWeight && low <= 200],
        ["💫 The Final Mile", "Reach 190 lbs", hasWeight && low <= 190],
        ["👑 Ranger's Oath", "Reach 180 lbs", hasWeight && low <= 180],
      ],
    },
    {
      name: "Weight Loss Totals",
      items: [
        ["🪶 First Feather", "Lose 5 lbs total", poundsLost >= 5],
        ["🪨 Ten Pounds Down", "Lose 10 lbs total", poundsLost >= 10],
        ["🧱 Stonebreaker", "Lose 20 lbs total", poundsLost >= 20],
        ["⚒️ Iron Cut", "Lose 30 lbs total", poundsLost >= 30],
        ["🛡️ Forty Pounds Forged", "Lose 40 lbs total", poundsLost >= 40],
        ["🪄 50 Pounds Gone", "Lose 50 lbs total", poundsLost >= 50],
        ["🌌 Void Step", "Lose 60 lbs total", poundsLost >= 60],
        ["👑 Final Cut", "Lose 70 lbs total", poundsLost >= 70],
        ["⭐ Oathbound Body", "Lose 74+ lbs total", poundsLost >= 74],
      ],
    },
    {
      name: "Nutrition",
      items: [
        ["🍖 Meat & Iron", "First protein goal hit", m.firstProteinGoal || proteinCount >= 1],
        ["🥩 Carnivore's Path", "Protein goal 7 days", proteinCount >= 7],
        ["💪 Muscle Keeper", "Protein goal 30 days", proteinCount >= 30],
        ["🦾 Protein Bulwark", "Protein goal 60 days", proteinCount >= 60],
        ["🧬 Lean Code", "Protein goal 90 days", proteinCount >= 90],
        ["🍱 Ranger's Ration", "First meal prep batch", m.firstMealPrep],
        ["🏺 Provision Master", "Meal prep rhythm established", m.firstMealPrep && loggedCount >= 14],
        ["🍗 Air Fryer Apprentice", "First air fryer batch", m.airFryerBatch || airFryerMentioned],
        ["📐 Precise Portions", "Measured portions milestone", m.standardizedPortions],
        ["🚫 Floor Guardian", "Never below 1,800 for 14 logged days", floorDays >= 14],
        ["🌡️ Above the Floor", "Stay above 1,800 for 5 days", m.aboveTheFloor || floorDays >= 5],
        ["🧯 Crash Diet Slayer", "Stay above 1,800 for 30 logged days", floorDays >= 30],
        ["🎯 Dead Center", "Hit 2,000–2,400 for 5 days", targetDays >= 5],
        ["🎯🎯 True Aim", "Hit 2,000–2,400 for 14 days", targetDays >= 14],
        ["🏹 Calorie Deadeye", "Hit 2,000–2,400 for 30 days", targetDays >= 30],
        ["💯 Overdrive", "Hit 200g protein in a day", m.overdrive || overdrive],
        ["🦍 Titan Protein", "Hit 225g protein in a day", titanProtein],
        ["🌶️ Buffalo-Blessed", "Log a buffalo-sauce meal", buffaloMentioned],
        ["🥡 Prep Goblin Defeated", "Use meal prep instead of scrambling", mealPrepMentioned],
      ],
    },
    {
      name: "Hydration",
      items: [
        ["💧 First Spring", "Hit 80 oz once", m.firstWaterGoal || waterCount >= 1],
        ["🌊 The Well", "First 80 oz day", m.firstWaterGoal || waterCount >= 1],
        ["🏞️ River Ranger", "Water goal 7 days", waterCount >= 7],
        ["🌧️ Monsoon", "Hit 100 oz in a day", m.monsoon || monsoon],
        ["🧊 Ice and Iron", "Water goal 30 days", waterCount >= 30],
        ["🏔️ Mountain Spring", "Water goal 60 days", waterCount >= 60],
        ["🌊 Ocean Road", "Water goal 100 days", waterCount >= 100],
        ["💦 Canteen Carrier", "Log 500 total oz of water", totalWater >= 500],
        ["🏺 Wellkeeper", "Log 1,000 total oz of water", totalWater >= 1000],
        ["🌊 Floodgate", "Hit 120 oz in a day", floodGate],
      ],
    },
    {
      name: "Fitness",
      items: [
        ["🥊 First Blood", "First workout done", m.firstWorkout || workoutCount >= 1],
        ["🏋️ 5 Battles Won", "5 workouts complete", workoutCount >= 5],
        ["⚔️ 10 Battles Won", "10 workouts complete", workoutCount >= 10],
        ["🛡️ 25 Battles Won", "25 workouts complete", workoutCount >= 25],
        ["🗡️ 50 Battles Won", "50 workouts complete", workoutCount >= 50],
        ["🏰 100 Battles Won", "100 workouts complete", workoutCount >= 100],
        ["🧱 Plank Initiate", "First plank held", m.firstPlank],
        ["🔄 The Switch", "Moved to 2×15 · 15lb", m.switchedTo2x15],
        ["💪 Pushup Test", "1×10 passed, not in regime yet", m.pushupTestPassed],
        ["🚶 Step Seeker", "Hit 5,000 steps", m.stepSeeker || stepSeeker],
        ["🏃 Road Ranger", "Hit 10,000 steps", roadRanger],
        ["🐺 Trail Beast", "Hit 15,000 steps", stepChampion],
        ["🗺️ Long March", "Hit 20,000 steps", longMarch],
        ["🌤️ Active Recovery", "Log 5,000+ steps on a non-workout day", noWorkoutButLogged],
        ["👣 50K Footprints", "Log 50,000 total steps", totalSteps >= 50000],
        ["🥾 100K Footprints", "Log 100,000 total steps", totalSteps >= 100000],
        ["🔥 Furnace Keeper", "Log 5,000 total watch calories burned", totalBurned >= 5000],
        ["🚴 Wheel of the Ranger", "Log a bike ride", bikeMentioned],
        ["🚶 Pathwalker", "Log a walk", walkMentioned],
      ],
    },
    {
      name: "Weekend Warrior",
      items: [
        ["🏕️ Weekend Scout", "First clean weekend", cleanWeekend],
        ["🌄 Saturday Slayer", "3 clean Saturdays", false],
        ["🌇 The Long Weekend", "3 clean full weekends", false],
        ["🗺️ No Man's Land", "Weekend plan 5 times", false],
        ["🧭 True North", "No weekend slips for a month", false],
        ["🌙 Night Owl Tamed", "Log food despite late night", lateNightLogged],
        ["🧊 Cold Breakfast Ready", "Prep weekend food before waking late", false],
        ["🎮 Queue While Fed", "Log meals before a long gaming session", false],
      ],
    },
    {
      name: "System Mastery",
      items: [
        ["💾 Save File Created", "Import a save or log locally", importUsed || loggedCount >= 1],
        ["🧪 Preset Alchemist", "Create at least one food preset", presetsUsed],
        ["⚗️ Preset Archivist", "Create 5 food presets", presetCount >= 5],
        ["📝 Quick Scribe", "Use Quick Log 5 times", quickLogs >= 5],
        ["📜 Field Reporter", "Use Quick Log 25 times", quickLogs >= 25],
        ["📦 Backup Keeper", "Export backup manually", false],
        ["🔧 Tinkerer", "Customize the template", false],
        ["🧙 Parser Whisperer", "Import a regular text save", importUsed],
      ],
    },
    {
      name: "Hidden",
      items: [
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
        ["❓ ???", "Hidden · keep going", false, true],
      ],
    },
  ];
}

function deriveTitles(save, totalXp) {
  const achieved = new Set(deriveAchievements(save).flatMap((g) => g.items).filter((a) => a[2]).map((a) => a[0]));
  const low = lowestWeight(save);
  const hasWeight = low !== null;
  const start = save.profile.startWeight;
  const poundsLost = start !== null && hasWeight ? start - low : 0;
  const days = save.days || [];
  const loggedCount = days.filter((d) => dayXp(d).logged).length;
  const perfectCount = days.filter((d) => dayXp(d).perfect).length;
  const waterCount = days.filter((d) => (d.water || 0) >= 80).length;
  const proteinCount = days.filter((d) => (d.protein || 0) >= 150).length;
  const workoutCount = days.filter((d) => d.workoutComplete).length;
  const maxStreak = longestLoggedStreak(days);
  const totalSteps = days.reduce((sum, d) => sum + (Number(d.steps) || 0), 0);
  const notesText = days.flatMap((d) => d.notes || []).join(" ").toLowerCase();

  const titleChecks = [
    ["🌱 The Wanderer", true],
    ["🏹 Initiated Ranger", totalXp >= 1200],
    ["🦌 Seasoned Tracker", totalXp >= 2500],
    ["🗺️ Pathfinder", totalXp >= 4300],
    ["🌿 Woodsman", totalXp >= 6500],
    ["🏕️ Trail Runner", totalXp >= 9000],
    ["🦅 Scout Ranger", totalXp >= 12000],
    ["⚔️ Tested Ranger", totalXp >= 15500],
    ["🛡️ Iron Ranger", totalXp >= 19500],
    ["🌙 Night Stalker", totalXp >= 24000],
    ["📜 The Chronicler", achieved.has("⚔️ Trail Blazer")],
    ["📚 Archive Keeper", loggedCount >= 30],
    ["🏛️ Keeper of the Log", loggedCount >= 90],
    ["👑 Yearlong Chronicler", loggedCount >= 365],
    ["🍱 Provision Master", save.manualUnlocks.firstMealPrep || achieved.has("🍱 Ranger's Ration")],
    ["🔄 The Adapted", save.manualUnlocks.switchedTo2x15 || achieved.has("🔄 The Switch")],
    ["🌲 Into the Woods", hasWeight && low <= 250],
    ["⚡ Danger Zone Crossed", hasWeight && low < 247],
    ["🦅 Highland Ranger", hasWeight && low <= 240],
    ["🗻 Cloudbreaker", hasWeight && low <= 230],
    ["🏔️ Summit Seeker", hasWeight && low <= 220],
    ["🌊 Wavebreaker", hasWeight && low <= 210],
    ["🌟 Ranger Elite", hasWeight && low <= 200],
    ["💫 Final-Mile Walker", hasWeight && low <= 190],
    ["🎓 The Graduate", hasWeight && low <= 180],
    ["🪶 Feather-Cut", poundsLost >= 5],
    ["🪨 Stone-Cut", poundsLost >= 10],
    ["⚒️ Iron-Cut", poundsLost >= 30],
    ["🪄 Fifty Down", poundsLost >= 50],
    ["⭐ Oathbound", poundsLost >= 74],
    ["🛡️ Iron Will", perfectCount >= 5],
    ["💎 Diamond Discipline", perfectCount >= 10],
    ["🌟 Perfect Ranger", perfectCount >= 30],
    ["🔥 Streakbearer", maxStreak >= 7],
    ["⚡ Lightning-Bound", maxStreak >= 14],
    ["🌋 The Unstoppable", maxStreak >= 30],
    ["🥩 Meat & Iron", achieved.has("🍖 Meat & Iron")],
    ["💪 Muscle Keeper", proteinCount >= 30],
    ["🦾 Protein Bulwark", proteinCount >= 60],
    ["💧 Well-Touched", waterCount >= 1],
    ["🏞️ River Ranger", waterCount >= 7],
    ["🧊 Ice and Iron", waterCount >= 30],
    ["🌊 Ocean Road", waterCount >= 100],
    ["🥊 First Blooded", achieved.has("🥊 First Blood")],
    ["🏋️ Battle-Tested", workoutCount >= 5],
    ["⚔️ Blade-Trained", workoutCount >= 10],
    ["🛡️ Battle-Hardened", workoutCount >= 25],
    ["🏰 Century Fighter", workoutCount >= 100],
    ["🚶 Step Seeker", achieved.has("🚶 Step Seeker")],
    ["🏃 Road Ranger", achieved.has("🏃 Road Ranger")],
    ["🐺 Trail Beast", achieved.has("🐺 Trail Beast")],
    ["👣 Thousand-Foot Ranger", totalSteps >= 100000],
    ["🚴 Wheel Ranger", notesText.includes("bike") || notesText.includes("cycling")],
    ["🏕️ Weekend Warrior", achieved.has("🏕️ Weekend Scout")],
    ["🌙 Night Owl Tamed", achieved.has("🌙 Night Owl Tamed")],
    ["🧪 Preset Alchemist", achieved.has("🧪 Preset Alchemist")],
    ["🧙 Parser Whisperer", achieved.has("🧙 Parser Whisperer")],
    ["👑 The Ranger's Oath", totalXp >= 345000 || (hasWeight && low <= 180)],
  ];

  const earned = titleChecks.filter(([, unlocked]) => unlocked).map(([title]) => title);
  const locked = titleChecks.filter(([, unlocked]) => !unlocked).map(([title]) => title);
  return { earned, locked };
}

function extractPromise(text, baseSave) {
  const promise = { ...baseSave.promise };
  const titleMatch = text.match(/🤍\s*([^—\n]+?)(?:\s*—|\n)/);
  const quoteMatch = text.match(/"([^"]*promise[^"]*)"/i);
  const madeMatch = text.match(/Made:\s*([^·\n]+)(?:·|$)/i);
  const byMatch = text.match(/By:\s*([^·\n]+)(?:·|$)/i);
  const forMatch = text.match(/For:\s*([^\n]+)/i);
  if (titleMatch) promise.title = titleMatch[1].trim();
  if (quoteMatch) promise.flavor = quoteMatch[1].trim();
  if (madeMatch) promise.made = madeMatch[1].trim();
  if (byMatch) promise.by = byMatch[1].trim();
  if (forMatch) promise.for = forMatch[1].trim();
  return promise;
}

function parseClaudeSaveFile(text, baseSave) {
  const lower = text.toLowerCase();
  const dateTitle = text.match(/RANGER SAVE FILE\s*[—-]\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  const parsedDate = dateTitle ? safeIsoDate(dateTitle[1], baseSave.meta.lastUpdated || todayKey()) : baseSave.meta.lastUpdated || todayKey();
  const totalXpMatch = text.match(/Total XP:\s*([\d,]+)/i);
  const currentWeightMatch = text.match(/Current weight:\s*~?([\d.]+)/i);
  const baselineMatch = text.match(/Official baseline:\s*([\d.]+)\s*lbs/i);
  const dayMatch = text.match(/Day:\s*(\d+)/i);
  const nextWorkoutMatch = text.match(/Next workout:\s*(Day\s*[AB])/i);
  const goalMatch = text.match(/Goal:\s*([\d.]+)\s*lbs/i);

  const manualUnlocks = {
    ...baseSave.manualUnlocks,
    firstEntry: lower.includes("first entry") || baseSave.manualUnlocks.firstEntry,
    trailBlazer: lower.includes("trail blazer") || baseSave.manualUnlocks.trailBlazer,
    firstWeighIn: lower.includes("first blood") || lower.includes("weigh-in") || baseSave.manualUnlocks.firstWeighIn,
    firstWorkout: lower.includes("first blood (workout)") || lower.includes("first workout") || baseSave.manualUnlocks.firstWorkout,
    firstPlank: lower.includes("plank initiate") || baseSave.manualUnlocks.firstPlank,
    switchedTo2x15: lower.includes("the switch") || lower.includes("2×15") || lower.includes("2x15") || baseSave.manualUnlocks.switchedTo2x15,
    firstProteinGoal: lower.includes("meat & iron") || lower.includes("meat and iron") || baseSave.manualUnlocks.firstProteinGoal,
    aboveTheFloor: lower.includes("above the floor") || baseSave.manualUnlocks.aboveTheFloor,
    overdrive: lower.includes("overdrive") || baseSave.manualUnlocks.overdrive,
    firstMealPrep: lower.includes("ranger's ration") || lower.includes("first meal prep") || baseSave.manualUnlocks.firstMealPrep,
    firstWaterGoal: lower.includes("the well") || baseSave.manualUnlocks.firstWaterGoal,
    monsoon: lower.includes("monsoon") || baseSave.manualUnlocks.monsoon,
    stepSeeker: lower.includes("step seeker") || baseSave.manualUnlocks.stepSeeker,
    weekendScout: lower.includes("weekend scout") || baseSave.manualUnlocks.weekendScout,
    firstCleanWeekend: lower.includes("first clean weekend") || baseSave.manualUnlocks.firstCleanWeekend,
    airFryerBatch: lower.includes("air fryer apprentice") || lower.includes("air fryer chicken") || baseSave.manualUnlocks.airFryerBatch,
    pushupTestPassed: lower.includes("pushup test passed") || baseSave.manualUnlocks.pushupTestPassed,
  };

  return normalizeSave({
    ...baseSave,
    profile: {
      ...baseSave.profile,
      startWeight: baselineMatch ? Number(baselineMatch[1]) : baseSave.profile.startWeight,
      currentWeight: currentWeightMatch ? Number(currentWeightMatch[1]) : baseSave.profile.currentWeight,
      goalWeight: goalMatch ? Number(goalMatch[1]) : baseSave.profile.goalWeight,
      importedXp: totalXpMatch ? Number(totalXpMatch[1].replace(/,/g, "")) : baseSave.profile.importedXp,
      importedLabel: `Imported snapshot through ${parsedDate}`,
    },
    meta: {
      ...baseSave.meta,
      currentDay: dayMatch ? Number(dayMatch[1]) : baseSave.meta.currentDay,
      lastUpdated: parsedDate,
      nextWorkout: nextWorkoutMatch ? nextWorkoutMatch[1].replace(/\s+/, " ").replace(/day/i, "Day") : baseSave.meta.nextWorkout,
    },
    manualUnlocks,
    days: [],
    importedNotes: text,
    promise: extractPromise(text, baseSave),
  });
}

function coerceImportedJson(data, baseSave) {
  const textVersion = JSON.stringify(data, null, 2);

  if (data && typeof data === "object" && (data.profile || data.meta || data.manualUnlocks || data.days || data.presets)) {
    return normalizeSave(data);
  }

  const character = data.character || data.Character || data.CHARACTER || data.ranger || data.Ranger || {};
  const stats = data.stats || data.Stats || data.status || data.Status || {};
  const targets = data.targets || data.Targets || data.dailyTargets || data.DAILY_TARGETS || {};
  const achievements = data.achievements || data.Achievements || data.unlockedAchievements || data.ACHIEVEMENTS_UNLOCKED || [];
  const titles = data.titles || data.Titles || data.earnedTitles || data.TITLES_EARNED || [];
  const milestones = data.milestones || data.Milestones || data.milestoneQuests || data.MILESTONE_QUESTS_COMPLETE || [];
  const promiseData = data.promise || data.Promise || data.THE_PROMISE || {};

  const getValue = (...keys) => {
    for (const source of [data, character, stats, targets]) {
      for (const key of keys) {
        if (source && source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
      }
    }
    return null;
  };

  const numberFrom = (value) => {
    if (value === null || value === undefined) return null;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const textBlob = `${textVersion} ${Array.isArray(achievements) ? achievements.join(" ") : JSON.stringify(achievements)} ${Array.isArray(titles) ? titles.join(" ") : JSON.stringify(titles)} ${Array.isArray(milestones) ? milestones.join(" ") : JSON.stringify(milestones)}`.toLowerCase();

  const importedXp = numberFrom(getValue("importedXp", "totalXp", "totalXP", "xp", "XP", "Total XP", "TotalXP"));
  const currentDay = numberFrom(getValue("currentDay", "day", "Day", "current_day"));
  const currentWeight = numberFrom(getValue("currentWeight", "weight", "Current weight", "current_weight"));
  const startWeight = numberFrom(getValue("startWeight", "startingWeight", "baseline", "Official baseline", "officialBaseline", "start_weight"));
  const goalWeight = numberFrom(getValue("goalWeight", "goal", "Goal", "goal_weight"));
  const age = numberFrom(getValue("age", "Age"));
  const height = getValue("height", "Height") || baseSave.profile.height;
  const name = getValue("name", "Name") || baseSave.profile.name;
  const className = getValue("className", "class", "Class") || baseSave.profile.className;
  const path = getValue("path", "Path") || baseSave.profile.path;
  const nextWorkoutRaw = getValue("nextWorkout", "next_workout", "Next workout", "workoutNext");

  const manualUnlocks = {
    ...baseSave.manualUnlocks,
    firstEntry: textBlob.includes("first entry") || baseSave.manualUnlocks.firstEntry,
    trailBlazer: textBlob.includes("trail blazer") || baseSave.manualUnlocks.trailBlazer,
    firstWeighIn: textBlob.includes("first blood") || textBlob.includes("weigh-in") || baseSave.manualUnlocks.firstWeighIn,
    firstWorkout: textBlob.includes("first blood (workout)") || textBlob.includes("first workout") || baseSave.manualUnlocks.firstWorkout,
    firstPlank: textBlob.includes("plank initiate") || baseSave.manualUnlocks.firstPlank,
    switchedTo2x15: textBlob.includes("the switch") || textBlob.includes("2×15") || textBlob.includes("2x15") || baseSave.manualUnlocks.switchedTo2x15,
    firstProteinGoal: textBlob.includes("meat & iron") || textBlob.includes("meat and iron") || baseSave.manualUnlocks.firstProteinGoal,
    aboveTheFloor: textBlob.includes("above the floor") || baseSave.manualUnlocks.aboveTheFloor,
    overdrive: textBlob.includes("overdrive") || baseSave.manualUnlocks.overdrive,
    firstMealPrep: textBlob.includes("ranger's ration") || textBlob.includes("first meal prep") || baseSave.manualUnlocks.firstMealPrep,
    firstWaterGoal: textBlob.includes("the well") || baseSave.manualUnlocks.firstWaterGoal,
    monsoon: textBlob.includes("monsoon") || baseSave.manualUnlocks.monsoon,
    stepSeeker: textBlob.includes("step seeker") || baseSave.manualUnlocks.stepSeeker,
    weekendScout: textBlob.includes("weekend scout") || baseSave.manualUnlocks.weekendScout,
    firstCleanWeekend: textBlob.includes("first clean weekend") || baseSave.manualUnlocks.firstCleanWeekend,
    airFryerBatch: textBlob.includes("air fryer apprentice") || textBlob.includes("air fryer chicken") || baseSave.manualUnlocks.airFryerBatch,
    pushupTestPassed: textBlob.includes("pushup test passed") || baseSave.manualUnlocks.pushupTestPassed,
  };

  const promise = {
    ...baseSave.promise,
    title: promiseData.title || promiseData.name || baseSave.promise.title,
    subtitle: promiseData.subtitle || promiseData.rarity || baseSave.promise.subtitle,
    flavor: promiseData.flavor || promiseData.flavorText || promiseData.quote || baseSave.promise.flavor,
    made: promiseData.made || promiseData.date || baseSave.promise.made,
    by: promiseData.by || baseSave.promise.by,
    for: promiseData.for || promiseData.recipient || baseSave.promise.for,
  };

  let nextWorkout = baseSave.meta.nextWorkout;
  if (nextWorkoutRaw) {
    nextWorkout = String(nextWorkoutRaw).replace("DAY", "Day").replace("day", "Day");
  }

  return normalizeSave({
    ...baseSave,
    profile: {
      ...baseSave.profile,
      name,
      className,
      path,
      age: age ?? baseSave.profile.age,
      height,
      startWeight: startWeight ?? baseSave.profile.startWeight,
      currentWeight: currentWeight ?? baseSave.profile.currentWeight,
      goalWeight: goalWeight ?? baseSave.profile.goalWeight,
      importedXp: importedXp ?? baseSave.profile.importedXp,
      importedLabel: importedXp !== null ? "Imported JSON snapshot" : baseSave.profile.importedLabel,
    },
    meta: {
      ...baseSave.meta,
      currentDay: currentDay ?? baseSave.meta.currentDay,
      lastUpdated: data.date || data.Date || data.lastUpdated || data.last_updated || baseSave.meta.lastUpdated || todayKey(),
      nextWorkout,
    },
    manualUnlocks,
    promise,
    importedNotes: textVersion,
  });
}

function parseImportedText(text, baseSave) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("The import text was empty.");
  try {
    return coerceImportedJson(JSON.parse(trimmed), baseSave);
  } catch {
    return parseClaudeSaveFile(trimmed, baseSave);
  }
}

function parseQuickLog(text, save) {
  const lower = text.toLowerCase();
  const result = { date: todayKey(), water: 0, calories: 0, protein: 0, foods: [], notes: [text], warnings: [], matched: [] };
  const dateMatch = lower.match(/(?:date|day)\s*[:=]?\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) result.date = dateMatch[1];
  const weightMatch = lower.match(/(?:weight|weigh(?:ed)?(?: in)?|weigh-in)\s*(?:was|is|at|:|=)?\s*(\d{2,3}(?:\.\d+)?)/);
  if (weightMatch) result.weight = Number(weightMatch[1]);
  const waterMatches = [...lower.matchAll(/(\d+(?:\.\d+)?)\s*(?:oz|ounces)\s*(?:of\s*)?(?:water)?/g)];
  result.water = waterMatches.reduce((sum, m) => sum + Number(m[1]), 0);
  const stepsMatch = lower.match(/(\d[\d,]*)\s*steps?|steps\s*[:=]?\s*(\d[\d,]*)/);
  if (stepsMatch) result.steps = Number((stepsMatch[1] || stepsMatch[2]).replace(/,/g, ""));
  const activeMatch = lower.match(/(?:active(?:\s*minutes|\s*min)?|active min)\s*[:=]?\s*(\d+)|(\d+)\s*(?:active minutes|active min)/);
  if (activeMatch) result.activeMinutes = Number(activeMatch[1] || activeMatch[2]);
  const burnedMatch = lower.match(/(?:burned|cal(?:ories)? burned|watch burned)\s*[:=]?\s*(\d+)|(\d+)\s*(?:burned|cal(?:ories)? burned)/);
  if (burnedMatch) result.caloriesBurned = Number(burnedMatch[1] || burnedMatch[2]);
  const workoutMatch = lower.match(/day\s*([ab])\s*(?:done|complete|completed|cleared)?|(?:workout|training)\s*(?:done|complete|completed|cleared)/);
  if (workoutMatch) {
    result.workoutComplete = true;
    result.workoutDay = workoutMatch[1] ? `Day ${workoutMatch[1].toUpperCase()}` : nextWorkout(save);
  }
  const explicitCal = lower.match(/(?:calories|kcal|food cals|cals)\s*[:=]?\s*(\d{2,4})|(?:^|\s)(\d{2,4})\s*(?:kcal|calories)(?!\s*burned)/);
  if (explicitCal) result.calories += Number(explicitCal[1] || explicitCal[2]);
  const explicitProtein = lower.match(/(?:protein|prot)\s*[:=]?\s*(\d{1,3})|(\d{1,3})\s*g\s*(?:protein|prot)/);
  if (explicitProtein) result.protein += Number(explicitProtein[1] || explicitProtein[2]);

  for (const preset of save.presets) {
    const aliases = [preset.name, ...(preset.aliases || [])].map((x) => x.toLowerCase());
    if (aliases.some((alias) => alias && lower.includes(alias))) {
      result.foods.push({ name: preset.name, calories: Number(preset.calories) || 0, protein: Number(preset.protein) || 0 });
      result.calories += Number(preset.calories) || 0;
      result.protein += Number(preset.protein) || 0;
      result.matched.push(preset.name);
    }
  }

  if ((result.calories || 0) > 0 && result.calories < 1800) result.warnings.push("Calories are below the 1,800 floor unless this is only a partial-day log.");
  if (/(seafood|fish|shrimp|tuna|salmon)/i.test(text)) result.warnings.push("Diet restriction flag: seafood mentioned. Do not save this as a normal suggestion or preset.");
  if (/\bbeans?\b/i.test(text)) result.warnings.push("Diet restriction flag: beans mentioned. Do not save this as a normal suggestion or preset.");
  return result;
}

function applyQuickLog(save, parsed) {
  const date = parsed.date || todayKey();
  const existing = save.days.find((d) => d.date === date) || blankDay(date, save);
  const updated = {
    ...existing,
    weight: parsed.weight ?? existing.weight ?? null,
    calories: (existing.calories || 0) + (parsed.calories || 0),
    protein: (existing.protein || 0) + (parsed.protein || 0),
    water: (existing.water || 0) + (parsed.water || 0),
    steps: parsed.steps ?? existing.steps ?? 0,
    activeMinutes: parsed.activeMinutes ?? existing.activeMinutes ?? 0,
    caloriesBurned: parsed.caloriesBurned ?? existing.caloriesBurned ?? 0,
    workoutDay: parsed.workoutDay || existing.workoutDay || nextWorkout(save),
    workoutComplete: parsed.workoutComplete || existing.workoutComplete || false,
    foods: [...(existing.foods || []), ...(parsed.foods || [])],
    notes: [...(existing.notes || []), ...(parsed.notes || [])],
  };
  const days = save.days.filter((d) => d.date !== date).concat(updated).sort((a, b) => a.date.localeCompare(b.date));
  return { ...save, profile: { ...save.profile, currentWeight: updated.weight || save.profile.currentWeight }, days, meta: { ...save.meta, lastUpdated: date, currentDay: Math.max(save.meta.currentDay || 1, days.length) } };
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-[#8a6a24]/50 bg-[#15110d]/90 p-4 shadow-[0_0_25px_rgba(240,192,64,0.08)] ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, children }) {
  return <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[#f0c040]"><Icon className="h-5 w-5" /><span>{children}</span></div>;
}

function StatusPill({ children, tone = "gold" }) {
  const tones = {
    gold: "border-[#f0c040]/50 bg-[#3a2a08] text-[#f5d778]",
    green: "border-[#40c040]/40 bg-[#0f2b12] text-[#91e691]",
    blue: "border-[#40c0f0]/40 bg-[#0d2430] text-[#8edbf5]",
    purple: "border-[#a040f0]/40 bg-[#241132] text-[#d2a6ff]",
    red: "border-[#f05050]/40 bg-[#331010] text-[#ff9999]",
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Bar({ value, max, label, gradient, subtext }) {
  const pct = clampPct(value, max);
  return <div className="space-y-2"><div className="flex items-end justify-between gap-3"><span className="text-sm font-semibold text-[#e8d5a3]">{label}</span><span className="text-xs text-[#c6ad72]">{subtext || `${value || 0} / ${max}`}</span></div><div className="h-3 overflow-hidden rounded-full bg-black/60 ring-1 ring-[#5f4618]"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full" style={{ background: gradient }} /></div></div>;
}

function CharacterTab({ save, today, levelInfo, daily, totalXp }) {
  const p = save.profile;
  const cw = currentWeight(save, today);
  const hasWeightTrack = p.startWeight !== null && p.goalWeight !== null && cw !== null;
  const weightPct = hasWeightTrack ? ((p.startWeight - cw) / (p.startWeight - p.goalWeight)) * 100 : 0;
  const netCalories = (today.calories || 0) - (today.caloriesBurned || 0);
  const workoutDay = today.workoutDay || nextWorkout(save);
  const calorieTone = (today.calories || 0) === 0 ? "gold" : (today.calories || 0) < 1800 ? "red" : (today.calories || 0) <= 2400 ? "green" : "gold";

  return <div className="grid gap-4 lg:grid-cols-3">
    <Card className="lg:col-span-2"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-3xl font-black tracking-tight text-[#f0c040]">{p.name}</div><div className="mt-1 text-[#e8d5a3]">{p.className} · {p.path}</div><div className="mt-2 flex flex-wrap gap-2">{p.age && <StatusPill>Age {p.age}</StatusPill>}{p.height && <StatusPill>Height {p.height}</StatusPill>}<StatusPill tone="green">{levelInfo.current[1]}</StatusPill><StatusPill tone="purple">Local save</StatusPill></div></div><motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 5, repeat: Infinity }} className="rounded-2xl border border-[#f0c040]/40 bg-black/40 p-4 text-center"><Shield className="mx-auto h-9 w-9 text-[#f0c040]" /><div className="mt-1 text-xs uppercase tracking-[0.25em] text-[#c6ad72]">Iron Will</div></motion.div></div><div className="mt-6 rounded-2xl border border-[#f0c040]/40 bg-black/30 p-4"><div className="mb-2 flex justify-between text-sm"><span className="font-bold text-[#f0c040]">Level {levelInfo.current[0]} · {levelInfo.current[1]}</span><span className="text-[#c6ad72]">{levelInfo.xpIntoLevel} / {levelInfo.xpNeeded} XP to Level {levelInfo.next[0]}</span></div><div className="h-5 overflow-hidden rounded-full bg-black ring-1 ring-[#8a6a24]"><motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.pct}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #6b4f00, #c09000, #f0e060)" }} /></div><div className="mt-2 text-xs text-[#c6ad72]">Total XP: {totalXp.toLocaleString()} · Today: {daily.total} XP · {p.importedLabel}: {p.importedXp.toLocaleString()}</div></div></Card>
    <Card><SectionTitle icon={Activity}>Activity Stats</SectionTitle><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black/35 p-3"><div className="text-xl font-bold text-[#f0c040]">{(today.steps || 0).toLocaleString()}</div><div className="text-xs text-[#c6ad72]">Steps</div></div><div className="rounded-xl bg-black/35 p-3"><div className="text-xl font-bold text-[#f0c040]">{today.activeMinutes || 0}</div><div className="text-xs text-[#c6ad72]">Active Min</div></div><div className="rounded-xl bg-black/35 p-3"><div className="text-xl font-bold text-[#f0c040]">{today.caloriesBurned || 0}</div><div className="text-xs text-[#c6ad72]">Burned</div></div></div></Card>
    <Card><SectionTitle icon={Droplets}>Vital Bars</SectionTitle><div className="space-y-4"><Bar value={today.water || 0} max={80} label="Water" gradient="linear-gradient(90deg, #1a5fa0, #40c0f0)" subtext={`${today.water || 0} oz / 80 oz`} /><Bar value={today.calories || 0} max={2400} label="Calories" gradient="linear-gradient(90deg, #1a6b1a, #40c040)" subtext={`${today.calories || 0} kcal`} /><Bar value={today.protein || 0} max={180} label="Protein" gradient="linear-gradient(90deg, #5a1a8b, #a040f0)" subtext={`${today.protein || 0}g / 150g+`} /></div></Card>
    <Card><SectionTitle icon={Weight}>Weight Track</SectionTitle><div className="text-sm text-[#e8d5a3]">{hasWeightTrack ? `${cw} lbs → ${p.goalWeight} lbs` : "Import a save file to activate weight tracking."}</div><div className="relative mt-5 h-4 rounded-full bg-black ring-1 ring-[#8a6a24]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, weightPct))}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-[#6b4f00] via-[#c09000] to-[#f0e060]" />{hasWeightTrack && [p.startWeight, 250, 247, 240, 220, 200, p.goalWeight].filter((m, index, arr) => m !== null && arr.indexOf(m) === index).map((m) => { const pos = ((p.startWeight - m) / (p.startWeight - p.goalWeight)) * 100; return <div key={m} className="absolute top-1/2 h-6 w-[2px] -translate-y-1/2 bg-[#e8d5a3]" style={{ left: `${Math.max(0, Math.min(100, pos))}%` }} />; })}</div><div className="mt-3 flex justify-between text-[10px] text-[#c6ad72]">{hasWeightTrack ? [p.startWeight, 250, 247, 240, 220, 200, p.goalWeight].filter((m, index, arr) => m !== null && arr.indexOf(m) === index).map((m) => <span key={m}>{m}</span>) : <span>No weight data imported</span>}</div><div className="mt-3 rounded-xl border border-[#f0c040]/25 bg-black/30 p-3 text-xs text-[#c6ad72]">Danger zone and milestone markers activate after importing a personal save.</div></Card>
    <Card><SectionTitle icon={Dumbbell}>Workout · {workoutDay}</SectionTitle><div className="space-y-2">{workouts[workoutDay].map(([name, detail]) => <div key={name} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm"><span className="text-[#e8d5a3]">{today.workoutComplete ? "✓" : "○"} {name}</span><span className="text-[#c6ad72]">{detail}</span></div>)}</div><div className="mt-3 flex flex-wrap gap-2"><StatusPill tone={today.workoutComplete ? "green" : "gold"}>{today.workoutComplete ? "Training cleared" : "Training pending"}</StatusPill>{save.manualUnlocks.pushupTestPassed && <StatusPill tone="purple">Pushup test passed</StatusPill>}</div></Card>
    <Card><SectionTitle icon={ScrollText}>Day Summary</SectionTitle><div className="grid gap-2 text-sm"><div className="flex justify-between rounded-xl bg-black/30 p-3"><span>Consumed</span><b className="text-[#f0c040]">{today.calories || 0} kcal</b></div><div className="flex justify-between rounded-xl bg-black/30 p-3"><span>Protein</span><b className="text-[#f0c040]">{today.protein || 0}g</b></div><div className="flex justify-between rounded-xl bg-black/30 p-3"><span>Net</span><b className="text-[#f0c040]">{netCalories} kcal</b></div><div className="flex justify-between rounded-xl bg-black/30 p-3"><span>Status</span><StatusPill tone={calorieTone}>{(today.calories || 0) === 0 ? "No log yet" : (today.calories || 0) < 1800 ? "Under floor" : (today.calories || 0) <= 2400 ? "Target hit" : "Over target"}</StatusPill></div></div></Card>
    <Card className="lg:col-span-3"><SectionTitle icon={Map}>Observer Notes</SectionTitle><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-[#40c040]/30 bg-[#0f2b12]/80 p-3 text-sm text-[#d8f5d8]">✅ Snapshot XP: {save.profile.importedXp.toLocaleString()} imported.</div><div className="rounded-xl border border-[#a040f0]/30 bg-[#241132]/80 p-3 text-sm text-[#ead7ff]">🍖 Protein target remains 150–180g. Preserve muscle, avoid crash-diet goblin mode.</div><div className="rounded-xl border border-[#40c0f0]/30 bg-[#0d2430]/80 p-3 text-sm text-[#d8f3ff]">💧 Water target: 80 oz. Hydration logs parse from plain text.</div><div className="rounded-xl border border-[#f0c040]/30 bg-[#2c2108]/80 p-3 text-sm text-[#f8e7aa]">🌙 Friday warning stays active. Weekend chaos loses to prepared food.</div></div></Card>
  </div>;
}

function QuickLogTab({ save, setSave }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [presetName, setPresetName] = useState("");
  const [presetCalories, setPresetCalories] = useState("");
  const [presetProtein, setPresetProtein] = useState("");
  const [presetAliases, setPresetAliases] = useState("");
  const runPreview = () => setPreview(parseQuickLog(text, save));
  const savePreview = () => {
    if (!preview) return;
    const next = applyQuickLog(save, preview);
    writeSave(next);
    setSave(next);
    setText("");
    setPreview(null);
  };
  const addPreset = () => {
    if (!presetName.trim()) return;
    const preset = { id: `${presetName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`, name: presetName.trim(), calories: Number(presetCalories) || 0, protein: Number(presetProtein) || 0, aliases: presetAliases.split(",").map((x) => x.trim()).filter(Boolean) };
    const next = { ...save, presets: [...save.presets, preset] };
    writeSave(next);
    setSave(next);
    setPresetName("");
    setPresetCalories("");
    setPresetProtein("");
    setPresetAliases("");
  };
  const deletePreset = (presetId) => {
    const preset = save.presets.find((p) => p.id === presetId);
    if (!preset) return;
    if (!window.confirm(`Delete preset "${preset.name}"?`)) return;
    const next = { ...save, presets: save.presets.filter((p) => p.id !== presetId) };
    writeSave(next);
    setSave(next);
  };
  return <div className="grid gap-4 lg:grid-cols-3">
    <Card className="lg:col-span-2"><SectionTitle icon={Plus}>Quick Log</SectionTitle><textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-40 w-full rounded-2xl border border-[#8a6a24]/60 bg-black/50 p-4 text-[#e8d5a3] outline-none placeholder:text-[#8f8262] focus:border-[#f0c040]" placeholder="Example: weight 251.8, meal prep, 40 oz water, Day B done, 6420 steps, 46 active, 620 burned" /><div className="mt-3 flex flex-wrap gap-2"><button onClick={runPreview} className="rounded-xl border border-[#f0c040]/50 bg-[#3a2a08] px-4 py-2 font-bold text-[#f0c040]">Preview Parse</button><button onClick={savePreview} disabled={!preview} className="rounded-xl border border-[#40c040]/50 bg-[#0f2b12] px-4 py-2 font-bold text-[#91e691] disabled:opacity-40"><Save className="mr-2 inline h-4 w-4" />Save Entry</button></div>{preview && <div className="mt-4 rounded-2xl border border-[#f0c040]/35 bg-black/30 p-4"><div className="mb-2 font-bold text-[#f0c040]">Review before saving</div><div className="grid gap-2 text-sm md:grid-cols-2"><div>Date: <b>{preview.date}</b></div><div>Weight: <b>{preview.weight ?? "not changed"}</b></div><div>Calories added: <b>{preview.calories || 0}</b></div><div>Protein added: <b>{preview.protein || 0}g</b></div><div>Water added: <b>{preview.water || 0} oz</b></div><div>Steps: <b>{preview.steps ?? "not changed"}</b></div><div>Active minutes: <b>{preview.activeMinutes ?? "not changed"}</b></div><div>Burned: <b>{preview.caloriesBurned ?? "not changed"}</b></div><div>Workout: <b>{preview.workoutComplete ? `${preview.workoutDay} complete` : "not changed"}</b></div><div>Foods matched: <b>{preview.matched?.length ? preview.matched.join(", ") : "none"}</b></div></div>{preview.warnings.length > 0 && <div className="mt-3 space-y-2">{preview.warnings.map((w) => <div key={w} className="rounded-xl border border-[#f05050]/35 bg-[#331010] p-3 text-sm text-[#ffb3b3]">⚠️ {w}</div>)}</div>}</div>}</Card>
    <Card><SectionTitle icon={Utensils}>Food Presets</SectionTitle><div className="space-y-2">{save.presets.length === 0 && <div className="rounded-xl border border-[#8a6a24]/40 bg-black/30 p-3 text-sm text-[#c6ad72]">No presets saved yet. Add one below when a repeated meal is worth shortcutting.</div>}{save.presets.map((p) => <div key={p.id} className="rounded-xl bg-black/30 p-3"><div className="flex items-start justify-between gap-3"><div><div className="font-bold text-[#e8d5a3]">{p.name}</div><div className="text-xs text-[#c6ad72]">{p.calories} kcal · {p.protein}g protein</div></div><button onClick={() => deletePreset(p.id)} className="rounded-lg border border-[#f05050]/40 bg-[#331010] px-2 py-1 text-xs font-bold text-[#ff9999] hover:bg-[#4a1414]" title={`Delete ${p.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div><div className="mt-1 text-[11px] text-[#8f8262]">Aliases: {(p.aliases || []).join(", ")}</div></div>)}</div></Card>
    <Card className="lg:col-span-3"><SectionTitle icon={Plus}>Add Food Preset</SectionTitle><div className="grid gap-3 md:grid-cols-4"><input value={presetName} onChange={(e) => setPresetName(e.target.value)} className="rounded-xl border border-[#8a6a24]/60 bg-black/50 p-3 text-[#e8d5a3] outline-none" placeholder="Preset name" /><input value={presetCalories} onChange={(e) => setPresetCalories(e.target.value)} className="rounded-xl border border-[#8a6a24]/60 bg-black/50 p-3 text-[#e8d5a3] outline-none" placeholder="Calories" /><input value={presetProtein} onChange={(e) => setPresetProtein(e.target.value)} className="rounded-xl border border-[#8a6a24]/60 bg-black/50 p-3 text-[#e8d5a3] outline-none" placeholder="Protein grams" /><input value={presetAliases} onChange={(e) => setPresetAliases(e.target.value)} className="rounded-xl border border-[#8a6a24]/60 bg-black/50 p-3 text-[#e8d5a3] outline-none" placeholder="Aliases, comma separated" /></div><button onClick={addPreset} className="mt-3 rounded-xl border border-[#f0c040]/50 bg-[#3a2a08] px-4 py-2 font-bold text-[#f0c040]">Add Preset</button></Card>
  </div>;
}

function QuestsTab({ today, save }) {
  const daily = dayXp(today);
  const rows = [["Hold the Line", "≥1,800 kcal", 25, daily.hold], ["Hit Calorie Target", "2,000 to 2,400 kcal", 50, daily.target], ["Ranger's Ration", "150g+ protein", 75, daily.protein], ["Forest Spring", "80 oz water", 50, daily.water], ["Training Grounds", "Workout complete", 125, daily.workout], ["The Ranger's Log", "Everything logged", 25, daily.logged], ["Perfect Day Bonus", "All six daily quests", 75, daily.perfect]];
  return <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><SectionTitle icon={ScrollText}>Daily Quests</SectionTitle><div className="space-y-2">{rows.map(([name, desc, xp, done]) => <div key={name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#8a6a24]/40 bg-black/30 px-4 py-3"><div><div className="font-bold text-[#e8d5a3]">{done ? "✓" : "○"} {name}</div><div className="text-xs text-[#c6ad72]">{desc}</div></div><StatusPill tone={done ? "green" : "gold"}>+{xp} XP</StatusPill></div>)}</div><div className="mt-4 rounded-2xl border border-[#f0c040]/40 bg-[#2c2108] p-4 text-[#e8d5a3]">Daily XP earned: <b className="text-[#f0c040]">{daily.total}</b> / 425</div></Card><Card><SectionTitle icon={Flame}>Weekly Bonus Quests</SectionTitle><div className="space-y-2"><div className="rounded-xl bg-black/30 p-3 text-sm">Weekly bonuses are not auto-awarded yet. Snapshot XP is used as the baseline after import.</div><div className="rounded-xl bg-black/30 p-3 text-sm text-[#c6ad72]">Next workout: <b className="text-[#f0c040]">{save.meta.nextWorkout || nextWorkout(save)}</b></div><div className="rounded-xl bg-black/30 p-3 text-sm text-[#c6ad72]">Friday warning: prepare weekend food before the late-night gremlin window.</div></div></Card><Card className="lg:col-span-3"><SectionTitle icon={Star}>Milestone Quests</SectionTitle><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{[["First weigh-in", 100, save.manualUnlocks.firstWeighIn], ["First meal prep batch", 150, save.manualUnlocks.firstMealPrep], ["First clean weekend", 400, save.manualUnlocks.firstCleanWeekend], ["Air fryer chicken batch", 150, save.manualUnlocks.airFryerBatch]].map(([name, xp, done]) => <div key={name} className={`rounded-2xl border p-4 ${done ? "border-[#40c040]/40 bg-[#0f2b12]/75" : "border-[#8a6a24]/40 bg-black/30"}`}>{done ? "✓" : "🔒"} {name} <StatusPill tone={done ? "green" : "gold"}>+{xp}</StatusPill></div>)}</div></Card></div>;
}

function AchievementsTab({ save }) {
  return <div className="space-y-4">{deriveAchievements(save).map((group) => <Card key={group.name}><SectionTitle icon={Award}>{group.name}</SectionTitle><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{group.items.map(([name, desc, unlocked, hidden], idx) => <div key={`${name}-${idx}`} className={`rounded-2xl border p-4 transition ${hidden ? "border-dashed border-[#777]/50 bg-black/25" : unlocked ? "border-[#f0c040]/60 bg-[#2c2108] shadow-[0_0_20px_rgba(240,192,64,0.10)]" : "border-[#5f4618]/40 bg-black/25 opacity-55 grayscale"}`}><div className="flex items-center justify-between gap-3"><div className="font-bold text-[#e8d5a3]">{name}</div>{unlocked ? <StatusPill tone="gold">✓</StatusPill> : <Lock className="h-4 w-4 text-[#8a7a55]" />}</div><div className="mt-1 text-xs text-[#c6ad72]">{desc}</div></div>)}</div></Card>)}<PromiseMini save={save} /></div>;
}

function PromiseMini({ save }) {
  const promise = save.promise || TEMPLATE_SAVE.promise;
  return <div className="rounded-3xl border border-[#a040f0]/60 bg-[#13091c] p-5 shadow-[0_0_35px_rgba(160,64,240,0.18)]"><div className="flex items-center justify-between gap-3"><div><div className="text-lg font-black text-[#ead7ff]">🤍 {promise.title}</div><div className="text-xs uppercase tracking-[0.25em] text-[#caa4ff]">{promise.subtitle}</div></div><Lock className="h-5 w-5 text-[#caa4ff]" /></div><div className="mt-3 rounded-2xl border border-[#a040f0]/40 bg-black/30 p-4 text-sm italic text-[#ead7ff]">{promise.flavor}</div></div>;
}

function LevelsTab({ levelInfo, totalXp }) {
  return <Card><SectionTitle icon={Activity}>Level Table</SectionTitle><div className="max-h-[620px] overflow-auto rounded-2xl border border-[#8a6a24]/40"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead className="sticky top-0 bg-[#21180a] text-[#f0c040]"><tr><th className="p-3">LVL</th><th className="p-3">Title</th><th className="p-3">XP Needed</th><th className="p-3">Total XP</th><th className="p-3">Status</th></tr></thead><tbody>{levels.map(([lvl, title, needed, total]) => { const achieved = totalXp >= total; const current = lvl === levelInfo.current[0]; return <tr key={lvl} className={`${current ? "bg-[#3a2a08] text-[#f0c040]" : achieved ? "bg-[#0f2b12]/70 text-[#d8f5d8]" : "bg-black/25 text-[#8f8262]"} border-t border-[#5f4618]/40`}><td className="p-3 font-bold">{lvl}</td><td className="p-3">{title}</td><td className="p-3">{needed.toLocaleString()}</td><td className="p-3">{total.toLocaleString()}</td><td className="p-3">{current ? "Current" : achieved ? "Achieved" : "Locked"}</td></tr>; })}</tbody></table></div></Card>;
}

function TitlesTab({ save, totalXp }) {
  const t = deriveTitles(save, totalXp);
  return <div className="grid gap-4 lg:grid-cols-2"><Card><SectionTitle icon={Crown}>Earned Titles</SectionTitle><div className="grid gap-3">{t.earned.map((title) => <div key={title} className="rounded-2xl border border-[#f0c040]/60 bg-[#2c2108] p-4 font-bold text-[#f0c040] shadow-[0_0_20px_rgba(240,192,64,0.10)]">✓ {title}</div>)}</div></Card><Card><SectionTitle icon={Lock}>Locked Titles</SectionTitle><div className="grid gap-3">{t.locked.map((title) => <div key={title} className="rounded-2xl border border-[#5f4618]/40 bg-black/25 p-4 text-[#8f8262] grayscale">🔒 {title}</div>)}</div></Card></div>;
}

function DataTab({ save, setSave }) {
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);

  const exportSave = () => {
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ranger-log-save-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromText = () => {
    try {
      const parsed = parseImportedText(importText, save);
      writeSave(parsed);
      setSave(parsed);
      setImportText("");
      setStatus("Import successful. The file/text was loaded into local browser storage.");
    } catch (error) {
      setStatus(`Import failed: ${error.message || "The text could not be parsed."}`);
    }
  };

  const importFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedText(text, save);
      writeSave(parsed);
      setSave(parsed);
      setStatus(`Imported ${file.name} successfully.`);
    } catch (error) {
      setStatus(`File import failed: ${error.message || "The file could not be parsed."}`);
    } finally {
      event.target.value = "";
    }
  };

  const resetTemplate = () => {
    if (!window.confirm("Reset the local browser save back to the blank template? Export a backup first if needed.")) return;
    writeSave(TEMPLATE_SAVE);
    setSave(TEMPLATE_SAVE);
    setImportText("");
    setStatus("Reset to blank template save.");
  };

  return <div className="grid gap-4 lg:grid-cols-2"><Card className="lg:col-span-2"><SectionTitle icon={Upload}>Import Save Text or File</SectionTitle><p className="mb-3 text-sm text-[#c6ad72]">Paste a Claude nightly save block or exported JSON here. The importer tries JSON first, then falls back to the regular text snapshot format.</p><textarea value={importText} onChange={(e) => setImportText(e.target.value)} className="min-h-56 w-full rounded-2xl border border-[#8a6a24]/60 bg-black/50 p-4 font-mono text-xs text-[#e8d5a3] outline-none" placeholder="Paste JSON or regular RANGER SAVE FILE text here." /><div className="mt-3 flex flex-wrap gap-2"><button onClick={importFromText} disabled={!importText.trim()} className="rounded-xl border border-[#f0c040]/50 bg-[#3a2a08] px-4 py-2 font-bold text-[#f0c040] disabled:opacity-40">Import Pasted Text</button><button onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-[#40c0f0]/50 bg-[#0d2430] px-4 py-2 font-bold text-[#8edbf5]"><Upload className="mr-2 inline h-4 w-4" />Import File</button><input ref={fileInputRef} type="file" accept=".json,.txt,.md,text/plain,application/json" className="hidden" onChange={importFromFile} /></div>{status && <div className="mt-3 rounded-xl border border-[#8a6a24]/40 bg-black/30 p-3 text-sm text-[#c6ad72]">{status}</div>}</Card><Card><SectionTitle icon={Download}>Export JSON Backup</SectionTitle><p className="text-sm text-[#c6ad72]">Downloads your current local save as JSON. Keep this outside the GitHub repo.</p><button onClick={exportSave} className="mt-4 rounded-xl border border-[#40c0f0]/50 bg-[#0d2430] px-4 py-2 font-bold text-[#8edbf5]"><Download className="mr-2 inline h-4 w-4" />Export JSON</button></Card><Card><SectionTitle icon={Database}>Template Controls</SectionTitle><p className="text-sm text-[#c6ad72]">This app code is safe to publish as a blank template. Your personal save should be imported only into browser storage.</p><button onClick={resetTemplate} className="mt-4 rounded-xl border border-[#f05050]/50 bg-[#331010] px-4 py-2 font-bold text-[#ff9999]">Reset Local Save to Template</button></Card><Card className="lg:col-span-2"><SectionTitle icon={Database}>Current Local Save Preview</SectionTitle><pre className="max-h-96 overflow-auto rounded-2xl bg-black/50 p-4 text-xs text-[#c6ad72]">{JSON.stringify(save, null, 2)}</pre></Card></div>;
}

function PromiseTab({ save }) {
  const promise = save.promise || TEMPLATE_SAVE.promise;
  return <div className="flex min-h-[620px] items-center justify-center p-3"><style>{`@keyframes promiseGlow{0%{box-shadow:0 0 24px rgba(160,64,240,.25),inset 0 0 18px rgba(255,255,255,.05);border-color:#a040f0}33%{box-shadow:0 0 38px rgba(255,255,255,.28),inset 0 0 22px rgba(160,64,240,.12);border-color:#fff}66%{box-shadow:0 0 38px rgba(64,192,240,.25),inset 0 0 20px rgba(64,192,240,.10);border-color:#40c0f0}100%{box-shadow:0 0 24px rgba(160,64,240,.25),inset 0 0 18px rgba(255,255,255,.05);border-color:#a040f0}}`}</style><motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border-2 bg-[#0b0711] p-8 text-center" style={{ animation: "promiseGlow 4s infinite" }}><div className="absolute left-4 top-4 text-2xl text-[#caa4ff]">✦</div><div className="absolute right-4 top-4 text-2xl text-[#caa4ff]">✦</div><div className="absolute bottom-4 left-4 text-2xl text-[#caa4ff]">✦</div><div className="absolute bottom-4 right-4 text-2xl text-[#caa4ff]">✦</div><motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#caa4ff]/50 bg-[#1b0d29] text-4xl">🤍</motion.div><div className="mt-5 text-xs uppercase tracking-[0.35em] text-[#caa4ff]">{promise.subtitle}</div><div className="mt-3 text-4xl font-black text-white">{promise.title}</div><div className="mt-2 text-[#caa4ff]">The final achievement of The Ranger's journey</div><div className="mx-auto my-6 h-px w-2/3 bg-gradient-to-r from-transparent via-[#caa4ff] to-transparent" /><div className="rounded-3xl border border-[#a040f0]/40 bg-black/35 p-6 text-lg italic leading-relaxed text-[#ead7ff]">“{promise.flavor}”</div><div className="mt-6 grid gap-3 text-left md:grid-cols-2">{["All achievements completed", "All titles earned", "Goal weight reached", "Proven by the person you became"].map((item) => <div key={item} className="rounded-2xl border border-[#a040f0]/35 bg-[#160b22] p-4 text-[#ead7ff]">🔒 {item}</div>)}</div><div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-[#d8c6ef]">{promise.made ? `Made on ${promise.made}` : "Made date locked"} · By {promise.by || "The Ranger"}{promise.for ? ` · For ${promise.for}` : ""}</div></motion.div></div>;
}

export default function RangerLogRPGWidget() {
  const [save, setSave] = useState(readSave);
  const [active, setActive] = useState("character");
  const today = getDay(save, todayKey());
  const totalXp = useMemo(() => getTotalXp(save), [save]);
  const levelInfo = useMemo(() => getLevel(totalXp), [totalXp]);
  const daily = useMemo(() => dayXp(today), [today]);
  const cw = currentWeight(save, today);

  return <div className="min-h-screen bg-[#0a0a0f] p-4 font-sans text-[#e8d5a3] md:p-6"><div className="mx-auto max-w-7xl"><div className="mb-5 overflow-hidden rounded-[2rem] border border-[#8a6a24]/60 bg-[radial-gradient(circle_at_top_left,rgba(240,192,64,0.18),transparent_32%),linear-gradient(135deg,#15110d,#0a0a0f)] p-5 shadow-[0_0_45px_rgba(240,192,64,0.12)]"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.35em] text-[#c6ad72]">Ranger Log System · Template Build</div><h1 className="mt-1 text-3xl font-black text-[#f0c040] md:text-5xl">⚔️ The Ranger's Log</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#d8c28b]">Day {save.meta.currentDay} · Snapshot {formatDate(save.meta.lastUpdated)} · Local-first tracker with text/JSON import, Quick Log parsing, food presets, XP, achievements, titles, and weight milestones.</p></div><div className="rounded-2xl border border-[#f0c040]/40 bg-black/35 p-4 text-right"><div className="text-sm text-[#c6ad72]">Current Weight</div><div className="text-3xl font-black text-[#f0c040]">{cw !== null ? `${cw} lbs` : "Not imported"}</div><div className="text-xs text-[#c6ad72]">Goal: {save.profile.goalWeight !== null ? `${save.profile.goalWeight} lbs` : "Not imported"}</div></div></div></div><div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#8a6a24]/40 bg-[#110d0a] p-2">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setActive(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${active === id ? "bg-[#3a2a08] text-[#f0c040] shadow-[0_0_18px_rgba(240,192,64,0.16)]" : "text-[#c6ad72] hover:bg-black/35 hover:text-[#e8d5a3]"}`}><Icon className="h-4 w-4" />{label}</button>)}</div><motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>{active === "character" && <CharacterTab save={save} today={today} levelInfo={levelInfo} daily={daily} totalXp={totalXp} />}{active === "quick" && <QuickLogTab save={save} setSave={setSave} />}{active === "quests" && <QuestsTab today={today} save={save} />}{active === "achievements" && <AchievementsTab save={save} />}{active === "levels" && <LevelsTab levelInfo={levelInfo} totalXp={totalXp} />}{active === "titles" && <TitlesTab save={save} totalXp={totalXp} />}{active === "data" && <DataTab save={save} setSave={setSave} />}{active === "promise" && <PromiseTab save={save} />}</motion.div></div></div>;
}
