import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AddTask.css";

const API_URL = import.meta.env.VITE_API_URL;


const AddTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const taskId = searchParams.get("edit");
  const isEditMode = !!taskId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    completed: false
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && taskId) {
      fetchTaskData();
    }
  }, [taskId, isEditMode]);

  const fetchTaskData = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API_URL}/${taskId}`);
      const task = response.data;
      setFormData({ title: task.title || "",
          description: task.description || "",
          priority: task.priority || "medium",
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
          completed: task.completed || false
});

      setError("");
    } catch (err) {
      setError("Failed to load task data. Please check your backend connection.");
      console.error("Fetch task error:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "completed" ? e.target.checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (isEditMode && taskId) {
        await axios.put(`${API_URL}/${taskId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      navigate("/tasks");
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      (isEditMode ? "Failed to update task" : "Failed to add task");
      setError(`${errorMsg}. Please try again.`);
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ff6b6b";
      case "medium": return "#ffd166";
      case "low": return "#06d6a0";
      default: return "#118ab2";
    }
  };

  if (fetching) {
    return (
      <div className="add-task-container">
        <div className="add-task-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-task-container">
      <div className="add-task-card">
        <div className="add-task-header">
          <h1 className="add-task-title">
            <span className="add-task-icon">
              {isEditMode ? "✏️" : "➕"}
            </span>
            {isEditMode ? "Edit Task" : "Add New Task"}
          </h1>
          <p className="add-task-subtitle">
            {isEditMode 
              ? "Update the task details below" 
              : "Fill in the details below to create a new task"}
          </p>
        </div>

        {error && (
          <div className="form-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-task-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Task Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              pattern="[A-Za-z  ]{4,}"
              title="Only Alphabet Min length:4"
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description" required pattern="[A-Za-z\d!@#$%^   ]{6,}" title="Min Length 6 "
              placeholder="Enter task description (optional)"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              disabled={loading}
            />
            <div className="char-count">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <div className="priority-options">
                {["low", "medium", "high"].map((priority) => (
                  <label 
                    key={priority}
                    className={`priority-option ${formData.priority === priority ? 'selected' : ''}`}
                    style={{ 
                      borderColor: formData.priority === priority ? getPriorityColor(priority) : '#e2e8f0',
                      backgroundColor: formData.priority === priority ? `${getPriorityColor(priority)}15` : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={handleChange}
                      disabled={loading}
                      className="priority-radio"
                    />
                    <div className="priority-content">
                      <span 
                        className="priority-dot" 
                        style={{ backgroundColor: getPriorityColor(priority) }}
                      />
                      <span className="priority-text">{priority}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-toggle">
                <button
                  type="button"
                  className={`status-btn ${!formData.completed ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, completed: false})}
                  disabled={loading}
                >
                  <span className="status-indicator pending"></span>
                  Pending
                </button>
                <button
                  type="button"
                  className={`status-btn ${formData.completed ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, completed: true})}
                  disabled={loading}
                >
                  <span className="status-indicator completed"></span>
                  Completed
                </button>
              </div>
            </div>
                <div>
                    <label >Due Date*   </label>
                   <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required/>

                </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  {isEditMode ? "Updating..." : "Adding Task..."}
                </>
              ) : (
                <>
                  <span className="submit-icon">{isEditMode ? "✓" : "+"}</span>
                  {isEditMode ? "Update Task" : "Add Task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
