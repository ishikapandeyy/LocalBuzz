
import { useEffect, useState } from "react";

function MySubmissions({ onHomeClick }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/news/my-submissions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submissions");
        }

        setNews(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  const getStatusClass = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  if (loading) {
    return <div className="login-page">Loading your submissions...</div>;
  }

  return (
    <div className="login-page">
      <div className="login-card submissions-card">
        <h1>My Submissions</h1>
        <p>Track the review status of your local news.</p>

        {news.length === 0 ? (
          <p>You haven't submitted any news yet.</p>
        ) : (
          <div className="my-submissions-list">
            {news.map((item) => (
              <div className="submission-item" key={item._id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Category:</strong> {item.category}</p>

                <span className={`submission-status ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>

                {item.reviewerComment && (
                  <p>
                    <strong>Admin comment:</strong> {item.reviewerComment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={onHomeClick}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default MySubmissions;
