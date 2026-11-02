import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { BrainCircuit, BookCopy, Users } from "lucide-react";

async function getStats() {
  try {
    const usersCol = collection(db, "users");
    const aptitudeCol = collection(db, "apptitude_questions");
    const softSkillsCol = collection(db, "softskill_test");

    const [usersSnapshot, aptitudeSnapshot, softSkillsSnapshot] = await Promise.all([
      getCountFromServer(usersCol),
      getCountFromServer(aptitudeCol),
      getCountFromServer(softSkillsCol),
    ]);

    return {
      users: usersSnapshot.data().count,
      aptitudeTests: aptitudeSnapshot.data().count,
      softSkillsTests: softSkillsSnapshot.data().count,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { users: 0, aptitudeTests: 0, softSkillsTests: 0 };
  }
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Welcome back, Admin!</h2>
                <p className="text-muted-foreground">Here's a quick overview of your platform.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Registered users in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aptitude Tests</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.aptitudeTests}</div>
                        <p className="text-xs text-muted-foreground">Available aptitude tests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Soft Skills Tests</CardTitle>
                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.softSkillsTests}</div>
                        <p className="text-xs text-muted-foreground">Available soft skills tests</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
