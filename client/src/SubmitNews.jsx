
import { useState } from "react";

function SubmitNews({ onHomeClick }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Community");

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "heritage_videos");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/ohmaz5ue/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Media upload failed");
    }

    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      const imageUrl = await uploadToCloudinary(imageFile);
      const videoUrl = await uploadToCloudinary(videoFile);
      const audioUrl = await uploadToCloudinary(audioFile);

      const newsData = {
        title,
        description,
        location,
        category,
        imageUrl,
        videoUrl,
        audioUrl,
      };

      const token = localStorage.getItem("token");

const response = await fetch("https://localbuzz-1e3d.onrender.com/api/news", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(newsData),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit news");
      }

      alert("Your news has been submitted for verification!");

      setTitle("");
      setDescription("");
      setLocation("");
      setCategory("Community");
      setImageFile(null);
      setVideoFile(null);
      setAudioFile(null);
      e.target.reset();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card submit-card">
        <h1>Share Local News</h1>
        <p>Share an important update from your community.</p>

        <form onSubmit={handleSubmit}>
          <label>News Title</label>
          <input
            type="text"
            placeholder="Enter news headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength="120"
            required
          />

          <label>News Description</label>
          <textarea
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength="20"
            maxLength="1000"
            rows="5"
            required
          />

          <label>Location</label>
          <input
            type="text"
            placeholder="Enter city or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Community</option>
            <option>Education</option>
            <option>Health</option>
            <option>Sports</option>
            <option>Events</option>
            <option>Public Safety</option>
            <option>Environment</option>
            <option>Local Issues</option>
          </select>

          <label>Upload Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0] || null)}
          />

          <label>Upload Video (optional)</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0] || null)}
          />

          <label>Upload Audio (optional)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0] || null)}
          />

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit News"}
          </button>

          <button
            type="button"
            className="back-home-btn"
            onClick={onHomeClick}
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitNews;
