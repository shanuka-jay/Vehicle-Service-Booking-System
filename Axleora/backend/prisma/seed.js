import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const groups = [
  { name: "Maintenance", slug: "maintenance", description: "Routine servicing that protects reliability and reduces avoidable wear.", sortOrder: 10 },
  { name: "Diagnostics", slug: "diagnostics", description: "Structured inspection for warning lights, performance changes and unfamiliar symptoms.", sortOrder: 20 },
  { name: "Safety & Handling", slug: "safety-and-handling", description: "Brake, steering, tyre and road-control checks.", sortOrder: 30 },
  { name: "Appearance", slug: "appearance", description: "Interior and exterior care for a cleaner, protected finish.", sortOrder: 40 }
];

const services = [
  {
    name: "Oil Change",
    slug: "oil-change",
    group: "maintenance",
    description: "Premium oil and filter replacement with a 20-point safety check.",
    longDescription: "Fresh engine oil and a suitable filter help control friction, heat and contamination. The visit also gives the technician an opportunity to check common fluid levels and visible wear before small issues grow.",
    estimatedDuration: "45–60 min",
    priceRange: "LKR 8,500 – 18,000",
    isFeatured: true,
    includedItems: ["Engine oil replacement", "Oil filter replacement", "Fluid-level check", "Visual leak inspection", "Basic safety check"],
    benefits: ["Supports engine lubrication and temperature control", "Helps maintain consistent performance", "Creates an opportunity to identify visible wear early"],
    gallery: ["/images/full-service.jpg", "/images/engine-diagnosis.jpg", "/images/battery-check.jpg"]
  },
  {
    name: "Full Service",
    slug: "full-service",
    group: "maintenance",
    description: "Complete scheduled maintenance covering engine, fluids, brakes, tyres and diagnostics.",
    longDescription: "A broader scheduled-maintenance visit covering the vehicle systems most affected by regular driving. The exact work depends on model, service interval and condition found during inspection.",
    estimatedDuration: "3–5 hours",
    priceRange: "LKR 28,000 – 65,000",
    isFeatured: true,
    includedItems: ["Engine oil and filter service", "Fluid and battery checks", "Brake and tyre inspection", "Lights and wiper check", "Diagnostic and roadworthiness observations"],
    benefits: ["Brings routine maintenance into one visit", "Helps prepare the vehicle for regular or long-distance use", "Provides a clearer picture of current vehicle condition"],
    gallery: ["/images/engine-diagnosis.jpg", "/images/oil-change.jpg", "/images/brake-inspection.jpg"]
  },
  {
    name: "Engine Diagnosis",
    slug: "engine-diagnosis",
    group: "diagnostics",
    description: "Computer diagnostics and technician inspection to identify warning lights and performance issues.",
    longDescription: "A diagnostic starting point for warning lights, difficult starting, rough running, unusual fuel consumption or reduced performance. Scan information is combined with technician inspection rather than treated as a parts-replacement instruction.",
    estimatedDuration: "60–90 min",
    priceRange: "LKR 7,500 – 15,000",
    isFeatured: true,
    includedItems: ["Diagnostic fault-code scan", "Visual engine-bay inspection", "Battery and charging observations", "Symptom review with technician", "Recommended next-step summary"],
    benefits: ["Reduces guesswork before repair decisions", "Connects warning codes to real symptoms", "Helps prioritize the next inspection or repair"],
    gallery: ["/images/full-service.jpg", "/images/battery-check.jpg", "/images/hero.jpg"]
  },
  {
    name: "Brake Inspection",
    slug: "brake-inspection",
    group: "safety-and-handling",
    description: "Brake pad, disc, fluid and hydraulic system safety inspection.",
    longDescription: "A focused check when braking noise, pedal feel or stopping behaviour changes. Components are inspected for visible wear and hydraulic concerns before repair work is recommended.",
    estimatedDuration: "45–90 min",
    priceRange: "LKR 5,000 – 35,000",
    isFeatured: false,
    includedItems: ["Brake pad and disc inspection", "Fluid-level and visible leak check", "Pedal-feel assessment", "Brake-line and hose observations", "Repair guidance based on findings"],
    benefits: ["Supports safer stopping performance", "Identifies visible wear before it becomes severe", "Provides evidence before replacement decisions"],
    gallery: ["/images/wheel-alignment.jpg", "/images/full-service.jpg", "/images/hero.jpg"]
  },
  {
    name: "Wheel Alignment",
    slug: "wheel-alignment",
    group: "safety-and-handling",
    description: "Computerized four-wheel alignment and tyre condition report.",
    longDescription: "Computerized alignment measurement for vehicles that pull, show uneven tyre wear or feel unsettled after impacts and suspension work.",
    estimatedDuration: "45–60 min",
    priceRange: "LKR 6,500 – 12,000",
    isFeatured: false,
    includedItems: ["Alignment measurement", "Steering-position check", "Tyre wear observation", "Adjustment where applicable", "Post-adjustment verification"],
    benefits: ["Helps reduce uneven tyre wear", "Supports straight-line stability", "Can improve steering confidence"],
    gallery: ["/images/brake-inspection.jpg", "/images/full-service.jpg", "/images/hero.jpg"]
  },
  {
    name: "Battery Check",
    slug: "battery-check",
    group: "maintenance",
    description: "Battery health, charging system and starter performance test.",
    longDescription: "A practical battery and charging-system check for slow starting, electrical uncertainty or preventative maintenance.",
    estimatedDuration: "20–30 min",
    priceRange: "LKR 2,500 – 5,000",
    isFeatured: false,
    includedItems: ["Battery condition test", "Charging-voltage check", "Terminal inspection", "Starter-performance observation", "Replacement guidance if required"],
    benefits: ["Reduces unexpected starting problems", "Checks whether charging behaviour is healthy", "Supports evidence-based replacement timing"],
    gallery: ["/images/battery-check.jpg", "/images/engine-diagnosis.jpg", "/images/full-service.jpg"]
  },
  {
    name: "Car Wash & Detailing",
    slug: "car-wash-and-detailing",
    group: "appearance",
    description: "Interior deep clean, exterior wash, polish and finish protection.",
    longDescription: "Interior and exterior cleaning intended to restore presentation and remove accumulated road grime. Available work depends on the selected finish and vehicle condition.",
    estimatedDuration: "2–4 hours",
    priceRange: "LKR 12,000 – 35,000",
    isFeatured: false,
    includedItems: ["Exterior wash", "Interior vacuum and surface cleaning", "Wheel and trim cleaning", "Paint-finish assessment", "Optional polish guidance"],
    benefits: ["Improves everyday cabin cleanliness", "Restores a more presentable exterior", "Helps identify finish areas needing extra care"],
    gallery: ["/images/hero.jpg", "/images/full-service.jpg", "/images/wheel-alignment.jpg"]
  }
];

const testimonials = [
  { customerName: "Nimal Perera", vehicleLabel: "Toyota Aqua", quote: "The booking process was clear, and the workshop explained what needed attention before starting the work.", rating: 5, sortOrder: 10 },
  { customerName: "Shanika Fernando", vehicleLabel: "Honda Vezel", quote: "I could track the request without creating an account, and the service team kept the appointment straightforward.", rating: 5, sortOrder: 20 },
  { customerName: "Kasun Silva", vehicleLabel: "Suzuki Wagon R", quote: "The service page helped me choose the right starting point instead of guessing which repair I needed.", rating: 5, sortOrder: 30 }
];

async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  if (!ownerPassword || ownerPassword.length < 12) {
    throw new Error("Set SEED_OWNER_PASSWORD to at least 12 characters before running the seed");
  }

  const ownerUsername = (process.env.SEED_OWNER_USERNAME || "owner").toLowerCase();
  const ownerEmail = process.env.SEED_OWNER_EMAIL?.toLowerCase() || null;
  const passwordHash = await bcrypt.hash(ownerPassword, 12);
  await prisma.user.upsert({
    where: { username: ownerUsername },
    update: {
      fullName: process.env.SEED_OWNER_NAME || "Workshop Owner",
      email: ownerEmail,
      passwordHash,
      role: "OWNER",
      isActive: true
    },
    create: {
      fullName: process.env.SEED_OWNER_NAME || "Workshop Owner",
      username: ownerUsername,
      email: ownerEmail,
      passwordHash,
      role: "OWNER",
      isActive: true
    }
  });

  const groupIds = {};
  for (const group of groups) {
    const saved = await prisma.serviceGroup.upsert({
      where: { slug: group.slug },
      update: { ...group, isActive: true },
      create: { ...group, isActive: true }
    });
    groupIds[group.slug] = saved.id;
  }

  for (const service of services) {
    const { group, includedItems, benefits, gallery, ...details } = service;
    const saved = await prisma.serviceCategory.upsert({
      where: { name: service.name },
      update: {
        ...details,
        groupId: groupIds[group],
        includedItems: JSON.stringify(includedItems),
        benefits: JSON.stringify(benefits),
        isActive: true
      },
      create: {
        ...details,
        groupId: groupIds[group],
        includedItems: JSON.stringify(includedItems),
        benefits: JSON.stringify(benefits),
        isActive: true
      }
    });
    if (await prisma.serviceImage.count({ where: { serviceId: saved.id } }) === 0) {
      await prisma.serviceImage.createMany({
        data: gallery.map((imageUrl, sortOrder) => ({
          serviceId: saved.id,
          imageUrl,
          altText: `${saved.name} workshop image ${sortOrder + 1}`,
          sortOrder
        }))
      });
    }
  }

  if (await prisma.testimonial.count() === 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  }

  console.log(`Seed complete. Owner account created for ${ownerUsername}.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
