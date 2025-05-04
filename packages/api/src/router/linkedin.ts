import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../trpc";

export const linkedinRouter = {
  all: publicProcedure
    .input(z.object({
      includeEngagements: z.boolean().optional().default(false),
      limit: z.number().optional().default(50),
      cursor: z.string().optional(),
    }))
    .query(({ ctx, input }) => {
      return ctx.db.profile.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { username: 'asc' },
        select: {
          id: true,
          username: true,
          name: true,
          headline: true,
          location: true,
          profileUrl: true,
          _count: input.includeEngagements ? true : undefined,
        }
      }).then(profiles => {
        let nextCursor: string | undefined = undefined;
        if (profiles.length > input.limit) {
          const nextItem = profiles.pop();
          nextCursor = nextItem?.id;
        }
        return {
          profiles,
          nextCursor,
        };
      });
    }),
  upsert: publicProcedure
    .input(z.object({
      username: z.string(),
      name: z.string(),
      headline: z.string().optional(),
      location: z.string().optional(),
      profileUrl: z.string(),
      experiences: z.array(z.object({
        companyName: z.string(),
        companyId: z.string(),
        companyLink: z.string(),
        jobTitle: z.string().optional(),
        duration: z.string().optional(),
        description: z.string().optional(),
        roles: z.array(z.object({
          jobTitle: z.string().optional(),
          employmentType: z.string().optional(),
          duration: z.string().optional(),
        })).optional(),
      })).optional(),
      education: z.array(z.object({
        schoolName: z.string(),
        degree: z.string().optional(),
        duration: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First upsert the profile
      const profile = await ctx.db.profile.upsert({
        where: {
          username: input.username,
        },
        update: {
          name: input.name,
          headline: input.headline,
          location: input.location,
          profileUrl: input.profileUrl,
        },
        create: {
          username: input.username,
          name: input.name,
          headline: input.headline,
          location: input.location,
          profileUrl: input.profileUrl,
        },
      });

      if (input.experiences) {
        for (const exp of input.experiences) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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

            if (organization) {
              await ctx.db.engagement.upsert({
                where: {
                  profileId_organizationId: {
                    profileId: profile.id,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    organizationId: organization.id,
                  },
                },
                update: {
                  type: "experience",
                  startDate: exp.duration?.includes(' - ') ? (() => { const date = new Date(exp.duration.split(' - ')[0] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                  endDate: exp.duration?.includes(' - ') ? (() => { const date = new Date(exp.duration.split(' - ')[1] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                },
                create: {
                  type: "experience",
                  profileId: profile.id,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  organizationId: organization.id,
                  startDate: exp.duration?.includes(' - ') ? (() => { const date = new Date(exp.duration.split(' - ')[0] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                  endDate: exp.duration?.includes(' - ') ? (() => { const date = new Date(exp.duration.split(' - ')[1] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                },
              });
            }
          } catch (error) {
            console.error("Error processing experience:", error);
            throw new Error(`Failed to process experience: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      // Handle education
      if (input.education) {
        for (const edu of input.education) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const organization = await ctx.db.organization.upsert({
              where: {
                companyId: edu.schoolName,
              },
              update: {
                name: edu.schoolName,
              },
              create: {
                companyId: edu.schoolName,
                name: edu.schoolName,
              },
            });

            await ctx.db.engagement.upsert({
              where: {
                profileId_organizationId: {
                    profileId: profile.id,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    organizationId: organization.id,
                  },
                },
                update: {
                  type: "education",
                  startDate: edu.duration?.includes(' - ') ? (() => { const date = new Date(edu.duration.split(' - ')[0] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                  endDate: edu.duration?.includes(' - ') ? (() => { const date = new Date(edu.duration.split(' - ')[1] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                },
                create: {
                  type: "education",
                  profileId: profile.id,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  organizationId: organization.id,
                  startDate: edu.duration?.includes(' - ') ? (() => { const date = new Date(edu.duration.split(' - ')[0] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                  endDate: edu.duration?.includes(' - ') ? (() => { const date = new Date(edu.duration.split(' - ')[1] ?? ''); return isNaN(date.getTime()) ? null : date; })() : null,
                },
              });
            }
          } catch (error) {
            console.error("Error processing education:", error);
            throw new Error(`Failed to process education: ${error instanceof Error ? error.message : String(error)}`);
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
