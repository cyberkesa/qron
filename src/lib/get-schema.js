import fetch from "node-fetch";

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function getSchema() {
  try {
    // Сначала получим список регионов
    const regionsResponse = await fetch(
      "https://api.tovari-kron.ru/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          query {
            regions {
              id
              name
            }
          }
        `,
        }),
      }
    );

    const regionsData = await regionsResponse.json();
    const regionId = regionsData.data?.regions?.[0]?.id;

    if (!regionId) {
      console.error("Failed to get regions:", regionsData);
      return;
    }

    console.log("Using region:", regionsData.data.regions[0]);

    // Теперь выполним вход как гость с полученным regionId
    const guestLoginResponse = await fetch(
      "https://api.tovari-kron.ru/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          mutation($regionId: ID!) {
            logInAsGuest(regionId: $regionId) {
              ... on LogInAsGuestSuccessResult {
                accessToken
                refreshToken
              }
              ... on UnexpectedError {
                message
              }
            }
          }
        `,
          variables: {
            regionId,
          },
        }),
      }
    );

    const guestData = await guestLoginResponse.json();
    const accessToken = guestData.data?.logInAsGuest?.accessToken;

    if (!accessToken) {
      console.error("Failed to get guest token:", guestData);
      return;
    }

    // Теперь используем полученный токен для запроса схемы
    const response = await fetch("https://api.tovari-kron.ru/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: introspectionQuery }),
    });

    const data = await response.json();

    // Сохраняем схему в файл для дальнейшего использования
    const fs = await import("fs/promises");
    await fs.writeFile("schema.json", JSON.stringify(data, null, 2));

    console.log("Schema has been saved to schema.json");
    console.log("Access token:", accessToken);
  } catch (error) {
    console.error("Error:", error);
  }
}

getSchema();
