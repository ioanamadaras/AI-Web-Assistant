const axios = require("axios");

async function getArticlesByJournal(args) {
    const journalName = args.journalName;

    if (!journalName) {
        return {
            error: "Te rog sa introduci numele jurnalului pentru a cauta articolele.",
        };
    }

    const sparqlQuery = `
        prefix schema: <https://schema.org/> 
        prefix ex: <http://example.org/research/>

        select ?articleName ?datePublished ?exactJournalName where 
        {
            ?journal a schema:Periodical ; 
                    schema:name ?exactJournalName .

            filter(contains(lcase(?exactJournalName), lcase("${journalName}")))

            ?article a schema:ScholarlyArticle ;
                    schema:isPartOf ?journal ;
                    schema:name ?articleName ;
                    schema:datePublished ?datePublished .
        }
    `;

    try {
        const response = await axios.get(
            `http://localhost:8080/rdf4j-server/repositories/grafexamen?query=${encodeURIComponent(sparqlQuery)}`,
            {
                headers: {
                    Accept: "application/sparql-results+json",
                },
            },
        );

        const bindings = response.data.results.bindings;

        if (bindings.length === 0) {
            return {
                message: `Nu am gasit articole pentru un jurnal care sa contina numele "${journalName}".`,
            };
        }

        const articles = bindings.map((b) => ({
            journal: b.exactJournalName.value,
            title: b.articleName.value,
            date: b.datePublished.value,
        }));

        return {
            message: `Am gasit ${articles.length} articole.`,
            data: articles,
        };
    } catch (error) {
        console.error("Eroare la citirea din RDF4J:", error.message);
        return { error: "Nu s-au putut aduce datele de la RDF4J." };
    }
}

async function addJournal(args) {
    const {
        name,
        issn = "necunoscut",
        publisherId = "Publisher_Necunoscut",
    } = args;

    if (!name) {
        return { error: "Numele jurnalului este obligatoriu." };
    }

    try {
        const readQuery = `
            prefix schema: <https://schema.org/>
            select ?name where {
                ?j a schema:Periodical ;
                   schema:name ?name .
            }
        `;

        const readResponse = await axios.post(
            "http://localhost:8080/rdf4j-server/repositories/grafexamen",
            `query=${encodeURIComponent(readQuery)}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );

        const bindings = readResponse.data.results.bindings || [];
        const newNameLower = name.toLowerCase();

        const duplicateName = bindings.find((binding) => {
            const dbNameRaw = binding.name.value;
            const dbName = dbNameRaw.toLowerCase();

            if (dbName === newNameLower) {
                return true;
            }

            const ignoreList = [
                "the",
                "of",
                "and",
                "for",
                "in",
                "journal",
                "magazine",
                "review",
            ];

            const newWords = newNameLower
                .split(/[\s,.-]+/)
                .filter((w) => !ignoreList.includes(w) && w.length > 2);
            const dbWords = dbName
                .split(/[\s,.-]+/)
                .filter((w) => !ignoreList.includes(w) && w.length > 2);

            const commonWords = newWords.filter((word) =>
                dbWords.includes(word),
            );

            return commonWords.some((word) => word.length > 3);
        });

        if (duplicateName) {
            return {
                success: false,
                message: `nu s-a facut nicio adaugare. jurnalul pare sa existe deja in rdf sub numele: "${duplicateName.name.value}".`,
            };
        }
        const generatedId = `Journal_${Date.now()}`;

        const sparqlUpdate = `
            prefix schema: <https://schema.org/>
            prefix ex: <http://example.org/research/>

            insert data
            {
                ex:${generatedId} a schema:Periodical ; 
                                schema:name "${name}" ;
                                schema:issn "${issn}" ;
                                schema:publisher ex:${publisherId} .
            }
        `;

        const writeResponse = await axios.post(
            "http://localhost:8080/rdf4j-server/repositories/grafexamen/statements",
            `update=${encodeURIComponent(sparqlUpdate)}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );

        return {
            success: true,
            message: `Jurnalul "${name}" a fost salvat in graful de date cu succes!`,
            generatedUri: `ex:${generatedId}`,
        };
    } catch (error) {
        console.error("Eroare la scrierea in RDF4J:", error.message);
        return { error: "Nu s-au putut salva datele in RDF4J." };
    }
}

module.exports = {
    getArticlesByJournal,
    addJournal,
};
