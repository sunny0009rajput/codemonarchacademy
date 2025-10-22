import Image from "next/image";
import Navbar from "./Navbar";
import { Container, Focus } from "lucide-react";
import FooterSection from "./FooterSection";
import AboutSection from "./AboutSection";
import FocusSection from "./FocusSection";
import AllCourses from "./AllCourses";
import Uses1 from "./CardList";

export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-black/50">
    <Navbar/>
    <AllCourses/>
    <Uses1/>
    
    <FocusSection/>
    <AboutSection/>
    <FooterSection/>
    </div>
    
    </>
  );
}
