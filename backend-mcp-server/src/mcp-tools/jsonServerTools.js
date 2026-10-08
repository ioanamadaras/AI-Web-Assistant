const axios = require("axios");

async function getLaureatesByNationality(args) {
    const nationality = args.nationality;

    if (!nationality) {
        return {
            error: "Te rog sa introduci o nationalitate pentru a putea initia cautarea.",
        };
    }

    try {
        const response = await axios.get(
            `http://localhost:4000/laureates?nationality=${nationality}`,
        );

        const laureates = response.data;

        if (laureates.length === 0) {
            return {
                message: `Nu am gasit niciun laureat avand nationalitatea "${nationality}" in baza de date.`,
            };
        }

        return {
            message: `Am gasit ${laureates.length} laureati de nationaliatea "${nationality}".`,
            data: laureates,
        };
    } catch (error) {
        console.error("Eroare la citirea din JSON-Server:", error.message);
        return { error: "Nu s-au putut aduce datele de la JSON-Server." };
    }
}

async function addEvent(args) {
    const { name, startDate = "Necunoscuta", location = "Necunoscuta" } = args;

    if (!name) {
        return {
            error: "Te rog sa introduci cel putin numele evenimentului pe care doresti sa il adaugi.",
        };
    }

    try {
        const readResponse = await axios.get("http://localhost:4000/events");
        const existingEvents = readResponse.data || [];
        const newNameLower = name.toLowerCase();

        const duplicate = existingEvents.find((event) => {
            const dbName = event.name.toLowerCase();
            let isNameMatch = false;

            if (dbName === newNameLower) {
                isNameMatch = true;
            } else {
                const ignoreList = ["the", "nobel", "prize", "in", "of", "for"];
                const newWords = newNameLower
                    .split(/[\s,.-]+/)
                    .filter((w) => !ignoreList.includes(w) && w.length > 2);
                const dbWords = dbName
                    .split(/[\s,.-]+/)
                    .filter((w) => !ignoreList.includes(w) && w.length > 2);

                const commonWords = newWords.filter((word) =>
                    dbWords.includes(word),
                );
                if (commonWords.length > 0) {
                }
            }

            if (isNameMatch) {
                const dbDate = String(
                    event.startDate || "necunoscuta",
                ).toLowerCase();
                const newDate = String(startDate).toLowerCase();

                const dbLoc = String(
                    event.location || "necunoscuta",
                ).toLowerCase();
                const newLoc = String(location).toLowerCase();

                if (dbDate === newDate && dbLoc === newLoc) {
                    return true;
                }
            }

            return false;
        });

        if (duplicate) {
            return {
                success: false,
                message: `nu s-a facut nicio adaugare. evenimentul pare sa existe deja sub numele: "${duplicate.name}".`,
            };
        }

        const newEvent = {
            name: name,
            startDate: startDate,
            location: location,
        };

        const response = await axios.post(
            "http://localhost:4000/events",
            newEvent,
        );

        return {
            success: true,
            message: `Evenimentul "${name}" a fost salvat cu succes!`,
            data: response.data,
        };
    } catch (error) {
        console.error("Eroare la scrierea in JSON-Server:", error.message);
        return { error: "Nu s-au putut salva datele in JSON-Server." };
    }
}

module.exports = {
    getLaureatesByNationality,
    addEvent,
};
