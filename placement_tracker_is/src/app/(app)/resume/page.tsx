'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ResumeTemplate, ResumeData } from '@/components/ResumeTemplate';
import { Download, Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ResumeBuilder() {
    const resumeRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<ResumeData>({
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            summary: ''
        },
        education: [],
        experience: [],
        projects: [],
        skills: []
    });

    const [skillInput, setSkillInput] = useState('');
    const [isTailoring, setIsTailoring] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [e.target.name]: e.target.value }
        }));
    };

    const addEducation = () => {
        setData(prev => ({
            ...prev,
            education: [...prev.education, { institution: '', degree: '', year: '', gpa: '' }]
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const newEdu = [...data.education];
        // @ts-ignore
        newEdu[index][field] = value;
        setData(prev => ({ ...prev, education: newEdu }));
    };

    const removeEducation = (index: number) => {
        setData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const addExperience = () => {
        setData(prev => ({
            ...prev,
            experience: [...prev.experience, { role: '', company: '', duration: '', description: '' }]
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...data.experience];
        // @ts-ignore
        newExp[index][field] = value;
        setData(prev => ({ ...prev, experience: newExp }));
    };

    const removeExperience = (index: number) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const addProject = () => {
        setData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: '', technologies: '', description: '', link: '' }]
        }));
    };

    const updateProject = (index: number, field: string, value: string) => {
        const newProj = [...data.projects];
        // @ts-ignore
        newProj[index][field] = value;
        setData(prev => ({ ...prev, projects: newProj }));
    };

    const removeProject = (index: number) => {
        setData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const addSkill = () => {
        if (skillInput.trim()) {
            setData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        setData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const downloadPDF = async () => {
        const element = resumeRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Resume_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }

    };

    const handleTailorResume = async () => {
        if (!jobDescription.trim()) return;

        setIsTailoring(true);
        try {
            const response = await fetch('/api/resume/tailor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: data,
                    jobDescription
                })
            });

            if (!response.ok) throw new Error("Failed to tailor resume");

            const tailoredData = await response.json();

            setData(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    summary: tailoredData.summary || prev.personalInfo.summary
                },
                skills: tailoredData.skills || prev.skills
            }));

            toast({
                title: "Resume Tailored",
                description: "Your resume has been updated based on the job description.",
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error tailoring resume:", error);
            toast({
                title: "Error",
                description: "Failed to tailor resume. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsTailoring(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Resume Builder</h1>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Wand2 className="h-4 w-4" /> Tailor to Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tailor Resume to Job Description</DialogTitle>
                                <DialogDescription>
                                    Paste the job description below. AI will optimize your summary and skills to match the role.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Textarea
                                    placeholder="Paste Job Description here..."
                                    className="min-h-[200px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleTailorResume} disabled={isTailoring || !jobDescription.trim()}>
                                    {isTailoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isTailoring ? 'Tailoring...' : 'Generate Tailored Resume'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={downloadPDF} className="bg-red-600 hover:bg-red-700">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Side */}
                <div className="h-[80vh] overflow-y-auto pr-4 scrollbar-hide">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="personal">Bio</TabsTrigger>
                            <TabsTrigger value="education">Edu</TabsTrigger>
                            <TabsTrigger value="experience">Exp</TabsTrigger>
                            <TabsTrigger value="projects">Proj</TabsTrigger>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="mt-4 space-y-4">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalInfoChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>LinkedIn URL</Label>
                                            <Input name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GitHub / Portfolio URL</Label>
                                        <Input name="github" value={data.personalInfo.github} onChange={handlePersonalInfoChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Professional Summary</Label>
                                        <Textarea name="summary" value={data.personalInfo.summary} onChange={handlePersonalInfoChange} rows={4} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="education" className="mt-4 space-y-4">
                            {data.education.map((edu, index) => (
                                <Card key={index} className="relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <CardContent className="pt-6 space-y-4">
                                        <Input placeholder="Institution Name" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
                                            <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} />
                                        </div>
                                        <Input placeholder="GPA / Percentage" value={edu.gpa} onChange={(e) => updateEducation(index, 'gpa', e.target.value)} />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button onClick={addEducation} variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
                        </TabsContent>

                        <TabsContent value="experience" className="mt-4 space-y-4">
                            {data.experience.map((exp, index) => (
                                <Card key={index} className="relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <CardContent className="pt-6 space-y-4">
                                        <Input placeholder="Role / Job Title" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                                            <Input placeholder="Duration (e.g. Jan 2023 - Present)" value={exp.duration} onChange={(e) => updateExperience(index, 'duration', e.target.value)} />
                                        </div>
                                        <Textarea placeholder="Description of responsibilities..." value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button onClick={addExperience} variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </TabsContent>

                        <TabsContent value="projects" className="mt-4 space-y-4">
                            {data.projects.map((proj, index) => (
                                <Card key={index} className="relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removeProject(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <CardContent className="pt-6 space-y-4">
                                        <Input placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(index, 'title', e.target.value)} />
                                        <Input placeholder="Technologies Used (comma separated)" value={proj.technologies} onChange={(e) => updateProject(index, 'technologies', e.target.value)} />
                                        <Input placeholder="Project Link" value={proj.link} onChange={(e) => updateProject(index, 'link', e.target.value)} />
                                        <Textarea placeholder="Project Description..." value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button onClick={addProject} variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
                        </TabsContent>

                        <TabsContent value="skills" className="mt-4 space-y-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            placeholder="Add a skill (e.g. React, Python)"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                        />
                                        <Button onClick={addSkill}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.skills.map((skill, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                                                {skill}
                                                <button onClick={() => removeSkill(index)} className="hover:text-red-500 ml-1">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Live Preview Side */}
                <div className="h-[80vh] overflow-y-auto border rounded-xl bg-gray-100 p-8 flex justify-center shadow-inner">
                    <div className="scale-[0.8] origin-top">
                        <ResumeTemplate ref={resumeRef} data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
