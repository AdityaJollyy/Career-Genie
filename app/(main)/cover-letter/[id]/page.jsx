import { getCoverLetter } from "@/actions/cover-letter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import CoverLetterPreview from "../_components/CoverLetterPreview";

export default async function CoverLetterDetailPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          {coverLetter.jobTitle} at {coverLetter.companyName}
        </h1>
        <Link href="/cover-letter">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cover Letters
          </Button>
        </Link>
      </div>

      <CoverLetterPreview content={coverLetter.content} />
    </div>
  );
}
