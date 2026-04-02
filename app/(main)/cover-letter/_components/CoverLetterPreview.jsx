"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { Copy, Edit2, Save, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { updateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";

const CoverLetterPreview = ({ content, id, jobDescription }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);

  const { loading: saving, fn: updateLetterFn } = useFetch(updateCoverLetter);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSave = async () => {
    try {
      await updateLetterFn(id, editedContent);
      toast.success("Cover letter saved successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to save cover letter");
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-end">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </>
        )}
      </div>

      {jobDescription && (
        <Accordion type="single" collapsible className="w-full mb-4">
          <AccordionItem value="job-description">
            <AccordionTrigger className="text-left">
              View Job Description
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {jobDescription}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="overflow-x-auto">
        <MDEditor
          value={editedContent}
          onChange={setEditedContent}
          preview={isEditing ? "edit" : "preview"}
          height={700}
          hideToolbar={!isEditing}
        />
      </div>
    </div>
  );
};

export default CoverLetterPreview;
