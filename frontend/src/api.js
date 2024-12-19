import axios from 'axios';

const API_URL = 'https://tcupmutualaid.community.forum/api'; // Ensure this is the correct URL

// Function to fetch the latest threads
export const getLatestThreads = async () => {
  try {
    const response = await axios.get('/threads', {
        params: {
            page: 1,        // Fetch the first page of threads
            order: 'last_post_date', // Order threads by the last post date
            direction: 'desc' // Descending order
          },
        headers: {
            'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f',
            'XF-Api-User': '1', // Same for the User ID
        },
    });
    console.log(response.data); // Log the response data to see what the API returns

    // Check if response status is 200 (OK)
    if (response.status !== 200) {
      throw new Error(`Failed to fetch threads. Status: ${response.status}`);
    }

    return response.data;  // Return the response data (threads list)
  } catch (error) {
    console.error("Error fetching latest threads:", error);
    throw new Error(error.response?.data?.error || error.message || "Unknown error");
  }
};

// Function to fetch threads from a specific forum
export const getForumThreads = async () => {
    try {
      const response = await axios.get(`/forums/12`, { // Using forum ID 12
        params: {
          with_threads: true, // If true, it fetches threads for this forum
          page: 1, // You can adjust the page number for pagination
          order: 'last_post_date', // Sorting by post date (modify as needed)
          direction: 'desc', // Sorting direction (desc or asc)
        },
        headers: {
            'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f',
            'XF-Api-User': '1', // Same for the User ID
        }
      });
      console.log(response.data); // Check the response data structure
      return response.data;
    } catch (error) {
      console.error('Error fetching forum threads', error);
      throw error;
    }
  };