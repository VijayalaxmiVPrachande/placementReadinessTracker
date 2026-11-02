import { db } from "@/lib/firebase";
import { User } from "@/lib/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">All Users</CardTitle>
        <CardDescription>A list of all registered users and their progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>USN</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Aptitude</TableHead>
                  <TableHead>Coding</TableHead>
                  <TableHead>Soft Skill</TableHead>
                  <TableHead className="hidden sm:table-cell">Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.usn}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.appt_score} className="w-20" />
                          <span className="text-muted-foreground">{user.appt_score?.toFixed(2) ?? 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.coding_score} className="w-20" />
                          <span className="text-muted-foreground">{user.coding_score ?? 0}%</span>
                        </div>
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.softskill_score} className="w-20" />
                          <span className="text-muted-foreground">{user.softskill_score ?? 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{user.year}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
