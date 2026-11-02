"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Interviewer {
  id: string;
  company_name: string;
  interviewerName: string;
  email: string;
}

export default function InterviewerListPage() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [filteredInterviewers, setFilteredInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Interviewer | null>(null);
  const [updatedCompany, setUpdatedCompany] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const { toast } = useToast();

  // ✅ Fetch interviewers in real-time
  useEffect(() => {
    const q = query(collection(db, "int_users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Interviewer[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        company_name: doc.data().company_name,
        interviewerName: doc.data().interviewerName,
        email: doc.data().email,
      }));
      setInterviewers(list);
      setFilteredInterviewers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Filter interviewers by company name
  useEffect(() => {
    if (selectedCompany === "All") {
      setFilteredInterviewers(interviewers);
    } else {
      setFilteredInterviewers(
        interviewers.filter((i) => i.company_name === selectedCompany)
      );
    }
  }, [selectedCompany, interviewers]);

  // ✅ Extract unique company names for dropdown
  const uniqueCompanies = Array.from(
    new Set(interviewers.map((i) => i.company_name))
  );

  // ✅ Handle opening edit dialog
  const handleEdit = (item: Interviewer) => {
    setEditing(item);
    setUpdatedCompany(item.company_name);
    setUpdatedName(item.interviewerName);
    setUpdatedEmail(item.email);
  };

  // ✅ Handle update Firestore document
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      const docRef = doc(db, "int_users", editing.id);
      await updateDoc(docRef, {
        company_name: updatedCompany,
        interviewerName: updatedName,
        email: updatedEmail,
      });

      toast({
        title: "Updated Successfully",
        description: "Interviewer details have been updated.",
      });

      setEditing(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update interviewer details.",
      });
    }
  };

  // ✅ Handle Delete Firestore document
  const handleDelete = async () => {
    if (!editing) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete interviewer "${editing.interviewerName}"?`
    );
    if (!confirmDelete) return;

    try {
      const docRef = doc(db, "int_users", editing.id);
      await deleteDoc(docRef);

      toast({
        title: "Deleted Successfully",
        description: `${editing.interviewerName} has been removed from the database.`,
      });

      setEditing(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete interviewer record.",
      });
    }
  };

  return (
    <main className="min-h-screen w-full bg-background p-0 m-0 flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading interviewers...</span>
        </div>
      ) : interviewers.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-muted-foreground">No interviewers found.</p>
        </div>
      ) : (
        <>
          {/* ✅ Filter Dropdown */}
          <div className="flex justify-end items-center gap-2 p-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedCompany}
              onValueChange={setSelectedCompany}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Companies</SelectItem>
                {uniqueCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ✅ Table */}
          <div className="flex-1 overflow-auto">
            <Table className="w-full text-sm border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/60 border-b">
                  <TableHead className="w-20 text-center font-semibold">
                    Sl. No
                  </TableHead>
                  <TableHead className="font-semibold">Company Name</TableHead>
                  <TableHead className="font-semibold">Interviewer Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="text-center font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInterviewers.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{item.company_name}</TableCell>
                    <TableCell>{item.interviewerName}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ✅ Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Interviewer</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={updatedCompany}
                onChange={(e) => setUpdatedCompany(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Interviewer Name</Label>
              <Input
                id="name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
