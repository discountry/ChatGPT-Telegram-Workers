import { ENV } from "./env.js";
/**
 * Bing search functions START
 */
export async function bingWebSearch(query) {
  try {
    const response = await fetch(
      "https://api.bing.microsoft.com/v7.0/search?q=" +
        encodeURIComponent(query),
      {
        headers: {
          "Ocp-Apim-Subscription-Key": ENV.BING_SUBSCRIPTION_KEY,
        },
      }
    );

    const data = await response.json();

    for (let header in response.headers) {
      if (header.startsWith("bingapis-") || header.startsWith("x-msedge-")) {
        console.log(header + ": " + response.headers[header]);
      }
    }

    return data;
  } catch (error) {
    console.log("Error: " + error.message);
    throw error;
  }
}

export async function loadFormattedSearchResults(query) {
  try {
    const result = await bingWebSearch(query);
    let outputMsg = "";
    let llmExtraContext = "Search results:\n\n";
    if (result?.webPages?.value) {
      for (const [index, item] of Object.entries(result.webPages.value)) {
        if (index < 3) {
          outputMsg += `<a href="${item.url}">${item.name}</a>\n\n`;
          const content = await fetchWebContentFromUrl(item.url);
          llmExtraContext += `${item.name}\n${item.snippet}\n${content}\n\n`;
        }
      }
    }
    if (outputMsg === "") {
      outputMsg = "No results found";
    }
    return { outputMsg, llmExtraContext };
  } catch (error) {
    console.log("Error: " + error.message);
    throw error;
  }
}

async function fetchWebContentFromUrl(url) {
  try {
    const response = await fetch(url);
    return response.text();
  } catch (error) {
    console.log("Error: " + error.message);
    throw error;
  }
}
