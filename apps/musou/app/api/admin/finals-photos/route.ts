import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ photos: [] });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const photos = await sql`
      SELECT game_number, seat, team_name, player_name, photo_url
      FROM finals_player_photos
      WHERE game_number >= 37 AND game_number <= 40
      ORDER BY game_number, seat
    `;
    return Response.json({ photos });
  } catch (error) {
    console.error("[v0] Error fetching finals photos:", error);
    return Response.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const body = await req.json();
    const { game_number, seat, team_name, player_name, photo_url } = body;

    // Validate inputs
    if (!game_number || !seat || !team_name) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert or update the photo record
    const result = await sql`
      INSERT INTO finals_player_photos (game_number, seat, team_name, player_name, photo_url)
      VALUES (${game_number}, ${seat}, ${team_name}, ${player_name || null}, ${photo_url || null})
      ON CONFLICT (game_number, seat)
      DO UPDATE SET
        player_name = ${player_name || null},
        photo_url = ${photo_url || null},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[v0] Error saving finals photo:", error);
    return Response.json({ error: "Failed to save photo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameNumber = searchParams.get("game_number");
    const seat = searchParams.get("seat");

    if (!gameNumber || !seat) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM finals_player_photos
      WHERE game_number = ${parseInt(gameNumber)} AND seat = ${seat}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting finals photo:", error);
    return Response.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
