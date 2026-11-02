"use client";

import { useFormState } from "react-dom";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { addAptitudeTest, addSoftSkillTest } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/submit-button";

const initialState = {
  message: "",
  errors: {},
};

export function AddTestForm({ testType }: { testType: 'aptitude' | 'soft-skill' }) {
  const action = testType === 'aptitude' ? addAptitudeTest : addSoftSkillTest;
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (!state.message) return;

    if (state.errors && Object.keys(state.errors).length > 0) {
       toast({
        variant: "destructive",
        title: "Validation Error",
        description: state.message,
      });
    } else if (state.message.includes("success")) {
      toast({
        title: "Success",
        description: state.message,
      });
      setOpen(false);
    } else {
       toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New {testType === 'aptitude' ? 'Aptitude' : 'Soft Skill'} Test</DialogTitle>
          <DialogDescription>
            Fill in the details for the new test. You can add questions after creating it.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., Logical Reasoning I" />
              {state.errors?.title && <p className="text-xs text-destructive">{state.errors.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" name="duration" type="number" placeholder="e.g., 30" />
               {state.errors?.duration && <p className="text-xs text-destructive">{state.errors.duration[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ques">Number of Questions</Label>
              <Input id="ques" name="ques" type="number" placeholder="e.g., 20" />
              {state.errors?.ques && <p className="text-xs text-destructive">{state.errors.ques[0]}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton>Create Test</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
