import React, { createContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Create UserContext
export const UserContext = createContext();

const Register = () => {

                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                    Register Now 🚀
                  </button>
                </form>

                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-light btn-lg w-100 d-flex align-items-center justify-content-center"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="me-2"
                    style={{ width: "20px", height: "20px" }}
                  />
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export default Register;
