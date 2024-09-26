function createWidget() {
  const widget = document.createElement('div');
  widget.className = 'dropdown';
  widget.innerHTML = `
    <button class="dropdown-btn">
      <span>Saved Responses</span>
      <span class="arrow"></span>
    </button>
    <ul class="dropdown-content">
      <li style="--delay: 1;">first</li>
      <li style="--delay: 2;">second</li>
      <li style="--delay: 3;">third</li>
      <li style="--delay: 4;">fourth</li>
    </ul>
  `;

  // Function to insert widget before the target button
  function insertWidget() {
    const targetButton = document.querySelector('[data-testid="profile-button"]');
    if (targetButton) {
      // Insert the widget before the target button
      const parentElement = targetButton.parentNode;
      // Insert the widget as the first child of the parent element
      parentElement.insertBefore(widget, parentElement.firstChild);
      
      const dropdownBtn = widget.querySelector('.dropdown-btn');
      const dropdownContent = widget.querySelector('.dropdown-content');

      // Toggle dropdown visibility
      dropdownBtn.addEventListener('click', () => {
        const isVisible = dropdownContent.style.visibility === 'visible';
        dropdownContent.style.visibility = isVisible ? 'hidden' : 'visible';
      });

      console.log("Widget created and inserted before the dynamically loaded share-chat-button.");
      
      // Stop observing once the widget is inserted
      observer.disconnect();
    }
  }

  // Set up MutationObserver to detect changes in the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      insertWidget();
    });
  });

  // Start observing the body for changes in the child list (i.e., DOM mutations)
  observer.observe(document.body, { childList: true, subtree: true });

  console.log("MutationObserver initialized, waiting for the share-chat-button.");
}

// Initialize the widget when the page loads
window.onload = createWidget;
