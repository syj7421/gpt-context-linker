// Create the widget
function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.innerHTML = `
      <button class="close-btn">X</button>
      <div class="widget-content">this is a widget</div>
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
  
  // Add content to the widget
  function addToWidget(content) {
    const widgetContent = document.querySelector('.widget-content');
    const newItem = document.createElement('p');
    newItem.textContent = content;
    widgetContent.appendChild(newItem);
  }
  
  // Initialize the widget
  window.onload = createWidget;
  