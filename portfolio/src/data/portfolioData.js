// ============================================================
// PORTFOLIO DATA — Edit this file to update all your content
// ============================================================

export const personalInfo = {
  name: "Anand Sagar",
  tagline: "AI / ML • Robotics • Computer Vision • Reinforcement Learning",
  heroSubtitle: "Building intelligent systems that connect AI with the real world.",
  email: "anndsagar19759@gmail.com",
  github: "https://github.com/anand",
  linkedin: "https://linkedin.com/in/anand",
  twitter: "https://twitter.com/anand",
  resumeUrl: "#", // Replace with actual resume URL or file path
};

export const stats = [
  { label: "Projects", value: 12, color: "cyan" },
  { label: "Achievements", value: 8, color: "orange" },
  { label: "Certificates", value: 25, color: "green" },
  { label: "Technologies", value: 30, color: "purple" },
];

export const aboutText = `I'm a passionate technologist working at the intersection of Artificial Intelligence, 
Robotics, and Computer Vision. My work spans from training reinforcement learning agents 
for quadruped robots to building real-time object detection systems.

I believe in building systems that don't just process data — they understand and interact 
with the physical world. Currently focused on bridging the gap between simulation and 
real-world deployment of intelligent robotic systems.`;

export const interests = [
  "Reinforcement Learning",
  "Computer Vision",
  "Robotics",
  "Deep Learning",
  "Sim-to-Real Transfer",
  "Autonomous Systems",
];

export const skills = [
  {
    category: "AI / Machine Learning",
    color: "cyan",
    icon: "🧠",
    items: ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "YOLO", "Reinforcement Learning", "OpenCV", "Hugging Face"],
  },
  {
    category: "Robotics",
    color: "orange",
    icon: "🤖",
    items: ["ROS / ROS2", "MuJoCo", "Unitree Go2", "Gazebo", "URDF", "Kinematics", "Sim2Real", "Isaac Gym"],
  },
  {
    category: "Development",
    color: "green",
    icon: "💻",
    items: ["Python", "C / C++", "JavaScript", "HTML / CSS", "React", "Node.js", "REST APIs", "SQL"],
  },
  {
    category: "Tools & Platforms",
    color: "purple",
    icon: "🔧",
    items: ["Git / GitHub", "Linux", "Docker", "AWS", "Google Cloud", "VS Code", "Jupyter", "Weights & Biases"],
  },
];

export const projects = [
  {
    title: "Quadruped Robot RL Controller",
    description: "Trained a reinforcement learning policy for a Unitree Go2 quadruped robot using PPO in MuJoCo. Achieved stable locomotion on rough terrain with sim-to-real transfer.",
    tech: ["Python", "PyTorch", "MuJoCo", "RL", "Isaac Gym"],
    github: "https://github.com/anand/quadruped-rl",
    live: "",
    color: "cyan",
  },
  {
    title: "Real-Time Object Detection System",
    description: "Built a real-time object detection pipeline using YOLOv8 with custom-trained models for industrial quality inspection. Achieved 97% mAP on custom dataset.",
    tech: ["Python", "YOLOv8", "OpenCV", "TensorRT", "CUDA"],
    github: "https://github.com/anand/yolo-inspector",
    live: "",
    color: "orange",
  },
  {
    title: "Autonomous Navigation Stack",
    description: "Developed a complete autonomous navigation stack using ROS2 with SLAM, path planning, and obstacle avoidance for indoor mobile robots.",
    tech: ["ROS2", "C++", "Python", "SLAM", "Nav2"],
    github: "https://github.com/anand/auto-nav",
    live: "",
    color: "green",
  },
  {
    title: "Gesture-Controlled Drone",
    description: "Computer vision pipeline for real-time hand gesture recognition to control a DJI Tello drone. Uses MediaPipe for hand tracking and custom gesture classifier.",
    tech: ["Python", "MediaPipe", "OpenCV", "TensorFlow Lite"],
    github: "https://github.com/anand/gesture-drone",
    live: "",
    color: "purple",
  },
  {
    title: "AI-Powered Portfolio Analyzer",
    description: "Machine learning system that analyzes stock portfolios and predicts risk metrics using ensemble methods. Includes interactive dashboard for visualization.",
    tech: ["Python", "Scikit-learn", "Streamlit", "Pandas"],
    github: "https://github.com/anand/portfolio-ai",
    live: "",
    color: "red",
  },
  {
    title: "Multi-Agent Coordination System",
    description: "Implemented decentralized multi-agent coordination using MAPPO for warehouse robot fleet management. Tested in custom OpenAI Gym environment.",
    tech: ["Python", "PyTorch", "OpenAI Gym", "MAPPO"],
    github: "https://github.com/anand/multi-agent",
    live: "",
    color: "cyan",
  },
];

export const achievements = [
  {
    year: "2026",
    title: "National Robotics Competition — 1st Place",
    description: "Won first place in the autonomous robotics challenge with a custom RL-based navigation system.",
    badge: "🏆",
  },
  {
    year: "2026",
    title: "Research Paper Published — IEEE",
    description: "Published paper on sim-to-real transfer for quadruped locomotion at IEEE ICRA conference.",
    badge: "📄",
  },
  {
    year: "2025",
    title: "AI Hackathon Winner — Smart India Hackathon",
    description: "Developed an AI-powered crop disease detection system that won the national hackathon.",
    badge: "🥇",
  },
  {
    year: "2025",
    title: "Open Source Contributor — Top 5%",
    description: "Recognized as a top contributor to major open-source robotics and ML projects on GitHub.",
    badge: "⭐",
  },
  {
    year: "2024",
    title: "Dean's List — Academic Excellence",
    description: "Achieved Dean's List recognition for outstanding academic performance in Computer Science.",
    badge: "🎓",
  },
  {
    year: "2024",
    title: "ML Workshop — Lead Instructor",
    description: "Conducted a 3-day machine learning workshop for 200+ students at the university tech fest.",
    badge: "🎖️",
  },
];

export const certificates = [
  {
    title: "Deep Learning Specialization",
    issuer: "Coursera / DeepLearning.AI",
    date: "2025",
    category: "AI/ML",
    color: "cyan",
  },
  {
    title: "Reinforcement Learning Specialization",
    issuer: "Coursera / University of Alberta",
    date: "2025",
    category: "AI/ML",
    color: "cyan",
  },
  {
    title: "ROS2 for Beginners to Advanced",
    issuer: "Udemy",
    date: "2025",
    category: "Robotics",
    color: "orange",
  },
  {
    title: "Computer Vision with OpenCV & Deep Learning",
    issuer: "Udacity",
    date: "2025",
    category: "AI/ML",
    color: "cyan",
  },
  {
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2024",
    category: "Cloud",
    color: "purple",
  },
  {
    title: "Google TensorFlow Developer Certificate",
    issuer: "Google",
    date: "2024",
    category: "AI/ML",
    color: "cyan",
  },
  {
    title: "NVIDIA Deep Learning Institute — Fundamentals",
    issuer: "NVIDIA",
    date: "2024",
    category: "AI/ML",
    color: "green",
  },
  {
    title: "Python for Data Science & Machine Learning",
    issuer: "Coursera / IBM",
    date: "2024",
    category: "Programming",
    color: "green",
  },
  {
    title: "Docker & Kubernetes Fundamentals",
    issuer: "Linux Foundation",
    date: "2024",
    category: "Cloud",
    color: "purple",
  },
  {
    title: "Advanced C++ Programming",
    issuer: "Udemy",
    date: "2023",
    category: "Programming",
    color: "green",
  },
  {
    title: "Embedded Systems & IoT",
    issuer: "Coursera / University of Colorado",
    date: "2023",
    category: "Robotics",
    color: "orange",
  },
  {
    title: "Google Cloud Associate Engineer",
    issuer: "Google Cloud",
    date: "2023",
    category: "Cloud",
    color: "purple",
  },
];

export const education = [
  {
    degree: "B.Tech in Computer Science & Engineering",
    institution: "Indian Institute of Technology",
    duration: "2022 — 2026",
    description: "Specialization in Artificial Intelligence and Robotics. Coursework includes Machine Learning, Computer Vision, Reinforcement Learning, Robotics, and Advanced Algorithms.",
    relevantCourses: [
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Reinforcement Learning",
      "Robotics",
      "Data Structures & Algorithms",
      "Probability & Statistics",
    ],
  },
];

export const experience = [
  {
    role: "Robotics Research Intern",
    company: "NVIDIA Research Lab",
    duration: "May 2025 — Aug 2025",
    description: "Worked on sim-to-real transfer for robotic manipulation using Isaac Gym. Developed domain randomization strategies that improved transfer success rate by 40%.",
    tech: ["Isaac Gym", "PyTorch", "Python", "ROS2"],
  },
  {
    role: "Machine Learning Intern",
    company: "Google AI India",
    duration: "Jun 2024 — Aug 2024",
    description: "Developed and optimized computer vision models for real-time video analysis. Contributed to an internal tool that reduced model inference latency by 35%.",
    tech: ["TensorFlow", "Python", "GCP", "Computer Vision"],
  },
  {
    role: "Open Source Developer",
    company: "ROS2 Community",
    duration: "2023 — Present",
    description: "Active contributor to ROS2 navigation and perception packages. Merged 15+ pull requests improving documentation, bug fixes, and new features.",
    tech: ["C++", "Python", "ROS2", "CMake"],
  },
];

export const certCategories = ["All", "AI/ML", "Robotics", "Programming", "Cloud"];
