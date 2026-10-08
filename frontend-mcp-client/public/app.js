async function readResponsePayload(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

document.getElementById("askBtn").addEventListener("click", async () => {
    const question = document.getElementById("question").value.trim();
    const answerBox = document.getElementById("answer");

    if (!question) {
        answerBox.textContent = "Scrie o intrebare.";
        return;
    }

    answerBox.textContent = "Se procesează...";

    try {
        const response = await fetch("/api/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });

        const data = await readResponsePayload(response);

        if (!response.ok) {
            throw new Error(data?.error || `HTTP ${response.status}`);
        }

        answerBox.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        answerBox.textContent = "Eroare: " + error.message;
    }
});
