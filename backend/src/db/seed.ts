import { db, initDatabase } from './index';
import { generateId } from '../utils/crypto';
import { logger } from '../utils/logger';

export const initialTasks = [
  {
    title: 'Errands & Daily Tasks',
    category: 'errands',
    description: 'Bills, banks, documents, government work',
    icon_name: 'checkbox-marked-circle-outline',
    sub_services: [
      'Pickups & Deliveries',
      'Payments & Renewals',
      'Documents & Government',
      'Shopping'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Home Services',
    category: 'home',
    description: 'AC, plumbing, electrical, cleaning, repairs',
    icon_name: 'home-outline',
    sub_services: [
      'AC Servicing & Repair',
      'Plumbing Assistance',
      'Electrician on Demand',
      'Deep Cleaning',
      'Appliance Repair'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Travel & Tourism',
    category: 'travel',
    description: 'Flights, hotels, visas, transfers, itineraries',
    icon_name: 'airplane-takeoff',
    sub_services: [
      'Book Travel',
      'On-Trip Support',
      'Documents & Visa',
      'Local Transport'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Health & Medical',
    category: 'health',
    description: 'Doctor visits, pharmacy, labs, physio',
    icon_name: 'heart-pulse',
    sub_services: [
      'Doctor Appointments',
      'Medicine Delivery',
      'Diagnostic Lab Tests',
      'Physiotherapy at Home'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Senior Care',
    category: 'senior',
    description: 'Check-ins, medicines, vitals, companionship',
    icon_name: 'account-group-outline',
    sub_services: [
      'Daily Check-in Calls',
      'Vitals & Health Monitoring',
      'Medication Refills',
      'Accompanied Visits'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Events & Management',
    category: 'events',
    description: 'Weddings, décor, catering, photography',
    icon_name: 'calendar-month-outline',
    sub_services: [
      'Venue & Catering',
      'Decor & Floral Styling',
      'Photography & Video',
      'Guest RSVPs'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Workforce Management',
    category: 'workforce',
    description: 'Maids, cooks, drivers, nannies, payroll',
    icon_name: 'briefcase-outline',
    sub_services: [
      'Maid Background Check & Hire',
      'Cook on Demand',
      'Personal Driver',
      'Childcare & Nanny'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Digital & Tech Help',
    category: 'digital',
    description: 'WiFi, CCTV, smart locks, device repair',
    icon_name: 'wifi',
    sub_services: [
      'WiFi Mesh & Network Setup',
      'CCTV Camera Installation',
      'Smart Door Locks',
      'Device Troubleshooting'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'Relocation Services',
    category: 'relocation',
    description: 'Packers, movers, handover, paperwork',
    icon_name: 'truck-delivery-outline',
    sub_services: [
      'Packers & Movers',
      'Apartment Handover',
      'Utility Transfer',
      'Packing & Unpacking'
    ],
    is_coming_soon: 0,
  },
  {
    title: 'NutriFix',
    category: 'nutrifix',
    description: 'Groceries, food delivery, diet plans, meal prep',
    icon_name: 'food-apple-outline',
    sub_services: ['Diet Consultation', 'Curated Groceries', 'Meal Prep Plans'],
    is_coming_soon: 1,
  },
  {
    title: 'Fashion & Styling',
    category: 'fashion',
    description: 'Salon at home, tailoring, styling, gifting',
    icon_name: 'content-cut',
    sub_services: ['Salon at Home', 'Custom Tailoring', 'Personal Styling'],
    is_coming_soon: 1,
  },
  {
    title: 'Religious & Cultural',
    category: 'religious',
    description: 'Pandit booking, puja, temple visits',
    icon_name: 'flower-outline',
    sub_services: ['Pandit Booking', 'Puja Samagri', 'Temple VIP Darshan'],
    is_coming_soon: 1,
  },
  {
    title: 'Business Support',
    category: 'business',
    description: 'Registration, GST, bookkeeping, compliance',
    icon_name: 'file-document-outline',
    sub_services: ['Company Registration', 'GST Filing', 'Bookkeeping'],
    is_coming_soon: 1,
  },
  {
    title: 'Education Support',
    category: 'education',
    description: 'Tutors, admissions, exam prep',
    icon_name: 'book-open-outline',
    sub_services: ['Home Tutors', 'School Admissions Guidance', 'Competitive Prep'],
    is_coming_soon: 1,
  },
  {
    title: 'Insurance & Loans',
    category: 'insurance',
    description: 'Compare policies, plan loans, paperwork handled',
    icon_name: 'shield-check-outline',
    sub_services: ['Health Insurance Advisory', 'Home Loan Assistance', 'Claim Filing'],
    is_coming_soon: 1,
  }
];

export function seedTasks() {
  initDatabase();

  const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (countRow.count > 0) {
    logger.info(`Tasks catalogue already seeded with ${countRow.count} tasks.`);
    return;
  }

  logger.info('Seeding tasks catalogue...');
  const insertStmt = db.prepare(`
    INSERT INTO tasks (id, title, category, description, icon_name, sub_services, is_coming_soon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((tasks) => {
    const now = new Date().toISOString();
    for (const t of tasks) {
      insertStmt.run(
        generateId(),
        t.title,
        t.category,
        t.description,
        t.icon_name,
        JSON.stringify(t.sub_services),
        t.is_coming_soon,
        now
      );
    }
  });

  insertMany(initialTasks);
  logger.info(`Successfully seeded ${initialTasks.length} task categories with 40+ sub-services!`);
}

if (require.main === module) {
  seedTasks();
}
