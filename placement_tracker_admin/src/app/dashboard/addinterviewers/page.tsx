"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Rocket } from "lucide-react";

export default function AddintPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [company_name, setCompany_name] = useState("");

  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "int_users"), {
        company_name,
        interviewerName,
        userId,
        password,
        email,
        createdAt: new Date(),
      });

      toast({
        title: "Success",
        description: "Interviewer added successfully!",
      });

      // Clear form fields
      setCompany_name("");
      setInterviewerName("");
      setUserId("");
      setPassword("");
      setEmail("");
    } catch (error) {
      console.error("Error adding interviewer: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add interviewer. Please try again.",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 flex items-center gap-2">
        <Rocket className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">AssessPro</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            Add Interviewer
          </CardTitle>
          <CardDescription>
            Enter interviewer details to store in the database.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAdd}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                type="text"
                placeholder="Company Name"
                required
                value={company_name}
                onChange={(e) => setCompany_name(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="interviewer_name">Name of the Interviewer</Label>
              <Input
                id="interviewer_name"
                type="text"
                required
                placeholder="Name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                type="text"
                required
                placeholder="Give an ID for the user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Enter the email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" type="submit" variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
