import React, { useEffect, useState } from 'react';
import { getForumThreads } from '../../api';

const ForumThreads = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the threads from the API when the component mounts
    const fetchThreads = async () => {
      try {
        const data = await getForumThreads(12); // Pass the forum ID (12 in this case)
        setThreads(data.threads); // Set the fetched threads data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch threads');
        setLoading(false);
      }
    };

    fetchThreads();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Forum Threads</h1>
      <ul>
        {threads.map((thread) => (
          <li key={thread.thread_id}>
            <h2>{thread.title}</h2>
            <p>{thread.post_date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ForumThreads;