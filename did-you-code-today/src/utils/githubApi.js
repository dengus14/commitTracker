export const createFetchGitHub = (user, token) => async (path) => {
  if (user && user.hasToken && token) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/github/${path}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const result = await response.json();
      return { ok: true, json: async () => result.data, status: response.status };
    } else {
      const errorResult = await response.json();
      return { ok: false, status: response.status, json: async () => errorResult };
    }
  } else {
    const response = await fetch(`https://api.github.com/${path}`);
    return { ok: response.ok, json: () => response.json(), status: response.status };
  }
};
