import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { StaticSyllabus } from "../../../../components/dashboard/static-syllabus";

export const metadata = {
  title: "Syllabus | CEE HelpZone",
  description: "Official Assam CEE Syllabus",
};

export default async function SyllabusPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <StaticSyllabus />;
}