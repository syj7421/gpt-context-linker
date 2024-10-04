window.onload = () => {
  createReferenceSidebar(); // 创建悬浮窗侧边栏
  handleMessages();         // 绑定事件监听器

  // 加载已存储的引用内容，并在悬浮窗中显示
  chrome.storage.local.get(['gptReferences'], (result) => {
    const storedReferences = result.gptReferences || [];
    updateReferenceSidebar(storedReferences);  // 确保悬浮窗内容能够被正确加载
  });
};