const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8070";

/**
 * Fetches all groups from the backend
 * @returns {Promise<Array<string>>} Array of group names (e.g., ["ИТ21-11", "ИТ22-11", ...])
 */
export const fetchGroups = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/groups/it`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch groups: ${response.status}`);
        }

        const data = await response.json();

        return data.groups.map((group) => group.name);
    } catch (error) {
        console.error("Error fetching groups:", error);
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
            `${API_BASE_URL}/api/v1/groups/${encodeURIComponent(
                groupName
            )}/students`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.status}`);
        }

        const data = await response.json();

        if (!data.students || !Array.isArray(data.students)) {
            return [];
        }

        return data.students.map((student) => {
            const nameParts = student.username.split(" ");
            const lastName = nameParts[0] || "";
            const firstName = nameParts.slice(1).join(" ") || "";

            return {
                id: student.id,
                last_name: lastName,
                first_name: firstName,
                avatar_path: student.photoUrl
                    ? `${API_BASE_URL}${student.photoUrl}`
                    : "",
                group: groupName,
            };
        });
    } catch (error) {
        console.error(`Error fetching students for group ${groupName}:`, error);
        throw error;
    }
};

/**
 * Searches for students globally across all groups
 * @param {string} query - Search query (name or ID)
 * @returns {Promise<Array<Object>>} Array of matching student objects
 */
export const searchStudents = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/search/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`Failed to search students: ${response.status}`);
        }

        const data = await response.json();

        if (!data.students || !Array.isArray(data.students)) {
            return [];
        }

        return data.students.map((student) => {
            const nameParts = student.username.split(" ");
            const lastName = nameParts[0] || "";
            const firstName = nameParts.slice(1).join(" ") || "";

            return {
                id: student.id,
                last_name: lastName,
                first_name: firstName,
                avatar_path: student.photoUrl
                    ? `${API_BASE_URL}${student.photoUrl}`
                    : "",
                group: student.groupName || "",
            };
        });
    } catch (error) {
        console.error(`Error searching students for query "${query}":`, error);
        throw error;
    }
};

// FETCH REPO CONTENTS
// PARAMS: user_id (e.g., "i24s0002"), path (optional)
// RETURNS: array of repo content items

export const fetchRepoContents = async (user_id, path = "") => {
    try {
        const endpoint = path
            ? `${API_BASE_URL}/api/v1/repos/${user_id}/contents?path=${encodeURIComponent(path)}`
            : `${API_BASE_URL}/api/v1/repos/${user_id}/contents`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch repository contents: ${response.status}`
            );
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(
            `Error fetching repository contents for ${user_id}:`,
            error
        );
        throw error;
    }
};
