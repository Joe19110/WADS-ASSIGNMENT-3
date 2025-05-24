import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const MyTaskComponent = forwardRef((props, ref) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Get token from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user && user.access_token ? user.access_token : null; // Get access token

      // Set up headers with the token
      const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };

      const response = await axios.get("/service/todo/get_all", config); // Pass config with headers

      if (response.status === 200) {
        setTasks(response.data);
      } else {
        toast.error("Failed to fetch tasks.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("An error occurred while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchTasks: fetchTasks
  }));

  const handleEdit = (task) => {
    setSelectedTask(task);
    setUpdatedTitle(task.todo_name);
    setUpdatedDescription(task.todo_desc);
    document.getElementById("update-modal").showModal();
  };

  const handleUpdateTask = async () => {
    if (!updatedTitle) {
      toast.error("Task title is required!");
      return;
    }

    setLoading(true);

    try {
      const updatedData = {
        todo_name: updatedTitle,
        todo_desc: updatedDescription,
        todo_image: selectedTask.todo_image,
        todo_status: selectedTask.todo_status,
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

      const response = await axios.patch(`/service/todo/update_todo/${selectedTask._id}`, updatedData, config); // Pass config with headers

      if (response.status === 200) {
        toast.success(response.data.message || "Task updated successfully!");
        fetchTasks();
        document.getElementById("update-modal").close();
      } else {
        toast.error(response.data.message || "Failed to update task.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    setLoading(true);
    try {
      // Get token from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user && user.access_token ? user.access_token : null; // Get access token

      // Set up headers with the token
      const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };

      const response = await axios.delete(`/service/todo/delete_todo/${taskId}`, config); // Pass config with headers

      if (response.status === 200) {
        toast.success(response.data.message || "Task deleted successfully!");
        fetchTasks();
      } else {
        toast.error(response.data.message || "Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred while deleting the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p className="text-gray-600">Loading tasks...</p>}

      {!loading && tasks.length === 0 && (
        <p className="text-gray-500">No tasks available.</p>
      )}

      {!loading &&
        tasks.map((task) => (
          <div
            key={task._id}
            className="flex flex-col gap-2 mt-2 p-3 text-white bg-green-700 rounded-md shadow-md"
          >
            <h1 className="text-xl font-semibold mb-2">{task.todo_name}</h1>
            <p className="text-sm text-gray-100">{task.todo_desc}</p>

            <div className="flex w-full justify-end items-center gap-4 mt-4">
              <button
                className="btn btn-primary text-white flex gap-1 px-3"
                onClick={() => handleEdit(task)}
              >
                <FaRegEdit className="text-base" />
                Edit
              </button>

              <button
                className="btn btn-error bg-red-600 text-white flex gap-1 px-3"
                onClick={() => handleDelete(task._id)}
              >
                <MdDeleteOutline className="text-lg" />
                Delete
              </button>
            </div>
          </div>
        ))}

      {/* Modal Popup for Update Task (DaisyUI component) */}
      <dialog id="update-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Update Task</h3>
          <div className="py-4">
            <label className="block text-gray-700 font-medium">Title</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />

            <label className="block text-gray-700 font-medium mt-3">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={updatedDescription}
              onChange={(e) => setUpdatedDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-primary text-white"
              onClick={handleUpdateTask}
            >
              Save Changes
            </button>
            <button
              className="btn"
              onClick={() => document.getElementById("update-modal").close()}
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
});

export default MyTaskComponent;
