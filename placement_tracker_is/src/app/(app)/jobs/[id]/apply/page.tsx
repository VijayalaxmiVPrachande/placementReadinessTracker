'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

export default function JobApplicationPage({ params }: { params: { id: string } }) {
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const router = useRouter();
    const { toast } = useToast();
    const jobId = params.id;
    // Get user email safely
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null;

    useEffect(() => {
        const fetchJobAndUser = async () => {
            try {
                // Fetch Job
                const jobRef = doc(db, 'jobs', jobId);
                const jobSnap = await getDoc(jobRef);
                if (jobSnap.exists()) {
                    setJob({ id: jobSnap.id, ...jobSnap.data() });
                } else {
                    toast({
                        title: "Error",
                        description: "Job not found.",
                        variant: "destructive"
                    });
                    router.push('/jobs');
                    return;
                }

                // Pre-fill user data if available (mock logic based on existing localStorage usage)
                if (userEmail) {
                    setFormData(prev => ({ ...prev, email: userEmail }));
                    // In a real app, we'd fetch the user profile from Firestore here too
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobAndUser();
    }, [jobId, router, toast, userEmail]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resumeFile) {
            toast({
                title: "Resume Required",
                description: "Please upload your resume to proceed.",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);

        try {
            // 1. Upload Resume
            const storageRef = ref(storage, `resumes/${jobId}/${Date.now()}_${resumeFile.name}`);
            const uploadResult = await uploadBytes(storageRef, resumeFile);
            const resumeUrl = await getDownloadURL(uploadResult.ref);

            // 2. Create Application Document
            const applicationData = {
                jobId,
                jobTitle: job.title,
                company: job.company,
                applicantName: formData.fullName,
                applicantEmail: formData.email,
                applicantPhone: formData.phone,
                coverLetter: formData.coverLetter,
                resumeUrl,
                status: 'pending',
                appliedAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'applications'), applicationData);

            // 3. Update Job with Applicant ID (Email)
            const jobRef = doc(db, 'jobs', jobId);
            await updateDoc(jobRef, {
                applicants: arrayUnion(formData.email)
            });

            toast({
                title: "Application Submitted",
                description: "Your application has been successfully sent!",
            });

            router.push('/jobs');

        } catch (error) {
            console.error("Error submitting application:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your application. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Apply for {job.title}</CardTitle>
                    <CardDescription>{job.company} • {job.location}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!!userEmail} // Disable if auto-filled from login
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume (PDF)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <Input
                                    id="resume"
                                    type="file"
                                    accept=".pdf"
                                    required
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                                {resumeFile ? (
                                    <p className="text-sm font-medium text-green-600">{resumeFile.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF only (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                            <Textarea
                                id="coverLetter"
                                name="coverLetter"
                                placeholder="Tell us why you're a great fit..."
                                rows={5}
                                value={formData.coverLetter}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? "Submitting..." : "Submit Application"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
