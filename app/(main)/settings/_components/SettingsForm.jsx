"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

export default function SettingsForm({ industries, initialData }) {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Find the initial industry object for pre-selecting specializations
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    if (initialData.industry) {
      return industries.find((ind) => ind.id === initialData.industry) || null;
    }
    return null;
  });

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name || "",
      industry: initialData.industry || "",
      subIndustry: initialData.subIndustry || "",
      experience: initialData.experience?.toString() || "",
      skills: initialData.skills || "",
      bio: initialData.bio || "",
    },
  });

  const onSubmit = async (values) => {
    try {
      // Update name in Clerk if it changed
      if (clerkUser && values.name !== initialData.name) {
        const nameParts = values.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await clerkUser.update({
          firstName,
          lastName,
        });
      }

      // Format industry for database
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      await updateUserFn({
        name: values.name,
        industry: formattedIndustry,
        experience: values.experience,
        skills: values.skills,
        bio: values.bio,
      });
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Handle success/error states
  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile updated successfully!");
      router.refresh();
    }
  }, [updateResult, updateLoading, router]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError.message || "Failed to update profile");
    }
  }, [updateError]);

  const watchIndustry = useWatch({
    control,
    name: "industry",
  });

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">Settings</CardTitle>
          <CardDescription>
            Update your profile information and professional details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={initialData.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email is managed by your account provider
                </p>
              </div>
            </div>

            {/* Professional Profile Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Professional Profile</h3>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  defaultValue={initialData.industry}
                  onValueChange={(value) => {
                    setValue("industry", value, { shouldValidate: true });
                    setSelectedIndustry(
                      industries.find((ind) => ind.id === value),
                    );
                    setValue("subIndustry", "");
                  }}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Industries</SelectLabel>
                      {industries.map((ind) => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-500">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              {/* Specialization */}
              {watchIndustry && (
                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Specialization</Label>
                  <Select
                    defaultValue={initialData.subIndustry}
                    onValueChange={(value) =>
                      setValue("subIndustry", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="subIndustry">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Specializations</SelectLabel>
                        {selectedIndustry?.subIndustries.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.subIndustry && (
                    <p className="text-sm text-red-500">
                      {errors.subIndustry.message}
                    </p>
                  )}
                </div>
              )}

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Enter years of experience"
                  {...register("experience")}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">
                    {errors.experience.message}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Python, JavaScript, Project Management"
                  {...register("skills")}
                />
                <p className="text-sm text-muted-foreground">
                  Separate multiple skills with commas
                </p>
                {errors.skills && (
                  <p className="text-sm text-red-500">
                    {errors.skills.message}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your professional background..."
                  className="h-32"
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
