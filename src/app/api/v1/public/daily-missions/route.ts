import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAndExtractUserIdFromApiKey } from "@/lib/apiKey";
import { fetchPublicDailyMissionsAction } from "@/actions/missions";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
}

// 1. Handler OPTIONS (Preflight Request for CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

// 2. Handler GET Endpoint Utama
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders();

  try {
    // Extract API Key from Header or Query Parameter
    const apiKeyHeader = request.headers.get("x-api-key");
    const { searchParams } = new URL(request.url);
    const apiKeyQuery = searchParams.get("api_key");
    const apiKey = apiKeyHeader || apiKeyQuery;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: API Key is required. Pass via x-api-key header or ?api_key= query param.",
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify API Key cryptographically & extract User ID
    const userId = verifyAndExtractUserIdFromApiKey(apiKey);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or tampered API Key." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user exists in database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, full_name: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not found." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch daily missions using the exact logic & calculations as the dashboard
    const { todayStr, formattedData } = await fetchPublicDailyMissionsAction(userId);

    return NextResponse.json(
      {
        success: true,
        date: todayStr,
        user: {
          username: user.username || null,
          full_name: user.full_name,
        },
        total_missions: formattedData.length,
        data: formattedData,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching public widget daily missions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 3. Reject non-GET HTTP methods with 405 Method Not Allowed
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Only GET is allowed." },
    { status: 405, headers: getCorsHeaders() }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Only GET is allowed." },
    { status: 405, headers: getCorsHeaders() }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Only GET is allowed." },
    { status: 405, headers: getCorsHeaders() }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Only GET is allowed." },
    { status: 405, headers: getCorsHeaders() }
  );
}
