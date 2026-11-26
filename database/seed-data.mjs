/**
 * SEED CONTENT
 * -----------------------------------------------------------------------------
 * Realistic launch content for Learning Skills — the fictional institute this
 * platform ships with. Everything here is editable from the admin dashboard;
 * it exists so the site looks like a live business from the first page load
 * rather than an empty template.
 *
 * Images use Unsplash CDN URLs. The <SmartImage> component falls back to a
 * branded placeholder if any URL ever stops resolving, and the admin can
 * replace every one of them from the Media Library.
 */

const u = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ========================================================================== */
/*  HERO SLIDES                                                               */
/* ========================================================================== */
export const heroSlides = [
  {
    eyebrow: 'Admissions open · 2026 cohorts',
    title: 'Build the career you keep',
    highlight: 'career you keep',
    description:
      'Short, intensive programmes designed with hiring managers and taught by people who still do the work. Study online or on campus, around a full-time job.',
    image: u('1523050854058-8df90110c9f1', 2000),
    overlay_opacity: 68,
    text_align: 'left',
    primary_btn_text: 'Explore Courses',
    primary_btn_link: '/courses',
    secondary_btn_text: 'Enquire Now',
    secondary_btn_link: '/contact',
    display_order: 1,
  },
  {
    eyebrow: '34 programmes · 9 disciplines',
    title: 'Learn the skill. Prove the skill.',
    highlight: 'Prove the skill.',
    description:
      'Every Learning Skills course ends in assessed project work you can show an employer — not just a certificate with your name on it.',
    image: u('1522202176988-66273c2fd55f', 2000),
    overlay_opacity: 72,
    text_align: 'left',
    primary_btn_text: 'Browse Programmes',
    primary_btn_link: '/courses',
    secondary_btn_text: 'Talk to an Advisor',
    secondary_btn_link: '/contact',
    display_order: 2,
  },
  {
    eyebrow: 'Flexible batches',
    title: 'Evenings, weekends, or fully self-paced',
    highlight: 'fully self-paced',
    description:
      'Pick the format that fits your week. Switch between online and classroom cohorts at no extra cost if your schedule changes.',
    image: u('1524178232363-1fb2b075b655', 2000),
    overlay_opacity: 70,
    text_align: 'left',
    primary_btn_text: 'See Batch Dates',
    primary_btn_link: '/courses',
    secondary_btn_text: 'Request a Callback',
    secondary_btn_link: '/contact',
    display_order: 3,
  },
  {
    eyebrow: 'Outcomes, not promises',
    title: 'Trained by practitioners, hired by industry',
    highlight: 'hired by industry',
    description:
      '11,400 learners trained since 2014, with placement support that continues for twelve months after you graduate.',
    image: u('1517048676732-d65bc937f952', 2000),
    overlay_opacity: 74,
    text_align: 'left',
    primary_btn_text: 'Explore Courses',
    primary_btn_link: '/courses',
    secondary_btn_text: 'Our Story',
    secondary_btn_link: '/about',
    display_order: 4,
  },
];
/* ========================================================================== */
/*  COURSES                                                                   */
/* ========================================================================== */
export const courses = [
  /* ----------------------------- TECHNOLOGY ------------------------------- */
  {
    title: 'Full-Stack Web Development',
    slug: 'full-stack-web-development',
    code: 'TECH-101',
    short_description:
      'Go from first HTML tag to a deployed, database-backed application in 24 weeks — JavaScript, React, Node and SQL.',
    overview: `<p>This is our flagship technology programme and the one most learners join to change careers outright. You will build eight projects, each one adding a layer to a working production stack, and finish with a deployed full-stack application in your own repository.</p>
<p>Teaching is 70% hands-on. Every module opens with a short concept session and spends the rest of its time on code review, pair programming and debugging real failures — because reading someone else's broken code is the skill nobody teaches and every team needs.</p>
<h3>How the programme runs</h3>
<p>Two live sessions a week plus one optional lab, with recordings available for 18 months. You are assigned a mentor from week one who reviews your pull requests and sits your mock technical interviews in the final month.</p>`,
    who_should_attend:
      'Career changers with no coding background, graduates in any discipline, and self-taught developers who want structure and a reviewed portfolio.',
    eligibility:
      'No prior programming experience required. You will need a laptop with 8GB RAM or more and comfort with written English. A short aptitude conversation replaces any entrance test.',
    career_opportunities:
      'Frontend Developer, Backend Developer, Full-Stack Engineer, Web Application Developer, Junior Software Engineer, Freelance Developer',
    certification: 'Learning Skills Professional Certificate in Full-Stack Development',
    thumbnail: u('1498050108023-c5249f4df085'),
    banner_image: u('1551434678-e076c223a692', 1800),
    duration: '24 weeks',
    duration_weeks: 24,
    lessons_count: 96,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry · instalments available',
    rating: 4.9,
    reviews_count: 218,
    students_enrolled: 1840,
    is_featured: 1,
    is_popular: 1,
    display_order: 1,
    outcomes: [
      'Build responsive, accessible interfaces with semantic HTML, modern CSS and React',
      'Design and query relational databases, and model data for real application features',
      'Write and document REST APIs in Node.js with authentication and input validation',
      'Use Git and pull-request workflows the way a professional team does',
      'Deploy an application to production with environment configuration and CI checks',
      'Debug unfamiliar code and read a stack trace back to its root cause',
    ],
    highlights: [
      { icon: 'GitBranch', title: '8 reviewed projects', description: 'Every project is code-reviewed by a working engineer, not auto-graded.' },
      { icon: 'Users', title: '1:12 mentor ratio', description: 'Small cohorts so your questions get answered the same session.' },
      { icon: 'Rocket', title: 'Deployed portfolio', description: 'You finish with live URLs and a clean commit history to show.' },
      { icon: 'Briefcase', title: '12 months of placement support', description: 'CV clinics, mock interviews and employer introductions after you graduate.' },
    ],
    syllabus: [
      {
        module_title: 'Foundations: The Web Platform',
        description: 'How the browser actually works, and writing markup and styles you will not be embarrassed by later.',
        duration: '3 weeks',
        topics: 'Semantic HTML and document structure\nModern CSS: flexbox, grid, custom properties\nResponsive and mobile-first layout\nAccessibility basics and keyboard navigation\nBrowser dev tools and the render pipeline',
      },
      {
        module_title: 'JavaScript, Properly',
        description: 'The language itself, before any framework hides it from you.',
        duration: '5 weeks',
        topics: 'Types, scope, closures and the event loop\nArrays, objects and functional patterns\nAsynchronous JavaScript: promises and async/await\nFetch, JSON and working with APIs\nES modules and the npm ecosystem\nDebugging and error handling',
      },
      {
        module_title: 'React and Component Architecture',
        description: 'Building interfaces that stay maintainable past the first thousand lines.',
        duration: '5 weeks',
        topics: 'Components, props and composition\nState, effects and the rules of hooks\nForms, validation and controlled inputs\nClient-side routing and data fetching\nComponent testing\nPerformance: memoisation and lazy loading',
      },
      {
        module_title: 'Databases and Data Modelling',
        description: 'Designing a schema you will not have to migrate away from in six months.',
        duration: '3 weeks',
        topics: 'Relational design and normalisation\nSQL: joins, aggregates, subqueries\nIndexes and reading a query plan\nTransactions and data integrity\nMigrations and seed data',
      },
      {
        module_title: 'Backend Engineering with Node.js',
        description: 'Writing the server side of a real product.',
        duration: '4 weeks',
        topics: 'HTTP, routing and middleware\nREST API design and status codes\nAuthentication, sessions and password hashing\nInput validation and the OWASP top ten\nFile uploads and third-party integrations\nLogging and error monitoring',
      },
      {
        module_title: 'Shipping: Deployment and Capstone',
        description: 'Getting your work in front of real users, then presenting it.',
        duration: '4 weeks',
        topics: 'Git workflows, branching and code review\nEnvironment variables and secrets management\nCI pipelines and automated checks\nDeployment, domains and HTTPS\nCapstone build and technical presentation\nTechnical interview preparation',
      },
    ],
    faqs: [
      { question: 'I have never written a line of code. Is this course really suitable?', answer: 'Yes — roughly two-thirds of each cohort starts with no programming background at all. The first three weeks assume nothing, and the optional weekly lab exists specifically for people who want extra time on the fundamentals before the pace picks up.' },
      { question: 'How many hours a week should I plan for?', answer: 'Budget 14 to 18 hours: around 6 hours of live sessions and the rest on project work. Learners who treat it as a part-time job rather than an evening hobby finish noticeably stronger portfolios.' },
      { question: 'Can I switch between the online and classroom batch?', answer: 'Yes, at no extra cost. Tell your cohort coordinator a week ahead. Many learners attend on campus for project weeks and online for theory weeks.' },
      { question: 'Do you guarantee a job at the end?', answer: 'No, and we would be cautious of anyone who does. What we commit to is twelve months of structured placement support: CV and portfolio review, mock technical interviews, and introductions to the employers in our hiring network.' },
    ],
  },
  {
    title: 'Cloud & DevOps Engineering',
    slug: 'cloud-devops-engineering',
    code: 'TECH-204',
    short_description:
      'Containers, pipelines and infrastructure as code — the operational skills that turn a developer into an engineer teams rely on.',
    overview: `<p>Built for developers and IT staff who are already comfortable on the command line and want to own how software gets built, released and observed in production.</p>
<p>You will work in a sandboxed cloud account provided with the course, breaking and repairing real infrastructure. Every module ends with an incident simulation: something fails, and you diagnose it under time pressure with your cohort.</p>`,
    who_should_attend:
      'Developers moving toward platform work, system administrators modernising their skill set, and QA engineers automating their pipelines.',
    eligibility:
      'Working knowledge of Linux commands and at least one programming or scripting language. Six months of professional IT experience recommended.',
    career_opportunities:
      'DevOps Engineer, Cloud Engineer, Site Reliability Engineer, Platform Engineer, Build & Release Engineer',
    certification: 'Learning Skills Advanced Certificate in Cloud & DevOps Engineering',
    thumbnail: u('1486312338219-ce68d2c6f44d'),
    banner_image: u('1497486751825-1233686d8f33', 1800),
    duration: '16 weeks',
    duration_weeks: 16,
    lessons_count: 64,
    level: 'Advanced',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.8,
    reviews_count: 96,
    students_enrolled: 640,
    is_featured: 1,
    display_order: 2,
    outcomes: [
      'Containerise an application and orchestrate it across multiple environments',
      'Define cloud infrastructure declaratively and review it like application code',
      'Build CI/CD pipelines with automated testing, security scanning and rollback',
      'Instrument a service with metrics, logs and traces, and set alerts that matter',
      'Run a blameless incident review and write a postmortem people will read',
    ],
    highlights: [
      { icon: 'Cloud', title: 'Sandbox cloud account', description: 'Provisioned for you — no personal cloud bills during the course.' },
      { icon: 'ShieldAlert', title: 'Live incident drills', description: 'Diagnose real failures against the clock, every module.' },
      { icon: 'Workflow', title: 'Pipeline portfolio', description: 'Leave with reusable pipeline and Terraform templates of your own.' },
    ],
    syllabus: [
      { module_title: 'Linux, Networking and the Shell', description: 'The ground every cloud abstraction sits on.', duration: '2 weeks', topics: 'Processes, permissions and systemd\nNetworking: DNS, TCP/IP, TLS\nShell scripting for automation\nSSH and key management' },
      { module_title: 'Containers and Orchestration', description: 'Packaging software so it runs the same everywhere.', duration: '4 weeks', topics: 'Docker images, layers and multi-stage builds\nRegistries and image security\nKubernetes objects and scheduling\nConfigMaps, secrets and persistent volumes\nHelm and environment promotion' },
      { module_title: 'Infrastructure as Code', description: 'Treating servers like a reviewable artefact.', duration: '3 weeks', topics: 'Terraform syntax, state and modules\nProvisioning compute, network and storage\nDrift detection and remote state\nPolicy as code and cost guardrails' },
      { module_title: 'CI/CD Pipelines', description: 'From commit to production without a manual step.', duration: '3 weeks', topics: 'Pipeline design and build caching\nAutomated testing gates\nArtefact versioning and promotion\nBlue-green and canary releases\nSecrets in pipelines' },
      { module_title: 'Observability and Reliability', description: 'Knowing something is wrong before your users tell you.', duration: '2 weeks', topics: 'Metrics, dashboards and SLOs\nStructured logging and aggregation\nDistributed tracing\nAlert design and on-call rotations' },
      { module_title: 'Security, Cost and Capstone', description: 'Running a platform responsibly.', duration: '2 weeks', topics: 'IAM and least privilege\nVulnerability scanning in the pipeline\nCost attribution and right-sizing\nCapstone: full platform build and incident review' },
    ],
    faqs: [
      { question: 'Which cloud provider do you teach?', answer: 'Core teaching is provider-neutral with hands-on labs on AWS, because its vocabulary is the most transferable. The final two modules include a mapping exercise to the Azure and Google Cloud equivalents.' },
      { question: 'Will this prepare me for a certification exam?', answer: 'It covers the large majority of the AWS Solutions Architect Associate and CKA syllabi, but it is not an exam-cram course. Learners wanting the certificates typically sit them two to four weeks after finishing.' },
      { question: 'Is there a hardware requirement?', answer: 'A laptop with 16GB RAM is strongly recommended for the local Kubernetes modules. All cloud work happens in the sandbox account we provide.' },
    ],
  },
  {
    title: 'Software Testing & QA Automation',
    slug: 'software-testing-qa-automation',
    code: 'TECH-152',
    short_description:
      'Manual testing discipline plus automation frameworks — become the person who stops defects reaching production.',
    overview: `<p>Quality assurance is one of the most accessible routes into a software team, and one of the most undervalued. This programme covers the testing mindset first, then the automation tooling that makes it scale.</p>
<p>You will test a deliberately buggy application built for this course, write a defect report an engineer can act on without asking questions, and build an automation suite that runs in a CI pipeline.</p>`,
    who_should_attend:
      'Graduates looking for an entry point into tech, manual testers moving into automation, and support engineers wanting a technical step up.',
    eligibility: 'Graduation in any stream. Basic computer literacy. No programming experience needed to start.',
    career_opportunities: 'QA Engineer, Test Automation Engineer, SDET, QA Analyst, Quality Lead',
    certification: 'Learning Skills Certificate in Software Testing & Automation',
    thumbnail: u('1460925895917-afdab827c52f'),
    duration: '14 weeks',
    duration_weeks: 14,
    lessons_count: 52,
    level: 'Beginner',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 134,
    students_enrolled: 910,
    is_popular: 1,
    display_order: 3,
    outcomes: [
      'Write test cases and defect reports that developers can act on immediately',
      'Apply black-box, boundary and equivalence techniques systematically',
      'Automate browser and API tests and run them in a CI pipeline',
      'Test for accessibility, performance and security regressions',
      'Own a release sign-off decision and justify it with evidence',
    ],
    highlights: [
      { icon: 'Bug', title: 'A real buggy app', description: 'Practise on an application seeded with 120 genuine defects.' },
      { icon: 'TestTube2', title: 'Automation from week 4', description: 'Scripting starts early, so the tooling never feels out of reach.' },
      { icon: 'ClipboardCheck', title: 'ISTQB-aligned', description: 'Terminology maps to the Foundation syllabus if you choose to sit it.' },
    ],
    syllabus: [
      { module_title: 'The Testing Mindset', description: 'Thinking adversarially about software.', duration: '3 weeks', topics: 'SDLC and where testing fits\nTest levels and types\nWriting test cases and traceability\nDefect lifecycle and severity vs priority\nExploratory testing charters' },
      { module_title: 'Test Design Techniques', description: 'Covering more with fewer tests.', duration: '3 weeks', topics: 'Equivalence partitioning and boundary values\nDecision tables and state transitions\nRisk-based prioritisation\nTest data design' },
      { module_title: 'Automation Foundations', description: 'Enough programming to automate confidently.', duration: '3 weeks', topics: 'JavaScript essentials for testers\nLocators and the DOM\nPage object pattern\nAssertions and waits' },
      { module_title: 'UI and API Automation', description: 'Building a suite that earns its maintenance cost.', duration: '3 weeks', topics: 'Playwright end-to-end tests\nAPI testing and contract checks\nTest data setup and teardown\nParallel runs and flake reduction\nReporting' },
      { module_title: 'Non-Functional and CI', description: 'Quality beyond "does it work".', duration: '2 weeks', topics: 'Performance testing basics\nAccessibility audits\nSecurity smoke tests\nRunning suites in CI\nRelease sign-off and capstone' },
    ],
    faqs: [
      { question: 'Is QA a good first job in tech?', answer: 'It is one of the most reliable entry points, and it teaches you how the whole system fits together faster than most development roles. A sizeable share of our QA graduates move into development or SDET roles within two to three years.' },
      { question: 'Do I need to learn to code?', answer: 'You need enough to automate, and the course teaches exactly that from scratch in module three. You do not need to be a developer.' },
    ],
  },

  /* -------------------------------- DATA ---------------------------------- */
  {
    title: 'Data Analytics with Python & SQL',
    slug: 'data-analytics-python-sql',
    code: 'DATA-110',
    short_description:
      'Clean messy data, query it confidently and present findings that change a decision — the complete analyst toolkit.',
    overview: `<p>Most analytics courses teach tools. This one teaches the job: receiving an ambiguous question from a stakeholder, finding out what they actually need, getting the data into a usable state, and presenting an answer that survives being challenged.</p>
<p>You will work with six real anonymised datasets — retail transactions, hospital admissions, campaign performance, logistics timings, HR attrition and public census data — each with its own flavour of mess.</p>`,
    who_should_attend:
      'Professionals in any function who work with spreadsheets and want to go further, graduates targeting analyst roles, and managers who want to interrogate the numbers they are given.',
    eligibility:
      'Comfort with basic spreadsheet formulas. No programming or statistics background required.',
    career_opportunities:
      'Data Analyst, Business Analyst, Reporting Analyst, Insights Analyst, Analytics Consultant, BI Developer',
    certification: 'Learning Skills Professional Certificate in Data Analytics',
    thumbnail: u('1551288049-bebda4e38f71'),
    banner_image: u('1460925895917-afdab827c52f', 1800),
    duration: '18 weeks',
    duration_weeks: 18,
    lessons_count: 72,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry · instalments available',
    rating: 4.9,
    reviews_count: 187,
    students_enrolled: 1420,
    is_featured: 1,
    is_popular: 1,
    display_order: 4,
    outcomes: [
      'Write SQL that answers layered business questions across joined tables',
      'Clean, reshape and validate real datasets in Python with pandas',
      'Choose and justify the right statistical test for a question',
      'Build dashboards people actually use, and know when a dashboard is the wrong answer',
      'Present a finding to a non-technical audience and defend the method',
    ],
    highlights: [
      { icon: 'Database', title: '6 real datasets', description: 'Anonymised industry data, complete with the mess.' },
      { icon: 'LineChart', title: 'Stakeholder simulations', description: 'Present to a trainer playing a sceptical business sponsor.' },
      { icon: 'FileSpreadsheet', title: 'Tool-agnostic', description: 'Python, SQL, Excel and Power BI — chosen per problem, not by habit.' },
    ],
    syllabus: [
      { module_title: 'Analytical Thinking and Spreadsheets', description: 'Framing a question before touching a tool.', duration: '3 weeks', topics: 'Turning a vague request into a measurable question\nAdvanced Excel: lookups, pivots, Power Query\nData quality assessment\nDescriptive statistics' },
      { module_title: 'SQL for Analysts', description: 'The single most valuable analyst skill.', duration: '4 weeks', topics: 'SELECT, filtering and sorting\nJoins across multiple tables\nAggregation and GROUP BY\nWindow functions and running totals\nCTEs and subqueries\nQuery performance basics' },
      { module_title: 'Python and pandas', description: 'Doing in ten lines what takes an hour by hand.', duration: '4 weeks', topics: 'Python syntax for data work\npandas DataFrames: select, filter, group\nMerging, reshaping and pivoting\nMissing data and outlier handling\nAutomating a recurring report' },
      { module_title: 'Statistics That Matter', description: 'Enough rigour to avoid confident wrong answers.', duration: '3 weeks', topics: 'Distributions and sampling\nConfidence intervals\nHypothesis testing and p-values in context\nCorrelation versus causation\nA/B test analysis' },
      { module_title: 'Visualisation and Dashboards', description: 'Designing charts that inform rather than decorate.', duration: '2 weeks', topics: 'Chart selection and perceptual accuracy\nColour, annotation and accessibility\nPower BI data models and DAX basics\nDashboard design and review cadence' },
      { module_title: 'Capstone: End-to-End Analysis', description: 'The whole job, start to finish.', duration: '2 weeks', topics: 'Scoping with a stakeholder\nData pipeline and documentation\nAnalysis and peer review\nWritten report and live presentation' },
    ],
    faqs: [
      { question: 'Do I need to be good at maths?', answer: 'You need to be comfortable with percentages and averages. The statistics module builds from there and focuses on interpretation rather than derivation — we care that you know which test to use and what the result does and does not mean.' },
      { question: 'Python or Power BI — which matters more for jobs?', answer: 'SQL matters most, which is why it gets four weeks. Beyond that it depends on the role: Power BI dominates in reporting-heavy organisations, Python in product and tech companies. You will be employable in either direction.' },
      { question: 'Can I use my employer\'s data for the capstone?', answer: 'Many learners do, and it tends to produce the strongest projects. We will sign an NDA if your organisation requires one, and a synthetic dataset is always available as an alternative.' },
    ],
  },
  {
    title: 'Machine Learning & AI Foundations',
    slug: 'machine-learning-ai-foundations',
    code: 'DATA-250',
    short_description:
      'Build, evaluate and deploy models responsibly — including knowing when machine learning is the wrong tool.',
    overview: `<p>An applied programme for people who can already handle data and want to move into modelling. The emphasis is on evaluation and deployment, the two places where real ML projects fail most often.</p>
<p>A full module is dedicated to responsible AI: bias auditing, explainability and the practical limits of what a model should decide. You will also work with modern language-model APIs and learn where they genuinely outperform a classical approach.</p>`,
    who_should_attend:
      'Working data analysts, developers moving into ML, and engineers who need to evaluate model-based proposals critically.',
    eligibility:
      'Working Python knowledge, familiarity with pandas, and comfort with basic statistics. Our Data Analytics certificate or equivalent experience.',
    career_opportunities:
      'Machine Learning Engineer, Data Scientist, AI Engineer, Applied Scientist, ML Platform Engineer',
    certification: 'Learning Skills Advanced Certificate in Machine Learning',
    thumbnail: u('1555949963-ff9fe0c870eb'),
    duration: '20 weeks',
    duration_weeks: 20,
    lessons_count: 80,
    level: 'Advanced',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.8,
    reviews_count: 72,
    students_enrolled: 430,
    is_featured: 1,
    display_order: 5,
    outcomes: [
      'Frame a business problem as a supervised or unsupervised learning task — or correctly reject it as neither',
      'Engineer features and build reproducible training pipelines',
      'Evaluate models with metrics appropriate to the cost of each error type',
      'Audit a model for bias and explain its decisions to a non-technical reviewer',
      'Serve a model behind an API and monitor it for drift in production',
    ],
    highlights: [
      { icon: 'Brain', title: 'Evaluation-first', description: 'More time on validation than on fitting — as in real projects.' },
      { icon: 'Scale', title: 'Responsible AI module', description: 'Bias auditing and explainability as core content, not an appendix.' },
      { icon: 'Server', title: 'Deployed capstone', description: 'Your final model is served behind a live monitored API.' },
    ],
    syllabus: [
      { module_title: 'Problem Framing and Data Readiness', description: 'Deciding whether to model at all.', duration: '3 weeks', topics: 'Supervised, unsupervised and reinforcement settings\nWhen a rule beats a model\nLeakage and train/test discipline\nBaselines you must beat' },
      { module_title: 'Supervised Learning', description: 'The workhorse algorithms and their failure modes.', duration: '5 weeks', topics: 'Linear and logistic regression\nDecision trees and random forests\nGradient boosting\nRegularisation and the bias-variance trade-off\nHyperparameter search' },
      { module_title: 'Evaluation and Validation', description: 'Where most ML projects quietly go wrong.', duration: '3 weeks', topics: 'Cross-validation strategies\nPrecision, recall, ROC and PR curves\nCalibration and threshold selection\nCost-sensitive evaluation\nError analysis' },
      { module_title: 'Unsupervised and Deep Learning', description: 'Structure without labels, and when networks earn their cost.', duration: '4 weeks', topics: 'Clustering and dimensionality reduction\nNeural network fundamentals\nCNNs for images, transformers for sequences\nTransfer learning\nWorking with language model APIs' },
      { module_title: 'Responsible AI', description: 'The module we refuse to make optional.', duration: '2 weeks', topics: 'Sources of bias in data and labels\nFairness metrics and their trade-offs\nSHAP and model explainability\nPrivacy and data minimisation\nDocumentation and model cards' },
      { module_title: 'MLOps and Capstone', description: 'A model nobody can deploy is a hobby.', duration: '3 weeks', topics: 'Experiment tracking and reproducibility\nModel packaging and serving\nDrift detection and retraining triggers\nCapstone build, deployment and review' },
    ],
    faqs: [
      { question: 'How much maths is involved?', answer: 'You will meet the linear algebra and calculus behind each method conceptually, with the intuition and the failure modes emphasised over the derivations. If you can follow what a gradient is doing, you will be fine.' },
      { question: 'Does this cover generative AI and LLMs?', answer: 'Yes — a substantial part of module four covers working with language-model APIs, prompt design, retrieval augmentation and, importantly, how to evaluate their output. It is treated as one tool among many rather than the whole field.' },
    ],
  },
  {
    title: 'Power BI & Business Intelligence',
    slug: 'power-bi-business-intelligence',
    code: 'DATA-130',
    short_description:
      'Build a data model once, then answer questions for years — Power BI from first import to governed enterprise reporting.',
    overview: `<p>A focused, practical programme for people who need to produce reporting that an organisation can depend on. The centrepiece is data modelling: get the model right and the visuals almost build themselves.</p>
<p>You will rebuild a sprawling 40-tab spreadsheet into a governed dashboard, which is exactly the task most learners face when they return to work.</p>`,
    who_should_attend:
      'MIS and reporting executives, finance and operations analysts, and anyone who maintains a spreadsheet that has outgrown itself.',
    eligibility: 'Intermediate Excel. No programming background required.',
    career_opportunities: 'BI Developer, Power BI Analyst, MIS Analyst, Reporting Manager, Data Visualisation Specialist',
    certification: 'Learning Skills Certificate in Business Intelligence',
    thumbnail: u('1543286386-713bdd548da4'),
    duration: '10 weeks',
    duration_weeks: 10,
    lessons_count: 40,
    level: 'Intermediate',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 118,
    students_enrolled: 780,
    is_popular: 1,
    display_order: 6,
    outcomes: [
      'Model data in a star schema that supports questions you have not been asked yet',
      'Write DAX measures that stay correct as filters change',
      'Design reports for clarity and accessibility rather than decoration',
      'Automate refresh, manage row-level security and publish responsibly',
    ],
    highlights: [
      { icon: 'Boxes', title: 'Modelling-first', description: 'Three weeks on the data model before any visual work.' },
      { icon: 'RefreshCw', title: 'Automated refresh', description: 'Leave with scheduled, monitored pipelines, not manual exports.' },
      { icon: 'Lock', title: 'Governance included', description: 'Row-level security, workspaces and version control.' },
    ],
    syllabus: [
      { module_title: 'Getting Data In', description: 'Connecting and shaping before modelling.', duration: '2 weeks', topics: 'Connectors and gateways\nPower Query transformations\nIncremental refresh\nHandling dirty source systems' },
      { module_title: 'Data Modelling', description: 'The part that determines everything downstream.', duration: '3 weeks', topics: 'Star schema and granularity\nRelationships and cardinality\nDate tables and time intelligence\nModel documentation' },
      { module_title: 'DAX', description: 'Measures that behave under every filter.', duration: '3 weeks', topics: 'Calculated columns versus measures\nFilter and row context\nCALCULATE and context transition\nTime intelligence patterns\nPerformance tuning' },
      { module_title: 'Report Design and Deployment', description: 'Publishing something the business trusts.', duration: '2 weeks', topics: 'Layout, hierarchy and accessible colour\nBookmarks and drill-through\nRow-level security\nWorkspaces, apps and deployment pipelines\nCapstone dashboard' },
    ],
    faqs: [
      { question: 'Do I need my own Power BI licence?', answer: 'Power BI Desktop is free and sufficient for everything taught except the final publishing module, where we provide a shared workspace for the duration of the course.' },
      { question: 'Will this help with Tableau or Looker?', answer: 'The modelling and visual design principles transfer directly; the specific DAX syntax does not. Learners who later move to Tableau report the modelling module was the part that mattered.' },
    ],
  },

  /* ---------------------------- DIGITAL MARKETING ------------------------- */
  {
    title: 'Digital Marketing Professional',
    slug: 'digital-marketing-professional',
    code: 'MKTG-100',
    short_description:
      'SEO, paid media, content and analytics in one programme — run campaigns on live budgets, not hypotheticals.',
    overview: `<p>Our most popular marketing programme, and the one built most directly around real spend. Each cohort is given a genuine advertising budget to deploy for a partner non-profit, with results reviewed weekly against targets.</p>
<p>The analytics module is deliberately heavy. The difference between a marketer who gets promoted and one who does not is usually the ability to attribute outcomes credibly.</p>`,
    who_should_attend:
      'Marketing executives wanting the full stack, business owners running their own campaigns, and career changers entering marketing.',
    eligibility: 'Graduation in any stream, or two years of work experience. No technical background required.',
    career_opportunities:
      'Digital Marketing Executive, SEO Specialist, Performance Marketing Manager, Social Media Manager, Growth Marketer, Marketing Consultant',
    certification: 'Learning Skills Professional Certificate in Digital Marketing',
    thumbnail: u('1533750349088-cd871a92f312'),
    banner_image: u('1542744173-8e7e53415bb0', 1800),
    duration: '16 weeks',
    duration_weeks: 16,
    lessons_count: 64,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry · instalments available',
    rating: 4.8,
    reviews_count: 243,
    students_enrolled: 2100,
    is_featured: 1,
    is_popular: 1,
    display_order: 7,
    outcomes: [
      'Build a channel strategy from an audience and a budget, not from a template',
      'Run technical and content SEO audits and prioritise fixes by likely impact',
      'Plan, launch and optimise paid campaigns across search and social',
      'Set up analytics and attribution you can defend in a budget meeting',
      'Write copy and briefs that convert without overpromising',
    ],
    highlights: [
      { icon: 'Wallet', title: 'Real ad budget', description: 'Deploy live spend for a partner non-profit, reviewed weekly.' },
      { icon: 'Search', title: 'Full SEO audit', description: 'Audit a real site and present the prioritised fix list.' },
      { icon: 'Target', title: 'Portfolio of campaigns', description: 'Finish with documented campaigns and their actual numbers.' },
    ],
    syllabus: [
      { module_title: 'Strategy and Audience', description: 'Deciding where to compete before spending anything.', duration: '2 weeks', topics: 'Market and competitor research\nAudience segmentation and personas\nPositioning and messaging\nChannel selection and budget allocation\nSetting measurable objectives' },
      { module_title: 'Search Engine Optimisation', description: 'Earning traffic that compounds.', duration: '4 weeks', topics: 'How crawling, indexing and ranking work\nKeyword research and search intent\nOn-page and technical SEO\nSite speed and Core Web Vitals\nLink acquisition ethics and tactics\nLocal SEO and Google Business Profile' },
      { module_title: 'Paid Media', description: 'Buying attention without wasting money.', duration: '4 weeks', topics: 'Google Ads: search, display, shopping\nMeta and LinkedIn advertising\nBidding strategies and budget pacing\nAudience targeting and exclusions\nCreative testing and ad fatigue\nLanding page conversion optimisation' },
      { module_title: 'Content and Social', description: 'Being worth following.', duration: '3 weeks', topics: 'Content strategy and editorial calendars\nCopywriting for each channel\nEmail marketing and lifecycle flows\nOrganic social and community management\nInfluencer and partnership marketing' },
      { module_title: 'Analytics and Attribution', description: 'Proving what worked.', duration: '3 weeks', topics: 'GA4 setup, events and conversions\nTag management\nAttribution models and their limits\nDashboard reporting for stakeholders\nCapstone: full campaign plan and results review' },
    ],
    faqs: [
      { question: 'Do I need to spend my own money on ads?', answer: 'No. The cohort budget is provided by the academy and our partner organisation. If you want to run a parallel campaign for your own business you are welcome to, and trainers will review it, but it is entirely optional.' },
      { question: 'Is this course relevant outside India?', answer: 'The platforms, principles and analytics are global. The local SEO and compliance sessions use Indian examples, with notes on UK, EU and US differences — several learners each cohort are based overseas.' },
      { question: 'How current is the content, given how fast platforms change?', answer: 'The paid media and analytics modules are revised every quarter, and trainers are practising marketers managing live accounts. Recorded sessions are re-shot rather than patched when a platform changes materially.' },
    ],
  },
  {
    title: 'SEO & Content Strategy Specialist',
    slug: 'seo-content-strategy-specialist',
    code: 'MKTG-210',
    short_description:
      'Deep specialisation in organic growth: technical audits, content architecture and the authority signals that actually move rankings.',
    overview: `<p>For marketers who want to go deep on organic rather than broad across channels. You will audit three real websites of increasing complexity and produce the kind of report agencies charge substantial fees for.</p>
<p>The programme treats content and technical SEO as one discipline, because separating them is why so many SEO projects stall.</p>`,
    who_should_attend:
      'Marketing executives specialising in organic, content writers moving into strategy, and agency staff wanting senior-level audit skills.',
    eligibility: 'Six months of marketing or content experience, or our Digital Marketing Professional certificate.',
    career_opportunities: 'SEO Specialist, Content Strategist, Organic Growth Manager, SEO Consultant, Technical SEO Analyst',
    certification: 'Learning Skills Specialist Certificate in SEO & Content Strategy',
    thumbnail: u('1562577309-4932fdd64cd1'),
    duration: '12 weeks',
    duration_weeks: 12,
    lessons_count: 44,
    level: 'Intermediate',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 81,
    students_enrolled: 520,
    display_order: 8,
    outcomes: [
      'Run a full technical audit and translate findings into a prioritised roadmap',
      'Design a content architecture around topics and intent rather than keywords alone',
      'Diagnose a traffic drop methodically instead of guessing',
      'Build a defensible business case for organic investment',
    ],
    highlights: [
      { icon: 'FileSearch', title: '3 live site audits', description: 'Real websites, increasing in complexity and stakes.' },
      { icon: 'Network', title: 'Topic cluster design', description: 'Architect content systems, not isolated blog posts.' },
      { icon: 'TrendingUp', title: 'Recovery playbook', description: 'A repeatable method for diagnosing ranking losses.' },
    ],
    syllabus: [
      { module_title: 'How Search Works Now', description: 'Beyond the ten blue links.', duration: '2 weeks', topics: 'Crawling, rendering and indexing\nRanking systems and quality signals\nSERP features and zero-click results\nAI summaries and their effect on traffic' },
      { module_title: 'Technical SEO', description: 'Removing the obstacles first.', duration: '4 weeks', topics: 'Crawl budget and log file analysis\nJavaScript rendering and hydration issues\nSite architecture and internal linking\nStructured data and schema\nCore Web Vitals\nInternational and multilingual setup' },
      { module_title: 'Content Strategy', description: 'Earning the right to rank.', duration: '3 weeks', topics: 'Intent mapping and topic clusters\nContent briefs and editorial standards\nRefreshing and consolidating existing content\nE-E-A-T and author authority' },
      { module_title: 'Authority, Measurement and Capstone', description: 'Proving and sustaining the gains.', duration: '3 weeks', topics: 'Link acquisition and digital PR\nForecasting organic growth\nDiagnosing traffic drops\nReporting to executives\nCapstone audit and presentation' },
    ],
    faqs: [
      { question: 'How is this different from the Digital Marketing Professional course?', answer: 'That programme spends four weeks on SEO alongside four other channels. This one spends twelve weeks on organic alone, going into log file analysis, rendering issues and content architecture that the broader course only introduces.' },
      { question: 'Are paid tools required?', answer: 'Trial or academy-provided access is arranged for the crawling and keyword tools used in class. The audit methodology is tool-agnostic by design.' },
    ],
  },

  /* ------------------------------- BUSINESS ------------------------------- */
  {
    title: 'Project Management Essentials',
    slug: 'project-management-essentials',
    code: 'BUS-120',
    short_description:
      'Plan, run and rescue projects — predictive and agile methods, plus the stakeholder skills that decide outcomes.',
    overview: `<p>Built for people who find themselves running projects without ever having been trained to. You will manage a simulated project across the whole course, complete with a scope change in week six and a resource loss in week nine.</p>
<p>Both predictive and agile approaches are covered, and more importantly, how to choose between them.</p>`,
    who_should_attend:
      'Team leads and coordinators taking on delivery responsibility, technical specialists moving into management, and PMO staff wanting formal grounding.',
    eligibility: 'Graduation in any stream, or two years of work experience in any function.',
    career_opportunities:
      'Project Coordinator, Project Manager, Scrum Master, Delivery Manager, Programme Analyst, PMO Executive',
    certification: 'Learning Skills Certificate in Project Management',
    thumbnail: u('1552664730-d307ca884978'),
    banner_image: u('1517048676732-d65bc937f952', 1800),
    duration: '12 weeks',
    duration_weeks: 12,
    lessons_count: 48,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry',
    rating: 4.8,
    reviews_count: 165,
    students_enrolled: 1180,
    is_featured: 1,
    is_popular: 1,
    display_order: 9,
    outcomes: [
      'Produce a scope, schedule and budget that survive contact with reality',
      'Choose between predictive, agile and hybrid delivery for a given project',
      'Run a risk register that prevents problems rather than recording them',
      'Manage stakeholders and escalate without damaging relationships',
      'Recover a project that is already behind',
    ],
    highlights: [
      { icon: 'Kanban', title: 'Full project simulation', description: 'One project across twelve weeks, including a mid-course crisis.' },
      { icon: 'Handshake', title: 'Stakeholder role-play', description: 'Practise difficult conversations before you have to have them.' },
      { icon: 'BookMarked', title: 'PMP/CAPM aligned', description: 'Terminology maps to PMI frameworks if you plan to certify.' },
    ],
    syllabus: [
      { module_title: 'Projects, Scope and Initiation', description: 'Starting in a way you will not regret.', duration: '3 weeks', topics: 'Project lifecycles and governance\nBusiness case and success criteria\nStakeholder mapping\nScope definition and work breakdown\nCharter and kick-off' },
      { module_title: 'Planning: Schedule, Cost, Quality', description: 'Making a plan that is useful rather than decorative.', duration: '3 weeks', topics: 'Estimation techniques and their biases\nDependencies and critical path\nResource levelling\nBudgeting and contingency\nQuality planning' },
      { module_title: 'Agile Delivery', description: 'Working iteratively on purpose.', duration: '3 weeks', topics: 'Scrum roles, events and artefacts\nBacklogs, refinement and story points\nKanban and flow metrics\nChoosing predictive, agile or hybrid\nScaling and its honest limits' },
      { module_title: 'Risk, People and Closure', description: 'The parts that actually determine delivery.', duration: '3 weeks', topics: 'Risk identification and response planning\nIssue management and escalation\nLeading without formal authority\nDifficult conversations and negotiation\nRecovering a troubled project\nClosure, handover and lessons learned' },
    ],
    faqs: [
      { question: 'Will this qualify me for the PMP exam?', answer: 'The content is aligned to the PMI framework and covers much of the syllabus, but PMP itself requires documented project experience and a separate exam. This certificate is a strong preparation step and a credential in its own right.' },
      { question: 'I already run projects informally. Will this be too basic?', answer: 'Experienced-but-untrained delivery people are our most common profile. They usually tell us the value was in risk management, estimation discipline and stakeholder negotiation rather than the fundamentals.' },
    ],
  },
  {
    title: 'Human Resource Management & Payroll',
    slug: 'hr-management-payroll',
    code: 'BUS-140',
    short_description:
      'The complete HR function — hiring, employee relations, compliance and payroll — taught through live case files.',
    overview: `<p>A practical programme covering the HR generalist role end to end, with real emphasis on the two areas where mistakes are expensive: statutory compliance and employee relations.</p>
<p>You will work through a term's worth of case files: a contested termination, a pay equity review, a hiring process redesign and a payroll error with tax consequences.</p>`,
    who_should_attend:
      'HR executives and coordinators, small business owners handling their own HR, and administrators moving into people roles.',
    eligibility: 'Graduation in any stream. HR experience helpful but not required.',
    career_opportunities:
      'HR Executive, HR Generalist, Recruitment Specialist, Payroll Administrator, HR Business Partner',
    certification: 'Learning Skills Certificate in Human Resource Management',
    thumbnail: u('1573496359142-b8d87734a5a2'),
    duration: '14 weeks',
    duration_weeks: 14,
    lessons_count: 52,
    level: 'Beginner',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.6,
    reviews_count: 94,
    students_enrolled: 670,
    display_order: 10,
    outcomes: [
      'Run a structured, defensible hiring process from role definition to offer',
      'Handle grievances and disciplinary matters correctly and humanely',
      'Process payroll accurately including statutory deductions and filings',
      'Design onboarding and performance processes people do not dread',
    ],
    highlights: [
      { icon: 'FolderOpen', title: '4 live case files', description: 'Real situations with real consequences to work through.' },
      { icon: 'Calculator', title: 'Hands-on payroll', description: 'Run full payroll cycles including statutory compliance.' },
      { icon: 'MessagesSquare', title: 'ER conversation practice', description: 'Rehearse grievance and exit conversations with feedback.' },
    ],
    syllabus: [
      { module_title: 'The HR Function', description: 'What HR is for, and where it earns its seat.', duration: '2 weeks', topics: 'HR operating models\nEmployment law foundations\nPolicy and handbook design\nHR records and data protection' },
      { module_title: 'Talent Acquisition', description: 'Hiring well and fairly.', duration: '3 weeks', topics: 'Role design and job architecture\nSourcing and employer brand\nStructured interviewing and scorecards\nBias reduction in selection\nOffers, negotiation and onboarding' },
      { module_title: 'Employee Relations', description: 'The hardest part of the job.', duration: '3 weeks', topics: 'Grievance and disciplinary procedure\nInvestigations and documentation\nPerformance management\nAbsence and wellbeing\nExits, redundancy and settlements' },
      { module_title: 'Compensation and Payroll', description: 'Getting people paid correctly, every time.', duration: '4 weeks', topics: 'Salary structures and benchmarking\nPayroll cycle end to end\nStatutory deductions, PF, ESI and TDS\nPay equity review\nPayroll software and reconciliation' },
      { module_title: 'Culture, Analytics and Capstone', description: 'Measuring and improving the employee experience.', duration: '2 weeks', topics: 'Engagement surveys that change something\nHR metrics and attrition analysis\nLearning and development planning\nCapstone case presentation' },
    ],
    faqs: [
      { question: 'Does the payroll module cover Indian statutory requirements?', answer: 'Yes — PF, ESI, professional tax, gratuity and TDS on salary are covered in detail, with current rates and filing timelines. Learners based elsewhere are given a parallel exercise using their own jurisdiction.' },
      { question: 'Is payroll software included?', answer: 'You will work in a training instance of a commercial payroll system for the full cycle, plus a spreadsheet-based model so you understand what the software is doing rather than just where to click.' },
    ],
  },
  {
    title: 'Advanced Excel for Business',
    slug: 'advanced-excel-for-business',
    code: 'BUS-105',
    short_description:
      'Automate the reporting that eats your week — formulas, Power Query, pivots, dashboards and defensible models.',
    overview: `<p>The most immediately useful course we run, measured by how quickly learners report time savings. Most finish week three already saving several hours a week.</p>
<p>You bring your own real workbook. By the end of the course it is restructured, automated and documented.</p>`,
    who_should_attend:
      'Anyone whose job involves recurring spreadsheet reporting — finance, operations, sales, HR, admin.',
    eligibility: 'Basic Excel familiarity: you can enter formulas and format cells.',
    career_opportunities:
      'MIS Executive, Operations Analyst, Finance Executive, Business Analyst, Reporting Specialist',
    certification: 'Learning Skills Certificate in Advanced Excel',
    thumbnail: u('1586281380349-632531db7ed4'),
    duration: '6 weeks',
    duration_weeks: 6,
    lessons_count: 24,
    level: 'Beginner',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.9,
    reviews_count: 312,
    students_enrolled: 2680,
    is_popular: 1,
    display_order: 11,
    outcomes: [
      'Replace manual monthly reporting with a refreshable Power Query pipeline',
      'Write formulas that are readable and auditable six months later',
      'Build interactive dashboards without add-ins or macros',
      'Structure a financial model a reviewer can follow and trust',
    ],
    highlights: [
      { icon: 'Timer', title: 'Immediate payback', description: 'Most learners save hours a week before the course ends.' },
      { icon: 'FileUp', title: 'Bring your own workbook', description: 'Rebuild your actual report, not a toy example.' },
      { icon: 'Zap', title: 'No macros needed', description: 'Power Query and modern formulas replace most VBA.' },
    ],
    syllabus: [
      { module_title: 'Formula Fluency', description: 'The functions that do most of the work.', duration: '2 weeks', topics: 'Absolute and relative references\nXLOOKUP, INDEX/MATCH and dynamic arrays\nSUMIFS, COUNTIFS and conditional logic\nText and date handling\nError handling and formula auditing' },
      { module_title: 'Clean Data and Power Query', description: 'Stop re-cleaning the same file every month.', duration: '2 weeks', topics: 'Table structure and data discipline\nImporting and appending sources\nTransformations and unpivoting\nRefreshable queries and parameters\nData validation' },
      { module_title: 'Analysis and Dashboards', description: 'Turning a table into an answer.', duration: '1 week', topics: 'PivotTables and PivotCharts\nSlicers and timelines\nConditional formatting\nDashboard layout and print setup' },
      { module_title: 'Modelling and Automation', description: 'Building something others can use.', duration: '1 week', topics: 'Scenario and sensitivity analysis\nGoal Seek and Solver\nModel structure and documentation\nWorkbook protection and sharing\nCapstone workbook rebuild' },
    ],
    faqs: [
      { question: 'Which version of Excel do I need?', answer: 'Microsoft 365 or Excel 2021 is recommended because dynamic arrays and XLOOKUP are taught. Alternative approaches for Excel 2016 and 2019 are provided for every such lesson.' },
      { question: 'Is VBA covered?', answer: 'Only briefly, and deliberately. Power Query and modern formulas now handle most of what people used to write macros for, with far less maintenance. We point you to VBA where it is genuinely still the right tool.' },
    ],
  },

  /* -------------------------------- DESIGN -------------------------------- */
  {
    title: 'UI/UX Design Professional',
    slug: 'ui-ux-design-professional',
    code: 'DSGN-130',
    short_description:
      'Research, interaction design and interface craft — finish with three case studies that stand up to a design review.',
    overview: `<p>A portfolio-first programme. Hiring managers look at case studies, not certificates, so three quarters of your time goes into producing three well-documented projects: a mobile app, a complex web application and a redesign with measured before-and-after usability results.</p>
<p>Critique is weekly and structured. Learning to receive and give useful design feedback is treated as a core skill.</p>`,
    who_should_attend:
      'Graphic designers moving into product, developers who want design judgement, and career changers from any field with visual sensibility.',
    eligibility: 'No design degree required. Bring curiosity about why interfaces frustrate people.',
    career_opportunities:
      'UI Designer, UX Designer, Product Designer, Interaction Designer, UX Researcher, Design Consultant',
    certification: 'Learning Skills Professional Certificate in UI/UX Design',
    thumbnail: u('1561070791-2526d30994b5'),
    banner_image: u('1581291518857-4e27b48ff24e', 1800),
    duration: '20 weeks',
    duration_weeks: 20,
    lessons_count: 76,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry · instalments available',
    rating: 4.9,
    reviews_count: 156,
    students_enrolled: 1060,
    is_featured: 1,
    is_popular: 1,
    display_order: 12,
    outcomes: [
      'Plan and run user research, then turn transcripts into design decisions',
      'Design information architecture and flows for genuinely complex products',
      'Build accessible interfaces that meet WCAG AA as a baseline, not an afterthought',
      'Create and maintain a design system with tokens and documented components',
      'Present and defend design decisions with evidence in a stakeholder review',
    ],
    highlights: [
      { icon: 'LayoutTemplate', title: '3 full case studies', description: 'Documented end to end, ready for a portfolio review.' },
      { icon: 'Accessibility', title: 'Accessibility throughout', description: 'WCAG AA is the baseline in every project, not one lesson.' },
      { icon: 'Eye', title: 'Weekly structured critique', description: 'Give and receive feedback the way design teams do.' },
    ],
    syllabus: [
      { module_title: 'Design Foundations', description: 'The visual grammar everything else relies on.', duration: '3 weeks', topics: 'Layout, grid and spatial systems\nTypography and type scales\nColour theory and contrast requirements\nVisual hierarchy and gestalt principles\nFigma proficiency' },
      { module_title: 'User Research', description: 'Finding out what people actually need.', duration: '4 weeks', topics: 'Research planning and method selection\nInterview technique and avoiding leading questions\nSurveys and analytics as evidence\nAffinity mapping and synthesis\nPersonas and journey maps that get used\nUsability testing and severity rating' },
      { module_title: 'Interaction and Information Design', description: 'Structuring a product so it makes sense.', duration: '4 weeks', topics: 'Information architecture and navigation\nUser flows and task analysis\nWireframing at low and mid fidelity\nForm design and error prevention\nMicro-interactions and motion\nPrototyping for testing' },
      { module_title: 'Interface Craft and Design Systems', description: 'Quality at scale.', duration: '5 weeks', topics: 'High-fidelity UI design\nComponent and variant architecture\nDesign tokens and theming\nResponsive and adaptive patterns\nAccessible component behaviour\nHandoff and developer collaboration' },
      { module_title: 'Portfolio and Practice', description: 'Getting hired.', duration: '4 weeks', topics: 'Case study structure and writing\nPortfolio site build\nPresenting under challenge\nDesign interview exercises\nFreelance pricing and contracts' },
    ],
    faqs: [
      { question: 'Do I need to be able to draw?', answer: 'No. Interface design is far closer to structured problem solving than to illustration. Several of our strongest graduates came from engineering and operations backgrounds and could not sketch at all.' },
      { question: 'Should I learn to code as well?', answer: 'You should understand what is cheap and expensive to build, which the handoff module covers. You do not need to write production code, though designers who can read it collaborate better.' },
      { question: 'Is Figma included?', answer: 'Figma\'s free tier covers everything in the course. An education upgrade is arranged for the design system module where team features are needed.' },
    ],
  },
  {
    title: 'Graphic Design & Brand Identity',
    slug: 'graphic-design-brand-identity',
    code: 'DSGN-110',
    short_description:
      'Typography, layout and identity systems — from single artwork to a brand guideline a client can actually use.',
    overview: `<p>A craft-focused programme covering print and digital design, culminating in a complete brand identity project: logo system, type and colour, applications and a written guideline document.</p>
<p>Strong emphasis on typography, because it is the fastest way to tell a trained designer from an untrained one.</p>`,
    who_should_attend:
      'Aspiring designers, marketing staff producing their own creative, and freelancers wanting to raise their rates.',
    eligibility: 'No formal background required. A laptop capable of running design software.',
    career_opportunities:
      'Graphic Designer, Brand Designer, Visual Designer, Creative Executive, Freelance Designer, Packaging Designer',
    certification: 'Learning Skills Certificate in Graphic Design',
    thumbnail: u('1558655146-9f40138edfeb'),
    duration: '16 weeks',
    duration_weeks: 16,
    lessons_count: 60,
    level: 'Beginner',
    delivery_mode: 'Classroom',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 128,
    students_enrolled: 840,
    display_order: 13,
    outcomes: [
      'Set type with genuine control over hierarchy, rhythm and detail',
      'Design a logo system that works at every size and in one colour',
      'Prepare print-ready artwork correctly, including bleed and colour profiles',
      'Write a brand guideline document a client can hand to anyone',
    ],
    highlights: [
      { icon: 'Type', title: 'Typography-led', description: 'Four weeks on type alone — the skill clients notice.' },
      { icon: 'Printer', title: 'Real print production', description: 'Press-ready files, proofs and a studio visit.' },
      { icon: 'BookOpen', title: 'Full brand guideline', description: 'Finish with a complete, deliverable identity system.' },
    ],
    syllabus: [
      { module_title: 'Visual Fundamentals', description: 'Seeing deliberately.', duration: '3 weeks', topics: 'Composition and grid systems\nColour systems: RGB, CMYK, Pantone\nForm, balance and negative space\nDesign critique vocabulary' },
      { module_title: 'Typography', description: 'The core discipline.', duration: '4 weeks', topics: 'Anatomy and classification\nPairing and type scales\nKerning, tracking and leading\nTypesetting long-form text\nExpressive and display typography' },
      { module_title: 'Software Craft', description: 'Tools, used well.', duration: '3 weeks', topics: 'Illustrator: vectors and precision\nPhotoshop: retouching and compositing\nInDesign: multi-page layout\nFile management and non-destructive workflows' },
      { module_title: 'Brand Identity', description: 'Systems, not logos.', duration: '4 weeks', topics: 'Brand strategy and positioning\nLogo construction and responsive marks\nIdentity systems and applications\nGuideline documentation\nClient presentation' },
      { module_title: 'Production and Portfolio', description: 'Getting it made and getting it seen.', duration: '2 weeks', topics: 'Print production and prepress\nPackaging and large format\nDigital asset delivery\nPortfolio and pricing' },
    ],
    faqs: [
      { question: 'Do I need Adobe Creative Cloud?', answer: 'Yes, and we help you obtain the discounted student subscription. Free alternatives are noted where they are genuinely viable, though the industry expectation is still Adobe.' },
      { question: 'Is this classroom-only?', answer: 'The main cohort is on campus because the print production and critique sessions work much better in person. An online cohort runs twice a year with a print production kit couriered to you.' },
    ],
  },

  /* -------------------------------- FINANCE ------------------------------- */
  {
    title: 'Financial Accounting with Tally & GST',
    slug: 'financial-accounting-tally-gst',
    code: 'FIN-100',
    short_description:
      'Double-entry fundamentals through to GST filing and finalisation — the complete accounts executive skill set.',
    overview: `<p>A thorough, practical accounting programme. You will keep a full set of books for a simulated trading business across twelve months, including the awkward entries that textbooks skip.</p>
<p>GST is covered to filing level: returns, reconciliation and the common notices and how to respond to them.</p>`,
    who_should_attend:
      'Commerce graduates, accounts assistants wanting to progress, and business owners who want to understand their own books.',
    eligibility: 'Commerce background preferred but not required; the first module builds from first principles.',
    career_opportunities:
      'Accounts Executive, Accountant, Tax Assistant, Audit Assistant, Accounts Payable Specialist, Finance Executive',
    certification: 'Learning Skills Certificate in Financial Accounting & Taxation',
    thumbnail: u('1554224155-6726b3ff858f'),
    banner_image: u('1559526324-4b87b5e36e44', 1800),
    duration: '14 weeks',
    duration_weeks: 14,
    lessons_count: 56,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry',
    rating: 4.8,
    reviews_count: 201,
    students_enrolled: 1530,
    is_featured: 1,
    is_popular: 1,
    display_order: 14,
    outcomes: [
      'Record any routine business transaction correctly under double-entry',
      'Maintain complete books in Tally including inventory and multi-currency',
      'Compute and file GST returns, and reconcile input credit',
      'Finalise accounts and prepare a trial balance, P&L and balance sheet',
      'Read a set of financial statements and spot what looks wrong',
    ],
    highlights: [
      { icon: 'BookCopy', title: 'A full year of books', description: 'Twelve simulated months, including the difficult entries.' },
      { icon: 'ReceiptText', title: 'GST to filing level', description: 'Returns, reconciliation and responding to notices.' },
      { icon: 'Award', title: 'Tally proficiency', description: 'Hands-on in a licensed training environment throughout.' },
    ],
    syllabus: [
      { module_title: 'Accounting Fundamentals', description: 'The grammar of accounts.', duration: '3 weeks', topics: 'Double-entry and the accounting equation\nJournals, ledgers and trial balance\nAccruals, prepayments and provisions\nDepreciation methods\nBank reconciliation' },
      { module_title: 'Tally Prime in Practice', description: 'Doing the work in the software firms use.', duration: '4 weeks', topics: 'Company setup and chart of accounts\nVouchers and transaction entry\nInventory and stock valuation\nCost centres and budgets\nReports and MIS extraction' },
      { module_title: 'GST', description: 'India\'s indirect tax, end to end.', duration: '4 weeks', topics: 'GST structure, rates and classification\nInput tax credit rules\nInvoicing and e-way bills\nGSTR-1, 3B and annual return\nReconciliation and common notices' },
      { module_title: 'Payroll, TDS and Finalisation', description: 'Closing the year properly.', duration: '3 weeks', topics: 'Salary structures and TDS on salary\nTDS returns and certificates\nYear-end adjustments\nFinal accounts preparation\nAudit readiness and capstone' },
    ],
    faqs: [
      { question: 'Is Tally software provided?', answer: 'Yes, you work in a licensed Tally Prime training environment for the duration of the course, and we show you how to obtain an educational licence to keep practising afterwards.' },
      { question: 'How current is the GST content?', answer: 'The GST module is reviewed every quarter against current notifications, and the trainers are practising accountants who file returns monthly. Rate and rule changes are reflected in the live sessions as they happen.' },
      { question: 'Is this useful outside India?', answer: 'The accounting fundamentals and finalisation modules are universal. GST and TDS are India-specific — learners based elsewhere usually take the course for the first and last modules and treat the tax content as context.' },
    ],
  },
  {
    title: 'Financial Modelling & Valuation',
    slug: 'financial-modelling-valuation',
    code: 'FIN-220',
    short_description:
      'Build three-statement models, DCF and comparables from scratch — the analyst skill set, taught by people who have built them for real deals.',
    overview: `<p>An intensive, build-from-blank-sheet programme. No templates are provided: you construct every model yourself, because that is the only way the structure becomes yours.</p>
<p>You will model three real listed companies and one acquisition scenario, then defend your assumptions in a review that mirrors an investment committee.</p>`,
    who_should_attend:
      'Finance professionals, CA and CFA candidates, equity research and corporate development staff, and founders preparing to raise.',
    eligibility:
      'Solid accounting knowledge — you can read a balance sheet confidently. Strong Excel skills required.',
    career_opportunities:
      'Financial Analyst, Equity Research Associate, Investment Banking Analyst, Corporate Finance Executive, FP&A Analyst',
    certification: 'Learning Skills Advanced Certificate in Financial Modelling',
    thumbnail: u('1611974789855-9c2a0a7236a3'),
    duration: '12 weeks',
    duration_weeks: 12,
    lessons_count: 48,
    level: 'Advanced',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.9,
    reviews_count: 87,
    students_enrolled: 460,
    is_featured: 1,
    display_order: 15,
    outcomes: [
      'Build an integrated three-statement model that balances and flexes',
      'Run a defensible DCF, including WACC and terminal value sensitivity',
      'Construct trading and transaction comparables and explain the spread',
      'Model an acquisition with accretion/dilution analysis',
      'Present and defend a valuation under challenge',
    ],
    highlights: [
      { icon: 'Sigma', title: 'No templates', description: 'Every model built from a blank sheet, by you.' },
      { icon: 'Building2', title: 'Real listed companies', description: 'Model actual filings, not simplified teaching cases.' },
      { icon: 'Gavel', title: 'Investment committee review', description: 'Defend your assumptions to practising professionals.' },
    ],
    syllabus: [
      { module_title: 'Model Architecture', description: 'Structure before numbers.', duration: '2 weeks', topics: 'Model design principles and layout\nFormula discipline and error checks\nReading and normalising filings\nHistorical analysis and drivers' },
      { module_title: 'Three-Statement Modelling', description: 'The core build.', duration: '4 weeks', topics: 'Revenue and cost build-ups\nWorking capital schedules\nFixed assets and depreciation waterfall\nDebt schedules and interest circularity\nBalancing the model\nScenario and sensitivity switches' },
      { module_title: 'Valuation', description: 'What it is worth, and why.', duration: '4 weeks', topics: 'DCF: free cash flow construction\nWACC, beta and cost of capital\nTerminal value approaches\nTrading and transaction comparables\nSum-of-the-parts and football field' },
      { module_title: 'Transactions and Presentation', description: 'Using the model to make a decision.', duration: '2 weeks', topics: 'M&A model and accretion/dilution\nLBO fundamentals\nPitch structure and defensibility\nCapstone valuation and committee review' },
    ],
    faqs: [
      { question: 'How strong does my Excel need to be?', answer: 'Comfortable with lookups, nested logic and keyboard navigation. If you have completed our Advanced Excel course you are well prepared. Mouse-dependent users find the pace demanding.' },
      { question: 'Does this help with CFA?', answer: 'It complements it well — CFA is strong on theory and lighter on building. Many candidates take this alongside Level II and report the modelling made the valuation material concrete.' },
    ],
  },

  /* ------------------------------ HEALTHCARE ------------------------------ */
  {
    title: 'Medical Coding & Billing',
    slug: 'medical-coding-billing',
    code: 'HLTH-120',
    short_description:
      'ICD-10, CPT and HCPCS coding plus the revenue cycle — a desk-based healthcare career with no clinical shifts.',
    overview: `<p>Medical coding is one of the most reliable non-clinical routes into healthcare, and it is in sustained demand. This programme takes you from anatomy fundamentals to coding real anonymised charts at production accuracy.</p>
<p>Accuracy targets mirror employer expectations: you need to sustain 95% across a mixed chart set to pass the final assessment.</p>`,
    who_should_attend:
      'Life science and nursing graduates, healthcare administrators, and career changers seeking stable desk-based healthcare work.',
    eligibility:
      'Graduation, preferably with a life sciences or nursing background. Strong English comprehension required.',
    career_opportunities:
      'Medical Coder, Medical Biller, Charge Entry Specialist, AR Analyst, Coding Auditor, Revenue Cycle Analyst',
    certification: 'Learning Skills Certificate in Medical Coding & Billing',
    thumbnail: u('1576091160550-2173dba999ef'),
    banner_image: u('1579684385127-1ef15d508118', 1800),
    duration: '16 weeks',
    duration_weeks: 16,
    lessons_count: 60,
    level: 'Beginner',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 142,
    students_enrolled: 980,
    is_popular: 1,
    display_order: 16,
    outcomes: [
      'Code diagnoses and procedures accurately from clinical documentation',
      'Apply ICD-10-CM, CPT and HCPCS conventions and guidelines correctly',
      'Work a claim through the revenue cycle including denials and appeals',
      'Maintain compliance with documentation and privacy requirements',
      'Sustain 95% coding accuracy on a mixed chart set',
    ],
    highlights: [
      { icon: 'Stethoscope', title: 'Real anonymised charts', description: 'Code genuine documentation, not textbook summaries.' },
      { icon: 'Target', title: '95% accuracy standard', description: 'Assessed to the level employers actually require.' },
      { icon: 'ShieldCheck', title: 'Certification prep', description: 'Aligned to CPC and CCS exam structures.' },
    ],
    syllabus: [
      { module_title: 'Medical Foundations', description: 'The vocabulary of the clinical record.', duration: '4 weeks', topics: 'Medical terminology and word construction\nAnatomy and physiology by system\nCommon pathology and procedures\nPharmacology basics\nReading clinical documentation' },
      { module_title: 'ICD-10-CM Diagnosis Coding', description: 'Classifying the condition.', duration: '4 weeks', topics: 'Structure, conventions and guidelines\nChapter-specific rules\nSequencing and principal diagnosis\nCombination codes and exclusions\nChart practice by specialty' },
      { module_title: 'CPT and HCPCS Procedure Coding', description: 'Classifying the work done.', duration: '4 weeks', topics: 'CPT structure and sections\nModifiers and their correct use\nEvaluation and management levels\nSurgical global periods\nHCPCS Level II and supplies' },
      { module_title: 'Revenue Cycle and Compliance', description: 'From code to payment.', duration: '4 weeks', topics: 'Claim lifecycle and clearinghouses\nPayer rules and medical necessity\nDenial management and appeals\nAR follow-up and reporting\nHIPAA, fraud and abuse\nFinal accuracy assessment' },
    ],
    faqs: [
      { question: 'Do I need a medical degree?', answer: 'No. A life sciences or nursing background helps with the terminology module, but we teach the clinical vocabulary from scratch and graduates of all disciplines complete the course successfully.' },
      { question: 'Will this get me a CPC certification?', answer: 'The content is aligned to the CPC and CCS syllabi and includes mock exams, but the certification itself is awarded by AAPC or AHIMA through their own exam. We guide you through registration and preparation.' },
      { question: 'Is remote work realistic in this field?', answer: 'Yes — coding is one of the more genuinely remote-friendly healthcare roles. Most employers require six to twelve months of supervised production experience first.' },
    ],
  },
  {
    title: 'Hospital & Healthcare Administration',
    slug: 'hospital-healthcare-administration',
    code: 'HLTH-150',
    short_description:
      'Run the operations behind patient care — front office, quality, compliance and healthcare finance.',
    overview: `<p>Healthcare administration is where clinical quality and operational reality meet. This programme covers the full administrative function, from patient flow and bed management to accreditation readiness and departmental budgeting.</p>
<p>Case work is drawn from real operational problems: an overwhelmed outpatient department, a failed infection control audit, and a cash flow crunch caused by insurance delays.</p>`,
    who_should_attend:
      'Healthcare graduates, nurses moving into administration, hospital front-office staff, and clinic owners.',
    eligibility: 'Graduation in any stream; healthcare exposure helpful.',
    career_opportunities:
      'Hospital Administrator, Operations Executive, Patient Services Manager, Quality & Accreditation Officer, Clinic Manager',
    certification: 'Learning Skills Certificate in Healthcare Administration',
    thumbnail: u('1538108149393-fbbd81895907'),
    duration: '12 weeks',
    duration_weeks: 12,
    lessons_count: 44,
    level: 'Intermediate',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry',
    rating: 4.6,
    reviews_count: 68,
    students_enrolled: 410,
    display_order: 17,
    outcomes: [
      'Manage patient flow, appointments and bed utilisation against real constraints',
      'Prepare a department for an accreditation audit',
      'Build and track a departmental budget including payer mix effects',
      'Handle complaints and incidents in a way that improves the system',
    ],
    highlights: [
      { icon: 'ClipboardList', title: 'Accreditation readiness', description: 'Work through a real NABH-style audit preparation.' },
      { icon: 'Activity', title: 'Operational case work', description: 'Solve genuine hospital operations problems.' },
      { icon: 'Users', title: 'Taught by administrators', description: 'Trainers who currently run hospital departments.' },
    ],
    syllabus: [
      { module_title: 'Healthcare Systems', description: 'How the sector is structured and funded.', duration: '2 weeks', topics: 'Delivery models and payer landscape\nInsurance and TPA processes\nRegulatory environment\nMedical ethics and patient rights' },
      { module_title: 'Operations and Patient Experience', description: 'The daily work.', duration: '4 weeks', topics: 'Front office and registration\nAppointment systems and queue management\nBed management and discharge planning\nMedical records and HMIS\nComplaint handling and service recovery' },
      { module_title: 'Quality and Compliance', description: 'Making standards real.', duration: '3 weeks', topics: 'Quality frameworks and indicators\nNABH/JCI standards overview\nInfection control and safety protocols\nIncident reporting and root cause analysis\nAudit preparation' },
      { module_title: 'Healthcare Finance and Capstone', description: 'Keeping the lights on.', duration: '3 weeks', topics: 'Costing and tariff structures\nDepartmental budgeting\nRevenue cycle and claim management\nProcurement and inventory\nCapstone operations improvement plan' },
    ],
    faqs: [
      { question: 'Is there a hospital placement?', answer: 'The hybrid cohort includes two campus-based observation days at partner hospitals. A full internship is not part of the programme, though we introduce interested learners to partner facilities.' },
      { question: 'Does this cover Indian accreditation specifically?', answer: 'NABH is covered in most depth, with JCI used for comparison. The quality principles transfer to any framework.' },
    ],
  },

  /* ------------------------------- LANGUAGE ------------------------------- */
  {
    title: 'IELTS Preparation Intensive',
    slug: 'ielts-preparation-intensive',
    code: 'LANG-110',
    short_description:
      'Band-targeted preparation across all four skills, with weekly marked mocks and individual speaking feedback.',
    overview: `<p>A focused preparation course for Academic and General Training IELTS. Teaching is organised around the marking criteria: every session connects back to what an examiner is actually looking for.</p>
<p>You sit a full marked mock every week from week three, with individual written feedback and a recorded one-to-one speaking review each fortnight.</p>`,
    who_should_attend:
      'Candidates for study abroad, skilled migration or professional registration who need a specific band score.',
    eligibility: 'Intermediate English (roughly CEFR B1). A placement test sets your target band and group.',
    career_opportunities:
      'Required for university admission, skilled migration, and professional registration in the UK, Australia, Canada and New Zealand.',
    certification: 'Learning Skills IELTS Preparation Completion Certificate',
    thumbnail: u('1456513080510-7bf3a84b82f8'),
    duration: '8 weeks',
    duration_weeks: 8,
    lessons_count: 48,
    level: 'Intermediate',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry',
    rating: 4.8,
    reviews_count: 276,
    students_enrolled: 2340,
    is_popular: 1,
    display_order: 18,
    outcomes: [
      'Apply the band descriptors to your own writing and self-assess accurately',
      'Manage reading and listening timing under genuine exam pressure',
      'Structure Task 1 and Task 2 responses to target band requirements',
      'Speak fluently for two minutes on an unfamiliar prompt',
    ],
    highlights: [
      { icon: 'FileCheck2', title: 'Weekly marked mocks', description: 'Full tests with individual written feedback.' },
      { icon: 'Mic', title: '1:1 speaking reviews', description: 'Recorded fortnightly sessions with an examiner-trained tutor.' },
      { icon: 'Users', title: 'Groups of 12 maximum', description: 'Small enough that everyone speaks every session.' },
    ],
    syllabus: [
      { module_title: 'Diagnostic and Strategy', description: 'Knowing exactly where you stand.', duration: '1 week', topics: 'Full diagnostic test\nBand descriptors explained\nPersonal target plan\nExam format and timing' },
      { module_title: 'Listening and Reading', description: 'Accuracy under time pressure.', duration: '2 weeks', topics: 'Question type strategies\nSkimming, scanning and detail location\nDistractors and paraphrase recognition\nTiming drills and transfer accuracy' },
      { module_title: 'Writing', description: 'The section most candidates under-score.', duration: '3 weeks', topics: 'Task 1 Academic: charts and processes\nTask 1 General: letters\nTask 2 essay structures\nCohesion, lexical range and grammatical accuracy\nMarked practice and revision cycles' },
      { module_title: 'Speaking and Final Mocks', description: 'Fluency and confidence.', duration: '2 weeks', topics: 'Parts 1, 2 and 3 technique\nPronunciation and natural pacing\nExtending answers without padding\nFull mock interviews\nFinal assessment and readiness review' },
    ],
    faqs: [
      { question: 'What band can I expect to reach?', answer: 'Most learners improve by 0.5 to 1.5 bands over eight weeks, depending on starting level and practice hours. The diagnostic test gives you an honest, individual projection in week one — we would rather set a realistic target than sell an unrealistic one.' },
      { question: 'Do you book the actual exam for me?', answer: 'We advise on test dates and centres and tell you when we think you are ready, but the booking is made directly with the official test provider in your name.' },
      { question: 'Academic or General Training?', answer: 'Both are taught. The Reading and Writing Task 1 sessions split into separate streams; Listening and Speaking are shared since the formats are identical.' },
    ],
  },
  {
    title: 'Business English & Workplace Communication',
    slug: 'business-english-workplace-communication',
    code: 'LANG-130',
    short_description:
      'Write clearly, present confidently and handle difficult conversations — English for the situations work actually produces.',
    overview: `<p>Built for professionals whose English is functional but not yet confident in high-stakes situations: presenting to leadership, pushing back on a client, writing something that will be forwarded.</p>
<p>Every session is practice-heavy. You will present five times during the course, each one recorded and reviewed.</p>`,
    who_should_attend:
      'Professionals in client-facing or cross-border roles, team leads, and anyone whose writing is read by people more senior than them.',
    eligibility: 'Intermediate English. A short conversation places you in the right group.',
    career_opportunities:
      'Improves prospects in any client-facing, leadership or cross-border role; frequently taken before a promotion or an international move.',
    certification: 'Learning Skills Certificate in Business Communication',
    thumbnail: u('1491841550275-ad7854e35ca6'),
    duration: '8 weeks',
    duration_weeks: 8,
    lessons_count: 32,
    level: 'Intermediate',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 104,
    students_enrolled: 720,
    display_order: 19,
    outcomes: [
      'Write emails and documents that get the response you intended',
      'Present to senior stakeholders without reading from slides',
      'Run and contribute to meetings in a second language confidently',
      'Handle disagreement, pushback and bad news professionally',
    ],
    highlights: [
      { icon: 'Presentation', title: '5 recorded presentations', description: 'Reviewed individually, with measurable improvement.' },
      { icon: 'PenLine', title: 'Your real documents', description: 'Bring actual work emails and reports for rewriting.' },
      { icon: 'MessageCircle', title: 'Difficult conversations', description: 'Rehearse pushback and bad news in a safe setting.' },
    ],
    syllabus: [
      { module_title: 'Written Communication', description: 'Clarity as a professional skill.', duration: '3 weeks', topics: 'Email structure, tone and register\nWriting for a reader who will skim\nReports and executive summaries\nProposals and documentation\nEditing your own writing' },
      { module_title: 'Speaking and Presenting', description: 'Being listened to.', duration: '3 weeks', topics: 'Presentation structure and signposting\nSlide discipline\nVoice, pace and nerves\nHandling questions you did not expect\nRecorded practice and review' },
      { module_title: 'Interaction and Influence', description: 'The conversations that matter.', duration: '2 weeks', topics: 'Running effective meetings\nNegotiation and polite disagreement\nGiving and receiving feedback\nDelivering bad news\nCross-cultural communication' },
    ],
    faqs: [
      { question: 'Is this a grammar course?', answer: 'No. Grammar is corrected as it arises in your own writing and speech, but the focus is communication effectiveness. If you need foundational grammar, our placement conversation will say so honestly.' },
      { question: 'Can my employer sponsor a group?', answer: 'Yes — closed cohorts for a single organisation are common, and the content is adapted to your sector and the documents your teams actually produce.' },
    ],
  },

  /* ------------------------------- TEACHING ------------------------------- */
  {
    title: 'Early Years Care & Education',
    slug: 'early-years-care-education',
    code: 'EDU-110',
    short_description:
      'Child development, play-based learning and safeguarding — the foundation for working with children under five.',
    overview: `<p>A warm but rigorous introduction to early years practice. The programme balances developmental theory with the practical realities of a busy setting, and treats safeguarding as the non-negotiable core it is.</p>
<p>Observation skills are central: you will complete and analyse structured observations of real children's play, with consent and supervision, throughout the course.</p>`,
    who_should_attend:
      'Aspiring nursery and pre-school staff, parents returning to work, nannies seeking qualification, and primary teachers moving to early years.',
    eligibility:
      'No prior qualification required. A background check is required before any setting-based observation.',
    career_opportunities:
      'Early Years Practitioner, Nursery Assistant, Pre-school Teacher, Teaching Assistant, Childminder, Playgroup Leader',
    certification: 'Learning Skills Certificate in Early Years Care & Education',
    thumbnail: u('1509062522246-3755977927d7'),
    banner_image: u('1503676382389-4809596d5290', 1800),
    duration: '12 weeks',
    duration_weeks: 12,
    lessons_count: 44,
    level: 'Beginner',
    delivery_mode: 'Hybrid',
    fee_text: 'Fee on enquiry',
    rating: 4.9,
    reviews_count: 118,
    students_enrolled: 760,
    is_featured: 1,
    display_order: 20,
    outcomes: [
      'Observe and document a child\'s development against recognised milestones',
      'Plan play-based activities with a clear developmental purpose',
      'Recognise and act on a safeguarding concern correctly',
      'Support communication, early literacy and numeracy through play',
      'Work in partnership with parents, including in difficult conversations',
    ],
    highlights: [
      { icon: 'Baby', title: 'Observation-led', description: 'Structured observations of real play, analysed with a tutor.' },
      { icon: 'ShieldCheck', title: 'Safeguarding core', description: 'A full module, assessed, and revisited throughout.' },
      { icon: 'Blocks', title: 'Activity portfolio', description: 'Leave with 30 planned, purposeful activities you can use.' },
    ],
    syllabus: [
      { module_title: 'Child Development', description: 'How children grow and what that means for practice.', duration: '4 weeks', topics: 'Physical, cognitive and social development 0–5\nAttachment and emotional security\nLanguage acquisition\nDevelopmental milestones and variation\nObservation methods and recording' },
      { module_title: 'Play and Learning', description: 'Play as the serious work of childhood.', duration: '3 weeks', topics: 'Theories of play\nPlanning purposeful activities\nEnabling environments\nEarly literacy and numeracy through play\nOutdoor and messy play' },
      { module_title: 'Safeguarding, Health and Wellbeing', description: 'The duty that comes before everything else.', duration: '3 weeks', topics: 'Safeguarding legislation and procedure\nRecognising and reporting concerns\nHealth, hygiene and first aid awareness\nNutrition and physical wellbeing\nBehaviour support and self-regulation' },
      { module_title: 'Inclusion, Partnership and Practice', description: 'Working with families and colleagues.', duration: '2 weeks', topics: 'Special educational needs and inclusive practice\nWorking with parents and carers\nMulti-agency working\nProfessional conduct and reflective practice\nPortfolio assessment' },
    ],
    faqs: [
      { question: 'Do I need a background check?', answer: 'Yes, before any setting-based observation. We guide you through the process and it must be clear before those sessions. The taught content can begin while it is in progress.' },
      { question: 'Does this include first aid certification?', answer: 'Paediatric first aid awareness is covered, but the certificated qualification must be taken with an approved first aid provider. We point you to local accredited options.' },
      { question: 'Is observation in a real setting required?', answer: 'Yes, and it is the part learners value most. We can place you with a partner nursery, or you may use your own workplace if you are already employed in a setting.' },
    ],
  },
  {
    title: 'Teaching Skills & Classroom Practice',
    slug: 'teaching-skills-classroom-practice',
    code: 'EDU-140',
    short_description:
      'Lesson planning, assessment and behaviour management for new teachers, tutors and trainers.',
    overview: `<p>A practical teaching qualification for people who know their subject and need the craft of teaching it. Suitable for school teachers, private tutors and corporate trainers alike.</p>
<p>You will plan, deliver and reflect on six micro-lessons with peer and tutor feedback, which is where almost all the learning happens.</p>`,
    who_should_attend:
      'New and untrained teachers, private tutors, subject experts moving into training, and teaching assistants progressing.',
    eligibility: 'Graduation in any subject. Subject knowledge in what you intend to teach.',
    career_opportunities:
      'School Teacher, Subject Tutor, Corporate Trainer, Teaching Assistant, Coaching Faculty, Online Educator',
    certification: 'Learning Skills Certificate in Teaching & Learning',
    thumbnail: u('1577896851231-70ef18881754'),
    duration: '10 weeks',
    duration_weeks: 10,
    lessons_count: 36,
    level: 'Beginner',
    delivery_mode: 'Online',
    fee_text: 'Fee on enquiry',
    rating: 4.7,
    reviews_count: 89,
    students_enrolled: 540,
    display_order: 21,
    outcomes: [
      'Plan a lesson with clear objectives and evidence that they were met',
      'Use questioning and assessment to find out what students actually understand',
      'Manage behaviour and attention without relying on authority alone',
      'Differentiate a lesson for a genuinely mixed-ability group',
      'Reflect on your own teaching in a way that changes it',
    ],
    highlights: [
      { icon: 'SquarePen', title: '6 micro-lessons', description: 'Deliver, be observed, and get specific feedback.' },
      { icon: 'BrainCircuit', title: 'Evidence-informed', description: 'Grounded in cognitive science, not teaching folklore.' },
      { icon: 'Layers', title: 'Any subject, any age', description: 'Techniques apply from primary to corporate training.' },
    ],
    syllabus: [
      { module_title: 'How Learning Works', description: 'The evidence behind effective teaching.', duration: '2 weeks', topics: 'Memory, attention and cognitive load\nRetrieval practice and spacing\nMisconceptions and prior knowledge\nMotivation and mindset, carefully' },
      { module_title: 'Planning and Explaining', description: 'Designing the lesson.', duration: '3 weeks', topics: 'Learning objectives and success criteria\nSequencing and curriculum design\nExplanation, modelling and worked examples\nResource design\nPlanning for a mixed-ability group' },
      { module_title: 'Assessment and Feedback', description: 'Finding out what landed.', duration: '2 weeks', topics: 'Formative checks and questioning technique\nMarking that is worth the time\nFeedback that changes work\nSummative assessment design' },
      { module_title: 'Classroom Practice', description: 'Running the room.', duration: '3 weeks', topics: 'Routines and expectations\nBehaviour management strategies\nInclusive practice and SEN awareness\nTechnology in teaching\nMicro-lesson delivery and reflective portfolio' },
    ],
    faqs: [
      { question: 'Is this a recognised teaching licence?', answer: 'No — statutory teaching qualifications such as B.Ed. or QTS are awarded by universities and government bodies. This is a professional development certificate in teaching practice, widely valued by private schools, coaching institutes and corporate L&D teams.' },
      { question: 'I teach adults, not children. Is it still relevant?', answer: 'Yes. The cognitive science and lesson design content applies to any learner, and the micro-lessons are delivered in your own context — several participants each cohort are corporate trainers.' },
    ],
  },
];

/* ========================================================================== */
/*  TESTIMONIALS                                                              */
/* ========================================================================== */
export const testimonials = [
  {
    name: 'Ritika Sharma',
    designation: 'Frontend Developer',
    organisation: 'Zentra Technologies',
    course_slug: 'full-stack-web-development',
    message:
      'I joined with a BCom degree and a spreadsheet job I disliked. What made the difference was the code review — having a working engineer tell me honestly that my pull request was hard to read taught me more than any tutorial. I was offered a frontend role three weeks before the course ended.',
    avatar: u('1494790108377-be9c29b29330', 300),
    rating: 5,
    is_featured: 1,
    display_order: 1,
  },
  {
    name: 'Arjun Menon',
    designation: 'Data Analyst',
    organisation: 'Meridian Logistics',
    course_slug: 'data-analytics-python-sql',
    message:
      'The stakeholder simulation sessions were uncomfortable in the best way. Being challenged on my own chart by a trainer playing a sceptical sponsor is exactly what happens in real meetings, and I was ready for it when it actually happened.',
    avatar: u('1507003211169-0a1dd7228f2d', 300),
    rating: 5,
    is_featured: 1,
    display_order: 2,
  },
  {
    name: 'Fatima Qureshi',
    designation: 'Performance Marketing Manager',
    organisation: 'Northline Retail',
    course_slug: 'digital-marketing-professional',
    message:
      'Running live budget for the partner non-profit changed how I think about spend. You behave differently when the money is real. I came in managing social posts and left able to defend a media plan to a CFO.',
    avatar: u('1573496359142-b8d87734a5a2', 300),
    rating: 5,
    is_featured: 1,
    display_order: 3,
  },
  {
    name: 'Daniel Okoro',
    designation: 'Product Designer',
    organisation: 'Freelance',
    course_slug: 'ui-ux-design-professional',
    message:
      'Three case studies, properly documented, got me more interview calls in a month than two years of posting dribbble shots. The weekly critique was brutal early on and I am grateful for it.',
    avatar: u('1472099645785-5658abf4ff4e', 300),
    rating: 5,
    is_featured: 1,
    display_order: 4,
  },
  {
    name: 'Priya Nandakumar',
    designation: 'Accounts Manager',
    organisation: 'Veritas Associates',
    course_slug: 'financial-accounting-tally-gst',
    message:
      'I had been doing accounts for six years without formal training and was nervous about GST notices. Working through real notice responses in class removed that fear entirely. I now handle filings for fourteen clients.',
    avatar: u('1544005313-94ddf0286df2', 300),
    rating: 5,
    is_featured: 1,
    display_order: 5,
  },
  {
    name: 'Mohammed Aslam',
    designation: 'DevOps Engineer',
    organisation: 'Cloudspan Systems',
    course_slug: 'cloud-devops-engineering',
    message:
      'The incident drills were the whole value for me. Diagnosing a broken cluster with the clock running, in front of your cohort, builds something that reading documentation never will. My first on-call shift felt familiar.',
    avatar: u('1519085360753-af0119f7cbe7', 300),
    rating: 5,
    display_order: 6,
  },
  {
    name: 'Sneha Kulkarni',
    designation: 'Early Years Practitioner',
    organisation: 'Little Elms Nursery',
    course_slug: 'early-years-care-education',
    message:
      'The observation work was the part that changed my practice. I used to see children playing; now I see what they are working on developmentally and can plan for it. The safeguarding module was taught with the seriousness it deserves.',
    avatar: u('1580489944761-15a19d654956', 300),
    rating: 5,
    is_featured: 1,
    display_order: 7,
  },
  {
    name: 'Rahul Deshpande',
    designation: 'Senior Financial Analyst',
    organisation: 'Ashworth Capital',
    course_slug: 'financial-modelling-valuation',
    message:
      'Building every model from a blank sheet with no templates was painful for the first fortnight and then suddenly the structure was mine. Defending my valuation to the committee panel was the most useful hour of the whole course.',
    avatar: u('1557862921-37829c790f19', 300),
    rating: 5,
    display_order: 8,
  },
  {
    name: 'Ayesha Siddiqui',
    designation: 'Medical Coder',
    organisation: 'Arclight Health Services',
    course_slug: 'medical-coding-billing',
    message:
      'The 95% accuracy standard felt impossible in week six and routine by week fifteen. Coding real anonymised charts rather than tidy textbook examples is why I passed my employer assessment on the first attempt.',
    avatar: u('1438761681033-6461ffad8d80', 300),
    rating: 5,
    display_order: 9,
  },
  {
    name: 'Vikram Bhatt',
    designation: 'Operations Lead',
    organisation: 'Terrafirm Industries',
    course_slug: 'project-management-essentials',
    message:
      'The simulation threw a scope change at us in week six and lost us a resource in week nine. That is exactly how my actual projects go, and I had a method for it instead of just stress.',
    avatar: u('1560250097-0b93528c311a', 300),
    rating: 4,
    display_order: 10,
  },
  {
    name: 'Nisha Raghavan',
    designation: 'MIS Executive',
    organisation: 'Clearwater Foods',
    course_slug: 'advanced-excel-for-business',
    message:
      'I brought the monthly report that used to take me two full days. By week four it refreshed in about ninety seconds. Easily the best return on six weeks I have ever had.',
    avatar: u('1534528741775-53994a69daeb', 300),
    rating: 5,
    is_featured: 1,
    display_order: 11,
  },
  {
    name: 'Tanvir Ahmed',
    designation: 'Postgraduate Student',
    organisation: 'University of Leeds',
    course_slug: 'ielts-preparation-intensive',
    message:
      'The diagnostic in week one told me honestly that my target was ambitious but reachable, which I respected. Weekly marked mocks and the recorded speaking reviews took me from 6.0 to 7.5.',
    avatar: u('1568602471122-7832951cc4c5', 300),
    rating: 5,
    display_order: 12,
  },
];

/* ========================================================================== */
/*  SITE FEATURES  ·  STATS  ·  PROCESS  ·  TRAINERS                          */
/* ========================================================================== */
export const features = [
  {
    icon: 'UserCheck',
    title: 'Taught by practitioners',
    description:
      'Every trainer still works in the field they teach. Course material gets revised because something changed last month, not because the syllabus is due for review.',
    accent: '#23085a',
    placement: 'both',
    display_order: 1,
  },
  {
    icon: 'CalendarClock',
    title: 'Batches that fit a working week',
    description:
      'Evening, weekend and self-paced cohorts, and you can move between online and classroom formats mid-course at no extra cost if your schedule shifts.',
    accent: '#0fb9a8',
    placement: 'both',
    display_order: 2,
  },
  {
    icon: 'FolderGit2',
    title: 'Assessed project work',
    description:
      'You finish with reviewed, demonstrable work — code in a repository, a design case study, a model, an audit. Something an employer can actually examine.',
    accent: '#f99a07',
    placement: 'both',
    display_order: 3,
  },
  {
    icon: 'Users',
    title: 'Small cohorts, real contact time',
    description:
      'Capped class sizes with a 1:12 mentor ratio or better. Your question gets answered in the session rather than in a forum three days later.',
    accent: '#d946ef',
    placement: 'both',
    display_order: 4,
  },
  {
    icon: 'Briefcase',
    title: 'Twelve months of placement support',
    description:
      'CV clinics, portfolio review, mock interviews and employer introductions continue for a year after you graduate — not just until the course ends.',
    accent: '#059669',
    placement: 'both',
    display_order: 5,
  },
  {
    icon: 'Wallet',
    title: 'Transparent fees, flexible payment',
    description:
      'One quoted fee with no hidden material or examination charges, and interest-free instalment plans on every programme over twelve weeks.',
    accent: '#0284c7',
    placement: 'both',
    display_order: 6,
  },
  {
    icon: 'PlayCircle',
    title: 'Recordings for 18 months',
    description:
      'Miss a session or want to revisit a module a year later — every live class is recorded and stays available long after you finish.',
    accent: '#7c3aed',
    placement: 'home',
    display_order: 7,
  },
  {
    icon: 'MessageSquareHeart',
    title: 'One advisor, start to finish',
    description:
      'The same course advisor handles your enquiry, your enrolment and your questions during the programme. No ticket queues, no being passed around.',
    accent: '#e11d48',
    placement: 'home',
    display_order: 8,
  },
];

export const stats = [
  { icon: 'GraduationCap', label: 'Learners trained since 2014', value: 11400, suffix: '+', display_order: 1 },
  { icon: 'BookOpen', label: 'Programmes across 9 disciplines', value: 34, suffix: '', display_order: 2 },
  { icon: 'Briefcase', label: 'Hiring partners in our network', value: 260, suffix: '+', display_order: 3 },
  { icon: 'Star', label: 'Average learner rating', value: 48, prefix: '', suffix: '/5', display_order: 4 },
];

export const learningSteps = [
  {
    step_label: '01',
    icon: 'Search',
    title: 'Explore and shortlist',
    description:
      'Browse by discipline or search directly. Add every programme you are weighing up to your shortlist — comparing two or three is normal and sensible.',
    display_order: 1,
  },
  {
    step_label: '02',
    icon: 'Send',
    title: 'Send one enquiry',
    description:
      'One short form covers your whole shortlist. No payment details, no account to create, no obligation of any kind.',
    display_order: 2,
  },
  {
    step_label: '03',
    icon: 'PhoneCall',
    title: 'Talk to a course advisor',
    description:
      'A real advisor calls within 24 working hours with the prospectus, fees, batch dates and an honest view of whether the course suits your goal.',
    display_order: 3,
  },
  {
    step_label: '04',
    icon: 'Rocket',
    title: 'Enrol and start',
    description:
      'Choose your batch and format, set up instalments if you want them, and join your cohort. Your advisor stays your contact throughout.',
    display_order: 4,
  },
];

export const trainers = [
  {
    name: 'Dr. Ananya Varma',
    designation: 'Founder & Academic Director',
    bio: 'Twenty-two years across industry and academia, including eight leading engineering teams before founding Learning Skills in 2014. Still teaches the data modelling module personally because, in her words, it is the one people most often get wrong for the longest time.',
    photo: u('1559829604-549c5c6b2b7d', 500),
    expertise: 'Curriculum design, data engineering, academic governance',
    experience_years: 22,
    linkedin_url: 'https://linkedin.com',
    display_order: 1,
  },
  {
    name: 'Rohan Iyer',
    designation: 'Lead Trainer — Technology',
    bio: 'Principal engineer at a payments company by day, teaching the full-stack and DevOps cohorts by evening. Known among learners for refusing to accept a pull request he cannot read in under two minutes.',
    photo: u('1500648767791-00dcc994a43e', 500),
    expertise: 'JavaScript, React, Node.js, Kubernetes, platform engineering',
    experience_years: 14,
    linkedin_url: 'https://linkedin.com',
    display_order: 2,
  },
  {
    name: 'Meera Krishnan',
    designation: 'Lead Trainer — Data & Analytics',
    bio: 'Former head of analytics for a retail group, now consulting and teaching. Wrote the stakeholder simulation exercises after watching too many technically strong analysts lose the room in their first board presentation.',
    photo: u('1573497019940-1c28c88b4f3e', 500),
    expertise: 'SQL, Python, experimentation, analytics leadership',
    experience_years: 16,
    linkedin_url: 'https://linkedin.com',
    display_order: 3,
  },
  {
    name: 'Imran Shaikh',
    designation: 'Lead Trainer — Digital Marketing',
    bio: 'Runs a performance marketing consultancy managing live budgets across search and social. Negotiated the partner non-profit arrangement so every cohort gets to deploy real spend rather than hypothetical plans.',
    photo: u('1506794778202-cad84cf45f1d', 500),
    expertise: 'Paid media, SEO, analytics and attribution',
    experience_years: 12,
    linkedin_url: 'https://linkedin.com',
    display_order: 4,
  },
  {
    name: 'Clara Dsouza',
    designation: 'Lead Trainer — Design',
    bio: 'Product design lead with a decade in fintech and healthcare interfaces. Introduced the weekly structured critique format and the rule that accessibility is a pass/fail criterion on every project, not a bonus.',
    photo: u('1534528741775-53994a69daeb', 500),
    expertise: 'Product design, design systems, accessibility, research',
    experience_years: 11,
    linkedin_url: 'https://linkedin.com',
    display_order: 5,
  },
  {
    name: 'CA Suresh Pillai',
    designation: 'Lead Trainer — Finance & Accounting',
    bio: 'Practising chartered accountant filing returns for over sixty clients. Updates the GST module every quarter against live notifications, and brings genuine notice correspondence into class with client details removed.',
    photo: u('1472099645785-5658abf4ff4e', 500),
    expertise: 'Financial accounting, GST, taxation, audit',
    experience_years: 19,
    linkedin_url: 'https://linkedin.com',
    display_order: 6,
  },
  {
    name: 'Dr. Leena Mathew',
    designation: 'Lead Trainer — Healthcare',
    bio: 'Hospital quality and accreditation specialist who has taken three facilities through NABH accreditation. Teaches the operations case work using problems from her own consulting practice.',
    photo: u('1594824476967-48c8b964273f', 500),
    expertise: 'Healthcare quality, accreditation, hospital operations',
    experience_years: 17,
    linkedin_url: 'https://linkedin.com',
    display_order: 7,
  },
  {
    name: 'James Fernandes',
    designation: 'Lead Trainer — Language & Communication',
    bio: 'Examiner-trained English language instructor with fifteen years preparing candidates for IELTS and workplace communication. Insists on small groups because, as he puts it, you cannot learn to speak by listening.',
    photo: u('1568602471122-7832951cc4c5', 500),
    expertise: 'IELTS preparation, business English, public speaking',
    experience_years: 15,
    linkedin_url: 'https://linkedin.com',
    display_order: 8,
  },
];

/* ========================================================================== */
/*  SITE FAQs                                                                 */
/* ========================================================================== */
export const faqs = [
  {
    question: 'How do I enquire about more than one course?',
    answer:
      'Add every programme you are considering to your shortlist using the "Add to enquiry" button on any course card, then submit a single form. Your advisor will discuss the whole shortlist on one call and help you compare them honestly — including telling you if one is a better fit than another.',
    category: 'Enquiries & Admissions',
    show_on_home: 1,
    display_order: 1,
  },
  {
    question: 'What happens after I submit an enquiry?',
    answer:
      'You will receive an immediate confirmation with a reference number, and a course advisor will contact you within 24 working hours by phone, email or WhatsApp — whichever you prefer. They will send the detailed prospectus, current fees and upcoming batch dates, and answer anything the website does not cover. There is no obligation and no payment at this stage.',
    category: 'Enquiries & Admissions',
    show_on_home: 1,
    display_order: 2,
  },
  {
    question: 'Are there entrance exams or minimum qualifications?',
    answer:
      'No entrance exams. Most programmes require graduation in any discipline or equivalent work experience, and the beginner-level courses assume no prior knowledge of the subject. Where a genuine prerequisite exists — the advanced machine learning and financial modelling courses, for example — it is stated plainly on the course page.',
    category: 'Enquiries & Admissions',
    show_on_home: 1,
    display_order: 3,
  },
  {
    question: 'How much do the courses cost?',
    answer:
      'Fees vary by programme length and format, so we quote them individually with the prospectus rather than listing a figure that may not apply to your batch. What we can promise is one all-inclusive number: no separate material, platform or examination charges appear later. Interest-free instalment plans are available on every programme over twelve weeks.',
    category: 'Fees & Payment',
    show_on_home: 1,
    display_order: 4,
  },
  {
    question: 'Do you offer instalments or scholarships?',
    answer:
      'Interest-free instalments are available on all programmes longer than twelve weeks, typically split across the course duration. We also run a merit-and-need scholarship window twice a year covering 25% to 50% of fees; ask your advisor whether the next window applies to your intended start date.',
    category: 'Fees & Payment',
    display_order: 5,
  },
  {
    question: 'What is your refund policy?',
    answer:
      'Full refund if you withdraw before the second session of your cohort. A pro-rata refund of the unused portion applies up to the one-third point of the course, after which fees are non-refundable. Deferring to a later batch is free of charge and can be done once per enrolment.',
    category: 'Fees & Payment',
    display_order: 6,
  },
  {
    question: 'Can I study while working full time?',
    answer:
      'Most of our learners do. Live sessions run in the evenings and at weekends, every class is recorded and available for eighteen months, and the self-paced formats have no fixed session times at all. Be realistic about the project hours though — the course pages state the weekly commitment honestly.',
    category: 'Schedules & Format',
    show_on_home: 1,
    display_order: 7,
  },
  {
    question: 'What is the difference between online, classroom and hybrid?',
    answer:
      'Online means live interactive sessions over video with the same trainers and the same assessment. Classroom means on-campus sessions in Noida. Hybrid mixes the two, usually with theory online and project or lab work on campus. You can switch format mid-course at no extra cost by telling your coordinator a week ahead.',
    category: 'Schedules & Format',
    display_order: 8,
  },
  {
    question: 'What if I miss a live session?',
    answer:
      'Recordings are published within 24 hours and stay available for eighteen months. Trainers also hold a weekly office hour specifically for catching up, and your mentor can rework a missed project deadline with you if something serious comes up.',
    category: 'Schedules & Format',
    display_order: 9,
  },
  {
    question: 'Is the certificate recognised by employers?',
    answer:
      'Learning Skills certificates are industry-recognised professional credentials, not university degrees, and we are careful about that distinction. Their value with employers comes substantially from the assessed project work they represent — which is why every programme ends in something you can show rather than just a transcript. Where a course maps onto an external certification such as CPC, CKA or PMP, the course page says so and we help you prepare for that separate exam.',
    category: 'Certification & Outcomes',
    show_on_home: 1,
    display_order: 10,
  },
  {
    question: 'Do you guarantee job placement?',
    answer:
      'No. We think any training provider guaranteeing a job should be treated with suspicion, because the outcome depends on factors none of us control. What we do commit to is twelve months of structured placement support after you graduate: CV and portfolio clinics, mock interviews, and introductions to employers in our network of over 260 hiring partners.',
    category: 'Certification & Outcomes',
    show_on_home: 1,
    display_order: 11,
  },
  {
    question: 'I am an international learner. Can I join?',
    answer:
      'Yes, and a number of learners in each cohort are based outside India. Online and self-paced formats are fully accessible internationally, and session timings are published well ahead so you can judge the fit with your time zone. The jurisdiction-specific modules — GST, TDS, NABH — come with parallel exercises for your own country.',
    category: 'General',
    display_order: 12,
  },
  {
    question: 'Can my employer sponsor a group of us?',
    answer:
      'Yes. Closed cohorts for a single organisation are common, and we adapt case studies and project briefs to your sector and your actual systems. Corporate enrolments of six or more attract group pricing — mention it in your enquiry and an advisor will scope it with you.',
    category: 'General',
    display_order: 13,
  },
];

/* ========================================================================== */
/*  CMS PAGES                                                                 */
/* ========================================================================== */
export const pages = [
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    subtitle: 'How we collect, use and protect the information you give us.',
    page_type: 'system',
    show_in_footer: 1,
    display_order: 1,
    meta_description: 'How Learning Skills collects, uses, stores and protects personal information submitted through course enquiries and contact forms.',
    content: `<p><strong>Last updated:</strong> 1 November 2026</p>
<p>This policy explains what personal information Learning Skills collects, why we collect it, and what you can ask us to do with it. It is written to be read, not to be impenetrable — if anything here is unclear, email us and we will explain it plainly.</p>

<h2>What we collect</h2>
<p>When you submit a course enquiry or contact form we collect your name, email address, phone number, and optionally your city, qualification and any message you write. We also record which courses you selected, the page you submitted from, and your IP address and browser type for security and fraud prevention.</p>
<p>We do not ask for, and you should never send us, payment card details, identity document numbers or passwords through any form on this website.</p>

<h2>Why we collect it</h2>
<ul>
<li><strong>To respond to your enquiry.</strong> A course advisor needs your contact details to send the prospectus and discuss batch options with you.</li>
<li><strong>To keep a record of our conversation</strong> so you are not asked the same questions twice by a different advisor.</li>
<li><strong>To improve our programmes.</strong> Aggregated, anonymised enquiry patterns tell us which subjects are in demand and where our course information is unclear.</li>
<li><strong>To meet our legal and accounting obligations</strong> once you enrol.</li>
</ul>

<h2>How we contact you</h2>
<p>If you submit an enquiry, you are consenting to be contacted about that enquiry by phone, email or WhatsApp. We will not add you to a marketing list on the basis of an enquiry alone — newsletter subscription is a separate, explicit opt-in, and every newsletter contains a one-click unsubscribe link.</p>

<h2>Who we share it with</h2>
<p>We do not sell your personal information, and we do not share it with third parties for their own marketing. We share data only with the service providers who help us operate — our hosting provider, email delivery service and customer communication tools — and only to the extent they need it to provide that service. Where a provider is located outside your country, we rely on standard contractual protections.</p>

<h2>How long we keep it</h2>
<p>Enquiry records are retained for three years from your last contact with us, after which they are deleted or anonymised. If you enrol, your learner record is kept for seven years to meet certification and accounting requirements. You can ask us to delete your enquiry record sooner at any time.</p>

<h2>How we protect it</h2>
<p>Data is transmitted over encrypted connections, stored on access-controlled servers, and visible only to the staff who need it to do their work. Administrator access requires individual credentials and is logged. We will not pretend any system is perfect — but if a breach affecting your data ever occurred, we would tell you promptly and tell you what we were doing about it.</p>

<h2>Your rights</h2>
<p>You can ask us to show you the information we hold about you, correct anything inaccurate, delete it, or stop contacting you. Email the address on our contact page and we will respond within thirty days. You will never be charged for making such a request, and making one will never affect how we treat your enquiry.</p>

<h2>Cookies</h2>
<p>This website uses cookies that are necessary for it to function, plus analytics cookies that help us understand which pages are useful. Analytics cookies are optional and can be declined without losing any functionality. We do not use advertising cookies that track you across other websites.</p>

<h2>Children</h2>
<p>Our programmes are intended for people aged 16 and over, and we do not knowingly collect information from children under 16. Where a course concerns working with children, safeguarding checks apply to the adult learner.</p>

<h2>Changes to this policy</h2>
<p>If we change this policy materially we will update the date at the top and, where the change affects how we use information you have already given us, contact you directly.</p>`,
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    subtitle: 'The agreement between you and Learning Skills.',
    page_type: 'system',
    show_in_footer: 1,
    display_order: 2,
    meta_description: 'Terms and conditions governing use of the Learning Skills website, course enquiries, enrolment, fees and certification.',
    content: `<p><strong>Last updated:</strong> 1 November 2026</p>
<p>These terms govern your use of this website and any course enquiry you submit through it. Enrolling on a programme is covered by a separate enrolment agreement, which we send with your offer and which takes precedence where the two differ.</p>

<h2>Using this website</h2>
<p>You may use this site to research our programmes and contact us. You may not scrape it at scale, submit false or automated enquiries, attempt to access administrative areas, or interfere with its operation. Course descriptions, syllabi and written content on this site are our intellectual property and may not be reproduced commercially without written permission.</p>

<h2>Enquiries</h2>
<p>Submitting an enquiry costs nothing, commits you to nothing, and does not reserve a place on a programme. We aim to respond within 24 working hours but do not guarantee a specific response time. We may decline to respond to enquiries that appear automated, abusive or fraudulent.</p>

<h2>Course information accuracy</h2>
<p>We work to keep syllabi, durations and delivery formats accurate, and we revise course content regularly — which means a programme may change between your enquiry and your enrolment. Material changes are confirmed in writing before you commit. Fees quoted by an advisor are valid for thirty days unless stated otherwise.</p>

<h2>Enrolment, fees and refunds</h2>
<p>A place is confirmed when we receive your enrolment form and first payment. Fees are quoted inclusive of all teaching, materials and internal assessment; external certification exams, where applicable, are paid separately to the awarding body.</p>
<p>Our refund position: full refund if you withdraw before the second session; pro-rata refund of the unused portion up to the one-third point of the course; no refund after that. You may defer to a later batch once per enrolment at no charge. If we cancel a batch, you receive a full refund or a free transfer, whichever you prefer.</p>

<h2>Your conduct on a programme</h2>
<p>We expect learners to treat trainers and fellow learners with respect, to submit their own work, and to respect the confidentiality of any case material shared in class. Plagiarism, harassment or sharing course recordings outside the cohort may result in removal from the programme without refund. Those decisions are reviewed by the Academic Director, and you may appeal them.</p>

<h2>Certification</h2>
<p>Learning Skills certificates are professional credentials awarded by us on the basis of assessed work. They are not university degrees and we do not represent them as such. Certificates are issued on meeting the stated attendance and assessment requirements for your programme.</p>

<h2>Placement support</h2>
<p>Placement support — CV clinics, portfolio review, mock interviews and employer introductions — is provided for twelve months after graduation. It is support, not a guarantee of employment, and we make no promise of a job, a salary level or a specific number of interviews.</p>

<h2>Liability</h2>
<p>We take responsibility for delivering the programme you enrolled on to the standard described. We are not liable for indirect losses such as lost earnings or missed opportunities, and our total liability is limited to the fees you have paid. Nothing here limits liability we cannot lawfully limit.</p>

<h2>Governing law</h2>
<p>These terms are governed by the laws of India and subject to the jurisdiction of the courts at Noida, Uttar Pradesh. If any provision is found unenforceable, the rest continues to apply.</p>

<h2>Contacting us about these terms</h2>
<p>Questions about these terms can be sent to the address on our contact page, and a person — not an auto-responder — will reply.</p>`,
  },
  {
    title: 'Refund & Cancellation Policy',
    slug: 'refund-policy',
    subtitle: 'What happens if your plans change, or ours do.',
    page_type: 'custom',
    show_in_footer: 1,
    display_order: 3,
    meta_description: 'Learning Skills refund, cancellation, deferral and batch transfer policy, stated in full.',
    content: `<p>Plans change. This page states exactly what happens to your fees when they do, so you are not reading the small print for the first time at the worst moment.</p>

<h2>If you withdraw</h2>
<table>
<thead><tr><th>When you tell us</th><th>What you receive</th></tr></thead>
<tbody>
<tr><td>Before the second session of your cohort</td><td>Full refund of fees paid</td></tr>
<tr><td>Up to one third of the way through the course</td><td>Pro-rata refund of the unused portion</td></tr>
<tr><td>After one third of the course</td><td>No refund; deferral may still be possible</td></tr>
</tbody>
</table>
<p>Refunds are processed to the original payment method within fourteen working days of your written request. We do not charge an administrative fee for processing a refund.</p>

<h2>If you want to defer</h2>
<p>You can move to a later batch of the same programme once per enrolment at no charge, provided you tell us before the course is half complete. Your fees transfer in full. A second deferral is at our discretion and may attract a re-enrolment charge if the fee has changed.</p>

<h2>If you want to switch format</h2>
<p>Moving between online, classroom and hybrid delivery of the same programme is free at any point. Tell your cohort coordinator a week ahead so your materials and access can be arranged.</p>

<h2>If you want to switch courses</h2>
<p>Before the second session, you can transfer to any other programme and we will adjust the fee difference either way. After that, a transfer is treated as a withdrawal from the first course and a new enrolment on the second, with the refund schedule above applying.</p>

<h2>If we cancel or postpone</h2>
<p>Occasionally a batch does not reach viable numbers, or a trainer becomes unavailable. If we cancel a batch you choose between a full refund and a free transfer to the next available cohort. If we postpone a start date by more than three weeks, you have the same choice. If an individual session is cancelled, we schedule a replacement and the recording is made available.</p>

<h2>Scholarship and instalment cases</h2>
<p>Where fees were reduced by a scholarship, refunds are calculated on the amount actually paid. Where you are paying by instalment, withdrawing ends future instalments; the refund schedule applies to what you have paid to date.</p>

<h2>Exceptional circumstances</h2>
<p>Serious illness, bereavement, job relocation and similar events happen, and the schedule above is not the end of the conversation. Write to the Academic Director with a short explanation and we will look at your case individually. We would rather be fair than consistent with a table.</p>

<h2>How to make a request</h2>
<p>Email your course advisor or the address on our contact page with your name, programme, batch and what you would like to happen. We acknowledge within two working days and resolve within fourteen.</p>`,
  },
];

/* ========================================================================== */
/*  NAVIGATION                                                                */
/* ========================================================================== */
export const menuItems = [
  { location: 'header', label: 'Home', url: '/', display_order: 1 },
  { location: 'header', label: 'Courses', url: '/courses', display_order: 2 },
  { location: 'header', label: 'About', url: '/about', display_order: 3 },
  { location: 'header', label: 'FAQs', url: '/faqs', display_order: 4 },
  { location: 'header', label: 'Contact', url: '/contact', display_order: 5 },

  { location: 'footer_primary', label: 'All Courses', url: '/courses', display_order: 1 },
  { location: 'footer_primary', label: 'About Us', url: '/about', display_order: 2 },
  { location: 'footer_primary', label: 'Our Trainers', url: '/about#trainers', display_order: 3 },
  { location: 'footer_primary', label: 'FAQs', url: '/faqs', display_order: 4 },
  { location: 'footer_primary', label: 'Contact Us', url: '/contact', display_order: 5 },

  { location: 'footer_secondary', label: 'Privacy Policy', url: '/privacy-policy', display_order: 1 },
  { location: 'footer_secondary', label: 'Terms & Conditions', url: '/terms-and-conditions', display_order: 2 },
  { location: 'footer_secondary', label: 'Refund Policy', url: '/refund-policy', display_order: 3 },
];

/* ========================================================================== */
/*  SAMPLE LEADS  (so the dashboard has something to chart on day one)        */
/* ========================================================================== */
export const sampleEnquiries = [
  { name: 'Kavya Reddy', email: 'kavya.reddy@example.com', phone: '+91 98201 44512', city: 'Hyderabad', qualification: 'B.Tech (ECE)', preferred_mode: 'Online', message: 'Comparing the full-stack and data analytics programmes. Which suits someone from an electronics background with no coding experience?', courses: ['full-stack-web-development', 'data-analytics-python-sql'], status: 'contacted', priority: 'high', days_ago: 1 },
  { name: 'Harish Gupta', email: 'harish.g@example.com', phone: '+91 99100 23418', city: 'Delhi', qualification: 'B.Com', preferred_mode: 'Classroom', message: 'Need GST filing skills for my family business. Do you cover responding to notices?', courses: ['financial-accounting-tally-gst'], status: 'converted', priority: 'medium', days_ago: 3 },
  { name: 'Lakshmi Iyer', email: 'lakshmi.iyer@example.com', phone: '+91 98450 77321', city: 'Bengaluru', qualification: 'MBA (Marketing)', preferred_mode: 'Hybrid', message: 'Interested in the SEO specialist course. Is the digital marketing certificate a prerequisite?', courses: ['seo-content-strategy-specialist', 'digital-marketing-professional'], status: 'follow_up', priority: 'high', days_ago: 2 },
  { name: 'Omar Farooq', email: 'omar.farooq@example.com', phone: '+971 50 221 4480', city: 'Dubai', qualification: 'BSc (Computer Science)', preferred_mode: 'Online', message: 'Based in the UAE. What time do the DevOps live sessions run in Gulf Standard Time?', courses: ['cloud-devops-engineering'], status: 'new', priority: 'medium', days_ago: 0 },
  { name: 'Shruti Patil', email: 'shruti.patil@example.com', phone: '+91 97654 11290', city: 'Pune', qualification: 'B.A. (Psychology)', preferred_mode: 'Hybrid', message: 'Returning to work after four years. Interested in early years education — is the background check difficult to arrange?', courses: ['early-years-care-education'], status: 'contacted', priority: 'medium', days_ago: 5 },
  { name: 'Nikhil Joshi', email: 'nikhil.joshi@example.com', phone: '+91 98111 56703', city: 'Noida', qualification: 'CA Inter', preferred_mode: 'Online', message: 'Taking CFA Level II. Would the financial modelling course run in parallel be too much?', courses: ['financial-modelling-valuation'], status: 'new', priority: 'high', days_ago: 0 },
  { name: 'Grace Williams', email: 'grace.w@example.com', phone: '+44 7700 912345', city: 'Manchester', qualification: 'BSc (Nursing)', preferred_mode: 'Online', message: 'UK-based nurse looking at medical coding for remote work. Is the CPC route realistic from here?', courses: ['medical-coding-billing'], status: 'follow_up', priority: 'medium', days_ago: 7 },
  { name: 'Aditya Rao', email: 'aditya.rao@example.com', phone: '+91 90080 34417', city: 'Chennai', qualification: 'B.E. (Mechanical)', preferred_mode: 'Classroom', message: 'Want to move into UI/UX from a manufacturing role. Do I need any design background?', courses: ['ui-ux-design-professional', 'graphic-design-brand-identity'], status: 'new', priority: 'medium', days_ago: 1 },
  { name: 'Pooja Bhatia', email: 'pooja.bhatia@example.com', phone: '+91 98730 65412', city: 'Gurugram', qualification: 'MBA (HR)', preferred_mode: 'Online', message: 'Our company wants to enrol six people on the HR and payroll course. Is there group pricing?', courses: ['hr-management-payroll'], status: 'contacted', priority: 'high', days_ago: 4 },
  { name: 'Sameer Khan', email: 'sameer.khan@example.com', phone: '+91 99876 20145', city: 'Lucknow', qualification: 'B.Sc', preferred_mode: 'Online', message: 'Need IELTS 7.0 for a Canadian PR application by March. Is eight weeks enough from 6.0?', courses: ['ielts-preparation-intensive'], status: 'converted', priority: 'high', days_ago: 9 },
  { name: 'Divya Menon', email: 'divya.menon@example.com', phone: '+91 94470 88123', city: 'Kochi', qualification: 'B.Com', preferred_mode: 'Online', message: 'My monthly MIS report takes three days. Would the Excel course actually fix that?', courses: ['advanced-excel-for-business', 'power-bi-business-intelligence'], status: 'converted', priority: 'medium', days_ago: 12 },
  { name: 'Rajat Verma', email: 'rajat.verma@example.com', phone: '+91 98995 41276', city: 'Jaipur', qualification: 'B.Tech (IT)', preferred_mode: 'Online', message: 'Two years in manual QA. How much of the automation module assumes prior coding?', courses: ['software-testing-qa-automation'], status: 'new', priority: 'low', days_ago: 2 },
  { name: 'Ananya Bose', email: 'ananya.bose@example.com', phone: '+91 98300 77451', city: 'Kolkata', qualification: 'M.Sc (Statistics)', preferred_mode: 'Online', message: 'Strong stats background, weaker on deployment. Can I skip straight to the ML course?', courses: ['machine-learning-ai-foundations'], status: 'follow_up', priority: 'high', days_ago: 6 },
  { name: 'Imran Ali', email: 'imran.ali@example.com', phone: '+91 97011 23388', city: 'Hyderabad', qualification: 'BBA', preferred_mode: 'Hybrid', message: 'Moving from coordination into project management. Is the PM course recognised for PMP later?', courses: ['project-management-essentials'], status: 'contacted', priority: 'medium', days_ago: 8 },
  { name: 'Meghna Shah', email: 'meghna.shah@example.com', phone: '+91 99250 44107', city: 'Ahmedabad', qualification: 'B.Pharm', preferred_mode: 'Hybrid', message: 'Interested in hospital administration. Do the observation days happen in Noida only?', courses: ['hospital-healthcare-administration'], status: 'new', priority: 'low', days_ago: 3 },
  { name: 'Carlos Mendes', email: 'carlos.mendes@example.com', phone: '+351 912 445 870', city: 'Lisbon', qualification: 'MSc (Economics)', preferred_mode: 'Online', message: 'Need business English for client presentations. Are the groups really capped at twelve?', courses: ['business-english-workplace-communication'], status: 'contacted', priority: 'medium', days_ago: 11 },
  { name: 'Sunita Pawar', email: 'sunita.pawar@example.com', phone: '+91 98220 31145', city: 'Nashik', qualification: 'B.Ed', preferred_mode: 'Online', message: 'Teaching for six years with no formal training in lesson design. Would this be too basic?', courses: ['teaching-skills-classroom-practice'], status: 'new', priority: 'medium', days_ago: 1 },
  { name: 'Vivek Nair', email: 'vivek.nair@example.com', phone: '+91 95440 90218', city: 'Thiruvananthapuram', qualification: 'BCA', preferred_mode: 'Online', message: 'Self-taught developer. Would the full-stack course cover gaps or repeat what I know?', courses: ['full-stack-web-development', 'software-testing-qa-automation'], status: 'closed', priority: 'low', days_ago: 18 },
];

export const sampleMessages = [
  { name: 'Deepak Chawla', email: 'deepak.chawla@example.com', phone: '+91 98104 55621', subject: 'Corporate training partnership', message: 'We are an IT services firm in Noida looking to upskill about forty engineers in cloud and DevOps over the next two quarters. Could someone call me to discuss a closed cohort and whether the syllabus can be adapted to our stack?', status: 'replied', days_ago: 4 },
  { name: 'Ritu Agarwal', email: 'ritu.agarwal@example.com', phone: '+91 99718 30142', subject: 'Scholarship window for the next intake', message: 'I read that there is a merit and need scholarship twice a year. When does the next window open, and what documentation do you need from me?', status: 'new', days_ago: 1 },
  { name: 'Thomas Mathew', email: 't.mathew@example.com', phone: '+91 94470 11238', subject: 'Campus visit before enrolling', message: 'I would like to see the classroom setup and meet a trainer before committing to the classroom graphic design cohort. Are weekday visits possible?', status: 'read', days_ago: 2 },
  { name: 'Sana Pervez', email: 'sana.pervez@example.com', subject: 'Certificate reissue request', message: 'I completed the Advanced Excel course in 2024 and have lost my certificate PDF. Could you reissue it? My registered email was the same as this one.', status: 'replied', days_ago: 6 },
  { name: 'Gaurav Malhotra', email: 'gaurav.m@example.com', phone: '+91 98999 70034', subject: 'Trainer opening — finance', message: 'I am a practising CA with twelve years of experience and would be interested in teaching part time on your finance programmes. Who should I send my profile to?', status: 'new', days_ago: 0 },
];
