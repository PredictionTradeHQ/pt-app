import { redirect } from "next/navigation";

// /demo has been merged into /markets — both share the same trading system now.
export default function DemoPage() {
  redirect("/markets");
}
