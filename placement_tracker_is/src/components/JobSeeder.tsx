'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sampleJobs = [
    {
        title: "Senior Software Engineer",
        company: "Google",
        location: "Bangalore, India",
        type: "Full-time",
        description: "We are looking for a Senior Software Engineer to join our Google Cloud team. You will be responsible for designing and building scalable cloud solutions.",
        requirements: ["5+ years of experience with simple Java or C++", "Experience with distributed systems", "Strong problem-solving skills"],
        posted_date: Timestamp.now(),
        applicants: [],
        salary: "₹30,00,000 - ₹50,00,000"
    },
    {
        title: "Product Manager",
        company: "Microsoft",
        location: "Hyderabad, India",
        type: "Full-time",
        description: "Join our Azure team as a Product Manager. You will define product strategy and work closely with engineering and design teams.",
        requirements: ["MBA or equivalent experience", "3+ years of product management experience", "Excellent communication skills"],
        posted_date: Timestamp.now(),
        applicants: [],
        salary: "₹25,00,000 - ₹40,00,000"
    },
    {
        title: "Data Scientist",
        company: "Amazon",
        location: "Remote",
        type: "Contract",
        description: "We need a Data Scientist to analyze customer behavior and improve our recommendation algorithms.",
        requirements: ["Masters/PhD in Computer Science or Statistics", "Experience with Python, SQL, and Machine Learning", "Experience with AWS"],
        posted_date: Timestamp.now(),
        applicants: [],
        salary: "₹20,00,000 - ₹35,00,000"
    },
    {
        title: "Frontend Developer Intern",
        company: "Swiggy",
        location: "Bangalore, India",
        type: "Internship",
        description: "Looking for an enthusiastic Frontend Developer Intern to work on our consumer-facing app.",
        requirements: ["Knowledge of React.js and JavaScript", "Familiarity with CSS and HTML", "Eagerness to learn"],
        posted_date: Timestamp.now(),
        applicants: [],
        salary: "₹30,000 / month"
    }
];

export function JobSeeder() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSeed = async () => {
        setLoading(true);
        try {
            const jobsRef = collection(db, 'jobs');
            const promises = sampleJobs.map(job => addDoc(jobsRef, job));
            await Promise.all(promises);

            toast({
                title: "Jobs Added",
                description: "Sample jobs have been successfully added to the database.",
            });
            // Optionally reload the page or trigger a refresh
            window.location.reload();
        } catch (error) {
            console.error("Error seeding jobs:", error);
            toast({
                title: "Error",
                description: "Failed to add sample jobs.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleSeed} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            Seed Sample Jobs
        </Button>
    );
}
