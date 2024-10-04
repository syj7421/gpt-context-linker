function createReferenceSidebar() {
  const referenceSidebar = document.createElement('div');
  referenceSidebar.className = 'reference-sidebar';

  const button = document.createElement('button');
  button.className = 'reference-sidebar-btn';

  const append_btn = document.createElement('button');
  append_btn.textContent = '⇔';
  append_btn.className = 'append_btn';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '100');
  svg.setAttribute('viewBox', '0 0 48 48');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 16.5 5 C 12.928062 5 10 7.9280619 10 11.5 L 10 41.5 A 1.50015 1.50015 0 0 0 12.376953 42.716797 L 24 34.347656 L 35.623047 42.716797 A 1.50015 1.50015 0 0 0 38 41.5 L 38 11.5 C 38 7.9280619 35.071938 5 31.5 5 L 16.5 5 z M 16.5 8 L 31.5 8 C 33.450062 8 35 9.5499381 35 11.5 L 35 38.572266 L 24.876953 31.283203 A 1.50015 1.50015 0 0 0 23.123047 31.283203 L 13 38.572266 L 13 11.5 C 13 9.5499381 14.549938 8 16.5 8 z');
  
  svg.appendChild(path);
  button.appendChild(svg);

  const content = document.createElement('div');
  content.className = 'reference-sidebar-content';

  referenceSidebar.appendChild(button);
  referenceSidebar.appendChild(content);
  referenceSidebar.appendChild(append_btn);

  let isSidebarOpen = false;
  let isWide = false;

  button.addEventListener('click', () => {
    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
      referenceSidebar.classList.add('open');
    } else {
      referenceSidebar.classList.remove('open');
      isWide = false; // Reset to narrow mode
      append_btn.classList.remove('wide');
      referenceSidebar.classList.remove('wide'); // Close and reset expand state
    }
  });

  append_btn.addEventListener('click', () => {
    if (isSidebarOpen) {
      isWide = !isWide;
      if (isWide) {
        append_btn.classList.add('wide');
        referenceSidebar.classList.add('wide');
        button.style.transition = 'transform 0.3s ease-in-out';
        append_btn.style.transition = 'transform 0.3s ease-in-out';
      } else {
        append_btn.classList.remove('wide');
        referenceSidebar.classList.remove('wide');
        button.style.transition = 'transform 0.3s ease-in-out';
        append_btn.style.transition = 'transform 0.3s ease-in-out';
      }
    }
  });

  document.body.appendChild(referenceSidebar);
}