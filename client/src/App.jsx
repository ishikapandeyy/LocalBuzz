
import { useState } from "react";
import AdminPanel from "./AdminPanel";
import NewsFeed from "./components/NewsFeed";
import Login from "./Login";
import Register from "./Register";
import SubmitNews from "./SubmitNews";
import MySubmissions from "./MySubmissions";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = () => {
    const savedUser = localStorage.getItem("user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
    alert("You have logged out successfully!");
  };

  return (
    <>
      {page === "home" && (
        <>
          <div className="user-bar">
            {user ? (
              <>
                <span>Welcome, {user.name}!</span>

                <button onClick={() => setPage("my-submissions")}>
                  My Submissions
                </button>

                <button onClick={() => setPage("submit")}>
                  Submit News
                </button>

                {user.role === "admin" && (
                  <button onClick={() => setPage("admin")}>
                    Admin Panel
                  </button>
                )}

                <button onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <span>Welcome to LocalBuzz!</span>
            )}
          </div>

          <NewsFeed
            onLoginClick={() => setPage("login")}
            onRegisterClick={() => setPage("register")}
            onSubmitNewsClick={() => {
              if (user) {
                setPage("submit");
              } else {
                alert("Please login first to submit news!");
                setPage("login");
              }
            }}
            onMySubmissionsClick={() => {
              if (user) {
                setPage("my-submissions");
              } else {
                alert("Please login first!");
                setPage("login");
              }
            }}
          />
        </>
      )}

      {page === "login" && (
        <Login
          onRegisterClick={() => setPage("register")}
          onHomeClick={() => setPage("home")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {page === "register" && (
        <Register
          onLoginClick={() => setPage("login")}
          onHomeClick={() => setPage("home")}
        />
      )}

      {page === "submit" && user && (
        <SubmitNews onHomeClick={() => setPage("home")} />
      )}

      {page === "my-submissions" && user && (
        <MySubmissions onHomeClick={() => setPage("home")} />
      )}

      {page === "admin" && user?.role === "admin" && (
        <AdminPanel onHomeClick={() => setPage("home")} />
      )}

      {page === "admin" && user?.role !== "admin" && (
        <div className="login-page">
          <div className="login-card">
            <h2>Access Denied</h2>
            <p>Only administrators can access this page.</p>
            <button onClick={() => setPage("home")}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
