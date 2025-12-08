---
---

export const baseurl = "{{ site.baseurl }}";

// Flask backend URI
export var pythonURI;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    pythonURI = "http://localhost:8587";
} else {
    pythonURI = "https://flaskstu.opencodingsociety.com";
}

// Keep javaURI pointing to Flask (for any legacy code that uses it)
export var javaURI = pythonURI;

export const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'X-Origin': 'client'
    },
};

// User Login Function
export function login(options) {
    const requestOptions = {
        ...fetchOptions,
        method: options.method || 'POST',
        body: options.method === 'POST' ? JSON.stringify(options.body) : undefined
    };

    // Clear the message area
    document.getElementById(options.message).textContent = "";

    fetch(options.URL, requestOptions)
        .then(response => {
            if (!response.ok) {
                const errorMsg = 'Login error: ' + response.status;
                console.log(errorMsg);
                document.getElementById(options.message).textContent = errorMsg;
                return;
            }
            options.callback();
        })
        .catch(error => {
            console.log('Possible CORS or Service Down error: ' + error);
            document.getElementById(options.message).textContent = 'Possible CORS or service down error: ' + error;
        });
}