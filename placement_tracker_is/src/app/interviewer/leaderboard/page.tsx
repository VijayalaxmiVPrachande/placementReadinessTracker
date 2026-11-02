'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LeaderboardPage() {
  const [showAll, setShowAll] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For popup message window
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');
  const otherAvatar = PlaceHolderImages.find((img) => img.id === 'avatar-2');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const appti_score = parseFloat(data.appti_score || 0);
          const coding_score = parseFloat(data.coding_score || 0);
          const softskill_score = parseFloat(data.softskill_score || 0);

          const readiness_score = (
            0.3 * appti_score +
            0.4 * coding_score +
            0.3 * softskill_score
          ).toFixed(2);

          userList.push({
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            appti_score,
            coding_score,
            softskill_score,
            readiness_score: parseFloat(readiness_score),
            optedIn: data.optedIn ?? true,
          });
        });

        userList.sort((a, b) => b.readiness_score - a.readiness_score);
        userList.forEach((user, index) => (user.rank = index + 1));
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const displayedData = showAll ? users : users.filter((u) => u.optedIn);

  const handleSendMessageClick = (user: any) => {
    setSelectedUser(user);
    setMessage('');
    setOpenDialog(true);
  };

  // ✅ Step 4: Send real email through API route
  const handleSendMessage = async () => {
  if (!message.trim()) return alert("Please type a message first.");
  if (!selectedUser?.email) return alert("User email not found.");

  setSending(true);
  try {
    const res = await fetch("/api/sendemail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selectedUser.email,
        message,
      }),
    });

    const result = await res.json();
    if (result.success) {
      alert(`✅ Message sent to ${selectedUser.name} (${selectedUser.email})`);
      setOpenDialog(false);
    } else {
      alert("❌ Failed to send message: " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error sending message");
  } finally {
    setSending(false);
  }
};


  if (loading) return <p className="text-center mt-6">Loading leaderboard...</p>;

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among your peers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
          <Label htmlFor="show-all">Show all students (including opted-out)</Label>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-center">Aptitude</TableHead>
              <TableHead className="text-center">Coding</TableHead>
              <TableHead className="text-center">Soft Skills</TableHead>
              <TableHead className="text-right">Readiness %</TableHead>
              <TableHead className="text-center">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((user) => (
              <TableRow key={user.id} className={user.rank === 1 ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium text-lg text-center">{user.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={user.rank === 1 ? userAvatar?.imageUrl : otherAvatar?.imageUrl}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name} {user.optedIn ? '' : '(Opted Out)'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{user.appti_score}%</TableCell>
                <TableCell className="text-center">{user.coding_score}%</TableCell>
                <TableCell className="text-center">{user.softskill_score}%</TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {user.readiness_score}%
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" onClick={() => handleSendMessageClick(user)}>
                    Send Message
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Popup Message Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              To: <span className="font-semibold">{selectedUser?.email}</span>
            </p>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
