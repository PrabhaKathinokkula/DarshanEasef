const StarRating = ({ value, onChange, readOnly = false }) => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`star-btn ${star <= value ? "active" : ""}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          disabled={readOnly}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
