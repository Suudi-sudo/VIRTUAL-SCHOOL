"use client";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  return (
    <div className="position-relative min-vh-100">
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
        <div className="text-center text-white">
          <h1 className="display-4 fw-bold">Welcome to Virtual Schools</h1>
          <p className="lead">
            ONLINE LEARNING simplified in all ways by virtual schools. Find any
            school that offers your desired courses.
          </p>
          <p className="h5">
            GET A SNEAK PEEK OF WHAT ONLINE LEARNING REALLY LOOKS LIKE
          </p>
          <p>
            The decision to switch to online school is a big one—and we're here
            to help you decide what's right for your family.
          </p>
        </div>

        {/* Cards Section */}
        <div className="row mt-5">
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card bg-dark text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-3"></i>
                <h5 className="card-title">Engaging Virtual Classrooms</h5>
                <p className="card-text">
                  Live interactive sessions for enhanced learning experience
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card bg-dark text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-3"></i>
                <h5 className="card-title">Flexible Learning</h5>
                <p className="card-text">
                  Self-paced options to fit your schedule
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card bg-dark text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-3"></i>
                <h5 className="card-title">Comprehensive Support</h5>
                <p className="card-text">
                  Dedicated teachers available for guidance
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card bg-dark text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-3"></i>
                <h5 className="card-title">Safe Learning Environment</h5>
                <p className="card-text">
                  Comfortable learning from your own home
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-4">
          <button className="btn btn-primary btn-lg">GET STARTED</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
