"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  // Dark gradient backgrounds for the main 4 cards
  const mainCards = [
    {
      title: "Engaging Virtual Classrooms",
      text: "Live interactive sessions for enhanced learning experience",
      gradient: "linear-gradient(to bottom right, #3b3b3b, #2a2a2a)",
    },
    {
      title: "Flexible Learning",
      text: "Self-paced options to fit your schedule",
      gradient: "linear-gradient(to bottom right, #3b3b3b, #2a2a2a)",
    },
    {
      title: "Comprehensive Support",
      text: "Dedicated teachers available for guidance",
      gradient: "linear-gradient(to bottom right, #3b3b3b, #2a2a2a)",
    },
    {
      title: "Safe Learning Environment",
      text: "Study from the comfort and security of your home",
      gradient: "linear-gradient(to bottom right, #3b3b3b, #2a2a2a)",
    },
  ];

  // Dark gradient backgrounds for “Why Choose Us?” cards
  const whyCards = [
    {
      icon: "fas fa-star me-2 text-warning",
      title: "Personalized Learning",
      text: "Tailor your education to your unique goals",
      gradient: "linear-gradient(to bottom right, #3c3c3c, #2a2a2a)",
    },
    {
      icon: "fas fa-star me-2 text-warning",
      title: "Expert Instructors",
      text: "Learn from certified, passionate educators",
      gradient: "linear-gradient(to bottom right, #3c3c3c, #2a2a2a)",
    },
    {
      icon: "fas fa-star me-2 text-warning",
      title: "Interactive Tools",
      text: "Engage with peers via chat, forums, and group projects",
      gradient: "linear-gradient(to bottom right, #3c3c3c, #2a2a2a)",
    },
    {
      icon: "fas fa-star me-2 text-warning",
      title: "Global Community",
      text: "Connect with students worldwide for a richer perspective",
      gradient: "linear-gradient(to bottom right, #3c3c3c, #2a2a2a)",
    },
    {
      icon: "fas fa-star me-2 text-warning",
      title: "Seamless Tech",
      text: "Our platform is user-friendly and accessible on any device",
      gradient: "linear-gradient(to bottom right, #3c3c3c, #2a2a2a)",
    },
  ];

  return (
    <div className="position-relative min-vh-100">
      <Navbar />

      {/* Background Image with Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="position-relative container py-5" style={{ zIndex: 1 }}>
        {/* Hero / Intro Section */}
        <div className="text-center text-white">
          <h1 className="display-4 fw-bold">Welcome to Virtual Schools</h1>
          <p className="lead">
            <strong>Empower your education</strong> with flexible, engaging online learning.
            At Virtual Schools, we bring the classroom to you—wherever you are.
          </p>
          <p className="h5">GET A SNEAK PEEK OF WHAT ONLINE LEARNING REALLY LOOKS LIKE</p>
          <p>
            The decision to switch to online school is a big one—and we're here
            to help you decide what's right for your family. Experience
            <strong> real-time</strong> lessons with expert educators, interactive
            courseware, and a supportive online community, all from the comfort
            of your own home.
          </p>
          <p>
            <strong>Your journey</strong> to a dynamic and personalized learning environment
            begins here.
          </p>
        </div>

        {/* Cards Section */}
        <div className="row mt-5">
          {mainCards.map((card, index) => (
            <div key={index} className="col-md-6 col-lg-3 mb-4">
              <div
                className="card text-white h-100 border-0 shadow"
                style={{
                  background: card.gradient,
                  borderRadius: "0.75rem",
                }}
              >
                <div className="card-body text-center">
                  <i className="fas fa-check-circle fa-2x mb-3"></i>
                  <h5 className="card-title fw-bold">{card.title}</h5>
                  <p className="card-text">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Us? */}
        <div className="text-white mt-5">
          <h2 className="text-center fw-bold mb-4">Why Choose Us?</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3">
            {whyCards.map((item, idx) => (
              <div key={idx} className="col">
                
                <div
                  className="card text-white border-0 shadow h-100 d-flex flex-column"
                  style={{
                    background: item.gradient,
                    borderRadius: "0.75rem",
                  }}
                >
                  <div className="card-body text-center d-flex flex-column justify-content-center">
                    <div className="mb-2">
                      <i className={item.icon}></i>
                      <strong>{item.title}</strong>
                    </div>
                    <p className="mb-0">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="text-white mt-5">
          <h2 className="text-center fw-bold mb-4">What Our Students Say</h2>
          <div className="row">
            {[
              {
                name: "Alex Johnson",
                quote:
                  "Virtual Schools has transformed the way I learn. The flexibility and support are unmatched!",
              },
              {
                name: "Sarah Lee",
                quote:
                  "I love the interactive classes and the ability to learn at my own pace. Highly recommended!",
              },
              {
                name: "Michael Green",
                quote:
                  "The best part is connecting with classmates from around the globe—it's truly a diverse experience.",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="col-md-4 mb-4">
                <div
                  className="card bg-dark text-white border-0 h-100 shadow"
                  style={{ borderRadius: "0.75rem" }}
                >
                  <div className="card-body">
                    <blockquote className="blockquote mb-0">
                      <p>{testimonial.quote}</p>
                      <footer className="blockquote-footer text-white">
                        <cite title="Source Title">{testimonial.name}</cite>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Approach Section */}
        <div
          className="text-white mt-5 p-4 rounded-4 shadow"
          style={{
            background: "linear-gradient(135deg, #2b2b2b 0%, #1b1b1b 100%)",
          }}
        >
          <h2 className="text-center fw-bold mb-4">Our Approach</h2>
          <div className="row justify-content-center">
            <div className="col-md-10">
              <p className="fs-5">
                At Virtual Schools, we believe in a holistic approach to online
                education—one that balances interactive technology, personalized
                mentoring, and community engagement. Our dedicated staff of
                educators collaborate with students to set clear learning goals,
                track progress, and celebrate milestones.
              </p>
              <p className="fs-5">
                We continuously evolve our curriculum to reflect the latest
                advancements in e-learning, ensuring that every learner has
                access to cutting-edge resources. From live webinars to
                asynchronous discussion boards, our platform accommodates
                diverse learning styles and fosters a sense of belonging.
              </p>
              <p className="fs-5">
                Ultimately, our mission is to empower students of all ages to
                become active participants in their own education, developing
                not just subject-matter expertise but also the confidence and
                critical thinking skills needed to thrive in a fast-changing
                world.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary btn-lg px-4 py-3"
            onClick={() => navigate("/register")}
          >
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
