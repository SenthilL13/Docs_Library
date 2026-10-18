import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Loader2, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Category, DocumentItem, User } from '../../types/database';
import { generatePdfThumbnail } from '../../lib/pdf';
import { storageService } from '../../services/storageService';
import { documentsService } from '../../services/documentsService';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentUser: User;
  existingDocuments: DocumentItem[];
  onSuccess: () => void;
}

interface DocumentMetadata {
  title: string;
  category: string;
  keywords: string[];
  summary: string;
}

// Document metadata from analysis report
const DOCUMENT_METADATA: Record<string, DocumentMetadata> = {
  '100 Q Python.pdf': {
    title: '100 Python Interview Questions',
    category: 'Programming',
    keywords: ['Python', 'interview', 'DSA', 'algorithms'],
    summary: '100 Python interview questions covering fundamentals, data structures, and OOP'
  },
  '150 python programs .pdf': {
    title: '150 Python Programming Examples',
    category: 'Programming',
    keywords: ['Python', 'programming', 'examples', 'algorithms'],
    summary: '150 Python programs from basic to advanced levels'
  },
  '1778138773819.pdf': {
    title: 'Technical Documentation Reference',
    category: 'Technical',
    keywords: ['documentation', 'reference', 'technical'],
    summary: 'Comprehensive technical documentation'
  },
  '50API.pdf': {
    title: '50 API Development Guide',
    category: 'API',
    keywords: ['API', 'REST', 'web services', 'integration'],
    summary: 'Complete guide covering 50 API concepts and best practices'
  },
  '50Q most asked Api interview questions .pdf': {
    title: '50 Most Asked API Interview Questions',
    category: 'Interview',
    keywords: ['API', 'interview', 'HTTP', 'REST'],
    summary: '50 frequently asked API interview questions'
  },
  'Advanced reactjs.pdf': {
    title: 'Advanced React.js Development Guide',
    category: 'Frontend',
    keywords: ['React', 'hooks', 'frontend', 'JavaScript'],
    summary: 'Advanced React concepts including hooks, performance, and patterns'
  },
  'AI complete notes.pdf': {
    title: 'Complete Artificial Intelligence Notes',
    category: 'AI/ML',
    keywords: ['AI', 'machine learning', 'neural networks', 'deep learning'],
    summary: 'Comprehensive AI notes covering ML, DL, NLP, and CV'
  },
  'Amazon System Design.pdf': {
    title: 'Amazon System Design Case Study',
    category: 'System Design',
    keywords: ['Amazon', 'system design', 'scalability', 'microservices'],
    summary: 'Detailed analysis of Amazon architecture and scalability patterns'
  },
  'Auth_Notes.pdf': {
    title: 'Authentication & Security Notes',
    category: 'Security',
    keywords: ['authentication', 'security', 'OAuth', 'JWT', 'encryption'],
    summary: 'Comprehensive notes on authentication systems and security protocols'
  },
  'AWS.pdf': {
    title: 'Amazon Web Services Fundamentals',
    category: 'Cloud',
    keywords: ['AWS', 'cloud', 'EC2', 'S3', 'Lambda'],
    summary: 'AWS fundamentals covering core services and cloud architecture'
  },
  'Backend interview questions .pdf': {
    title: 'Backend Developer Interview Questions',
    category: 'Interview',
    keywords: ['backend', 'interview', 'databases', 'APIs', 'performance'],
    summary: 'Comprehensive backend interview questions and best practices'
  },
  'Caching.pdf': {
    title: 'Caching Strategies and Implementation',
    category: 'System Design',
    keywords: ['caching', 'performance', 'Redis', 'Memcached', 'CDN'],
    summary: 'In-depth guide on caching strategies and optimization'
  },
  'Chatgpt system Design .pdf': {
    title: 'ChatGPT System Design Analysis',
    category: 'System Design',
    keywords: ['ChatGPT', 'system design', 'LLM', 'AI architecture'],
    summary: 'System design analysis of ChatGPT architecture and infrastructure'
  },
  'Computer Architecture .pdf': {
    title: 'Computer Architecture Fundamentals',
    category: 'Computer Science',
    keywords: ['computer architecture', 'CPU', 'memory', 'hardware'],
    summary: 'Computer architecture fundamentals and hardware-software interaction'
  },
  'Data Science .pdf': {
    title: 'Data Science Fundamentals',
    category: 'Data Science',
    keywords: ['data science', 'statistics', 'ML', 'visualization'],
    summary: 'Data science fundamentals covering statistics and ML algorithms'
  },
  'Django Python .pdf': {
    title: 'Django Python Framework Guide',
    category: 'Backend',
    keywords: ['Django', 'Python', 'web development', 'ORM'],
    summary: 'Django framework guide for building web applications'
  },
  'DSA Notes.pdf': {
    title: 'Data Structures and Algorithms Notes',
    category: 'DSA',
    keywords: ['DSA', 'data structures', 'algorithms', 'complexity'],
    summary: 'DSA notes covering arrays, trees, graphs, and algorithms'
  },
  'Dsa2.pdf': {
    title: 'Advanced Data Structures and Algorithms',
    category: 'DSA',
    keywords: ['DSA', 'dynamic programming', 'graph algorithms', 'optimization'],
    summary: 'Advanced DSA concepts including DP and complex algorithms'
  },
  'FastAPI (1).pdf': {
    title: 'FastAPI Framework Guide Part 1',
    category: 'Backend',
    keywords: ['FastAPI', 'Python', 'web API', 'async'],
    summary: 'FastAPI basics, routing, models, and validation'
  },
  'FastAPI (2).pdf': {
    title: 'FastAPI Framework Guide Part 2',
    category: 'Backend',
    keywords: ['FastAPI', 'Python', 'authentication', 'WebSocket'],
    summary: 'Advanced FastAPI concepts including auth and WebSocket'
  },
  'FastApi.pdf': {
    title: 'FastAPI Complete Reference',
    category: 'Backend',
    keywords: ['FastAPI', 'Python', 'REST API', 'middleware'],
    summary: 'Complete FastAPI reference from basics to advanced'
  },
  'FS AI.pdf': {
    title: 'Full Stack AI Development',
    category: 'AI/ML',
    keywords: ['AI', 'full stack', 'ML deployment', 'integration'],
    summary: 'Full stack AI development and model deployment'
  },
  'Gate Aptitude .pdf': {
    title: 'GATE Aptitude Preparation',
    category: 'Aptitude',
    keywords: ['GATE', 'aptitude', 'reasoning', 'quantitative'],
    summary: 'GATE exam aptitude preparation material'
  },
  'GenAI.pdf': {
    title: 'Generative AI Fundamentals',
    category: 'AI/ML',
    keywords: ['Generative AI', 'LLM', 'image generation', 'prompting'],
    summary: 'Generative AI fundamentals and applications'
  },
  'Git & GitHub 2 (1).pdf': {
    title: 'Git & GitHub Advanced Concepts',
    category: 'DevOps',
    keywords: ['Git', 'GitHub', 'CI/CD', 'branching'],
    summary: 'Advanced Git concepts and team collaboration'
  },
  'Git & GitHub 2.pdf': {
    title: 'Git & GitHub Fundamentals',
    category: 'DevOps',
    keywords: ['Git', 'GitHub', 'version control', 'repositories'],
    summary: 'Git and GitHub fundamentals and basic commands'
  },
  'Instagram system Design .pdf': {
    title: 'Instagram System Design Case Study',
    category: 'System Design',
    keywords: ['Instagram', 'system design', 'social media', 'media storage'],
    summary: 'Instagram architecture covering media storage and feeds'
  },
  'Irctc SEAT.pdf': {
    title: 'IRCTC Seat Allocation System',
    category: 'System Design',
    keywords: ['IRCTC', 'system design', 'seat allocation', 'concurrency'],
    summary: 'IRCTC seat allocation system design and concurrency handling'
  },
  'Irctc system design.pdf': {
    title: 'IRCTC System Design Architecture',
    category: 'System Design',
    keywords: ['IRCTC', 'system design', 'ticket booking', 'scalability'],
    summary: 'Comprehensive IRCTC system design and ticket booking architecture'
  },
  'Kafka.pdf': {
    title: 'Apache Kafka Messaging System',
    category: 'System Design',
    keywords: ['Kafka', 'messaging', 'event streaming', 'distributed'],
    summary: 'Apache Kafka guide for event-driven architectures'
  },
  'LinkedIn system Design .pdf': {
    title: 'LinkedIn System Design Case Study',
    category: 'System Design',
    keywords: ['LinkedIn', 'system design', 'social network', 'recommendations'],
    summary: 'LinkedIn architecture for professional networks'
  },
  'Linux Security .pdf': {
    title: 'Linux Security Fundamentals',
    category: 'Security',
    keywords: ['Linux', 'security', 'firewall', 'SELinux'],
    summary: 'Linux security fundamentals and server hardening'
  },
  'MCP.pdf': {
    title: 'Model Context Protocol Guide',
    category: 'AI/ML',
    keywords: ['MCP', 'AI protocol', 'model integration', 'context'],
    summary: 'Model Context Protocol for AI model integration'
  },
  'Microservices.pdf': {
    title: 'Microservices Architecture Guide',
    category: 'Architecture',
    keywords: ['microservices', 'architecture', 'Docker', 'Kubernetes'],
    summary: 'Microservices architecture and deployment patterns'
  },
  'Netflix System Design .pdf': {
    title: 'Netflix System Design Case Study',
    category: 'System Design',
    keywords: ['Netflix', 'system design', 'streaming', 'CDN'],
    summary: 'Netflix streaming architecture and CDN design'
  },
  'Nodejs.pdf': {
    title: 'Node.js Development Guide',
    category: 'Backend',
    keywords: ['Node.js', 'JavaScript', 'Express', 'REST API'],
    summary: 'Node.js development guide for server-side applications'
  },
  'NumPy.pdf': {
    title: 'NumPy Library Guide',
    category: 'Data Science',
    keywords: ['NumPy', 'Python', 'data science', 'arrays'],
    summary: 'NumPy library for numerical computing and data science'
  },
  'Pandas.pdf': {
    title: 'Pandas Library Guide',
    category: 'Data Science',
    keywords: ['Pandas', 'Python', 'data science', 'DataFrames'],
    summary: 'Pandas library for data manipulation and analysis'
  },
  'Prompt Engineering .pdf': {
    title: 'Prompt Engineering Fundamentals',
    category: 'AI/ML',
    keywords: ['prompt engineering', 'AI', 'LLM', 'prompting'],
    summary: 'Prompt engineering fundamentals and techniques'
  },
  'Prompt Engineering 2.pdf': {
    title: 'Advanced Prompt Engineering',
    category: 'AI/ML',
    keywords: ['prompt engineering', 'advanced', 'LLM', 'optimization'],
    summary: 'Advanced prompt engineering patterns and strategies'
  },
  'Razorpay System Design .pdf': {
    title: 'Razorpay System Design Case Study',
    category: 'System Design',
    keywords: ['Razorpay', 'system design', 'payment gateway', 'fintech'],
    summary: 'Razorpay payment gateway architecture and security'
  },
  'REACT.pdf': {
    title: 'React.js Development Guide',
    category: 'Frontend',
    keywords: ['React', 'JavaScript', 'frontend', 'components'],
    summary: 'React.js development guide for modern UI development'
  },
  'REDIS.pdf': {
    title: 'Redis In-Memory Database Guide',
    category: 'Database',
    keywords: ['Redis', 'caching', 'database', 'performance'],
    summary: 'Redis guide for high-performance data storage'
  },
  'Rest API.pdf': {
    title: 'RESTful API Design Guide',
    category: 'API',
    keywords: ['REST', 'API', 'HTTP', 'web services'],
    summary: 'RESTful API design principles and best practices'
  },
  'Software Testing .pdf': {
    title: 'Software Testing Fundamentals',
    category: 'QA',
    keywords: ['software testing', 'QA', 'automation', 'testing'],
    summary: 'Software testing fundamentals and quality assurance'
  },
  'Spotify System Design .pdf': {
    title: 'Spotify System Design Case Study',
    category: 'System Design',
    keywords: ['Spotify', 'system design', 'streaming', 'music'],
    summary: 'Spotify music streaming architecture and personalization'
  },
  'System Design .pdf': {
    title: 'System Design Fundamentals',
    category: 'System Design',
    keywords: ['system design', 'scalability', 'distributed systems'],
    summary: 'System design fundamentals and distributed systems'
  },
  'System Design 2.pdf': {
    title: 'Advanced System Design',
    category: 'System Design',
    keywords: ['system design', 'CAP theorem', 'consensus', 'architecture'],
    summary: 'Advanced system design and architectural patterns'
  },
  'System Design interview questions .pdf': {
    title: 'System Design Interview Questions',
    category: 'Interview',
    keywords: ['system design', 'interview', 'scalability', 'architecture'],
    summary: 'System design interview questions and solutions'
  },
  'Top 50 System Design interview questions.pdf': {
    title: 'Top 50 System Design Interview Questions',
    category: 'Interview',
    keywords: ['system design', 'interview', 'FAANG', 'preparation'],
    summary: 'Top 50 system design interview questions with solutions'
  },
  'Top30DSAcodedsoul_05.pdf': {
    title: 'Top 30 DSA Coding Problems',
    category: 'DSA',
    keywords: ['DSA', 'coding', 'algorithms', 'interview'],
    summary: 'Top 30 DSA coding problems with solutions'
  },
  'Uber System Design .pdf': {
    title: 'Uber System Design Case Study',
    category: 'System Design',
    keywords: ['Uber', 'system design', 'ride-sharing', 'real-time'],
    summary: 'Uber ride-sharing architecture and real-time tracking'
  },
  'UPI system Design .pdf': {
    title: 'UPI System Design Case Study',
    category: 'System Design',
    keywords: ['UPI', 'system design', 'payments', 'fintech'],
    summary: 'UPI payment system design and transaction processing'
  },
  'Vs code shortcut .pdf': {
    title: 'VS Code Keyboard Shortcuts',
    category: 'Tools',
    keywords: ['VS Code', 'shortcuts', 'productivity', 'editor'],
    summary: 'VS Code shortcuts and productivity tips'
  },
  'Web Hosting .pdf': {
    title: 'Web Hosting Fundamentals',
    category: 'DevOps',
    keywords: ['web hosting', 'deployment', 'cloud', 'domains'],
    summary: 'Web hosting fundamentals and application deployment'
  },
  'WhatsApp System Design .pdf': {
    title: 'WhatsApp System Design Case Study',
    category: 'System Design',
    keywords: ['WhatsApp', 'system design', 'messaging', 'encryption'],
    summary: 'WhatsApp messaging architecture and E2E encryption'
  },
  'Youtube System Design .pdf': {
    title: 'YouTube System Design Case Study',
    category: 'System Design',
    keywords: ['YouTube', 'system design', 'video streaming', 'recommendations'],
    summary: 'YouTube video streaming and recommendation architecture'
  },
  'Zomato System Design.pdf': {
    title: 'Zomato System Design Case Study',
    category: 'System Design',
    keywords: ['Zomato', 'system design', 'food delivery', 'real-time'],
    summary: 'Zomato food delivery architecture and order processing'
  }
};

interface UploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'duplicate';
  progress: number;
  error?: string;
  existingDoc?: DocumentItem;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentUser,
  existingDocuments,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);

      // Initial status - will check for duplicates during upload when we have page count
      const progress = files.map((file) => ({
        fileName: file.name,
        status: 'pending' as const,
        progress: 0,
      }));

      setUploadProgress(progress);
      setError(null);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((f) => f.name !== fileName));
    setUploadProgress(uploadProgress.filter((p) => p.fileName !== fileName));
  };

  const checkForDuplicate = (fileName: string, title: string, pageCount: number): DocumentItem | null => {
    return existingDocuments.find(doc =>
      doc.file_name === fileName ||
      (doc.title === title && doc.page_count === pageCount)
    ) || null;
  };

  const uploadSingleDocument = async (file: File, index: number): Promise<void> => {
    try {
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name ? { ...p, status: 'uploading', progress: 10 } : p
        )
      );

      // Get metadata from analysis
      const metadata = DOCUMENT_METADATA[file.name] || {
        title: file.name.replace('.pdf', ''),
        category: 'General',
        keywords: [],
        summary: 'Technical document',
      };

      // Find matching category
      const categoryMatch = categories.find(
        (c) => c.name.toLowerCase() === metadata.category.toLowerCase()
      );
      const categoryId = categoryMatch?.id || null;

      // Generate thumbnail to get page count
      setCurrentStep(`Generating thumbnail for ${file.name}...`);
      let previewPath: string | null = null;
      let pageCount = 1;
      try {
        const thumbnailResult = await generatePdfThumbnail(file);
        const previewUpload = await storageService.uploadPreview(thumbnailResult.previewBlob, file.name);
        previewPath = previewUpload.path;
        pageCount = thumbnailResult.pageCount;
      } catch (thumbErr) {
        console.warn(`Could not generate thumbnail for ${file.name}:`, thumbErr);
        // Continue without thumbnail
      }

      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name ? { ...p, progress: 40 } : p
        )
      );

      // Check for duplicate after getting page count
      const existingDoc = checkForDuplicate(file.name, metadata.title, pageCount);
      if (existingDoc) {
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name
              ? { ...p, status: 'duplicate', progress: 100, existingDoc }
              : p
          )
        );
        return;
      }

      // Upload PDF
      setCurrentStep(`Uploading ${file.name} to storage...`);
      const pdfUpload = await storageService.uploadPdf(file);

      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name ? { ...p, progress: 70 } : p
        )
      );

      // Create document record as draft initially
      setCurrentStep(`Saving metadata for ${file.name}...`);
      await documentsService.createDocument(
        {
          title: metadata.title,
          fileName: file.name,
          filePath: pdfUpload.path,
          description: metadata.summary,
          categoryId,
          tags: metadata.keywords,
          status: 'draft',
          fileSize: file.size,
          previewPath,
          pageCount,
        },
        currentUser
      );

      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name ? { ...p, status: 'success', progress: 100 } : p
        )
      );
    } catch (err: any) {
      console.error(`Failed to upload ${file.name}:`, err);
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, status: 'error', error: err.message || 'Upload failed' }
            : p
        )
      );
    }
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    // Upload files sequentially to avoid overwhelming the system
    for (let i = 0; i < selectedFiles.length; i++) {
      await uploadSingleDocument(selectedFiles[i], i);
    }

    setIsUploading(false);
    setCurrentStep('');
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setUploadProgress([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublishDuplicate = async (fileName: string, existingDoc: DocumentItem) => {
    try {
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName ? { ...p, status: 'uploading', progress: 50 } : p
        )
      );

      await documentsService.updateDocument(existingDoc.id, {
        status: 'published',
      }, currentUser);

      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName ? { ...p, status: 'success', progress: 100 } : p
        )
      );
    } catch (err: any) {
      console.error(`Failed to publish ${fileName}:`, err);
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName
            ? { ...p, status: 'error', error: err.message || 'Publish failed' }
            : p
        )
      );
    }
  };

  if (!isOpen) return null;

  const successCount = uploadProgress.filter((p) => p.status === 'success').length;
  const errorCount = uploadProgress.filter((p) => p.status === 'error').length;
  const isComplete = uploadProgress.length > 0 && uploadProgress.every((p) => p.status !== 'uploading' && p.status !== 'pending');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-fade-in max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bulk Document Import</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload multiple documents with auto-filled metadata from analysis report
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Selection */}
          {selectedFiles.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50 hover:bg-sky-50/20 dark:hover:bg-sky-900/20"
            >
              <UploadCloud className="w-12 h-12 text-sky-600 dark:text-sky-400 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-800 dark:text-slate-200 mb-1">
                Select PDF files to upload
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click to browse or drag & drop multiple PDF files
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Metadata will be auto-filled from document analysis report
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Selected Files ({selectedFiles.length})
                </h3>
                {!isUploading && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {uploadProgress.map((progress) => {
                  const metadata = DOCUMENT_METADATA[progress.fileName];
                  const isDuplicate = progress.status === 'duplicate';
                  return (
                    <div
                      key={progress.fileName}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isDuplicate
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <FileText className={`w-5 h-5 flex-shrink-0 ${
                        isDuplicate
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {metadata?.title || progress.fileName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {metadata?.category || 'General'} • {metadata?.keywords.slice(0, 3).join(', ') || 'Technical document'}
                        </p>
                        {isDuplicate && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            ✓ Already exists (Draft) - Click Publish to make visible
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {progress.status === 'pending' && !isUploading && (
                          <button
                            onClick={() => handleRemoveFile(progress.fileName)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {progress.status === 'duplicate' && progress.existingDoc && (
                          <button
                            onClick={() => handlePublishDuplicate(progress.fileName, progress.existingDoc!)}
                            className="px-3 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        {progress.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
                        )}
                        {progress.status === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {progress.status === 'error' && (
                          <span title={progress.error}>
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Status */}
          {isUploading && currentStep && (
            <div className="p-3 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg flex items-center gap-3 text-xs text-sky-800 dark:text-sky-300">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600 dark:text-sky-400" />
              <span>{currentStep}</span>
            </div>
          )}

          {/* Completion Summary */}
          {isComplete && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Bulk Import Complete
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {successCount} uploaded • {uploadProgress.filter(p => p.status === 'duplicate').length} duplicates found
                    {errorCount > 0 && ` • ${errorCount} failed`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {isComplete ? 'Close' : 'Cancel'}
          </button>
          {selectedFiles.length > 0 && !isUploading && !isComplete && (
            <button
              onClick={handleBulkUpload}
              className="px-5 py-2 text-sm font-medium text-white bg-sky-600 dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-600 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload {selectedFiles.length} Documents</span>
            </button>
          )}
          {isComplete && (
            <button
              onClick={() => {
                handleReset();
                onSuccess();
              }}
              className="px-5 py-2 text-sm font-medium text-white bg-sky-600 dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-600 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
            >
              Upload More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
