import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, AlertCircle, TrendingUp, Lock, Shield, Activity } from "lucide-react";
import API from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState(null);
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes, usersRes, pollsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/logs"),
        API.get("/admin/users?limit=10"),
        API.get("/admin/polls?limit=10"),
      ]);

      setStats(statsRes.data);
      setLogs(logsRes.data);
      setUsers(usersRes.data.data);
      setPolls(pollsRes.data.data);
    } catch (err) {
      setError("Failed to load admin dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBanUser = async (userId, reason) => {
    try {
      await API.patch(`/admin/users/${userId}/ban`, { reason });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to ban user:", err);
    }
  };

  const handleFlagPoll = async (pollId, reason) => {
    try {
      await API.patch(`/admin/polls/${pollId}/flag`, { reason });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to flag poll:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-8 text-red-500" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        {["overview", "users", "polls", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 capitalize font-semibold transition ${
              activeTab === tab
                ? "border-b-2 border-red-500 text-red-500"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <Users className="size-6 text-blue-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.summary.totalUsers}</p>
            <p className="text-sm text-white/60">
              Admins: {stats.usersByRole.admin || 0} | Mods: {stats.usersByRole.moderator || 0}
            </p>
          </motion.div>

          {/* Total Polls */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Polls</h3>
              <TrendingUp className="size-6 text-green-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.summary.totalPolls}</p>
            <p className="text-sm text-white/60">Public: {stats.pollsByVisibility.public || 0}</p>
          </motion.div>

          {/* Banned Users */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Banned Users</h3>
              <Lock className="size-6 text-red-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.summary.bannedUsers}</p>
            <p className="text-sm text-white/60">Active restrictions</p>
          </motion.div>

          {/* Flagged Polls */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Flagged Polls</h3>
              <AlertCircle className="size-6 text-yellow-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.summary.flaggedPolls}</p>
            <p className="text-sm text-white/60">Pending review</p>
          </motion.div>

          {/* Total Votes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Votes</h3>
              <Activity className="size-6 text-purple-400" />
            </div>
            <p className="text-4xl font-bold mb-2">{stats.summary.totalVotes}</p>
            <p className="text-sm text-white/60">System-wide responses</p>
          </motion.div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4 text-white/60">{user.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isBanned ? (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                        Banned
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {!user.isBanned && (
                      <button
                        onClick={() => handleBanUser(user._id, "Moderate action")}
                        className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Polls Tab */}
      {activeTab === "polls" && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Creator</th>
                <th className="text-left py-3 px-4">Visibility</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => (
                <tr key={poll._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-semibold">{poll.title}</td>
                  <td className="p-4 text-white/60">{poll.createdBy?.name}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                      {poll.visibility}
                    </span>
                  </td>
                  <td className="p-4">
                    {poll.flagged ? (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {!poll.flagged && (
                      <button
                        onClick={() => handleFlagPoll(poll._id, "Review needed")}
                        className="text-xs px-3 py-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                      >
                        Flag
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && logs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Bans</h3>
            <div className="space-y-3">
              {logs.recentBans.length > 0 ? (
                logs.recentBans.map((user) => (
                  <div key={user._id} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="font-semibold text-red-300">{user.name}</p>
                    <p className="text-xs text-white/60">{user.banReason}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No recent bans</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-4">Flagged Polls</h3>
            <div className="space-y-3">
              {logs.recentFlags.length > 0 ? (
                logs.recentFlags.map((poll) => (
                  <div key={poll._id} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="font-semibold text-yellow-300">{poll.title}</p>
                    <p className="text-xs text-white/60">{poll.flagReason}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No flagged polls</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
