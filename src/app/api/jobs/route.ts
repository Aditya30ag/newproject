import { NextRequest, NextResponse } from "next/server";
import { mockSession } from "@/lib/mockSession";
import { db } from "@/lib/db";
import { createActivityLog } from "@/lib/utils";
import { z } from "zod";

export async function getServerSession() {
    const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
    return isMock ? mockSession() : null; // Replace null with actual NextAuth session for prod
  }
  
// Schema for job update validation
const jobUpdateSchema = z.object({
  title: z.string().min(1, "Job title is required").optional(),
  description: z.string().optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),
  locationType: z.enum(["ONSITE", "REMOTE", "HYBRID"]).optional(),
  location: z.string().optional(),
  ctcRangeMin: z.number().optional(),
  ctcRangeMax: z.number().optional(),
  isInternship: z.boolean().optional(),
  internshipDuration: z.number().optional(),
  internshipStipend: z.number().optional(),
  expectedHires: z.number().optional(),
  applyBy: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  companyId: z.string().optional(),
  interviewRounds: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Round name is required"),
      description: z.string().optional(),
      sequence: z.number(),
      _action: z.enum(["create", "update", "delete"]).optional(),
    })
  ).optional(),
  contactPersonIds: z.array(z.string()).optional(),
});

// GET a specific job by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId, id: userId } = session.user;

    // Check permission to access this job
    let job;

    if (role === "SUPER_ADMIN") {
      // Super admin can see any job
      job = await db.job.findUnique({
        where: { id: jobId },
        include: {
          company: true,
          university: true,
          rounds: {
            orderBy: {
              sequence: 'asc',
            },
          },
          contactPersons: {
            include: {
              contactPerson: true,
            },
          },
          applications: {
            include: {
              student: {
                include: {
                  department: true,
                },
              },
              interviewRounds: {
                include: {
                  interviewRound: true,
                },
              },
              offer: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (role === "UNIVERSITY_ADMIN") {
      // University admin can only see jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
        },
        include: {
          company: true,
          university: true,
          rounds: {
            orderBy: {
              sequence: 'asc',
            },
          },
          contactPersons: {
            include: {
              contactPerson: true,
            },
          },
          applications: {
            include: {
              student: {
                include: {
                  department: true,
                },
              },
              interviewRounds: {
                include: {
                  interviewRound: true,
                },
              },
              offer: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (role === "SUB_USER") {
      // Sub-user can only see assigned jobs
      const subUserJob = await db.subUserJob.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      if (!subUserJob) {
        return NextResponse.json(
          { error: "Job not found or not assigned to you" },
          { status: 404 }
        );
      }

      job = await db.job.findUnique({
        where: { id: jobId },
        include: {
          company: true,
          university: true,
          rounds: {
            orderBy: {
              sequence: 'asc',
            },
          },
          contactPersons: {
            include: {
              contactPerson: true,
            },
          },
          applications: {
            include: {
              student: {
                include: {
                  department: true,
                },
              },
              interviewRounds: {
                include: {
                  interviewRound: true,
                },
              },
              offer: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 400 }
      );
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Format job data for the response
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.company.id,
        name: job.company.name,
        logo: job.company.logo,
      },
      university: {
        id: job.university.id,
        name: job.university.name,
      },
      jobType: job.jobType,
      locationType: job.locationType,
      location: job.location,
      ctcRangeMin: job.ctcRangeMin,
      ctcRangeMax: job.ctcRangeMax,
      isInternship: job.isInternship,
      internshipDuration: job.internshipDuration,
      internshipStipend: job.internshipStipend,
      expectedHires: job.expectedHires,
      applyBy: job.applyBy,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      createdBy: job.createdBy,
      updatedBy: job.updatedBy,
      interviewRounds: job.rounds.map(round => ({
        id: round.id,
        name: round.name,
        description: round.description,
        sequence: round.sequence,
      })),
      contactPersons: job.contactPersons.map(cp => ({
        id: cp.contactPerson.id,
        name: cp.contactPerson.name,
        email: cp.contactPerson.email,
        phone: cp.contactPerson.phone,
        designation: cp.contactPerson.designation,
      })),
      applications: job.applications.map(app => ({
        id: app.id,
        student: {
          id: app.student.id,
          name: `${app.student.firstName} ${app.student.lastName}`,
          email: app.student.email,
          department: app.student.department.name,
          rollNumber: app.student.rollNumber,
        },
        status: app.status,
        appliedAt: app.appliedAt,
        interviews: app.interviewRounds.map(ir => ({
          roundId: ir.interviewRound.id,
          roundName: ir.interviewRound.name,
          status: ir.status,
          scheduledAt: ir.scheduledAt,
          feedback: ir.feedback,
          rating: ir.rating,
        })),
        offer: app.offer ? {
          ctc: app.offer.ctc,
          joiningDate: app.offer.joiningDate,
          status: app.offer.status,
        } : null,
      })),
    };

    return NextResponse.json(formattedJob);
  } catch (error) {
    console.error("[API_JOB_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update a job
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId, id: userId } = session.user;

    // Check permission to update this job
    let job;

    if (role === "UNIVERSITY_ADMIN") {
      // University admin can only update jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
        },
        include: {
          rounds: true,
          contactPersons: true,
        },
      });
    } else if (role === "SUB_USER") {
      // Sub-user can only update assigned jobs if they have permission
      const subUserJob = await db.subUserJob.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      if (!subUserJob || !subUserJob.canEditJobDetails) {
        return NextResponse.json(
          { error: "Not authorized to edit this job" },
          { status: 403 }
        );
      }

      job = await db.job.findUnique({
        where: { id: jobId },
        include: {
          rounds: true,
          contactPersons: true,
        },
      });
    } else if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to update jobs" },
        { status: 403 }
      );
    } else {
      // Super admin can update any job
      job = await db.job.findUnique({
        where: { id: jobId },
        include: {
          rounds: true,
          contactPersons: true,
        },
      });
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    
    // Validate job data
    const validationResult = jobUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid job data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const jobData = validationResult.data;
    
    // Extract interview rounds and contact person IDs
    const { interviewRounds, contactPersonIds, ...jobDetails } = jobData;

    // Update job
    await db.job.update({
      where: { id: jobId },
      data: {
        ...jobDetails,
        updatedById: userId,
        applyBy: jobDetails.applyBy ? new Date(jobDetails.applyBy) : undefined,
      },
    });

    // Handle interview rounds updates
    if (interviewRounds && interviewRounds.length > 0) {
      // Process each round based on the _action
      for (const round of interviewRounds) {
        const { _action, id, ...roundData } = round;
        
        if (_action === "create" || !id) {
          // Create new round
          await db.interviewRound.create({
            data: {
              jobId,
              name: roundData.name,
              description: roundData.description || "",
              sequence: roundData.sequence,
            },
          });
        } else if (_action === "update" && id) {
          // Update existing round
          await db.interviewRound.update({
            where: { id },
            data: {
              name: roundData.name,
              description: roundData.description,
              sequence: roundData.sequence,
            },
          });
        } else if (_action === "delete" && id) {
          // Delete the round
          await db.interviewRound.delete({
            where: { id },
          });
        }
      }
    }

    // Update contact persons if provided
    if (contactPersonIds) {
      // Remove existing contacts not in the new list
      await db.jobPOC.deleteMany({
        where: {
          jobId,
          contactPersonId: {
            notIn: contactPersonIds,
          },
        },
      });

      // Get existing contact persons
      const existingContacts = await db.jobPOC.findMany({
        where: {
          jobId,
        },
        select: {
          contactPersonId: true,
        },
      });

      const existingContactIds = existingContacts.map(c => c.contactPersonId);

      // Add new contact persons
      const newContactIds = contactPersonIds.filter(id => !existingContactIds.includes(id));
      
      for (const contactId of newContactIds) {
        await db.jobPOC.create({
          data: {
            jobId,
            contactPersonId: contactId,
          },
        });
      }
    }

    // Log activity
    await createActivityLog(
      userId,
      "JOB_UPDATED",
      { jobId, jobTitle: job.title }
    );

    return NextResponse.json({
      id: jobId,
      message: "Job updated successfully",
    });
    
  } catch (error) {
    console.error("[API_JOB_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a job
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId, id: userId } = session.user;

    // Check permission to delete this job
    let job;

    if (role === "UNIVERSITY_ADMIN") {
      // University admin can only delete jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
        },
      });
    } else if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to delete jobs" },
        { status: 403 }
      );
    } else {
      // Super admin can delete any job
      job = await db.job.findUnique({
        where: { id: jobId },
      });
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Delete job (cascade will handle related records)
    await db.job.delete({
      where: { id: jobId },
    });

    // Log activity
    await createActivityLog(
      userId,
      "JOB_DELETED",
      { jobId, jobTitle: job.title }
    );

    return NextResponse.json({
      message: "Job deleted successfully",
    });
    
  } catch (error) {
    console.error("[API_JOB_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

