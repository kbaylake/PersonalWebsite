export const skills = [
  "Python for AI/ML",
  "Machine Learning (Supervised & Unsupervised)",
  "Computer Vision (OpenCV, Image Processing)",
  "Agentic AI Systems",
  "MCP (Model Context Protocol)",
  "Data Preprocessing & Feature Engineering",
  "Model Evaluation & Optimization",
  "Pandas & NumPy",
  "SQL (MySQL) for Data Pipelines",
  "ETL & Data Pipelines",
  "REST APIs & AI Integration",
  "Power BI (AI-driven Analytics)",
  "Data Visualization",
  "Git & Docker"
];

export interface Project {
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  impact: string;
  stack: string[];
  points: string[];
  github?: boolean;
  paper?: boolean;
}

export const projects: Project[] = [
  {
    title: "Agentic RAG Pipeline",
    subtitle: "LangChain Agents, ChromaDB & Llama Fine-Tuning",
    category: "Agentic AI",
    summary: "A fully autonomous AI system that ingests documents, reasons across them in multi-step chains, and generates context-aware responses — running entirely on local hardware at zero cloud cost.",
    impact: "500+ post training dataset · Zero cloud cost · Full local GPU stack · MLflow experiment tracking",
    stack: ["LangChain Agents", "ChromaDB", "RAG", "Llama (Fine-Tuned)", "CUDA", "cuDNN", "WSL2", "PyTorch", "TensorFlow", "MLflow"],
    points: [
      "Architected a production-grade agentic GenAI pipeline: ingested and embedded documents into ChromaDB vector database, implemented RAG for context-aware LLM retrieval, and orchestrated multi-step reasoning using LangChain Agents with tool calling across sequential tasks.",
      "Fine-tuned a quantized Llama LLM on 500+ scraped LinkedIn posts for creator-style content generation; configured full local GPU inference stack (WSL2, CUDA, cuDNN, PyTorch, TensorFlow on RTX 4060 Ti) — achieving zero cloud API cost with reproducible benchmarking.",
      "Tracked all fine-tuning experiments via MLflow, enabling structured comparison across model configurations, hyperparameter sweeps, and generation quality metrics.",
      "Implemented tool calling and multi-step agent reasoning loops — the pipeline can chain document retrieval, reasoning, and output generation autonomously without human re-prompting.",
    ]
  },
  {
    title: "Geospatial Predictive Maintenance",
    subtitle: "Anomaly Detection on Commercial Fleet Telemetry",
    category: "Automotive AI",
    summary: "An ML system that predicts mechanical failures in commercial truck fleets before they happen — using real sensor data and geospatial mapping to show where failures cluster across regions.",
    impact: "F1-score: 0.82 · SMOTE class balancing · Interactive geospatial risk maps · Reduced manual fleet monitoring",
    stack: ["Python", "Scikit-learn", "SMOTE", "Pandas", "NumPy", "Folium", "Google Maps API", "Feature Engineering", "Statistical Modelling", "MLflow"],
    points: [
      "Engineered end-to-end classification pipeline on Scania truck telemetry data to predict early-stage component failures; resolved severe class imbalance using SMOTE — achieving F1-score of 0.82 on the minority fault-event class.",
      "Applied unsupervised anomaly detection, feature engineering, and statistical modelling to surface failure patterns across noisy large-scale sensor datasets with significant temporal autocorrelation.",
      "Built geospatial hotspot visualizations using Folium and Google Maps API to map high-risk operational clusters — producing interactive exposure-style layers comparable to risk-underwriting dashboards used in OEM fleet networks.",
      "Designed automated ETL and monitoring workflows to replace manual data inspection, structuring outputs for downstream API integration and cloud deployment.",
    ],
    github: true
  },
  {
    title: "Breast Cancer Detection",
    subtitle: "Medical Imaging CNN Pipeline",
    category: "Computer Vision",
    summary: "A deep learning classifier that detects cancerous tissue from medical images — trained end-to-end with a full evaluation dashboard for model benchmarking and inference testing.",
    impact: "96.5% validation accuracy · CUDA-accelerated training · Streamlit inference UI",
    stack: ["Python", "TensorFlow", "Keras", "CNN", "CUDA", "cuDNN", "Scikit-learn", "Streamlit", "Data Augmentation"],
    points: [
      "Designed and trained a CNN classifier on a labeled breast cancer imaging dataset end-to-end: data preprocessing, augmentation pipeline, architecture selection, and CUDA-accelerated training.",
      "Fine-tuned hyperparameters and applied regularization techniques (dropout, batch normalization) to achieve 96.5% validation accuracy while reducing overfitting on the test distribution.",
      "Evaluated model performance using precision, recall, F1-score, and confusion matrix — applying structured experiment logging at each architectural decision point.",
      "Deployed an interactive Streamlit interface for real-time inference testing and model benchmarking, enabling non-technical stakeholders to query the model directly.",
    ]
  },
  {
    title: "AI Color Palette Generator",
    subtitle: "Computer Vision Pipeline + Gemini Vision API",
    category: "GenAI",
    summary: "A full-stack AI web app that takes any image upload and generates a branded colour palette — from dominant colour extraction to final hex codes — in a single automated pipeline. Built and deployed in under 2 weeks.",
    impact: "End-to-end in < 2 weeks · REST API containerised with Docker · Multi-step agentic tool pipeline",
    stack: ["Python", "FastAPI", "OpenCV", "Gemini Vision API", "Docker", "REST API", "Prompt Engineering"],
    points: [
      "Built a full-stack agentic web application: Python FastAPI microservice processes image uploads, OpenCV clusters dominant colour embeddings via k-means, Gemini Vision API generates branded hex-code palettes — complete multi-step pipeline from image input to structured output.",
      "Designed structured prompt engineering for the Gemini Vision API tool call, enforcing colour harmony rules, contrast ratios, and brand-style constraints in the output schema.",
      "Containerised the full REST API integration with Docker, enabling reproducible deployment and consistent environment isolation across development and production.",
      "Implemented output validation and fallback mechanisms to maintain deterministic responses and handle Gemini API inconsistencies in structured output generation.",
    ]
  },
  {
    title: "Field Trip Fighters — Adaptive RL Boss AI",
    subtitle: "Hybrid Q-Learning + PPO · Published Research Paper",
    category: "Reinforcement Learning",
    summary: "A fighting game AI boss that learns from every match — adapting its strategy in real-time to the human player's patterns. Built as a capstone project and published as a peer-reviewed research paper.",
    impact: "95% win rate vs beginner AI · 72% vs advanced AI · 2,590 training episodes · Published at NMIMS MPSTME",
    stack: ["Python", "Godot Engine", "PPO", "Q-Learning", "N-gram Pattern Recognition", "Multithreading", "MLflow", "Reward Shaping"],
    points: [
      "Designed and implemented a hybrid reinforcement learning architecture combining Proximal Policy Optimization (PPO) for policy learning and Q-Learning for value estimation — achieving 15% higher win rates than pure PPO implementations in ablation studies.",
      "Built a multithreaded system architecture separating AI computation (AI worker thread) from game logic (main thread at 60 FPS) — eliminating frame drops during active RL training.",
      "Engineered a 12-dimensional normalized feature vector as state representation capturing spatial, tactical, positional, and resource game state — computationally tractable while preserving decision-relevant information.",
      "Implemented N-gram-based opponent modelling (sizes 2-4) with a forgetting mechanism (γ=0.95 decay) to predict and counter opponent action patterns; disabling this module caused a 22% drop in win rate against human players.",
      "Designed a multi-component reward shaping system (combat, defensive, penalty, terminal) — simplified win/loss-only reward functions resulted in 30% slower convergence and reduced gameplay quality.",
      "Trained across 2,590 episodes over 48 hours; agent demonstrated emergent adaptive strategy, combo execution (avg 3.2 hits), and blocking accuracy improvement from 40% to 78%.",
    ],
    paper: true
  },
  {
    title: "Car Rental Database System",
    subtitle: "Normalized MySQL Schema for Shared Mobility",
    category: "Database Engineering",
    summary: "A fully normalized relational database for a car rental platform — handling fleet inventory, customer accounts, real-time bookings, and operational analytics. Built to support high-traffic transactional workloads.",
    impact: "Fully normalized schema · Optimized JOIN queries · Stored procedures + triggers for data integrity",
    stack: ["MySQL", "SQL", "Database Design", "Query Optimization", "Stored Procedures", "Triggers", "Analytical Views", "Indexing"],
    points: [
      "Designed a fully normalized (3NF) MySQL database schema managing fleet inventory, customer accounts, and rental transactions — structuring vehicle lifecycle, availability states, and booking workflows into a scalable relational model.",
      "Optimized complex multi-table JOIN queries, aggregation functions, and indexing strategies to improve reporting performance and data retrieval efficiency under high-traffic transactional loads.",
      "Implemented stored procedures, triggers, and analytical views to enforce data integrity constraints, automate business logic, and generate fleet utilization insights without application-layer dependencies.",
      "Built availability tracking and operational analytics workflows — schema design directly transferable to fleet telematics databases and shared mobility platform backends.",
    ]
  },
  {
    title: "AI-Based Timetable Detection",
    subtitle: "Computer Vision + Gemini Vision API",
    category: "Computer Vision",
    summary: "An automation system that reads a photo of a timetable and converts it into structured, database-ready data — eliminating manual data entry through a computer vision + AI pipeline.",
    impact: "Unstructured image → structured schema · End-to-end automation · Reliable post-processing validation",
    stack: ["Python", "Gemini Vision API", "Computer Vision", "Image Preprocessing", "Prompt Engineering", "Data Transformation", "Validation Logic"],
    points: [
      "Built a computer vision pipeline to extract structured timetable data from image inputs using Gemini Vision API — applying image preprocessing, layout parsing, and vision-language model interaction to convert unstructured visual data into usable schedules.",
      "Designed structured prompt engineering for vision tasks, enforcing consistent output schemas across diverse timetable formats, layouts, and image quality levels.",
      "Developed validation and post-processing logic to ensure consistent schema outputs, catch extraction errors, and produce reliable automated data extraction for downstream database integration.",
      "Demonstrated multimodal AI integration — bridging computer vision preprocessing with LLM-based structured output generation in a single automated workflow.",
    ]
  },
  {
    title: "IEC NMIMS Website",
    subtitle: "Production Full-Stack Web Application",
    category: "Full-Stack",
    summary: "The official website for the Innovation and Entrepreneurship Cell at NMIMS — a production-grade web app built, deployed, and maintained by the technical team I led as VP and Head of Technical Department.",
    impact: "Live at iecnmims.com · Used by 500+ students · Production deployment with CI/CD",
    stack: ["Next.js", "React", "Node.js", "Django", "MongoDB", "Firebase", "Tailwind CSS", "REST APIs", "GitHub Actions", "Docker"],
    points: [
      "Architected and deployed a full-stack web application using Next.js and React for the frontend, with Node.js and Django for backend services — implementing frontend-backend integration, routing, and API-based content management.",
      "Built basic web applications using Django for participant registration workflows and MongoDB API handling — supporting event registrations, team management, and stakeholder communications.",
      "Managed production deployment, debugging, performance optimization, and CI/CD pipeline using GitHub Actions in a live environment with real user traffic.",
      "Led the technical team as Head of Technical Department and subsequently VP — mentoring 6+ junior developers, running code reviews, and establishing Git-based collaboration workflows.",
    ]
  },
  {
    title: "Student Portal Mobile Application",
    subtitle: "Android App with Real-Time Firebase Backend",
    category: "Mobile Development",
    summary: "A mobile app for university students featuring authentication, a notice board, task management, and faculty access — backed by real-time Firebase data synchronization.",
    impact: "Firebase real-time sync · Full auth system · Notice board + task management",
    stack: ["Android", "Java", "Firebase", "Real-Time Database", "Authentication", "UI/UX Design", "Data Validation"],
    points: [
      "Built a feature-rich Android application in Java with Firebase for authentication, real-time announcements, task management, and faculty access — designing user workflows and data models from scratch.",
      "Integrated Firebase Realtime Database for live data synchronization across devices, ensuring consistent state management and secure backend functionality.",
      "Designed responsive mobile UI and resolved performance, debugging, and data validation challenges across Android API versions.",
      "Optimized data structures for real-time read/write performance under concurrent multi-user access patterns.",
    ]
  },
  {
    title: "VR Gun Duel Game",
    subtitle: "Unity / C# with Image Processing Backend",
    category: "Game Dev",
    summary: "A real-time VR gun duel game built in Unity/C# with a backend service that processes image inputs to extract and validate structured game data — bridging computer vision with game systems.",
    impact: "Real-time C# system · Image processing backend · Runtime performance optimization",
    stack: ["Unity", "C#", "Image Processing", "API Integration", "Backend Services", "Data Parsing", "Real-Time Systems"],
    points: [
      "Built a backend service to process image inputs and extract structured game data using API integration — implementing data parsing, validation, and transformation workflows to convert unstructured inputs into database-ready formats.",
      "Engineered the C#-based real-time game system with performance optimization for VR latency constraints; debugged runtime issues at the boundary of game logic and physics simulation.",
      "Worked with compiled environments and system-level debugging concepts — managing frame-time budgets and optimizing critical-path game logic for real-time responsiveness.",
    ]
  },
  {
    title: "Loan Default Prediction",
    subtitle: "ML Risk Scoring Model — Inditrade Capital",
    category: "ML · FinTech",
    summary: "A machine learning risk model built during an internship at a financial services firm — predicting high-risk loan defaults from historical data, with outputs directly used by the collections team.",
    impact: "78% precision on high-risk accounts · 30% improvement in risk identification · Deployed to collections team",
    stack: ["Python", "Random Forests", "Scikit-learn", "SMOTE", "Pandas", "NumPy", "AUC-ROC", "Cross-Validation", "Power BI", "MLflow"],
    points: [
      "Engineered a Random Forest risk-scoring model to identify high-risk loan defaults from historical financial datasets — addressed severe class imbalance using targeted SMOTE sampling strategies, achieving 78% precision on the minority (default) class.",
      "Performed preprocessing, feature engineering, and EDA on structured financial data — evaluating models using AUC-ROC, precision-recall curves, F1-score, and cross-validation to improve predictive reliability.",
      "Generated analytical reports and risk insight dashboards for business stakeholders, enabling data-driven credit risk assessment and decision-making by the collections team.",
      "Collaborated with cross-functional teams to translate business requirements into scalable predictive analytics solutions within an enterprise data environment.",
    ]
  },
];

export const leadership = [
  {
    role: "President",
    org: "4C Marketing Cell, NMIMS MPSTME",
    date: "2025 - Present",
    description: "Lead a 100-member club delivering consulting-style marketing events where companies present real business challenges and student teams develop and present actionable solutions."
  },
  {
    role: "Vice President",
    org: "Innovation and Entrepreneurship Cell, NMIMS MPSTME",
    date: "2024 - 2025",
    description: "Led an 18-member cross-functional team to build and launch iecnmims.com, automate club workflows, and produce the Innovision podcast with partner brands."
  },
  {
    role: "Head of Digital Creatives",
    org: "Taqneeq 17.0",
    date: "2023 - 2024",
    description: "Directed digital branding and social media strategy, establishing a cohesive visual identity and managing Instagram content and brand collaborations for the university tech fest."
  },
  {
    role: "Head of Technical Department",
    org: "Innovation and Entrepreneurship Cell",
    date: "2023 - 2024",
    description: "Led Next.js development and GitHub-based collaboration, mentoring the technical team across two cohorts."
  }
];
