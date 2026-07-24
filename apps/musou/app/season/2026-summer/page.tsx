import { redirect } from "next/navigation"

// Redirect to home page as summer season is the current season
export default function SummerSeasonPage() {
  redirect("/")
}
