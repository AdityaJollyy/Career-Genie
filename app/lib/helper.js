// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}

// Helper function to parse markdown back to form data
export function markdownToFormData(markdown) {
  if (!markdown) return null;

  const formData = {
    contactInfo: {},
    summary: "",
    skills: "",
    experience: [],
    education: [],
    projects: [],
  };

  // Parse contact info from the centered div
  const emailMatch = markdown.match(/📧\s*([^\s|]+)/);
  const mobileMatch = markdown.match(/📱\s*([^\s|]+)/);
  const linkedinMatch = markdown.match(/💼\s*\[LinkedIn\]\(([^)]+)\)/);
  const twitterMatch = markdown.match(/🐦\s*\[Twitter\]\(([^)]+)\)/);

  if (emailMatch) formData.contactInfo.email = emailMatch[1];
  if (mobileMatch) formData.contactInfo.mobile = mobileMatch[1];
  if (linkedinMatch) formData.contactInfo.linkedin = linkedinMatch[1];
  if (twitterMatch) formData.contactInfo.twitter = twitterMatch[1];

  // Split markdown into sections
  const sections = markdown.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const header = lines[0].trim();

    // Skip the contact header (contains align="center")
    if (header.includes("align=")) continue;

    const content = lines.slice(1).join("\n").trim();

    if (header === "Professional Summary") {
      formData.summary = content;
    } else if (header === "Skills") {
      formData.skills = content;
    } else if (header === "Work Experience") {
      formData.experience = parseEntries(content);
    } else if (header === "Education") {
      formData.education = parseEntries(content);
    } else if (header === "Projects") {
      formData.projects = parseEntries(content);
    }
  }

  return formData;
}

// Helper function to parse entry sections (experience, education, projects)
function parseEntries(content) {
  if (!content) return [];

  const entries = [];
  const entryBlocks = content.split(/^### /m).filter(Boolean);

  for (const block of entryBlocks) {
    const lines = block.trim().split("\n");
    const titleLine = lines[0];

    // Parse "Title @ Organization"
    const titleMatch = titleLine.match(/^(.+?)\s*@\s*(.+)$/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const organization = titleMatch[2].trim();

    // Parse date range
    const dateLine = lines[1]?.trim() || "";
    const dateMatch = dateLine.match(/^(.+?)\s*-\s*(.+)$/);

    let startDate = "";
    let endDate = "";
    let current = false;

    if (dateMatch) {
      startDate = dateMatch[1].trim();
      const endPart = dateMatch[2].trim();
      if (endPart.toLowerCase() === "present") {
        current = true;
        endDate = "";
      } else {
        endDate = endPart;
      }
    }

    // Rest is description
    const description = lines.slice(2).join("\n").trim();

    entries.push({
      title,
      organization,
      startDate,
      endDate,
      current,
      description,
    });
  }

  return entries;
}
