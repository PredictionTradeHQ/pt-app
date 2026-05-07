import { redirect } from "next/navigation";

// Legacy route — redirect to the main markets page
export default function PredictPage() {
  redirect("/markets");
}
