import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Task.css";

const API_URL =import.meta.env.VITE_API_URL;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please check your backend connection.");
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task. Please try again.");
      console.error("Delete error:", err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/${task._id}`, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
    } catch (err) {
      alert("Failed to update task. Please try again.");
      console.error("Update error:", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (statusFilter === "completed" && !task.completed) return false;
    if (statusFilter === "pending" && task.completed) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ff6b6b";
      case "medium": return "#ffd166";
      case "low": return "#06d6a0";
      default: return "#118ab2";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };
  const formatDate = (date) => {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString();
};


  return (
    <div className="tasks-container">
      <main className="tasks-main">
        <div className="controls-section">
          <button 
            className="btn-add-task"
            onClick={() => navigate("/tasks/add")}
          >
            <span className="btn-icon">+</span> Add New Task
          </button>

          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Priority:</label>
              <div className="priority-filters">
                {["all", "low", "medium", "high"].map(priority => (
                  <button
                    key={priority}
                    className={`priority-filter-btn ${priorityFilter === priority ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: priority === 'all' ? '#f1f5f9' : getPriorityColor(priority),
                      color: priority === 'all' ? '#64748b' : 'white'
                    }}
                    onClick={() => setPriorityFilter(priority)}
                  >
                    {priority === 'all' ? 'All' : getPriorityIcon(priority) + ' ' + priority}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button className="btn-retry" onClick={fetchTasks}>Try Again</button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>You're all caught up! Or try changing your filters.</p>
            <button 
              className="btn-add-task empty-btn"
              onClick={() => navigate("/tasks/add")}
            >
              Add Your First Task
            </button>
          </div>
        ) : (
          <>
            <div className="tasks-summary">
              <p>Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks</p>
              <div className="summary-stats">
                <span className="stat-item pending-stat">
                  <span className="stat-count">{tasks.filter(t => !t.completed).length}</span> Pending
                </span>
                <span className="stat-item completed-stat">
                  <span className="stat-count">{tasks.filter(t => t.completed).length}</span> Completed
                </span>
              </div>
            </div>

            <div className="tasks-grid">
              {filteredTasks.map(task => (
                <div 
                  key={task._id} 
                  className={`task-card ${task.completed ? 'completed' : ''}`}
                  style={{ borderLeftColor: getPriorityColor(task.priority) }}
                >
                  <div className="task-header">
                    <div className="task-title-section">
                      <button 
                        className="complete-checkbox"
                        onClick={() => toggleComplete(task)}
                      >
                        {task.completed ? (
                          <span className="checked-icon">✓</span>
                        ) : (
                          <span className="unchecked-icon"></span>
                        )}
                      </button>
                      <h3 className="task-title">{task.title}</h3>
                    </div>
                    
                    <div className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </div>
                  </div>
                  
                  <p className="task-description">{task.description}</p>
                  <p className="task-due-date">📅 Due: <strong>{formatDate(task.dueDate)}</strong></p>
                  
                  <div className="task-footer">
                    <div className="task-status">
                      <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="task-actions">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/tasks/add?edit=${task._id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Tasks;
