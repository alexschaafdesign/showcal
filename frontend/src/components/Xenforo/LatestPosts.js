import React, { useEffect, useState } from 'react';
import { getLatestThreads } from '../../api'; // Ensure this points to your API utility

const LatestPosts = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getLatestThreads(); // This will trigger the API request
        console.log("Fetched threads:", data); // Debugging: log the fetched threads
        setThreads(data.threads); // Assuming the response contains a 'threads' array
      } catch (error) {
        console.error("Error fetching threads:", error); // Log detailed error
        setError("Failed to load threads");
      } finally {
        setLoading(false); // Always set loading to false after fetch
      }
    };

    fetchThreads(); // Call the function to fetch threads when the component mounts
  }, []); // Empty array means this effect runs only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Latest Posts</h1>
      <ul>
        {threads.map((thread) => (
          <li key={thread.thread_id}>
            <h3>{thread.title}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestPosts;