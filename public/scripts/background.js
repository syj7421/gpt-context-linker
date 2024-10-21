function summariseGptResponseToGenerateReference(event) {
    const gptResponseContainer = event.target.closest('article[data-testid^="conversation-turn-"]');
    if (!gptResponseContainer) {
        console.log("No GPT response container found.");
        return;
    }

    const gptResponse = gptResponseContainer.querySelector('[data-message-author-role="assistant"]');
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
    // Check if element is a BUTTON with the class 'add-to-reference-sidebar-button'

    if (element.tagName === 'BUTTON' && element.classList.contains('add-to-reference-sidebar-button')) {
        console.log("Skipping button with the class 'add-to-reference-sidebar-button'");
        return null;  // Skip the button and do not process its text content
    }

    // Handle text nodes
    else if (element.nodeType === Node.TEXT_NODE) {
        let trimmedText = element.nodeValue.replace(/\s+/g, ' ').trim();
        if (trimmedText) {
            console.log("Extracting text node:", trimmedText);  // Log text extraction
            return {
                type: "text",
                content: trimmedText
            };
        }
        return null;  // Return null if there's no meaningful text
    }

    // Handle code blocks
    else if (element.tagName === 'CODE' || element.tagName === 'PRE') {
        // console.log("Extracting code block");
        return {
            type: "code",
            content: element.textContent.replace(/\s+/g, ' ').trim()
        };
    }

    // Handle images
    else if (element.tagName === 'IMG') {
        // console.log("Extracting image");
        return {
            type: "image",
            alt: element.alt ? element.alt : "[Image]"
        };
    }

    // Handle tables
    else if (element.tagName === 'TABLE') {
        // console.log("Extracting table");
        let rows = Array.from(element.querySelectorAll('tr')).map(row => {
            let cells = Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim());
            return cells.join(' | ');  // Concatenate cells with a pipe separator for readability
        });
        return {
            type: "table",
            content: rows.join('\n')  // Join rows with a newline
        };
    }


    // Recursively process child nodes if they exist, skipping buttons with the specified class
    let result = [];
    if (element.childNodes.length > 0) {
        Array.from(element.childNodes).forEach(child => {
            // Skip recursion if the child is a button with the specific class
            if (child.tagName === 'BUTTON' && child.classList.contains('add-to-reference-sidebar-button')) {
                // console.log("Skipping child button with the class 'add-to-reference-sidebar-button'");
                return;  // Do not process this child or its descendants
            }

            let childSummary = extractSummaryFromGPTResponse(child);
            if (childSummary) {
                result.push(childSummary);
            }
        });
    }

    return result.length > 0 ? result : null;
}
