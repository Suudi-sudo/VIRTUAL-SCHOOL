import { createContext, useState } from "react";

// Create UserContext
export const UserContext = createContext();

const Register = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "student",
    });
    const [message, setMessage] = useState("");

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Reset message

        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
                setMessage("Registration successful! You can now login.");
            } else {
                setMessage(data.msg);
            }
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }
    };

    // Handle Google login
    const handleGoogleLogin = () => {
        window.location.href = "http://127.0.0.1:5000/authorize_google";
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30">
                    <h2 className="text-3xl font-bold text-white text-center mb-6">
                        Create an Account
                    </h2>

                    {message && (
                        <p className="text-center text-green-300 mb-4">
                            {message}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-white text-sm font-semibold mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border-none focus:ring-4 focus:ring-blue-300 bg-white/80 text-gray-800 placeholder-gray-600"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-semibold mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border-none focus:ring-4 focus:ring-blue-300 bg-white/80 text-gray-800 placeholder-gray-600"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-semibold mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}cd
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg border-none focus:ring-4 focus:ring-blue-300 bg-white/80 text-gray-800 placeholder-gray-600"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-semibold mb-1">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border-none focus:ring-4 focus:ring-blue-300 bg-white/80 text-gray-800"
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition duration-300"
                        >
                            Register Now 🚀
                        </button>
                    </form>

                    <div className="flex items-center justify-center my-6">
                        <div className="border-t border-white/30 flex-grow"></div>
                        <span className="mx-4 text-white">OR</span>
                        <div className="border-t border-white/30 flex-grow"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Continue with Google
                    </button>
                </div>
            </div>
        </UserContext.Provider>
    );
};

export default Register;