import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../trpc";

export const linkedinRouter = {
  upsert: publicProcedure
    .input(
      z.object({
        username: z.string(),
        name: z.string(),
        headline: z.string().optional(),
        location: z.string().optional(),
        profileUrl: z.string(),
        experiences: z
          .array(
            z.object({
              order: z.number(),
              companyName: z.string(),
              companyId: z.string(),
              companyLink: z.string().optional(),
              jobTitle: z.string().optional(),
              duration: z.string().optional(),
              description: z.string().optional(),
              roles: z
                .array(
                  z.object({
                    jobTitle: z.string().optional(),
                    employmentType: z.string().optional(),
                    duration: z.string().optional(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
        education: z
          .array(
            z.object({
              order: z.number(),
              schoolName: z.string(),
              schoolId: z.string(),
              schoolLink: z.string().optional(),
              degree: z.string().optional(),
              duration: z.string().optional(),
            }),
          )
          .optional(),
        lastUpdated: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.profile.upsert({
        where: {
          username: input.username,
        },
        update: {
          name: input.name,
          headline: input.headline,
          location: input.location,
          profileUrl: input.profileUrl,
          lastUpdated: input.lastUpdated,
        },
        create: {
          username: input.username,
          name: input.name,
          headline: input.headline,
          location: input.location,
          profileUrl: input.profileUrl,
          lastUpdated: input.lastUpdated,
        },
      });

      if (input.experiences) {
        for (const exp of input.experiences) {
          try {
            const organization = await ctx.db.organization.upsert({
              where: {
                companyId: exp.companyId,
              },
              update: {
                name: exp.companyName,
              },
              create: {
                companyId: exp.companyId,
                name: exp.companyName,
              },
            });

            const parseDate = (dateStr: string | undefined) => {
              if (!dateStr) return null;
              const date = new Date(dateStr);
              return isNaN(date.getTime()) ? null : date;
            };

            const [startDate, endDate] = exp.duration
              ?.split(" - ")
              .map(parseDate) ?? [null, null];

            await ctx.db.engagement.upsert({
              where: {
                profileId_organizationId: {
                  profileId: profile.id,
                  organizationId: organization.id,
                },
              },
              update: {
                type: "experience",
                startDate,
                endDate,
              },
              create: {
                type: "experience",
                profileId: profile.id,
                organizationId: organization.id,
                startDate,
                endDate,
              },
            });
          } catch (error) {
            console.error("Error processing experience:", error);
            throw new Error(
              `Failed to process experience: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }

      if (input.education) {
        for (const edu of input.education) {
          try {
            const organization = await ctx.db.organization.upsert({
              where: {
                companyId: edu.schoolId,
              },
              update: {
                name: edu.schoolName,
              },
              create: {
                companyId: edu.schoolId,
                name: edu.schoolName,
              },
            });

            await ctx.db.engagement.upsert({
              where: {
                profileId_organizationId: {
                  profileId: profile.id,
                  organizationId: organization.id,
                },
              },
              update: {
                type: "education",
                startDate: edu.duration?.includes(" - ")
                  ? (() => {
                      const date = new Date(edu.duration.split(" - ")[0] ?? "");
                      return isNaN(date.getTime()) ? null : date;
                    })()
                  : null,
                endDate: edu.duration?.includes(" - ")
                  ? (() => {
                      const date = new Date(edu.duration.split(" - ")[1] ?? "");
                      return isNaN(date.getTime()) ? null : date;
                    })()
                  : null,
              },
              create: {
                type: "education",
                profileId: profile.id,
                organizationId: organization.id,
                startDate: edu.duration?.includes(" - ")
                  ? (() => {
                      const date = new Date(edu.duration.split(" - ")[0] ?? "");
                      return isNaN(date.getTime()) ? null : date;
                    })()
                  : null,
                endDate: edu.duration?.includes(" - ")
                  ? (() => {
                      const date = new Date(edu.duration.split(" - ")[1] ?? "");
                      return isNaN(date.getTime()) ? null : date;
                    })()
                  : null,
              },
            });
          } catch (error) {
            console.error("Error processing education:", error);
            throw new Error(
              `Failed to process education: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }

      // Return the profile with its engagements
      return ctx.db.profile.findUnique({
        where: { id: profile.id },
        include: {
          engagements: {
            include: {
              organization: true,
            },
          },
        },
      });
    }),
} satisfies TRPCRouterRecord;
