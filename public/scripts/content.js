/* 
  15th Sep 2024 
  Sooyoung Jung
  Eric Cheng
*/

/* TODO: 
1. li click을 if else if로 처리? nav를 else if 로 둠
2. same text already exist V <-- doesn't really work for long 
3. ref storage max 10, ref at the same time max 3? V
4. checkbox reset after submit V
5. also when the stream changes *** or reset checkbox when stream changes V
5a: what if the user manaully deletes the reference part?
5b: what if the reference if deleted from the sidebar?
6. remove Chat GPT said prefix , lots of errors in const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
   especially, img, code, laTex(span tag), also did not include table, or any other value
   - definitely more effective way to store a gpt response, best to remove redundant parts, some eror with "same text already exist as well maybe relate to this?"
7. Local storage / Sync? 
8. UI/UX

*/

window.onload = () => {
  createReferenceSidebar(); 
};

// create reference sidebar that stores gpt responses that can be used as references
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
  
  svg.appendChild(path);
  button.appendChild(svg);

  const content = document.createElement('div');
  content.className = 'reference-sidebar-content';

  referenceSidebar.appendChild(button);
  referenceSidebar.appendChild(createNewRefBtn);
  referenceSidebar.appendChild(content);

  
  button.addEventListener('click', () => {
    referenceSidebar.classList.toggle('open');
  });

  document.body.appendChild(referenceSidebar);
}

