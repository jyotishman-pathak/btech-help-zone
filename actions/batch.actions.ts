"use server";


import { z } from "zod";
import { auth } from "../auth";
import prisma from "../lib/prisma.client";
import { audit } from "../lib/audit";

const CreateBatchSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  type: z.enum(["CEE_PREP", "BTECH", "COMPETITIVE", "FREE"]),
  isFree: z.boolean(),
  price: z.number().min(0),
  validDays: z.number().optional(),
  description: z.string().optional(),
  features: z.array(z.string()),
});

export async function createBatch(input: z.infer<typeof CreateBatchSchema>) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    throw new Error("Unauthorized");

  const validated = CreateBatchSchema.parse(input);

  const batch = await prisma.batch.create({
    data: {
      ...validated,
      features: {
        create: validated.features.map((text, order) => ({ text, order })),
      },
    },
  });

  await audit({
    actorId: session!.user!.id as string,
    action: "BATCH_CREATED",
    entity: "Batch",
    entityId: batch.id,
    newValue: batch,
  });

  return batch;
}