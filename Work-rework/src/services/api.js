const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all groups from the backend
 * @returns {Promise<Array<string>>} Array of group names (e.g., ["ИТ21-11", "ИТ22-11", ...])
 */
export const fetchGroups = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/it`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.status}`);
    }

    const data = await response.json();

    return data.groups.map(group => group.name);
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

/**
 * Fetches students for a specific group
 * @param {string} groupName - Group name (e.g., "ИТ21-11")
 * @returns {Promise<Array<Object>>} Array of student objects
 */
export const fetchStudents = async (groupName) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${encodeURIComponent(groupName)}/students`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.status}`);
    }

    const data = await response.json();

    return data.students.map(student => {
        const nameParts = student.username.split(' ');
        const lastName = nameParts[0] || '';
        const firstName = nameParts.slice(1).join(' ') || '';

        return {
            id: student.id,
            last_name: lastName,
            first_name: firstName,
            avatar_path: student.photoUrl ? `${API_BASE_URL}${student.photoUrl}` : '',
            group: groupName,
        };
    });
  } catch (error) {
    console.error(`Error fetching students for group ${groupName}:`, error);
    throw error;
  }
};
