// Create the widget
function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.innerHTML = `
      <button class="close-btn">X</button>
      
    `;
  
    document.body.appendChild(widget);
  
    // Close button logic
    widget.querySelector('.close-btn').addEventListener('click', () => {
      widget.style.display = 'none';
    });
  
    // Make widget movable
    let isDragging = false;
    let offsetX, offsetY;
  
    widget.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - widget.offsetLeft;
      offsetY = e.clientY - widget.offsetTop;
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        widget.style.left = `${e.clientX - offsetX}px`;
        widget.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  // Initialize the widget
  window.onload = createWidget;
  