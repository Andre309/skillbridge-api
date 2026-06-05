import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Хелпери ────────────────────────────────────────────────────
const hash = (p: string) => bcrypt.hash(p, 10)

const usd = (dollars: number) => Math.round(dollars * 100)

// ── Дані ───────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'development', name: 'Розробка',    icon: 'ti-code',              sortOrder: 1 },
  { slug: 'design',      name: 'Дизайн',      icon: 'ti-palette',           sortOrder: 2 },
  { slug: 'product',     name: 'Продукт',     icon: 'ti-chart-bar',         sortOrder: 3 },
  { slug: 'marketing',   name: 'Маркетинг',   icon: 'ti-device-analytics',  sortOrder: 4 },
  { slug: 'business',    name: 'Бізнес',      icon: 'ti-building',          sortOrder: 5 },
  { slug: 'career',      name: "Кар'єра",     icon: 'ti-certificate',       sortOrder: 6 },
  { slug: 'ai-ml',       name: 'AI / ML',     icon: 'ti-robot',             sortOrder: 7 },
  { slug: 'finance',     name: 'Фінанси',     icon: 'ti-coins',             sortOrder: 8 },
]

const SUBCATEGORIES: Record<string, { slug: string; name: string; sortOrder: number }[]> = {
  development: [
    { slug: 'backend',   name: 'Backend',        sortOrder: 1 },
    { slug: 'frontend',  name: 'Frontend',       sortOrder: 2 },
    { slug: 'mobile',    name: 'Mobile',         sortOrder: 3 },
    { slug: 'devops',    name: 'DevOps / Cloud', sortOrder: 4 },
    { slug: 'security',  name: 'Кібербезпека',   sortOrder: 5 },
    { slug: 'databases', name: 'Бази даних',     sortOrder: 6 },
  ],
  design: [
    { slug: 'ux',       name: 'UX / Research', sortOrder: 1 },
    { slug: 'ui',       name: 'UI / Visual',   sortOrder: 2 },
    { slug: 'branding', name: 'Бренд-дизайн',  sortOrder: 3 },
    { slug: 'motion',   name: 'Motion / 3D',   sortOrder: 4 },
  ],
  product: [
    { slug: 'product-strategy', name: 'Стратегія',  sortOrder: 1 },
    { slug: 'product-analytics',name: 'Аналітика',  sortOrder: 2 },
    { slug: 'product-growth',   name: 'Growth',     sortOrder: 3 },
  ],
  career: [
    { slug: 'cv-review',     name: 'CV Review',      sortOrder: 1 },
    { slug: 'interview-prep',name: 'Interview Prep', sortOrder: 2 },
    { slug: 'career-switch', name: 'Зміна кар\'єри', sortOrder: 3 },
  ],
}

const MENTORS = [
  {
    email:    'maria.koval@example.com',
    fullName: 'Марія Коваль',
    bio:      'Senior UX Designer з 7 роками досвіду. Працювала в Booking.com та Grammarly. Спеціалізуюсь на research, Figma та дизайн-системах.',
    timezone: 'Europe/Kyiv',
    profile: {
      headline:        'Senior UX Designer · ex-Booking.com',
      yearsExperience: 7,
      company:         'Booking.com',
      position:        'Senior UX Designer',
      linkedinUrl:     'https://linkedin.com/in/maria-koval',
      languages:       ['uk', 'en'],
      isFeatured:      true,
      isVerified:      true,
      avgRating:       4.9,
      totalReviews:    41,
      totalSessions:   98,
    },
    services: [
      { slug: 'ux',  title: 'Фідбек на ваш UX/UI дизайн',     duration: 30, price: 25, tags: ['Figma', 'UX Review', 'UI'] },
      { slug: 'ux',  title: 'Допомога з Portfolio для дизайнера', duration: 60, price: 45, tags: ['Portfolio', 'Career'] },
      { slug: 'ux',  title: 'User Research консультація',       duration: 30, price: 30, tags: ['Research', 'Usability'] },
    ],
  },
  {
    email:    'dmytro.petrenko@example.com',
    fullName: 'Дмитро Петренко',
    bio:      'Backend Engineer з 9 роками досвіду. Node.js, Go, AWS, system design. Зараз Tech Lead у фінтех-стартапі.',
    timezone: 'Europe/Kyiv',
    profile: {
      headline:        'Tech Lead · Node.js / Go / AWS',
      yearsExperience: 9,
      company:         'FinTech UA',
      position:        'Tech Lead',
      linkedinUrl:     'https://linkedin.com/in/dmytro-petrenko',
      githubUrl:       'https://github.com/dpetrenko',
      languages:       ['uk', 'en'],
      isFeatured:      true,
      isVerified:      true,
      avgRating:       4.8,
      totalReviews:    37,
      totalSessions:   142,
    },
    services: [
      { slug: 'backend',  title: 'Code Review вашого Node.js / Go коду', duration: 30, price: 35, tags: ['Node.js', 'Go', 'Code Review'] },
      { slug: 'backend',  title: 'System Design сесія',                   duration: 60, price: 60, tags: ['System Design', 'Architecture'] },
      { slug: 'databases',title: 'Оптимізація PostgreSQL запитів',        duration: 30, price: 40, tags: ['PostgreSQL', 'Performance'] },
      { slug: 'interview-prep', title: 'Підготовка до технічного інтерв\'ю', duration: 60, price: 55, tags: ['Interview', 'Algorithms'] },
    ],
  },
  {
    email:    'olena.savchenko@example.com',
    fullName: 'Олена Савченко',
    bio:      'Product Manager з 6 роками у B2B SaaS. Запускала продукти в США та Європі. Ментор YC Startup School.',
    timezone: 'Europe/Kyiv',
    profile: {
      headline:        'Product Manager · B2B SaaS · ex-YC',
      yearsExperience: 6,
      company:         'SaaSify',
      position:        'Head of Product',
      linkedinUrl:     'https://linkedin.com/in/olena-savchenko',
      languages:       ['uk', 'en', 'pl'],
      isFeatured:      true,
      isVerified:      true,
      avgRating:       5.0,
      totalReviews:    29,
      totalSessions:   61,
    },
    services: [
      { slug: 'product-strategy', title: 'Product Strategy Review',      duration: 60, price: 70, tags: ['Strategy', 'Roadmap', 'B2B'] },
      { slug: 'product-strategy', title: 'Фідбек на ваш PRD',            duration: 30, price: 40, tags: ['PRD', 'Documentation'] },
      { slug: 'product-growth',   title: 'Growth консультація для SaaS', duration: 45, price: 55, tags: ['Growth', 'Metrics', 'GTM'] },
    ],
  },
  {
    email:    'ivan.vasylenko@example.com',
    fullName: 'Іван Василенко',
    bio:      'Staff Engineer у Google (Zürich). Спеціалізуюсь на system design, distributed systems та підготовці до FAANG інтерв\'ю.',
    timezone: 'Europe/Zurich',
    profile: {
      headline:        'Staff Engineer · Google Zürich',
      yearsExperience: 12,
      company:         'Google',
      position:        'Staff Software Engineer',
      linkedinUrl:     'https://linkedin.com/in/ivan-vasylenko',
      githubUrl:       'https://github.com/ivasylenko',
      languages:       ['uk', 'en', 'de'],
      isFeatured:      false,
      isVerified:      true,
      avgRating:       5.0,
      totalReviews:    58,
      totalSessions:   142,
    },
    services: [
      { slug: 'interview-prep', title: 'FAANG Interview Prep (System Design)', duration: 60, price: 90, tags: ['FAANG', 'System Design', 'Google'] },
      { slug: 'interview-prep', title: 'Алгоритми та структури даних',         duration: 60, price: 80, tags: ['Algorithms', 'LeetCode'] },
      { slug: 'backend',        title: 'Distributed Systems консультація',      duration: 45, price: 75, tags: ['Distributed', 'Scalability'] },
    ],
  },
  {
    email:    'roman.kharchenko@example.com',
    fullName: 'Роман Харченко',
    bio:      'Growth PM та серійний підприємець. 3 успішних стартапи. Допомагаю з GTM-стратегіями, аналітикою та залученням інвестицій.',
    timezone: 'Europe/Warsaw',
    profile: {
      headline:        'Growth PM · 3x Founder',
      yearsExperience: 10,
      company:         'StartupLab',
      position:        'Founder & Advisor',
      linkedinUrl:     'https://linkedin.com/in/roman-kharchenko',
      languages:       ['uk', 'en'],
      isFeatured:      false,
      isVerified:      true,
      avgRating:       4.8,
      totalReviews:    22,
      totalSessions:   61,
    },
    services: [
      { slug: 'product-growth',    title: 'GTM стратегія для стартапу',  duration: 60, price: 80, tags: ['GTM', 'Startup', 'Strategy'] },
      { slug: 'business',          title: 'Pitch Deck Review',            duration: 45, price: 60, tags: ['Pitch', 'Investors', 'Deck'] },
      { slug: 'product-analytics', title: 'Побудова аналітики з нуля',   duration: 60, price: 70, tags: ['Analytics', 'Mixpanel', 'Amplitude'] },
    ],
  },
]

// Тестовий менті
const MENTEE = {
  email:    'test.mentee@example.com',
  fullName: 'Тестовий Менті',
  timezone: 'Europe/Kyiv',
}

// ── Головна функція ────────────────────────────────────────────
async function main() {
  console.log('icon Починаємо seed...\n')

  // 1. Категорії
  console.log('icon Створюємо категорії...')
  const categoryMap = new Map<string, string>() // slug → id

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: cat,
      create: cat,
    })
    categoryMap.set(cat.slug, created.id)
    console.log(`   ✓ ${cat.name}`)
  }

  for (const [parentSlug, subs] of Object.entries(SUBCATEGORIES)) {
    const parentId = categoryMap.get(parentSlug)!
    for (const sub of subs) {
      const created = await prisma.category.upsert({
        where:  { slug: sub.slug },
        update: { ...sub, parentId },
        create: { ...sub, parentId },
      })
      categoryMap.set(sub.slug, created.id)
    }
  }
  console.log(`   ✓ Підкатегорії додано\n`)

  // 2. Тестовий менті
  console.log('icon Створюємо тестового менті...')
  await prisma.user.upsert({
    where:  { email: MENTEE.email },
    update: {},
    create: {
      email:         MENTEE.email,
      fullName:      MENTEE.fullName,
      timezone:      MENTEE.timezone,
      passwordHash:  await hash('password123'),
      emailVerified: true,
      role:          'mentee',
    },
  })
  console.log(`   ✓ ${MENTEE.email} / password123\n`)

  // 3. Ментори
  console.log('icon Створюємо менторів...')
  for (const mentor of MENTORS) {
    const user = await prisma.user.upsert({
      where:  { email: mentor.email },
      update: {},
      create: {
        email:         mentor.email,
        fullName:      mentor.fullName,
        bio:           mentor.bio,
        timezone:      mentor.timezone,
        passwordHash:  await hash('password123'),
        emailVerified: true,
        role:          'mentor',
      },
    })

    const mp = await prisma.mentorProfile.upsert({
      where:  { userId: user.id },
      update: mentor.profile as any,
      create: { userId: user.id, ...(mentor.profile as any) },
    })

    // Послуги
    for (const svc of mentor.services) {
      const categoryId = categoryMap.get(svc.slug)

      // Перевіряємо чи вже є така послуга
      const existing = await prisma.service.findFirst({
        where: { mentorId: mp.id, title: svc.title },
      })

      if (!existing) {
        await prisma.service.create({
          data: {
            mentorId:       mp.id,
            categoryId,
            title:          svc.title,
            durationMinutes: svc.duration as 15 | 30 | 45 | 60 | 90,
            priceCents:     usd(svc.price),
            currency:       'USD',
            tags:           svc.tags,
            isActive:       true,
          },
        })
      }
    }

    // Шаблон доступності — пн-пт 10:00–18:00
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    for (const day of weekdays) {
      await prisma.availabilityTemplate.upsert({
        where:  { mentorId_day_startTime: { mentorId: mp.id, day, startTime: '10:00' } },
        update: {},
        create: { mentorId: mp.id, day, startTime: '10:00', endTime: '18:00', isActive: true },
      })
    }

    console.log(`   ✓ ${mentor.fullName} — ${mentor.services.length} послуг`)
  }

  // 4. Промокоди
  console.log('icon  Створюємо промокоди...')
  const promoCodes = [
    { code: 'WELCOME20', discountPct: 20,  maxUses: 100 },
    { code: 'FIRST10',   discountPct: 10,  maxUses: null },
    { code: 'FLAT5',     discountCents: 500, maxUses: 50 }, // $5 знижка
  ]

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where:  { code: promo.code },
      update: {},
      create: {
        code:           promo.code,
        discountPct:    'discountPct' in promo ? promo.discountPct : null,
        discountCents:  'discountCents' in promo ? promo.discountCents : null,
        maxUses:        promo.maxUses,
        isActive:       true,
        validFrom:      new Date(),
      },
    })
    console.log(`   ✓ ${promo.code}`)
  }

  // 5. Підсумок
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.mentorProfile.count(),
    prisma.category.count(),
    prisma.service.count(),
    prisma.availabilityTemplate.count(),
    prisma.promoCode.count(),
  ])

  console.log('\n✅ Seed завершено!\n')
  console.log('icon Статистика:')
  console.log(`   Users:                 ${stats[0]}`)
  console.log(`   Mentor Profiles:       ${stats[1]}`)
  console.log(`   Categories:            ${stats[2]}`)
  console.log(`   Services:              ${stats[3]}`)
  console.log(`   Availability Templates:${stats[4]}`)
  console.log(`   Promo Codes:           ${stats[5]}`)
  console.log('icon Тестові акаунти (пароль: password123):')
  console.log(`   Менті:    ${MENTEE.email}`)
  MENTORS.forEach(m => console.log(`   Ментор:   ${m.email}`))
}

main()
  .catch((e) => { console.error('❌ Seed помилка:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
