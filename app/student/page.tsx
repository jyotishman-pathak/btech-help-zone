import { auth } from "../../auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default async function StudentDashboard() {
  const session = await auth();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name} 👋</h1>
      <p className="text-muted-foreground mb-6">Here's your study overview.</p>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Enrolled Subjects</CardTitle></CardHeader>
          <CardContent>Coming soon...</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mock Test Scores</CardTitle></CardHeader>
          <CardContent>Coming soon...</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recently Viewed</CardTitle></CardHeader>
          <CardContent>Coming soon...</CardContent>
        </Card>
      </div>
    </div>
  );
}