export const SITE_ORIGIN = "https://syllabi.adamsimms.xyz";

const institution = "Concordia University";

export const pageSeo = {
  phot331: {
    site: `PHOT 331 Digital Photography I — open syllabus and course materials taught by Adam Simms at ${institution}.`,
    home: `PHOT 331 Digital Photography I — introductory digital photography syllabus at ${institution}.`,
    overview: `Full syllabus for PHOT 331 Digital Photography I at ${institution}: prerequisites, course description, objectives, grading, and materials.`,
    delivery: `Delivery format and studio schedule for PHOT 331 Digital Photography I at ${institution}.`,
    schedule: `Week-by-week schedule for PHOT 331 Digital Photography I (Winter 2025).`,
    rules: `Course policies for PHOT 331 Digital Photography I — attendance, late work, academic integrity, and studio conduct.`,
    "student-services": `Student services, labs, and support resources for PHOT 331 Digital Photography I at ${institution}.`,
    inputs: `Assignment 1 (Inputs) for PHOT 331 — scanning analog materials and preparing digital image files.`,
    printing: `Assignment 2 (Printing) for PHOT 331 — colour-managed digital printing workflow and output.`,
    "composite-triptych": `Assignment 3 (Composite Triptych) for PHOT 331 — advanced Photoshop compositing and creative image-making.`,
    readings: `Readings, manuals, and downloadable course files for PHOT 331 Digital Photography I.`,
    "faculty-of-fine-arts": `Faculty of Fine Arts information for students in PHOT 331 at ${institution}.`,
    "photography-program": `Photography program at ${institution} — context for PHOT 331 Digital Photography I.`,
  },
  phot332: {
    site: `PHOT 332 Digital Photography II — open syllabus and course materials taught by Adam Simms at ${institution}.`,
    home: `PHOT 332 Digital Photography II — advanced digital photography syllabus at ${institution}.`,
    overview: `Full syllabus for PHOT 332 Digital Photography II at ${institution}: prerequisites, objectives, grading, and materials.`,
    delivery: `Delivery format and studio schedule for PHOT 332 Digital Photography II at ${institution}.`,
    schedule: `Week-by-week schedule for PHOT 332 Digital Photography II (Winter 2025).`,
    rules: `Course policies for PHOT 332 Digital Photography II — attendance, late work, academic integrity, and studio conduct.`,
    "student-services": `Student services, labs, and support resources for PHOT 332 Digital Photography II at ${institution}.`,
    "group-presentations": `Assignment 1 (Group Presentations) for PHOT 332 — critical readings on digital photography and culture.`,
    triptyque: `Assignment 2 (Triptyque) for PHOT 332 — printed triptych exploring composite and AI image-making.`,
    "looking-through-the-screen": `Assignment 3 (Looking Through the Screen) for PHOT 332 — online final project on digital image circulation.`,
    readings: `Readings, manuals, and downloadable course files for PHOT 332 Digital Photography II.`,
    "faculty-of-fine-arts": `Faculty of Fine Arts information for students in PHOT 332 at ${institution}.`,
    "photography-program": `Photography program at ${institution} — context for PHOT 332 Digital Photography II.`,
  },
  phot398: {
    site: `PHOT 398 As Seen on Screens — open syllabus on cyberspace and the image economy, taught by Adam Simms at ${institution}.`,
    home: `PHOT 398 As Seen on Screens — remote studio course on net art and digital image circulation at ${institution}.`,
    overview: `Full syllabus for PHOT 398 As Seen on Screens at ${institution}: course description, objectives, grading, and delivery.`,
    delivery: `Remote delivery format for PHOT 398 As Seen on Screens — online studio practices and participation.`,
    schedule: `Week-by-week schedule for PHOT 398 As Seen on Screens.`,
    rules: `Course policies for PHOT 398 — participation, academic integrity, and online studio conduct.`,
    "student-services": `Student services and support resources for PHOT 398 at ${institution}.`,
    "moodle-responses": `Moodle Responses assignment for PHOT 398 — weekly discussion posts on readings.`,
    "group-presentation": `Group Presentation assignment for PHOT 398 — collaborative analysis of course readings.`,
    "research-creation-project": `Research-Creation Project for PHOT 398 — online-only final project on screens and image economies.`,
    readings: `Readings and downloadable course files for PHOT 398 As Seen on Screens.`,
    "faculty-of-fine-arts": `Faculty of Fine Arts information for students in PHOT 398 at ${institution}.`,
    "photography-program": `Photography program at ${institution} — context for PHOT 398 As Seen on Screens.`,
  },
  phot400: {
    site: `PHOT 400 Advanced Workshop in Photography — capstone syllabus and materials taught by Adam Simms at ${institution}.`,
    home: `PHOT 400 Advanced Workshop in Photography — yearlong capstone studio syllabus at ${institution}.`,
    overview: `Full syllabus for PHOT 400 Advanced Workshop in Photography at ${institution}: objectives, grading, mentorship, and expectations.`,
    delivery: `Delivery format for PHOT 400 — critiques, gallery visits, and individual mentorship in the capstone studio.`,
    schedule: `Schedule for PHOT 400 Advanced Workshop in Photography (Fall 2025 – Winter 2025).`,
    rules: `Course policies for PHOT 400 — participation, critiques, academic integrity, and studio conduct.`,
    "student-services": `Student services and support resources for PHOT 400 at ${institution}.`,
    proposal: `Proposal assignment for PHOT 400 — research-creation project proposal and conceptual framework.`,
    "mid-term-presentation": `Mid-Term Presentation for PHOT 400 — progress critique on the capstone research-creation project.`,
    "final-presentation-and-critique": `Final Presentation and Critique for PHOT 400 — resolved body of work and verbal articulation.`,
    "class-participation": `Class Participation expectations for PHOT 400 Advanced Workshop in Photography.`,
    readings: `Readings and downloadable course files for PHOT 400 Advanced Workshop in Photography.`,
    "faculty-of-fine-arts": `Faculty of Fine Arts information for students in PHOT 400 at ${institution}.`,
    "photography-program": `Photography program at ${institution} — context for PHOT 400 Advanced Workshop in Photography.`,
  },
};

export function seoDescription(slug, pageKey) {
  const course = pageSeo[slug];
  if (!course) {
    throw new Error(`Unknown course slug: ${slug}`);
  }
  const description = course[pageKey];
  if (!description) {
    throw new Error(`Missing SEO description for ${slug}/${pageKey}`);
  }
  return description;
}
