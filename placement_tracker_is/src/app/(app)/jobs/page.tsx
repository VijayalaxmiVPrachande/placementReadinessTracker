'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobCard, Job } from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { JobSeeder } from '@/components/JobSeeder';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [applying, setApplying] = useState<string | null>(null);
    const [userAppliedJobs, setUserAppliedJobs] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    // Get current user ID - In a real app, this should come from Auth Context
    // For now, using email from localStorage as ID reference or a temporary fix
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null;

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const jobsRef = collection(db, 'jobs');
            const q = query(jobsRef, orderBy('posted_date', 'desc'));
            const snapshot = await getDocs(q);

            const fetchedJobs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    posted_date: data.posted_date?.toDate ? data.posted_date.toDate().toLocaleDateString() : (data.posted_date || 'N/A'),
                    deadline: data.deadline?.toDate ? data.deadline.toDate().toLocaleDateString() : (data.deadline || 'Flexible'),
                };
            }) as Job[];

            setJobs(fetchedJobs);

            // Identify jobs the user has already applied to
            if (userEmail) {
                const applied = fetchedJobs
                    .filter(job => job.applicants?.includes(userEmail))
                    .map(job => job.id);
                setUserAppliedJobs(applied);
            }

        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast({
                title: "Error",
                description: "Failed to load jobs. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (jobId: string) => {
        router.push(`/jobs/${jobId}/apply`);
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || job.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
                    <p className="text-muted-foreground mt-1">Find your next career opportunity</p>
                    <div className="mt-2"><JobSeeder /></div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search roles or companies..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">No jobs found matching your criteria.</p>
                    <Button variant="link" onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            hasApplied={userAppliedJobs.includes(job.id)}
                            onApply={handleApply}
                            isApplying={applying === job.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
