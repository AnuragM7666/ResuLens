import { type FormEvent, useState } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        setStatusText('Uploading your file...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText('Error: Could not upload file');

        setStatusText('Converting PDF into an image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Conversion failed');

        setStatusText('Saving image to storage...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Error: Could not save image');

        setStatusText('Compiling your data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: {
                overallScore: 0,
                ATS: { score: 0, tips: [] },
                toneAndStyle: { score: 0, tips: [] },
                content: { score: 0, tips: [] },
                structure: { score: 0, tips: [] },
                skills: { score: 0, tips: [] }
            },
        };
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Running analysis...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        );
        if (!feedback) return setStatusText('Error: Could not process resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
            const parsedFeedback = JSON.parse(feedbackText);
            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('All done! Redirecting you...');
            console.log('Final resume data:', data);
            navigate(`/resume/${uuid}`);
        } catch (parseError) {
            console.error('Failed to parse feedback:', feedbackText, parseError);
            setStatusText('Error: Unable to interpret the results');
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>AI-powered resume insights</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Upload your resume to get an ATS match score & personalized feedback</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Target Company</label>
                                <input type="text" name="company-name" placeholder="Enter the company's name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Role</label>
                                <input type="text" name="job-title" placeholder="Enter the job title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Posting Details</label>
                                <textarea rows={5} name="job-description" placeholder="Paste the job description here" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Resume File</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Start Analysis
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};
export default Upload;
