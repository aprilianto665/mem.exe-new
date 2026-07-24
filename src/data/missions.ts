import type { Mission } from "../types/mission.types";

export const missions: Mission[] = [
  {
    id: "1",
    name: "Belajar Bahasa C",
    reason:
      "Untuk meningkatkan skill programming dan memahami low-level programming",
    commitmentType: "daily-habit",
    commitmentLevel: "normal",
    frequency: "everyday",
    currentDays: 15,
    minutesPerDay: 60,
    targetMinutes: 120,
    currentMinutes: 45,
    status: "active",
    streak: 5,
    missed: 2,
  },
  {
    id: "4",
    name: "Learn Python",
    reason: "To expand programming skills and learn data science",
    commitmentType: "daily-habit",
    commitmentLevel: "normal",
    frequency: "everyday",
    minutesPerDay: 60,
    targetMinutes: 60,
    currentMinutes: 0,
    status: "active",
  },
  {
    id: "2",
    name: "Latihan Coding Algorithm",
    reason:
      "Mempersiapkan diri untuk technical interview dan competitive programming",
    commitmentType: "challenge",
    commitmentLevel: "hard",
    frequency: "custom",
    selectedDays: [1, 2, 3, 4, 5], // Weekdays
    duration: 30,
    currentDays: 10,
    minutesPerDay: 90,
    targetMinutes: 90,
    currentMinutes: 30,
    status: "completed",
    streak: 10,
    missed: 1,
  },
  {
    id: "3",
    name: "Baca Technical Book",
    reason:
      "Memperluas pengetahuan tentang software architecture dan design patterns",
    commitmentType: "daily-habit",
    commitmentLevel: "normal",
    frequency: "custom",
    selectedDays: [0, 6], // Weekends
    currentDays: 3,
    minutesPerDay: 60,
    targetMinutes: 60,
    currentMinutes: 0,
    status: "canceled",
    streak: 0,
    missed: 4,
  },
];
