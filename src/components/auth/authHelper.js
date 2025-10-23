/**
 * Helper functions to check authentication status from sessionStorage.
 */

// Gets the user data object from sessionStorage
const getUserData = () => {
  const data = sessionStorage.getItem('userDetails');
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse userDetails from sessionStorage", error);
    return null;
  }
};

/**
 * Checks if a user is logged in (i.e., userDetails exists).
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const userData = getUserData();
  return !!userData; // Returns true if userData is not null, false otherwise
};

/**
 * Checks if the logged-in user is an Admin.
 * IMPORTANT: Verify 'Admin' matches the exact string in your database.
 * @returns {boolean}
 */
export const isAdmin = () => {
  const userData = getUserData();
  // Check if user exists AND their usertype is 'Admin'
  // Adjust 'Admin' if your role is named differently (e.g., 'admin')
  return !!userData && (userData.userrole === 'admin' || userData.userrole === 'superadmin'); 
};