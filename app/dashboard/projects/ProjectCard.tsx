// This is a pure server component for rendering a project card

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart } from "lucide-react";
import { Project } from "@/types";

export default function ProjectCard({ project }: { project: Project }) {
  const spentPercentage = (project.spent / project.budget) * 100;
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{project.name}</span>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              <BarChart className="h-4 w-4" />
              <span className="sr-only">View Details</span>
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Client</span>
            <span className="font-medium">{project.client}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</span>
            </div>
            <Progress value={spentPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Deadline</span>
            <span className="font-medium">{project.deadline || "Not set"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/projects/${project.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
