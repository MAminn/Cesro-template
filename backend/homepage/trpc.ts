import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  publicProcedure,
  router,
  protectedProcedure,
} from "#root/shared/trpc/server";
import { getHomepageContent } from "./get-homepage-content";
import { updateHomepageContent } from "./update-homepage-content";
import { uploadHeroImage } from "./upload-hero-image";
import { type HomepageContent } from "#root/shared/types/homepage-content";
import { HomepageContentSchema } from "#root/shared/types/homepage-content-schema";
import { cesroLandingContentSchema } from "#root/components/template-system/landing/cesro/validators";
import type { CesroLandingContent } from "#root/components/template-system/landing/cesro/content-schema";
import { Effect } from "effect";

/**
 * Picks the correct Zod schema based on templateId and validates content.
 * Throws a TRPCError with path-level details on failure.
 */
function validateHomepageContent(
  templateId: string | undefined,
  content: unknown,
): HomepageContent | CesroLandingContent {
  const schema =
    templateId === "landing-cesro"
      ? cesroLandingContentSchema
      : HomepageContentSchema;

  const parsed = schema.safeParse(content);
  if (parsed.success)
    return parsed.data as HomepageContent | CesroLandingContent;

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  });
}

export const homepageRouter = router({
  getContent: publicProcedure
    .input(
      z.object({
        merchantId: z.string().uuid(),
        templateId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const content = await getHomepageContent(
        input.merchantId,
        input.templateId,
      );
      return {
        success: true,
        result: content,
      };
    }),

  updateContent: protectedProcedure
    .input(
      z.object({
        merchantId: z.string().uuid(),
        templateId: z.string().optional(),
        content: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(
        "[wire-debug] SERVER received hero.primaryCta:",
        JSON.stringify((input.content as any)?.hero?.primaryCta ?? {}),
      );

      const validated = validateHomepageContent(
        input.templateId,
        input.content,
      );

      const content = await updateHomepageContent(
        input.merchantId,
        validated as HomepageContent,
        input.templateId,
      );
      return {
        success: true,
        result: content,
      };
    }),

  uploadHeroImage: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          buffer: z.instanceof(Uint8Array),
        }),
        preserveAspect: z.boolean().nullish(), // For brand statement images
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.clientSession;

      // Only admins can upload homepage hero images
      if (!session || session.role !== "admin") {
        return {
          success: false as const,
          error: "Unauthorized. Only admins can upload homepage images.",
        };
      }

      try {
        const result = await Effect.runPromise(
          uploadHeroImage({
            buffer: input.file.buffer,
            mimeType: input.file.type,
            preserveAspect: input.preserveAspect ?? undefined,
          }),
        );

        return {
          success: true as const,
          data: result,
        };
      } catch (error) {
        console.error("Homepage hero image upload error:", error);
        return {
          success: false as const,
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        };
      }
    }),

  uploadMobileHeroImage: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          buffer: z.instanceof(Uint8Array),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.clientSession;

      // Only admins can upload homepage hero images
      if (!session || session.role !== "admin") {
        return {
          success: false as const,
          error: "Unauthorized. Only admins can upload homepage images.",
        };
      }

      try {
        const result = await Effect.runPromise(
          uploadHeroImage({
            buffer: input.file.buffer,
            mimeType: input.file.type,
            filenamePrefix: "hero-mobile",
          }),
        );

        return {
          success: true as const,
          data: result,
        };
      } catch (error) {
        console.error("Mobile hero image upload error:", error);
        return {
          success: false as const,
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        };
      }
    }),
});
