import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitFeedback } from "../services/adminService";
import StarRating from "../components/StarRating";

const Feedback = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitFeedback({ temple: templeId, rating, comment });
      navigate(`/temples/${templeId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <h2 className="section-title">Temple Feedback</h2>
      <div className="card card-pad" style={{ maxWidth: 460, margin: "0 auto" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
