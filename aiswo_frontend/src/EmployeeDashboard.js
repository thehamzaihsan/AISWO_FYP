import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./components/ui/button"
import { API_CONFIG } from './config';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, CheckSquare, Square, MapPin, Thermometer, Scale } from "lucide-react"

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
  if (fillPct > 80) return { label: "Critical", color: "text-destructive", icon: AlertCircle };
  if (fillPct > 60) return { label: "Warning", color: "text-yellow-600", icon: AlertTriangle };
  return { label: "Normal", color: "text-green-600", icon: CheckCircle2 };
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
        const response = await axios.get(
          `${API_CONFIG.BACKEND_URL}/operators/${operatorId}/progress`
        );

        const data = response.data;
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
        const response = await axios.get(`${API_CONFIG.BACKEND_URL}/bins`);
        const data = response.data;
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
        const operatorRes = await axios.get(
          `${API_CONFIG.BACKEND_URL}/operators/${operatorId}`
        );
        const operatorData = operatorRes.data;
        ids = operatorData.assignedBins || ids;
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
      const response = await axios.post(
        `${API_CONFIG.BACKEND_URL}/operators/${operatorId}/bins/${binId}/clear`,
        { completed: targetState }
      );

      const result = response.data;
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
    const StatusIcon = details.icon;

    return (
      <Card key={id} className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-primary">
                {(bin?.name || id).toUpperCase()}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" /> {bin?.location || "No location"}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${details.color}`}>
              <StatusIcon className="h-4 w-4" />
              {details.label}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted p-2 rounded-lg">
              <div className="text-lg font-bold">{bin?.fillPct ?? 0}%</div>
              <div className="text-xs text-muted-foreground">Fill Level</div>
            </div>
            <div className="bg-muted p-2 rounded-lg">
              <div className="text-lg font-bold">{bin?.weightKg ?? 0}</div>
              <div className="text-xs text-muted-foreground">kg Weight</div>
            </div>
            <div className="bg-muted p-2 rounded-lg">
              <div className="text-lg font-bold">{bin?.temperature ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Temp</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fill Progress</span>
              <span>{bin?.fillPct || 0}%</span>
            </div>
            <Progress value={bin?.fillPct || 0} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-3">
          <Button 
            className={`flex-1 ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
            variant={isCompleted ? "default" : "default"}
            onClick={() => handleBinCompletion(id)}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Cleared
              </>
            ) : (
              "Mark as Cleared"
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setIssueForm((prev) => ({ ...prev, binId: id }));
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Report
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Main render -------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your assigned bins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl grid gap-8 lg:grid-cols-[1fr_350px]">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-muted-foreground">Welcome back,</p>
          <h1 className="text-4xl font-bold tracking-tight text-primary">{displayName}</h1>
          <p className="text-muted-foreground">
            Monitor and service your assigned bins. Stay on top of alerts and report issues in a single place.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-primary">{assignedIds.length}</div>
              <div className="text-sm text-muted-foreground">Assigned Bins</div>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-destructive">{criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </Card>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Daily Progress</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refreshBins(assignedIds, true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-primary transition-all duration-500 ease-out"
                      strokeDasharray={`${completionRate}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute text-xl font-bold">{completionRate}%</div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{motivation}</p>
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
                  )}
                  {progressMessage && (
                    <p className={`text-sm ${progressMessage.type === "error" ? "text-destructive" : "text-green-600"}`}>
                      {progressMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shift Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksError && (
                <p className="text-destructive text-sm mb-4">{tasksError}</p>
              )}
              {tasksLoading ? (
                <p className="text-muted-foreground text-sm">Loading checklist...</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTaskToggle(task.id)}
                        className="text-primary focus:outline-none"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {assignedEntries.length ? (
            assignedEntries.map(renderBinCard)
          ) : (
            <Card className="col-span-full p-8 text-center">
              <h3 className="text-lg font-semibold">No bins assigned yet</h3>
              <p className="text-muted-foreground mt-2">
                Once the admin assigns bins to your profile, they will appear here with live updates.
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
            <CardDescription>
              Notify the admin about damaged bins, blocked access, or urgent cleanup needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issueBin">Bin</Label>
                <Select
                  value={issueForm.binId}
                  onValueChange={(value) =>
                    setIssueForm((prev) => ({ ...prev, binId: value }))
                  }
                >
                  <SelectTrigger id="issueBin">
                    <SelectValue placeholder="Select a bin" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Input
                  id="issueType"
                  value={issueForm.issue}
                  placeholder="Example: Lid damaged"
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, issue: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={issueForm.description}
                  placeholder="Add any helpful context..."
                  rows={4}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={issueStatus?.state === "loading"}
              >
                {issueStatus?.state === "loading" ? "Sending..." : "Submit Report"}
              </Button>

              {issueStatus?.state === "success" && (
                <p className="text-green-600 text-sm">{issueStatus.message}</p>
              )}
              {issueStatus?.state === "error" && (
                <p className="text-destructive text-sm">{issueStatus.message}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-xl">🌦️</span>
                <span>Check the weather tab for rain alerts before leaving.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">📸</span>
                <span>Capture photos of damaged bins and attach them to reports.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🔔</span>
                <span>Enable push notifications to receive real-time alerts.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
