import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from 'axios';

const AddTaskComponent = ({ onTaskAdded }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!taskTitle) {
      toast.error("Task title is required!");
      return;
    }

    setLoading(true);

    try {
      const newTask = {
        todo_name: taskTitle,
        todo_desc: taskDesc,
        todo_image: "https://api.dicebear.com/9.x/icons/svg?seed=random",
        todo_status: "active",
      };

      // Get token from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user && user.access_token ? user.access_token : null; // Get access token

      // Set up headers with the token
      const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };

      const response = await axios.post("/service/todo/add_todo", newTask, config); // Pass config with headers

      if (response.status === 200) {
        toast.success(response.data.message || "Task added successfully!");
        setTaskTitle("");
        setTaskDesc("");
        if (onTaskAdded) {
          onTaskAdded();
        }
      } else {
        toast.error(response.data.message || "Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("An error occurred while adding the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-1/4 flex-col gap-2 bg-green-100 rounded-md p-4">
        <h1 className="text-green-900 font-semibold text-lg">Add Your Task</h1>
        <form onSubmit={handleAddTask} className="flex flex-col gap-3">
          <input
            type="text"
            id="taskTitle"
            placeholder="Task Title..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="p-3 w-full text-white rounded-md border-gray-100 bg-green-800 shadow-xs text-sm placeholder:text-gray-300"
          />

          <textarea
            id="taskDesc"
            cols="30"
            rows="12"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            className="p-3 rounded-md text-sm w-full text-white border-gray-100 bg-green-800 placeholder:text-gray-300 resize-none"
            placeholder="Write your task here..."
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="btn w-full px-4 py-2 text-sm text-white rounded-md bg-green-600 hover:bg-green-800 transition ease-in-out"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddTaskComponent;
