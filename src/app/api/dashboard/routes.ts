import { NextRequest, NextResponse } from "next/server";
import { mockSession } from "@/lib/mockSession";
import { db } from "@/lib/db";

export async function getServerSession() {
    const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
    return isMock ? mockSession() : null; // Replace null with actual NextAuth session for prod
  }
  
  
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, universityId } = session.user;

    // Return different dashboard data based on user role
    if (role === "SUPER_ADMIN") {
      // Get counts for super admin dashboard
      const universitiesCount = await db.university.count({
        where: { isActive: true },
      });

      const jobsCount = await db.job.count();

      const studentsCount = await db.student.count();

      const usersCount = await db.user.count();

      // Return dashboard data
      return NextResponse.json({
        stats: {
          universities: universitiesCount,
          jobs: jobsCount,
          students: studentsCount,
          users: usersCount,
        },
        // In a real app, you would compute these from actual data
        universityPerformance: [
          { name: "University A", placements: 245, interviews: 320, offers: 215 },
          { name: "University B", placements: 190, interviews: 280, offers: 170 },
          { name: "University C", placements: 320, interviews: 410, offers: 290 },
          { name: "University D", placements: 150, interviews: 220, offers: 130 },
          { name: "University E", placements: 280, interviews: 340, offers: 260 },
        ],
        placementTrends: [
          { month: "Jan", placements: 120 },
          { month: "Feb", placements: 140 },
          { month: "Mar", placements: 170 },
          { month: "Apr", placements: 190 },
          { month: "May", placements: 220 },
          { month: "Jun", placements: 250 },
        ],
        ctcDistribution: [
          { name: "0-5 LPA", value: 120, color: "#8884d8" },
          { name: "5-10 LPA", value: 180, color: "#83a6ed" },
          { name: "10-15 LPA", value: 80, color: "#8dd1e1" },
          { name: "15-20 LPA", value: 40, color: "#82ca9d" },
          { name: ">20 LPA", value: 30, color: "#ffc658" },
        ],
      });
    } else if (role === "UNIVERSITY_ADMIN") {
      if (!universityId) {
        return NextResponse.json(
          { error: "University not found" },
          { status: 404 }
        );
      }

      // Get counts for university admin dashboard
      const jobsCount = await db.job.count({
        where: { universityId },
      });

      const openJobsCount = await db.job.count({
        where: { universityId, status: "OPEN" },
      });

      const placementsCount = await db.application.count({
        where: {
          status: {
            in: ["SELECTED", "OFFER_ACCEPTED", "JOINED"],
          },
          job: {
            universityId,
          },
        },
      });

      const companiesCount = await db.companyUniversity.count({
        where: { universityId },
      });

      // Return dashboard data
      return NextResponse.json({
        stats: {
          jobs: jobsCount,
          openJobs: openJobsCount,
          placements: placementsCount,
          companies: companiesCount,
        },
        // In a real app, you would compute these from actual data
        placementStats: [
          { name: "CSE", applied: 150, interviewed: 120, placed: 90 },
          { name: "ECE", applied: 120, interviewed: 100, placed: 70 },
          { name: "Mechanical", applied: 80, interviewed: 60, placed: 40 },
          { name: "Civil", applied: 60, interviewed: 45, placed: 30 },
          { name: "IT", applied: 130, interviewed: 110, placed: 85 },
        ],
        companyParticipation: [
          { name: "Microsoft", students: 45 },
          { name: "Google", students: 30 },
          { name: "Amazon", students: 50 },
          { name: "IBM", students: 25 },
          { name: "TCS", students: 60 },
          { name: "Wipro", students: 40 },
        ],
        ctcTrends: [
          { month: "Jan", avgCTC: 7.5 },
          { month: "Feb", avgCTC: 8.2 },
          { month: "Mar", avgCTC: 7.8 },
          { month: "Apr", avgCTC: 8.5 },
          { month: "May", avgCTC: 9.2 },
          { month: "Jun", avgCTC: 10.1 },
        ],
        jobTypeDistribution: [
          { name: "Full-time", value: 75, color: "#0088FE" },
          { name: "Internship", value: 25, color: "#00C49F" },
        ],
        recentJobs: [
          {
            id: "1",
            title: "Software Engineer",
            company: "Microsoft",
            status: "OPEN",
            ctcRange: "15-20 LPA",
            applications: 45,
            createdAt: "2023-10-12",
          },
          {
            id: "2",
            title: "Product Manager",
            company: "Google",
            status: "OPEN",
            ctcRange: "18-25 LPA",
            applications: 32,
            createdAt: "2023-10-10",
          },
          {
            id: "3",
            title: "Data Scientist",
            company: "Amazon",
            status: "IN_PROGRESS",
            ctcRange: "12-18 LPA",
            applications: 28,
            createdAt: "2023-10-08",
          },
          {
            id: "4",
            title: "Frontend Developer",
            company: "IBM",
            status: "COMPLETED",
            ctcRange: "10-15 LPA",
            applications: 38,
            createdAt: "2023-10-05",
          },
          {
            id: "5",
            title: "DevOps Engineer",
            company: "Wipro",
            status: "OPEN",
            ctcRange: "8-12 LPA",
            applications: 22,
            createdAt: "2023-10-02",
          },
        ],
      });
    } else if (role === "SUB_USER") {
      if (!universityId) {
        return NextResponse.json(
          { error: "University not found" },
          { status: 404 }
        );
      }

      // Get data for sub user dashboard
      const userId = session.user.id;
      
      // Get assigned jobs count
      const assignedJobsCount = await db.subUserJob.count({
        where: { userId },
      });

      // Get count of today's interviews
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayInterviewsCount = await db.interviewResult.count({
        where: {
          scheduledAt: {
            gte: today,
            lt: tomorrow,
          },
          application: {
            job: {
              subUserJobs: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      });

      // Get count of selections
      const selectionsCount = await db.application.count({
        where: {
          status: {
            in: ["SELECTED", "OFFER_ACCEPTED", "JOINED"],
          },
          job: {
            subUserJobs: {
              some: {
                userId,
              },
            },
          },
        },
      });

      // Return dashboard data
      return NextResponse.json({
        stats: {
          assignedJobs: assignedJobsCount,
          todayInterviews: todayInterviewsCount,
          pendingTasks: 5, // Mock data
          selections: selectionsCount,
        },
        assignedJobs: [
          {
            id: "1",
            title: "Software Engineer",
            company: "Microsoft",
            status: "OPEN",
            location: "Bangalore",
            applications: 45,
            applyBy: "2023-12-15",
          },
          {
            id: "2",
            title: "Product Manager",
            company: "Google",
            status: "IN_PROGRESS",
            location: "Hyderabad",
            applications: 32,
            applyBy: "2023-12-10",
          },
          {
            id: "3",
            title: "Data Scientist",
            company: "Amazon",
            status: "OPEN",
            location: "Pune",
            applications: 28,
            applyBy: "2023-12-20",
          },
        ],
        upcomingInterviews: [
          {
            id: "1",
            student: "Rahul Sharma",
            job: "Software Engineer",
            company: "Microsoft",
            round: "Technical Interview",
            scheduledAt: "2023-12-10T10:00:00",
          },
          {
            id: "2",
            student: "Priya Patel",
            job: "Software Engineer",
            company: "Microsoft",
            round: "HR Interview",
            scheduledAt: "2023-12-10T14:00:00",
          },
          {
            id: "3",
            student: "Amit Kumar",
            job: "Product Manager",
            company: "Google",
            round: "Case Study",
            scheduledAt: "2023-12-11T11:00:00",
          },
        ],
        applicationStats: [
          { name: "Applied", value: 120 },
          { name: "Shortlisted", value: 80 },
          { name: "Interviewing", value: 40 },
          { name: "Selected", value: 25 },
          { name: "Rejected", value: 35 },
        ],
      });
    }

    return NextResponse.json(
      { error: "Invalid user role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API_DASHBOARD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


