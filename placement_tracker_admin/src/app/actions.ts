"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

const testSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  ques: z.coerce.number().min(1, "Must have at least 1 question"),
});

type FormState = {
    message: string;
    errors: {
        title?: string[];
        duration?: string[];
        ques?: string[];
    } | undefined;
}

export async function addAptitudeTest(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = testSchema.safeParse({
    title: formData.get("title"),
    duration: formData.get("duration"),
    ques: formData.get("ques"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    await addDoc(collection(db, "aptitude_tests"), validatedFields.data);
    revalidatePath("/dashboard/aptitude-tests");
    return { message: "Aptitude test added successfully.", errors: {} };
  } catch (e) {
    return { message: "Database Error: Failed to add test.", errors: {} };
  }
}

export async function addSoftSkillTest(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = testSchema.safeParse({
    title: formData.get("title"),
    duration: formData.get("duration"),
    ques: formData.get("ques"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }
  
  try {
    await addDoc(collection(db, "softskill_tests"), validatedFields.data);
    revalidatePath("/dashboard/soft-skills-tests");
    return { message: "Soft skill test added successfully.", errors: {} };
  } catch (e) {
    return { message: "Database Error: Failed to add test.", errors: {} };
  }
}
