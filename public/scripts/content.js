/* 
  15th Sep 2024 
  Sooyoung Jung
  Eric Cheng
*/

/* TODO: 
2. same text already exist V <-- doesn't really work for long 
3. ref storage max 10, ref at the same time max 3? V
4. checkbox reset after submit V
5. also when the stream changes *** or reset checkbox when stream changes V
5a: what if the user manaully deletes the reference part? <-- maybe block all the deletion, but allow other modification
5b: what if the reference if deleted from the sidebar?
6. remove Chat GPT said prefix , lots of errors in const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
   especially, img, code, laTex(span tag), also did not include table, or any other value
   - definitely more effective way to store a gpt response, best to remove redundant parts, some eror with "same text already exist as well maybe relate to this?"
7. Local storage / Sync? 
8. UI/UX
9. double finger slide in mac
10. still being added after warning
11. cursor move after reference
12. checkboxes reset after adding new reference to reference sidebar
13. new responses has no button attached
14. clicking on delete reset checkboxes
15. reference still added after max 3 alert, possibly only on the visual side tho

*/

const STORAGE_KEY = 'gptReferences';
window.onload = () => {
  document.body.appendChild(customTooltip); 
  initEventHandlers();  // Initialize event handlers
  createReferenceSidebar(); // Create sidebar and load references
};

function loadStoredReferences(callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const storedReferences = result[STORAGE_KEY] || [];
    updateReferenceSidebar(storedReferences);  // Updates the UI with loaded references

    // Call the callback after loading the references
    if (callback) callback();
  });
}

// Create the reference sidebar and load references
function createReferenceSidebar() {
  const referenceSidebar = document.createElement('div');
  referenceSidebar.className = 'reference-sidebar';

  const button = document.createElement('button');
  button.className = 'reference-sidebar-btn';

  const createNewRefBtn = document.createElement('button');
  createNewRefBtn.className = 'create-new-reference-btn';
  createNewRefBtn.textContent = "New";

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '100');
  svg.setAttribute('viewBox', '0 0 48 48');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 16.5 5 C 12.928062 5 10 7.9280619 10 11.5 L 10 41.5 A 1.50015 1.50015 0 0 0 12.376953 42.716797 L 24 34.347656 L 35.623047 42.716797 A 1.50015 1.50015 0 0 0 38 41.5 L 38 11.5 C 38 7.9280619 35.071938 5 31.5 5 L 16.5 5 z M 16.5 8 L 31.5 8 C 33.450062 8 35 9.5499381 35 11.5 L 35 38.572266 L 24.876953 31.283203 A 1.50015 1.50015 0 0 0 23.123047 31.283203 L 13 38.572266 L 13 11.5 C 13 9.5499381 14.549938 8 16.5 8 z');
  
  const expandBtn = document.createElement('button');
  expandBtn.textContent = '⇔';
  expandBtn.className = 'expand-btn';

  svg.appendChild(path);
  button.appendChild(svg);

  const content = document.createElement('div');
  content.className = 'reference-sidebar-content';

  referenceSidebar.appendChild(button);
  referenceSidebar.appendChild(createNewRefBtn);
  referenceSidebar.appendChild(expandBtn);
  referenceSidebar.appendChild(content);


  button.addEventListener('click', () => {
    referenceSidebar.classList.toggle('open');
    referenceSidebar.classList.remove('wide'); // Reset expand state when closing
    expandBtn.classList.remove('wide');
  });

  expandBtn.addEventListener('click', () => {
    if (referenceSidebar.classList.contains('open')) {
      referenceSidebar.classList.toggle('wide');
      expandBtn.classList.toggle('wide');
    }
  });

  document.body.appendChild(referenceSidebar);

  // Then load stored references from Chrome storage
  loadStoredReferences(() => {
    // Now reset checkboxes once stored references are loaded
    resetCheckboxesOnLoad();
  });
}


// Function to reset all checkboxes upon page load
function resetCheckboxesOnLoad() {
  const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
  console.log("Resetting checkboxes, count:", refCheckboxes.length);
  refCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;  // Uncheck all checkboxes on page load
  });

  // Clear the 'checked' state from storage after resetting
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
          const storedReferences = result[STORAGE_KEY] || [];

          // Update the stored references by unchecking all items
          storedReferences.forEach(ref => ref.checked = false);

          // Save the updated state back to Chrome storage
          chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
              console.log('All references have been unchecked on page load.');
          });
      });
  } else {
      console.warn('Chrome storage API is not available. This code is likely running outside of a Chrome extension.');
  }
}

const customTooltip = document.createElement('div');
customTooltip.className = 'custom-tooltip';
customTooltip.style.display = 'none'; 
customTooltip.style.position = 'fixed';
customTooltip.style.backgroundColor = 'black';
customTooltip.style.color = 'white';
customTooltip.style.padding = '10px';
customTooltip.style.borderRadius = '5px';
customTooltip.style.maxWidth = '300px';
customTooltip.style.zIndex = '2000';
