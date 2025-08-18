import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "ResuLens" },
        { name: "description", content: "AI-powered insights for your career growth!" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        if(!auth.isAuthenticated) navigate('/auth?next=/');
    }, [auth.isAuthenticated])

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            setError(null);

            try {
                console.log('Loading resumes...');
                console.log('Auth status:', auth.isAuthenticated);
                console.log('User:', auth.user);
                
                // Try different patterns to see what's in the KV store
                const resumePattern = (await kv.list('resume:*', true)) as KVItem[];
                const allKeys = (await kv.list('*', false)) as string[];
                const allItems = (await kv.list('*', true)) as KVItem[];
                
                console.log('Raw KV items with resume:* pattern:', resumePattern);
                console.log('All KV keys:', allKeys);
                console.log('All KV items:', allItems);

                setDebugInfo({
                    authStatus: auth.isAuthenticated,
                    user: auth.user,
                    kvItems: resumePattern,
                    kvItemsCount: resumePattern?.length || 0,
                    allKeys: allKeys,
                    allKeysCount: allKeys?.length || 0,
                    allItems: allItems
                });

                if (!resumePattern || resumePattern.length === 0) {
                    console.log('No resumes found in KV storage');
                    setResumes([]);
                    setLoadingResumes(false);
                    return;
                }

                const parsedResumes = resumePattern.map((resume) => {
                    try {
                        const parsed = JSON.parse(resume.value) as Resume;
                        console.log('Parsed resume:', parsed);
                        return parsed;
                    } catch (parseError) {
                        console.error('Failed to parse resume:', resume.value, parseError);
                        return null;
                    }
                }).filter(Boolean) as Resume[];

                console.log('Final parsed resumes:', parsedResumes);
                setResumes(parsedResumes);
            } catch (err) {
                console.error('Error loading resumes:', err);
                setError(err instanceof Error ? err.message : 'Failed to load resumes');
            } finally {
                setLoadingResumes(false);
            }
        }

        if (auth.isAuthenticated) {
            loadResumes();
        }
    }, [auth.isAuthenticated, kv]);

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Manage Your Resumes & Application Scores</h1>
                {!loadingResumes && resumes?.length === 0 ? (
                    <h2>Looks like you haven't uploaded any resumes yet. Add one to get started with AI feedback.</h2>
                ): (
                    <h2>View your past submissions and explore detailed AI-generated analysis.</h2>
                )}
            </div>
            
            {/* Debug Information */}
            {import.meta.env.DEV && debugInfo && (
                <div className="bg-gray-800 p-4 rounded-lg text-sm text-left max-w-2xl">
                    <h3 className="font-bold mb-2">Debug Info:</h3>
                    <p>Auth Status: {debugInfo.authStatus ? 'Authenticated' : 'Not Authenticated'}</p>
                    <p>User: {debugInfo.user?.username || 'No user'}</p>
                    <p>KV Items Found (resume:*): {debugInfo.kvItemsCount}</p>
                    <p>All KV Keys Found: {debugInfo.allKeysCount}</p>
                    <p>Resumes Loaded: {resumes.length}</p>
                    
                    {debugInfo.allKeys && debugInfo.allKeys.length > 0 && (
                        <div>
                            <p className="font-bold mt-2">All KV Keys:</p>
                            <ul className="list-disc list-inside">
                                {debugInfo.allKeys.map((key: string, index: number) => (
                                    <li key={index}>{key}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {debugInfo.kvItems && debugInfo.kvItems.length > 0 && (
                        <div>
                            <p className="font-bold mt-2">Resume KV Keys:</p>
                            <ul className="list-disc list-inside">
                                {debugInfo.kvItems.map((item: KVItem, index: number) => (
                                    <li key={index}>{item.key}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            
            {error && (
                <div className="flex flex-col items-center justify-center text-red-400">
                    <p>Error: {error}</p>
                </div>
            )}
            
            {loadingResumes && (
                <div className="flex flex-col items-center justify-center">
                    <img src="/images/resume-scan-2.gif" className="w-[200px]" />
                </div>
            )}

            {!loadingResumes && resumes.length > 0 && (
                <div className="resumes-section">
                    {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume} />
                    ))}
                </div>
            )}

            {!loadingResumes && resumes?.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center mt-10 gap-4">
                    <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                        Upload Your Resume
                    </Link>
                    
                    {/* Debug: Create test resume */}
                    {import.meta.env.DEV && (
                        <button 
                            onClick={async () => {
                                try {
                                    const testResume = {
                                        id: 'test-' + Date.now(),
                                        companyName: 'Test Company',
                                        jobTitle: 'Test Position',
                                        imagePath: '/images/pdf.png',
                                        resumePath: '/images/pdf.png',
                                        feedback: {
                                            overallScore: 85,
                                            ATS: { score: 90, tips: [] },
                                            toneAndStyle: { score: 80, tips: [] },
                                            content: { score: 85, tips: [] },
                                            structure: { score: 90, tips: [] },
                                            skills: { score: 80, tips: [] }
                                        }
                                    };
                                    
                                    await kv.set(`resume:${testResume.id}`, JSON.stringify(testResume));
                                    console.log('Test resume created:', testResume);
                                    
                                    // Reload the page to see the new resume
                                    window.location.reload();
                                } catch (err) {
                                    console.error('Failed to create test resume:', err);
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Create Test Resume (Debug)
                        </button>
                    )}
                </div>
            )}
        </section>
    </main>
}
