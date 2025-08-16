// src/data/resumes.ts

export const resumes: Resume[] = [
    {
      id: "1",
      companyName: "Google",
      jobTitle: "Frontend Developer",
      imagePath: "/images/resume_01.png",
      resumePath: "/resumes/resume-1.pdf",
      feedback: {
        overallScore: 85,
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
      },
    },
    {
      id: "2",
      companyName: "Microsoft",
      jobTitle: "Cloud Engineer",
      imagePath: "/images/resume_02.png",
      resumePath: "/resumes/resume-2.pdf",
      feedback: {
        overallScore: 55,
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
      },
    },
    {
      id: "3",
      companyName: "Apple",
      jobTitle: "iOS Developer",
      imagePath: "/images/resume_03.png",
      resumePath: "/resumes/resume-3.pdf",
      feedback: {
        overallScore: 75,
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
      },
    },
  ];
  
  /**
   * Defines the format in which AI should return the resume feedback.
   */
  export const AIResponseFormat = `
    interface Feedback {
      overallScore: number; // 0–100
  
      ATS: {
        score: number; // ATS optimization score
        tips: {
          type: "good" | "improve";
          tip: string; // short title
          explanation?: string; // optional detailed explanation
        }[];
      };
  
      toneAndStyle: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string;
          explanation: string;
        }[];
      };
  
      content: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string;
          explanation: string;
        }[];
      };
  
      structure: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string;
          explanation: string;
        }[];
      };
  
      skills: {
        score: number;
        tips: {
          type: "good" | "improve";
          tip: string;
          explanation: string;
        }[];
      };
    }
  `;
  
  /**
   * Prepares a clean AI prompt with job context for resume evaluation.
   */
  export const prepareInstructions = ({
    jobTitle,
    jobDescription,
  }: {
    jobTitle: string;
    jobDescription: string;
  }) => `
    You are an expert in Applicant Tracking Systems (ATS) and resume analysis.
  
    Your task:
    - Analyze the given resume against the job requirements.
    - Assign **detailed scores (0–100)** for each section.
    - Highlight **strengths ("good")** and **areas to improve ("improve")** with clear tips.
    - Be honest and constructive — if the resume is weak, do not hesitate to assign low scores.
    - Use the provided job title and description to tailor recommendations.
  
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
  
    Return the response strictly as a JSON object matching this schema:
    ${AIResponseFormat}
  
    ❌ Do NOT include extra text, markdown, or explanations outside the JSON.
  `;
  