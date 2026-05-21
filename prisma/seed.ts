import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
  const { default: prisma } = await import("@/lib/prisma");
  const { subscriptionTemplates } = await import("./subscriptionTemplates");

  for (const template of subscriptionTemplates) {
    const createdTemplate = await prisma.subscriptionTemplate.upsert({
      where: {
        name: template.name,
      },
      update: {
        logo: template.logo,
        category: template.category,
      },
      create: {
        name: template.name,
        logo: template.logo,
        category: template.category,
      },
    });

    await prisma.subscriptionPlan.deleteMany({
      where: {
        templateId: createdTemplate.id,
      },
    });

    await prisma.subscriptionPlan.createMany({
      data: template.plans.map((plan) => ({
        templateId: createdTemplate.id,
        name: plan.name,
        amount: plan.amount,
        billingCycle: plan.billingCycle,
      })),
    });
  }

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log("Subscription templates seeded successfully");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });