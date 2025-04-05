import fetch from "node-fetch";

const query = `
  query {
    products(first: 1, sortOrder: PRICE) {
      edges {
        node {
          id
          name
          price
          description
          images {
            id
            url
          }
          slug
          category {
            id
            title
            slug
          }
          stockAvailabilityStatus
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function testQuery() {
  try {
    const response = await fetch("https://api.tovari-kron.ru/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testQuery();
