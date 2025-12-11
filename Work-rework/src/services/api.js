const API_BASE_URL =
    import.meta.env.API_BASE_URL || "http://localhost:8070";

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

/**
 * Fetches all repositories for a specific user
 * @param {string} userId - User ID (e.g., "i24s0002")
 * @returns {Promise<Object>} Object with count and repositories array
 * @example
 * fetchUserRepositories('i24s0002')
 * // => { count: 2, repositories: [{ name: "Work" }, { name: "personal-project" }] }
 */
export const fetchUserRepositories = async (userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/repos/${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            count: data.count || 0,
            repositories: data.repositories || []
        };
    } catch (error) {
        console.error(`Error fetching repositories for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Fetches repository contents (files and folders)
 * @param {string} user_id - User ID (e.g., "i24s0002")
 * @param {string} repoName - Repository name (e.g., "Work", "personal-project")
 * @param {string} path - Path within repository (optional)
 * @param {AbortSignal} signal - AbortController signal for cancellation (optional)
 * @returns {Promise<Array<Object>>} Array of repo content items
 * @example
 * fetchRepoContents('i24s0002', 'Work', '')
 * // => [{ name: "file.txt", type: "file", ... }, ...]
 */
export const fetchRepoContents = async (user_id, repoName, path = "", signal = null) => {
    try {
        const endpoint = path && path.trim()
            ? `${API_BASE_URL}/api/v1/repos/${user_id}/${encodeURIComponent(repoName)}/contents?path=${encodeURIComponent(path)}`
            : `${API_BASE_URL}/api/v1/repos/${user_id}/${encodeURIComponent(repoName)}/contents`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: signal,
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                errorMessage = response.statusText || errorMessage;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        console.error(
            `Error fetching repository contents for ${user_id}:`,
            error
        );
        throw error;
    }
};

/**
 * Fetches commits from a repository
 * @param {string} userId - User ID (e.g., "i24s0002")
 * @param {string} repoName - Repository name (e.g., "Work", "personal-project")
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise<Object>} Object with count and commits array
 * @example
 * fetchCommits('i24s0002', 'Work', 1, 20)
 * // => { count: 20, commits: [...] }
 */
export const fetchCommits = async (userId, repoName, page = 1, perPage = 20) => {
    try {
        const endpoint = `${API_BASE_URL}/api/v1/repos/${userId}/${encodeURIComponent(repoName)}/commits?page=${page}&per_page=${perPage}`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch commits: ${response.status}`
            );
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(
            `Error fetching commits for ${userId}:`,
            error
        );
        throw error;
    }
};

/**
 * Generates URL for opening HTML file in a new tab
 * The backend automatically inserts <base> tag to resolve relative paths
 * @param {string} userId - User ID (e.g., "i24s0002")
 * @param {string} repoName - Repository name (e.g., "Work", "personal-project")
 * @param {string} path - Path to HTML file in repository
 * @returns {string} Full URL to open HTML file
 * @example
 * getHtmlUrl('i24s0002', 'Work', 'index.html')
 * // => 'http://localhost:8070/api/v1/repos/i24s0002/Work/branches/main/html/index.html'
 *
 * getHtmlUrl('i24s0002', 'Work', '!__HISTORY_NEW/index.html')
 * // => 'http://localhost:8070/api/v1/repos/i24s0002/Work/branches/main/html/!__HISTORY_NEW/index.html'
 */
export const getHtmlUrl = (userId, repoName, path) => {
    return `${API_BASE_URL}/api/v1/repos/${userId}/${encodeURIComponent(repoName)}/branches/main/html/${path}`;
};

/**
 * Generates URL for downloading repository or folder as ZIP archive
 * @param {string} userId - User ID (e.g., "i24s0002")
 * @param {string} repoName - Repository name (e.g., "Work", "personal-project")
 * @param {string} path - Path to folder (empty for whole repository)
 * @param {string} branch - Branch name (default: "main")
 * @returns {string} Full URL to download ZIP archive
 * @example
 * getArchiveUrl('i24s0002', 'Work')
 * // => 'http://git.students.it-college.ru:8080/i24s0002/Work/archive/main.zip'
 *
 * getArchiveUrl('i24s0002', 'Work', 'diskretka')
 * // => 'http://git.students.it-college.ru:8080/i24s0002/Work/archive/diskretka/main.zip'
 */
export const getArchiveUrl = (userId, repoName, path = '', branch = 'main') => {
    const baseUrl = 'http://git.students.it-college.ru:8080';
    if (!path) {
        // Download entire repository
        return `${baseUrl}/${userId}/${encodeURIComponent(repoName)}/archive/${branch}.zip`;
    }
    // Download specific folder
    return `${baseUrl}/${userId}/${encodeURIComponent(repoName)}/archive/${path}/${branch}.zip`;
};
