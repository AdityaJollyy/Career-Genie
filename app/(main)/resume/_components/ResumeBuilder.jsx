"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Import,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { saveResume, getResume } from "@/actions/resume";
import { EntryForm } from "./EntryForm";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown, markdownToFormData } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import { useReactToPrint } from "react-to-print";

export default function ResumeBuilder({ initialContent }) {
  // Initialize state directly to avoid useEffect cascading renders
  const [activeTab, setActiveTab] = useState(
    initialContent ? "preview" : "edit",
  );
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLikelyNonDesktop, setIsLikelyNonDesktop] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Print Setup
  const contentRef = useRef(null);
  const generatePDF = useReactToPrint({
    contentRef: contentRef,
    documentTitle: user?.fullName ? `${user.fullName}-Resume` : "Resume",
    onAfterPrint: () => setIsGenerating(false),
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Helper function to generate Markdown on-demand
  const generateMarkdownFromForm = () => {
    const formValues = getValues();
    const { contactInfo, summary, skills, experience, education, projects } =
      formValues;

    const parts = [];
    if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    const contactMarkdown =
      parts.length > 0
        ? `## <div align="center">${user?.fullName || ""}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
        : "";

    const newContent = [
      contactMarkdown,
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");

    return newContent || initialContent || "";
  };

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  useEffect(() => {
    const detectNonDesktop = () => {
      const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;
      const isTouchFirstDevice =
        window.matchMedia("(hover: none)").matches &&
        window.matchMedia("(pointer: coarse)").matches;

      setIsLikelyNonDesktop(isSmallScreen || isTouchFirstDevice);
    };

    detectNonDesktop();
    window.addEventListener("resize", detectNonDesktop);

    return () => {
      window.removeEventListener("resize", detectNonDesktop);
    };
  }, []);

  const onSubmit = async () => {
    try {
      let contentToSave = previewContent;
      // If we are on the edit tab, grab the latest form data before saving
      if (activeTab === "edit") {
        contentToSave = generateMarkdownFromForm();
        setPreviewContent(contentToSave);
      }

      const formattedContent = contentToSave
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true); // Turn on the loader immediately

    toast.info(
      "To keep links clickable, please choose 'Save as PDF' as your destination, not 'Microsoft Print to PDF'.",
      { duration: 6000 },
    );

    if (activeTab === "edit") {
      setPreviewContent(generateMarkdownFromForm());
    }

    // Wait 1.5 seconds so they can read the toast and see the loader,
    // then open the print dialog.
    setTimeout(() => {
      generatePDF();
    }, 1500);
  };

  const handleImportFromSaved = async () => {
    setIsImporting(true);
    try {
      const resume = await getResume();
      if (!resume || !resume.content) {
        toast.error("No saved resume found");
        return;
      }

      const formData = markdownToFormData(resume.content);
      if (!formData) {
        toast.error("Failed to parse saved resume");
        return;
      }

      reset(formData);
      toast.success("Resume imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import resume");
    } finally {
      setIsImporting(false);
      setShowImportDialog(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2 flex">
          <Button variant="destructive" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {isLikelyNonDesktop && (
        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">
            Downloading the PDF is currently supported only on desktop/laptop.
          </span>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // Generate markdown when switching to preview
          if (value === "preview" && activeTab === "edit") {
            setPreviewContent(generateMarkdownFromForm());
          }
          setActiveTab(value);
        }}
      >
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form className="space-y-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              disabled={isImporting}
              className="mt-1"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Import className="h-4 w-4 mr-2" />
                  Import from Saved
                </>
              )}
            </Button>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>

          {/* Hidden PDF container strictly for react-to-print */}
          <div className="hidden print:block">
            <div
              ref={contentRef}
              style={{
                padding: "20px",
                backgroundColor: "white",
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              }}
            >
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={previewContent}
                  style={{
                    background: "white",
                    color: "black",
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Saved Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current form data with the saved resume.
              Any unsaved changes in the form will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportFromSaved}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
