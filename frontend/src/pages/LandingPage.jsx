import React from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  Calendar,
  Upload,
  Users,
  FileText,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background image layer (subtle, centered, smaller) */}
      <div
        className="absolute inset-0 flex items-start justify-center pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* dark overlay to ensure readability */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0.62))",
          }}
        />
      </div>

      {/* Foreground content (z-10 to be on top of bg) */}
      <div className="relative z-10">
        {/* Navbar */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-gray-700 cursor-default select-none">
          <h1 className="text-2xl font-bold tracking-wide text-indigo-400 ">
            TimeTableGen
          </h1>
          <nav className="space-x-6 hidden md:flex">
            <a href="#features" className="hover:text-indigo-400">
              Features
            </a>
            <a href="#how" className="hover:text-indigo-400">
              How It Works
            </a>
            <a href="#contact" className="hover:text-indigo-400">
              Contact
            </a>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 px-6 cursor-default select-none">
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight ">
            Smart <span className="text-indigo-400">Timetable Generator</span>
          </h2>
          <p className="max-w-2xl text-lg text-gray-300 mb-8">
            Build optimized and conflict-free timetables in minutes. Save time,
            reduce errors, and make scheduling effortless.
          </p>
          <div className="space-x-4">
            <Button
              className="bg-indigo-500 px-6 py-3 text-lg"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
            <Button
              className="border border-indigo-400 text-indigo-400 px-6 py-3 text-lg bg-transparent"
              onClick={() => {
                const section = document.getElementById("how");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-20 px-10 cursor-default select-none"
        >
          <h3 className="text-3xl font-bold text-center mb-14 ">
            Why Choose TimeTableGen?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <Calendar className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Auto Scheduling</h4>
              <p className="text-gray-400 text-sm">
                AI-powered system generates timetables without conflicts.
              </p>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <Upload className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Bulk Data Upload</h4>
              <p className="text-gray-400 text-sm">
                Import faculty, subjects & rooms with simple CSV/XLSX files.
              </p>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <Users className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Role-based Access</h4>
              <p className="text-gray-400 text-sm">
                Different dashboards for Admin, Faculty & Students.
              </p>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <FileText className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Export Options</h4>
              <p className="text-gray-400 text-sm">
                Download timetables as PDF or CSV for easy sharing.
              </p>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <ShieldCheck className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Secure System</h4>
              <p className="text-gray-400 text-sm">
                Data privacy ensured with secure authentication & access
                control.
              </p>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center p-6">
              <Share2 className="mx-auto text-indigo-400 mb-4" size={40} />
              <h4 className="font-semibold text-lg mb-2">Easy Sharing</h4>
              <p className="text-gray-400 text-sm">
                Share generated timetables instantly with all stakeholders.
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how"
          className="relative py-20 px-10 center cursor-default select-none"
        >
          {/* Foreground Content */}
          <h3 className="text-3xl font-bold text-center mb-14 relative z-10">
            How It Works
          </h3>
          <div className="max-w-4xl mx-auto text-gray-300 space-y-6 text-lg relative z-10">
            <p>1️⃣ Upload your dataset (faculty, subjects, rooms, batches).</p>
            <p>
              2️⃣ Click on{" "}
              <span className="text-indigo-400">Generate Timetable</span>.
            </p>
            <p>
              3️⃣ Our system processes everything and builds a conflict-free
              schedule.
            </p>
            <p>
              4️⃣ View schedules on the dashboard and filter by
              class/faculty/room.
            </p>
            <p>5️⃣ Export in PDF or CSV format and share with your institute.</p>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="py-10 text-center border-t border-gray-700 cursor-default select-none"
        >
          <p className="text-gray-400">
            © {new Date().getFullYear()} TimeTableGen. All Rights Reserved.
          </p>
          <p className="mt-2 text-gray-500">
            Contact: support@timetablegen.com
          </p>
        </footer>
      </div>
    </div>
  );
}
