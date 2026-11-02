import React, { forwardRef } from 'react';

export interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin: string;
        github: string;
        summary: string;
    };
    education: {
        institution: string;
        degree: string;
        year: string;
        gpa: string;
    }[];
    experience: {
        role: string;
        company: string;
        duration: string;
        description: string;
    }[];
    projects: {
        title: string;
        technologies: string;
        description: string;
        link: string;
    }[];
    skills: string[];
}

interface ResumeTemplateProps {
    data: ResumeData;
}

export const ResumeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="bg-white p-8 w-[210mm] min-h-[297mm] shadow-lg mx-auto text-gray-800 font-sans" id="resume-preview">
            {/* Header */}
            <header className="border-b-2 border-gray-300 pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">{data.personalInfo.fullName}</h1>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                    {data.personalInfo.email && <span>📧 {data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>📱 {data.personalInfo.phone}</span>}
                    {data.personalInfo.linkedin && <span>🔗 {data.personalInfo.linkedin}</span>}
                    {data.personalInfo.github && <span>💻 {data.personalInfo.github}</span>}
                </div>
            </header>

            {/* Summary */}
            {data.personalInfo.summary && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider text-blue-900">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-700">{data.personalInfo.summary}</p>
                </section>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider text-blue-900">Experience</h2>
                    <div className="space-y-4">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-semibold text-gray-900">{exp.role}</h3>
                                    <span className="text-xs text-gray-500 font-medium">{exp.duration}</span>
                                </div>
                                <div className="text-sm font-medium text-gray-700 mb-1">{exp.company}</div>
                                <p className="text-xs text-gray-600 leading-normal">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider text-blue-900">Projects</h2>
                    <div className="space-y-4">
                        {data.projects.map((proj, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-semibold text-gray-900">{proj.title}
                                        {proj.link && <a href={proj.link} className="ml-2 text-blue-600 text-xs font-normal underline">View</a>}
                                    </h3>
                                </div>
                                {proj.technologies && <div className="text-xs text-gray-500 italic mb-1">Tech Stack: {proj.technologies}</div>}
                                <p className="text-xs text-gray-600 leading-normal">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider text-blue-900">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, index) => (
                            <div key={index} className="flex justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{edu.institution}</h3>
                                    <div className="text-xs text-gray-700">{edu.degree}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-600">{edu.year}</div>
                                    {edu.gpa && <div className="text-xs text-gray-600">GPA: {edu.gpa}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider text-blue-900">Technical Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
});

ResumeTemplate.displayName = "ResumeTemplate";
