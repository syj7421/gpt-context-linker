function createWidget() {
  const widget = document.createElement('div');
  widget.className = 'dropdown';
  widget.innerHTML = `
  <button class="dropdown-btn">
    <span><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
      <path d="M 16.5 5 C 12.928062 5 10 7.9280619 10 11.5 L 10 41.5 A 1.50015 1.50015 0 0 0 12.376953 42.716797 L 24 34.347656 L 35.623047 42.716797 A 1.50015 1.50015 0 0 0 38 41.5 L 38 11.5 C 38 7.9280619 35.071938 5 31.5 5 L 16.5 5 z M 16.5 8 L 31.5 8 C 33.450062 8 35 9.5499381 35 11.5 L 35 38.572266 L 24.876953 31.283203 A 1.50015 1.50015 0 0 0 23.123047 31.283203 L 13 38.572266 L 13 11.5 C 13 9.5499381 14.549938 8 16.5 8 z"></path>
    </svg></span>
  </button>
  <div class="dropdown-content">
    <span style="--delay: 1;">first</span>
    <span style="--delay: 2;">second</span>
    <span style="--delay: 3;">third</span>
    <span style="--delay: 4;">fourth</span>
  </div>
  `;
  
  // Toggle the open class to show/hide the sidebar
  widget.querySelector('.dropdown-btn').addEventListener('click', () => {
    widget.classList.toggle('open');
  });

  document.body.appendChild(widget);
}

window.onload = createWidget;
