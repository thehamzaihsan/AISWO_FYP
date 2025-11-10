import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MOTIVATION_MESSAGES = [
  "Great work! Every empty bin keeps the city cleaner.",
  "You're making a visible impact today — keep the momentum going!",
  "Small actions add up. Thanks for staying on top of your route!",
  "Consistency matters. 👊 You've got this!",
];

const TASK_PRESETS = [
  { id: "inspect", label: "Inspect assigned bins within your zone" },
  { id: "report", label: "Report any hardware or location issues" },
  { id: "confirm-empty", label: "Confirm bins emptied after collection" },
];

const getDefaultTasks = () =>
  TASK_PRESETS.map((task) => ({
    ...task,
    completed: false,
  }));

function getStatusDetails(fillPct = 0) {
  if (fillPct > 80) return { label: "Critical", tone: "danger", emoji: "🚨" };
  if (fillPct > 60) return { label: "Warning", tone: "warning", emoji: "⚠️" };
  return { label: "Normal", tone: "normal", emoji: "✅" };
}

function EmployeeDashboard({ user }) {
  const displayName = "Osama Khan";
  const [assignedIds, setAssignedIds] = useState(user?.assignedBins || []);
  const [bins, setBins] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [issueForm, setIssueForm] = useState({
    binId: "",
    issue: "",
    description: "",
  });
  const [issueStatus, setIssueStatus] = useState(null);
  const [completedBins, setCompletedBins] = useState([]);
  const [tasks, setTasks] = useState(() => getDefaultTasks());
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);
  const [progressMessage, setProgressMessage] = useState(null);
  const operatorId = user?.operatorId || null;
  const assignedIdsRef = useRef([]);
  const hasLoadedAssignments = useRef(false);

  // Derived data ------------------------------------------------------------
  const assignedEntries = useMemo(() => {
    return assignedIds
      .map((id) => [id, bins[id]])
      .filter(([, value]) => Boolean(value));
  }, [assignedIds, bins]);

  const completionRate = useMemo(() => {
    if (!assignedIds.length) return 0;
    const completedCount = assignedIds.filter((id) =>
      completedBins.includes(id)
    ).length;
    return Math.round((completedCount / assignedIds.length) * 100);
  }, [assignedIds, completedBins]);

  const motivation = useMemo(() => {
    if (completionRate === 100) return "Outstanding! All bins cleared today. 🎉";
    if (completionRate >= 60) return MOTIVATION_MESSAGES[0];
    if (completionRate >= 30) return MOTIVATION_MESSAGES[1];
    return MOTIVATION_MESSAGES[2];
  }, [completionRate]);

  const criticalCount = useMemo(
    () =>
      assignedEntries.filter(([, bin]) => (bin?.fillPct || 0) > 80).length,
    [assignedEntries]
  );

  const warningCount = useMemo(
    () =>
      assignedEntries.filter(
        ([, bin]) => (bin?.fillPct || 0) > 60 && (bin?.fillPct || 0) <= 80
      ).length,
    [assignedEntries]
  );

  useEffect(() => {
    hasLoadedAssignments.current = false;
  }, [operatorId, user?.assignedBins]);

  // Helpers -----------------------------------------------------------------
  const refreshProgress = useCallback(
    async (operatorId) => {
      if (!operatorId) {
        setTasks(getDefaultTasks());
        setTasksLoading(false);
        setTasksError(null);
        setCompletedBins([]);
        return;
      }

      setTasksLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/operators/${operatorId}/progress`
        );
        if (!response.ok) {
          throw new Error(`Failed to load progress (${response.status})`);
        }

        const data = await response.json();
        setCompletedBins(Array.isArray(data.completedBins) ? data.completedBins : []);

        if (Array.isArray(data.tasks) && data.tasks.length) {
          setTasks(
            data.tasks.map((task) => ({
              id: task.id,
              label: task.label,
              completed: Boolean(task.completed),
            }))
          );
        } else {
          setTasks(getDefaultTasks());
        }

        setTasksError(null);
      } catch (error) {
        console.error("Error fetching operator progress:", error);
        setTasksError("Unable to load your checklist from the server.");
        setTasks(getDefaultTasks());
      } finally {
        setTasksLoading(false);
      }
    },
    []
  );

  const refreshBins = useCallback(
    async (ids, showSpinner = false) => {
      const targetIds = ids && ids.length ? ids : assignedIdsRef.current;
      if (!targetIds.length) {
        setBins({});
        setLoading(false);
        return;
      }

      if (showSpinner) setRefreshing(true);

      try {
        const response = await fetch("http://localhost:5000/bins");
        if (!response.ok) {
          throw new Error(`Failed to load bins (${response.status})`);
        }
        const data = await response.json();
        const filtered = {};
        targetIds.forEach((id) => {
          if (data[id]) {
            filtered[id] = data[id];
          }
        });

        setBins(filtered);
        setLastUpdated(new Date().toISOString());
        setError(null);

        if (targetIds.length) {
          setIssueForm((prev) => (prev.binId ? prev : { ...prev, binId: targetIds[0] }));
        }
      } catch (fetchError) {
        console.error("Error fetching assigned bins:", fetchError);
        setError("Unable to load bin data. Please check your connection or contact an admin.");
      } finally {
        setLoading(false);
        if (showSpinner) setRefreshing(false);
      }
    },
    []
  );

  const loadAssignments = useCallback(async (options = {}) => {
    const showLoader = options.force || !hasLoadedAssignments.current;
    if (showLoader) {
      setLoading(true);
    }

    try {
      let ids = user?.assignedBins || [];

      if (operatorId) {
        const operatorRes = await fetch(
          `http://localhost:5000/operators/${operatorId}`
        );
        if (operatorRes.ok) {
          const operatorData = await operatorRes.json();
          ids = operatorData.assignedBins || ids;
        }
      }

      // Remove duplicates
      const uniqueIds = Array.from(new Set(ids));
      setAssignedIds((prev) => {
        const isSame =
          prev.length === uniqueIds.length &&
          prev.every((value, index) => value === uniqueIds[index]);
        if (isSame) {
          assignedIdsRef.current = prev;
          return prev;
        }
        assignedIdsRef.current = uniqueIds;
        return uniqueIds;
      });
      await refreshBins(uniqueIds);
      await refreshProgress(operatorId);
    } catch (assignmentError) {
      console.error("Error loading operator assignments:", assignmentError);
      setAssignedIds([]);
      setBins({});
      setError(
        "We couldn't load your assigned bins. Please retry or contact support."
      );
      await refreshProgress(null);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      hasLoadedAssignments.current = true;
    }
  }, [operatorId, refreshBins, refreshProgress, user?.assignedBins]);

  // Effects -----------------------------------------------------------------
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    if (!operatorId) {
      setTasks(getDefaultTasks());
      setTasksLoading(false);
      return;
    }
    refreshProgress(operatorId);
  }, [operatorId, refreshProgress]);

  useEffect(() => {
    assignedIdsRef.current = assignedIds;
    if (!assignedIds.length) return undefined;

    const interval = setInterval(() => refreshBins(), 30000);
    return () => clearInterval(interval);
  }, [assignedIds, refreshBins]);

  // Event handlers ----------------------------------------------------------
  const handleBinCompletion = async (binId) => {
    if (!binId) return;

    const alreadyCompleted = completedBins.includes(binId);
    const targetState = !alreadyCompleted;
    const previousBins = completedBins;

    if (!operatorId) {
      const nextState = targetState
        ? [...completedBins, binId]
        : completedBins.filter((id) => id !== binId);
      setCompletedBins(nextState);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/operators/${operatorId}/bins/${binId}/clear`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: targetState }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update bin state (${response.status})`);
      }

      const result = await response.json();
      if (Array.isArray(result.completedBins)) {
        setCompletedBins(result.completedBins);
      }
      if (result.bin) {
        setBins((prev) => ({
          ...prev,
          [binId]: {
            ...(prev[binId] || {}),
            ...result.bin,
          },
        }));
      }
      setProgressMessage({
        type: "success",
        text: targetState
          ? "Marked as cleared. Great work! ✅"
          : "Cleared status removed for this bin.",
      });
    } catch (error) {
      console.error("Unable to update bin clearance state:", error);
      setCompletedBins(previousBins);
      setProgressMessage({
        type: "error",
        text: "Could not update bin status. Please try again or contact the admin.",
      });
    } finally {
      setTimeout(() => setProgressMessage(null), 5000);
    }
  };

  const handleTaskToggle = async (taskId) => {
    const existing = tasks.find((task) => task.id === taskId);
    if (!existing) return;

    const desired = !existing.completed;
    const previous = tasks;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: desired } : task
      )
    );

    if (!operatorId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/operators/${operatorId}/tasks/${taskId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: desired }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update task (${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data.tasks)) {
        setTasks(
          data.tasks.map((task) => ({
            id: task.id,
            label: task.label,
            completed: Boolean(task.completed),
          }))
        );
      }
      setTasksError(null);
    } catch (error) {
      console.error("Unable to update task status:", error);
      setTasks(previous);
      setTasksError(
        "Checklist update failed. Please retry once you have connectivity."
      );
    }
  };

  const handleIssueSubmit = async (event) => {
    event.preventDefault();
    if (!issueForm.binId || !issueForm.issue) return;

    setIssueStatus({ state: "loading" });
    try {
      const response = await fetch("http://localhost:5000/chatbot/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.email || "field-operator",
          binId: issueForm.binId,
          issue: issueForm.issue,
          description: issueForm.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit issue (${response.status})`);
      }

      setIssueStatus({
        state: "success",
        message: "Issue submitted successfully. The admin team has been notified.",
      });
      setIssueForm((prev) => ({ ...prev, issue: "", description: "" }));
    } catch (submitError) {
      console.error("Error submitting issue:", submitError);
      setIssueStatus({
        state: "error",
        message:
          "Could not send the report right now. Please try again or contact the admin.",
      });
    }
  };

  // Render helpers ----------------------------------------------------------
  const renderBinCard = ([id, bin]) => {
    const details = getStatusDetails(bin?.fillPct);
    const isCompleted = completedBins.includes(id);

    return (
      <div key={id} className="card employee-bin-card">
        <div className="card-header">
          <div>
            <h3>{(bin?.name || id).toUpperCase()}</h3>
            <p className="card-subtitle">{bin?.location || "No location"}</p>
          </div>
          <span className={`status-badge status-${details.tone}`}>
            {details.emoji} {details.label}
          </span>
        </div>

        <div className="card-metrics">
          <div>
            <h4>{bin?.fillPct ?? 0}%</h4>
            <p>Fill Level</p>
          </div>
          <div>
            <h4>{bin?.weightKg ?? 0} kg</h4>
            <p>Weight</p>
          </div>
          <div>
            <h4>{bin?.temperature ?? "—"}</h4>
            <p>Temp</p>
          </div>
        </div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${bin?.fillPct || 0}%`,
              background:
                bin?.fillPct > 80
                  ? "var(--gradient-danger)"
                  : bin?.fillPct > 60
                  ? "var(--gradient-warning)"
                  : "var(--gradient-primary)",
            }}
          />
        </div>

        <div className="card-actions">
          <button
            type="button"
            className={`btn ${isCompleted ? "btn-secondary" : "btn-primary"}`}
            onClick={() => handleBinCompletion(id)}
          >
            {isCompleted ? "✅ Marked as cleared" : "✔️ Mark bin as cleared"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIssueForm((prev) => ({ ...prev, binId: id }));
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }}
          >
            🛠️ Report an issue
          </button>
        </div>

        <div className="card-footer">
          <span>
            Last synced:{" "}
            {bin?.updatedAt
              ? new Date(bin.updatedAt).toLocaleTimeString()
              : "N/A"}
          </span>
        </div>
      </div>
    );
  };

  // Main render -------------------------------------------------------------
  if (loading) {
    return (
      <div className="container">
        <div className="employee-loading">
          <span className="spinning" role="presentation">
            ♻️
          </span>
          <p>Loading your assigned bins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container employee-dashboard">
      <div className="employee-main">
        <header className="employee-header card">
          <div>
            <p className="welcome-label">Welcome back,</p>
            <h1>{displayName}</h1>
            <p className="subheadline">
              Monitor and service your assigned bins. Stay on top of alerts and report issues
              in a single place.
            </p>
          </div>
          <div className="header-stats">
            <div>
              <h3>{assignedIds.length}</h3>
              <p>Assigned bins</p>
            </div>
            <div>
              <h3>{criticalCount}</h3>
              <p>Critical alerts</p>
            </div>
            <div>
              <h3>{warningCount}</h3>
              <p>Warning</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="card employee-error">
            <strong>⚠️ Connection issue:</strong> {error}
          </div>
        )}

        <section className="employee-actions">
          <div className="card progress-card">
            <header>
              <h2>Daily progress</h2>
              <button
                type="button"
                className={`btn btn-secondary ${refreshing ? "spinning" : ""}`}
                onClick={() => refreshBins(assignedIds, true)}
                disabled={refreshing}
              >
                🔄 Refresh data
              </button>
            </header>

            <div className="progress-summary">
            <div
              className="progress-ring"
              style={{ "--progress": completionRate / 100 }}
            >
                <span>{completionRate}%</span>
              </div>
              <div className="progress-copy">
                <p>{motivation}</p>
                {lastUpdated && (
                  <small>
                    Last sync: {new Date(lastUpdated).toLocaleTimeString()}
                  </small>
                )}
                {progressMessage && (
                  <span
                    className={`issue-feedback ${
                      progressMessage.type === "error" ? "error" : "success"
                    }`}
                    style={{ display: "inline-block", marginTop: "var(--space-sm)" }}
                  >
                    {progressMessage.text}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="card task-card">
            <h2>Shift checklist</h2>
            {tasksError && (
              <p className="issue-feedback error">{tasksError}</p>
            )}
            {tasksLoading ? (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                Loading checklist...
              </p>
            ) : (
              <ul>
                {tasks.map((task) => (
                  <li key={task.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(task.completed)}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <span>{task.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="employee-bins-grid">
          {assignedEntries.length ? (
            assignedEntries.map(renderBinCard)
          ) : (
            <div className="card empty-state">
              <h2>No bins assigned yet</h2>
              <p>
                Once the admin assigns bins to your profile, they will appear here with live
                updates.
              </p>
            </div>
          )}
        </section>
      </div>

      <aside className="employee-sidebar">
        <div className="card issue-card">
          <h2>Report an issue</h2>
          <p className="subheadline">
            Notify the admin about damaged bins, blocked access, or urgent cleanup needs.
          </p>

          <form onSubmit={handleIssueSubmit} className="issue-form">
            <label>
              Bin
              <select
                value={issueForm.binId}
                onChange={(event) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    binId: event.target.value,
                  }))
                }
                required
              >
                <option value="" disabled>
                  Select a bin
                </option>
                {assignedIds.map((id) => (
                  <option key={id} value={id}>
                    {id.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Issue type
              <input
                type="text"
                value={issueForm.issue}
                placeholder="Example: Lid damaged"
                onChange={(event) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    issue: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Additional details
              <textarea
                value={issueForm.description}
                placeholder="Add any helpful context..."
                rows={4}
                onChange={(event) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={issueStatus?.state === "loading"}
            >
              {issueStatus?.state === "loading" ? "Sending..." : "Submit report"}
            </button>
          </form>

          {issueStatus?.state === "success" && (
            <p className="issue-feedback success">{issueStatus.message}</p>
          )}
          {issueStatus?.state === "error" && (
            <p className="issue-feedback error">{issueStatus.message}</p>
          )}
        </div>

        <div className="card tips-card">
          <h2>Engagement hub</h2>
          <ul>
            <li>🌦️ Check the weather tab for rain alerts before leaving.</li>
            <li>📸 Capture photos of damaged bins and attach them to reports.</li>
            <li>🔔 Enable push notifications to receive real-time alerts.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default EmployeeDashboard;

