function summariseGptResponseToGenerateReference(event) {
    const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
    
    if (!gptResponse) {
        console.log("No GPT response found.");
        return;
    }

    // Extract the summary from the GPT response
    let summary = extractSummaryFromGPTResponse(gptResponse);
    
    // Convert the structured summary to YAML format using js-yaml
    let yamlSummary = jsyaml.dump(summary);
    
    // Log or return the YAML summary
    console.log(yamlSummary);
    return yamlSummary;
}

// Helper function to extract summary from the GPT response
function extractSummaryFromGPTResponse(element) {
    // Handle different types of content based on tag
    if (element.nodeType === Node.TEXT_NODE) {
        return {
            type: "text",
            content: element.nodeValue.trim()
        };
    }
    
    if (element.tagName === 'CODE' || element.tagName === 'PRE') {
        return {
            type: "code",
            content: element.textContent.replace(/\s+/g, ' ').trim()
        };
    }

    if (element.tagName === 'IMG') {
        return {
            type: "image",
            alt: element.alt ? element.alt : "[Image]"
        };
    }

    if (element.tagName === 'TABLE') {
        let rows = Array.from(element.querySelectorAll('tr')).map(row => {
            let cells = Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim());
            return cells.join(' | ');  // Concatenate cells with a pipe separator for readability
        });
        return {
            type: "table",
            content: rows.join('\n')  // Join rows with a newline
        };
    }

    // For other elements, just extract the text content and classify as "text"
    let textContent = element.textContent.replace(/\s+/g, ' ').trim();  // Clean up the text
    if (textContent) {
        return {
            type: "text",
            content: textContent
        };
    }

    // Recursively process other child nodes if they exist
    let result = [];
    if (element.childNodes.length > 0) {
        Array.from(element.childNodes).forEach(child => {
            let childSummary = extractSummaryFromGPTResponse(child);
            if (childSummary) {
                result.push(childSummary);
            }
        });
    }

    return result.length > 0 ? result : '';
}

