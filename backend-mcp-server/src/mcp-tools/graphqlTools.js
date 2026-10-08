const axios = require("axios");

async function getScientistsByInstitution(args) {
    const institutionName = args.institutionName;

    if (!institutionName) {
        return {
            error: "te rog sa introduci numele institutiei pentru cautare.",
        };
    }

    try {
        const findInstitutionQuery = `
            query {
                allInstitutions {
                    id
                    name
                }
            }
        `;

        const firstResponse = await axios.post("http://localhost:3000", {
            query: findInstitutionQuery,
        });

        const institutions = firstResponse.data.data.allInstitutions || [];
        const searchInput = institutionName.toLowerCase();

        const foundInstitution = institutions.find((inst) => {
            const dbName = inst.name.toLowerCase();

            if (dbName.includes(searchInput)) {
                return true;
            }

            const searchWords = searchInput
                .split(/[\s,.-]+/)
                .filter((w) => w.length > 2);
            const dbWords = dbName
                .split(/[\s,.-]+/)
                .filter((w) => w.length > 2);

            const commonWords = searchWords.filter((word) =>
                dbWords.includes(word),
            );

            return commonWords.some((word) => word.length > 3);
        });

        if (!foundInstitution) {
            return {
                message: `nu am gasit nicio instituie cu numele "${institutionName}" in baza de date.`,
            };
        }

        const internalId = parseInt(foundInstitution.id);

        const graphqlQuery = `
            query {
                allScientists(filter: { institution_id: ${internalId} }) {
                    id
                    name
                    fieldOfStudy
                }
            }
        `;

        const secondResponse = await axios.post("http://localhost:3000", {
            query: graphqlQuery,
        });

        return {
            institutionMatched: foundInstitution.name,
            scientists: secondResponse.data.data.allScientists || [],
        };
    } catch (error) {
        if (error.response) {
            console.error(
                "eroare de la graphql (detalii):",
                JSON.stringify(error.response.data, null, 2),
            );
        } else {
            console.error(
                "eroare de retea sau executie:",
                error.message || error,
            );
        }
        return { error: "nu s-au putut aduce datele de la graphql." };
    }
}

async function addInstitution(args) {
    const { name, country = "Necunoscuta", foundedYear = 0 } = args;

    try {
        const findInstitutionQuery = `
            query {
                allInstitutions {
                    name
                }
            }
        `;
        const readResponse = await axios.post("http://localhost:3000", {
            query: findInstitutionQuery,
        });

        const existingInstitutions =
            readResponse.data.data.allInstitutions || [];
        const newNameLower = name.toLowerCase();

        const duplicate = existingInstitutions.find((inst) => {
            const dbName = inst.name.toLowerCase();

            if (dbName === newNameLower) {
                return true;
            }

            const ignoreList = [
                "university",
                "institute",
                "academy",
                "college",
                "school",
                "the",
                "of",
                "for",
                "and",
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

        if (duplicate) {
            return {
                success: false,
                message: `Nu s-a facut nicio adaugare. Institutia pare sa existe deja in baza de date sub numele: "${duplicate.name}".`,
            };
        }
        const graphqlMutation = `
            mutation {
                createInstitution(
                    name: "${name}",
                    country: "${country}",
                    foundedYear: ${foundedYear}
                ) {
                    id
                    name
             }
            }
        `;

        const writeResponse = await axios.post("http://localhost:3000", {
            query: graphqlMutation,
        });

        if (writeResponse.data.errors) {
            console.error(
                "Eroare de validare graphql:",
                JSON.stringify(writeResponse.data.errors, null, 2),
            );
            return {
                error: `Refuzat de graphql: ${writeResponse.data.errors[0].message}`,
            };
        }

        return {
            success: true,
            message: `Instituia "${name}" a fost adaugata cu succes!`,
            data: writeResponse.data.data.createInstitution,
        };
    } catch (error) {
        if (error.writeResponse) {
            console.error(
                "Eroare la scriere in GraphQL:",
                JSON.stringify(error.response.data, null, 2),
            );
        } else {
            console.error(
                "Eroarea de retea la scriere:",
                error.message || error,
            );
        }
        return { error: "Nu se pot salva datele in GraphQL." };
    }
}

module.exports = {
    getScientistsByInstitution,
    addInstitution,
};
