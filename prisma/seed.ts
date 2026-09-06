import { PrismaClient, GoalType, GoalStatus, ProgressMode, TransactionType, HabitSource } from "@prisma/client";
import { startOfWeek } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ORBIT database...");

  // 1. Create Default User
  const user = await prisma.user.upsert({
    where: { email: "alex@orbit.local" },
    update: {},
    create: {
      email: "alex@orbit.local",
      name: "Alex",
      timezone: "Asia/Jakarta",
    },
  });

  console.log(`👤 User verified: ${user.name} (${user.id})`);

  // 2. Finance Profile
  await prisma.financeProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      startingBalance: 2000000,
      startingBalanceDate: new Date("2026-01-01T00:00:00.000Z"),
      actualBalance: 4750000,
      actualBalanceUpdatedAt: new Date(),
    },
  });

  // 3. Goals
  const goalJob = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Get First Job",
      description: "Prepare CV, portfolio, apply to frontend / fullstack roles, and pass technical interviews.",
      type: GoalType.MILESTONE,
      status: GoalStatus.IN_PROGRESS,
      deadline: new Date("2026-11-30T00:00:00.000Z"),
      milestones: {
        create: [
          { title: "CV & Resume Review", isCompleted: true, order: 1, completedAt: new Date("2026-08-15") },
          { title: "Portfolio Website Complete", isCompleted: true, order: 2, completedAt: new Date("2026-08-20") },
          { title: "Apply to 20 Companies", isCompleted: true, order: 3, completedAt: new Date("2026-09-05") },
          { title: "Technical Interview Practice", isCompleted: false, order: 4 },
          { title: "Job Offer Accepted", isCompleted: false, order: 5 },
        ],
      },
    },
  });

  const goalSave = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Save Rp10M",
      description: "Emergency fund and gear upgrade savings.",
      type: GoalType.MEASURABLE,
      status: GoalStatus.IN_PROGRESS,
      progressMode: ProgressMode.FINANCE,
      currentValue: 4000000,
      targetValue: 10000000,
      unit: "Rp",
      deadline: new Date("2026-12-31T00:00:00.000Z"),
    },
  });

  const goalPortfolio = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Build Portfolio v1",
      description: "Personal responsive showcase site.",
      type: GoalType.MILESTONE,
      status: GoalStatus.COMPLETED,
      completedAt: new Date("2026-08-20T00:00:00.000Z"),
      deadline: new Date("2026-08-20T00:00:00.000Z"),
      milestones: {
        create: [
          { title: "Design mockup", isCompleted: true, order: 1, completedAt: new Date("2026-08-10") },
          { title: "Deploy to Vercel", isCompleted: true, order: 2, completedAt: new Date("2026-08-20") },
        ],
      },
    },
  });

  // 4. Habits
  const habitCoding = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Coding",
      description: "Daily deliberate practice in TypeScript and web development.",
      goalId: goalJob.id,
    },
  });

  const habitExercise = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Exercise",
      description: "Daily 30-min physical workout or running.",
    },
  });

  const habitReading = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Reading",
      description: "Daily reading 20 pages of books or articles.",
    },
  });

  // Habit Completions for the week (e.g. 2026-08-31 to 2026-09-06)
  const habitDates = ["2026-08-31", "2026-09-01", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06"];
  for (const d of habitDates) {
    await prisma.habitCompletion.create({
      data: {
        habitId: habitCoding.id,
        date: d,
        source: HabitSource.ACTIVITY,
      },
    });
  }

  // 5. Activities
  const act1 = await prisma.activity.create({
    data: {
      userId: user.id,
      title: "Belajar JavaScript Array Methods",
      startedAt: new Date("2026-09-06T19:30:00.000Z"),
      endedAt: new Date("2026-09-06T21:00:00.000Z"),
      durationMinutes: 90,
      note: "Practiced map, filter, reduce on real arrays without mutations.",
      goalId: goalJob.id,
      habitId: habitCoding.id,
    },
  });

  const act2 = await prisma.activity.create({
    data: {
      userId: user.id,
      title: "Frontend development practice",
      startedAt: new Date("2026-09-05T14:00:00.000Z"),
      endedAt: new Date("2026-09-05T16:00:00.000Z"),
      durationMinutes: 120,
      goalId: goalJob.id,
      habitId: habitCoding.id,
    },
  });

  // 6. Learnings
  await prisma.learning.create({
    data: {
      userId: user.id,
      topic: "Array Methods",
      takeaways:
        "map() transforms each item into a new array.\nfilter() selects items based on a condition.\nreduce() combines values into a single result without state mutations.",
      source: "YouTube tutorial & MDN docs",
      activityId: act1.id,
      goalId: goalJob.id,
    },
  });

  await prisma.learning.create({
    data: {
      userId: user.id,
      topic: "JavaScript Functions & Closures",
      takeaways: "Learned callback functions and how scope retains access to variables declared in outer scopes.",
      source: "JavaScript Guide",
      goalId: goalJob.id,
    },
  });

  // 7. Finance: Transactions & Budgets
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: TransactionType.EXPENSE,
        amount: 25000,
        category: "Food",
        note: "Lunch",
        date: new Date("2026-09-06T12:00:00.000Z"),
      },
      {
        userId: user.id,
        type: TransactionType.INCOME,
        amount: 3000000,
        category: "Salary",
        note: "Monthly stipend / salary",
        goalId: goalSave.id,
        date: new Date("2026-09-05T09:00:00.000Z"),
      },
      {
        userId: user.id,
        type: TransactionType.EXPENSE,
        amount: 15000,
        category: "Transport",
        note: "Bus fare",
        date: new Date("2026-09-04T08:30:00.000Z"),
      },
      {
        userId: user.id,
        type: TransactionType.EXPENSE,
        amount: 150000,
        category: "Internet",
        note: "Monthly fiber broadband",
        date: new Date("2026-09-02T10:00:00.000Z"),
      },
    ],
  });

  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        category: "Food",
        amount: 1000000,
        periodStart: new Date("2026-09-01T00:00:00.000Z"),
        periodEnd: new Date("2026-09-30T23:59:59.000Z"),
      },
      {
        userId: user.id,
        category: "Transport",
        amount: 500000,
        periodStart: new Date("2026-09-01T00:00:00.000Z"),
        periodEnd: new Date("2026-09-30T23:59:59.000Z"),
      },
      {
        userId: user.id,
        category: "Education",
        amount: 500000,
        periodStart: new Date("2026-09-01T00:00:00.000Z"),
        periodEnd: new Date("2026-09-30T23:59:59.000Z"),
      },
    ],
  });

  // 8. Weekly Reflection
  const monday = startOfWeek(new Date("2026-08-31"), { weekStartsOn: 1 });
  await prisma.reflection.create({
    data: {
      userId: user.id,
      weekStart: monday,
      whatHappened: "This week I worked on my portfolio and started applying for frontend developer jobs.",
      whatLearned: "I learned more about array methods and avoiding manual loops.",
      whatChanged: "I feel more confident about building UIs without looking up tutorials every step.",
      notes: "Consistency with morning routine made a huge difference.",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
