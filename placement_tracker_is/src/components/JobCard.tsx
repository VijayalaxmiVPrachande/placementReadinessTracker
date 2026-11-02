import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Banknote, Briefcase, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // e.g. Full-time, Internship
  posted_date: string;
  deadline: string;
  skills_required: string[];
  description: string;
  applicants?: string[];
}

interface JobCardProps {
  job: Job;
  hasApplied: boolean;
  onApply: (jobId: string) => void;
  isApplying: boolean;
}

export function JobCard({ job, hasApplied, onApply, isApplying }: JobCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/60">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">{job.title}</CardTitle>
            <CardDescription className="text-base font-medium text-primary mt-1">
              {job.company}
            </CardDescription>
          </div>
          <Badge variant={job.type === "Internship" ? "secondary" : "default"}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            {job.location}
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-gray-400" />
            {job.salary}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Posted: {job.posted_date}
          </div>
          <div className="flex items-center gap-2 text-red-500 font-medium">
            <Clock className="w-4 h-4" />
            Deadline: {job.deadline}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {(job.skills_required || []).slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(job.skills_required || []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(job.skills_required || []).length - 3} more
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
          {job.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <Link href={`/jobs/${job.id}`} className="text-sm text-primary hover:underline">
          View Details
        </Link>
        <Button
          onClick={() => onApply(job.id)}
          disabled={hasApplied || isApplying}
          variant={hasApplied ? "outline" : "default"}
        >
          {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
