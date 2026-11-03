
import { useEffect, useState } from "react";

function AdminPanel({ onHomeClick }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalNews = news.length;
  const pendingNews = news.filter((item) => item.status === "pending").length;
  const approvedNews = news.filter((item) => item.status === "approved").length;
  const rejectedNews = news.filter((item) => item.status === "rejected").length;

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/news/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch submitted news");
      }

      setNews(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    const reviewerComment = window.prompt(
      `Enter a review comment for this ${status} submission:`
    );

    if (reviewerComment === null) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/news/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            reviewerComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      alert(data.message);
      fetchNews();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="login-page">
      <div className="login-card admin-card">
        <button
          type="button"
          className="back-home-btn"
          onClick={onHomeClick}
        >
          ← Back to Home
        </button>

        <h1>Admin Moderation Panel</h1>
        <p>Review and manage community news submissions.</p>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total News</h3>
            <h2>{totalNews}</h2>
          </div>

          <div className="stat-card pending-stat">
            <h3>Pending</h3>
            <h2>{pendingNews}</h2>
          </div>

          <div className="stat-card approved-stat">
            <h3>Approved</h3>
            <h2>{approvedNews}</h2>
          </div>

          <div className="stat-card rejected-stat">
            <h3>Rejected</h3>
            <h2>{rejectedNews}</h2>
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading submissions...</p>
        ) : news.length === 0 ? (
          <p className="empty-message">No news submissions found.</p>
        ) : (
          <div className="admin-news-list">
            {news.map((item) => (
              <div className="admin-news-item" key={item._id}>
                <span className="news-category">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="news-meta">📍 {item.location}</div>

                <span className={`status ${item.status}`}>
                  {item.status}
                </span>

                {item.reviewerComment && (
                  <p className="reviewer-comment">
                    <strong>Review comment:</strong>{" "}
                    {item.reviewerComment}
                  </p>
                )}

                <div className="admin-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleStatusUpdate(item._id, "approved")}
                    disabled={item.status !== "pending"}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => handleStatusUpdate(item._id, "rejected")}
                    disabled={item.status !== "pending"}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
