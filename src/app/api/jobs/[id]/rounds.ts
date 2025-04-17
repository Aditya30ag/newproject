import { NextRequest, NextResponse } from "next/server";
import { mockSession } from "@/lib/mockSession";
import { db } from "@/lib/db";
import { createActivityLog } from "@/lib/utils";
import { z } from "zod";

export async function getServerSession() {
    const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
    return isMock ? mockSession() : null; // Replace null with actual NextAuth session for prod
  }
  
// Schema for interview rounds validation
const interviewRoundsSchema = z.array(
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Round name is required"),
    description: z.string().optional(),
    sequence: z.number(),
  })
);

// GET interview rounds for a specific job
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
      });
    } else if (role === "UNIVERSITY_ADMIN") {
      // University admin can only see jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
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

    // Get interview rounds for the job
    const rounds = await db.interviewRound.findMany({
      where: { jobId },
      orderBy: {
        sequence: 'asc',
      },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error("[API_JOB_ROUNDS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to update interview rounds for a job
export async function POST(
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

    // Check permission to update this job's rounds
    let job;

    if (role === "UNIVERSITY_ADMIN") {
      // University admin can only update jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
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
          { error: "Not authorized to edit this job's interview rounds" },
          { status: 403 }
        );
      }

      job = await db.job.findUnique({
        where: { id: jobId },
      });
    } else if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to update interview rounds" },
        { status: 403 }
      );
    } else {
      // Super admin can update any job
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

    const body = await req.json();
    
    // Validate interview rounds data
    const validationResult = interviewRoundsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid interview rounds data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const rounds = validationResult.data;

    // Get existing rounds
    const existingRounds = await db.interviewRound.findMany({
      where: { jobId },
    });

    // Identify rounds to create, update, or delete
    const existingRoundIds = existingRounds.map(r => r.id);
    const newRoundIds = rounds.filter(r => r.id).map(r => r.id);

    // Delete rounds that are no longer present
    for (const existingRound of existingRounds) {
      if (!newRoundIds.includes(existingRound.id)) {
        await db.interviewRound.delete({
          where: { id: existingRound.id },
        });
      }
    }

    // Create or update rounds
    for (const round of rounds) {
      if (!round.id) {
        // Create new round
        await db.interviewRound.create({
          data: {
            jobId,
            name: round.name,
            description: round.description || "",
            sequence: round.sequence,
          },
        });
      } else if (existingRoundIds.includes(round.id)) {
        // Update existing round
        await db.interviewRound.update({
          where: { id: round.id },
          data: {
            name: round.name,
            description: round.description,
            sequence: round.sequence,
          },
        });
      }
    }

    // Log activity
    await createActivityLog(
      userId,
      "JOB_ROUNDS_UPDATED",
      { jobId, jobTitle: job.title }
    );

    // Get updated rounds
    const updatedRounds = await db.interviewRound.findMany({
      where: { jobId },
      orderBy: {
        sequence: 'asc',
      },
    });

    return NextResponse.json({
      message: "Interview rounds updated successfully",
      rounds: updatedRounds,
    });
    
  } catch (error) {
    console.error("[API_JOB_ROUNDS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH to update a specific interview round
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const { id: jobId } = params;
    const url = new URL(req.url);
    const roundId = url.searchParams.get("roundId");

    if (!roundId) {
      return NextResponse.json(
        { error: "Round ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId, id: userId } = session.user;

    // Check permission to update this job's rounds
    let job;

    if (role === "UNIVERSITY_ADMIN") {
      // University admin can only update jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
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
          { error: "Not authorized to edit this job's interview rounds" },
          { status: 403 }
        );
      }

      job = await db.job.findUnique({
        where: { id: jobId },
      });
    } else if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to update interview rounds" },
        { status: 403 }
      );
    } else {
      // Super admin can update any job
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

    // Check if the round belongs to this job
    const round = await db.interviewRound.findFirst({
      where: {
        id: roundId,
        jobId,
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Interview round not found for this job" },
        { status: 404 }
      );
    }

    const body = await req.json();
    
    // Validate round data
    const roundSchema = z.object({
      name: z.string().min(1, "Round name is required").optional(),
      description: z.string().optional(),
      sequence: z.number().optional(),
    });
    
    const validationResult = roundSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid round data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const roundData = validationResult.data;

    // Update the round
    const updatedRound = await db.interviewRound.update({
      where: { id: roundId },
      data: roundData,
    });

    // Log activity
    await createActivityLog(
      userId,
      "JOB_ROUND_UPDATED",
      { jobId, roundId, roundName: updatedRound.name }
    );

    return NextResponse.json({
      message: "Interview round updated successfully",
      round: updatedRound,
    });
    
  } catch (error) {
    console.error("[API_JOB_ROUND_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a specific interview round
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const { id: jobId } = params;
    const url = new URL(req.url);
    const roundId = url.searchParams.get("roundId");

    if (!roundId) {
      return NextResponse.json(
        { error: "Round ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId, id: userId } = session.user;

    // Check permission to delete this job's rounds
    let job;

    if (role === "UNIVERSITY_ADMIN") {
      // University admin can only update jobs from their university
      job = await db.job.findUnique({
        where: {
          id: jobId,
          universityId,
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
          { error: "Not authorized to edit this job's interview rounds" },
          { status: 403 }
        );
      }

      job = await db.job.findUnique({
        where: { id: jobId },
      });
    } else if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to delete interview rounds" },
        { status: 403 }
      );
    } else {
      // Super admin can update any job
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

    // Check if the round belongs to this job
    const round = await db.interviewRound.findFirst({
      where: {
        id: roundId,
        jobId,
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: "Interview round not found for this job" },
        { status: 404 }
      );
    }

    // Store round info for logging
    const roundName = round.name;

    // Delete the round
    await db.interviewRound.delete({
      where: { id: roundId },
    });

    // Log activity
    await createActivityLog(
      userId,
      "JOB_ROUND_DELETED",
      { jobId, roundId, roundName }
    );

    return NextResponse.json({
      message: "Interview round deleted successfully",
    });
    
  } catch (error) {
    console.error("[API_JOB_ROUND_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

